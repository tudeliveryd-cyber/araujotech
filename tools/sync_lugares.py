# Lugares públicos curados da Guía: a fonte é araujo-tech-site/guia/lugares-publicos.json (o painel importa dali).
# Este script copia a lista para dentro da página (const OSMP=[...]), para a Guía abrir já com eles, sem esperar download.
# Uso: python3 tools/sync_lugares.py   (rodar depois de editar o JSON)
import json, re, os
D = os.path.join(os.path.dirname(__file__), '..', 'araujo-tech-site', 'guia')
items = json.load(open(os.path.join(D, 'lugares-publicos.json')))['items']
CATS = {'far', 'salud', 'seg', 'trans', 'ocio', 'igl', 'fin', 'dep', 'edu', 'com', 'ani', 'gob', 'doc'}
def js(v): return json.dumps(v, ensure_ascii=False).replace('</', '<\\/')
lines = []
seen = set()
for x in items:
    assert x['c'] in CATS, x
    assert x['n'].strip(), x
    key = (x['c'], x['n'].strip().lower())
    assert key not in seen, ('repetido', x['n']); seen.add(key)
    assert not x.get('map') or re.match(r'^https://[^\s"\'<>]+$', x['map']), x
    k = x.get('k') or re.escape(x['n'].lower())
    re.compile(k)
    f = [f"c:{js(x['c'])}", f"n:{js(x['n'])}", f"a:{js(x.get('a', ''))}", f"tel:{js(x.get('tel', ''))}", f"h:{js(x.get('h', ''))}", f"map:{js(x.get('map', ''))}", f"src:{js(x.get('src', ''))}", f"k:/{k.replace('/', chr(92) + '/')}/"]
    lines.append(' {' + ','.join(f) + '}')
p = os.path.join(D, 'index.html'); s = open(p).read()
i = s.index('const OSMP=['); j = s.index('}];', i) + 3
s = s[:i] + 'const OSMP=[\n' + ',\n'.join(lines) + '];' + s[j:]
open(p, 'w').write(s)
print(len(items), 'lugares copiados para a Guía')
