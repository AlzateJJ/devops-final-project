const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, ".."),
  base = process.env.DEVOPS_TEST_URL || "http://127.0.0.1:8765/app/";
const temp = path.join(root, "tmp", "json-guide-qa-" + Date.now());
fs.mkdirSync(temp, { recursive: true });
const results = [],
  errors = [];
const check = (name, value = true) => {
  assert.ok(value, name);
  results.push(name);
};
let context, page;
const goBackup = async () => {
  await page.goto(base + "#/backup");
  await page
    .getByRole("heading", { name: "Tus datos, contigo.", exact: true })
    .waitFor();
};
const openGuide = () => page.locator("#open-json-guide").click();
async function download(selector, name) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const file = path.join(temp, name);
  await (await pending).saveAs(file);
  return file;
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
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
}
(async () => {
  context = await chromium.launchPersistentContext(path.join(temp, "profile"), {
    channel: "chrome",
    headless: true,
    acceptDownloads: true,
    viewport: { width: 1440, height: 1050 },
  });
  page = context.pages()[0] || (await context.newPage());
  page.on("pageerror", (err) => errors.push(err.message));
  await goBackup();
  const initial = await page.evaluate(() =>
    localStorage.getItem("devops-atlas:v1"),
  );
  await page.screenshot({
    path: path.join(root, "evidencias/gestion-datos.png"),
    fullPage: true,
  });
  await openGuide();
  check(
    "El botón abre una guía modal con nombre accesible",
    await page
      .getByRole("dialog", { name: "Cómo preparar tu JSON" })
      .isVisible(),
  );
  const templatePath = await download(
      "#download-json-template",
      "template.json",
    ),
    examplePath = await download("#download-json-example", "example.json");
  const template = JSON.parse(fs.readFileSync(templatePath, "utf8")),
    example = JSON.parse(fs.readFileSync(examplePath, "utf8"));
  const { validateDatabase } = await import(
    pathToFileURL(path.join(root, "app/js/store.js")).href
  );
  validateDatabase(template);
  validateDatabase(example);
  check(
    "Las dos descargas cumplen el contrato real de importación",
    template.categories.length === 14 &&
      template.prices.length === 6 &&
      Object.keys(template.resources).length === 0,
  );
  await page.screenshot({
    path: path.join(root, "evidencias/guia-json-escritorio.png"),
    fullPage: true,
  });
  await page.locator("#json-converter > summary").click();
  const input = page.locator("#json-resource-file"),
    output = page.locator("#json-base64");
  const image = example.resources["assets/logos/mi-logo.png"];
  await input.setInputFiles({
    name: "mi-logo.png",
    mimeType: "image/png",
    buffer: Buffer.from(image.split(",")[1], "base64"),
  });
  await page.waitForFunction(
    () => !document.querySelector("#copy-json-base64").disabled,
  );
  check(
    "Convertir una imagen conserva exactamente su contenido",
    (await output.inputValue()) === image,
  );
  // Simular el portapapeles para no cambiar el portapapeles personal del usuario.
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.guideClipboard = text;
        },
      },
    }),
  );
  await page.locator("#copy-json-base64").click();
  check(
    "Copiar incluye el prefijo y todo el Base64",
    await page.evaluate((image) => window.guideClipboard === image, image),
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw Error("blocked");
        },
      },
    }),
  );
  await page.locator("#copy-json-base64").click();
  check(
    "Si el navegador bloquea el portapapeles, se selecciona el contenido para copiar manualmente",
    await output.evaluate(
      (el) => el.selectionStart === 0 && el.selectionEnd === el.value.length,
    ),
  );
  const seed = JSON.parse(
    fs.readFileSync(path.join(root, "app/data/database.json"), "utf8"),
  );
  const pdfBytes = fs.readFileSync(
    path.resolve(root, "app", seed.sources[0].file),
  );
  await input.setInputFiles({
    name: "mi-documento.pdf",
    mimeType: "application/pdf",
    buffer: pdfBytes,
  });
  await page.waitForFunction(
    () => !document.querySelector("#copy-json-base64").disabled,
  );
  const pdfData = await output.inputValue();
  check(
    "Convertir un PDF conserva todos sus bytes y el prefijo correcto",
    pdfData === "data:application/pdf;base64," + pdfBytes.toString("base64"),
  );
  for (const [name, mimeType, buffer] of [
    ["falso.png", "image/png", Buffer.from("No es una imagen")],
    [
      "tipo-equivocado.jpg",
      "image/jpeg",
      Buffer.from(image.split(",")[1], "base64"),
    ],
    ["falso.pdf", "application/pdf", Buffer.from("No es un PDF")],
  ]) {
    await input.setInputFiles({ name, mimeType, buffer });
    await page.locator("#json-convert-error").waitFor({ state: "visible" });
    assert.equal(await output.inputValue(), "");
    assert.ok(await page.locator("#copy-json-base64").isDisabled());
  }
  check(
    "Archivos dañados o con tipo incorrecto se rechazan sin dejar un resultado anterior",
  );
  check(
    "Leer la guía, descargar y convertir no altera el catálogo",
    (await page.evaluate(() => localStorage.getItem("devops-atlas:v1"))) ===
      initial,
  );
  await page.keyboard.press("Escape");
  check(
    "Escape cierra la guía y devuelve el foco al botón",
    (await page.locator("#json-guide").count()) === 0 &&
      (await page
        .locator("#open-json-guide")
        .evaluate((el) => el === document.activeElement)),
  );
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await openGuide();
    await page
      .locator("#json-guide details")
      .evaluateAll((nodes) => nodes.forEach((node) => (node.open = true)));
    const fits = await page.locator("#json-guide").evaluate((el) => {
      const box = el.getBoundingClientRect(),
        body = el.querySelector(".json-guide-body");
      return (
        box.x >= 0 &&
        box.right <= innerWidth &&
        box.height <= innerHeight &&
        body.scrollWidth <= body.clientWidth + 1
      );
    });
    check(`Guía completa sin desbordamiento horizontal a ${width}px`, fits);
    await page
      .locator("#json-guide details")
      .evaluateAll((nodes) => nodes.forEach((node) => (node.open = false)));
    if (width === 375)
      await page.screenshot({
        path: path.join(root, "evidencias/guia-json-movil.png"),
        fullPage: false,
      });
    await page.locator("#close-json-guide").click();
  }
  await page.locator("#backup-file").setInputFiles(examplePath);
  await page.waitForFunction(() =>
    document
      .querySelector("#backup-summary")
      .textContent.startsWith("Archivo válido:"),
  );
  await page.locator("#confirm-restore").check();
  await openGuide();
  await page.locator("#close-json-guide").click();
  check(
    "Consultar la guía conserva el archivo seleccionado y su confirmación",
    (await page.locator("#confirm-restore").isChecked()) &&
      !(await page.locator("#restore-data").isDisabled()),
  );
  example.sources = [
    {
      id: "FU01",
      name: "Mi fuente PDF",
      file: "../inventario/fuentes/P01.pdf",
    },
  ];
  example.tools[0].references = [{ source: "FU01", page: 1 }];
  example.resources["../inventario/fuentes/P01.pdf"] = pdfData;
  const customPath = path.join(temp, "custom-with-pdf.json");
  fs.writeFileSync(customPath, JSON.stringify(example));
  await context.route(
    /\/(assets\/(logos|diagramas)\/|inventario\/fuentes\/)/,
    (route) => route.abort(),
  );
  await restore(customPath);
  check(
    "Un JSON propio preparado según la guía restaura todas las entidades",
    (await page.locator(".stats b").allTextContents()).join(",") === "1,1,1,1",
  );
  await page.goto(base + "#/tools/view/TO01");
  await page.locator(".logo.large").waitFor();
  check(
    "La imagen y el PDF propios se recuperan sin archivos originales",
    (await page
      .locator(".logo.large")
      .evaluate((el) => el.complete && el.naturalWidth > 0)) &&
      (await page
        .locator(".source-links a")
        .first()
        .evaluate(
          async (el) =>
            el.href.startsWith("blob:") &&
            (await (await fetch(el.href)).text()).startsWith("%PDF-"),
        )),
  );
  await goBackup();
  await restore(templatePath);
  check(
    "La plantilla vacía descargada también se puede importar",
    (await page.locator(".stats b").allTextContents()).every((n) => n === "0"),
  );
  assert.deepEqual(errors, []);
  check("Sin errores de JavaScript en el recorrido de la guía");
  const report = {
    status: "passed",
    date: new Date().toISOString(),
    checks: results.length,
    results,
    note: "Perfil aislado; portapapeles simulado, imágenes y PDF propios importados con los archivos originales bloqueados.",
  };
  fs.writeFileSync(
    path.join(root, "evidencias/pruebas-guia-json.json"),
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
