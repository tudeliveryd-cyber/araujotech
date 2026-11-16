# Lugares públicos de Santa Rita (Alto Paraná) no OpenStreetMap (dados abertos, © colaboradores do OpenStreetMap, ODbL).
# Só leitura: gera dados/osm-santa-rita.json para revisão antes de entrar na Guía.
import json, urllib.request, urllib.parse, os
Q = """[out:json][timeout:120];
(nwr(-25.87,-55.15,-25.73,-55.03)["amenity"~"^(pharmacy|hospital|clinic|doctors|dentist|police|fire_station|bus_station|townhall|school|university|bank|post_office|fuel)$"];
 nwr(-25.87,-55.15,-25.73,-55.03)["healthcare"];
 nwr(-25.87,-55.15,-25.73,-55.03)["amenity"~"^(place_of_worship|library|social_facility|community_centre|veterinary|atm|bureau_de_change|kindergarten|college|marketplace|courthouse)$"];
 nwr(-25.87,-55.15,-25.73,-55.03)["leisure"~"^(park|sports_centre|stadium|pitch)$"]["name"];
 nwr(-25.87,-55.15,-25.73,-55.03)["tourism"~"^(hotel|motel|guest_house|attraction|museum)$"];);
out center tags;"""
os.makedirs('dados', exist_ok=True)
for url in ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']:
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode({'data': Q}).encode(), headers={'User-Agent': 'GuiaSantaRita/1.0'}), timeout=150)
        d = json.load(r); break
    except Exception as e:
        print('falhou', url, e); d = None
if not d: raise SystemExit(1)
out = []
for e in d.get('elements', []):
    t = e.get('tags', {}); c = e.get('center') or e
    out.append({'id': f"{e['type'][0]}{e['id']}", 'name': t.get('name', ''), 'amenity': t.get('amenity') or t.get('healthcare') or t.get('leisure') or t.get('tourism'), 'phone': t.get('phone') or t.get('contact:phone') or '', 'addr': ' '.join(x for x in [t.get('addr:street', ''), t.get('addr:housenumber', '')] if x), 'hours': t.get('opening_hours', ''), 'religion': t.get('religion', ''), 'denom': t.get('denomination', ''), 'web': t.get('website') or t.get('contact:website') or '', 'tourism': t.get('tourism', ''), 'sport': t.get('sport', ''), 'lat': c.get('lat'), 'lon': c.get('lon')})
out.sort(key=lambda x: (x['amenity'] or '', x['name']))
json.dump(out, open('dados/osm-santa-rita.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), 'lugares')
