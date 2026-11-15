#!/usr/bin/env python3
"""Senha nova: o que foi digitado sobrevive também se a tela passar um instante pelo painel (a nuvem às vezes
avisa 'senha já trocada' e logo corrige). O que foi digitado só é apagado quando a troca dá certo (ou em 3 minutos)."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']
A = "if(!boot&&!lgf){delete keep.lg_user;delete keep.lg_pass}if(!boot&&!lgf&&!npf){delete keep.np_a;delete keep.np_b}}/* entrou: nada do que foi digitado fica guardado */"
B = "if(!boot&&!lgf){delete keep.lg_user;delete keep.lg_pass}if(!boot&&!lgf&&!npf&&!window.__kpn){delete keep.np_a;delete keep.np_b}}/* entrou: nada do que foi digitado fica guardado (a senha nova só some quando a troca dá certo) */"
C = "const keep=(window.__kp=window.__kp||{});['lg_user','lg_pass','np_a','np_b'].forEach(id=>{const e=document.getElementById(id);if(e){if(e.value)keep[id]={v:e.value,ty:e.type,t:Date.now()};else delete keep[id]}});"
D = C + "if(keep.np_a||keep.np_b)window.__kpn=1;else if(document.getElementById('np_a'))window.__kpn=0;"
E_ = "forceMc=false;render();toast(t('np_ok'))"
F = "forceMc=false;window.__kpn=0;render();window.__kp={};toast(t('np_ok'))"
for f in FILES:
    s = open(f, encoding='utf-8').read()
    if 'window.__kpn' in s: print(f, 'já tem'); continue
    assert s.count(A) == 1 and s.count(C) == 1 and s.count(E_) == 1, (f, s.count(A), s.count(C), s.count(E_))
    s = s.replace(A, B).replace(C, D).replace(E_, F)
    open(f, 'w', encoding='utf-8').write(s); print(f, 'ok')
