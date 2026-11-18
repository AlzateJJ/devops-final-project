import {$,escape,intro,link,notify} from './ui.js';
import {Database,STORAGE_KEY} from './store.js';
import {renderTools} from './tools.js';
const store=new Database();

const titles={home:'Esquema del sistema',tools:'Herramientas',practices:'Prácticas',usages:'Relaciones de uso',diagrams:'Diagramas Essence',backup:'Respaldo de datos'};
export function home(db={tools:[],practices:[],diagrams:[],usages:[]}){
 const branch=(type,label,attributes)=>`<div class="branch"><div class="connector"></div><div class="dynamic-row"><a class="dynamic-link" href="#/${type}/new" aria-label="Registrar ${label.toLowerCase()}">Registra</a><a class="dynamic-link" href="#/${type}" aria-label="Actualizar ${label.toLowerCase()}">Actualiza</a></div><div class="connector"></div><div class="concept">${label}</div><div class="connector"></div><div class="relation-static">tiene</div><div class="connector"></div><div class="attributes">${attributes.map(a=>`<span class="attribute">${a}</span>`).join('')}</div></div>`;
 return intro('Conecta herramientas y prácticas.','Explora el esquema preconceptual. Selecciona una relación dinámica para registrar o actualizar información.','','EL MAPA DE TU ENTORNO DEVOPS')+
 `<div class="stats"><div class="stat"><b>${db.tools.length}</b><span>Herramientas</span></div><div class="stat"><b>${db.practices.length}</b><span>Prácticas</span></div><div class="stat"><b>${db.diagrams.length}</b><span>Diagramas Essence</span></div><div class="stat"><b>${db.usages.length}</b><span>Relaciones de uso</span></div></div>
 <section class="panel"><div class="panel-heading"><h2>Esquema preconceptual del sistema</h2><div class="legend"><span><i class="key"></i>Concepto</span><span><i class="key dynamic"></i>Relación dinámica</span><span><i class="key static"></i>Relación estructural</span></div></div><div class="schema" aria-label="Ingeniero DevOps registra y actualiza herramientas, prácticas y usos"><div class="schema-actor">Ingeniero DevOps</div><div class="schema-trunk"></div><div class="branches">${branch('tools','Herramienta',['Nombre','Descripción','Logo','Modelo de precio','Categoría'])}${branch('practices','Práctica',['Nombre','Descripción','Diagrama Essence'])}${branch('usages','Uso',['Herramienta','Práctica','Descripción en cultura DevOps'])}</div><p class="schema-note">Cada flecha conecta un concepto con una relación. Los conceptos Herramienta y Práctica bajo Uso se refieren a los mismos conceptos de las otras ramas. Diagrama Essence tiene imagen y fuente; Categoría y Modelo de precio tienen nombre.</p></div></section>
 <div class="section-title"><h2>Un catálogo para aprender y construir</h2>${link('#/tools','Explorar herramientas')}</div><p class="muted">Encuentra herramientas por categoría, consulta las prácticas del curso y descubre cómo se relacionan con la colaboración, la automatización y la retroalimentación continua.</p><div class="info">Los modelos de precio son referencias de las presentaciones del curso. Las marcas históricas y las fuentes originales se conservan para facilitar su revisión.</div>`;
}
function route(){
 if(!store.data)return;
 const [section='home',mode,id]=(location.hash.slice(2).split('?')[0]||'home').split('/');
 $('#breadcrumb').textContent=titles[section]||'Página';document.title=`${titles[section]||'DevOps Atlas'} · DevOps Atlas`;
 document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('#nav-tools').textContent=store.data.tools.length;$('#nav-practices').textContent=store.data.practices.length;
 if(section==='home')$('#main').innerHTML=home(store.data);
 else if(section==='tools')renderTools(store,mode,id);
 else $('#main').innerHTML=intro(titles[section]||'Página','Esta sección se está preparando.');
 window.scrollTo(0,0);$('#main').focus({preventScroll:true});
}
$('#close-image').onclick=()=>$('#image-dialog').close();
window.addEventListener('hashchange',route);
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY)notify('La base cambió en otra pestaña. Recarga antes de guardar.',true);});
try{await store.init();route();}catch(error){$('#main').innerHTML=`<div class="error" role="alert"><h1>No se pudo abrir la base</h1><p>${escape(error.message)}</p><p>Los datos existentes no se han borrado. Revisa la guía de recuperación antes de continuar.</p></div>`;}
