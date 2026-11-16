#!/usr/bin/env python3
"""Monta a tabela de "de onde entram" da Guía a partir do DB-IP IP to City Lite (CC BY 4.0, https://db-ip.com).
Entrada: dbip-city-lite-AAAA-MM.csv.gz (ip_start, ip_end, continente, país, estado, cidade, lat, lon).
Saída (pasta): geo4.bin (IPv4: início uint32 + rótulo uint16), geo6.bin (IPv6: início 16 bytes + rótulo uint16), geo-labels.json.
Rótulo: Paraguai -> "Cidade|PY"; Brasil e Argentina -> "Estado|BR"/"Estado|AR"; resto -> "|XX" (só o país).
O guia_hit.php consulta o endereço na hora, soma 1 no rótulo e descarta o endereço: nada de IP fica guardado."""
import csv, gzip, ipaddress, json, os, struct, sys

def label(cc, st, city):
    cc = (cc or '').upper()[:2]
    if cc == 'PY': return (city or st or '').strip()[:40] + '|PY'
    if cc in ('BR', 'AR'): return (st or '').strip()[:40] + '|' + cc
    return '|' + cc if cc else ''

def build(src, out):
    labs, idx = [''], {'': 0}
    v4, v6 = [], []
    with gzip.open(src, 'rt', encoding='utf-8', newline='') as f:
        for r in csv.reader(f):
            if len(r) < 6: continue
            try: a, b = ipaddress.ip_address(r[0]), ipaddress.ip_address(r[1])
            except ValueError: continue
            l = label(r[3], r[4], r[5])
            if l not in idx: idx[l] = len(labs); labs.append(l)
            (v4 if a.version == 4 else v6).append((int(a), int(b), idx[l]))
    os.makedirs(out, exist_ok=True)
    for lst, name, w, top in ((v4, 'geo4.bin', 4, 2**32), (v6, 'geo6.bin', 16, 2**128)):
        lst.sort(); recs = []; prev_end = -1
        for a, b, l in lst:
            if a > prev_end + 1 and (not recs or recs[-1][1] != 0): recs.append((prev_end + 1, 0))  # buraco: sem rótulo
            if not recs or recs[-1][1] != l: recs.append((a, l))
            prev_end = max(prev_end, b)
        if prev_end + 1 < top and (not recs or recs[-1][1] != 0): recs.append((prev_end + 1, 0))
        with open(os.path.join(out, name), 'wb') as g:
            for a, l in recs: g.write(a.to_bytes(w, 'big') + struct.pack('>H', l))
        print(name, len(recs), 'faixas')
    json.dump(labs, open(os.path.join(out, 'geo-labels.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print('rótulos', len(labs))

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
