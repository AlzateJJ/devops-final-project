// Chrome comparte el origen file://: separar por carpeta evita mezclar dos entregas.
export function storageScope(location = globalThis.location) {
  return location?.protocol === "file:"
    ? `:${new URL(".", location.href).href}`
    : "";
}
export const STORAGE_SCOPE = storageScope();
