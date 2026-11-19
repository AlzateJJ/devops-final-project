export const CATEGORIES = [
  ["SCM", "Gestión del código fuente"],
  ["DB", "Automatización de bases de datos"],
  ["CI", "Integración continua"],
  ["TEST", "Pruebas"],
  ["CONFIG", "Configuración"],
  ["DEPLOY", "Despliegue"],
  ["CONT", "Contenedores"],
  ["RELEASE", "Orquestación de entregas"],
  ["CLOUD", "Nube"],
  ["AIOPS", "AIOps"],
  ["ANALYTICS", "Analítica"],
  ["MONITOR", "Monitoreo"],
  ["SEC", "Seguridad"],
  ["COLLAB", "Colaboración"],
].map(([id, name]) => ({ id, name }));
export const PRICES = [
  ["OS", "Open Source"],
  ["FR", "Free"],
  ["FM", "Freemium"],
  ["PA", "Paid"],
  ["EN", "Enterprise"],
  ["NS", "No especificado en la fuente"],
].map(([id, name]) => ({ id, name }));
export function emptyDatabase() {
  return {
    version: 1,
    meta: { name: "Entrega Final DevOps", updatedAt: new Date().toISOString() },
    categories: structuredClone(CATEGORIES),
    prices: structuredClone(PRICES),
    tools: [],
    practices: [],
    diagrams: [],
    usages: [],
    sources: [],
  };
}
