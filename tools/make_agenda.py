# -*- coding: utf-8 -*-
"""Gera /agenda (Agenda para salones y barberías) servida em nome.araujotechsistemas.com.
Origem: gestion.html e reservas.html do repositório Barber-a-Loli (versão na nuvem).
Uso: python3 tools/make_agenda.py ../barber-a-loli
O código do cliente (AG_ID) vem do subdomínio: loli.araujotechsistemas.com -> 'loli'."""
import os, sys, shutil, re
SRC = sys.argv[1] if len(sys.argv) > 1 else '../barber-a-loli'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'agenda')
os.makedirs(OUT, exist_ok=True)

AGJS = '(()=>{const m=location.hostname.toLowerCase().match(/^([a-z0-9-]+)\\.araujotechsistemas\\.com$/);return m&&!["www","barberialoli","fogaomineiro"].includes(m[1])?m[1]:(new URLSearchParams(location.search).get("ag")||"")})()'
CLEAN = '<script>/* endereço limpo: nome.araujotechsistemas.com e /gestion */if(/\\/agenda\\//.test(location.pathname))history.replaceState(null,"",(/gestion/.test(location.pathname)?"/gestion":"/")+location.hash);</script>'

def lic(publico):
    return ('<script>(function(){var m=location.hostname.toLowerCase().match(/^([a-z0-9-]+)\\.araujotechsistemas\\.com$/);if(!m)return;'
            'var s=document.createElement("script");s.src="https://araujotechsistemas.com/licencia.js";s.setAttribute("data-cliente",m[1]);'
            + ('s.setAttribute("data-publico","1");' if publico else '') + 'document.body.appendChild(s)})();</script>')

def rep(s, a, b, f, n=1):
    c = s.count(a)
    if c != n: sys.exit(f'{f}: {c}x {a[:90]!r}')
    return s.replace(a, b)

def build(name, out, publico):
    s = open(os.path.join(SRC, name), encoding='utf-8').read()
    f = name
    if publico:
        s = rep(s, 'const AG_ID="loreni",', 'const AG_ID=' + AGJS + ',', f)
        s = rep(s, '<script src="https://araujotechsistemas.com/licencia.js" data-cliente="loreni" data-publico="1"></script>', lic(True), f)
        s = rep(s, '<title>Barbería Loli · Reservas</title>', '<title>Reservas</title>', f)
        s = rep(s, '<link rel="manifest" href="manifest.json">\n', '', f)
    else:
        s = rep(s, 'const AG_ID="loreni";', 'const AG_ID=' + AGJS + ';', f)
        s = rep(s, '<script src="https://araujotechsistemas.com/licencia.js" data-cliente="loreni"></script>', lic(False), f)
        s = rep(s, '<title>Barbería Loli · Gestión</title>', '<title>Agenda y gestión</title>', f)
        s = rep(s, '<link rel="manifest" href="manifest-gestion.json">\n', '', f)
    s = rep(s, '<link rel="icon" href="icon-192.png" type="image/png">', '<link rel="icon" href="/agenda/favicon.png" type="image/png">', f)
    s = rep(s, '<link rel="apple-touch-icon" href="apple-touch-icon.png">', '<link rel="apple-touch-icon" href="/agenda/apple-touch-icon.png">', f)
    i = s.index('<body')
    j = s.index('>', i) + 1
    s = s[:j] + CLEAN + s[j:]
    open(os.path.join(OUT, out), 'w', encoding='utf-8').write(s)
    print('ok', out)

build('reservas.html', 'index.html', True)
build('gestion.html', 'gestion.html', False)
for n in ['favicon.png', 'apple-touch-icon.png']:
    shutil.copy(os.path.join(ROOT, 'araujo-tech-site', 'admin', n), os.path.join(OUT, n))
