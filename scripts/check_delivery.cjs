const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const extracted = process.argv[2];
if (!extracted) throw Error("Indica la carpeta devops-atlas extraída del ZIP.");
const dir = path.resolve(extracted),
  port = 8767;
let server, browser;
(async () => {
  assert.ok(fs.existsSync(path.join(dir, "app/index.html")));
  const hashes = JSON.parse(
    fs.readFileSync(path.join(dir, "manifiesto.json"), "utf8"),
  );
  const crypto = require("node:crypto");
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
  server = spawn(
    process.execPath,
    [path.join(dir, "scripts/serve.cjs"), "--port", String(port)],
    { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  await new Promise((resolve, reject) => {
    server.stdout.once("data", resolve);
    server.once("error", reject);
    server.once("exit", (code) =>
      reject(Error("El servidor salió con código " + code)),
    );
  });
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base = `http://127.0.0.1:${port}/app/`;
  await page.goto(base);
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("devops-atlas:v1")),
  );
  assert.equal(data.tools.length, 144);
  assert.equal(data.practices.length, 14);
  assert.equal(data.diagrams.length, 19);
  assert.equal(data.usages.length, 42);
  const resources = [
    ...data.tools.map((t) => t.logo),
    ...data.diagrams.map((d) => d.image),
    ...data.sources.map((s) => s.file),
  ];
  for (const resource of resources)
    assert.equal(
      (await page.request.get(new URL(resource, base).href)).status(),
      200,
      resource,
    );
  await page.goto(`http://127.0.0.1:${port}/planificacion/backlog.html`);
  assert.equal(await page.locator(".card").count(), 42);
  assert.equal(await page.locator("[data-trello]").count(), 42);
  await page.locator("#search").fill("Playwright");
  assert.equal(await page.locator(".card:visible").count(), 1);
  await page.locator("#search").fill("");
  await page.locator("#phase").selectOption("7");
  assert.equal(await page.locator(".card:visible").count(), 3);
  assert.equal(
    (await page.request.get(`http://127.0.0.1:${port}/.git/config`)).status(),
    403,
  );
  assert.deepEqual(errors, []);
  const report = {
    status: "passed",
    date: new Date().toISOString(),
    browser: await browser.version(),
    filesVerified: hashes.files.length,
    resourceResponses: resources.length,
    checks: [
      "SHA-256 de cada archivo extraído coincide",
      "Arranque con Node.js sin instalar dependencias",
      "Base inicial 144/14/19/42",
      "Recursos locales responden HTTP 200",
      "Planificación contiene 42 enlaces reales; búsqueda y filtro funcionan",
      "Sin errores de JavaScript",
      "Directorio .git no se sirve",
    ],
    note: "Verificación de ejecución desde copia extraída. El manifiesto externo identifica el commit final de la entrega.",
  };
  fs.writeFileSync(
    process.env.DEVOPS_DELIVERY_REPORT ||
      path.join(root, "evidencias/entrega-limpia.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    if (server) server.kill();
  });
