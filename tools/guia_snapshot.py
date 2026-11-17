# SÓ LEITURA: baixa as respostas públicas da Guía (dados e imagens) para montar uma prévia local do design.
import json, os, re, urllib.request, urllib.parse, tarfile, base64, hashlib
O = 'snap'; os.makedirs(O, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (snapshot guia)'}
def get(u):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40); return r.read()
    except Exception as e:
        print('ERR', u, e); return None
G = 'https://guiadesantarita.com'
idx = {}
def save(u, b):
    k = hashlib.sha1(u.encode()).hexdigest()[:16]; open(f'{O}/{k}', 'wb').write(b); idx[u] = k
for q in ['g=1', 'hoy=1', 'top=1', 'news=1', 'jobs=1']:
    u = G + '/sitio/guia.php?' + q; b = get(u)
    if b: save(u, b)
K = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U'
fu = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=' + K + '&mask.fieldPaths=clientes'
b = get(fu); save(fu, b or b'{}')
cl = []
try:
    vals = json.loads(b)['fields']['clientes']['arrayValue']['values']
    for v in vals:
        f = v['mapValue']['fields']; cl.append({k: list(x.values())[0] for k, x in f.items()})
except Exception as e: print('ERR clientes', e)
ids = [c.get('id') for c in cl if c.get('id')]
for q in ['ids=', 'ofs=']:
    u = G + '/sitio/guia.php?' + q + urllib.parse.quote(','.join(ids)); bb = get(u)
    if bb: save(u, bb)
imgs = set()
for c in cl:
    for k in ('logo', 'img', 'cover'):
        if isinstance(c.get(k), str) and c[k].startswith('http'): imgs.add(c[k])
try:
    g = json.loads(open(f"{O}/{idx[G + '/sitio/guia.php?g=1']}", 'rb').read())
    def walk(x):
        if isinstance(x, dict): [walk(v) for v in x.values()]
        elif isinstance(x, list): [walk(v) for v in x]
        elif isinstance(x, str) and (x.startswith('/sitio/') or x.startswith('/img/')) and re.search(r'(gimg|png|jpe?g|webp)', x): imgs.add(G + x)
    walk(g)
except Exception as e: print('ERR walk', e)
print('imagens', len(imgs))
for u in sorted(imgs):
    bb = get(u)
    if bb and len(bb) < 900000: save(u, bb)
json.dump(idx, open(f'{O}/index.json', 'w'))
with tarfile.open('snap.tgz', 'w:gz') as t: t.add(O)
s = base64.b64encode(open('snap.tgz', 'rb').read()).decode(); print('TAMANHO', len(s))
for i in range(0, len(s), 60000): print('SNAP64 ' + s[i:i + 60000])
