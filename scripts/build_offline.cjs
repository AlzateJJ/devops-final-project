const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const esbuild = require("esbuild");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "entrega", "navegador");

async function buildOffline() {
  const { resourcePaths } = await import(
    pathToFileURL(path.join(root, "app/js/resources.js")).href
  );
  const seed = JSON.parse(
    await fs.readFile(path.join(root, "app/data/database.json"), "utf8"),
  );
  const { validateDatabase } = await import(
    pathToFileURL(path.join(root, "app/js/store.js")).href
  );
  validateDatabase(seed);
  const rawResources = {};
  const mimes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };
  for (const resource of resourcePaths(seed)) {
    const data = await fs.readFile(path.resolve(root, "app", resource));
    rawResources[resource] =
      `data:${mimes[path.extname(resource)]};base64,${data.toString("base64")}`;
  }
  const helper = await esbuild.build({
    absWorkingDir: root,
    entryPoints: ["app/js/portable.js"],
    bundle: true,
    write: false,
    format: "iife",
    globalName: "DevOpsBackupBuilder",
    target: "chrome120",
    charset: "utf8",
    logLevel: "silent",
  });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  let portable;
  try {
    const context = await browser.newContext({ offline: true });
    const page = await context.newPage();
    await page.addScriptTag({ content: helper.outputFiles[0].text });
    portable = await page.evaluate(
      async ({ seed, resources }) => {
        for (const [name, data] of Object.entries(resources)) {
          if (!/\.(svg|ico)$/.test(name)) continue;
          const image = new Image();
          image.src = data;
          await image.decode();
          const canvas = document.createElement("canvas");
          const scale = name.endsWith(".svg")
            ? 256 / Math.max(image.naturalWidth, image.naturalHeight)
            : 1;
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          canvas
            .getContext("2d")
            .drawImage(image, 0, 0, canvas.width, canvas.height);
          resources[name] = canvas.toDataURL("image/png");
        }
        return window.DevOpsBackupBuilder.createPortableBackup(seed, resources);
      },
      { seed, resources: rawResources },
    );
  } finally {
    await browser.close();
  }
  // La carpeta generada también se puede abrir antes de empaquetar el ZIP.
  for (const folder of ["app", "inventario", "planificacion"])
    await fs.cp(path.join(root, folder), path.join(output, folder), {
      recursive: true,
    });
  await fs.mkdir(path.join(output, "runtime"), { recursive: true });
  await fs.mkdir(path.join(output, "app"), { recursive: true });
  await esbuild.build({
    absWorkingDir: root,
    entryPoints: ["app/js/app.js"],
    bundle: true,
    format: "iife",
    target: "chrome120",
    charset: "utf8",
    outfile: path.join(output, "runtime/app.js"),
    logLevel: "silent",
  });
  await fs.writeFile(
    path.join(output, "runtime/catalogo.js"),
    `// Catálogo y archivos incluidos para abrir el HTML sin servidor.\nglobalThis.__DEVOPS_INITIAL_DATA__ = ${portable};\n`,
  );
  const source = await fs.readFile(path.join(root, "app/index.html"), "utf8");
  const html = source
    .replace('href="styles.css"', 'href="app/styles.css"')
    .replaceAll('"assets/atlas.svg"', '"app/assets/atlas.svg"')
    .replace(
      'href="../inventario/inventario.html"',
      'href="inventario/inventario.html"',
    )
    .replace(
      '<script type="module" src="js/app.js"></script>',
      '<script defer src="runtime/catalogo.js"></script>\n    <script defer src="runtime/app.js"></script>',
    );
  await fs.writeFile(path.join(output, "index.html"), html);
  // Mantener válido el acceso habitual app/index.html dentro del ZIP.
  await fs.writeFile(
    path.join(output, "app/index.html"),
    '<!doctype html><html lang="es"><meta charset="utf-8"><title>Entrega Final DevOps</title><script>location.replace("../index.html" + location.search + location.hash);</script><p><a href="../index.html">Abrir Entrega Final DevOps</a></p></html>',
  );
  await fs.writeFile(path.join(output, "app/index-desarrollo.html"), source);
  await fs.writeFile(
    path.join(output, "LEEME.txt"),
    `ENTREGA FINAL DEVOPS — Juan José Alzate\n\n1. Extrae TODO el ZIP en una carpeta.\n2. Abre index.html (el que está junto a este LEEME) con doble clic, en Google Chrome.\n3. Ya puedes consultar, registrar, editar, respaldar, vaciar y restaurar datos.\n\nNo necesitas instalar Node.js, paquetes ni iniciar un servidor.\nLos logos, diagramas y PDF están incluidos. El catálogo funciona sin Internet.\nLos enlaces a Trello y páginas externas sí necesitan conexión.\n\nLos cambios se guardan en este perfil de Chrome y para esta carpeta.\nAntes de mover o renombrar la carpeta, descarga un respaldo JSON desde Gestión de datos.\nEn la nueva ubicación puedes restaurarlo. Extraer un ZIP nuevo no incluye cambios hechos en otro equipo.\n\nARCHIVOS PARA REVISAR\nindex.html: entrada HTML5 lista para abrir.\napp/styles.css: diseño CSS.\nruntime/app.js: JavaScript preparado para apertura directa.\nruntime/catalogo.js: datos y archivos incorporados para el arranque sin servidor.\napp/data/database.json: catálogo inicial en JSON legible.\napp/js/: módulos JavaScript originales.\napp/index-desarrollo.html: HTML fuente para desarrollo mediante HTTP.\napp/assets/ e inventario/: imágenes, inventario y documentos originales.\nplanificacion/backlog.html: planificación y enlaces al tablero de Trello.\n\nTablero: https://trello.com/b/5CSrY3pF/devops-tools-project\n`,
  );
  return {
    output,
    resources: Object.keys(rawResources).length,
    catalogBytes: Buffer.byteLength(portable),
  };
}
module.exports = { buildOffline };
if (require.main === module)
  buildOffline()
    .then((report) => console.log(JSON.stringify(report)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
