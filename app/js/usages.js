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
  formError,
} from "./ui.js";
import { newId } from "./store.js";
export function renderUsages(store, mode, id) {
  const db = store.data;
  if (mode === "new" || mode === "edit") return form(store, id);
  $("#main").innerHTML =
    intro(
      "Del catálogo al trabajo en equipo.",
      "Relaciona herramientas con prácticas y explica su aporte a la cultura DevOps.",
      link("#/usages/new", "Registrar uso", true),
      "RELACIONES DE USO",
    ) +
    `<div class="toolbar"><div class="search"><label for="search">Buscar en las relaciones</label><input id="search" type="search" placeholder="Texto del uso o nombre de herramienta"></div><div class="filter"><label for="tool-filter">Herramienta</label><select id="tool-filter">${options(db.tools, "", "Todas las herramientas")}</select></div><div class="filter"><label for="practice-filter">Práctica</label><select id="practice-filter">${options(db.practices, "", "Todas las prácticas")}</select></div></div><p class="result-count" id="result-count" aria-live="polite"></p><div id="usage-list" class="usage-list"></div>`;
  function filter() {
    const q = norm($("#search").value),
      tool = $("#tool-filter").value,
      practice = $("#practice-filter").value,
      rows = db.usages.filter(
        (u) =>
          (!tool || u.toolId === tool) &&
          (!practice || u.practiceId === practice) &&
          norm(
            [
              u.description,
              db.tools.find((t) => t.id === u.toolId).name,
              db.practices.find((p) => p.id === u.practiceId).name,
            ].join(" "),
          ).includes(q),
      );
    $("#result-count").textContent =
      `${rows.length} de ${db.usages.length} relaciones de uso`;
    $("#usage-list").innerHTML = rows.length
      ? rows
          .map((u) => {
            const t = db.tools.find((t) => t.id === u.toolId),
              p = db.practices.find((p) => p.id === u.practiceId);
            return `<article class="usage-card"><span class="tag green">${e(u.id)}</span><h2 style="margin-top:12px"><a href="#/tools/view/${e(t.id)}">${e(t.name)}</a> <span class="muted">en</span> <a href="#/practices/view/${e(p.id)}">${e(p.name)}</a></h2><p>${e(u.description)}</p><div class="usage-meta"><span class="help">Colaboración · Automatización · Retroalimentación</span><a class="button" href="#/usages/edit/${e(u.id)}">Editar uso</a></div></article>`;
          })
          .join("")
      : empty(
          "No hay relaciones para estos filtros",
          "Cambia los filtros o registra cómo se aplica una herramienta a una práctica.",
        );
  }
  $("#search").oninput = filter;
  $("#tool-filter").onchange = filter;
  $("#practice-filter").onchange = filter;
  filter();
}
function form(store, id) {
  const db = store.data,
    existing = id ? db.usages.find((u) => u.id === id) : null;
  if (id && !existing) {
    $("#main").innerHTML = empty(
      "Relación no encontrada",
      "Regresa al catálogo de relaciones de uso.",
    );
    return;
  }
  if (!db.tools.length || !db.practices.length) {
    $("#main").innerHTML = intro(
      "Primero prepara el catálogo",
      "Necesitas al menos una herramienta y una práctica para relacionarlas.",
      link("#/tools/new", "Registrar herramienta") +
        link("#/practices/new", "Registrar práctica"),
    );
    return;
  }
  const query = new URLSearchParams(location.hash.split("?")[1] || ""),
    u = existing || {
      toolId: query.get("tool"),
      practiceId: query.get("practice"),
    };
  $("#main").innerHTML =
    intro(
      existing ? "Actualizar relación de uso" : "Registrar relación de uso",
      "Explica cómo una herramienta apoya una práctica y mejora la forma de trabajar.",
      "",
      "CULTURA DEVOPS",
    ) +
    formShell(
      `<div class="form-grid"><div class="field full"><label for="toolId">Herramienta</label><select id="toolId" name="toolId" required>${options(db.tools, u.toolId)}</select></div><div class="field full"><label for="practiceId">Práctica</label><select id="practiceId" name="practiceId" required>${options(db.practices, u.practiceId)}</select></div><div class="field full"><label for="description">Descripción del uso en cultura DevOps</label><textarea id="description" name="description" required maxlength="12000" rows="8" aria-describedby="usage-help">${e(u.description)}</textarea><p class="help" id="usage-help">Describe una actividad concreta, cómo se utiliza la herramienta y qué aporta a la colaboración, automatización, retroalimentación o trazabilidad. Por ejemplo: ejecutar pruebas en cada cambio para compartir resultados y detectar errores antes de integrar.</p></div></div>`,
    );
  $("#cancel-form").href = "#/usages";
  $("#record-form").onsubmit = (event) => {
    event.preventDefault();
    try {
      const record = {
        id: u.id || newId("U"),
        toolId: $("#toolId").value,
        practiceId: $("#practiceId").value,
        description: $("#description").value.trim(),
      };
      store.mutate((next) => {
        if (existing)
          next.usages[next.usages.findIndex((r) => r.id === id)] = record;
        else next.usages.push(record);
      });
      location.hash = "#/usages";
      notify(
        existing ? "Relación actualizada." : "Relación de uso registrada.",
      );
    } catch (error) {
      formError(error.message);
    }
  };
}
