import { resourcePaths, validateResources } from "./resources.js";

export const embeddedSeed = () => globalThis.__DEVOPS_INITIAL_DATA__ || null;
export const embeddedResource = (path) => embeddedSeed()?.resources?.[path];

// Los JSON antiguos pueden reutilizar los archivos del catálogo incluido en el ZIP.
export function completeEmbeddedResources(db) {
  if (!embeddedSeed() || db.resources !== undefined || db.meta.resourceBundle)
    return db;
  const resources = {};
  for (const path of resourcePaths(db)) {
    const data = embeddedResource(path);
    if (!data)
      throw Error(
        `El JSON no incluye el archivo ${path}. Usa un respaldo completo con sus imágenes y PDF en resources.`,
      );
    resources[path] = data;
  }
  validateResources(resources, db);
  return { ...db, resources };
}
