#!/usr/bin/env python3
"""Guía Vitrix no painel: notícias do parceiro (platform/sitio.gnews) e relatório por WhatsApp para cada cliente."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

JS = r'''/* notícias do parceiro e relatório mensal para o cliente */
const GN_T={es:{h:'Noticias de Santa Rita (medio aliado)',sub:'Con el permiso del medio, la Guía muestra sus últimos titulares con foto y el link para leer en su sitio. Hace falta el link del feed (en WordPress: el sitio + /feed).',n:'Nombre del medio',site:'Sitio del medio (https://…)',feed:'Link del feed RSS (https://…/feed)',on:'Mostrar en la Guía',bad:'Revisá los links de las noticias (https://)',rep:'Enviar resumen',rep_msg:'Hola {n}! Te compartimos cómo le fue a tu negocio en la Guía Vitrix en los últimos 30 días: {c} veces tocaron tu negocio{s}. ¡Gracias por confiar en Vitrix! araujotechsistemas.com/guia',rep_s:' y apareció {s} veces en el slider'},
 pt:{h:'Notícias de Santa Rita (veículo parceiro)',sub:'Com a permissão do veículo, a Guia mostra as últimas manchetes com foto e o link para ler no site deles. Precisa do link do feed (no WordPress: o site + /feed).',n:'Nome do veículo',site:'Site do veículo (https://…)',feed:'Link do feed RSS (https://…/feed)',on:'Mostrar na Guia',bad:'Confira os links das notícias (https://)',rep:'Enviar resumo',rep_msg:'Hola {n}! Te compartimos cómo le fue a tu negocio en la Guía Vitrix en los últimos 30 días: {c} veces tocaron tu negocio{s}. ¡Gracias por confiar en Vitrix! araujotechsistemas.com/guia',rep_s:' y apareció {s} veces en el slider'}};
const gnt=k=>GN_T[lang==='pt'?'pt':'es'][k];
function gnCard(g){const T=GN_T[lang==='pt'?'pt':'es'],x=g.news;
 return `<div class="card"><h3>${ic('list',18)}${T.h}</h3><p class="sub">${T.sub}</p>
 <div class="row2">${gxFld('news.n',T.n,x.n)}${gxFld('news.site',T.site,x.site,{im:'url',ph:'https://'})}</div>${gxFld('news.feed',T.feed,x.feed,{im:'url',ph:'https://…/feed'})}
 <label class="chk"><input type="checkbox" data-gu="news.on" ${x.on?'checked':''}> ${T.on}</label></div>`}
function gnRep(id,st){const s=(PL.shops||[]).find(x=>x.id===id);if(!s)return '';let d=String(s.contact||'').replace(/\D/g,'');if(!d)return '';if(d.startsWith('0'))d='595'+d.slice(1);else if(!d.startsWith('595')&&d.length<=10)d='595'+d;
 const c=(st.c||{})[id]||0,sl=(st.s||{})['c-'+id]||0;const m=gnt('rep_msg').replace('{n}',s.name).replace('{c}',c).replace('{s}',sl?gnt('rep_s').replace('{s}',sl):'');
 return ` <a class="btn sm" style="padding:4px 10px" href="https://wa.me/${d}?text=${encodeURIComponent(m)}" target="_blank" rel="noopener">${ic('msg',13)}${gnt('rep')}</a>`}
'''

def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function gnCard(' in s:
        print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a))
        s = s.replace(a, b)
    rep('function guSet(path,v){', JS + 'function guSet(path,v){')
    rep("return {ads,util,pros,bus,turno,ev}}", "const n0=c.gnews&&typeof c.gnews==='object'?c.gnews:{};const news={n:n0.n||'',site:n0.site||'',feed:n0.feed||'',on:!!n0.on};return {ads,util,pros,bus,turno,ev,news}}")
    rep(' ${gbCard(g)}\n', ' ${gbCard(g)}\n ${gnCard(g)}\n')
    rep("\n return {ads,util,pros,bus,turno,ev,bade:", "\n const nw=g.news||{};const news={n:String(nw.n||'').trim().slice(0,60),site:String(nw.site||'').trim(),feed:String(nw.feed||'').trim(),on:!!nw.on};\n return {ads,util,pros,bus,turno,ev,news,badn:(news.site&&!okU(news.site))||(news.feed&&!okU(news.feed))||(news.on&&!news.feed),bade:")
    rep("if(c.bade){toast(gxt('bad_ev'),true);return}", "if(c.bade){toast(gxt('bad_ev'),true);return}if(c.badn){toast(gnt('bad'),true);return}")
    rep('gbus:c.bus,gturno:c.turno,gev:c.ev})', 'gbus:c.bus,gturno:c.turno,gev:c.ev,gnews:c.news})')
    rep('gturno:d.gturno||[],gev:d.gev||[],gadsAt:', 'gturno:d.gturno||[],gev:d.gev||[],gnews:d.gnews||{},gadsAt:')
    rep('["gads","gutil","gpro","gbus","gturno","gev","gadsAt"]', '["gads","gutil","gpro","gbus","gturno","gev","gnews","gadsAt"]')
    # botão de resumo ao lado de cada negócio nos números da Guía
    rep("map(([k,n])=>`<div><span>${esc(nm(k))}</span><b>${n}</b></div>`)", "map(([k,n])=>`<div><span>${esc(nm(k))}${gnRep(k,st)}</span><b>${n}</b></div>`)")
    # guSet: a.b (um nível de objeto) também redesenha o 'on' das notícias
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')

for f in FILES:
    patch(f)
