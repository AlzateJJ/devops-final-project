const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({
    chromium,
  } = require("C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-1425-0_26.1117.1425.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright"));
}
const root = path.resolve(__dirname, "..");
const base = process.env.DEVOPS_TEST_URL || "http://127.0.0.1:8765/app/";
const out = path.join(root, "evidencias");
fs.mkdirSync(out, { recursive: true });
const temp = path.join(root, "tmp", "qa-" + Date.now());
fs.mkdirSync(temp, { recursive: true });
const seed = JSON.parse(
  fs.readFileSync(path.join(root, "app/data/database.json"), "utf8"),
);
const results = [];
const check = (name, value = true) => {
  assert.ok(value, name);
  results.push(name);
};
const errors = [],
  failed = [];
const contextOptions = {
  channel: process.env.DEVOPS_TEST_CHANNEL || "chrome",
  headless: true,
  viewport: { width: 1440, height: 1050 },
  acceptDownloads: true,
};
let context, page;
function observe(p) {
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("response", (r) => {
    if (r.url().startsWith(base) && r.status() >= 400)
      failed.push(r.status() + " " + r.url());
  });
}
async function go(hash, heading) {
  await page.goto(base + "#/" + hash);
  if (heading)
    await page.getByRole("heading", { name: heading, exact: true }).waitFor();
}
const db = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("devops-atlas:v1")));
async function clickSave() {
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
}
async function formValues(values) {
  for (const [id, value] of Object.entries(values)) {
    const node = page.locator("#" + id);
    if (await node.evaluate((el) => el.tagName === "SELECT"))
      await node.selectOption(value);
    else await node.fill(value);
  }
}
async function chooseImage(file) {
  await page.locator("#image-file").setInputFiles(path.join(root, file));
  await page.locator("#image-preview").waitFor({ state: "visible" });
}
async function restore(file) {
  await page.locator("#backup-file").setInputFiles(file);
  await page.waitForFunction(() =>
    document
      .querySelector("#backup-summary")
      .textContent.startsWith("Archivo válido:"),
  );
  await page.locator("#confirm-restore").check();
  await page
    .getByRole("button", { name: "Restaurar base de datos", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
}

(async () => {
  context = await chromium.launchPersistentContext(
    path.join(temp, "profile"),
    contextOptions,
  );
  page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(12000);
  observe(page);
  await go("home", "Conecta herramientas y prácticas.");
  const browserVersion = context.browser()?.version() || "Chrome";
  check(
    "Carga inicial: 144 herramientas, 14 prácticas, 19 diagramas y 42 usos",
    (await db()).tools.length === 144 && (await db()).usages.length === 42,
  );
  check(
    "El esquema contiene seis relaciones dinámicas",
    (await page.locator(".dynamic-link").count()) === 6,
  );
  await page.screenshot({
    path: path.join(out, "inicio-escritorio.png"),
    fullPage: true,
  });
  await go("tools", "Herramientas DevOps");
  check(
    "El catálogo muestra 144 fichas",
    (await page.locator(".tool-card").count()) === 144,
  );
  await page.locator("#search").fill("Azure DevOps");
  check(
    "La búsqueda encuentra alias sin duplicar VSTS",
    (await page.locator(".tool-card").count()) === 1 &&
      (await page.locator(".tool-card").textContent()).includes("VSTS"),
  );
  await page.locator("#search").fill("");
  await page.locator("#category").selectOption("TEST");
  check(
    "El filtro de pruebas contiene las 23 herramientas del curso",
    (await page.locator(".tool-card").count()) === 23,
  );
  await page.screenshot({
    path: path.join(out, "catalogo-herramientas.png"),
    fullPage: false,
  });
  await page.locator("#search").fill("nunca-existe-xyz");
  check(
    "Se muestra un estado vacío",
    await page
      .getByRole("heading", { name: "No hay coincidencias", exact: true })
      .isVisible(),
  );
  await go("home", "Conecta herramientas y prácticas.");
  await page
    .getByRole("link", { name: "Registrar herramienta", exact: true })
    .click();
  await formValues({
    name: "Herramienta QA",
    category: "SCM",
    price: "OS",
    description:
      'Registro de prueba aislado <img src=x onerror="window.qaXss=1">',
  });
  await chooseImage("app/assets/logos/H001.png");
  await clickSave();
  await page
    .getByRole("heading", { name: "Herramienta QA", exact: true })
    .waitFor();
  const toolId = (await db()).tools.find((t) => t.name === "Herramienta QA").id;
  check(
    "Registrar herramienta desde el esquema crea un ID y un logo persistidos",
    toolId.startsWith("H-") &&
      (await db()).tools
        .find((t) => t.id === toolId)
        .logo.startsWith("data:image/png"),
  );
  check(
    "El texto HTML no se ejecuta",
    await page.evaluate(() => !window.qaXss),
  );
  await page
    .getByRole("link", { name: "Editar herramienta", exact: true })
    .click();
  await formValues({
    name: "Herramienta QA actualizada",
    category: "CI",
    price: "FM",
    description:
      "Descripción actualizada para comprobar la edición y la persistencia.",
  });
  await clickSave();
  await page
    .getByRole("heading", { name: "Herramienta QA actualizada", exact: true })
    .waitFor();
  check(
    "Actualizar herramienta conserva su ID",
    (await db()).tools.find((t) => t.name === "Herramienta QA actualizada")
      .id === toolId,
  );
  await go("home", "Conecta herramientas y prácticas.");
  await page
    .getByRole("link", { name: "Registrar práctica", exact: true })
    .click();
  await formValues({
    name: "Práctica QA",
    description:
      "Práctica de prueba aislada para verificar registro y edición.",
  });
  await chooseImage("app/assets/diagramas/P04-08.png");
  await clickSave();
  await page
    .getByRole("heading", { name: "Práctica QA", exact: true })
    .waitFor();
  const practiceId = (await db()).practices.find(
    (p) => p.name === "Práctica QA",
  ).id;
  check(
    "Registrar práctica crea su diagrama asociado",
    (await db()).diagrams.some((d) => d.practiceId === practiceId),
  );
  await page
    .getByRole("link", { name: "Editar práctica", exact: true })
    .click();
  await formValues({
    name: "Práctica QA actualizada",
    description: "La práctica actualizada mantiene su imagen y sus relaciones.",
  });
  await clickSave();
  await page
    .getByRole("heading", { name: "Práctica QA actualizada", exact: true })
    .waitFor();
  check(
    "Actualizar práctica conserva y sincroniza el diagrama",
    (await db()).diagrams.find((d) => d.practiceId === practiceId).name ===
      "Práctica QA actualizada",
  );
  await go("home", "Conecta herramientas y prácticas.");
  await page.getByRole("link", { name: "Registrar uso", exact: true }).click();
  await formValues({
    toolId,
    practiceId,
    description:
      "El equipo comparte resultados de pruebas para obtener retroalimentación y coordinar correcciones.",
  });
  await clickSave();
  await page
    .getByRole("heading", {
      name: "Del catálogo al trabajo en equipo.",
      exact: true,
    })
    .waitFor();
  const usageId = (await db()).usages.find(
    (u) => u.toolId === toolId && u.practiceId === practiceId,
  ).id;
  check("Registrar uso enlaza las entidades creadas", !!usageId);
  await go("usages/edit/" + usageId, "Actualizar relación de uso");
  await formValues({
    description:
      "Uso actualizado: automatizar la verificación y compartir evidencia con el equipo.",
  });
  await clickSave();
  await page
    .getByRole("heading", {
      name: "Del catálogo al trabajo en equipo.",
      exact: true,
    })
    .waitFor();
  check(
    "Actualizar uso conserva el ID y cambia la descripción",
    (await db()).usages
      .find((u) => u.id === usageId)
      .description.startsWith("Uso actualizado"),
  );
  await go("home", "Conecta herramientas y prácticas.");
  for (const [label, heading] of [
    ["Actualizar herramienta", "Herramientas DevOps"],
    ["Actualizar práctica", "Prácticas que dan sentido al proceso."],
    ["Actualizar uso", "Del catálogo al trabajo en equipo."],
  ]) {
    await page.getByRole("link", { name: label, exact: true }).click();
    await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    await go("home", "Conecta herramientas y prácticas.");
  }
  check("Las tres relaciones dinámicas de actualización abren sus catálogos");
  await page.reload();
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
  check(
    "La recarga mantiene los registros y no vuelve a la semilla",
    (await db()).tools.length === 145 && (await db()).practices.length === 15,
  );
  await context.close();
  context = await chromium.launchPersistentContext(
    path.join(temp, "profile"),
    contextOptions,
  );
  page = context.pages()[0] || (await context.newPage());
  observe(page);
  await go("tools/view/" + toolId, "Herramienta QA actualizada");
  check(
    "Cerrar y reabrir Chrome con el mismo perfil mantiene los datos",
    (await db()).usages.some((u) => u.id === usageId),
  );
  await go("tools/edit/" + toolId, "Actualizar herramienta");
  await formValues({ name: "GitHub" });
  await clickSave();
  await page.locator("#form-error").waitFor({ state: "visible" });
  check(
    "Se rechaza un nombre duplicado y se conserva el anterior",
    (await db()).tools.find((t) => t.id === toolId).name ===
      "Herramienta QA actualizada",
  );
  await formValues({ name: "Cambio cancelado" });
  await page.getByRole("link", { name: "Cancelar", exact: true }).click();
  check(
    "Cancelar no guarda cambios",
    (await db()).tools.find((t) => t.id === toolId).name ===
      "Herramienta QA actualizada",
  );
  await go("usages/new", "Registrar relación de uso");
  await formValues({
    toolId,
    practiceId,
    description: "Intento de duplicar una relación existente.",
  });
  await clickSave();
  await page.locator("#form-error").waitFor({ state: "visible" });
  check(
    "Se rechazan parejas herramienta-práctica duplicadas",
    (await db()).usages.length === 43,
  );
  await go("tools/new", "Registrar herramienta");
  await page.locator("#image-file").setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await page.locator("#form-error").waitFor({ state: "visible" });
  check(
    "Se rechazan archivos de imagen no admitidos",
    await page.locator("#form-error").isVisible(),
  );
  await go("backup", "Tus datos, contigo.");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descargar respaldo JSON", exact: true })
    .click();
  const download = await downloadPromise,
    backupPath = path.join(temp, "backup.json");
  await download.saveAs(backupPath);
  const exported = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  check(
    "La exportación incluye los cambios y las imágenes cargadas",
    exported.tools.length === 145 &&
      exported.practices
        .find((p) => p.id === practiceId)
        .image.startsWith("data:image/png"),
  );
  const beforeInvalid = await db();
  await page.locator("#backup-file").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("{bad json"),
  });
  await page.locator("#backup-error").waitFor({ state: "visible" });
  assert.deepEqual(await db(), beforeInvalid);
  check(
    "Un JSON inválido no modifica datos ni habilita restauración",
    await page.locator("#restore-data").isDisabled(),
  );
  await page
    .locator("#backup-file")
    .setInputFiles(path.join(root, "app/data/database.json"));
  await page.waitForFunction(() =>
    document
      .querySelector("#backup-summary")
      .textContent.startsWith("Archivo válido:"),
  );
  check(
    "Restaurar exige confirmación explícita",
    await page.locator("#restore-data").isDisabled(),
  );
  await page.locator("#confirm-restore").check();
  await page.locator("#restore-data").click();
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
  check(
    "Se puede restaurar la semilla completa",
    (await db()).tools.length === 144,
  );
  await go("backup", "Tus datos, contigo.");
  await restore(backupPath);
  assert.deepEqual(await db(), exported);
  check("Exportar y restaurar recupera exactamente la base editada");
  await page.evaluate(() =>
    localStorage.setItem("devops-atlas:v1", "{corrupto"),
  );
  await page.reload();
  await page
    .getByRole("heading", {
      name: "No se pudo abrir la base guardada",
      exact: true,
    })
    .waitFor();
  check(
    "La corrupción muestra recuperación y no borra la base",
    await page.evaluate(
      () => localStorage.getItem("devops-atlas:v1") === "{corrupto",
    ),
  );
  await restore(path.join(root, "app/data/database.json"));
  check(
    "La recuperación explícita restaura una base válida",
    (await db()).tools.length === 144,
  );
  await go("diagrams", "Prácticas que dan sentido al proceso.");
  assert.deepEqual(
    await page
      .locator("[data-nav]")
      .evaluateAll((links) => links.map((link) => link.dataset.nav)),
    ["home", "tools", "practices", "usages"],
  );
  check(
    "La antigua dirección de diagramas abre Prácticas con el menú simplificado",
    page.url().endsWith("#/practices"),
  );
  assert.deepEqual(
    (
      await page
        .locator(".diagram-thumb")
        .evaluateAll((images) =>
          images.map((image) => image.getAttribute("src")),
        )
    ).sort(),
    seed.diagrams.map((diagram) => diagram.image).sort(),
  );
  check("Prácticas conserva exactamente los 19 diagramas del curso");
  check(
    "Las 14 prácticas incluyen su diagrama en la ficha",
    (await page.locator("#practice-grid .diagram-thumb").count()) === 14,
  );
  check(
    "Los cinco diagramas de apoyo están disponibles dentro de Prácticas",
    (await page.locator("#support-grid .tool-card").count()) === 5,
  );
  for (const diagram of seed.diagrams.filter((d) => !d.practiceId)) {
    await page.locator(`[data-support="${diagram.id}"]`).first().click();
    assert.equal(
      await page.locator("#large-image").getAttribute("src"),
      diagram.image,
    );
    assert.equal(
      await page.locator("#image-title").textContent(),
      diagram.name,
    );
    assert.ok(
      (await page.locator("#image-caption").textContent()).includes("página"),
    );
    await page.keyboard.press("Escape");
  }
  await page.locator("#practice-grid [data-image]").first().click();
  check(
    "El diagrama se abre en un diálogo accesible",
    await page.getByRole("dialog").isVisible(),
  );
  await page.keyboard.press("Escape");
  check(
    "Escape cierra el diálogo",
    !(await page.getByRole("dialog").isVisible()),
  );
  await go(
    "practices/view/PR01",
    "Integración continua del sistema de software",
  );
  await page.screenshot({
    path: path.join(out, "practica-essence.png"),
    fullPage: true,
  });
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const [route, heading] of [
      ["home", "Conecta herramientas y prácticas."],
      ["tools", "Herramientas DevOps"],
      ["tools/new", "Registrar herramienta"],
      ["practices", "Prácticas que dan sentido al proceso."],
      ["usages", "Del catálogo al trabajo en equipo."],
      ["backup", "Tus datos, contigo."],
    ]) {
      await go(route, heading);
      check(
        `Sin desbordamiento horizontal: ${route} a ${width}px`,
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
    }
    if (width === 375) {
      await go("home", "Conecta herramientas y prácticas.");
      await page.locator("#notice").waitFor({ state: "hidden" });
      await page.screenshot({
        path: path.join(out, "inicio-movil.png"),
        fullPage: true,
      });
    }
  }
  await go("home", "Conecta herramientas y prácticas.");
  await page.reload();
  await page
    .getByRole("heading", {
      name: "Conecta herramientas y prácticas.",
      exact: true,
    })
    .waitFor();
  await page.keyboard.press("Tab");
  check(
    "El primer acceso por teclado permite saltar al contenido",
    await page.evaluate(() =>
      document.activeElement.classList.contains("skip"),
    ),
  );
  const assets = [
    ...seed.tools.map((t) => t.logo),
    ...seed.diagrams.map((d) => d.image),
  ];
  const invalid = await page.evaluate(async (assets) => {
    const result = await Promise.all(
      assets.map(
        (src) =>
          new Promise((resolve) => {
            const i = new Image();
            i.onload = () => resolve(null);
            i.onerror = () => resolve(src);
            i.src = src;
          }),
      ),
    );
    return result.filter(Boolean);
  }, assets);
  check("Chrome decodifica los 144 logos y 19 diagramas", invalid.length === 0);
  assert.deepEqual(errors, []);
  check("Sin excepciones de JavaScript en los recorridos probados");
  assert.deepEqual(failed, []);
  check("Sin recursos de la aplicación con errores HTTP");
  await context.close();
  const report = {
    status: "passed",
    date: new Date().toISOString(),
    browser: "Google Chrome " + browserVersion,
    baseURL: base,
    checks: results.length,
    results,
    scope: { tools: 144, practices: 14, diagrams: 19, usages: 42 },
    note: "Pruebas en perfil aislado. La publicación en Trello se verifica por separado.",
  };
  fs.writeFileSync(
    path.join(out, "pruebas-navegador.json"),
    JSON.stringify(report, null, 2),
  );
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
