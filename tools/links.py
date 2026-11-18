# SÓ LEITURA: lista os links (href) de uma página pública.
import sys, re, urllib.request
u = sys.argv[1]
h = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=40).read().decode('utf8', 'ignore')
for m in sorted(set(re.findall(r'href=["\']([^"\']+)', h))): print('LINK', m)
for m in re.findall(r'<title>(.*?)</title>', h, re.S): print('TITLE', m.strip())
