import { $, escape as e, intro, notify } from "./ui.js";
import { parseDatabase } from "./store.js";
import { createPortableBackup, checkImages } from "./portable.js";
import { MAX_BACKUP_BYTES } from "./resources.js";
export function downloadText(text, filename) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function renderBackup(store, recoveryMessage = "") {
  const db = store.data;
  $("#main").innerHTML =
    intro(
      "Tus datos, contigo.",
      "Descarga una copia completa, restaura tus recursos o comienza con un catálogo vacío.",
      "",
      "GESTIÓN DE DATOS",
    ) +
    (recoveryMessage
      ? `<div class="error" role="alert"><h2>No se pudo abrir la base guardada</h2><p>${e(recoveryMessage)}</p><p>Conserva los datos originales antes de restaurar un respaldo válido o vaciar el catálogo.</p></div>`
      : "") +
    `<div class="info">Tus cambios se conservan en este navegador. El respaldo completo reúne los registros, las imágenes y los PDF de referencia en un solo JSON; no necesitas descargar una carpeta adicional.</div>
    <div class="backup-grid">
      <section class="panel"><h2>Exportar una copia</h2>
        <p>${db ? `Incluye ${db.tools.length} herramientas, ${db.practices.length} prácticas, ${db.diagrams.length} diagramas y ${db.usages.length} relaciones, con sus logos, imágenes y documentos de referencia.` : "Descarga los registros originales antes de intentar una recuperación. Esta copia de emergencia puede necesitar los archivos de un respaldo completo anterior."}</p>
        <button id="export-data" class="primary">${db ? "Descargar respaldo JSON" : "Descargar datos originales"}</button>
        <p id="export-status" class="help" role="status">${db ? "La descarga puede tardar unos segundos mientras se incluyen todos los archivos." : ""}</p>
      </section>
      <section class="panel"><h2>Restaurar desde JSON</h2>
        <p>Reemplaza el catálogo actual con los datos y archivos de tu respaldo.</p>
        <label for="backup-file">Archivo de respaldo</label><input id="backup-file" type="file" accept="application/json,.json">
        <p class="help">Entrega Final DevOps versión 1 · Máximo 100 MB.</p>
        <p id="backup-summary" role="status"></p><div id="backup-error" class="error" role="alert" tabindex="-1" hidden></div>
        <label class="check-label"><input id="confirm-restore" type="checkbox"><span>He conservado los datos que necesito y confirmo que este archivo reemplazará la base actual.</span></label>
        <button id="restore-data" class="primary" disabled>Restaurar base de datos</button>
      </section>
      <section class="panel danger-panel"><h2>Vaciar información</h2>
        <p>Elimina todas las herramientas, prácticas, diagramas, relaciones y archivos que hayas guardado en esta aplicación.</p>
        <p>El catálogo permanecerá vacío al recargar. Podrás agregar tus recursos o restaurar un respaldo JSON.</p>
        <p class="help">Descarga primero un respaldo si quieres recuperar la información. El vaciado no se puede deshacer sin una copia.</p>
        <label class="check-label"><input id="confirm-flush" type="checkbox"><span>Confirmo que quiero borrar toda la información de esta aplicación en este navegador.</span></label>
        <button id="flush-data" class="danger" disabled>Vaciar información</button>
        <div id="flush-error" class="error" role="alert" tabindex="-1" hidden></div>
      </section>
    </div>`;
  // Conservar referencias evita afectar otra página si se navega durante una descarga.
  const exportButton = $("#export-data"),
    exportStatus = $("#export-status"),
    fileInput = $("#backup-file"),
    summary = $("#backup-summary"),
    errorBox = $("#backup-error"),
    restoreCheck = $("#confirm-restore"),
    restoreButton = $("#restore-data"),
    flushCheck = $("#confirm-flush"),
    flushButton = $("#flush-data"),
    flushError = $("#flush-error");
  let candidate = null,
    token = 0,
    busy = false;
  const update = () => {
    exportButton.disabled =
      busy || store.busy || (!db && store.snapshot === null);
    fileInput.disabled =
      restoreCheck.disabled =
      flushCheck.disabled =
        busy || store.busy;
    restoreButton.disabled =
      busy || store.busy || !candidate || !restoreCheck.checked;
    flushButton.disabled = busy || store.busy || !flushCheck.checked;
  };
  const showError = (box, message) => {
    box.textContent = message;
    box.hidden = false;
    box.focus();
  };
  const finish = (message) => {
    notify(store.cleanupWarning || message, Boolean(store.cleanupWarning));
    location.hash = "#/home";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  restoreCheck.onchange = flushCheck.onchange = update;
  exportButton.onclick = async () => {
    if (busy || store.busy) return;
    busy = true;
    update();
    try {
      const raw = db
        ? await createPortableBackup(
            store.data,
            store.resources,
            (done, total) => {
              exportStatus.textContent = `Preparando archivos: ${done} de ${total}…`;
            },
          )
        : store.snapshot;
      downloadText(
        raw,
        `entrega-final-devops-${db ? "respaldo" : "recuperacion"}-${new Date().toISOString().slice(0, 10)}.json`,
      );
      exportStatus.textContent = db
        ? "Respaldo completo descargado: incluye los registros y sus archivos."
        : "Copia de los datos originales descargada.";
      notify(exportStatus.textContent);
    } catch (error) {
      exportStatus.textContent = error.message;
      notify(error.message, true);
    } finally {
      busy = false;
      update();
    }
  };
  fileInput.onchange = async () => {
    const current = ++token;
    candidate = null;
    restoreCheck.checked = false;
    errorBox.hidden = true;
    summary.textContent = "";
    update();
    const file = fileInput.files[0];
    if (!file) return;
    busy = true;
    update();
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw Error("El respaldo supera el máximo de 100 MB.");
      const raw = await file.text(),
        parsed = parseDatabase(raw);
      if (parsed.meta.resourceBundle && !parsed.resources)
        throw Error(
          "El archivo depende de recursos internos. Elige un respaldo completo descargado desde Gestión de datos.",
        );
      summary.textContent = "Validando imágenes del respaldo…";
      await checkImages(parsed, parsed.resources);
      if (current !== token) return;
      candidate = raw;
      summary.textContent = `Archivo válido: ${parsed.tools.length} herramientas, ${parsed.practices.length} prácticas, ${parsed.diagrams.length} diagramas y ${parsed.usages.length} relaciones.${parsed.resources ? " Incluye sus archivos." : " Formato anterior: utiliza los archivos que vienen con el proyecto."}`;
    } catch (error) {
      if (current !== token) return;
      showError(errorBox, error.message);
      summary.textContent = "El archivo no se ha importado.";
    } finally {
      if (current === token) {
        busy = false;
        update();
      }
    }
  };
  restoreButton.onclick = async () => {
    if (busy || store.busy || !candidate || !restoreCheck.checked) return;
    busy = true;
    update();
    try {
      await store.restore(candidate);
      finish(
        "Base restaurada correctamente, con todos los archivos incluidos en el respaldo.",
      );
    } catch (error) {
      showError(errorBox, error.message);
    } finally {
      busy = false;
      update();
    }
  };
  flushButton.onclick = async () => {
    if (busy || store.busy || !flushCheck.checked) return;
    busy = true;
    update();
    flushError.hidden = true;
    try {
      await store.flush();
      finish(
        "Información eliminada. El catálogo está vacío y puedes cargar tus propios recursos.",
      );
    } catch (error) {
      showError(flushError, error.message);
    } finally {
      busy = false;
      update();
    }
  };
  update();
}
