from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'app/js/app.js';s=p.read_text(encoding='utf-8')
needle='<p class="schema-note">Cada flecha'
addition='''<div class="schema-extensions"><div><span class="attribute">Diagrama Essence</span><span aria-hidden="true">→</span><span class="relation-static">tiene</span><span aria-hidden="true">→</span><span class="attribute">Imagen</span><span class="attribute">Fuente</span></div><div><span class="attribute">Categoría</span><span aria-hidden="true">→</span><span class="relation-static">tiene</span><span aria-hidden="true">→</span><span class="attribute">Nombre</span></div><div><span class="attribute">Modelo de precio</span><span aria-hidden="true">→</span><span class="relation-static">tiene</span><span aria-hidden="true">→</span><span class="attribute">Nombre</span></div></div><p class="schema-note">Cada flecha'''
if needle in s:s=s.replace(needle,addition)
s=s.replace('Los modelos de precio son referencias de las presentaciones del curso. Las marcas históricas y las fuentes originales se conservan para facilitar su revisión.','Los 120 modelos de precio de la tabla se conservan como referencia histórica. Para las 24 herramientas adicionales, la ficha incluye la fuente y fecha de su clasificación. Las marcas del curso se mantienen para facilitar su revisión.')
p.write_text(s,encoding='utf-8')
p=root/'app/js/tools.js';s=p.read_text(encoding='utf-8').replace("price:$('#price').value,description:","price:$('#price').value,priceVerification:t.price===$('#price').value?t.priceVerification:null,description:")
p.write_text(s,encoding='utf-8')
p=root/'app/styles.css';s=p.read_text(encoding='utf-8')
if '.schema-extensions{' not in s:s+='\n.schema-extensions{margin-top:25px;padding-top:18px;border-top:1px solid #dce5e6;display:flex;gap:12px;flex-wrap:wrap}.schema-extensions>div{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.schema-extensions .attribute{font-size:11px}.schema-extensions .relation-static{font-size:11px}\n'
p.write_text(s,encoding='utf-8')
