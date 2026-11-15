#!/usr/bin/env python3
"""Números da Guía no painel: página 'Recién llegado', favoritos guardados e toques em 'Pedir con Tu Delivery' (contador t=p)."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']
def patch(f):
    s = open(f, encoding='utf-8').read()
    if "p_h:'" in s and 'grPages(' in s: print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a)); s = s.replace(a, b)
    rep("r_q:'Lo más buscado',r_best:'Mejor día'}", "r_q:'Lo más buscado',r_best:'Mejor día',p_h:'Otros números',p_llegar:'Aperturas de \"Recién llegado a Santa Rita\"',p_fav:'Veces que guardaron favoritos',p_td:'Toques en \"Pedir con Tu Delivery\"'}")
    rep("function grBlocks(st){", "const grPages=st=>['llegar','fav','td'].map(k=>[grt('p_'+k),+((st.p||{})[k])||0]);\nfunction grBlocks(st){const pg=grPages(st);")
    rep(" <button class=\"btn sm\" data-act=\"gucopy\" style=\"margin-top:12px\">", " ${pg.some(x=>x[1])?`<div class=\"gx-list gr-pg\"><span class=\"lbl\">${grt('p_h')}</span>${pg.map(([k,n])=>`<div><span>${esc(k)}</span><b>${n}</b></div>`).join('')}</div>`:''}\n <button class=\"btn sm\" data-act=\"gucopy\" style=\"margin-top:12px\">")
    rep(" const c=Object.entries(st.c||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);if(c.length){L.push('',grt('r_biz')+':');", " grPages(st).filter(x=>x[1]).forEach(x=>L.push(x[0]+': '+x[1]));\n const c=Object.entries(st.c||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);if(c.length){L.push('',grt('r_biz')+':');")
    # PT: a linha de textos em português termina igual, com outras palavras
    i = s.index("const grt=k=>GR_T["); j = s.rfind("}}", 0, i)
    assert s[j-1] == "'" , (f, s[j-30:j+2])
    s = s[:j] + ",p_h:'Outros números',p_llegar:'Aberturas de \"Cheguei em Santa Rita\"',p_fav:'Vezes que guardaram favoritos',p_td:'Toques em \"Pedir con Tu Delivery\"'" + s[j:]
    open(f, 'w', encoding='utf-8').write(s); print(f, 'ok')
for f in FILES: patch(f)
