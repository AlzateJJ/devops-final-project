// Instrumentación de lectura para las suites; no modifica datos de la aplicación.
async function configureContext(context, base) {
  if (base.startsWith("file:")) await context.setOffline(true);
  await context.addInitScript(() => {
    const scope =
      location.protocol === "file:"
        ? `:${new URL(".", location.href).href}`
        : "";
    window.__qaDataKey = `devops-atlas:v1${scope}`;
    window.__qaResourceDB = `entrega-final-devops-resources${scope}`;
  });
}
module.exports = { configureContext };
