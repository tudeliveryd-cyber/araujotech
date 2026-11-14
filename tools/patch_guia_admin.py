#!/usr/bin/env python3
"""Guía Vitrix no Panel Araújo Tech: banners pagos do slider (platform/sitio.gads) e lugares públicos (platform/sitio.gutil)."""
import sys
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

GU_JS = r'''/* ===== Guía Vitrix (araujotechsistemas.com/guia): banners pagos do slider do topo e lugares públicos de Santa Rita ===== */
const GU_T={es:{title:'Guía Vitrix',sub:'Lo que aparece en araujotechsistemas.com/guia. Los clientes Premium y VIP entran solos en el slider; acá cargás las empresas que pagan por publicidad y los lugares públicos de la ciudad.',ads:'Banners pagos (slider del topo)',ads_sub:'Imagen horizontal (ideal 1200 × 500). Aparece con la etiqueta "Publicidad" solo entre las fechas elegidas.',ad:'Banner',ad_t:'Empresa / título',ad_s:'Texto corto (opcional)',ad_u:'Link al tocar (https://…)',ad_from:'Desde',ad_to:'Hasta (vence)',ad_on:'Activo',ad_img:'Imagen',ad_none:'Todavía no hay banners pagos.',ad_noimg:'Falta la imagen',ad_exp:'Vencido',ad_live:'En el aire',ad_wait:'Programado',add:'Agregar',pl:'Lugares públicos (Santa Rita útil)',pl_sub:'Municipalidad, documentos, salud, plazas, balnearios… Poné el teléfono solo si lo confirmaste. Sin link de mapa, la Guía busca el nombre en Google Maps.',pl_n:'Nombre',pl_c:'Tipo',pl_a:'Dirección',pl_tel:'Teléfono',pl_h:'Horario',pl_map:'Link de Google Maps',pl_none:'Todavía no hay lugares. La Guía muestra la lista básica.',pl_seed:'Cargar lista sugerida',save:'Guardar Guía',saved:'Guía guardada. En el sitio aparece en hasta 5 minutos.',err:'No se pudo guardar. Probá de nuevo.',big:'Las imágenes pasan del límite. Usá menos banners o imágenes más livianas.',bad_u:'Revisá el link del banner',
 c:{gob:'Gobierno y trámites',doc:'Documentos',salud:'Salud',seg:'Seguridad',ocio:'Plazas y recreación',trans:'Transporte',serv:'Servicios públicos',edu:'Educación'}},
 pt:{title:'Guia Vitrix',sub:'O que aparece em araujotechsistemas.com/guia. Os clientes Premium e VIP entram sozinhos no slider; aqui você cadastra as empresas que pagam por publicidade e os lugares públicos da cidade.',ads:'Banners pagos (slider do topo)',ads_sub:'Imagem horizontal (ideal 1200 × 500). Aparece com a etiqueta "Publicidad" só entre as datas escolhidas.',ad:'Banner',ad_t:'Empresa / título',ad_s:'Texto curto (opcional)',ad_u:'Link ao tocar (https://…)',ad_from:'Desde',ad_to:'Até (vence)',ad_on:'Ativo',ad_img:'Imagem',ad_none:'Ainda não há banners pagos.',ad_noimg:'Falta a imagem',ad_exp:'Vencido',ad_live:'No ar',ad_wait:'Agendado',add:'Adicionar',pl:'Lugares públicos (Santa Rita útil)',pl_sub:'Prefeitura, documentos, saúde, praças, balneários… Coloque o telefone só se confirmou. Sem link de mapa, a Guia busca o nome no Google Maps.',pl_n:'Nome',pl_c:'Tipo',pl_a:'Endereço',pl_tel:'Telefone',pl_h:'Horário',pl_map:'Link do Google Maps',pl_none:'Ainda não há lugares. A Guia mostra a lista básica.',pl_seed:'Carregar lista sugerida',save:'Salvar Guia',saved:'Guia salva. No site aparece em até 5 minutos.',err:'Não foi possível salvar. Tente de novo.',big:'As imagens passam do limite. Use menos banners ou imagens mais leves.',bad_u:'Confira o link do banner',
 c:{gob:'Governo e trâmites',doc:'Documentos',salud:'Saúde',seg:'Segurança',ocio:'Praças e lazer',trans:'Transporte',serv:'Serviços públicos',edu:'Educação'}}};
const gt=k=>GU_T[lang==='pt'?'pt':'es'][k];
/* lista sugerida: só nome e tipo (sem telefone inventado); o mapa busca pelo nome */
const GU_SEED=[['gob','Municipalidad de Santa Rita'],['doc','Registro Civil'],['doc','Identificaciones (cédula y pasaporte) · Policía Nacional'],['doc','Migraciones · oficina más cercana'],['gob','Juzgado de Paz de Santa Rita'],['salud','Hospital Distrital de Santa Rita'],['salud','IPS · Unidad Sanitaria Santa Rita'],['salud','USF · Unidad de Salud de la Familia'],['seg','Comisaría · Policía Nacional'],['seg','Bomberos Voluntarios de Santa Rita'],['ocio','Plaza central de Santa Rita'],['ocio','Polideportivo municipal'],['ocio','Balnearios y piscinas'],['trans','Terminal de ómnibus de Santa Rita'],['serv','ANDE · oficina de atención'],['serv','Correo Paraguayo']];
const guId=()=>Math.random().toString(36).slice(2,9);
const guDay=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function guNorm(c){c=c||{};const ads=(Array.isArray(c.gads)?c.gads:[]).filter(x=>x&&typeof x==='object').map(x=>({id:x.id||guId(),t:x.t||'',s:x.s||'',u:x.u||'',img:x.img||'',from:x.from||'',to:x.to||'',on:x.on!==false}));
 const util=(Array.isArray(c.gutil)?c.gutil:[]).filter(x=>x&&typeof x==='object').map(x=>({id:x.id||guId(),c:GU_T.es.c[x.c]?x.c:'gob',n:x.n||'',a:x.a||'',tel:x.tel||'',h:x.h||'',map:x.map||''}));return {ads,util}}
function guState(x){const d=guDay();if(!x.img)return ['off',gt('ad_noimg')];if(!x.on)return ['off',gt('ad_on')+': no'];if(x.to&&x.to<d)return ['off',gt('ad_exp')];if(x.from&&x.from>d)return ['wait',gt('ad_wait')];return ['ok',gt('ad_live')]}
function guSheet(){const g=ui.gu;if(!g)return;const T=GU_T[lang==='pt'?'pt':'es'];
 const fld=(p,lab,val,o)=>{o=o||{};return `<div class="fld"${o.w?` style="${o.w}"`:''}><label for="gu_${p}">${lab}</label><input class="inp" id="gu_${p}" data-gu="${p}" value="${esc(val||'')}"${o.type?` type="${o.type}"`:''}${o.ph?` placeholder="${esc(o.ph)}"`:''}${o.im?` inputmode="${o.im}"`:''}></div>`};
 openSheet(`<div class="sh-top"><h2>${T.title}</h2><button class="xbtn" data-act="close" aria-label="${t('close')}">${ic('x',18)}</button></div>
 <div class="sh-body at-body"><p class="sub" style="margin:0">${T.sub}</p>
 <div class="card"><h3>${ic('img',18)}${T.ads}<span class="spacer"></span><button class="btn sm" data-act="guadd" data-k="ads">${ic('plus',15)}${T.add}</button></h3><p class="sub">${T.ads_sub}</p>
 ${g.ads.length?g.ads.map((x,i)=>{const st=guState(x);return `<div class="at-item gu-ad"><div class="at-head"><b>${T.ad} ${i+1}</b><span class="pill gu-${st[0]}">${esc(st[1])}</span><span class="spacer"></span><button class="btn sm danger" data-act="gurm" data-k="ads" data-i="${i}">${ic('trash',14)}${t('remove')}</button></div>
  <div class="gu-img">${x.img?`<img src="${x.img}" alt="">`:`<span>${ic('img',22)}1200 × 500</span>`}</div><div class="upl"><label class="btn sm filebtn">${ic('upload',15)}${t('choose_img')}<input type="file" accept="image/*" data-gufile="${i}"></label></div>
  <div class="row2">${fld('ads.'+i+'.t',T.ad_t,x.t)}${fld('ads.'+i+'.u',T.ad_u,x.u,{ph:'https://',im:'url'})}</div>${fld('ads.'+i+'.s',T.ad_s,x.s)}
  <div class="row2">${fld('ads.'+i+'.from',T.ad_from,x.from,{type:'date'})}${fld('ads.'+i+'.to',T.ad_to,x.to,{type:'date'})}</div>
  <label class="chk"><input type="checkbox" data-gu="ads.${i}.on" ${x.on?'checked':''}> ${T.ad_on}</label></div>`}).join(''):`<p class="muted">${T.ad_none}</p>`}</div>
 <div class="card"><h3>${ic('pin',18)}${T.pl}<span class="spacer"></span>${g.util.length?'':`<button class="btn sm" data-act="guseed">${ic('list',15)}${T.pl_seed}</button>`}<button class="btn sm" data-act="guadd" data-k="util">${ic('plus',15)}${T.add}</button></h3><p class="sub">${T.pl_sub}</p>
 ${g.util.length?g.util.map((x,i)=>`<div class="at-item"><div class="at-head"><b>${esc(x.n||T.pl_n)}</b><span class="spacer"></span><button class="btn sm danger" data-act="gurm" data-k="util" data-i="${i}">${ic('trash',14)}${t('remove')}</button></div>
  <div class="row2">${fld('util.'+i+'.n',T.pl_n,x.n)}<div class="fld"><label for="gu_util.${i}.c">${T.pl_c}</label><select class="inp" id="gu_util.${i}.c" data-gu="util.${i}.c">${Object.keys(T.c).map(k=>`<option value="${k}" ${x.c===k?'selected':''}>${T.c[k]}</option>`).join('')}</select></div></div>
  <div class="row2">${fld('util.'+i+'.a',T.pl_a,x.a)}${fld('util.'+i+'.tel',T.pl_tel,x.tel,{im:'tel',ph:'061 …'})}</div>
  <div class="row2">${fld('util.'+i+'.h',T.pl_h,x.h,{ph:'Lun a vie 7:00 – 13:00'})}${fld('util.'+i+'.map',T.pl_map,x.map,{ph:'https://maps.app.goo.gl/…',im:'url'})}</div></div>`).join(''):`<p class="muted">${T.pl_none}</p>`}</div>
 </div>
 <div class="sh-foot" style="gap:10px"><button class="btn-main" data-act="gusave" ${ui.guSaving?'disabled':''}>${ui.guSaving?t('saving'):T.save}</button></div>`,true,'gu')}
function guSet(path,v){const ks=path.split('.');let o=ui.gu;for(const k of ks.slice(0,-1)){o=o[k];if(o==null)return}o[ks[ks.length-1]]=v;if(/\.on$/.test(path))guSheet()}
function guClean(g){const okU=u=>/^https:\/\/[^\s"'<>]+$/i.test(u);
 const ads=g.ads.filter(x=>x.img).map(x=>({id:x.id,t:String(x.t).trim().slice(0,80),s:String(x.s).trim().slice(0,120),u:String(x.u).trim(),img:x.img,from:x.from||'',to:x.to||'',on:!!x.on}));
 const util=g.util.filter(x=>String(x.n).trim()).map(x=>({id:x.id,c:x.c,n:String(x.n).trim().slice(0,90),a:String(x.a).trim().slice(0,140),tel:String(x.tel).replace(/[^\d+ ()-]/g,'').trim().slice(0,24),h:String(x.h).trim().slice(0,90),map:okU(String(x.map).trim())?String(x.map).trim():''}));
 return {ads,util,bad:ads.some(x=>x.u&&!okU(x.u))}}
'''

ACTS = r'''gusite(){ui.gu=null;openSheet(`<div class="sh-top"><h2>${gt('title')}</h2><button class="xbtn" data-act="close" aria-label="${t('close')}">${ic('x',18)}</button></div><div class="sh-body"><p class="muted">${t('loading')}</p></div>`,true,'gu');CLOUD.api.getSiteCfg().then(c=>{ui.gu=guNorm(c);if(document.querySelector('.sheet[data-k="gu"]'))guSheet()}).catch(e=>{console.warn(e);ui.gu=guNorm(null);guSheet()})},
 guadd(el){const g=ui.gu;if(!g)return;if(el.dataset.k==='ads')g.ads.push({id:guId(),t:'',s:'',u:'',img:'',from:guDay(),to:'',on:true});else g.util.push({id:guId(),c:'gob',n:'',a:'',tel:'',h:'',map:''});guSheet();const its=document.querySelectorAll('.sheet .at-item');const k=el.dataset.k==='ads'?document.querySelectorAll('.sheet .gu-ad'):its;k.length&&k[k.length-1].scrollIntoView({block:'center'})},
 gurm(el){const g=ui.gu;if(!g)return;g[el.dataset.k].splice(+el.dataset.i,1);guSheet()},
 guseed(){const g=ui.gu;if(!g||g.util.length)return;g.util=GU_SEED.map(([c,n])=>({id:guId(),c,n,a:'',tel:'',h:'',map:''}));guSheet()},
 async gusave(){const g=ui.gu;if(!g||ui.guSaving)return;const c=guClean(g);if(c.bad){toast(gt('bad_u'),true);return}if(JSON.stringify(c.ads).length>780000){toast(gt('big'),true);return}ui.guSaving=true;guSheet();try{await CLOUD.api.putGuia({gads:c.ads,gutil:c.util});toast(gt('saved'))}catch(e){console.warn(e);toast(gt('err'),true)}ui.guSaving=false;guSheet()},
 '''

CSS = '.gu-img{aspect-ratio:12/5;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--soft,#f4f2f7);display:grid;place-items:center;margin:4px 0 8px}.gu-img img{width:100%;height:100%;object-fit:cover;display:block}.gu-img span{display:flex;gap:8px;align-items:center;color:var(--muted);font-size:13px}.pill.gu-ok{background:#e3f6ea;color:#17663a}.pill.gu-wait{background:#fff4d6;color:#8a5a00}.pill.gu-off{background:#f1eef4;color:#6b6480}.chk{display:flex;gap:8px;align-items:center;font-size:14px;margin-top:6px}'

def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function guSheet()' in s:
        print(f, 'já tem'); return
    def rep(a, b, n=1):
        nonlocal s
        assert s.count(a) == n, (f, a[:60], s.count(a))
        s = s.replace(a, b)
    rep('<button class="btn sm pri" data-act="atsite">', '<button class="btn sm" data-act="gusite">${ic(\'map\',15)}Guía</button><button class="btn sm pri" data-act="atsite">')
    rep('atsite(){ui.at=null;', ACTS + 'atsite(){ui.at=null;')
    rep('function atSetPath(', GU_JS + 'function atSetPath(')
    # salvar o texto do site não pode apagar os banners nem os lugares da Guía
    rep('if(x.clientesAt)c.clientesAt=x.clientesAt}', 'if(x.clientesAt)c.clientesAt=x.clientesAt;["gads","gutil","gadsAt"].forEach(k=>{if(x[k]!==undefined&&c[k]===undefined)c[k]=x[k]})}')
    rep('putSiteClients(l){', 'putGuia(d){return setDoc(doc(db,\'platform\',\'sitio\'),{gads:d.gads,gutil:d.gutil,gadsAt:new Date().toISOString()},{merge:true})},\n  putSiteClients(l){')
    rep('if(d.at!=null&&ui.at){atSetPath(d.at,el.value);return}', 'if(d.at!=null&&ui.at){atSetPath(d.at,el.value);return}if(d.gu!=null&&ui.gu){guSet(d.gu,el.type==="checkbox"?el.checked:el.value);return}')
    rep('if(el.dataset.atfile&&el.files', 'if(el.dataset.gufile!=null&&el.files&&el.files[0]&&ui.gu){const i=+el.dataset.gufile;resizeImg(el.files[0],1200,u=>{if(ui.gu.ads[i])ui.gu.ads[i].img=u;guSheet()},{q:.8});el.value="";return}\n if(el.dataset.atfile&&el.files')
    i = s.find('</style>')
    s = s[:i] + CSS + s[i:]
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')

for f in FILES:
    patch(f)
