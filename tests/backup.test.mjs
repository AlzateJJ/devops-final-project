import test from "node:test";
import assert from "node:assert/strict";
import {
  Database,
  STORAGE_KEY,
  EMPTY_KEY,
  validateDatabase,
} from "../app/js/store.js";
import { emptyDatabase } from "../app/js/catalogs.js";
import { resourceURL } from "../app/js/resources.js";

class MemoryStorage {
  constructor() {
    this.items = new Map();
  }
  getItem(key) {
    return this.items.get(key) ?? null;
  }
  setItem(key, value) {
    if (key === this.failSet) throw Error("quota");
    this.items.set(key, value);
  }
  removeItem(key) {
    if (key === this.failRemove) throw Error("blocked");
    this.items.delete(key);
  }
}
class MemoryMedia {
  constructor() {
    this.items = new Map();
  }
  async read(id) {
    return structuredClone(this.items.get(id));
  }
  async list() {
    return [...this.items.keys()];
  }
  async removeMany(ids) {
    if (this.failRemove) throw Error("blocked");
    for (const id of ids) this.items.delete(id);
  }
  async write(id, resources) {
    if (this.fail) throw Error("media quota");
    this.items.set(id, structuredClone(resources));
  }
  async remove(id) {
    this.items.delete(id);
  }
}
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=";
const imagePath = "assets/logos/example.png";
function portable() {
  const data = emptyDatabase();
  data.tools.push({
    id: "TO01",
    name: "Ejemplo",
    description: "Recurso para probar restauración",
    category: "CI",
    price: "FR",
    logo: imagePath,
  });
  data.resources = { [imagePath]: png };
  return data;
}
async function setup() {
  const storage = new MemoryStorage(),
    media = new MemoryMedia();
  storage.setItem(STORAGE_KEY, JSON.stringify(emptyDatabase()));
  const db = new Database(storage, media);
  await db.init();
  return { db, storage, media };
}
test("Flush elimina registros y recursos, conserva otras aplicaciones y persiste vacío sin consultar semilla", async () => {
  const { db, storage, media } = await setup();
  await db.restore(JSON.stringify(portable()));
  storage.setItem("otra-aplicacion", "conservar");
  await db.flush();
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.ok(storage.getItem(EMPTY_KEY));
  assert.equal(storage.getItem("otra-aplicacion"), "conservar");
  assert.equal(media.items.size, 0);
  assert.equal(resourceURL(imagePath), imagePath);
  const reopened = new Database(storage, media);
  await reopened.init("NO-CONSULTAR-SEMILLA");
  for (const collection of [
    "tools",
    "practices",
    "diagrams",
    "usages",
    "sources",
  ])
    assert.deepEqual(reopened.data[collection], []);
  validateDatabase(reopened.data);
  reopened.mutate((d) => d.tools.push(portable().tools[0]));
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).tools.length, 1);
});
test("Flush fallido no cambia datos ni recursos ni deja un marcador nuevo", async () => {
  for (const failure of ["failSet", "failRemove"]) {
    const { db, storage, media } = await setup();
    await db.restore(JSON.stringify(portable()));
    const before = storage.getItem(STORAGE_KEY);
    storage[failure] = failure === "failSet" ? EMPTY_KEY : STORAGE_KEY;
    await assert.rejects(() => db.flush(), /No se pudo vaciar/);
    assert.equal(storage.getItem(STORAGE_KEY), before);
    assert.equal(storage.getItem(EMPTY_KEY), null);
    assert.equal(db.data.tools.length, 1);
    assert.equal(media.items.size, 1);
  }
});
test("Una pestaña desactualizada no puede vaciar cambios ajenos, incluso con catálogo vacío", async () => {
  const { db, storage, media } = await setup();
  const other = new Database(storage, media);
  await other.init();
  await db.flush();
  await assert.rejects(() => other.flush(), /otra pestaña/);
  const emptyTab = new Database(storage, media);
  await emptyTab.init();
  await db.flush();
  await assert.rejects(() => emptyTab.flush(), /otra pestaña/);
  assert.throws(
    () => emptyTab.mutate((d) => d.tools.push(portable().tools[0])),
    /otra pestaña/,
  );
});
test("Restaurar conserva archivos en IndexedDB y carga URLs locales después de reiniciar", async () => {
  const { db, storage, media } = await setup();
  await db.restore(JSON.stringify(portable()));
  assert.equal(db.data.resources, undefined);
  assert.ok(db.data.meta.resourceBundle);
  assert.ok(!storage.getItem(STORAGE_KEY).includes(png));
  const reopened = new Database(storage, media);
  await reopened.init();
  assert.equal(reopened.resources[imagePath], png);
  assert.match(resourceURL(imagePath), /^blob:/);
  reopened.mutate((d) => {
    d.tools = [];
  });
  const edited = new Database(storage, media);
  await edited.init();
  assert.deepEqual(edited.data.tools, []);
});
test("Errores al guardar archivos o registros conservan la base y el paquete anterior", async () => {
  for (const failure of ["media", "records"]) {
    const { db, storage, media } = await setup();
    await db.restore(JSON.stringify(portable()));
    const before = storage.getItem(STORAGE_KEY),
      bundle = db.data.meta.resourceBundle;
    if (failure === "media") media.fail = true;
    else storage.failSet = STORAGE_KEY;
    const changed = portable();
    changed.tools[0].name = "No guardar";
    await assert.rejects(() => db.restore(JSON.stringify(changed)));
    assert.equal(storage.getItem(STORAGE_KEY), before);
    assert.equal(db.data.tools[0].name, "Ejemplo");
    assert.equal(media.items.size, 1);
    assert.ok(media.items.has(bundle));
    assert.equal(db.busy, false);
  }
});
test("Un cambio en otra pestaña durante la importación conserva el cambio y elimina recursos temporales", async () => {
  const { db, storage, media } = await setup();
  const originalWrite = media.write.bind(media);
  media.write = async (id, resources) => {
    await originalWrite(id, resources);
    const other = emptyDatabase();
    other.meta.name = "Cambio externo";
    storage.setItem(STORAGE_KEY, JSON.stringify(other));
  };
  await assert.rejects(
    () => db.restore(JSON.stringify(portable())),
    /otra pestaña/,
  );
  assert.equal(
    JSON.parse(storage.getItem(STORAGE_KEY)).meta.name,
    "Cambio externo",
  );
  assert.equal(media.items.size, 0);
});
test("Respaldos incompletos, archivos ajenos y formatos falsos se rechazan antes de modificar datos", async () => {
  const { db, storage, media } = await setup();
  const before = storage.getItem(STORAGE_KEY);
  for (const resources of [
    {},
    { [imagePath]: png, "../other.png": png },
    { [imagePath]: "data:image/png;base64,YmFk" },
    { [imagePath]: "data:image/svg+xml;base64,YmFk" },
  ]) {
    const broken = portable();
    broken.resources = resources;
    await assert.rejects(() => db.restore(JSON.stringify(broken)));
    assert.equal(storage.getItem(STORAGE_KEY), before);
    assert.equal(media.items.size, 0);
  }
});
test("Los recursos perdidos muestran recuperación sin reemplazar los registros originales", async () => {
  const { db, storage, media } = await setup();
  await db.restore(JSON.stringify(portable()));
  const before = storage.getItem(STORAGE_KEY);
  media.items.clear();
  const reopened = new Database(storage, media);
  await assert.rejects(() => reopened.init(), /No se encontraron los archivos/);
  assert.equal(reopened.data, null);
  assert.equal(storage.getItem(STORAGE_KEY), before);
});
test("Un respaldo anterior sigue funcionando y reemplaza los recursos importados", async () => {
  const { db, media } = await setup();
  await db.restore(JSON.stringify(portable()));
  await db.restore(JSON.stringify(emptyDatabase()));
  assert.equal(media.items.size, 0);
  assert.equal(db.data.meta.resourceBundle, undefined);
  assert.deepEqual(db.resources, {});
});
test("Flush también limpia recursos huérfanos cuando los registros están corruptos", async () => {
  const { db, storage, media } = await setup();
  await db.restore(JSON.stringify(portable()));
  storage.setItem(STORAGE_KEY, "{corrupto");
  const reopened = new Database(storage, media);
  await assert.rejects(() => reopened.init());
  await reopened.flush();
  assert.equal(media.items.size, 0);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});
test("Un fallo al eliminar archivos se informa y permite completar el vaciado al reintentar", async () => {
  const { db, media } = await setup();
  await db.restore(JSON.stringify(portable()));
  media.failRemove = true;
  await db.flush();
  assert.match(db.cleanupWarning, /Vuelve a intentar/);
  assert.equal(db.data.tools.length, 0);
  assert.equal(media.items.size, 1);
  media.failRemove = false;
  await db.flush();
  assert.equal(media.items.size, 0);
  assert.equal(db.cleanupWarning, "");
});
