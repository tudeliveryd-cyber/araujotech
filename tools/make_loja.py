#!/usr/bin/env python3
"""Catálogo no domínio principal: araujotechsistemas.com/loja/<nome>/ (mesmo catálogo do subdomínio).
Existe porque o iPhone, ao passar de araujotechsistemas.com para nome.araujotechsistemas.com, reaproveita a
conexão e a hospedagem responde "Misdirected Request" (421). Pela Guía e pelo site, o cliente fica no mesmo endereço.
Gera araujo-tech-site/loja/catalogo.html a partir do 404.html (catálogo genérico em modo caminho)."""
import os, shutil
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(os.path.join(ROOT, '404.html'), encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
# o nome da loja vem depois de /loja/
rep("x!=='index.html'&&x!=='404.html')", "x!=='index.html'&&x!=='404.html'&&x!=='loja')")
rep("window.TDC_MODE='catalog';window.TDC_PATH=true", "window.TDC_MODE='catalog';window.TDC_PATH=true;window.TDC_LOJA=true")
# compartilhar e links do próprio catálogo: o endereço oficial (subdomínio), não o caminho
rep("const catUrlFor=id=>", "const catUrlFor=id=>window.TDC_LOJA?'https://'+(id===FM?'fogaomineiro':id)+'.araujotechsistemas.com/':")
# visitas: também contam neste endereço
rep("const h=location.hostname;if(!/\\.araujotechsistemas\\.com$/.test(h)||/^(www\\.)?araujotechsistemas\\.com$/.test(h))return;",
    "const h=location.hostname;if(!window.TDC_LOJA&&(!/\\.araujotechsistemas\\.com$/.test(h)||/^(www\\.)?araujotechsistemas\\.com$/.test(h)))return;")
os.makedirs(os.path.join(ROOT, 'araujo-tech-site', 'loja'), exist_ok=True)
open(os.path.join(ROOT, 'araujo-tech-site', 'loja', 'catalogo.html'), 'w', encoding='utf-8').write(s)
shutil.copy(os.path.join(ROOT, 'catalogo_lib.php'), os.path.join(ROOT, 'araujo-tech-site', 'loja', 'catalogo_lib.php'))
print('loja ok', len(s))
