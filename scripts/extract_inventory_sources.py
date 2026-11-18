from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageDraw
import hashlib
import json
import shutil
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'inventario'
TMP = ROOT / 'tmp' / 'inventario'
DOWNLOADS = Path(r'C:\Users\USUARIO\Downloads')
FILES = [
 ('P00', 'pres00 CICD 2026-2s.pptx.pdf'),
 ('P01', 'pres01 CICD 2026-2s.pptx (1).pdf'),
 ('P02', 'pres02 CICD 2026-2s.pptx (1).pdf'),
 ('P03', 'pres03 CICD 2026-2s.pptx.pdf'),
 ('P04', 'pres04 CICD 2026-2s.pptx.pdf'),
 ('P05', 'pres05 CICD 2026-2s.pptx.pdf'),
 ('P06I', 'pres06 CICD 2026-2s initial part.pptx.pdf'),
 ('P06F', 'pres06 CICD 2026-2s final part.pptx.pdf'),
]
for directory in [OUT / 'fuentes', OUT / 'diagramas', TMP / 'imagenes', TMP / 'paginas']:
    directory.mkdir(parents=True, exist_ok=True)
manifest = []
for sid, name in FILES:
    src = DOWNLOADS / name
    dest = OUT / 'fuentes' / (sid + '.pdf')
    shutil.copy2(src, dest)
    reader = PdfReader(src)
    record = {'id': sid, 'nombre': name, 'ruta_original': str(src), 'archivo': f'fuentes/{sid}.pdf',
              'sha256': hashlib.sha256(src.read_bytes()).hexdigest(), 'numero_paginas': len(reader.pages), 'paginas': []}
    for n, page in enumerate(reader.pages, 1):
        row = {'pagina': n, 'texto': page.extract_text() or '', 'imagenes': []}
        for i, img in enumerate(page.images):
            digest = hashlib.sha256(img.data).hexdigest()
            target = TMP / 'imagenes' / f'{sid}-{n:02d}-{i}{Path(img.name).suffix}'
            target.write_bytes(img.data)
            row['imagenes'].append({'archivo': str(target), 'sha256': digest, 'tamano': list(img.image.size)})
        record['paginas'].append(row)
    manifest.append(record)
    print(sid, len(reader.pages), 'pages', sum(len(p['imagenes']) for p in record['paginas']), 'images')
(TMP / 'fuentes-extraidas.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

DIAGRAMS = {'P01':[2,3,4,5], 'P02':[2,3,4,5,6], 'P03':[2], 'P04':[2,3,4,5,6,8,9,10,12], 'P05':[4], 'P06I':[2]}
for sid, pages in DIAGRAMS.items():
    for page in pages:
        target = OUT / 'diagramas' / f'{sid}-{page:02d}'
        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-scale-to','1800','-singlefile','-png',str(OUT / 'fuentes' / f'{sid}.pdf'), str(target)],check=True,capture_output=True)
print('Source extraction and Essence page rendering finished.')
