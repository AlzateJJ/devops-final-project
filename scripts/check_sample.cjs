const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { configureContext } = require("./browser_environment.cjs");
const root = path.resolve(__dirname, "..");
const dir = path.resolve(process.argv[2] || path.join(root, "entrega/muestra"));
const jsonFile = path.resolve(
  process.argv[3] || path.join(dir, "Datos-DevOps.json"),
);
const out = path.join(root, "entrega/verificacion-muestra");
const base = pathToFileURL(path.join(dir, "index.html")).href;
const sample = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
const counts = ["tools", "practices", "diagrams", "usages"].map((key) =>
  String(sample[key].length),
);
let browser;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  for (const file of [path.join(dir, "app.js"), jsonFile])
    assert.ok(fs.statSync(file).size < 5_000_000);
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    offline: true,
    acceptDownloads: true,
    viewport: { width: 1440, height: 1050 },
  });
  await configureContext(context, base);
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [],
    http = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) http.push(request.url());
  });
  const go = async (route) => {
    await page.goto(base + "#/" + route);
    await page.waitForFunction(
      () => !document.querySelector("#main > p[role=status]"),
    );
  };
  const home = async () => {
    await page
      .getByRole("heading", {
        name: "Conecta herramientas y prácticas.",
        exact: true,
      })
      .waitFor();
  };
  const images = async () => {
    await page.locator("#main img").evaluateAll(async (imgs) => {
      for (const img of imgs) {
        img.loading = "eager";
        await Promise.race([
          img.decode(),
          new Promise((_, reject) =>
            setTimeout(() => reject(Error("Image decode timed out")), 10000),
          ),
        ]);
        if (!img.naturalWidth) throw Error("Broken image");
      }
    });
  };
  const saved = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem(window.__qaDataKey)));
  const save = () =>
    page.getByRole("button", { name: "Guardar", exact: true }).click();
  const restore = async () => {
    await go("backup");
    await page.locator("#backup-file").setInputFiles(jsonFile);
    await page.waitForFunction(() =>
      document
        .querySelector("#backup-summary")
        .textContent.startsWith("Archivo válido:"),
    );
    await page.locator("#confirm-restore").check();
    await page.locator("#restore-data").click();
    await home();
  };

  await go("home");
  await home();
  assert.deepEqual(await page.locator(".stats b").allTextContents(), counts);
  assert.deepEqual(
    await page.evaluate(() => window.__DEVOPS_INITIAL_DATA__),
    sample,
  );
  await page.screenshot({ path: path.join(out, "inicio.png"), fullPage: true });
  await go("tools");
  assert.equal(await page.locator(".tool-card").count(), sample.tools.length);
  await images();
  await page.locator("#search").fill("Playwright");
  assert.equal(await page.locator(".tool-card").count(), 1);
  await page.locator("#search").fill("");
  await page.locator("#category").selectOption("TEST");
  assert.equal(await page.locator(".tool-card").count(), 3);
  await go("practices");
  assert.equal(await page.locator(".practice-card").count(), 3);
  await images();
  await page.screenshot({
    path: path.join(out, "practicas.png"),
    fullPage: true,
  });
  const pdfPaths = new Set();
  for (const [collection, route] of [
    [sample.tools, "tools"],
    [sample.practices, "practices"],
  ]) {
    for (const record of collection) {
      await go(`${route}/view/${record.id}`);
      await images();
      const links = await page
        .locator(".source-links a")
        .evaluateAll((links) =>
          links.map((a) => ({ text: a.textContent, href: a.href })),
        );
      assert.equal(links.length, record.references.length);
      for (let i = 0; i < links.length; i++) {
        const ref = record.references[i],
          src = sample.sources.find((s) => s.id === ref.source);
        assert.ok(links[i].href.endsWith("#page=" + src.pageMap[ref.page]));
        assert.equal(
          links[i].text,
          `${ref.source} · p. ${ref.page} (extracto)`,
        );
        assert.ok(
          await page.evaluate(
            async (url) =>
              (await (await fetch(url)).text()).startsWith("%PDF-"),
            links[i].href,
          ),
        );
        pdfPaths.add(src.file);
      }
    }
  }
  assert.equal(pdfPaths.size, sample.sources.length);
  await page.locator("#expand-diagram").click();
  await page.locator("#large-image").evaluate((img) => img.decode());
  await page.locator("#close-image").click();
  await go("usages");
  assert.equal(await page.locator(".usage-card").count(), 9);
  await page.locator("#practice-filter").selectOption("PR10");
  assert.equal(await page.locator(".usage-card").count(), 3);

  // Exercise creation, editing and reload persistence with an uploaded local image.
  const png = Object.values(sample.resources).find((data) =>
    data.startsWith("data:image/png"),
  );
  const upload = {
    name: "ejemplo.png",
    mimeType: "image/png",
    buffer: Buffer.from(png.split(",")[1], "base64"),
  };
  await go("tools/new");
  await page.locator("#name").fill("Herramienta de prueba local");
  await page
    .locator("#description")
    .fill("Recurso para verificar el registro sin servidor.");
  await page.locator("#category").selectOption("TEST");
  await page.locator("#price").selectOption("OS");
  await page.locator("#image-file").setInputFiles(upload);
  await save();
  await page.waitForURL(/#\/tools\/view\//);
  const tool = (await saved()).tools.find(
    (t) => t.name === "Herramienta de prueba local",
  );
  await go("tools/edit/" + tool.id);
  await page.locator("#name").fill("Herramienta editada");
  await save();
  await page.waitForURL(/#\/tools\/view\//);
  await page.reload();
  await page
    .getByRole("heading", { name: "Herramienta editada", exact: true })
    .waitFor();
  await images();
  await go("practices/new");
  await page.locator("#name").fill("Práctica de prueba local");
  await page
    .locator("#description")
    .fill("Verificar que se pueden ampliar los datos de la muestra.");
  await page.locator("#image-file").setInputFiles(upload);
  await save();
  await page.waitForURL(/#\/practices\/view\//);
  const practice = (await saved()).practices.find(
    (p) => p.name === "Práctica de prueba local",
  );
  await go("practices/edit/" + practice.id);
  await page.locator("#description").fill("Práctica actualizada y persistida.");
  await save();
  await page.waitForURL(/#\/practices\/view\//);
  await go("usages/new");
  await page.locator("#toolId").selectOption(tool.id);
  await page.locator("#practiceId").selectOption(practice.id);
  await page
    .locator("#description")
    .fill("Automatizar pruebas y compartir los resultados con el equipo.");
  await save();
  await page.waitForURL(/#\/usages$/);
  const usage = (await saved()).usages.find((u) => u.toolId === tool.id);
  await go("usages/edit/" + usage.id);
  await page
    .locator("#description")
    .fill(
      "Automatizar pruebas, revisar fallos y colaborar en las correcciones.",
    );
  await save();
  await page.waitForURL(/#\/usages$/);
  await page.reload();
  await page
    .getByText(
      "Automatizar pruebas, revisar fallos y colaborar en las correcciones.",
      { exact: true },
    )
    .waitFor();

  await go("backup");
  await page.locator("#confirm-flush").check();
  await page.locator("#flush-data").click();
  await home();
  await page.reload();
  await home();
  assert.deepEqual(await page.locator(".stats b").allTextContents(), [
    "0",
    "0",
    "0",
    "0",
  ]);
  await restore();
  await page.reload();
  await home();
  assert.deepEqual(await page.locator(".stats b").allTextContents(), counts);
  await go("practices");
  await images();
  await go("tools/view/H060");
  await images();
  assert.ok(
    await page
      .locator(".source-links a")
      .first()
      .evaluate(async (a) =>
        (await (await fetch(a.href)).text()).startsWith("%PDF-"),
      ),
  );
  await go("backup");
  const pending = page.waitForEvent("download");
  await page.locator("#export-data").click();
  const download = await pending;
  const exported = path.join(out, "roundtrip.json");
  await download.saveAs(exported);
  assert.deepEqual(JSON.parse(fs.readFileSync(exported, "utf8")), sample);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of ["home", "tools", "practices", "usages", "backup"]) {
      await go(route);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(http, []);
  const report = {
    passed: true,
    protocol: "file:",
    offline: true,
    counts,
    resources: Object.keys(sample.resources).length,
    pdfs: pdfPaths.size,
    createdAndEdited: ["tool", "practice", "usage"],
    roundtripMatches: true,
    httpRequests: http.length,
    consoleErrors: errors.length,
  };
  fs.writeFileSync(
    path.join(out, "report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
  });
