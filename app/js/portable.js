import { validateDatabase } from "./store.js";
import {
  MAX_BACKUP_BYTES,
  resourcePaths,
  validateResources,
} from "./resources.js";

const dataURL = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(Error("No se pudo incorporar un archivo al respaldo."));
    reader.readAsDataURL(blob);
  });
export async function checkImages(db, resources = {}) {
  const images = [
    ...new Set([
      ...db.tools.map((t) => t.logo),
      ...db.practices.map((p) => p.image),
      ...db.diagrams.map((d) => d.image),
    ]),
  ];
  for (const path of images) {
    const image = new Image();
    image.src = resources[path] || path;
    try {
      await image.decode();
    } catch {
      throw Error(
        "El respaldo contiene una imagen dañada o un recurso local que no está disponible.",
      );
    }
  }
}
async function encodeLocal(path) {
  const response = await fetch(path);
  if (!response.ok)
    throw Error(
      `No se pudo incluir ${path}. No se descargó un respaldo incompleto.`,
    );
  const blob = await response.blob();
  if (/\.(svg|ico)$/.test(path)) {
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement("canvas");
      const scale = /\.svg$/.test(path)
        ? 256 / Math.max(image.naturalWidth, image.naturalHeight)
        : 1;
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas
        .getContext("2d")
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const mime = /\.pdf$/.test(path)
    ? "application/pdf"
    : /\.jpe?g$/.test(path)
      ? "image/jpeg"
      : /\.webp$/.test(path)
        ? "image/webp"
        : "image/png";
  return dataURL(new Blob([blob], { type: mime }));
}
export async function createPortableBackup(
  db,
  storedResources = {},
  onProgress = () => {},
) {
  const backup = structuredClone(db);
  delete backup.meta.resourceBundle;
  delete backup.resources;
  const resources = Object.create(null),
    paths = resourcePaths(backup);
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    resources[path] = storedResources[path] || (await encodeLocal(path));
    onProgress(i + 1, paths.length);
  }
  validateResources(resources, backup);
  await checkImages(backup, resources);
  backup.resources = resources;
  validateDatabase(backup);
  const raw = JSON.stringify(backup);
  if (new Blob([raw]).size > MAX_BACKUP_BYTES)
    throw Error("El respaldo completo supera el máximo de 100 MB.");
  return raw;
}
