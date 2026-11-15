#!/usr/bin/env python3
"""Guía Vitrix no painel: notícias manuais (platform/sitio.gnews.man) — manchete, link (site ou Instagram) e foto opcional."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

JS = r'''/* notícias manuais: para o parceiro que só publica no Instagram (sem feed) */
const GM_T={es:{h:'Noticias cargadas a mano',sub:'Para el medio que publica en Instagram o no tiene feed: pegá el link de la publicación, escribí el titular y, si querés, subí la foto. Salen primero en la Guía. Máximo 8.',one:'Noticia',t:'Titular',u:'Link de la publicación (https://…)',d:'Fecha',bad:'Cada noticia necesita titular y un link que empiece con https://',ph:'Foto (opcional)'},
 pt:{h:'Notícias cadastradas à mão',sub:'Para o veículo que publica no Instagram ou não tem feed: cole o link da publicação, escreva a manchete e, se quiser, envie a foto. Saem primeiro na Guia. Máximo 8.',one:'Notícia',t:'Manchete',u:'Link da publicação (https://…)',d:'Data',bad:'Cada notícia precisa de manchete e de um link que comece com https://',ph:'Foto (opcional)'}};
const gmt=k=>GM_T[lang==='pt'?'pt':'es'][k];
function gmCard(g){const T=GM_T[lang==='pt'?'pt':'es'],l=g.news.man||[];
 return `<div class="card"><h3>${ic('list',18)}${T.h}<span class="spacer"></span>${l.length<8?`<button class="btn sm" data-act="guadd" data-k="man">${ic('plus',15)}${gt('add')}</button>`:''}</h3><p class="sub">${T.sub}</p>
 ${l.map((x,i)=>`<div class="at-item gu-man"><div class="at-head"><b>${esc(x.t||T.one+' '+(i+1))}</b><span class="spacer"></span><button class="btn sm danger" data-act="gurm" data-k="man" data-i="${i}">${ic('trash',14)}${t('remove')}</button></div>
  <div class="upl"><div class="thumb" style="width:88px;height:64px;border-radius:10px">${x.ph?`<img src="${x.ph}" alt="">`:ic('img',18)}</div><label class="btn sm filebtn">${ic('upload',15)}${T.ph}<input type="file" accept="image/*" data-gunewsfile="${i}"></label></div>
  ${gxFld('news.man.'+i+'.t',T.t,x.t)}
  <div class="row2">${gxFld('news.man.'+i+'.u',T.u,x.u,{im:'url',ph:'https://www.instagram.com/p/…'})}${gxFld('news.man.'+i+'.d',T.d,x.d,{type:'date'})}</div></div>`).join('')}</div>`}
'''


def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function gmCard(' in s:
        print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a))
        s = s.replace(a, b)
    rep('function guSet(path,v){', JS + 'function guSet(path,v){')
    # carregar
    rep("news={n:n0.n||'',site:n0.site||'',feed:n0.feed||'',on:!!n0.on}", "news={n:n0.n||'',site:n0.site||'',feed:n0.feed||'',on:!!n0.on,man:(Array.isArray(n0.man)?n0.man:[]).filter(x=>x&&typeof x==='object').map(x=>({id:x.id||guId(),t:x.t||'',u:x.u||'',d:x.d||'',ph:x.ph||''}))}")
    # tela
    rep(' ${gnCard(g)}\n', ' ${gnCard(g)}\n ${gmCard(g)}\n')
    # limpar e validar
    rep("feed:String(nw.feed||'').trim(),on:!!nw.on};", "feed:String(nw.feed||'').trim(),on:!!nw.on,man:(nw.man||[]).filter(x=>String(x.t).trim()||String(x.u).trim()).map(x=>({id:x.id,t:String(x.t).trim().slice(0,140),u:String(x.u).trim(),d:/^\\d{4}-\\d{2}-\\d{2}$/.test(x.d||'')?x.d:guDay(),ph:x.ph||''})).slice(0,8)};")
    rep("||(news.on&&!news.feed),bade:", "||(news.on&&!news.feed&&!news.man.length)||news.man.some(x=>!x.t||!okU(x.u)),bade:")
    rep("JSON.stringify(c.ads).length+JSON.stringify(c.pros).length", "JSON.stringify(c.ads).length+JSON.stringify(c.pros).length+JSON.stringify(c.news).length")
    rep("else if(el.dataset.k==='dir')g.dir.push(", "else if(el.dataset.k==='man'){if(g.news.man.length<8)g.news.man.unshift({id:guId(),t:'',u:'',d:guDay(),ph:''})}else if(el.dataset.k==='dir')g.dir.push(")
    rep(" if(el.dataset.guprofile!=null&&el.files", " if(el.dataset.gunewsfile!=null&&el.files&&el.files[0]&&ui.gu){const i=+el.dataset.gunewsfile;resizeImg(el.files[0],520,u=>{if(ui.gu.news.man[i])ui.gu.news.man[i].ph=u;guSheet()},{q:.76});el.value=\"\";return}\n if(el.dataset.guprofile!=null&&el.files")
    rep("gurm(el){const g=ui.gu;if(!g)return;g[el.dataset.k].splice(", "gurm(el){const g=ui.gu;if(!g)return;(el.dataset.k==='man'?g.news.man:g[el.dataset.k]).splice(")
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')


for f in FILES:
    patch(f)
