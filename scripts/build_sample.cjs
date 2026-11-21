const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const esbuild = require("esbuild");
const { createPortableSeed } = require("./build_offline.cjs");

const root = path.resolve(__dirname, "..");
const LIMIT = 5_000_000;
const PRACTICES = ["PR04", "PR05", "PR10"];

function selectSample(full) {
  const sample = structuredClone(full);
  const selected = new Set(PRACTICES);
  sample.practices = sample.practices.filter((p) => selected.has(p.id));
  assert.equal(sample.practices.length, PRACTICES.length);
  sample.usages = sample.usages.filter((u) => selected.has(u.practiceId));
  const tools = new Set(sample.usages.map((u) => u.toolId));
  sample.tools = sample.tools.filter((t) => tools.has(t.id));
  sample.diagrams = sample.diagrams.filter((d) => selected.has(d.practiceId));
  const sources = new Set(
    [sample.tools, sample.practices, sample.diagrams, sample.usages]
      .flat()
      .flatMap((record) => (record.references || []).map((ref) => ref.source)),
  );
  sample.sources = sample.sources.filter((s) => sources.has(s.id));
  delete sample.resources;
  delete sample.meta.resourceBundle;
  sample.meta.scope = `${sample.practices.length} prácticas de ejemplo con todas sus herramientas, relaciones de uso y diagramas asociados. Los PDF incluyen las páginas citadas por estas fichas.`;
  sample.meta.pricePolicy =
    "Se conserva la clasificación histórica y sus fuentes en cada herramienta seleccionada.";
  return sample;
}

async function buildSample(python = "python") {
  const temp = path.join(root, "entrega", "muestra-fuentes");
  const output = path.join(root, "entrega", "muestra");
  await fs.mkdir(temp, { recursive: true });
  await fs.mkdir(output, { recursive: true });
  const full = JSON.parse(
    await fs.readFile(path.join(root, "app/data/database.json"), "utf8"),
  );
  const sample = selectSample(full);
  const records = path.join(temp, "records.json");
  const pdfs = path.join(temp, "pdf-resources.json");
  await fs.writeFile(records, JSON.stringify(sample));
  execFileSync(
    python,
    [path.join(root, "scripts/sample_pdf_resources.py"), root, records, pdfs],
    {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const excerpts = JSON.parse(await fs.readFile(pdfs, "utf8"));
  sample.sources = excerpts.sources;
  const portable = await createPortableSeed(sample, excerpts.resources);
  const json = JSON.stringify(JSON.parse(portable), null, 2) + "\n";

  const icon = await fs.readFile(path.join(root, "app/assets/atlas.svg"));
  const iconURL = `data:image/svg+xml;base64,${icon.toString("base64")}`;
  const source = await fs.readFile(path.join(root, "app/index.html"), "utf8");
  const inventoryLink =
    /<a href="\.\.\/inventario\/inventario\.html"[^>]*>\s*Inventario y fuentes<\/a\s*>/;
  assert.match(source, inventoryLink);
  const html = source
    .replaceAll('"assets/atlas.svg"', `"${iconURL}"`)
    .replace(
      '<script type="module" src="js/app.js"></script>',
      '<script defer src="app.js"></script>',
    )
    .replace(inventoryLink, "");
  assert.ok(html.includes('<script defer src="app.js"></script>'));
  const runtime = await esbuild.build({
    absWorkingDir: root,
    entryPoints: ["app/js/app.js"],
    bundle: true,
    write: false,
    format: "iife",
    target: "chrome120",
    charset: "utf8",
    logLevel: "silent",
  });
  const js = `// Catálogo reducido y archivos para abrir el HTML sin servidor.\nglobalThis.__DEVOPS_INITIAL_DATA__ = ${portable};\n${runtime.outputFiles[0].text}`;
  for (const [name, content] of [
    ["app.js", js],
    ["Datos-DevOps.json", json],
  ])
    assert.ok(Buffer.byteLength(content) < LIMIT, `${name} supera 5 MB.`);
  await fs.writeFile(path.join(output, "index.html"), html);
  await fs.copyFile(
    path.join(root, "app/styles.css"),
    path.join(output, "styles.css"),
  );
  await fs.writeFile(path.join(output, "app.js"), js);
  await fs.writeFile(path.join(output, "Datos-DevOps.json"), json);
  const files = {};
  for (const name of [
    "index.html",
    "styles.css",
    "app.js",
    "Datos-DevOps.json",
  ])
    files[name] = (await fs.stat(path.join(output, name))).size;
  const report = {
    output,
    practices: sample.practices.map((p) => p.name),
    counts: Object.fromEntries(
      ["tools", "practices", "diagrams", "usages", "sources"].map((key) => [
        key,
        sample[key].length,
      ]),
    ),
    resources: Object.keys(JSON.parse(portable).resources).length,
    files,
    limitBytes: LIMIT,
  };
  await fs.writeFile(
    path.join(temp, "report.json"),
    JSON.stringify(report, null, 2),
  );
  return report;
}

module.exports = { buildSample, selectSample };
if (require.main === module) {
  const flag = process.argv.indexOf("--python");
  buildSample(flag === -1 ? "python" : process.argv[flag + 1])
    .then((report) => console.log(JSON.stringify(report)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
