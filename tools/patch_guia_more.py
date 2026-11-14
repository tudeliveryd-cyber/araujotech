#!/usr/bin/env python3
"""Guía Vitrix: farmácia de turno (gturno), agenda de eventos (gev), estatísticas da Guía e 'Nuevo' (since) no painel."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

JS = r'''/* farmácia de turno, eventos e números da Guía */
const GX_T={es:{tu_h:'Farmacia de turno',tu_sub:'Cargá la farmacia de turno de cada día o semana. En la Guía aparece arriba, con Llamar y Cómo llegar.',tu_none:'Todavía no hay turnos cargados.',tu_n:'Farmacia',ev_h:'Agenda de eventos',ev_sub:'Fiestas, ferias, eventos de la ciudad. Aparecen hasta que pasa la fecha.',ev_none:'Todavía no hay eventos.',ev_t:'Evento',ev_d:'Fecha',ev_h2:'Hora (opcional)',ev_l:'Lugar',ev_u:'Link (opcional, https://…)',st_h:'Números de la Guía (últimos 30 días)',st_load:'Cargando…',st_err:'No se pudieron leer los números ahora.',st_v:'Visitas a la Guía',st_c:'Toques en negocios',st_s:'Veces que pasó en el slider',st_none:'Todavía sin datos.',st_biz:'Negocios más tocados',st_sl:'Slider (VIP y banners)',bad_ev:'Revisá el link del evento'},
 pt:{tu_h:'Farmácia de turno',tu_sub:'Cadastre a farmácia de turno de cada dia ou semana. Na Guia aparece em cima, com Ligar e Como chegar.',tu_none:'Ainda não há turnos.',tu_n:'Farmácia',ev_h:'Agenda de eventos',ev_sub:'Festas, feiras, eventos da cidade. Aparecem até passar a data.',ev_none:'Ainda não há eventos.',ev_t:'Evento',ev_d:'Data',ev_h2:'Hora (opcional)',ev_l:'Local',ev_u:'Link (opcional, https://…)',st_h:'Números da Guia (últimos 30 dias)',st_load:'Carregando…',st_err:'Não foi possível ler os números agora.',st_v:'Visitas à Guia',st_c:'Toques em negócios',st_s:'Vezes que passou no slider',st_none:'Ainda sem dados.',st_biz:'Negócios mais tocados',st_sl:'Slider (VIP e banners)',bad_ev:'Confira o link do evento'}};
const gxt=k=>GX_T[lang==='pt'?'pt':'es'][k];
function gxFld(p,lab,val,o){o=o||{};return `<div class="fld"><label for="gu_${p}">${lab}</label><input class="inp" id="gu_${p}" data-gu="${p}" value="${esc(val||'')}"${o.type?` type="${o.type}"`:''}${o.ph?` placeholder="${esc(o.ph)}"`:''}${o.im?` inputmode="${o.im}"`:''}></div>`}
function gxCards(g){const T=GX_T[lang==='pt'?'pt':'es'];const d0=guDay();
 const st=ui.guSt;const nm=id=>{const s=(PL.shops||[]).find(x=>x.id===id);return s?s.name:id};
 const stat=st==null?`<p class="muted">${T.st_load}</p>`:st===false?`<p class="muted">${T.st_err}</p>`:`<div class="gx-kpi"><div><b>${st.v||0}</b><span>${T.st_v}</span></div><div><b>${Object.values(st.c||{}).reduce((a,b)=>a+b,0)}</b><span>${T.st_c}</span></div><div><b>${Object.values(st.s||{}).reduce((a,b)=>a+b,0)}</b><span>${T.st_s}</span></div></div>
  ${Object.keys(st.c||{}).length?`<div class="gx-list"><span class="lbl">${T.st_biz}</span>${Object.entries(st.c).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,n])=>`<div><span>${esc(nm(k))}</span><b>${n}</b></div>`).join('')}</div>`:''}
  ${Object.keys(st.s||{}).length?`<div class="gx-list"><span class="lbl">${T.st_sl}</span>${Object.entries(st.s).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,n])=>`<div><span>${esc(k.startsWith('c-')?nm(k.slice(2)):((g.ads.find(a=>'a-'+a.id===k)||{}).t||k))}</span><b>${n}</b></div>`).join('')}</div>`:''}
  ${!st.v&&!Object.keys(st.c||{}).length?`<p class="muted">${T.st_none}</p>`:''}`;
 return `<div class="card"><h3>${ic('chart',18)}${T.st_h}</h3>${stat}</div>
 <div class="card"><h3>${ic('pill',18)}${T.tu_h}<span class="spacer"></span><button class="btn sm" data-act="guadd" data-k="turno">${ic('plus',15)}${gt('add')}</button></h3><p class="sub">${T.tu_sub}</p>
 ${g.turno.length?g.turno.map((x,i)=>`<div class="at-item"><div class="at-head"><b>${esc(x.n||T.tu_n)}</b>${x.from&&x.from<=d0&&(!x.to||x.to>=d0)?`<span class="pill gu-ok">${gt('ad_live')}</span>`:x.to&&x.to<d0?`<span class="pill gu-off">${gt('ad_exp')}</span>`:''}<span class="spacer"></span><button class="btn sm danger" data-act="gurm" data-k="turno" data-i="${i}">${ic('trash',14)}${t('remove')}</button></div>
  <div class="row2">${gxFld('turno.'+i+'.n',T.tu_n,x.n)}${gxFld('turno.'+i+'.tel',gpt('wa').replace('WhatsApp','Tel.'),x.tel,{im:'tel',ph:'0673 …'})}</div>
  <div class="row2">${gxFld('turno.'+i+'.from',gt('ad_from'),x.from,{type:'date'})}${gxFld('turno.'+i+'.to',gt('ad_to'),x.to,{type:'date'})}</div>
  <div class="row2">${gxFld('turno.'+i+'.a',gt('pl_a'),x.a)}${gxFld('turno.'+i+'.map',gt('pl_map'),x.map,{im:'url',ph:'https://maps.app.goo.gl/…'})}</div></div>`).join(''):`<p class="muted">${T.tu_none}</p>`}</div>
 <div class="card"><h3>${ic('ticket',18)}${T.ev_h}<span class="spacer"></span><button class="btn sm" data-act="guadd" data-k="ev">${ic('plus',15)}${gt('add')}</button></h3><p class="sub">${T.ev_sub}</p>
 ${g.ev.length?g.ev.map((x,i)=>`<div class="at-item"><div class="at-head"><b>${esc(x.t||T.ev_t)}</b>${x.d&&x.d<d0?`<span class="pill gu-off">${gt('ad_exp')}</span>`:''}<span class="spacer"></span><button class="btn sm danger" data-act="gurm" data-k="ev" data-i="${i}">${ic('trash',14)}${t('remove')}</button></div>
  ${gxFld('ev.'+i+'.t',T.ev_t,x.t)}<div class="row2">${gxFld('ev.'+i+'.d',T.ev_d,x.d,{type:'date'})}${gxFld('ev.'+i+'.h',T.ev_h2,x.h,{type:'time'})}</div>
  <div class="row2">${gxFld('ev.'+i+'.l',T.ev_l,x.l)}${gxFld('ev.'+i+'.u',T.ev_u,x.u,{im:'url',ph:'https://'})}</div></div>`).join(''):`<p class="muted">${T.ev_none}</p>`}</div>`}
async function guStats(){ui.guSt=null;try{const tk=await CLOUD.api.idToken();const r=await fetch('https://araujotechsistemas.com/sitio/guia_stats.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({t:tk})});const j=r.ok?await r.json():null;ui.guSt=j&&j.ok?j:false}catch(e){ui.guSt=false}if(document.querySelector('.sheet[data-k="gu"]'))guSheet()}
'''

CSS = '.gx-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 10px}.gx-kpi div{background:var(--soft,#f4f2f7);border-radius:12px;padding:10px 12px}.gx-kpi b{display:block;font-size:22px}.gx-kpi span{font-size:12px;color:var(--muted)}.gx-list{display:flex;flex-direction:column;gap:4px;margin-top:8px}.gx-list>div{display:flex;justify-content:space-between;gap:10px;font-size:14px;padding:6px 0;border-bottom:1px solid var(--line)}'

def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function gxCards(' in s:
        print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a))
        s = s.replace(a, b)
    rep('function guSet(path,v){', JS + 'function guSet(path,v){')
    rep("return {ads,util,pros,bus}}", "const turno=(Array.isArray(c.gturno)?c.gturno:[]).filter(x=>x&&typeof x==='object').map(x=>({n:x.n||'',tel:x.tel||'',from:x.from||'',to:x.to||'',a:x.a||'',map:x.map||''}));const ev=(Array.isArray(c.gev)?c.gev:[]).filter(x=>x&&typeof x==='object').map(x=>({t:x.t||'',d:x.d||'',h:x.h||'',l:x.l||'',u:x.u||''}));return {ads,util,pros,bus,turno,ev}}")
    rep(' ${gbCard(g)}\n', ' ${gxCards(g)}\n ${gbCard(g)}\n')
    rep("\n return {ads,util,pros,bus,bad:", "\n const turno=(g.turno||[]).filter(x=>String(x.n).trim()&&x.from).map(x=>({n:String(x.n).trim().slice(0,80),tel:String(x.tel).replace(/[^\\d+ ()-]/g,'').trim().slice(0,24),from:x.from,to:x.to||x.from,a:String(x.a).trim().slice(0,120),map:okU(String(x.map).trim())?String(x.map).trim():''})).sort((a,b)=>a.from.localeCompare(b.from));\n const ev=(g.ev||[]).filter(x=>String(x.t).trim()&&x.d).map(x=>({t:String(x.t).trim().slice(0,90),d:x.d,h:/^\\d{1,2}:\\d{2}$/.test(x.h||'')?x.h:'',l:String(x.l).trim().slice(0,80),u:String(x.u).trim()})).sort((a,b)=>(a.d+a.h).localeCompare(b.d+b.h));\n return {ads,util,pros,bus,turno,ev,bade:ev.some(x=>x.u&&!okU(x.u)),bad:")
    rep("if(c.badp){toast(gpt('bad'),true);return}", "if(c.badp){toast(gpt('bad'),true);return}if(c.bade){toast(gxt('bad_ev'),true);return}")
    rep('CLOUD.api.putGuia({gads:c.ads,gutil:c.util,gpro:c.pros,gbus:c.bus})', 'CLOUD.api.putGuia({gads:c.ads,gutil:c.util,gpro:c.pros,gbus:c.bus,gturno:c.turno,gev:c.ev})')
    rep('gbus:d.gbus||[],gadsAt:', 'gbus:d.gbus||[],gturno:d.gturno||[],gev:d.gev||[],gadsAt:')
    rep('["gads","gutil","gpro","gbus","gadsAt"]', '["gads","gutil","gpro","gbus","gturno","gev","gadsAt"]')
    rep("else if(el.dataset.k==='bus')", "else if(el.dataset.k==='turno')g.turno.push({n:'',tel:'',from:guDay(),to:guDay(),a:'',map:''});else if(el.dataset.k==='ev')g.ev.push({t:'',d:guDay(),h:'',l:'',u:''});else if(el.dataset.k==='bus')")
    # abrir a Guía também busca os números
    rep("CLOUD.api.getSiteCfg().then(c=>{ui.gu=guNorm(c);if(document.querySelector('.sheet[data-k=\"gu\"]'))guSheet()})", "CLOUD.api.getSiteCfg().then(c=>{ui.gu=guNorm(c);if(document.querySelector('.sheet[data-k=\"gu\"]'))guSheet();guStats()})")
    # 'Nuevo' na Guía: data de cadastro do cliente
    rep("dest:!!(cat&&guTier(s)>0),vip:!!(cat&&guTier(s)>1),", "dest:!!(cat&&guTier(s)>0),vip:!!(cat&&guTier(s)>1),since:String(s.created||'').slice(0,10),")
    i = s.find('</style>')
    s = s[:i] + CSS + s[i:]
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')

for f in FILES:
    patch(f)
