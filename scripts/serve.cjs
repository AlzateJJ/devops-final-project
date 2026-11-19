const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const args = process.argv.slice(2);
const arg = (key, fallback) =>
  args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const root = path.resolve(arg("--directory", path.join(__dirname, "..")));
const port = Number(arg("--port", "8765"));
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Puerto inválido.");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};
const server = http.createServer(async (req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405);
    res.end("Método no admitido");
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (pathname === "/") {
      res.writeHead(302, { Location: "/app/" });
      res.end();
      return;
    }
    const filePath = path.resolve(root, "." + pathname);
    const relative = path.relative(root, filePath);
    if (
      relative.startsWith("..") ||
      path.isAbsolute(relative) ||
      relative
        .split(path.sep)
        .some(
          (part) =>
            part.startsWith(".") || ["node_modules", "tmp"].includes(part),
        )
    ) {
      res.writeHead(403);
      res.end("Ruta no disponible");
      return;
    }
    const stat = await fs.stat(filePath);
    const target = stat.isDirectory()
      ? path.join(filePath, "index.html")
      : filePath;
    if (stat.isDirectory() && !pathname.endsWith("/")) {
      res.writeHead(302, { Location: pathname + "/" });
      res.end();
      return;
    }
    const body = await fs.readFile(target);
    res.writeHead(200, {
      "Content-Type": types[path.extname(target)] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (error) {
    res.writeHead(error.code === "ENOENT" ? 404 : 400);
    res.end("Recurso no disponible");
  }
});
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `El puerto ${port} está ocupado. Si ya abriste el proyecto, visita http://127.0.0.1:${port}/app/ .`
      : error.message,
  );
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}/app/`;
  console.log(
    `Entrega Final DevOps: ${url}\nMantén esta ventana abierta. Ctrl+C detiene el servidor local.`,
  );
  if (args.includes("--open") && process.platform === "win32")
    spawn("cmd", ["/c", "start", "", url], {
      windowsHide: true,
      stdio: "ignore",
    }).on("error", () => {});
});
