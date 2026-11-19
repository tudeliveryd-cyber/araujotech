# Só leitura: empresas e comércios de Santa Rita (Alto Paraná) no OpenStreetMap (© colaboradores do OpenStreetMap, ODbL),
# para a base de prospecção da Guía. Imprime uma linha "COM <json>" por lugar. Não grava nada em lugar nenhum.
import json, urllib.request, urllib.parse, time
B = '-25.87,-55.15,-25.73,-55.03'
GROUPS = ['["shop"]["name"]', '["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|biergarten|food_court)$"]["name"]',
          '["tourism"~"^(hotel|motel|guest_house|hostel|apartment)$"]["name"]', '["craft"]["name"]',
          '["office"~"^(company|estate_agent|insurance|lawyer|accountant|travel_agent|it|architect)$"]["name"]',
          '["amenity"~"^(car_wash|car_rental|fuel|dentist|doctors|clinic|veterinary|driving_school)$"]["name"]', '["leisure"~"^(fitness_centre|sports_centre)$"]["name"]']
SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']
UA = {'User-Agent': 'GuiaSantaRita/1.1 (guiadesantarita.com)'}
def overpass(q):
    for url in SERVERS:
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode({'data': q}).encode(), headers=UA), timeout=80)
            return json.load(r).get('elements', [])
        except Exception as e: print('falhou', url.split('/')[2], e)
    return None
els, ok = {}, 0
for g in GROUPS:
    r = overpass(f'[out:json][timeout:60];nwr({B}){g};out center tags;')
    if r is None: continue
    ok += 1
    for e in r: els[f"{e['type'][0]}{e['id']}"] = e
    time.sleep(2)
print(ok, 'de', len(GROUPS), 'consultas;', len(els), 'lugares')
for k, e in sorted(els.items(), key=lambda kv: kv[1].get('tags', {}).get('name', '')):
    t = e.get('tags', {}); c = e.get('center') or {'lat': e.get('lat'), 'lon': e.get('lon')}
    tipo = next((f'{x}={t[x]}' for x in ('shop', 'amenity', 'tourism', 'craft', 'office', 'leisure') if x in t), '')
    addr = ' '.join(x for x in [t.get('addr:street', ''), t.get('addr:housenumber', '')] if x).strip()
    print('COM ' + json.dumps({'id': k, 'n': t.get('name', ''), 'tipo': tipo, 'tel': t.get('phone') or t.get('contact:phone') or '', 'wa': t.get('contact:whatsapp', ''),
      'web': t.get('website') or t.get('contact:website') or '', 'ig': t.get('contact:instagram', ''), 'fb': t.get('contact:facebook', ''), 'a': addr, 'h': t.get('opening_hours', ''),
      'lat': c.get('lat'), 'lon': c.get('lon'), 'cerrado': bool(t.get('disused:shop') or t.get('was:shop')), 'check': t.get('check_date', '')}, ensure_ascii=False))
