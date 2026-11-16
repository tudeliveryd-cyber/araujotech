# Lugares públicos de Santa Rita (Alto Paraná) no OpenStreetMap (dados abertos, © colaboradores do OpenStreetMap, ODbL).
# Só leitura: gera dados/osm-santa-rita.json para revisão antes de entrar na Guía.
# Consultas pequenas (uma por grupo) para não estourar o tempo dos servidores Overpass; se todos falharem,
# baixa o mapa da cidade em pedaços pela API oficial do OpenStreetMap e filtra aqui.
import json, urllib.request, urllib.parse, os, time, xml.etree.ElementTree as ET
B = '-25.87,-55.15,-25.73,-55.03'
GROUPS = [
    '["amenity"~"^(place_of_worship)$"]', '["building"~"^(church|chapel|temple)$"]',
    '["amenity"~"^(pharmacy|hospital|clinic|doctors|dentist|veterinary)$"]', '["healthcare"]',
    '["amenity"~"^(police|fire_station|townhall|courthouse|post_office|public_building|bus_station)$"]', '["office"="government"]',
    '["amenity"~"^(school|kindergarten|childcare|college|university|library)$"]',
    '["office"~"^(ngo|association|religion|charity|foundation)$"]', '["amenity"~"^(social_facility|community_centre|social_centre|nursing_home|animal_shelter)$"]', '["social_facility"]',
    '["amenity"~"^(bank|atm|bureau_de_change|marketplace|fuel)$"]',
    '["leisure"~"^(park|sports_centre|stadium|pitch)$"]["name"]', '["tourism"~"^(hotel|motel|guest_house|attraction|museum)$"]',
]
SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']
UA = {'User-Agent': 'GuiaSantaRita/1.1 (guiadesantarita.com)'}
def overpass(q):
    for url in SERVERS:
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode({'data': q}).encode(), headers=UA), timeout=70)
            return json.load(r).get('elements', [])
        except Exception as e:
            print('falhou', url.split('/')[2], e)
    return None
els, ok = {}, 0
for g in GROUPS:
    r = overpass(f'[out:json][timeout:60];nwr({B}){g};out center tags;')
    if r is None: continue
    ok += 1
    for e in r: els[f"{e['type'][0]}{e['id']}"] = e
    time.sleep(2)
print(ok, 'de', len(GROUPS), 'consultas Overpass;', len(els), 'elementos')
if ok == 0: # plano B: API oficial (mapa da cidade em pedaços de 0,02°)
    KEYS = ('amenity', 'healthcare', 'office', 'social_facility', 'leisure', 'tourism', 'building')
    lat, n_ok = -25.83, 0
    while lat < -25.75:
        lon = -55.12
        while lon < -55.05:
            bb = f'{lon:.3f},{lat:.3f},{lon+0.02:.3f},{lat+0.02:.3f}'
            try:
                x = urllib.request.urlopen(urllib.request.Request('https://api.openstreetmap.org/api/0.6/map?bbox=' + bb, headers=UA), timeout=90).read(); n_ok += 1
                root = ET.fromstring(x); nodes = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in root.iter('node')}
                for el in list(root.iter('node')) + list(root.iter('way')):
                    t = {k.get('k'): k.get('v') for k in el.iter('tag')}
                    if not t.get('name') or not any(k in t for k in KEYS): continue
                    if el.tag == 'node': c = {'lat': float(el.get('lat')), 'lon': float(el.get('lon'))}
                    else:
                        pts = [nodes[nd.get('ref')] for nd in el.iter('nd') if nd.get('ref') in nodes]
                        if not pts: continue
                        c = {'lat': sum(p[0] for p in pts) / len(pts), 'lon': sum(p[1] for p in pts) / len(pts)}
                    els[el.tag[0] + el.get('id')] = {'type': el.tag, 'id': el.get('id'), 'tags': t, 'center': c}
            except Exception as e:
                print('api falhou', bb, e)
            time.sleep(1.5); lon += 0.02
        lat += 0.02
    print('API oficial:', n_ok, 'pedaços;', len(els), 'elementos')
if not els: raise SystemExit(1)
os.makedirs('dados', exist_ok=True)
out = []
for k, e in els.items():
    t = e.get('tags', {}); c = e.get('center') or e
    out.append({'id': k, 'name': t.get('name', ''), 'amenity': t.get('amenity') or t.get('healthcare') or t.get('office') or ('social_facility' if t.get('social_facility') else '') or t.get('leisure') or t.get('tourism') or t.get('building'), 'phone': t.get('phone') or t.get('contact:phone') or '', 'addr': ' '.join(x for x in [t.get('addr:street', ''), t.get('addr:housenumber', '')] if x), 'hours': t.get('opening_hours', ''), 'religion': t.get('religion', ''), 'denom': t.get('denomination', ''), 'web': t.get('website') or t.get('contact:website') or '', 'tourism': t.get('tourism', ''), 'sport': t.get('sport', ''), 'social': t.get('social_facility', ''), 'lat': c.get('lat'), 'lon': c.get('lon')})
out.sort(key=lambda x: (x['amenity'] or '', x['name']))
json.dump(out, open('dados/osm-santa-rita.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), 'lugares')
