# Escolas e colégios de Santa Rita (Alto Paraná) no cadastro oficial do MEC (dados abertos, 2018, via data.amerigeoss.org).
# Só leitura: gera dados/mec-santa-rita.json para revisão antes de entrar na Guía.
import csv, io, json, os, urllib.request, unicodedata
URL = 'https://data.amerigeoss.org/datastore/dump/56ac1078-2ff1-4f73-8c43-27f7778a4e53?bom=True'
n = lambda s: unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode().upper()
raw = urllib.request.urlopen(urllib.request.Request(URL, headers={'User-Agent': 'GuiaSantaRita/1.0'}), timeout=120).read().decode('utf-8-sig', 'replace')
rows = list(csv.DictReader(io.StringIO(raw)))
print('colunas:', list(rows[0].keys()) if rows else [])
keep = [r for r in rows if 'ALTO PARANA' in n(' '.join(r.values())) and 'SANTA RITA' in n(' '.join(r.values()))]
os.makedirs('dados', exist_ok=True)
json.dump(keep, open('dados/mec-santa-rita.json', 'w'), ensure_ascii=False, indent=1)
print(len(rows), 'linhas;', len(keep), 'de Santa Rita')
