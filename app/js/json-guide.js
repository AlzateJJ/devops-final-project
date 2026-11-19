import { escape as e } from "./ui.js";
import { emptyDatabase, CATEGORIES, PRICES } from "./catalogs.js";
import { validateResources } from "./resources.js";

const code = (value) =>
  `<pre><code>${e(typeof value === "string" ? value : JSON.stringify(value, null, 2))}</code></pre>`;
const table = (rows) =>
  `<table><thead><tr><th scope="col">Campo</th><th scope="col">Qué debes escribir</th></tr></thead><tbody>${rows.map(([key, description]) => `<tr><th scope="row"><code>${e(key)}</code></th><td>${description}</td></tr>`).join("")}</tbody></table>`;
const catalogs = (rows) =>
  rows
    .map(({ id, name }) => `<li><code>${e(id)}</code> — ${e(name)}</li>`)
    .join("");

function template() {
  const db = emptyDatabase();
  db.meta.name = "Mi catálogo DevOps";
  db.resources = {};
  return db;
}
function example() {
  const db = template();
  // Imágenes de demostración generadas localmente: el ejemplo no depende de assets.
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e9f6f2";
  ctx.fillRect(0, 0, 400, 160);
  ctx.fillStyle = "#112e37";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Imagen de ejemplo", 30, 65);
  ctx.font = "16px sans-serif";
  ctx.fillText("Reemplázala por tu propio recurso", 30, 105);
  const image = canvas.toDataURL("image/png");
  db.tools = [
    {
      id: "TO01",
      name: "Herramienta de ejemplo",
      description:
        "Ejemplo para aprender la estructura del JSON. Sustituye estos datos por los de tu herramienta.",
      category: "CI",
      price: "FR",
      logo: "assets/logos/mi-logo.png",
    },
  ];
  db.practices = [
    {
      id: "PR01",
      name: "Práctica de ejemplo",
      description:
        "Describe aquí tu práctica y reemplaza la imagen de demostración por su diagrama Essence.",
      image: "assets/diagramas/mi-practica.png",
      diagramId: "DG01",
    },
  ];
  db.diagrams = [
    {
      id: "DG01",
      name: "Diagrama de ejemplo",
      type: "practica",
      image: "assets/diagramas/mi-practica.png",
      practiceId: "PR01",
    },
  ];
  db.usages = [
    {
      id: "US01",
      toolId: "TO01",
      practiceId: "PR01",
      description:
        "Explica cómo se utiliza la herramienta en esta práctica y qué aporta a la cultura DevOps.",
    },
  ];
  db.resources = {
    "assets/logos/mi-logo.png": image,
    "assets/diagramas/mi-practica.png": image,
  };
  return db;
}

export function openJSONGuide(trigger, downloadText) {
  const dialog = document.createElement("dialog");
  dialog.id = "json-guide";
  dialog.className = "json-guide";
  dialog.setAttribute("aria-labelledby", "json-guide-title");
  dialog.innerHTML = `<div class="dialog-top json-guide-top"><h2 id="json-guide-title">Cómo preparar tu JSON</h2><button id="close-json-guide" type="button" autofocus>Cerrar</button></div>
  <div class="json-guide-body">
    <p class="guide-lead">Un solo archivo puede guardar todo tu catálogo: los registros, sus imágenes y los PDF que uses como fuentes.</p>
    <div class="info"><strong>¿Tengo que incluir las imágenes en Base64?</strong> Sí, para que tu JSON propio funcione por sí solo. Base64 representa el contenido de un archivo como texto. Al restaurarlo, la aplicación reconstruye la imagen o el PDF. <strong>Los PDF son opcionales:</strong> si no usas fuentes, deja <code>sources: []</code> y omite las referencias.</div>
    <section aria-labelledby="json-start"><h3 id="json-start">1. Empieza con una plantilla válida</h3>
      <p>Descarga una de estas bases y ábrela en un editor de texto. Conserva los nombres de los campos en inglés, las comillas dobles y las listas de categorías y precios.</p>
      <div class="actions"><button type="button" id="download-json-template" class="primary">Descargar plantilla vacía</button><button type="button" id="download-json-example">Descargar ejemplo completo</button></div>
      <p class="help">La plantilla trae todas las colecciones vacías. El ejemplo incluye una herramienta, una práctica, un diagrama y una relación, con imágenes de demostración y sin PDF. Ambas descargas son JSON válidos. Reemplaza los datos y las imágenes del ejemplo por los tuyos.</p>
      <p>Si prefieres hacerlo desde la aplicación, registra tus herramientas y prácticas con los formularios y después descarga el respaldo: la conversión de sus imágenes se hace automáticamente.</p>
    </section>
    <section aria-labelledby="json-structure"><h3 id="json-structure">2. Entiende la estructura</h3>
      <p>El archivo contiene un objeto con estos campos. Mantén las colecciones aunque estén vacías, usando <code>[]</code>. Conserva <code>resources: {}</code> cuando no haya archivos que incluir.</p>
      ${table([
        ["version", "El número <code>1</code>, sin comillas."],
        [
          "meta",
          "Un objeto de información general. Puedes indicar <code>name</code> y <code>updatedAt</code>. La plantilla los incluye; no añadas <code>resourceBundle</code>, que es un identificador interno.",
        ],
        [
          "categories / prices",
          "Los catálogos de opciones. Conserva todas las entradas y sus IDs tal como vienen en la plantilla.",
        ],
        ["tools", "Lista de herramientas."],
        ["practices", "Lista de prácticas."],
        ["diagrams", "Lista de diagramas Essence y materiales de apoyo."],
        ["usages", "Lista de relaciones entre herramientas y prácticas."],
        [
          "sources",
          "Lista de documentos PDF usados como fuentes; puede estar vacía.",
        ],
        [
          "resources",
          "Objeto que asocia cada nombre de archivo usado por los registros con su contenido en Base64. Incluye todos los archivos referenciados y evita añadir archivos que ningún registro usa.",
        ],
      ])}
      <details><summary>Campos de herramientas, prácticas, diagramas y relaciones</summary>
        <h4>Herramienta · tools</h4>${table([
          ["id", "Identificador único, por ejemplo <code>TO01</code>."],
          ["name", "Nombre de hasta 140 caracteres."],
          ["description", "Descripción de hasta 12.000 caracteres."],
          [
            "category / price",
            "Un ID de categoría y un ID de precio de los catálogos de la plantilla, por ejemplo <code>CI</code> y <code>FR</code>.",
          ],
          [
            "logo",
            "Nombre de su imagen, por ejemplo <code>assets/logos/mi-logo.png</code>, con el mismo nombre como clave en <code>resources</code>.",
          ],
          [
            "references (opcional)",
            "Lista de referencias a fuentes. Cada entrada lleva <code>source</code> y <code>page</code>.",
          ],
          [
            "aliases / notes (opcionales)",
            "Listas de textos. Cada alias admite hasta 200 caracteres y cada nota hasta 3.000.",
          ],
        ])}
        <h4>Práctica · practices</h4>${table([
          [
            "id / name / description",
            "ID único, nombre de hasta 180 caracteres y descripción de hasta 12.000.",
          ],
          [
            "image",
            "Imagen del diagrama, por ejemplo <code>assets/diagramas/mi-practica.png</code>, incluida en <code>resources</code>.",
          ],
          [
            "diagramId (opcional)",
            "ID de su diagrama. Si lo incluyes, ese diagrama debe existir, enlazar de vuelta a la práctica y tener exactamente el mismo valor de <code>image</code>. El ejemplo muestra esta relación.",
          ],
          [
            "references (opcional)",
            "Referencias a los PDF de <code>sources</code>.",
          ],
        ])}
        <h4>Diagrama · diagrams</h4>${table([
          ["id / name", "ID único y nombre de hasta 200 caracteres."],
          [
            "type",
            "Uno de estos valores exactos: <code>practica</code>, <code>proceso</code>, <code>nucleo</code> o <code>notacion</code>.",
          ],
          ["image", "Nombre de la imagen incluida en <code>resources</code>."],
          [
            "practiceId (opcional)",
            "ID de la práctica asociada. Esa práctica debe tener <code>diagramId</code> apuntando a este diagrama y compartir su imagen. Omítelo para material de apoyo sin práctica asociada.",
          ],
          [
            "references (opcional)",
            "Referencias a los PDF de <code>sources</code>.",
          ],
        ])}
        <h4>Relación de uso · usages</h4>${table([
          ["id", "ID único de la relación."],
          [
            "toolId / practiceId",
            "IDs de una herramienta y una práctica que existan en el mismo JSON.",
          ],
          [
            "description",
            "Hasta 12.000 caracteres: describe cómo se utiliza la herramienta en la práctica y su aporte a DevOps.",
          ],
        ])}
      </details>
      <details><summary>Categorías y modelos de precio permitidos</summary><p>Usa estos códigos en los registros y conserva los objetos completos de <code>categories</code> y <code>prices</code> de la plantilla.</p><h4>Categorías</h4><ul class="guide-catalogs">${catalogs(CATEGORIES)}</ul><h4>Modelos de precio</h4><ul class="guide-catalogs">${catalogs(PRICES)}</ul></details>
    </section>
    <section aria-labelledby="json-files"><h3 id="json-files">3. Incluye tus imágenes y tus PDF</h3>
      <p>Por ejemplo, escribe <code>"logo": "assets/logos/mi-logo.png"</code> en tu herramienta. En <code>resources</code>, usa exactamente ese mismo nombre como clave y coloca el archivo codificado como valor.</p>
      <p><strong>No necesitas crear esas carpetas.</strong> En un respaldo completo, esos nombres identifican los archivos dentro del JSON. No uses rutas de tu equipo como <code>C:\\Fotos\\logo.png</code> ni enlaces de Internet.</p>
      ${code({ resources: { "assets/logos/mi-logo.png": "data:image/png;base64,BASE64_COMPLETO_DEL_LOGO", "assets/diagramas/mi-practica.png": "data:image/png;base64,BASE64_COMPLETO_DEL_DIAGRAMA", "../inventario/fuentes/P01.pdf": "data:application/pdf;base64,BASE64_COMPLETO_DEL_PDF" } })}
      <p class="help"><strong>El fragmento anterior es ilustrativo.</strong> Sustituye los textos <code>BASE64_COMPLETO_…</code> por el contenido real. Importarlo con esos marcadores dará error. Las descargas del paso 1 sí contienen JSON válidos.</p>
      <details><summary>Nombres de archivo, formatos y fuentes PDF</summary>
        <ul><li>Imágenes propias: PNG, JPEG o WebP. Usa nombres como <code>assets/logos/mi-logo.png</code> o <code>assets/diagramas/mi-practica.webp</code>. El nombre admite letras sin acentos, números, guion y guion bajo; sin espacios. Extensiones en minúsculas: <code>png</code>, <code>jpg</code>, <code>jpeg</code> o <code>webp</code>.</li>
        <li>El contenido debe comenzar con su tipo: <code>data:image/png;base64,</code>, <code>data:image/jpeg;base64,</code>, <code>data:image/webp;base64,</code> o <code>data:application/pdf;base64,</code>. Incluye todo el prefijo y la cadena, sin saltos de línea dentro del texto.</li>
        <li>Para PDF, esta versión admite nombres como <code>../inventario/fuentes/P01.pdf</code> y <code>../inventario/fuentes/P02.pdf</code>: la letra <code>P</code> seguida de dos cifras (00–99), opcionalmente <code>I</code> o <code>F</code>. También admite <code>../inventario/fuentes/supletorio.pdf</code>. Puedes asignar uno de esos nombres a tu documento; no tienes que cambiar el nombre del archivo original en tu equipo.</li>
        <li>Si varias fichas usan el mismo archivo, incluye una sola entrada en <code>resources</code>. No incluyas archivos sin uso: cada clave debe aparecer en un <code>logo</code>, un <code>image</code> o un <code>sources.file</code>.</li>
        <li>Los JSON anteriores sin <code>resources</code> dependen de los archivos que ya existan en el proyecto. Para un JSON propio portable, incluye siempre sus archivos.</li></ul>
        <h4>Cómo enlazar un PDF</h4><p>Añade el documento a <code>sources</code> y su Base64 a <code>resources</code>. Después puedes citarlo desde <code>references</code> en herramientas, prácticas o diagramas. Ejemplo de los fragmentos que debes incorporar:</p>
        ${code({ sources: [{ id: "FU01", name: "Mi documento de referencia", file: "../inventario/fuentes/P01.pdf" }] })}
        ${code({ references: [{ source: "FU01", page: 1 }] })}
        <p>El nombre de la fuente admite hasta 200 caracteres. <code>source</code> debe coincidir con su <code>id</code>; <code>page</code> es un número entero entre 1 y 10.000 y conviene que corresponda a una página real del documento. Si no tienes PDF, usa <code>sources: []</code> y omite <code>references</code> o déjalo como <code>[]</code>.</p>
      </details>
      <details id="json-converter"><summary>Ayuda: convertir un archivo a Base64</summary>
        <p>Elige un PNG, JPEG, WebP o PDF. Se convierte en este navegador, sin enviarlo a un servidor. Copia el resultado como valor de su entrada en <code>resources</code>, entre comillas dobles.</p>
        <label for="json-resource-file">Archivo para convertir</label><input id="json-resource-file" type="file" accept="image/png,image/jpeg,image/webp,application/pdf,.pdf">
        <p id="json-convert-status" role="status" class="help">Máximo 26 MB por archivo en esta ayuda.</p>
        <div id="json-convert-error" class="error" role="alert" hidden></div>
        <label for="json-base64">Contenido completo para resources</label><textarea id="json-base64" rows="4" readonly spellcheck="false" placeholder="Aquí aparecerá data:image/…;base64,… o data:application/pdf;base64,…"></textarea>
        <button type="button" id="copy-json-base64" disabled>Copiar contenido Base64</button>
      </details>
    </section>
    <section aria-labelledby="json-check"><h3 id="json-check">4. Revisa y restaura</h3>
      <ol><li>Guarda el archivo con extensión <code>.json</code>, codificación UTF-8 y comillas dobles. JSON no admite comentarios ni comas al final de una lista.</li><li>Descarga una copia de los datos actuales si quieres conservarlos.</li><li>Cierra esta guía, elige el archivo en <strong>Restaurar desde JSON</strong> y espera el mensaje <strong>Archivo válido</strong>.</li><li>Comprueba las cantidades, marca la confirmación y pulsa <strong>Restaurar base de datos</strong>.</li></ol>
      <div class="info"><strong>Restaurar reemplaza todo el catálogo; no combina los datos.</strong> No necesitas hacer flush antes. Una colección vacía en tu archivo quedará vacía después de restaurar. Si el archivo no supera la validación, la base actual se conserva.</div>
      <details><summary>Reglas, límites y errores frecuentes</summary>
        <ul><li>Los IDs tienen de 2 a 81 caracteres: empiezan con una letra sin acento y continúan con letras, números, guion o guion bajo. No se repiten dentro de una misma colección.</li><li>Los nombres de herramientas y prácticas no pueden repetirse en su colección; se comparan ignorando mayúsculas, acentos y espacios al inicio/final. Los nombres y descripciones obligatorios no pueden estar vacíos.</li><li>No repitas la misma pareja <code>toolId</code> + <code>practiceId</code> en dos relaciones; amplía su descripción existente.</li><li>Cada colección admite hasta 10.000 registros. El archivo JSON completo admite hasta 100 MB.</li><li>Cada valor codificado de <code>resources</code>, incluido el prefijo, admite hasta 35 MB de texto. La ayuda de conversión limita el archivo original a 26 MB. Base64 aumenta el tamaño del archivo aproximadamente un tercio.</li><li>También se acepta Base64 directamente en <code>logo</code> o <code>image</code>, con menos de 1.500.000 caracteres por campo. Para un JSON propio, usa preferiblemente <code>resources</code> como en el ejemplo: evita ocupar el espacio limitado de los registros con imágenes grandes.</li><li>Los formularios para cargar imágenes directamente en la aplicación mantienen su límite de 1 MB por imagen. El espacio disponible del navegador también puede impedir guardar un respaldo, aunque cumpla los límites del formato.</li></ul>
        ${table([
          [
            "Faltan recursos o hay archivos ajenos",
            "Comprueba que cada nombre de archivo usado por los registros tenga su clave idéntica en resources. Quita las claves que no se usan.",
          ],
          [
            "Imagen dañada / formato no admitido",
            "Vuelve a convertir el archivo completo. No cortes la cadena Base64 ni cambies su prefijo a otro formato. SVG y GIF propios no se admiten.",
          ],
          [
            "Referencia inexistente",
            "Revisa los IDs de herramientas, prácticas, diagramas y fuentes. Todos los enlaces deben apuntar a registros del mismo JSON.",
          ],
          [
            "Práctica y diagrama no sincronizados",
            "Usa el mismo image en ambos y enlaza practice.diagramId con diagram.id y diagram.practiceId con practice.id.",
          ],
          [
            "Catálogo de categorías o precios incompatible",
            "Recupera categories y prices de la plantilla; conserva las 14 categorías y los 6 modelos de precio.",
          ],
          [
            "Sin espacio / almacenamiento bloqueado",
            "Reduce el tamaño de las imágenes o revisa los permisos y el espacio del navegador. La aplicación informa el fallo sin confirmar una restauración que no ocurrió.",
          ],
        ])}
      </details>
    </section>
  </div>`;
  document.body.append(dialog);
  dialog.querySelector("#close-json-guide").onclick = () => dialog.close();
  dialog.addEventListener(
    "close",
    () => {
      dialog.remove();
      if (trigger.isConnected) trigger.focus();
    },
    { once: true },
  );
  dialog.querySelector("#download-json-template").onclick = () =>
    downloadText(JSON.stringify(template(), null, 2), "plantilla-devops.json");
  dialog.querySelector("#download-json-example").onclick = () =>
    downloadText(JSON.stringify(example(), null, 2), "ejemplo-devops.json");
  bindConverter(dialog);
  dialog.showModal();
}

function bindConverter(dialog) {
  const input = dialog.querySelector("#json-resource-file"),
    output = dialog.querySelector("#json-base64"),
    status = dialog.querySelector("#json-convert-status"),
    error = dialog.querySelector("#json-convert-error"),
    copy = dialog.querySelector("#copy-json-base64");
  let token = 0;
  input.onchange = async () => {
    const sequence = ++token,
      file = input.files[0];
    output.value = "";
    copy.disabled = true;
    error.hidden = true;
    if (!file) {
      status.textContent = "Elige un archivo para convertir.";
      return;
    }
    status.textContent = "Convirtiendo archivo…";
    try {
      if (
        !["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(
          file.type,
        )
      )
        throw Error("Elige un PNG, JPEG, WebP o PDF.");
      if (file.size > 26 * 1024 * 1024)
        throw Error(
          "Esta ayuda admite archivos de hasta 26 MB. Reduce el tamaño del archivo antes de convertirlo.",
        );
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(Error("No se pudo leer el archivo."));
        reader.readAsDataURL(file);
      });
      const pdf = file.type === "application/pdf";
      const path = pdf
        ? "../inventario/fuentes/P01.pdf"
        : "assets/logos/archivo.png";
      validateResources(
        { [path]: data },
        {
          tools: pdf ? [] : [{ logo: path }],
          practices: [],
          diagrams: [],
          sources: pdf ? [{ file: path }] : [],
        },
      );
      if (!pdf) {
        const image = new Image();
        image.src = data;
        try {
          await image.decode();
        } catch {
          throw Error("No se pudo leer la imagen. Elige un archivo válido.");
        }
      }
      if (sequence !== token || !dialog.isConnected) return;
      output.value = data;
      copy.disabled = false;
      status.textContent = `Listo: ${file.name}. Copia todo el contenido, incluido el prefijo data:. Convertirlo no modifica el catálogo.`;
    } catch (err) {
      if (sequence !== token || !dialog.isConnected) return;
      error.textContent = err.message;
      error.hidden = false;
      status.textContent = "El archivo no se ha convertido.";
    }
  };
  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent =
        "Contenido Base64 copiado. Pégalo entre comillas como valor del archivo en resources.";
    } catch {
      output.focus();
      output.select();
      status.textContent =
        "El navegador no permitió copiar automáticamente. El texto está seleccionado: usa Ctrl+C o la opción Copiar de tu dispositivo.";
    }
  };
}
