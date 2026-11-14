#!/usr/bin/env python3
"""Guía Vitrix: profissionais destacados (advogado, médico, arquiteto, influencer…) que pagam para aparecer. platform/sitio.gpro"""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

GP_JS = r'''/* profissionais destacados da Guía (pagam para aparecer; somem sozinhos quando vence) */
const GP_A={salud:{es:'Salud',pt:'Saúde'},derecho:{es:'Abogados y escribanos',pt:'Advogados e tabeliães'},arq:{es:'Arquitectura e ingeniería',pt:'Arquitetura e engenharia'},cont:{es:'Contabilidad y finanzas',pt:'Contabilidade e finanças'},cre:{es:'Influencers y creadores',pt:'Influencers e criadores'},edu:{es:'Clases y educación',pt:'Aulas e educação'},tec:{es:'Tecnología y diseño',pt:'Tecnologia e design'},otro:{es:'Otros profesionales',pt:'Outros profissionais'}};
const GP_T={es:{h:'Profesionales destacados',sub:'Médicos, abogados, arquitectos, influencers… quien paga aparece en la Guía, agrupado por área, hasta la fecha de vencimiento.',one:'Profesional',none:'Todavía no hay profesionales.',n:'Nombre',a:'Área',e:'Profesión / especialidad',e_ph:'Ej.: Abogada · Derecho laboral',d:'Descripción corta (opcional)',ph:'Foto',wa:'WhatsApp',ig:'Instagram (usuario)',web:'Sitio o link (https://…)',bad:'Revisá el link del profesional'},
 pt:{h:'Profissionais em destaque',sub:'Médicos, advogados, arquitetos, influencers… quem paga aparece na Guia, agrupado por área, até a data de vencimento.',one:'Profissional',none:'Ainda não há profissionais.',n:'Nome',a:'Área',e:'Profissão / especialidade',e_ph:'Ex.: Advogada · Direito trabalhista',d:'Descrição curta (opcional)',ph:'Foto',wa:'WhatsApp',ig:'Instagram (usuário)',web:'Site ou link (https://…)',bad:'Confira o link do profissional'}};
const gpt=k=>GP_T[lang==='pt'?'pt':'es'][k];
function gpState(x){const d=guDay();if(!String(x.n||'').trim())return ['off',gpt('n')+'?'];if(!x.on)return ['off',gt('ad_on')+': no'];if(x.to&&x.to<d)return ['off',gt('ad_exp')];if(x.from&&x.from>d)return ['wait',gt('ad_wait')];return ['ok',gt('ad_live')]}
function gpCard(g){const T=GP_T[lang==='pt'?'pt':'es'],L=lang==='pt'?'pt':'es';const fld=(p,lab,val,o)=>{o=o||{};return `<div class="fld"><label for="gu_${p}">${lab}</label><input class="inp" id="gu_${p}" data-gu="${p}" value="${esc(val||'')}"${o.type?` type="${o.type}"`:''}${o.ph?` placeholder="${esc(o.ph)}"`:''}${o.im?` inputmode="${o.im}"`:''}></div>`};
 return `<div class="card"><h3>${ic('users',18)}${T.h}<span class="spacer"></span><button class="btn sm" data-act="guadd" data-k="pros">${ic('plus',15)}${gt('add')}</button></h3><p class="sub">${T.sub}</p>
 ${g.pros.length?g.pros.map((x,i)=>{const st=gpState(x);return `<div class="at-item gu-pro"><div class="at-head"><b>${esc(x.n||T.one+' '+(i+1))}</b><span class="pill gu-${st[0]}">${esc(st[1])}</span><span class="spacer"></span><button class="btn sm danger" data-act="gurm" data-k="pros" data-i="${i}">${ic('trash',14)}${t('remove')}</button></div>
  <div class="upl"><div class="thumb" style="width:64px;height:64px;border-radius:50%">${x.ph?`<img src="${x.ph}" alt="">`:ic('user',18)}</div><label class="btn sm filebtn">${ic('upload',15)}${t('choose_img')}<input type="file" accept="image/*" data-guprofile="${i}"></label></div>
  <div class="row2">${fld('pros.'+i+'.n',T.n,x.n)}<div class="fld"><label for="gu_pros.${i}.a">${T.a}</label><select class="inp" id="gu_pros.${i}.a" data-gu="pros.${i}.a">${Object.keys(GP_A).map(k=>`<option value="${k}" ${x.a===k?'selected':''}>${GP_A[k][L]}</option>`).join('')}</select></div></div>
  <div class="row2">${fld('pros.'+i+'.e',T.e,x.e,{ph:T.e_ph})}${fld('pros.'+i+'.d',T.d,x.d)}</div>
  <div class="row2">${fld('pros.'+i+'.wa',T.wa,x.wa,{im:'tel',ph:'0981 …'})}${fld('pros.'+i+'.ig',T.ig,x.ig,{ph:'@usuario'})}</div>${fld('pros.'+i+'.web',T.web,x.web,{im:'url',ph:'https://'})}
  <div class="row2">${fld('pros.'+i+'.from',gt('ad_from'),x.from,{type:'date'})}${fld('pros.'+i+'.to',gt('ad_to'),x.to,{type:'date'})}</div>
  <label class="chk"><input type="checkbox" data-gu="pros.${i}.on" ${x.on?'checked':''}> ${gt('ad_on')}</label></div>`}).join(''):`<p class="muted">${T.none}</p>`}</div>`}
'''

def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function gpCard(' in s:
        print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a))
        s = s.replace(a, b)
    rep('function guSet(path,v){', GP_JS + 'function guSet(path,v){')
    rep('return {ads,util}}', "const pros=(Array.isArray(c.gpro)?c.gpro:[]).filter(x=>x&&typeof x==='object').map(x=>({id:x.id||guId(),n:x.n||'',a:GP_A[x.a]?x.a:'otro',e:x.e||'',d:x.d||'',ph:x.ph||'',wa:x.wa||'',ig:x.ig||'',web:x.web||'',from:x.from||'',to:x.to||'',on:x.on!==false}));return {ads,util,pros}}")
    rep(' </div>\n <div class="sh-foot" style="gap:10px"><button class="btn-main" data-act="gusave"', ' ${gpCard(g)}\n </div>\n <div class="sh-foot" style="gap:10px"><button class="btn-main" data-act="gusave"')
    rep('return {ads,util,bad:ads.some(x=>x.u&&!okU(x.u))}}', "const pros=(g.pros||[]).filter(x=>String(x.n).trim()).map(x=>({id:x.id,n:String(x.n).trim().slice(0,80),a:x.a,e:String(x.e).trim().slice(0,90),d:String(x.d).trim().slice(0,140),ph:x.ph||'',wa:String(x.wa).replace(/[^\\d+ ]/g,'').trim().slice(0,20),ig:String(x.ig).trim().replace(/^@+/,'').replace(/^https?:\\/\\/(www\\.)?instagram\\.com\\//i,'').replace(/[^\\w.]/g,'').slice(0,40),web:String(x.web).trim(),from:x.from||'',to:x.to||'',on:!!x.on}));\n return {ads,util,pros,bad:ads.some(x=>x.u&&!okU(x.u)),badp:pros.some(x=>x.web&&!okU(x.web))}}")
    rep("if(c.bad){toast(gt('bad_u'),true);return}if(JSON.stringify(c.ads).length>780000)", "if(c.bad){toast(gt('bad_u'),true);return}if(c.badp){toast(gpt('bad'),true);return}if(JSON.stringify(c.ads).length+JSON.stringify(c.pros).length>880000)")
    rep('CLOUD.api.putGuia({gads:c.ads,gutil:c.util})', 'CLOUD.api.putGuia({gads:c.ads,gutil:c.util,gpro:c.pros})')
    rep('{gads:d.gads,gutil:d.gutil,gadsAt:', '{gads:d.gads,gutil:d.gutil,gpro:d.gpro||[],gadsAt:')
    rep('["gads","gutil","gadsAt"]', '["gads","gutil","gpro","gadsAt"]')
    rep('else g.util.push(', "else if(el.dataset.k==='pros')g.pros.push({id:guId(),n:'',a:'salud',e:'',d:'',ph:'',wa:'',ig:'',web:'',from:guDay(),to:'',on:true});else g.util.push(")
    rep('if(el.dataset.gufile!=null&&el.files', 'if(el.dataset.guprofile!=null&&el.files&&el.files[0]&&ui.gu){const i=+el.dataset.guprofile;resizeImg(el.files[0],360,u=>{if(ui.gu.pros[i])ui.gu.pros[i].ph=u;guSheet()},{q:.78});el.value="";return}\n if(el.dataset.gufile!=null&&el.files')
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')

for f in FILES:
    patch(f)
