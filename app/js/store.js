import { emptyDatabase } from "./catalogs.js";
import { STORAGE_SCOPE } from "./storage-scope.js";
import { embeddedSeed, completeEmbeddedResources } from "./embedded.js";
import {
  ResourceStorage,
  validateResources,
  prepareResourceURLs,
  activateResourceURLs,
  releaseResourceURLs,
} from "./resources.js";
export const STORAGE_KEY = `devops-atlas:v1${STORAGE_SCOPE}`;
export const EMPTY_KEY = `devops-atlas:empty${STORAGE_SCOPE}`;
const CATEGORY_IDS = [
  "SCM",
  "DB",
  "CI",
  "TEST",
  "CONFIG",
  "DEPLOY",
  "CONT",
  "RELEASE",
  "CLOUD",
  "AIOPS",
  "ANALYTICS",
  "MONITOR",
  "SEC",
  "COLLAB",
];
const PRICE_IDS = ["OS", "FR", "FM", "PA", "EN", "NS"];
export class DataError extends Error {}
const fail = (message) => {
  throw new DataError(message);
};
const object = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(`${label}: se esperaba un objeto.`);
};
const text = (value, label, max = 12000) => {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    fail(`${label}: debe contener texto (máximo ${max} caracteres).`);
};
const id = (value, label) => {
  if (typeof value !== "string" || !/^[A-Za-z][A-Za-z0-9_-]{1,80}$/.test(value))
    fail(`${label}: identificador inválido.`);
};
const normal = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
function unique(rows, key, label) {
  const values = new Set();
  for (const row of rows) {
    const value = key(row);
    if (values.has(value)) fail(`${label}: valor duplicado (${value}).`);
    values.add(value);
  }
}
export function validImage(value) {
  return (
    typeof value === "string" &&
    value.length < 1500000 &&
    (/^(assets\/(logos|diagramas)\/)[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg|ico)$/.test(
      value,
    ) ||
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))
  );
}
export function validateDatabase(db) {
  object(db, "Base de datos");
  if (db.version !== 1)
    fail("Versión de base de datos no compatible. Se requiere la versión 1.");
  for (const key of [
    "categories",
    "prices",
    "tools",
    "practices",
    "diagrams",
    "usages",
    "sources",
  ]) {
    if (!Array.isArray(db[key]) || db[key].length > 10000)
      fail(`La colección ${key} es inválida.`);
    for (const r of db[key]) {
      object(r, key);
      id(r.id, key);
    }
    unique(db[key], (r) => r.id, key);
  }
  object(db.meta, "Metadatos");
  if (
    db.meta.resourceBundle !== undefined &&
    !/^[a-f0-9-]{36}$/.test(db.meta.resourceBundle)
  )
    fail("Identificador de recursos inválido.");
  for (const [key, expected] of [
    ["categories", CATEGORY_IDS],
    ["prices", PRICE_IDS],
  ]) {
    if (
      db[key].length !== expected.length ||
      expected.some((id) => !db[key].some((r) => r.id === id))
    )
      fail(`El catálogo ${key} no coincide con el contrato del curso.`);
    for (const r of db[key]) text(r.name, `${key}: nombre`, 160);
  }
  const toolIds = new Set(db.tools.map((t) => t.id)),
    practiceIds = new Set(db.practices.map((p) => p.id)),
    diagramIds = new Set(db.diagrams.map((d) => d.id)),
    sourceIds = new Set(db.sources.map((s) => s.id));
  for (const s of db.sources) {
    text(s.name, "Nombre de fuente", 200);
    if (
      !/^\.\.\/inventario\/fuentes\/(P[0-9]{2}[IF]?|supletorio)\.pdf$/.test(
        s.file,
      )
    )
      fail("Ruta de fuente no permitida.");
    if (s.pageMap !== undefined) {
      object(s.pageMap, "Mapa de páginas del extracto");
      const entries = Object.entries(s.pageMap);
      if (
        !entries.length ||
        entries.length > 10000 ||
        entries.some(
          ([original, page]) =>
            !/^[1-9][0-9]{0,4}$/.test(original) ||
            Number(original) > 10000 ||
            !Number.isInteger(page) ||
            page < 1 ||
            page > entries.length,
        ) ||
        new Set(entries.map(([, page]) => page)).size !== entries.length
      )
        fail("Mapa de páginas del extracto inválido.");
    }
  }
  function refs(value) {
    if (value === undefined) return;
    if (!Array.isArray(value)) fail("Referencias inválidas.");
    for (const r of value) {
      object(r, "Referencia");
      if (
        !sourceIds.has(r.source) ||
        !Number.isInteger(r.page) ||
        r.page < 1 ||
        r.page > 10000
      )
        fail("Referencia de fuente o página inválida.");
      const source = db.sources.find((s) => s.id === r.source);
      if (source.pageMap && !Object.hasOwn(source.pageMap, r.page))
        fail("La página citada no está incluida en el extracto PDF.");
    }
  }
  for (const t of db.tools) {
    text(t.name, "Nombre de herramienta", 140);
    text(t.description, "Descripción de herramienta");
    if (!CATEGORY_IDS.includes(t.category) || !PRICE_IDS.includes(t.price))
      fail("Categoría o modelo de precio inválidos.");
    if (!validImage(t.logo)) fail("El logo debe ser una imagen local válida.");
    if (
      t.aliases !== undefined &&
      (!Array.isArray(t.aliases) ||
        t.aliases.some((a) => typeof a !== "string" || a.length > 200))
    )
      fail("Alias inválidos.");
    if (
      t.notes !== undefined &&
      (!Array.isArray(t.notes) ||
        t.notes.some((a) => typeof a !== "string" || a.length > 3000))
    )
      fail("Notas inválidas.");
    refs(t.references);
  }
  for (const p of db.practices) {
    text(p.name, "Nombre de práctica", 180);
    text(p.description, "Descripción de práctica");
    if (!validImage(p.image))
      fail("La práctica requiere una imagen Essence válida.");
    if (p.diagramId && !diagramIds.has(p.diagramId))
      fail("La práctica enlaza un diagrama inexistente.");
    refs(p.references);
  }
  for (const d of db.diagrams) {
    text(d.name, "Nombre de diagrama", 200);
    if (!["practica", "proceso", "nucleo", "notacion"].includes(d.type))
      fail("Tipo de diagrama inválido.");
    if (!validImage(d.image)) fail("Imagen de diagrama inválida.");
    if (d.practiceId && !practiceIds.has(d.practiceId))
      fail("El diagrama enlaza una práctica inexistente.");
    refs(d.references);
  }
  for (const p of db.practices) {
    if (p.diagramId) {
      const d = db.diagrams.find((d) => d.id === p.diagramId);
      if (d.practiceId !== p.id || d.image !== p.image)
        fail("La práctica y su diagrama deben estar sincronizados.");
    }
  }
  for (const d of db.diagrams) {
    if (
      d.practiceId &&
      db.practices.find((p) => p.id === d.practiceId).diagramId !== d.id
    )
      fail("El diagrama no corresponde a la práctica indicada.");
  }
  for (const u of db.usages) {
    if (!toolIds.has(u.toolId) || !practiceIds.has(u.practiceId))
      fail("El uso debe enlazar una herramienta y una práctica existentes.");
    text(u.description, "Descripción del uso");
  }
  unique(db.tools, (r) => normal(r.name), "Nombre de herramienta");
  unique(db.practices, (r) => normal(r.name), "Nombre de práctica");
  unique(
    db.usages,
    (r) => `${r.toolId}/${r.practiceId}`,
    "Relación herramienta-práctica",
  );
  if (db.resources !== undefined) validateResources(db.resources, db);
  return db;
}
export function parseDatabase(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("El archivo no contiene JSON válido.");
  }
  return validateDatabase(parsed);
}
export class Database {
  constructor(
    storage = globalThis.localStorage,
    media = new ResourceStorage(),
  ) {
    this.storage = storage;
    this.media = media;
    this.data = null;
    this.snapshot = null;
    this.emptySnapshot = null;
    this.resources = {};
    this.busy = false;
    this.cleanupWarning = "";
  }
  async init(seedURL = "data/database.json") {
    try {
      this.snapshot = this.storage.getItem(STORAGE_KEY);
      this.emptySnapshot = this.storage.getItem(EMPTY_KEY);
    } catch {
      fail(
        "El navegador bloqueó la lectura del almacenamiento. Permite almacenamiento para este origen.",
      );
    }
    if (this.snapshot !== null) {
      try {
        const parsed = parseDatabase(this.snapshot);
        const resources = parsed.meta.resourceBundle
          ? await this.media.read(parsed.meta.resourceBundle)
          : completeEmbeddedResources(parsed).resources || {};
        if (parsed.meta.resourceBundle && !resources)
          fail(
            "No se encontraron los archivos guardados. Restaura un respaldo completo.",
          );
        // Las ediciones pueden dejar recursos sin usar: se conservan hasta el próximo respaldo o vaciado.
        if (parsed.meta.resourceBundle) {
          const used = Object.fromEntries(
            Object.entries(resources).filter(
              ([path]) =>
                parsed.tools.some((t) => t.logo === path) ||
                parsed.practices.some((p) => p.image === path) ||
                parsed.diagrams.some((d) => d.image === path) ||
                parsed.sources.some((s) => s.file === path),
            ),
          );
          validateResources(used, parsed);
        }
        activateResourceURLs(prepareResourceURLs(resources));
        this.resources = resources;
        this.data = parsed;
      } catch (e) {
        fail(
          `Los datos guardados no son válidos. Se conservaron sin cambios. ${e.message}`,
        );
      }
      return this.data;
    }
    if (this.emptySnapshot !== null) {
      this.data = emptyDatabase();
      activateResourceURLs(new Map());
      return this.data;
    }
    const embedded = embeddedSeed();
    if (embedded) return this.restore(JSON.stringify(embedded));
    const response = await fetch(seedURL);
    if (!response.ok)
      fail(
        "No se pudo cargar la base inicial. Extrae todo el ZIP y abre su index.html principal. Para trabajar con el código fuente, usa el servidor indicado en la guía.",
      );
    const seed = parseDatabase(await response.text());
    this.save(seed);
    return this.data;
  }
  save(next) {
    validateDatabase(next);
    let serialized;
    try {
      serialized = JSON.stringify(next);
    } catch {
      fail("No se pudo preparar la base de datos.");
    }
    try {
      this.assertCurrent();
      this.storage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      if (e instanceof DataError) throw e;
      fail(
        "No se pudo guardar: almacenamiento bloqueado o sin espacio. Los datos anteriores se conservaron. Exporta un respaldo o reduce el tamaño de las imágenes.",
      );
    }
    this.snapshot = serialized;
    this.data = JSON.parse(serialized);
    return this.data;
  }
  mutate(change) {
    if (this.busy)
      fail("Espera a que termine la operación de gestión de datos.");
    if (!this.data) fail("La base todavía no está disponible.");
    const next = structuredClone(this.data);
    change(next);
    next.meta.updatedAt = new Date().toISOString();
    return this.save(next);
  }
  export() {
    if (!this.data) fail("No hay una base válida para exportar.");
    return JSON.stringify(this.data, null, 2);
  }
  assertCurrent() {
    if (
      this.storage.getItem(STORAGE_KEY) !== this.snapshot ||
      this.storage.getItem(EMPTY_KEY) !== this.emptySnapshot
    )
      fail(
        "Los datos cambiaron en otra pestaña. Recarga la página antes de guardar para evitar sobrescribir cambios.",
      );
  }
  async removePreviousBundle(bundle) {
    this.cleanupWarning = "";
    if (!bundle) return;
    try {
      await this.media.remove(bundle);
    } catch {
      this.cleanupWarning =
        "Los registros se actualizaron, pero el navegador no permitió eliminar los archivos anteriores de su almacenamiento.";
    }
  }
  async restore(raw) {
    if (this.busy)
      fail("Espera a que termine la operación de gestión de datos.");
    const next = completeEmbeddedResources(parseDatabase(raw));
    this.assertCurrent();
    const resources = next.resources || {};
    if (next.meta.resourceBundle && !next.resources)
      fail(
        "Este archivo depende de recursos internos. Usa un respaldo descargado desde Gestión de datos.",
      );
    delete next.resources;
    delete next.meta.resourceBundle;
    const previous = this.data?.meta.resourceBundle;
    const bundle = Object.keys(resources).length ? crypto.randomUUID() : null;
    const urls = prepareResourceURLs(resources);
    this.busy = true;
    try {
      if (bundle) {
        await this.media.write(bundle, resources);
        next.meta.resourceBundle = bundle;
      }
      this.save(next);
    } catch (error) {
      releaseResourceURLs(urls);
      if (bundle) await this.media.remove(bundle).catch(() => {});
      throw error;
    } finally {
      this.busy = false;
    }
    this.resources = resources;
    activateResourceURLs(urls);
    await this.removePreviousBundle(previous);
    return this.data;
  }
  async flush() {
    if (this.busy)
      fail("Espera a que termine la operación de gestión de datos.");
    this.assertCurrent();
    this.busy = true;
    try {
      // Capturar los paquetes existentes también permite limpiar recursos huérfanos
      // tras corrupción o un cierre inesperado. No se tocan importaciones posteriores.
      const bundles = await this.media.list();
      this.assertCurrent();
      const marker = crypto.randomUUID();
      try {
        this.storage.setItem(EMPTY_KEY, marker);
        this.storage.removeItem(STORAGE_KEY);
      } catch {
        // Si no se pudo quitar la base, deshacer el marcador conserva el estado anterior.
        if (this.storage.getItem(EMPTY_KEY) === marker) {
          if (this.emptySnapshot === null) this.storage.removeItem(EMPTY_KEY);
          else this.storage.setItem(EMPTY_KEY, this.emptySnapshot);
        }
        fail(
          "No se pudo vaciar la información. Los registros anteriores se conservaron.",
        );
      }
      this.emptySnapshot = marker;
      this.snapshot = null;
      this.data = emptyDatabase();
      this.resources = {};
      activateResourceURLs(new Map());
      this.cleanupWarning = "";
      try {
        await this.media.removeMany(bundles);
      } catch {
        this.cleanupWarning =
          "El catálogo quedó vacío, pero no se pudieron eliminar sus archivos guardados. Vuelve a intentar Vaciar información para completar el borrado.";
      }
      return this.data;
    } finally {
      this.busy = false;
    }
  }
}
export const newId = (prefix) => `${prefix}-${crypto.randomUUID()}`;
