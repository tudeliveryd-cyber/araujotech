# Guía: "Aliado Tu Delivery" na ficha simples (logo, Instagram, selo Entrega Tu Delivery + Recomendado)
import sys
R=[
("hrs:'Horario (ej.: Lun a sáb, 7 a 18)',on:'Mostrar en la Guía',bad:'Revisá el link del mapa de las fichas (https://)',hid:'Oculta'}",
 "hrs:'Horario (ej.: Lun a sáb, 7 a 18)',on:'Mostrar en la Guía',bad:'Revisá el link del mapa de las fichas (https://)',hid:'Oculta',td:'Cliente Tu Delivery: sello \"Entrega Tu Delivery\" y Recomendado, gratis',tdp:'Aliado Tu Delivery',ig:'Instagram (@usuario)',lg:'Logo',lgrm:'Quitar logo',wa_td:'WhatsApp del negocio (ahí llegan los pedidos)'}"),
("hrs:'Horário (ex.: Seg a sáb, 7 às 18)',on:'Mostrar na Guia',bad:'Confira o link do mapa das fichas (https://)',hid:'Oculta'}",
 "hrs:'Horário (ex.: Seg a sáb, 7 às 18)',on:'Mostrar na Guia',bad:'Confira o link do mapa das fichas (https://)',hid:'Oculta',td:'Cliente Tu Delivery: selo \"Entrega Tu Delivery\" e Recomendado, grátis',tdp:'Aliado Tu Delivery',ig:'Instagram (@usuário)',lg:'Logo',lgrm:'Tirar logo',wa_td:'WhatsApp do negócio (lá chegam os pedidos)'}"),
("${x.on?'':`<span class=\"pill gu-off\">${T.hid}</span>`}<span class=\"spacer\"></span><button class=\"btn sm danger\" data-act=\"gurm\" data-k=\"dir\"",
 "${x.td?`<span class=\"pill gu-ok\">${T.tdp}</span>`:''}${x.on?'':`<span class=\"pill gu-off\">${T.hid}</span>`}<span class=\"spacer\"></span><button class=\"btn sm danger\" data-act=\"gurm\" data-k=\"dir\""),
("  <div class=\"row2\">${gxFld('dir.'+i+'.tel',T.tel,x.tel,{im:'tel',ph:'0673 …'})}${gxFld('dir.'+i+'.wa',T.wa,x.wa,{im:'tel',ph:'09…'})}</div>",
 "  <label class=\"chk\"><input type=\"checkbox\" data-gu=\"dir.${i}.td\" ${x.td?'checked':''}> ${T.td}</label>\n  <div class=\"upl\"><div class=\"thumb\" style=\"width:64px;height:64px;border-radius:14px\">${x.lg?`<img src=\"${x.lg}\" alt=\"\">`:ic('img',18)}</div><label class=\"btn sm filebtn\">${ic('upload',15)}${T.lg}<input type=\"file\" accept=\"image/*\" data-gudirlogo=\"${i}\"></label>${x.lg?`<button class=\"btn sm\" data-act=\"gudirlgrm\" data-i=\"${i}\">${ic('trash',14)}${T.lgrm}</button>`:''}</div>\n  <div class=\"row2\">${gxFld('dir.'+i+'.tel',T.tel,x.tel,{im:'tel',ph:'0673 …'})}${gxFld('dir.'+i+'.wa',x.td?T.wa_td:T.wa,x.wa,{im:'tel',ph:'09…'})}</div>\n  ${gxFld('dir.'+i+'.ig',T.ig,x.ig,{ph:'@negocio'})}"),
("else if(el.dataset.k==='dir')g.dir.push({id:guId(),n:'',g:'serv',d:'',tel:'',wa:'',a:'',map:'',hrs:'',on:true});",
 "else if(el.dataset.k==='dir')g.dir.push({id:guId(),n:'',g:'serv',d:'',tel:'',wa:'',a:'',map:'',hrs:'',ig:'',lg:'',td:false,on:true});"),
("hrs:String(x.hrs).trim().slice(0,80),on:!!x.on})).slice(0,300);",
 "hrs:String(x.hrs).trim().slice(0,80),ig:String(x.ig||'').trim().replace(/^@+/,'').replace(/^https?:\\/\\/(www\\.)?instagram\\.com\\//i,'').replace(/[^\\w.]/g,'').slice(0,40),lg:/^data:image\\/(jpeg|png|webp);base64,/.test(x.lg||'')?x.lg:'',td:!!x.td,on:!!x.on})).slice(0,300);"),
("if(JSON.stringify(c.ads).length+JSON.stringify(c.pros).length+JSON.stringify(c.news).length>880000)",
 "if(JSON.stringify(c.ads).length+JSON.stringify(c.pros).length+JSON.stringify(c.news).length+JSON.stringify(c.dir).length>880000)"),
(" if(el.dataset.guprofile!=null&&el.files&&el.files[0]&&ui.gu){",
 " if(el.dataset.gudirlogo!=null&&el.files&&el.files[0]&&ui.gu){const i=+el.dataset.gudirlogo;resizeImg(el.files[0],140,u=>{if(ui.gu.dir[i])ui.gu.dir[i].lg=u;guSheet()},{q:.78});el.value=\"\";return}\n if(el.dataset.guprofile!=null&&el.files&&el.files[0]&&ui.gu){"),
(" gucopy(){const st=ui.guSt;"," gudirlgrm(el){const g=ui.gu;if(!g||!g.dir[+el.dataset.i])return;g.dir[+el.dataset.i].lg='';guSheet()},\n gucopy(){const st=ui.guSt;"),
]
for f in sys.argv[1:]:
    s=open(f).read()
    if 'gudirlogo' in s: print('ok',f); continue
    for a,b in R:
        assert s.count(a)==1,(f,s.count(a),a[:80]); s=s.replace(a,b)
    open(f,'w').write(s); print('patched',f)
