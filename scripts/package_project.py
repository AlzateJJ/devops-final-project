"""Empaqueta únicamente archivos del proyecto y genera un manifiesto de integridad."""
from pathlib import Path
import argparse, hashlib, json, subprocess, zipfile
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--draft',action='store_true',help='Permite generar una copia de verificación antes del commit de documentación.')
args=parser.parse_args()
status=subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True,encoding='utf-8')
if status.strip() and not args.draft:
    raise SystemExit('Hay cambios sin commit. Regístralos antes de generar la entrega final o usa --draft para una verificación provisional.')
OUT=ROOT/'entrega';OUT.mkdir(exist_ok=True)
subprocess.run(['node',str(ROOT/'scripts/build_offline.cjs')],cwd=ROOT,check=True)
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
history=subprocess.check_output(['git','log','--reverse','--format=%h %s'],cwd=ROOT,text=True,encoding='utf-8')
folders=['app','inventario','planificacion','docs','evidencias','scripts','tests']
files=[ROOT/name for name in ['README.md','Iniciar.cmd','package.json','package-lock.json','.gitignore','.gitattributes']]
for folder in folders:
    files.extend(p for p in (ROOT/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.pyc')
entries={p.relative_to(ROOT).as_posix():p for p in files}
for name in ['index.html','LEEME.txt','runtime/app.js','runtime/catalogo.js','app/index.html','app/index-desarrollo.html']:
    entries[name]=OUT/'navegador'/name
records=[{'path':name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for name,p in sorted(entries.items())]
manifest={'project':'Entrega Final DevOps','version':'1.0.0','author':'Juan José Alzate','sourceCommit':head,'draft':bool(status.strip()),
          'generatedAt':datetime.now(timezone.utc).isoformat(),'commits':len(history.splitlines()),'files':records}
archive=OUT/'devops-atlas-entrega.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=7) as z:
    for name,p in sorted(entries.items()):z.write(p,'devops-atlas/'+name)
    z.writestr('devops-atlas/manifiesto.json',json.dumps(manifest,ensure_ascii=False,indent=2))
    z.writestr('devops-atlas/historial-commits.txt',history)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for record in records:
        assert hashlib.sha256(z.read('devops-atlas/'+record['path'])).hexdigest()==record['sha256']
manifest['archive']={'file':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}
(OUT/'manifiesto-entrega.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
(OUT/'historial-commits.txt').write_text(history,encoding='utf-8',newline='\n')
print(json.dumps({'archive':str(archive),'files':len(entries),'bytes':archive.stat().st_size,'commits':manifest['commits'],'draft':manifest['draft'],'entrypoint':'devops-atlas/index.html','sha256':manifest['archive']['sha256']},ensure_ascii=False))
