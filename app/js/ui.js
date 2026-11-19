export const $ = (selector, root = document) => root.querySelector(selector);
export const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const norm = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function externalLink(url, label) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    return `<a href="${escape(parsed.href)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
  } catch {
    return "";
  }
}
export function notify(message, error = false) {
  const box = $("#notice");
  box.textContent = message;
  box.classList.toggle("error-notice", error);
  box.hidden = false;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => (box.hidden = true), 6500);
}
export const empty = (title, message) =>
  `<div class="empty"><h2>${escape(title)}</h2><p class="muted">${escape(message)}</p></div>`;
export const options = (rows, selected, blank = "Seleccionar…") =>
  `<option value="">${blank}</option>` +
  rows
    .map(
      (r) =>
        `<option value="${escape(r.id)}" ${r.id === selected ? "selected" : ""}>${escape(r.name)}</option>`,
    )
    .join("");
export function intro(
  title,
  description,
  actions = "",
  eyebrow = "ENTREGA FINAL DEVOPS",
) {
  return `<div class="intro"><div><p class="eyebrow">${escape(eyebrow)}</p><h1>${escape(title)}</h1><p>${escape(description)}</p></div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;
}
export const link = (href, text, primary = false) =>
  `<a class="button ${primary ? "primary" : ""}" href="${escape(href)}">${escape(text)}</a>`;
export function sourceLinks(refs = [], sources = []) {
  return (
    `<div class="source-links">` +
    refs
      .map((r) => {
        const s = sources.find((s) => s.id === r.source);
        return s
          ? `<a href="${escape(s.file)}#page=${Number(r.page)}" target="_blank" rel="noopener">${escape(s.id)} · p. ${Number(r.page)}</a>`
          : "";
      })
      .join("") +
    "</div>"
  );
}
export function showImage(src, name, caption = "") {
  const dialog = $("#image-dialog");
  $("#large-image").src = src;
  $("#large-image").alt = name;
  $("#image-title").textContent = name;
  $("#image-caption").textContent = caption;
  dialog.showModal();
}
export function formError(message) {
  const box = $("#form-error");
  box.textContent = message;
  box.hidden = false;
  box.focus();
}
export async function readImage(file) {
  if (!file) return null;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw Error("Elige una imagen PNG, JPEG o WebP.");
  if (file.size > 1024 * 1024)
    throw Error(
      "La imagen debe pesar como máximo 1 MB. Reduce su tamaño antes de cargarla.",
    );
  const data = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(Error("No se pudo leer la imagen."));
    r.readAsDataURL(file);
  });
  await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () =>
      reject(Error("El archivo no contiene una imagen válida."));
    img.src = data;
  });
  return data;
}
export function bindImageInput(current) {
  let value = current,
    reading = null,
    token = 0;
  const input = $("#image-file"),
    preview = $("#image-preview");
  input.addEventListener("change", () => {
    const sequence = ++token;
    reading = (async () => {
      try {
        const result = await readImage(input.files[0]);
        if (sequence !== token) return;
        if (result) {
          value = result;
          preview.src = result;
          preview.hidden = false;
          $("#form-error").hidden = true;
        }
      } catch (e) {
        if (sequence !== token) return;
        input.value = "";
        formError(e.message);
      } finally {
        if (sequence === token) reading = null;
      }
    })();
  });
  return async () => {
    while (reading) await reading;
    return value;
  };
}
export const formShell = (content) =>
  `<form id="record-form" class="panel form-panel"><div id="form-error" class="error" role="alert" tabindex="-1" hidden></div>${content}<div class="form-actions"><button class="primary" type="submit">Guardar</button><a class="button" id="cancel-form" href="#/home">Cancelar</a></div></form>`;
export const imageField = (label, current = "") =>
  `<div class="field full"><label for="image-file">${escape(label)}</label><input id="image-file" name="image" type="file" accept="image/png,image/jpeg,image/webp"><p class="help">PNG, JPEG o WebP · Máximo 1 MB. ${current ? "Si no eliges otro archivo, se conserva la imagen actual." : "Selecciona una imagen para completar el registro."}</p><img id="image-preview" class="preview" alt="Vista previa de la imagen" ${current ? `src="${escape(current)}"` : "hidden"}></div>`;
