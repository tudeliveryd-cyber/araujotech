#!/usr/bin/env python3
"""Guía Vitrix: horários dos ônibus da terminal de Santa Rita (platform/sitio.gbus), cadastrados no painel."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

GB_JS = r'''/* horários de ônibus da terminal (Guía · Santa Rita útil) */
const GB_D={cde:{es:'Ciudad del Este',pt:'Ciudad del Este'},asu:{es:'Asunción',pt:'Assunção'},enc:{es:'Encarnación',pt:'Encarnación'},otro:{es:'Otro destino',pt:'Outro destino'}};
const GB_T={es:{h:'Horarios de ómnibus (terminal)',sub:'Salidas desde Santa Rita. Cargá lo que dice la terminal o la empresa; la Guía muestra la próxima salida. Revisalo cada tanto: los horarios cambian.',none:'Todavía no hay horarios.',d:'Destino',dn:'Nombre del destino',e:'Empresa',h:'Hora de salida',dias:'Días (opcional)',dias_ph:'Lun a sáb',obs:'Detalle (opcional)',obs_ph:'Directo · vía Naranjal…',dup:'Duplicar'},
 pt:{h:'Horários de ônibus (terminal)',sub:'Saídas de Santa Rita. Cadastre o que diz a terminal ou a empresa; a Guia mostra a próxima saída. Revise de vez em quando: os horários mudam.',none:'Ainda não há horários.',d:'Destino',dn:'Nome do destino',e:'Empresa',h:'Hora de saída',dias:'Dias (opcional)',dias_ph:'Seg a sáb',obs:'Detalhe (opcional)',obs_ph:'Direto · via Naranjal…',dup:'Duplicar'}};
function gbCard(g){const T=GB_T[lang==='pt'?'pt':'es'],L=lang==='pt'?'pt':'es';const fld=(p,lab,val,o)=>{o=o||{};return `<div class="fld"><label for="gu_${p}">${lab}</label><input class="inp" id="gu_${p}" data-gu="${p}" value="${esc(val||'')}"${o.type?` type="${o.type}"`:''}${o.ph?` placeholder="${esc(o.ph)}"`:''}></div>`};
 return `<div class="card"><h3>${ic('truck',18)}${T.h}<span class="spacer"></span><button class="btn sm" data-act="guadd" data-k="bus">${ic('plus',15)}${gt('add')}</button></h3><p class="sub">${T.sub}</p>
 ${g.bus.length?g.bus.map((x,i)=>`<div class="at-item gu-bus"><div class="at-head"><b>${esc((x.d==='otro'?x.dn:GB_D[x.d][L])||'')} · ${esc(x.h||'--:--')}</b><span class="spacer"></span><button class="btn sm" data-act="gubusdup" data-i="${i}">${ic('copy',14)}${T.dup}</button><button class="btn sm danger" data-act="gurm" data-k="bus" data-i="${i}">${ic('trash',14)}${t('remove')}</button></div>
  <div class="row2"><div class="fld"><label for="gu_bus.${i}.d">${T.d}</label><select class="inp" id="gu_bus.${i}.d" data-gu="bus.${i}.d">${Object.keys(GB_D).map(k=>`<option value="${k}" ${x.d===k?'selected':''}>${GB_D[k][L]}</option>`).join('')}</select></div>${x.d==='otro'?fld('bus.'+i+'.dn',T.dn,x.dn):fld('bus.'+i+'.h',T.h,x.h,{type:'time'})}</div>
  ${x.d==='otro'?fld('bus.'+i+'.h',T.h,x.h,{type:'time'}):''}
  <div class="row2">${fld('bus.'+i+'.e',T.e,x.e)}${fld('bus.'+i+'.dias',T.dias,x.dias,{ph:T.dias_ph})}</div>${fld('bus.'+i+'.obs',T.obs,x.obs,{ph:T.obs_ph})}</div>`).join(''):`<p class="muted">${T.none}</p>`}</div>`}
'''

def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function gbCard(' in s:
        print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a))
        s = s.replace(a, b)
    rep('function guSet(path,v){', GB_JS + 'function guSet(path,v){')
    rep("on:x.on!==false}));return {ads,util,pros}}", "on:x.on!==false}));const bus=(Array.isArray(c.gbus)?c.gbus:[]).filter(x=>x&&typeof x==='object').map(x=>({d:GB_D[x.d]?x.d:'otro',dn:x.dn||'',e:x.e||'',h:x.h||'',dias:x.dias||'',obs:x.obs||''}));return {ads,util,pros,bus}}")
    rep(' ${gpCard(g)}\n', ' ${gbCard(g)}\n ${gpCard(g)}\n')
    rep("\n return {ads,util,pros,bad:", "\n const bus=(g.bus||[]).filter(x=>/^\\d{1,2}:\\d{2}$/.test(String(x.h||''))&&(x.d!=='otro'||String(x.dn).trim())).map(x=>({d:x.d,dn:x.d==='otro'?String(x.dn).trim().slice(0,40):'',e:String(x.e).trim().slice(0,50),h:x.h,dias:String(x.dias).trim().slice(0,40),obs:String(x.obs).trim().slice(0,80)})).sort((a,b)=>a.d.localeCompare(b.d)||a.h.localeCompare(b.h));\n return {ads,util,pros,bus,bad:")
    rep('CLOUD.api.putGuia({gads:c.ads,gutil:c.util,gpro:c.pros})', 'CLOUD.api.putGuia({gads:c.ads,gutil:c.util,gpro:c.pros,gbus:c.bus})')
    rep('gpro:d.gpro||[],gadsAt:', 'gpro:d.gpro||[],gbus:d.gbus||[],gadsAt:')
    rep('["gads","gutil","gpro","gadsAt"]', '["gads","gutil","gpro","gbus","gadsAt"]')
    rep("else if(el.dataset.k==='pros')", "else if(el.dataset.k==='bus')g.bus.push({d:'cde',dn:'',e:'',h:'',dias:'',obs:''});else if(el.dataset.k==='pros')")
    rep(' gurm(el){', ' gubusdup(el){const g=ui.gu;if(!g)return;const i=+el.dataset.i,x=g.bus[i];if(!x)return;g.bus.splice(i+1,0,Object.assign({},x,{h:\'\'}));guSheet()},\n gurm(el){')
    # trocar destino (otro ↔ fixo) redesenha o formulário
    rep("if(/\\.on$/.test(path))guSheet()}", "if(/\\.on$/.test(path)||/^bus\\.\\d+\\.d$/.test(path))guSheet()}")
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')

for f in FILES:
    patch(f)
