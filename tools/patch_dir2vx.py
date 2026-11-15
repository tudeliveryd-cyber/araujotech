# Guía: "Pasar a Vitrix" na ficha (abre Registrar local já preenchido) e ficha some sozinha quando o negócio vira cliente Vitrix
import sys
R=[
("${x.td&&!String(x.wa||'').trim()?`<span class=\"pill gu-off\">${T.nowa}</span>`:''}",
 "${x.td&&!String(x.wa||'').trim()?`<span class=\"pill gu-off\">${T.nowa}</span>`:''}${gdIsVx(x.n)?`<span class=\"pill gu-ok\">${T.isvx}</span>`:''}"),
("<button class=\"btn sm danger\" data-act=\"gurm\" data-k=\"dir\" data-i=\"${i}\">",
 "${gdIsVx(x.n)?'':`<button class=\"btn sm\" data-act=\"gudir2vx\" data-i=\"${i}\">${ic('store',14)}${T.tovx}</button>`}<button class=\"btn sm danger\" data-act=\"gurm\" data-k=\"dir\" data-i=\"${i}\">"),
("const GD_TU=","const gdNm=s=>String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();\nconst gdIsVx=n=>!!gdNm(n)&&(PL.shops||[]).some(s=>gdNm(s.name)===gdNm(n));\nconst GD_TU="),
("nowa:'Falta WhatsApp',dy:'Horario por día'","nowa:'Falta WhatsApp',tovx:'Pasar a Vitrix',isvx:'Ya es cliente Vitrix: en la Guía sale con su página (esta ficha queda oculta)',dy:'Horario por día'"),
("nowa:'Falta WhatsApp',dy:'Horário por dia'","nowa:'Falta WhatsApp',tovx:'Passar para Vitrix',isvx:'Já é cliente Vitrix: na Guia aparece com a página dele (esta ficha fica oculta)',dy:'Horário por dia'"),
(" gudirlgrm(el){",
 " async gudir2vx(el){const g=ui.gu;const x=g&&g.dir[+el.dataset.i];if(!x)return;await acts.gusave();acts.newshop();Object.assign(ui.ns,{name:x.n,wa:x.wa||'',segc:x.d||''});if(x.lg)ui.ns.logo=x.lg;newShopSheet()},\n gudirlgrm(el){"),
]
for f in sys.argv[1:]:
    s=open(f).read()
    if 'gudir2vx' in s: print('ok',f); continue
    for a,b in R:
        assert s.count(a)==1,(f,s.count(a),a[:70]); s=s.replace(a,b)
    open(f,'w').write(s); print('patched',f)
