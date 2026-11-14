#!/usr/bin/env python3
"""Guía Vitrix no painel: fichas simples de negócios sem catálogo (platform/sitio.gdir)."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

JS = r'''/* negócios sem catálogo: ficha simples na Guía (nome, rubro, telefone, endereço, horário) */
const GD_G={food:{es:'Comida y bebidas',pt:'Comida e bebidas'},shop:{es:'Tiendas y moda',pt:'Lojas e moda'},health:{es:'Salud y belleza',pt:'Saúde e beleza'},home:{es:'Hogar y construcción',pt:'Casa e construção'},car:{es:'Autos, motos y náutica',pt:'Carros, motos e náutica'},serv:{es:'Servicios y otros',pt:'Serviços e outros'}};
const GD_T={es:{h:'Negocios sin catálogo (ficha simple)',sub:'Negocios de la ciudad que todavía no tienen Vitrix. Aparecen en su categoría, después de los clientes Vitrix, con teléfono y cómo llegar. Cargá solo datos confirmados con el negocio.',none:'Todavía no hay fichas.',one:'Ficha',n:'Nombre del negocio',g:'Categoría',d:'Rubro (ej.: Ferretería)',tel:'Teléfono',wa:'WhatsApp',a:'Dirección',map:'Link de Google Maps (https://…)',hrs:'Horario (ej.: Lun a sáb, 7 a 18)',on:'Mostrar en la Guía',bad:'Revisá el link del mapa de las fichas (https://)',hid:'Oculta'},
 pt:{h:'Negócios sem catálogo (ficha simples)',sub:'Negócios da cidade que ainda não têm Vitrix. Aparecem na categoria deles, depois dos clientes Vitrix, com telefone e como chegar. Cadastre só dados confirmados com o negócio.',none:'Ainda não há fichas.',one:'Ficha',n:'Nome do negócio',g:'Categoria',d:'Ramo (ex.: Ferragem)',tel:'Telefone',wa:'WhatsApp',a:'Endereço',map:'Link do Google Maps (https://…)',hrs:'Horário (ex.: Seg a sáb, 7 às 18)',on:'Mostrar na Guia',bad:'Confira o link do mapa das fichas (https://)',hid:'Oculta'}};
const gdt=k=>GD_T[lang==='pt'?'pt':'es'][k];
function gdCard(g){const T=GD_T[lang==='pt'?'pt':'es'],L=lang==='pt'?'pt':'es';
 return `<div class="card"><h3>${ic('store',18)}${T.h}<span class="spacer"></span><button class="btn sm" data-act="guadd" data-k="dir">${ic('plus',15)}${gt('add')}</button></h3><p class="sub">${T.sub}</p>
 ${g.dir.length?g.dir.map((x,i)=>`<div class="at-item gu-dir"><div class="at-head"><b>${esc(x.n||T.one+' '+(i+1))}</b>${x.on?'':`<span class="pill gu-off">${T.hid}</span>`}<span class="spacer"></span><button class="btn sm danger" data-act="gurm" data-k="dir" data-i="${i}">${ic('trash',14)}${t('remove')}</button></div>
  <div class="row2">${gxFld('dir.'+i+'.n',T.n,x.n)}<div class="fld"><label for="gu_dir.${i}.g">${T.g}</label><select class="inp" id="gu_dir.${i}.g" data-gu="dir.${i}.g">${Object.keys(GD_G).map(k=>`<option value="${k}" ${x.g===k?'selected':''}>${GD_G[k][L]}</option>`).join('')}</select></div></div>
  <div class="row2">${gxFld('dir.'+i+'.d',T.d,x.d)}${gxFld('dir.'+i+'.hrs',T.hrs,x.hrs)}</div>
  <div class="row2">${gxFld('dir.'+i+'.tel',T.tel,x.tel,{im:'tel',ph:'0673 …'})}${gxFld('dir.'+i+'.wa',T.wa,x.wa,{im:'tel',ph:'09…'})}</div>
  <div class="row2">${gxFld('dir.'+i+'.a',T.a,x.a)}${gxFld('dir.'+i+'.map',T.map,x.map,{im:'url',ph:'https://maps.app.goo.gl/…'})}</div>
  <label class="chk"><input type="checkbox" data-gu="dir.${i}.on" ${x.on?'checked':''}> ${T.on}</label></div>`).join(''):`<p class="muted">${T.none}</p>`}</div>`}
'''


def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function gdCard(' in s:
        print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a))
        s = s.replace(a, b)
    rep('function guSet(path,v){', JS + 'function guSet(path,v){')
    # carregar
    rep("return {ads,util,pros,bus,turno,ev,news}}", "const dir=(Array.isArray(c.gdir)?c.gdir:[]).filter(x=>x&&typeof x==='object').map(x=>({id:x.id||guId(),n:x.n||'',g:GD_G[x.g]?x.g:'serv',d:x.d||'',tel:x.tel||'',wa:x.wa||'',a:x.a||'',map:x.map||'',hrs:x.hrs||'',on:x.on!==false}));return {ads,util,pros,bus,turno,ev,news,dir}}")
    # tela
    rep(' ${gnCard(g)}\n', ' ${gdCard(g)}\n ${gnCard(g)}\n')
    # limpar e validar
    rep("\n return {ads,util,pros,bus,turno,ev,news,badn:", "\n const dir=(g.dir||[]).filter(x=>String(x.n).trim()).map(x=>({id:x.id,n:String(x.n).trim().slice(0,80),g:GD_G[x.g]?x.g:'serv',d:String(x.d).trim().slice(0,60),tel:String(x.tel).replace(/[^\\d+ ()-]/g,'').trim().slice(0,24),wa:String(x.wa).replace(/[^\\d+ ]/g,'').trim().slice(0,20),a:String(x.a).trim().slice(0,140),map:String(x.map).trim(),hrs:String(x.hrs).trim().slice(0,80),on:!!x.on})).slice(0,300);\n return {dir,badd:dir.some(x=>x.map&&!okU(x.map)),ads,util,pros,bus,turno,ev,news,badn:")
    rep("if(c.badn){toast(gnt('bad'),true);return}", "if(c.badn){toast(gnt('bad'),true);return}if(c.badd){toast(gdt('bad'),true);return}")
    rep('gturno:c.turno,gev:c.ev,gnews:c.news})', 'gturno:c.turno,gev:c.ev,gnews:c.news,gdir:c.dir})')
    rep('gnews:d.gnews||{},gadsAt:', 'gnews:d.gnews||{},gdir:d.gdir||[],gadsAt:')
    rep('["gads","gutil","gpro","gbus","gturno","gev","gnews","gadsAt"]', '["gads","gutil","gpro","gbus","gturno","gev","gnews","gdir","gadsAt"]')
    rep("else if(el.dataset.k==='bus')", "else if(el.dataset.k==='dir')g.dir.push({id:guId(),n:'',g:'serv',d:'',tel:'',wa:'',a:'',map:'',hrs:'',on:true});else if(el.dataset.k==='bus')")
    # nos números da Guía, a ficha aparece com o nome (o toque é contado como d-<id>)
    rep("const st=ui.guSt;const nm=id=>{const s=(PL.shops||[]).find(x=>x.id===id);return s?s.name:id};", "const st=ui.guSt;const nm=id=>{const s=(PL.shops||[]).find(x=>x.id===id);if(s)return s.name;const d=/^d-/.test(id)&&(g.dir||[]).find(x=>'d-'+x.id===id);return d?d.n:id};")
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')


for f in FILES:
    patch(f)
