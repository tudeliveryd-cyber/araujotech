# SÓ LEITURA: mostra o horário (dy/hrs) como está salvo no painel para as fichas da Guía sem horário publicado.
import json, urllib.request
K = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U'
u = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=' + K + '&mask.fieldPaths=gdir'
d = json.loads(urllib.request.urlopen(u, timeout=40).read())
def un(v):
    k = list(v)[0]; x = v[k]
    if k == 'mapValue': return {a: un(b) for a, b in x.get('fields', {}).items()}
    if k == 'arrayValue': return [un(y) for y in x.get('values', [])]
    return x
for x in un(d['fields']['gdir']):
    dy = x.get('dy')
    ok = isinstance(dy, list) and any(isinstance(z, dict) and z.get('on') and ((z.get('a') or ['', ''])[0] and (z.get('a') or ['', ''])[1]) for z in dy)
    if not ok: print('FICHA', x.get('n'), '| hrs=', repr(x.get('hrs')), '| dy=', json.dumps(dy)[:400])
