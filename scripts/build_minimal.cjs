const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const { buildOffline } = require("./build_offline.cjs");

const root = path.resolve(__dirname, "..");
const files = ["index.html", "styles.css", "app.js"];

async function buildMinimal() {
  const full = await buildOffline();
  const output = path.join(root, "entrega", "minima");
  await fs.mkdir(output, { recursive: true });
  const icon = await fs.readFile(path.join(root, "app/assets/atlas.svg"));
  const iconURL = `data:image/svg+xml;base64,${icon.toString("base64")}`;
  const source = await fs.readFile(
    path.join(full.output, "index.html"),
    "utf8",
  );
  const inventoryLink =
    /<a href="inventario\/inventario\.html"[^>]*>\s*Inventario y fuentes<\/a\s*>/;
  assert.match(source, inventoryLink);
  const html = source
    .replace('href="app/styles.css"', 'href="styles.css"')
    .replaceAll('"app/assets/atlas.svg"', `"${iconURL}"`)
    .replace(
      '<script defer src="runtime/catalogo.js"></script>\n    <script defer src="runtime/app.js"></script>',
      '<script defer src="app.js"></script>',
    )
    .replace(inventoryLink, "");
  assert.ok(!html.includes("runtime/") && !html.includes("inventario/"));
  assert.ok(html.includes('<script defer src="app.js"></script>'));
  await fs.writeFile(path.join(output, "index.html"), html);
  await fs.copyFile(
    path.join(root, "app/styles.css"),
    path.join(output, "styles.css"),
  );
  const catalog = await fs.readFile(
    path.join(full.output, "runtime/catalogo.js"),
    "utf8",
  );
  const app = await fs.readFile(
    path.join(full.output, "runtime/app.js"),
    "utf8",
  );
  // La semilla se registra antes de iniciar la aplicación, igual que en la entrega completa.
  await fs.writeFile(path.join(output, "app.js"), `${catalog}\n;\n${app}`);
  return { output, files, resources: full.resources };
}

module.exports = { buildMinimal };
if (require.main === module)
  buildMinimal()
    .then((report) => console.log(JSON.stringify(report)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
