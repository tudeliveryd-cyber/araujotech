# Escolas e colégios de Santa Rita (Alto Paraná) no cadastro oficial do MEC (dados abertos, 2018, via data.amerigeoss.org).
# Só leitura: gera dados/mec-santa-rita.json para revisão antes de entrar na Guía.
import csv, io, json, os, urllib.request, unicodedata
n = lambda s: unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode().upper()
raw, ano = None, None
for y in range(2025, 2011, -1):  # o ano mais recente que o MEC publicou
    try:
        raw = urllib.request.urlopen(urllib.request.Request(f'https://datos.mec.gov.py/data/establecimientos_{y}.csv', headers={'User-Agent': 'GuiaSantaRita/1.0'}), timeout=60).read().decode('utf-8-sig', 'replace'); ano = y
        if raw.count('\n') > 100: break
    except Exception as e:
        print('sem', y, e)
print('ano', ano)
rows = list(csv.DictReader(io.StringIO(raw)))
print('colunas:', list(rows[0].keys()) if rows else [])
keep = [r for r in rows if 'ALTO PARANA' in n(' '.join(r.values())) and 'SANTA RITA' in n(' '.join(r.values()))]
os.makedirs('dados', exist_ok=True)
json.dump({'ano': ano, 'rows': keep}, open('dados/mec-santa-rita.json', 'w'), ensure_ascii=False, indent=1)
print(len(rows), 'linhas;', len(keep), 'de Santa Rita')
