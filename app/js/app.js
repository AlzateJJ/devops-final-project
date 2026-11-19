import { $, intro, link, notify } from "./ui.js";
import { Database, STORAGE_KEY, EMPTY_KEY } from "./store.js";
import { renderTools } from "./tools.js";
import { renderPractices } from "./practices.js";
import { renderUsages } from "./usages.js";
import { renderBackup } from "./backup.js";
import { renderSchema, connectSchema } from "./schema.js";
const store = new Database();
let disconnectSchema = () => {};

const titles = {
  home: "Esquema del sistema",
  tools: "Herramientas",
  practices: "Prácticas",
  usages: "Relaciones de uso",
  backup: "Gestión de datos",
};
export function home(
  db = { tools: [], practices: [], diagrams: [], usages: [] },
) {
  return (
    intro(
      "Conecta herramientas y prácticas.",
      "Explora el esquema preconceptual. Selecciona una relación dinámica para registrar o actualizar información.",
      "",
      "EL MAPA DE TU ENTORNO DEVOPS",
    ) +
    (!db.tools.length &&
    !db.practices.length &&
    !db.diagrams.length &&
    !db.usages.length
      ? `<div class="info">El catálogo está vacío. Registra tus propios recursos desde el esquema o <a href="#/backup">restaura un respaldo en Gestión de datos</a>.</div>`
      : "") +
    `<div class="stats"><div class="stat"><b>${db.tools.length}</b><span>Herramientas</span></div><div class="stat"><b>${db.practices.length}</b><span>Prácticas</span></div><div class="stat"><b>${db.diagrams.length}</b><span>Diagramas en Prácticas</span></div><div class="stat"><b>${db.usages.length}</b><span>Relaciones de uso</span></div></div>
 ${renderSchema()}
 <div class="section-title"><h2>Un catálogo para aprender y construir</h2>${link("#/tools", "Explorar herramientas")}</div><p class="muted">Encuentra herramientas por categoría, consulta las prácticas del curso y descubre cómo se relacionan con la colaboración, la automatización y la retroalimentación continua.</p><div class="info">Los 120 modelos de precio de la tabla se conservan como referencia histórica. Para las 24 herramientas adicionales, la ficha incluye la fuente y fecha de su clasificación. Las marcas del curso se mantienen para facilitar su revisión.</div>`
  );
}
function route(moveFocus = true) {
  if (!store.data) return;
  disconnectSchema();
  const [section = "home", mode, id] = (
    location.hash.slice(2).split("?")[0] || "home"
  ).split("/");
  if (section === "diagrams") {
    location.replace("#/practices");
    return;
  }
  $("#breadcrumb").textContent = titles[section] || "Página";
  document.title = `${titles[section] || "Entrega Final DevOps"} · Entrega Final DevOps`;
  document.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.dataset.nav === section) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#nav-tools").textContent = store.data.tools.length;
  $("#nav-practices").textContent = store.data.practices.length;
  if (section === "home") {
    $("#main").innerHTML = home(store.data);
    disconnectSchema = connectSchema($(".branches"));
  } else if (section === "tools") renderTools(store, mode, id);
  else if (section === "practices") renderPractices(store, mode, id);
  else if (section === "usages") renderUsages(store, mode, id);
  else if (section === "backup") renderBackup(store);
  else
    $("#main").innerHTML = intro(
      "Página no encontrada",
      "La dirección no corresponde a una sección del catálogo.",
      link("#/home", "Volver al esquema"),
    );
  window.scrollTo(0, 0);
  if (moveFocus) $("#main").focus({ preventScroll: true });
}
$("#close-image").onclick = () => $("#image-dialog").close();
window.addEventListener("hashchange", route);
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY || event.key === EMPTY_KEY)
    notify("La base cambió en otra pestaña. Recarga antes de guardar.", true);
});
try {
  await store.init();
  route(false);
} catch (error) {
  renderBackup(store, error.message);
}
