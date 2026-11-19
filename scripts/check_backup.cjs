const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, ".."),
  base = process.env.DEVOPS_TEST_URL || "http://127.0.0.1:8765/app/";
const temp = path.join(root, "tmp", "backup-qa-" + Date.now());
fs.mkdirSync(temp, { recursive: true });
const results = [],
  errors = [];
const check = (name, value = true) => {
  assert.ok(value, name);
  results.push(name);
};
const options = {
  channel: process.env.DEVOPS_TEST_CHANNEL || "chrome",
  headless: true,
  acceptDownloads: true,
  viewport: { width: 1440, height: 1100 },
};
let context, page;
async function open() {
  context = await chromium.launchPersistentContext(
    path.join(temp, "profile"),
    options,
  );
  page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(30000);
  page.on("pageerror", (error) => errors.push(error.message));
}
async function backupPage() {
  await page.goto(base + "#/backup");
  await page
    .getByRole("heading", { name: "Tus datos, contigo.", exact: true })
    .waitFor();
}
async function download(name) {
  const pending = page.waitForEvent("download");
  await page.locator("#export-data").click();
  const downloaded = await pending,
    target = path.join(temp, name);
  await downloaded.saveAs(target);
  return target;
}
async function home() {
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
}
async function flush() {
  await page.locator("#confirm-flush").check();
  await page.locator("#flush-data").click();
  await home();
}
async function restore(file) {
  await page.locator("#backup-file").setInputFiles(file);
  await page.waitForFunction(() =>
    document
      .querySelector("#backup-summary")
      .textContent.startsWith("Archivo válido:"),
  );
  await page.locator("#confirm-restore").check();
  await page.locator("#restore-data").click();
  await home();
}
const mediaCount = () =>
  page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("entrega-final-devops-resources", 1);
        request.onupgradeneeded = () =>
          request.result.createObjectStore("bundles");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction("bundles"),
            count = tx.objectStore("bundles").count();
          tx.oncomplete = () => {
            resolve(count.result);
            db.close();
          };
          tx.onerror = () => {
            reject(tx.error);
            db.close();
          };
        };
      }),
  );
async function blockOriginals() {
  await context.route(
    /\/(assets\/(logos|diagramas)\/|inventario\/fuentes\/|data\/database\.json)/,
    (route) => route.abort(),
  );
}
async function checkRestoredMedia() {
  return page.evaluate(async () => {
    const { resourceURL } = await import("./js/resources.js");
    const db = JSON.parse(localStorage.getItem("devops-atlas:v1"));
    const images = [
      ...new Set([
        ...db.tools.map((t) => t.logo),
        ...db.practices.map((p) => p.image),
        ...db.diagrams.map((d) => d.image),
      ]),
    ];
    for (const src of images) {
      const img = new Image();
      img.src = resourceURL(src);
      await img.decode();
    }
    for (const source of db.sources) {
      const response = await fetch(resourceURL(source.file));
      if (!(await response.text()).startsWith("%PDF-"))
        throw Error("PDF no disponible");
    }
    return { images: images.length, pdfs: db.sources.length };
  });
}
(async () => {
  await open();
  await backupPage();
  check(
    "Gestión de datos muestra las tres tarjetas",
    (await page.locator(".backup-grid > .panel").count()) === 3,
  );
  check(
    "Vaciar requiere confirmación explícita",
    await page.locator("#flush-data").isDisabled(),
  );
  await page.locator("#confirm-flush").check();
  await page.locator("#confirm-flush").uncheck();
  check(
    "Retirar la confirmación vuelve a deshabilitar el vaciado",
    await page.locator("#flush-data").isDisabled(),
  );
  await page.screenshot({
    path: path.join(root, "evidencias/gestion-datos.png"),
    fullPage: true,
  });
  const file = await download("complete.json"),
    exported = JSON.parse(fs.readFileSync(file, "utf8"));
  const paths = [
    ...new Set([
      ...exported.tools.map((t) => t.logo),
      ...exported.practices.map((p) => p.image),
      ...exported.diagrams.map((d) => d.image),
      ...exported.sources.map((s) => s.file),
    ]),
  ];
  assert.deepEqual(Object.keys(exported.resources).sort(), paths.sort());
  check(
    "El JSON incluye exactamente todos los archivos de los registros",
    paths.length === 171,
  );
  check(
    "El respaldo incluye los ocho PDF de referencia",
    exported.sources.every((s) =>
      exported.resources[s.file].startsWith("data:application/pdf;base64,"),
    ),
  );
  check(
    "Los logos SVG e ICO se incluyen como imágenes PNG seguras",
    Object.entries(exported.resources)
      .filter(([p]) => /\.(svg|ico)$/.test(p))
      .every(([, data]) => data.startsWith("data:image/png;base64,")),
  );
  await page.evaluate(() =>
    localStorage.setItem("otra-aplicacion", "conservar"),
  );
  await flush();
  check(
    "Flush elimina los registros de localStorage y conserva datos ajenos",
    await page.evaluate(
      () =>
        localStorage.getItem("devops-atlas:v1") === null &&
        localStorage.getItem("otra-aplicacion") === "conservar",
    ),
  );
  await blockOriginals();
  await page.reload();
  await home();
  check(
    "Después del vaciado y la recarga todos los contadores siguen en cero sin consultar la semilla",
    (await page.locator(".stats b").allTextContents()).every((n) => n === "0"),
  );
  await backupPage();
  await restore(file);
  check(
    "Se restaura el catálogo completo con los archivos originales bloqueados",
    (await page.locator(".stats b").allTextContents()).join(",") ===
      "144,14,19,42",
  );
  const media = await checkRestoredMedia();
  check(
    "Se decodifican los 163 logos y diagramas restaurados y se leen los ocho PDF",
    media.images === 163 && media.pdfs === 8,
  );
  check(
    "Los archivos restaurados se guardan en un único paquete de IndexedDB",
    (await mediaCount()) === 1,
  );
  // Usar el ID real del primer registro; las fichas mantienen rutas estables.
  await page.goto(base + "#/tools/view/" + exported.tools[0].id);
  await page.locator(".logo.large").waitFor();
  check(
    "Las fichas y las fuentes usan los archivos restaurados",
    (await page.locator(".logo.large").getAttribute("src")).startsWith(
      "blob:",
    ) &&
      (
        await page.locator(".source-links a").first().getAttribute("href")
      ).startsWith("blob:"),
  );
  await context.close();
  await open();
  await blockOriginals();
  await backupPage();
  await checkRestoredMedia();
  check(
    "Cerrar y reabrir Chrome conserva imágenes y PDF sin sus archivos originales",
  );
  const second = await download("restored-export.json");
  assert.deepEqual(JSON.parse(fs.readFileSync(second, "utf8")), exported);
  check(
    "Exportar de nuevo recupera exactamente los registros y archivos del primer respaldo",
  );
  const broken = structuredClone(exported);
  delete broken.resources[paths[0]];
  await page.locator("#backup-file").setInputFiles({
    name: "incompleto.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(broken)),
  });
  await page.locator("#backup-error").waitFor({ state: "visible" });
  check(
    "Un respaldo sin uno de sus archivos se rechaza sin modificar el catálogo",
    (await page.locator("#restore-data").isDisabled()) &&
      (await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("devops-atlas:v1")).tools.length ===
          144,
      )),
  );
  await flush();
  check(
    "El segundo flush también elimina los archivos importados de IndexedDB",
    (await mediaCount()) === 0,
  );
  await backupPage();
  const empty = JSON.parse(
    fs.readFileSync(await download("empty.json"), "utf8"),
  );
  check(
    "El catálogo vacío también se puede respaldar",
    empty.tools.length === 0 && Object.keys(empty.resources).length === 0,
  );
  await page.goto(base + "#/tools/new");
  await page.locator("#name").fill("Mi primera herramienta");
  await page
    .locator("#description")
    .fill("Herramienta propia creada desde el catálogo vacío.");
  await page.locator("#category").selectOption("CI");
  await page.locator("#price").selectOption("FR");
  const png = Object.values(exported.resources).find(
    (data) => data.startsWith("data:image/png;base64,") && data.length < 100000,
  );
  await page.locator("#image-file").setInputFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: Buffer.from(png.split(",")[1], "base64"),
  });
  await page.locator("#image-preview").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await page
    .getByRole("heading", { name: "Mi primera herramienta", exact: true })
    .waitFor();
  check(
    "La plantilla vacía permite crear recursos propios",
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("devops-atlas:v1")).tools.length === 1,
    ),
  );
  assert.deepEqual(errors, []);
  check("El ciclo completo termina sin excepciones de JavaScript");
  const report = {
    status: "passed",
    date: new Date().toISOString(),
    checks: results.length,
    results,
    backupBytes: fs.statSync(file).size,
    embeddedResources: paths.length,
    note: "Perfil aislado; recursos originales y semilla bloqueados después del vaciado.",
  };
  fs.writeFileSync(
    path.join(root, "evidencias/pruebas-respaldos.json"),
    JSON.stringify(report, null, 2),
  );
  await context.close();
  console.log(JSON.stringify(report, null, 2));
})().catch(async (error) => {
  if (page)
    await page
      .screenshot({ path: path.join(temp, "failure.png"), fullPage: true })
      .catch(() => {});
  if (context) await context.close().catch(() => {});
  console.error(error);
  console.error("Evidence:", temp);
  process.exitCode = 1;
});
