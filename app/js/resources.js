import { STORAGE_SCOPE } from "./storage-scope.js";
export const RESOURCE_DB_NAME = `entrega-final-devops-resources${STORAGE_SCOPE}`;
export const MAX_BACKUP_BYTES = 100 * 1024 * 1024;
const IMAGE_PATH =
  /^assets\/(logos|diagramas)\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg|ico)$/;
const PDF_PATH =
  /^\.\.\/inventario\/fuentes\/(P[0-9]{2}[IF]?|supletorio)\.pdf$/;
const DATA =
  /^data:(image\/(?:png|jpeg|webp)|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/;
export function resourcePaths(db) {
  return [
    ...new Set(
      [
        ...db.tools.map((t) => t.logo),
        ...db.practices.map((p) => p.image),
        ...db.diagrams.map((d) => d.image),
        ...db.sources.map((s) => s.file),
      ].filter((src) => !src.startsWith("data:")),
    ),
  ];
}
export function validateResources(resources, db) {
  if (!resources || typeof resources !== "object" || Array.isArray(resources))
    throw Error("El respaldo no contiene un mapa de recursos válido.");
  const paths = resourcePaths(db),
    entries = Object.entries(resources);
  if (
    entries.length !== paths.length ||
    paths.some((p) => !Object.hasOwn(resources, p))
  )
    throw Error(
      "El respaldo está incompleto: faltan recursos o contiene archivos ajenos a los registros.",
    );
  let total = 0;
  for (const [path, data] of entries) {
    const match = typeof data === "string" && data.match(DATA);
    if (
      !match ||
      data.length > 35 * 1024 * 1024 ||
      (total += data.length) > MAX_BACKUP_BYTES
    )
      throw Error("Un recurso tiene un formato o tamaño no admitido.");
    if (
      !(IMAGE_PATH.test(path) && match[1].startsWith("image/")) &&
      !(PDF_PATH.test(path) && match[1] === "application/pdf")
    )
      throw Error(
        "El respaldo contiene una ruta o un tipo de archivo no permitido.",
      );
    const bytes = atob(match[2]);
    const valid =
      match[1] === "application/pdf"
        ? bytes.startsWith("%PDF-")
        : match[1] === "image/png"
          ? bytes.startsWith("\x89PNG\r\n\x1a\n")
          : match[1] === "image/jpeg"
            ? bytes.startsWith("\xff\xd8\xff")
            : bytes.startsWith("RIFF") && bytes.slice(8, 12) === "WEBP";
    if (!valid)
      throw Error("El contenido de un recurso no coincide con su formato.");
  }
  return resources;
}
export function resourceBlob(data) {
  const match = data.match(DATA);
  if (!match) throw Error("Recurso no válido.");
  const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: match[1] });
}
let active = new Map();
export function prepareResourceURLs(resources) {
  const urls = new Map();
  try {
    for (const [path, data] of Object.entries(resources))
      urls.set(path, URL.createObjectURL(resourceBlob(data)));
    return urls;
  } catch (error) {
    releaseResourceURLs(urls);
    throw error;
  }
}
export function releaseResourceURLs(urls) {
  for (const url of urls.values()) URL.revokeObjectURL(url);
}
export function activateResourceURLs(urls) {
  releaseResourceURLs(active);
  active = urls;
}
export const resourceURL = (path) => active.get(path) || path;

// Los archivos grandes se guardan en IndexedDB; localStorage conserva los registros.
export class ResourceStorage {
  async run(mode, action) {
    if (!globalThis.indexedDB)
      throw Error(
        "El navegador no permite almacenar los recursos del respaldo.",
      );
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(RESOURCE_DB_NAME, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("bundles");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(Error("No se pudo abrir el almacenamiento de recursos."));
      request.onblocked = () =>
        reject(
          Error("Cierra otras pestañas de la aplicación antes de continuar."),
        );
    });
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction("bundles", mode);
        const request = action(tx.objectStore("bundles"));
        tx.oncomplete = () => resolve(request.result);
        tx.onerror = tx.onabort = () =>
          reject(
            Error(
              "No se pudieron guardar o recuperar los recursos. Revisa el espacio y los permisos del navegador.",
            ),
          );
      });
    } finally {
      db.close();
    }
  }
  read(id) {
    return this.run("readonly", (store) => store.get(id));
  }
  list() {
    return this.run("readonly", (store) => store.getAllKeys());
  }
  write(id, resources) {
    return this.run("readwrite", (store) => store.put(resources, id));
  }
  remove(id) {
    return this.run("readwrite", (store) => store.delete(id));
  }
  removeMany(ids) {
    if (!ids.length) return Promise.resolve();
    return this.run("readwrite", (store) => {
      let request;
      for (const id of ids) request = store.delete(id);
      return request;
    });
  }
}
