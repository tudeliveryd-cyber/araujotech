#!/usr/bin/env python3
"""Login e senha nova: o que foi digitado sobrevive também quando a tela passa por um estado intermediário
(carregando, ou a tela de login por um instante) antes de voltar ao formulário. Some assim que a pessoa entra."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']
A = " const keep={};['lg_user','lg_pass','np_a','np_b'].forEach(id=>{const e=document.getElementById(id);if(e&&e.value)keep[id]={v:e.value,ty:e.type}});"
B = " const keep=(window.__kp=window.__kp||{});['lg_user','lg_pass','np_a','np_b'].forEach(id=>{const e=document.getElementById(id);if(e){if(e.value)keep[id]={v:e.value,ty:e.type,t:Date.now()};else delete keep[id]}});Object.keys(keep).forEach(id=>{if(Date.now()-keep[id].t>180000)delete keep[id]});"
C = " Object.keys(keep).forEach(id=>{const e=document.getElementById(id);if(e&&!e.value){e.value=keep[id].v;"
D = (" {const boot=!!document.querySelector('.bootld'),lgf=!!document.getElementById('lg_user'),npf=!!document.getElementById('np_a');"
     "if(!boot&&!lgf){delete keep.lg_user;delete keep.lg_pass}if(!boot&&!lgf&&!npf){delete keep.np_a;delete keep.np_b}}/* entrou: nada do que foi digitado fica guardado */\n" + C)
for f in FILES:
    s = open(f, encoding='utf-8').read()
    if 'window.__kp=window.__kp||{}' in s: print(f, 'já tem'); continue
    assert s.count(A) == 1 and s.count(C) == 1, (f, s.count(A), s.count(C))
    s = s.replace(A, B).replace(C, D)
    open(f, 'w', encoding='utf-8').write(s); print(f, 'ok')
