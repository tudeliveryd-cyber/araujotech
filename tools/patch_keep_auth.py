#!/usr/bin/env python3
"""Painel/admin: redesenhar a tela (chega um dado da nuvem) não apaga mais o que a pessoa está digitando
no login nem na criação da senha do primeiro acesso."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']
A = " const app=document.getElementById('app');\n app.innerHTML="
B = (" const app=document.getElementById('app');\n"
     " /* login e senha nova: guarda o que já foi digitado (e o foco) antes de redesenhar */\n"
     " const keep={};['lg_user','lg_pass','np_a','np_b'].forEach(id=>{const e=document.getElementById(id);if(e&&e.value)keep[id]={v:e.value,ty:e.type}});const kf=document.activeElement&&keep[document.activeElement.id]?{id:document.activeElement.id,a:document.activeElement.selectionStart,b:document.activeElement.selectionEnd}:null;\n"
     " const kErr={};['lgErr','npErr'].forEach(id=>{const e=document.getElementById(id);if(e&&e.textContent)kErr[id]=e.textContent});\n"
     " app.innerHTML=")
C = " document.documentElement.style.setProperty('--topH',document.getElementById('top').offsetHeight+'px');\n if(MODE==='catalog')document.body.style.setProperty('--band',pub.theme.header);"
D = (" Object.keys(keep).forEach(id=>{const e=document.getElementById(id);if(e&&!e.value){e.value=keep[id].v;if(keep[id].ty==='text'&&e.type==='password'&&id!=='lg_user')e.type='text'}});Object.keys(kErr).forEach(id=>{const e=document.getElementById(id);if(e&&!e.textContent)e.textContent=kErr[id]});\n"
     " if(kf){const e=document.getElementById(kf.id);if(e&&document.activeElement!==e){try{e.focus({preventScroll:true});if(kf.a!=null)e.setSelectionRange(kf.a,kf.b)}catch(x){}}}\n" + C)
for f in FILES:
    s = open(f, encoding='utf-8').read()
    if "const keep={};['lg_user'" in s: print(f, 'já tem'); continue
    assert s.count(A) == 1 and s.count(C) == 1, (f, s.count(A), s.count(C))
    s = s.replace(A, B).replace(C, D)
    open(f, 'w', encoding='utf-8').write(s); print(f, 'ok')
