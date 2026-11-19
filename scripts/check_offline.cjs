const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, ".."),
  directory = path.resolve(
    process.argv[2] || path.join(root, "entrega/navegador"),
  );
const entry = path.join(directory, "index.html");
if (!fs.existsSync(entry))
  throw Error(
    "Primero genera la entrega con npm run build:offline o indica la carpeta extraída del ZIP.",
  );
const output =
  process.env.DEVOPS_EVIDENCE_DIR || path.join(root, "evidencias/offline");
const env = {
  ...process.env,
  DEVOPS_TEST_URL: pathToFileURL(entry).href,
  DEVOPS_EVIDENCE_DIR: output,
};
for (const script of [
  "check_app.cjs",
  "check_backup.cjs",
  "check_json_guide.cjs",
]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: root,
    env,
    stdio: "inherit",
    timeout: 180000,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
const reports = [
  "pruebas-navegador.json",
  "pruebas-respaldos.json",
  "pruebas-guia-json.json",
].map((name) => JSON.parse(fs.readFileSync(path.join(output, name), "utf8")));
const summary = {
  status: "passed",
  date: new Date().toISOString(),
  entry: env.DEVOPS_TEST_URL,
  protocol: "file:",
  offline: true,
  checks: reports.reduce((sum, report) => sum + report.checks, 0),
  suites: reports.map((report) => ({
    checks: report.checks,
    status: report.status,
  })),
  note: "Se utilizan perfiles aislados con la conexión desactivada. Ninguna suite inicia un servidor.",
};
fs.writeFileSync(
  path.join(output, "resumen.json"),
  JSON.stringify(summary, null, 2),
);
console.log(JSON.stringify(summary, null, 2));
