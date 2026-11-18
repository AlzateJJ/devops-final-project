import {
  $,
  escape as e,
  norm,
  intro,
  link,
  empty,
  notify,
  formShell,
  imageField,
  bindImageInput,
  formError,
  sourceLinks,
  showImage,
  options,
} from "./ui.js";
import { newId } from "./store.js";
const types = {
  practica: "Práctica",
  proceso: "Proceso de apoyo",
  nucleo: "Núcleo Essence",
  notacion: "Notación",
};
export function renderPractices(store, mode, id) {
  const db = store.data;
  if (mode === "new" || mode === "edit") return form(store, id);
  if (mode === "view") return detail(db, id);
  $("#main").innerHTML =
    intro(
      "Prácticas que dan sentido al proceso.",
      "Conoce las actividades, objetivos y diagramas Essence que conectan el trabajo del equipo.",
      link("#/practices/new", "Registrar práctica", true),
      "PRÁCTICAS DEL CURSO",
    ) +
    `<div class="toolbar"><div class="search"><label for="search">Buscar práctica</label><input id="search" type="search" placeholder="Nombre o descripción"></div></div><p class="result-count" id="result-count" aria-live="polite"></p><div class="grid" id="practice-grid"></div>`;
  function filter() {
    const q = norm($("#search").value),
      rows = db.practices.filter((p) =>
        norm(
          p.name + " " + p.description + " " + (p.originalName || ""),
        ).includes(q),
      );
    $("#result-count").textContent =
      `${rows.length} de ${db.practices.length} prácticas`;
    $("#practice-grid").innerHTML = rows.length
      ? rows
          .map(
            (p) =>
              `<article class="tool-card practice-card"><button class="image-button" data-image="${e(p.id)}" aria-label="Ampliar diagrama: ${e(p.name)}"><img class="diagram-thumb" src="${e(p.image)}" alt="Diagrama Essence de ${e(p.name)}" loading="lazy"></button><div class="body"><span class="tag green">${e(p.id)} · Essence</span><h2>${e(p.name)}</h2><p class="clamp">${e(p.description)}</p></div><div class="card-actions"><a href="#/practices/view/${e(p.id)}">Ver práctica</a><a href="#/practices/edit/${e(p.id)}" aria-label="Editar ${e(p.name)}">Editar</a></div></article>`,
          )
          .join("")
      : empty(
          "No hay coincidencias",
          "Busca otra práctica o registra una nueva.",
        );
  }
  $("#search").oninput = filter;
  $("#practice-grid").onclick = (event) => {
    const b = event.target.closest("[data-image]");
    if (b) {
      const p = db.practices.find((p) => p.id === b.dataset.image);
      showImage(p.image, p.name);
    }
  };
  filter();
}
function detail(db, id) {
  const p = db.practices.find((p) => p.id === id);
  if (!p) {
    $("#main").innerHTML = empty(
      "Práctica no encontrada",
      "Regresa al catálogo para seleccionar una práctica.",
    );
    return;
  }
  const usages = db.usages.filter((u) => u.practiceId === p.id);
  $("#main").innerHTML =
    `<p><a href="#/practices">Prácticas</a> / ${e(p.id)}</p>` +
    intro(
      p.name,
      p.originalName || "Práctica registrada en este navegador",
      link(`#/practices/edit/${p.id}`, "Editar práctica", true),
      "PRÁCTICA ESSENCE",
    ) +
    `<section class="panel"><h2>Descripción de la práctica</h2><p class="detail-description">${e(p.description)}</p><button id="expand-diagram" class="image-button" aria-label="Ampliar diagrama de la práctica"><img class="diagram-full" src="${e(p.image)}" alt="Diagrama Essence de ${e(p.name)}"></button><p class="help">Selecciona la imagen para ampliarla. ${e(p.imageSource || "")}</p>${sourceLinks(p.references, db.sources)}</section><section class="panel"><div class="panel-heading"><h2>Herramientas en esta práctica</h2>${link(`#/usages/new?practice=${p.id}`, "Registrar uso")}</div>${
      usages.length
        ? usages
            .map((u) => {
              const t = db.tools.find((t) => t.id === u.toolId);
              return `<h3><a href="#/tools/view/${e(t.id)}">${e(t.name)}</a></h3><p>${e(u.description)}</p><p><a href="#/usages/edit/${e(u.id)}">Editar relación de uso</a></p>`;
            })
            .join("")
        : '<p class="muted">Esta práctica todavía no tiene herramientas relacionadas.</p>'
    }</section>`;
  $("#expand-diagram").onclick = () =>
    showImage(p.image, p.name, p.imageSource || "");
}
function form(store, id) {
  const db = store.data,
    existing = id ? db.practices.find((p) => p.id === id) : null;
  if (id && !existing) {
    $("#main").innerHTML = empty(
      "Práctica no encontrada",
      "El registro solicitado no existe.",
    );
    return;
  }
  const p = existing || {};
  $("#main").innerHTML =
    intro(
      existing ? "Actualizar práctica" : "Registrar práctica",
      "Describe la práctica e incorpora su diagrama Essence.",
      "",
      "PRÁCTICAS",
    ) +
    formShell(
      `<div class="form-grid"><div class="field full"><label for="name">Nombre</label><input id="name" name="name" required maxlength="180" value="${e(p.name)}"></div><div class="field full"><label for="description">Descripción</label><textarea id="description" name="description" required maxlength="12000" rows="7">${e(p.description)}</textarea><p class="help">Explica las actividades y el objetivo que representa el diagrama.</p></div>${imageField("Imagen del diagrama Essence", p.image)}</div>`,
    );
  $("#cancel-form").href = existing
    ? `#/practices/view/${p.id}`
    : "#/practices";
  const getImage = bindImageInput(p.image);
  $("#record-form").onsubmit = async (event) => {
    event.preventDefault();
    const button = $("button[type=submit]");
    button.disabled = true;
    try {
      const image = await getImage();
      if (!image) throw Error("Selecciona la imagen del diagrama Essence.");
      const record = {
        ...p,
        id: p.id || newId("PR"),
        name: $("#name").value.trim(),
        description: $("#description").value.trim(),
        image,
        diagramId: p.diagramId || newId("D"),
        references: p.references || [],
        imageSource:
          image === p.image ? p.imageSource : "Imagen cargada por el usuario",
      };
      store.mutate((next) => {
        if (existing)
          next.practices[next.practices.findIndex((r) => r.id === id)] = record;
        else next.practices.push(record);
        const d = next.diagrams.find((d) => d.id === record.diagramId);
        if (d) {
          d.name = record.name;
          d.image = image;
        } else
          next.diagrams.push({
            id: record.diagramId,
            name: record.name,
            type: "practica",
            practiceId: record.id,
            image,
            references: [],
          });
      });
      location.hash = `#/practices/view/${record.id}`;
      notify(existing ? "Práctica actualizada." : "Práctica registrada.");
    } catch (error) {
      formError(error.message);
    } finally {
      button.disabled = false;
    }
  };
}
export function renderDiagrams(store) {
  const db = store.data;
  $("#main").innerHTML =
    intro(
      "El lenguaje visual de las prácticas.",
      "Explora los diagramas de prácticas, el proceso de pruebas y los elementos de apoyo del núcleo Essence.",
      "",
      "BIBLIOTECA ESSENCE",
    ) +
    `<div class="toolbar"><div class="search"><label for="search">Buscar diagrama</label><input id="search" type="search" placeholder="Nombre del diagrama"></div><div class="filter"><label for="diagram-type">Tipo</label><select id="diagram-type">${options(
      Object.entries(types).map(([id, name]) => ({ id, name })),
      "",
      "Todos los tipos",
    )}</select></div></div><p class="result-count" id="result-count" aria-live="polite"></p><div id="diagram-grid" class="grid"></div>`;
  function filter() {
    const q = norm($("#search").value),
      type = $("#diagram-type").value,
      rows = db.diagrams.filter(
        (d) =>
          (!type || d.type === type) && norm(d.name + " " + d.id).includes(q),
      );
    $("#result-count").textContent =
      `${rows.length} de ${db.diagrams.length} diagramas`;
    $("#diagram-grid").innerHTML = rows.length
      ? rows
          .map(
            (d) =>
              `<article class="tool-card"><button class="image-button" data-image="${e(d.id)}" aria-label="Ampliar ${e(d.name)}"><img class="diagram-thumb" src="${e(d.image)}" alt="${e(d.name)}" loading="lazy"></button><div class="body"><span class="tag">${e(types[d.type])}</span><h2>${e(d.name)}</h2>${sourceLinks(d.references, db.sources)}</div><div class="card-actions"><button data-image="${e(d.id)}">Ampliar</button>${d.practiceId ? `<a href="#/practices/view/${e(d.practiceId)}">Ver práctica</a>` : '<span class="muted">Material de apoyo</span>'}</div></article>`,
          )
          .join("")
      : empty("No hay coincidencias", "Prueba otro nombre o tipo de diagrama.");
  }
  $("#search").oninput = filter;
  $("#diagram-type").onchange = filter;
  $("#diagram-grid").onclick = (event) => {
    const b = event.target.closest("[data-image]");
    if (b) {
      const d = db.diagrams.find((d) => d.id === b.dataset.image);
      showImage(
        d.image,
        d.name,
        (d.references || [])
          .map((r) => `${r.source}, página ${r.page}`)
          .join(" · "),
      );
    }
  };
  filter();
}
