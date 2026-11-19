const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { configureContext } = require("./browser_environment.cjs");
const root = path.resolve(__dirname, ".."),
  extracted = process.argv[2];
if (!extracted) throw Error("Indica la carpeta devops-atlas extraída del ZIP.");
const dir = path.resolve(extracted),
  base = pathToFileURL(path.join(dir, "index.html")).href;
let browser;
(async () => {
  const hashes = JSON.parse(
    fs.readFileSync(path.join(dir, "manifiesto.json"), "utf8"),
  );
  for (const item of hashes.files)
    assert.equal(
      crypto
        .createHash("sha256")
        .update(fs.readFileSync(path.join(dir, item.path)))
        .digest("hex"),
      item.sha256,
      item.path,
    );
  assert.ok(!fs.existsSync(path.join(dir, "node_modules")));
  const entry = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  assert.ok(!entry.includes('type="module"'));
  assert.ok(
    entry.includes("runtime/catalogo.js") && entry.includes("runtime/app.js"),
  );
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ offline: true });
  context.setDefaultTimeout(20000);
  context.setDefaultNavigationTimeout(20000);
  await configureContext(context, base);
  const errors = [],
    requests = [],
    failures = [],
    browserLimitations = [];
  context.on("request", (req) => {
    if (/^https?:/.test(req.url())) requests.push(req.url());
  });
  context.on("requestfailed", (req) => {
    if (
      req.url() ===
      "chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/index.html"
    )
      browserLimitations.push(
        "El visor PDF interno no se ejecuta en modo headless; se verificaron los bytes íntegros y el destino del enlace.",
      );
    else failures.push(req.url());
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
  assert.equal(new URL(page.url()).protocol, "file:");
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem(window.__qaDataKey)),
  );
  assert.deepEqual(
    [
      data.tools.length,
      data.practices.length,
      data.diagrams.length,
      data.usages.length,
    ],
    [144, 14, 19, 42],
  );
  await page.goto(base + "#/tools/view/" + data.tools[0].id);
  await page.locator(".logo.large").waitFor();
  assert.ok(
    await page.locator(".logo.large").evaluate(async (img) => {
      await img.decode();
      return img.naturalWidth > 0;
    }),
  );
  const source = data.sources.find(
    (item) => item.id === data.tools[0].references[0].source,
  );
  const expectedPDF = crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.resolve(dir, "app", source.file)))
    .digest("hex");
  const actualPDF = await page
    .locator(".source-links a")
    .first()
    .evaluate(async (link) => {
      const bytes = await (await fetch(link.href)).arrayBuffer();
      const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
      return [...hash]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
    });
  assert.equal(actualPDF, expectedPDF);
  const popupPromise = context.waitForEvent("page");
  await page.locator(".source-links a").first().click();
  const pdf = await popupPromise;
  await pdf.waitForLoadState("domcontentloaded");
  assert.ok(
    pdf.url().startsWith("blob:file:///") ||
      pdf.url().startsWith("blob:null/") ||
      pdf.url().startsWith("blob:"),
    pdf.url(),
  );
  // Playwright documenta que el visor PDF no se puede verificar en modo headless:
  // https://playwright.dev/docs/api/class-page#page-goto
  // Se comprueban los bytes exactos, el enlace y la apertura de la pestaña.
  await pdf.close();
  // Una segunda extracción comparte perfil, pero conserva sus propios registros y archivos.
  const copy = fs.mkdtempSync(path.join(root, "tmp", "otra-entrega-"));
  fs.cpSync(dir, copy, { recursive: true });
  const otherBase = pathToFileURL(path.join(copy, "index.html")).href;
  const other = await context.newPage();
  other.on("pageerror", (e) => errors.push(e.message));
  await other.goto(otherBase + "#/backup");
  await other
    .getByRole("heading", { name: "Tus datos, contigo.", exact: true })
    .waitFor();
  const firstKey = await page.evaluate(() => window.__qaDataKey),
    secondKey = await other.evaluate(() => window.__qaDataKey);
  assert.notEqual(firstKey, secondKey);
  await other.locator("#confirm-flush").check();
  await other.locator("#flush-data").click();
  await other
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
  assert.ok(
    (await other.locator(".stats b").allTextContents()).every((n) => n === "0"),
  );
  await page.reload();
  await page.locator(".logo.large").waitFor();
  assert.ok(
    await page.locator(".logo.large").evaluate(async (img) => {
      await img.decode();
      return img.naturalWidth > 0;
    }),
  );
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem(window.__qaDataKey)).tools.length,
    ),
    144,
  );
  await other.close();
  await page.goto(pathToFileURL(path.join(dir, "app/index.html")).href);
  await page.waitForURL(base);
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
  await page.goto(
    pathToFileURL(path.join(dir, "inventario/inventario.html")).href,
  );
  assert.ok((await page.locator("body").innerText()).includes("Inventario"));
  await page.goto(
    pathToFileURL(path.join(dir, "planificacion/backlog.html")).href,
  );
  assert.equal(await page.locator(".card").count(), 42);
  assert.equal(await page.locator("[data-trello]").count(), 42);
  await page.locator("#search").fill("Playwright");
  assert.equal(await page.locator(".card:visible").count(), 1);
  await page.locator("#search").fill("");
  await page.locator("#phase").selectOption("7");
  assert.equal(await page.locator(".card:visible").count(), 3);
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  assert.deepEqual(failures, []);
  const report = {
    status: "passed",
    date: new Date().toISOString(),
    browser: await browser.version(),
    protocol: "file:",
    offline: true,
    browserLimitations,
    filesVerified: hashes.files.length,
    checks: [
      "SHA-256 de todos los archivos coincide",
      "Apertura directa del index.html sin servidor ni dependencias de ejecución",
      "Base inicial 144/14/19/42",
      "Logo visible y PDF incorporado íntegro, con enlace a una nueva pestaña",
      "Dos copias en el mismo perfil conservan almacenes separados",
      "Vaciar una copia no afecta registros ni imágenes de la otra",
      "app/index.html lleva a la entrada principal",
      "Inventario y planificación funcionan como archivos locales",
      "42 enlaces de Trello; búsqueda y filtro funcionan",
      "Cero solicitudes HTTP, fallos de recursos de la aplicación o excepciones de JavaScript",
    ],
    note: "Chrome con conexión desactivada. Node.js solo ejecuta la verificación automatizada; no inicia ningún servidor ni forma parte de la ejecución del ZIP.",
  };
  fs.writeFileSync(
    process.env.DEVOPS_DELIVERY_REPORT ||
      path.join(root, "evidencias/entrega-limpia.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
  });
