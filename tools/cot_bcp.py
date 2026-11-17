# Lê a página "monedas" do BCP e grava a cotização de referência (guaraníes por moeda) em JSON. Sai com erro se faltar algo.
import re, sys, json, datetime, os
s = open(sys.argv[1], encoding='utf-8', errors='replace').read()
t = re.sub(r'<script.*?</script>|<style.*?</style>', '', s, flags=re.S)
cells = [re.sub(r'\s+', ' ', c).strip() for c in re.sub(r'<[^>]+>', '|', t).split('|')]
cells = [c for c in cells if c]
num = lambda x: float(x.replace('.', '').replace(',', '.'))
out = {}
for code in ('USD', 'BRL', 'ARS', 'EUR'):
    for i, c in enumerate(cells):
        if c == code and i + 2 < len(cells) and re.match(r'^[\d.]+,\d+$', cells[i + 2]):
            out[code.lower()] = round(num(cells[i + 2]), 2); break
m = re.search(r'id="dp_cotizacion"[^>]*value="(\d{2})[/-](\d{2})[/-](\d{4})"', s) or re.search(r'value="(\d{2})/(\d{2})/(\d{4})"', s)
fecha = f'{m.group(3)}-{m.group(2)}-{m.group(1)}' if m else ''
if not (3000 < out.get('usd', 0) < 20000 and 500 < out.get('brl', 0) < 5000):
    sys.exit('cotização fora do esperado: ' + json.dumps(out))
out.update({'fecha': fecha, 'src': 'Banco Central del Paraguay (tipo de cambio referencial)', 'at': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%MZ')})
os.makedirs(os.path.dirname(sys.argv[2]), exist_ok=True)
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
