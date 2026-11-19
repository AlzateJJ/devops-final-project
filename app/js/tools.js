import { resourceURL } from "./resources.js";
import {
  $,
  escape as e,
  norm,
  intro,
  link,
  options,
  empty,
  notify,
  formShell,
  imageField,
  bindImageInput,
  formError,
  sourceLinks,
  externalLink,
} from "./ui.js";
import { newId } from "./store.js";
const category = (db, id) => db.categories.find((c) => c.id === id)?.name || id;
const price = (db, id) => db.prices.find((p) => p.id === id)?.name || id;
function card(t, db) {
  return `<article class="tool-card"><div class="body"><div class="logo-row"><img class="logo" src="${e(resourceURL(t.logo))}" alt="Logo de ${e(t.name)}" loading="lazy"><span class="tag">${e(t.id)}</span></div><h2>${e(t.name)}</h2><span class="tag green">${e(category(db, t.category))}</span><p class="clamp">${e(t.description)}</p></div><div class="card-actions"><a href="#/tools/view/${e(t.id)}">Ver ficha</a><a href="#/tools/edit/${e(t.id)}" aria-label="Editar ${e(t.name)}">Editar</a></div></article>`;
}
export function renderTools(store, mode, id) {
  const db = store.data;
  if (mode === "new" || mode === "edit") return form(store, id);
  if (mode === "view") return detail(db, id);
  $("#main").innerHTML =
    intro(
      "Herramientas DevOps",
      "Un catálogo del curso para descubrir qué hace cada herramienta y cómo se aplica.",
      link("#/tools/new", "Registrar herramienta", true),
      "CATÁLOGO DE HERRAMIENTAS",
    ) +
    `<div class="toolbar"><div class="search"><label for="search">Buscar herramienta</label><input id="search" type="search" placeholder="Nombre, alias o descripción"></div><div class="filter"><label for="category">Categoría</label><select id="category">${options(db.categories, "", "Todas las categorías")}</select></div></div><p class="result-count" id="result-count" aria-live="polite"></p><div id="tool-grid" class="grid"></div>`;
  function filter() {
    const q = norm($("#search").value),
      c = $("#category").value;
    const rows = db.tools.filter(
      (t) =>
        (!c || t.category === c) &&
        norm(
          [t.name, ...(t.aliases || []), t.description, t.id].join(" "),
        ).includes(q),
    );
    $("#result-count").textContent =
      `${rows.length} de ${db.tools.length} herramientas`;
    $("#tool-grid").innerHTML = rows.length
      ? rows.map((t) => card(t, db)).join("")
      : empty(
          "No hay coincidencias",
          "Prueba otro nombre o selecciona todas las categorías.",
        );
  }
  $("#search").oninput = filter;
  $("#category").onchange = filter;
  filter();
}
function detail(db, id) {
  const t = db.tools.find((t) => t.id === id);
  if (!t) {
    $("#main").innerHTML = empty(
      "Herramienta no encontrada",
      "Regresa al catálogo para seleccionar una herramienta existente.",
    );
    return;
  }
  const usages = db.usages.filter((u) => u.toolId === id);
  $("#main").innerHTML =
    `<p><a href="#/tools">Herramientas</a> / ${e(t.id)}</p><div class="detail-top"><img class="logo large" src="${e(resourceURL(t.logo))}" alt="Logo de ${e(t.name)}"><div><h1>${e(t.name)}</h1><span class="tag green">${e(category(db, t.category))}</span></div></div><div class="detail-grid"><div><section class="panel"><h2>Qué hace esta herramienta</h2><p class="detail-description">${e(t.description)}</p>${(t.notes || []).map((n) => `<p class="info">${e(n)}</p>`).join("")}${link(`#/tools/edit/${id}`, "Editar herramienta", true)}</section><section class="panel"><h2>Cómo se usa en las prácticas</h2>${usages.length ? usages.map((u) => `<h3><a href="#/practices/view/${e(u.practiceId)}">${e(db.practices.find((p) => p.id === u.practiceId)?.name)}</a></h3><p>${e(u.description)}</p><p><a href="#/usages/edit/${e(u.id)}">Editar relación</a></p>`).join("") : '<p class="muted">Todavía no hay relaciones de uso registradas para esta herramienta.</p>'}${link(`#/usages/new?tool=${id}`, "Registrar un uso")}</section></div><aside class="panel"><h2>Datos de la ficha</h2><dl class="meta-list"><dt>Modelo de precio registrado</dt><dd>${e(price(db, t.price))}</dd><dt>Precio transcrito del curso</dt><dd>${e(price(db, t.sourcePrice || "NS"))}</dd><dt>Categoría en la fuente</dt><dd>${e(category(db, t.sourceCategory || t.category))}</dd><dt>Otros nombres</dt><dd>${e((t.aliases || []).join(", ") || "Sin alias registrados")}</dd><dt>Origen del logo</dt><dd>${e(t.logoSource || "Imagen cargada en la aplicación")}</dd></dl><p class="help" style="margin-top:22px">La clasificación comercial del curso no es una cotización vigente.</p><h3>Fuentes del curso</h3>${sourceLinks(t.references, db.sources)}</aside></div>`;
  const verification = t.priceVerification;
  $("aside.panel").insertAdjacentHTML(
    "beforeend",
    `<h3 style="margin-top:24px">Información del producto</h3><p>${externalLink(t.officialURL, "Sitio o documentación del producto")}</p>${verification ? `<p class="help">Modelo adicional clasificado el ${e(verification.checked)}.</p><p>${externalLink(verification.source, "Fuente de la clasificación comercial")}</p>` : ""}`,
  );
}
function form(store, id) {
  const db = store.data,
    existing = id ? db.tools.find((t) => t.id === id) : null;
  if (id && !existing) {
    $("#main").innerHTML = empty(
      "Herramienta no encontrada",
      "El registro solicitado no existe.",
    );
    return;
  }
  const t = existing || {};
  $("#main").innerHTML =
    intro(
      existing ? "Actualizar herramienta" : "Registrar herramienta",
      "Completa los cinco datos de la ficha. Tus cambios se guardan en este navegador.",
      "",
      "HERRAMIENTAS",
    ) +
    formShell(
      `<div class="form-grid"><div class="field full"><label for="name">Nombre</label><input id="name" name="name" required maxlength="140" value="${e(t.name)}"></div><div class="field"><label for="category">Categoría de la tabla DevOps</label><select id="category" name="category" required>${options(db.categories, t.category)}</select></div><div class="field"><label for="price">Modelo de precio</label><select id="price" name="price" required>${options(db.prices, t.price)}</select><p class="help">Registra el modelo que conozcas; «No especificado» no significa gratuito.</p></div><div class="field full"><label for="description">Descripción</label><textarea id="description" name="description" required maxlength="12000" rows="6">${e(t.description)}</textarea><p class="help">Explica su función y qué tareas permite realizar.</p></div>${imageField("Logo de la herramienta", t.logo)}</div>`,
    );
  $("#cancel-form").href = existing ? `#/tools/view/${id}` : "#/tools";
  const getImage = bindImageInput(t.logo);
  $("#record-form").onsubmit = async (event) => {
    event.preventDefault();
    const button = $("button[type=submit]");
    button.disabled = true;
    try {
      const logo = await getImage();
      if (!logo) throw Error("Selecciona un logo para la herramienta.");
      const record = {
        ...t,
        id: t.id || newId("H"),
        name: $("#name").value.trim(),
        category: $("#category").value,
        price: $("#price").value,
        priceVerification:
          t.price === $("#price").value ? t.priceVerification : null,
        description: $("#description").value.trim(),
        logo,
        aliases: t.aliases || [],
        references: t.references || [],
        notes: t.notes || [],
        logoSource:
          logo === t.logo ? t.logoSource : "Imagen cargada por el usuario",
      };
      store.mutate((next) => {
        if (existing)
          next.tools[next.tools.findIndex((r) => r.id === id)] = record;
        else next.tools.push(record);
      });
      location.hash = `#/tools/view/${record.id}`;
      notify(existing ? "Herramienta actualizada." : "Herramienta registrada.");
    } catch (error) {
      formError(error.message);
    } finally {
      button.disabled = false;
    }
  };
}
