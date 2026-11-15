# Horários: o que se digita na segunda-feira vai para os outros dias que ainda estavam iguais (catálogo e ficha da Guía);
# ficha simples ganha horário por dia (Abierto ahora na Guía).
import sys
R=[
# --- catálogo: segunda puxa os outros dias
("if(d.day!=null&&d.day!==''){const i=+d.day,f=d.f;applyBoth(c=>{const dd=c.store.days[i];if(f==='on')dd.on=el.checked;else dd[f[0]][+f[1]]=el.value});",
 "if(d.day!=null&&d.day!==''){const i=+d.day,f=d.f;let fol=false;applyBoth(c=>{const dd=c.store.days[i];if(f==='on')dd.on=el.checked;else{const old=dd[f[0]][+f[1]]||'';dd[f[0]][+f[1]]=el.value;if(i===1)c.store.days.forEach((o,k)=>{if(k!==1&&o&&o.on&&(o[f[0]][+f[1]]||'')===old){o[f[0]][+f[1]]=el.value;fol=true}})}});if(fol&&e.type==='change')render();"),
("sched_note:'Deixe o turno 2 vazio se a loja abre só uma vez no dia.'","sched_note:'Deixe o turno 2 vazio se a loja abre só uma vez no dia. O horário da segunda-feira é copiado para os outros dias que estavam iguais; depois é só ajustar o que muda.'"),
("sched_note:'Dejá el turno 2 vacío si el local abre una sola vez al día.'","sched_note:'Dejá el turno 2 vacío si el local abre una sola vez al día. El horario del lunes se copia a los otros días que estaban iguales; después solo ajustá lo que cambia.'"),
# --- ficha: editor por dia
("  <div class=\"row2\">${gxFld('dir.'+i+'.d',T.d,x.d)}${gxFld('dir.'+i+'.hrs',T.hrs,x.hrs)}</div>",
 "  ${gxFld('dir.'+i+'.d',T.d,x.d)}\n  <div class=\"fld\"><label>${T.dy}</label><div class=\"gu-dy\">${[1,2,3,4,5,6,0].map(k=>{const o=(x.dy||[])[k]||{on:!x.dy,a:['',''],b:['','']};const tm=(f,v)=>`<input type=\"time\" class=\"inp\" data-gudy=\"${i}\" data-day=\"${k}\" data-f=\"${f}\" value=\"${v||''}\" ${o.on?'':'disabled'} aria-label=\"${DAYN[L][k]}\">`;return `<div class=\"day\"><b>${DAYN[L][k]}</b><input type=\"checkbox\" class=\"tog\" data-gudy=\"${i}\" data-day=\"${k}\" data-f=\"on\" ${o.on?'checked':''} aria-label=\"${DAYN[L][k]}\"><div class=\"pair\">${tm('a0',o.a[0])}<span>–</span>${tm('a1',o.a[1])}</div><div class=\"pair b\">${tm('b0',o.b[0])}<span>–</span>${tm('b1',o.b[1])}</div></div>`}).join('')}</div><span class=\"note\">${T.dyn}</span></div>\n  ${gxFld('dir.'+i+'.hrs',T.hrs,x.hrs)}"),
("nowa:'Falta WhatsApp',mt:'Botón'","nowa:'Falta WhatsApp',dy:'Horario por día',dyn:'Poné el horario del lunes y se copia a los otros días; después cambiá solo lo que es distinto (o apagá el día que cierra). Turno 2 vacío si abre una sola vez.',mt:'Botón'"),
("nowa:'Falta WhatsApp',mt:'Botão'","nowa:'Falta WhatsApp',dy:'Horário por dia',dyn:'Coloque o horário da segunda e ele é copiado para os outros dias; depois mude só o que é diferente (ou desligue o dia que fecha). Turno 2 vazio se abre só uma vez.',mt:'Botão'"),
("hrs:'Horario (ej.: Lun a sáb, 7 a 18)'","hrs:'Nota de horario (opcional, ej.: feriados cerrado)'"),
("hrs:'Horário (ex.: Seg a sáb, 7 às 18)'","hrs:'Nota de horário (opcional, ex.: feriados fechado)'"),
(" if(el.dataset.gutu!=null&&ui.gu){",
 " if(el.dataset.gudy!=null&&ui.gu){const x=ui.gu.dir[+el.dataset.gudy];if(!x)return;if(!Array.isArray(x.dy)||x.dy.length!==7)x.dy=[0,1,2,3,4,5,6].map(()=>({on:true,a:['',''],b:['','']}));const k=+el.dataset.day,f=el.dataset.f,o=x.dy[k];if(f==='on'){o.on=el.checked;guSheet();return}const old=o[f[0]][+f[1]]||'';o[f[0]][+f[1]]=el.value;if(k===1){let ch=false;x.dy.forEach((d,j)=>{if(j!==1&&d.on&&(d[f[0]][+f[1]]||'')===old){d[f[0]][+f[1]]=el.value;ch=true}});if(ch)guSheet()}return}\n if(el.dataset.gutu!=null&&ui.gu){"),
("mt:x.mt==='cat'?'cat':'menu',mu:x.mu||'',on:x.on!==false}));","mt:x.mt==='cat'?'cat':'menu',mu:x.mu||'',dy:Array.isArray(x.dy)&&x.dy.length===7?x.dy.map(d=>({on:!!(d&&d.on),a:[(d&&d.a||[])[0]||'',(d&&d.a||[])[1]||''],b:[(d&&d.b||[])[0]||'',(d&&d.b||[])[1]||'']})):null,on:x.on!==false}));"),
("mt:x.mt==='cat'?'cat':'menu',mu:String(x.mu||'').trim(),on:!!x.on})).slice(0,300);",
 "mt:x.mt==='cat'?'cat':'menu',mu:String(x.mu||'').trim(),dy:guDy(x.dy),on:!!x.on})).slice(0,300);"),
("function guClean(g){","function guDy(dy){const ok=v=>/^\\d{2}:\\d{2}$/.test(v||'')?v:'';if(!Array.isArray(dy)||dy.length!==7)return null;const o=dy.map(d=>({on:!!(d&&d.on),a:[ok(d&&d.a&&d.a[0]),ok(d&&d.a&&d.a[1])],b:[ok(d&&d.b&&d.b[0]),ok(d&&d.b&&d.b[1])]}));return o.some(d=>d.on&&d.a[0]&&d.a[1])?o:null}\nfunction guClean(g){"),
(".gu-tu{",".gu-dy{display:flex;flex-direction:column;gap:6px}.gu-tu{"),
]
for f in sys.argv[1:]:
    s=open(f).read()
    if 'data-gudy' in s: print('ok',f); continue
    for a,b in R:
        assert s.count(a)==1,(f,s.count(a),a[:70]); s=s.replace(a,b)
    open(f,'w').write(s); print('patched',f)
