"""Servidor estático local; no implementa una base de datos ni acepta escrituras."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import functools

parser=argparse.ArgumentParser()
parser.add_argument('--port',type=int,default=8765)
parser.add_argument('--directory',default=str(Path(__file__).resolve().parents[1]))
args=parser.parse_args()
handler=functools.partial(SimpleHTTPRequestHandler,directory=args.directory)
server=ThreadingHTTPServer(('127.0.0.1',args.port),handler)
print(f'DevOps Atlas: http://127.0.0.1:{args.port}/app/',flush=True)
try: server.serve_forever()
except KeyboardInterrupt: pass
finally: server.server_close()
