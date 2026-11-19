import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Database,
  STORAGE_KEY,
  EMPTY_KEY,
  validateDatabase,
  parseDatabase,
  validImage,
} from "../app/js/store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seed = JSON.parse(
  fs.readFileSync(path.join(root, "app/data/database.json"), "utf8"),
);
const inventory = JSON.parse(
  fs.readFileSync(path.join(root, "inventario/inventario.json"), "utf8"),
);
const clone = () => structuredClone(seed);
class MemoryStorage {
  constructor(raw = null) {
    this.items = new Map();
    this.raw = raw;
    this.fail = false;
  }
  get raw() {
    return this.getItem(STORAGE_KEY);
  }
  set raw(value) {
    if (value === null) this.items.delete(STORAGE_KEY);
    else this.items.set(STORAGE_KEY, value);
  }
  getItem(key) {
    return this.items.get(key) ?? null;
  }
  setItem(key, value) {
    if (this.fail) throw new Error("QuotaExceeded");
    this.items.set(key, value);
  }
  removeItem(key) {
    if (this.failRemove === key) throw Error("blocked");
    this.items.delete(key);
  }
}
async function setup() {
  const memory = new MemoryStorage(JSON.stringify(seed)),
    db = new Database(memory);
  await db.init();
  return { memory, db };
}

test("La semilla satisface el contrato y conserva todos los IDs requeridos", () => {
  validateDatabase(seed);
  assert.equal(seed.tools.length, 144);
  assert.equal(seed.practices.length, 14);
  assert.equal(seed.diagrams.length, 19);
  assert.equal(seed.usages.length, 42);
  assert.deepEqual(
    seed.tools.map((t) => t.id).sort(),
    inventory.herramientas
      .filter((t) => ["base_tabla", "adicional_requerida"].includes(t.alcance))
      .map((t) => t.id)
      .sort(),
  );
  assert.equal(new Set(seed.tools.map((t) => t.description)).size, 144);
  assert.equal(seed.tools.filter((t) => t.price === "NS").length, 0);
  assert.equal(
    seed.tools.filter((t) => t.priceVerification?.checked === "2026-11-18")
      .length,
    24,
  );
});
test("Cada práctica tiene uso, diagrama y referencias de fuente válidas", () => {
  for (const p of seed.practices) {
    assert.ok(seed.usages.some((u) => u.practiceId === p.id));
    assert.ok(
      seed.diagrams.some((d) => d.id === p.diagramId && d.practiceId === p.id),
    );
    assert.ok(p.references.length);
  }
  assert.equal(
    seed.diagrams.reduce((n, d) => n + d.references.length, 0),
    21,
  );
});
test("Los archivos de todas las imágenes y fuentes existen en la entrega", () => {
  for (const file of [
    ...seed.tools.map((t) => t.logo),
    ...seed.diagrams.map((d) => d.image),
    ...seed.sources.map((s) => s.file),
  ])
    assert.ok(fs.existsSync(path.resolve(root, "app", file)), file);
});
test("La edición conserva el ID y no rompe los usos existentes", async () => {
  const { db, memory } = await setup();
  const id = db.data.tools[0].id;
  db.mutate((d) => (d.tools[0].name = "GitHub actualizado"));
  assert.equal(db.data.tools[0].id, id);
  assert.equal(JSON.parse(memory.raw).tools[0].name, "GitHub actualizado");
  assert.ok(db.data.usages.some((u) => u.toolId === id));
});
test("La lectura no reinicializa una base que ya existe", async () => {
  const { db, memory } = await setup();
  db.mutate((d) => (d.tools[0].name = "Nombre persistido"));
  const next = new Database(memory);
  await next.init("/ruta-que-no-debe-consultarse");
  assert.equal(next.data.tools[0].name, "Nombre persistido");
});
test("La escritura fallida conserva tanto el estado en memoria como la base guardada", async () => {
  const { db, memory } = await setup();
  const original = memory.raw;
  memory.fail = true;
  assert.throws(
    () => db.mutate((d) => (d.tools[0].name = "No debe guardarse")),
    /No se pudo guardar/,
  );
  assert.equal(memory.raw, original);
  assert.equal(db.data.tools[0].name, "GitHub");
});
test("Los cambios externos impiden sobrescritura desde una pestaña desactualizada", async () => {
  const { db, memory } = await setup();
  const other = clone();
  other.tools[0].name = "Cambio externo";
  memory.raw = JSON.stringify(other);
  assert.throws(
    () => db.mutate((d) => (d.tools[0].name = "Cambio viejo")),
    /otra pestaña/,
  );
  assert.equal(JSON.parse(memory.raw).tools[0].name, "Cambio externo");
});
test("Una base corrupta se preserva durante la inicialización", async () => {
  const memory = new MemoryStorage("{corrupto"),
    db = new Database(memory);
  await assert.rejects(() => db.init(), /Se conservaron sin cambios/);
  assert.equal(memory.raw, "{corrupto");
  assert.equal(db.data, null);
});
test("La recuperación permite restaurar explícitamente después de detectar corrupción", async () => {
  const memory = new MemoryStorage("{corrupto"),
    db = new Database(memory);
  await assert.rejects(() => db.init());
  await db.restore(JSON.stringify(seed));
  assert.equal(db.data.tools.length, 144);
});
test("No se ignora el bloqueo de lectura del navegador", async () => {
  const db = new Database({
    getItem() {
      throw Error("blocked");
    },
  });
  await assert.rejects(() => db.init(), /bloqueó la lectura/);
});
test("Exportar y restaurar conserva la estructura completa", async () => {
  const { db } = await setup();
  const raw = db.export();
  db.mutate((d) => (d.tools[0].name = "Cambio temporal"));
  await db.restore(raw);
  assert.deepEqual(db.data, seed);
});
test("Un respaldo inválido no altera el estado", async () => {
  const { db, memory } = await setup();
  const before = memory.raw;
  await assert.rejects(() => db.restore("{mal json"), /JSON válido/);
  assert.equal(memory.raw, before);
});
test("Se rechazan nombres duplicados ignorando mayúsculas y acentos", () => {
  const d = clone();
  d.tools[1].name = "  GÍTHUB ";
  assert.throws(() => validateDatabase(d), /duplicado/);
});
test("Se rechazan IDs duplicados aunque el nombre sea distinto", () => {
  const d = clone();
  d.tools[1].id = d.tools[0].id;
  assert.throws(() => validateDatabase(d), /duplicado/);
});
test("Se rechazan descripciones y nombres vacíos", () => {
  for (const field of ["name", "description"]) {
    const d = clone();
    d.tools[0][field] = "  ";
    assert.throws(() => validateDatabase(d), /texto/);
  }
});
test("Se rechazan categorías y modelos de precio fuera del catálogo", () => {
  for (const field of ["category", "price"]) {
    const d = clone();
    d.tools[0][field] = "INVALID";
    assert.throws(() => validateDatabase(d), /inválidos/);
  }
});
test("Se rechazan relaciones con entidades inexistentes", () => {
  for (const field of ["toolId", "practiceId"]) {
    const d = clone();
    d.usages[0][field] = "UNKNOWN";
    assert.throws(() => validateDatabase(d), /existentes/);
  }
});
test("Se rechazan pares de uso duplicados", () => {
  const d = clone();
  d.usages.push({ ...d.usages[0], id: "U-duplicate" });
  assert.throws(() => validateDatabase(d), /duplicado/);
});
test("La práctica y su diagrama deben mantener la misma imagen", () => {
  const d = clone();
  d.practices[0].image = d.practices[1].image;
  assert.throws(() => validateDatabase(d), /sincronizados/);
});
test("Los diagramas no pueden enlazar prácticas inexistentes", () => {
  const d = clone();
  d.diagrams[0].practiceId = "PR-unknown";
  assert.throws(() => validateDatabase(d), /inexistente/);
});
test("No se admiten versiones o colecciones incompatibles", () => {
  const a = clone();
  a.version = 2;
  assert.throws(() => validateDatabase(a), /Versión/);
  const b = clone();
  b.tools = {};
  assert.throws(() => validateDatabase(b), /colección/);
});
test("Los recursos no permiten URLs ejecutables, externas ni rutas fuera de assets", () => {
  for (const value of [
    "javascript:alert(1)",
    "https://x.example/image.png",
    "../private.png",
    "assets/logos/../../private.png",
    "data:image/svg+xml;base64,abc",
  ])
    assert.equal(validImage(value), false);
});
test("Las fuentes solo permiten PDFs del inventario y páginas válidas", () => {
  const a = clone();
  a.sources[0].file = "javascript:alert(1)";
  assert.throws(() => validateDatabase(a), /Ruta/);
  const b = clone();
  b.tools[0].references[0].page = -1;
  assert.throws(() => validateDatabase(b), /Referencia/);
});
test("El backlog tiene 42 tarjetas, dependencias válidas y cobertura exacta", () => {
  const b = JSON.parse(
    fs.readFileSync(
      path.join(root, "planificacion/trello-backlog.json"),
      "utf8",
    ),
  );
  assert.equal(b.tarjetas.length, 42);
  assert.equal(new Set(b.tarjetas.map((c) => c.id)).size, 42);
  for (const c of b.tarjetas) {
    assert.equal(c.lista_destino, "Testing");
    assert.equal(c.trello.idList, b.lista_id);
    assert.equal(c.responsable_principal, "Juan José Alzate");
    assert.ok(c.criterios_aceptacion.length >= 3);
    for (const dep of c.dependencias)
      assert.ok(b.tarjetas.some((x) => x.id === dep && x.orden < c.orden));
  }
  const covered = b.tarjetas.flatMap((c) => c.herramientas);
  assert.equal(covered.length, 144);
  assert.equal(new Set(covered).size, 144);
});
