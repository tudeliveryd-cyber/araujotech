#!/usr/bin/env python3
"""Guía Vitrix no painel: 'Lo más buscado', visitas por dia e 'Copiar resumen del mes' nos números da Guía."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

JS = r'''/* relatório do mês da Guía (buscas, visitas por dia, resumo para copiar) */
const GR_T={es:{q:'Lo más buscado en la Guía',vd:'Visitas por día',cp:'Copiar resumen del mes',ok:'Resumen copiado',r_h:'Guía Vitrix · resumen de los últimos 30 días',r_v:'Visitas a la Guía',r_c:'Toques en negocios',r_s:'Veces en el slider',r_biz:'Negocios más tocados',r_q:'Lo más buscado',r_best:'Mejor día'},
 pt:{q:'O mais buscado na Guia',vd:'Visitas por dia',cp:'Copiar resumo do mês',ok:'Resumo copiado',r_h:'Guia Vitrix · resumo dos últimos 30 dias',r_v:'Visitas à Guia',r_c:'Toques em negócios',r_s:'Vezes no slider',r_biz:'Negócios mais tocados',r_q:'O mais buscado',r_best:'Melhor dia'}};
const grt=k=>GR_T[lang==='pt'?'pt':'es'][k];
function grDays(st){const vd=st.vd||{},o=[];const d=new Date();for(let i=29;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-i);const k=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');o.push([k,+vd[k]||0])}return o}
function grBlocks(st){const q=Object.entries(st.q||{}).sort((a,b)=>b[1]-a[1]).slice(0,10);const ds=grDays(st),mx=Math.max(1,...ds.map(x=>x[1]));const anyD=ds.some(x=>x[1]);
 return `${q.length?`<div class="gx-list"><span class="lbl">${grt('q')}</span>${q.map(([k,n])=>`<div><span>${esc(k.replace(/-/g,' '))}</span><b>${n}</b></div>`).join('')}</div>`:''}
 ${anyD?`<div class="gr-vd"><span class="lbl">${grt('vd')}</span><div class="gr-bars">${ds.map(([k,n])=>`<i title="${k.slice(8)}/${k.slice(5,7)}: ${n}" style="height:${Math.max(3,Math.round(n/mx*100))}%"></i>`).join('')}</div><div class="gr-ax"><span>${ds[0][0].slice(8)}/${ds[0][0].slice(5,7)}</span><span>${ds[29][0].slice(8)}/${ds[29][0].slice(5,7)}</span></div></div>`:''}
 <button class="btn sm" data-act="gucopy" style="margin-top:12px">${ic('copy',14)}${grt('cp')}</button>`}
function grText(st){const nm=id=>{const s=(PL.shops||[]).find(x=>x.id===id);return s?s.name:id};const sum=o=>Object.values(o||{}).reduce((a,b)=>a+b,0);
 const L=[grt('r_h'),'',grt('r_v')+': '+(st.v||0),grt('r_c')+': '+sum(st.c),grt('r_s')+': '+sum(st.s)];
 const ds=grDays(st).filter(x=>x[1]);if(ds.length){const b=ds.slice().sort((a,c)=>c[1]-a[1])[0];L.push(grt('r_best')+': '+b[0].slice(8)+'/'+b[0].slice(5,7)+' ('+b[1]+')')}
 const c=Object.entries(st.c||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);if(c.length){L.push('',grt('r_biz')+':');c.forEach(([k,n],i)=>L.push((i+1)+'. '+nm(k)+' — '+n))}
 const q=Object.entries(st.q||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);if(q.length){L.push('',grt('r_q')+':');q.forEach(([k,n],i)=>L.push((i+1)+'. '+k.replace(/-/g,' ')+' — '+n))}
 L.push('','araujotechsistemas.com/guia');return L.join('\n')}
'''

CSS = '.gr-vd{margin-top:12px}.gr-bars{display:flex;align-items:flex-end;gap:2px;height:70px;margin-top:6px;padding:4px 0;border-bottom:1px solid var(--line)}.gr-bars i{flex:1;background:var(--brand,#7A1FD1);border-radius:3px 3px 0 0;min-width:3px;opacity:.85}.gr-ax{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-top:3px}\n'


def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function grBlocks(' in s:
        print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a))
        s = s.replace(a, b)
    rep('function gxCards(g){', JS + 'function gxCards(g){')
    rep(".gx-kpi{display:grid;", CSS + ".gx-kpi{display:grid;")
    rep("  ${!st.v&&!Object.keys(st.c||{}).length?`<p class=\"muted\">${T.st_none}</p>`:''}`;",
        "  ${!st.v&&!Object.keys(st.c||{}).length?`<p class=\"muted\">${T.st_none}</p>`:grBlocks(st)}`;")
    rep(" gubusdup(el){", " gucopy(){const st=ui.guSt;if(!st)return;copyText(grText(st),grt('ok'))},\n gubusdup(el){")
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')


for f in FILES:
    patch(f)
