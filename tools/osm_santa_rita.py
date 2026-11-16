# Lugares públicos de Santa Rita (Alto Paraná) no OpenStreetMap (dados abertos, © colaboradores do OpenStreetMap, ODbL).
# Só leitura: gera dados/osm-santa-rita.json para revisão antes de entrar na Guía.
import json, urllib.request, urllib.parse, os
Q = """[out:json][timeout:60];
(area["name"="Santa Rita"]["admin_level"~"^(6|7|8)$"];)->.a;
(nwr(area.a)["amenity"~"^(pharmacy|hospital|clinic|doctors|dentist|police|fire_station|bus_station|townhall|school|university|bank|post_office|fuel)$"];
 nwr(area.a)["healthcare"];
 nwr(area.a)["leisure"~"^(park|sports_centre|stadium)$"]["name"];);
out center tags;"""
os.makedirs('dados', exist_ok=True)
for url in ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']:
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode({'data': Q}).encode(), headers={'User-Agent': 'GuiaSantaRita/1.0'}), timeout=90)
        d = json.load(r); break
    except Exception as e:
        print('falhou', url, e); d = None
if not d: raise SystemExit(1)
out = []
for e in d.get('elements', []):
    t = e.get('tags', {}); c = e.get('center') or e
    out.append({'id': f"{e['type'][0]}{e['id']}", 'name': t.get('name', ''), 'amenity': t.get('amenity') or t.get('healthcare') or t.get('leisure'), 'phone': t.get('phone') or t.get('contact:phone') or '', 'addr': ' '.join(x for x in [t.get('addr:street', ''), t.get('addr:housenumber', '')] if x), 'hours': t.get('opening_hours', ''), 'lat': c.get('lat'), 'lon': c.get('lon')})
out.sort(key=lambda x: (x['amenity'] or '', x['name']))
json.dump(out, open('dados/osm-santa-rita.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), 'lugares')
