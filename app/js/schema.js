import { escape as e } from "./ui.js";

export function renderSchema() {
  const branch = (type, label, attributes, detail = "") =>
    `<div class="branch" data-entity="${type}"><div class="connector"></div><div class="dynamic-row"><a class="dynamic-link" href="#/${type}/new" aria-label="Registrar ${label.toLowerCase()}">Registra</a><a class="dynamic-link" href="#/${type}" aria-label="Actualizar ${label.toLowerCase()}">Actualiza</a></div><div class="connector"></div><div class="concept" id="concept-${type}">${label}</div><div class="connector"></div><div class="relation-static">tiene</div><div class="connector"></div><div class="attributes">${attributes.map((a) => `<span class="attribute">${e(a)}</span>`).join("")}</div>${detail}</div>`;
  const edge = (from) =>
    `<g data-schema-edge="${from}-usages"><path class="schema-edge" marker-end="url(#schema-arrow)"></path><g class="schema-edge-label"><rect x="-22" y="-13" width="44" height="26" rx="22"></rect><text text-anchor="middle" dominant-baseline="central">tiene</text></g></g>`;
  return `<section class="panel"><div class="panel-heading"><h2>Esquema preconceptual del sistema</h2><div class="legend"><span><i class="key"></i>Concepto</span><span><i class="key dynamic"></i>Relación dinámica</span><span><i class="key static"></i>Relación estructural</span></div></div>
    <div class="schema" role="group" aria-label="Ingeniero DevOps registra y actualiza herramientas, usos y prácticas" aria-describedby="schema-description">
      <div class="schema-actor">Ingeniero DevOps</div><div class="schema-trunk"></div>
      <div class="branches">
        <svg class="schema-connections" aria-hidden="true" focusable="false"><defs><marker id="schema-arrow" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 8 4 L 0 8" fill="none" stroke="#2b7a70" stroke-width="1.2"></path></marker></defs>${edge("tools")}${edge("practices")}</svg>
        ${branch("tools", "Herramienta", ["Nombre", "Descripción", "Logo", "Modelo de precio", "Categoría"])}
        ${branch("usages", "Uso", ["Herramienta", "Práctica", "Descripción en cultura DevOps"])}
        ${branch("practices", "Práctica", ["Nombre", "Descripción", "Diagrama Essence"], '<div class="practice-diagram-detail"><div class="connector"></div><div class="relation-static">tiene</div><div class="connector"></div><div class="attributes"><span class="attribute">Imagen</span><span class="attribute">Fuente</span></div><span class="schema-context">Se consulta dentro de Prácticas</span></div>')}
      </div>
      <div class="schema-extensions"><div><span class="attribute">Categoría</span><span aria-hidden="true">→</span><span class="relation-static">tiene</span><span aria-hidden="true">→</span><span class="attribute">Nombre</span></div><div><span class="attribute">Modelo de precio</span><span aria-hidden="true">→</span><span class="relation-static">tiene</span><span aria-hidden="true">→</span><span class="attribute">Nombre</span></div></div>
      <p class="schema-note" id="schema-description">Las flechas de Herramienta y Práctica llegan a Uso: cada uso vincula una herramienta con una práctica y describe cómo se utiliza. El diagrama Essence es parte de la práctica y conserva su imagen y fuente. Categoría y Modelo de precio tienen nombre.</p>
    </div></section>`;
}

// Medir los conceptos mantiene las flechas unidas al cambiar el ancho o el tamaño de texto.
export function connectSchema(root) {
  if (!root) return () => {};
  const svg = root.querySelector(".schema-connections");
  const concepts = Object.fromEntries(
    ["tools", "usages", "practices"].map((type) => [
      type,
      root.querySelector(`#concept-${type}`),
    ]),
  );
  let frame = 0;
  const draw = () => {
    if (!root.isConnected) return;
    const bounds = root.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
    const boxes = Object.fromEntries(
      Object.entries(concepts).map(([type, el]) => {
        const box = el.getBoundingClientRect();
        return [
          type,
          {
            left: box.left - bounds.left,
            right: box.right - bounds.left,
            y: box.top - bounds.top + box.height / 2,
          },
        ];
      }),
    );
    const target = boxes.usages;
    const stacked = Math.abs(boxes.tools.y - target.y) > 10;
    for (const type of ["tools", "practices"]) {
      const source = boxes[type],
        left = type === "tools";
      const fromX = stacked
        ? left
          ? source.left
          : source.right
        : left
          ? source.right
          : source.left;
      const toX = left ? target.left : target.right;
      let path, labelX, labelY;
      if (stacked) {
        const lane = left ? 24 : bounds.width - 24;
        path = `M ${fromX} ${source.y} H ${lane} V ${target.y} H ${toX}`;
        labelX = lane;
        labelY = (source.y + target.y) / 2;
      } else {
        path = `M ${fromX} ${source.y} L ${toX} ${target.y}`;
        labelX = (fromX + toX) / 2;
        labelY = (source.y + target.y) / 2;
      }
      const group = svg.querySelector(`[data-schema-edge="${type}-usages"]`);
      group.querySelector("path").setAttribute("d", path);
      group
        .querySelector(".schema-edge-label")
        .setAttribute("transform", `translate(${labelX} ${labelY})`);
    }
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(root);
  for (const concept of Object.values(concepts)) observer.observe(concept);
  window.addEventListener("beforeprint", draw);
  window.addEventListener("afterprint", schedule);
  draw();
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("beforeprint", draw);
    window.removeEventListener("afterprint", schedule);
  };
}
