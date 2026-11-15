# Guía: toques no slider (t=k) nos números do Panel, no resumo do cliente e no painel do local
import sys
OLD_ROW="${Object.keys(st.s||{}).length?`<div class=\"gx-list\"><span class=\"lbl\">${T.st_sl}</span>${Object.entries(st.s).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,n])=>`<div><span>${esc(k.startsWith('c-')?nm(k.slice(2)):(({'h-td':'Banner Tu Delivery','h-vx':'Banner Planes Vitrix','h-at':'Banner Araújo Tech'})[k]||(k.startsWith('a-')?((g.ads.find(a=>'a-'+a.id===k)||{}).t?T.st_ad+' · '+(g.ads.find(a=>'a-'+a.id===k)||{}).t:T.st_ad0):k)))}</span><b>${n}</b></div>`).join('')}</div>`:''}"
NEW_ROW="${Object.keys(st.s||{}).length?`<div class=\"gx-list gx-sl\"><span class=\"lbl\">${T.st_sl}</span><div class=\"gx-slh\"><span></span><small>${T.st_ap}</small><small>${T.st_tq}</small></div>${Object.entries(st.s).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,n])=>`<div><span>${esc(slNm(k,g,T,nm))} <button class=\"btn sm\" style=\"padding:4px 10px\" data-act=\"guslcp\" data-k=\"${esc(k)}\">${ic('copy',13)}${T.st_cp}</button></span><b>${n}</b><b>${+((st.k||{})[k])||0}</b></div>`).join('')}<button class=\"btn sm\" data-act=\"guslsell\" style=\"margin-top:10px;align-self:flex-start\">${ic('copy',14)}${T.st_sell}</button></div>`:''}"
OLD_KPI="<div><b>${Object.values(st.s||{}).reduce((a,b)=>a+b,0)}</b><span>${T.st_s}</span></div></div>"
NEW_KPI="<div><b>${Object.values(st.s||{}).reduce((a,b)=>a+b,0)}</b><span>${T.st_s}</span></div><div><b>${Object.values(st.k||{}).reduce((a,b)=>a+b,0)}</b><span>${T.st_k}</span></div></div>"
FNS=r"""function slNm(k,g,T,nm){if(k.startsWith('c-'))return nm(k.slice(2));const h={'h-td':'Banner Tu Delivery','h-vx':'Banner Planes Vitrix','h-at':'Banner Araújo Tech'}[k];if(h)return h;if(k.startsWith('a-')){const a=((g&&g.ads)||[]).find(a=>'a-'+a.id===k);return a&&a.t?T.st_ad+' · '+a.t:T.st_ad0}return k}
/* textos para copiar: para o anunciante (um banner) e para vender o slider (todos) */
function slTxt(k){const st=ui.guSt,g=ui.guG,T=GX_T[lang==='pt'?'pt':'es'];if(!st)return '';const nm=id=>{const s=(PL.shops||[]).find(x=>x.id===id);return s?s.name:id};const s=+((st.s||{})[k])||0,q=+((st.k||{})[k])||0;
 return [T.sx_h,slNm(k,g,T,nm),'',T.sx_s+': '+s,T.sx_k+': '+q,T.sx_v+': '+(st.v||0),'','araujotechsistemas.com/guia'].join('\n')}
function slSell(){const st=ui.guSt,T=GX_T[lang==='pt'?'pt':'es'];if(!st)return '';const sum=o=>Object.values(o||{}).reduce((a,b)=>a+b,0);const ks=Object.keys(st.s||{});const avg=ks.length?Math.round(sum(st.s)/ks.length):0,avk=ks.length?Math.round(sum(st.k)/ks.length):0;
 return [T.sv_h,'',T.sx_v+': '+(st.v||0),T.sv_a+': '+avg,T.sv_k+': '+avk,'',T.sv_o,'',T.sv_c].join('\n')}
function gxCards(g){ui.guG=g;"""
ES="st_sl:'Slider: veces que apareció cada uno',st_ad:'Publicidad',st_ad0:'Publicidad (ya borrada)'"
ESN="st_sl:'Slider (VIP y banners)',st_ap:'Apareció',st_tq:'Toques',st_k:'Toques en el slider',st_cp:'Copiar',st_sell:'Copiar números para vender el slider',st_ok:'Copiado',st_ad:'Publicidad',st_ad0:'Publicidad (ya borrada)',sx_h:'Guía Vitrix · tu anuncio en el slider (últimos 30 días)',sx_s:'Veces que apareció',sx_k:'Toques en el anuncio',sx_v:'Visitas a la Guía',sv_h:'Guía Vitrix · números de los últimos 30 días',sv_a:'Veces que aparece cada anuncio del slider (promedio)',sv_k:'Toques por anuncio (promedio)',sv_o:'Tu negocio puede estar en el slider: anuncio Gs. 250.000 por mes, o plan VIP de Vitrix con el slider incluido.',sv_c:'Info: 0982 086 171 · araujotechsistemas.com/guia'"
PT="st_sl:'Slider: vezes que apareceu cada um',st_ad:'Publicidade',st_ad0:'Publicidade (já apagada)'"
PTN="st_sl:'Slider (VIP e banners)',st_ap:'Apareceu',st_tq:'Toques',st_k:'Toques no slider',st_cp:'Copiar',st_sell:'Copiar números para vender o slider',st_ok:'Copiado',st_ad:'Publicidade',st_ad0:'Publicidade (já apagada)',sx_h:'Guía Vitrix · tu anuncio en el slider (últimos 30 días)',sx_s:'Veces que apareció',sx_k:'Toques en el anuncio',sx_v:'Visitas a la Guía',sv_h:'Guía Vitrix · números de los últimos 30 días',sv_a:'Veces que aparece cada anuncio del slider (promedio)',sv_k:'Toques por anuncio (promedio)',sv_o:'Tu negocio puede estar en el slider: anuncio Gs. 250.000 por mes, o plan VIP de Vitrix con el slider incluido.',sv_c:'Info: 0982 086 171 · araujotechsistemas.com/guia'"
R=[(OLD_ROW,NEW_ROW),(OLD_KPI,NEW_KPI),("function gxCards(g){",FNS),(ES,ESN),(PT,PTN),
(".gx-kpi{display:grid;grid-template-columns:repeat(3,1fr);",".gx-sl>div{display:grid!important;grid-template-columns:1fr 64px 56px;align-items:center}.gx-sl>div>b{text-align:right}.gx-slh{border-bottom:0!important;padding:0!important}.gx-slh small{text-align:right;color:var(--muted);font-size:12px}.gx-kpi{display:grid;grid-template-columns:repeat(2,1fr);"),
(" gucopy(){const st=ui.guSt;if(!st)return;copyText(grText(st),grt('ok'))},"," gucopy(){const st=ui.guSt;if(!st)return;copyText(grText(st),grt('ok'))},\n guslcp(el){const x=slTxt(el.dataset.k);if(x)copyText(x,GX_T[lang==='pt'?'pt':'es'].st_ok)},\n guslsell(){const x=slSell();if(x)copyText(x,GX_T[lang==='pt'?'pt':'es'].st_ok)},"),
("const c=(st.c||{})[id]||0,sl=(st.s||{})['c-'+id]||0;const m=gnt('rep_msg').replace('{n}',s.name).replace('{c}',c).replace('{s}',sl?gnt('rep_s').replace('{s}',sl):'');","const c=(st.c||{})[id]||0,sl=(st.s||{})['c-'+id]||0,sk=(st.k||{})['c-'+id]||0;const m=gnt('rep_msg').replace('{n}',s.name).replace('{c}',c).replace('{s}',sl?gnt('rep_s').replace('{s}',sl)+(sk?gnt('rep_k').replace('{k}',sk):''):'');"),
("rep_s:' y apareció {s} veces en el slider'","rep_s:' y apareció {s} veces en el slider',rep_k:' ({k} toques en tu anuncio)'"),
(",r_s:'Veces en el slider',",",r_s:'Veces en el slider',r_k:'Toques en el slider',"),
(",r_s:'Vezes no slider',",",r_s:'Vezes no slider',r_k:'Toques no slider',"),
("grt('r_s')+': '+sum(st.s)];","grt('r_s')+': '+sum(st.s),grt('r_k')+': '+sum(st.k)];"),
("s:'Vezes no slider',p:'Últimos 30 dias","s:'Vezes no slider',k:'Toques no slider',p:'Últimos 30 dias"),
("s:'Veces en el slider',p:'Últimos 30 días","s:'Veces en el slider',k:'Toques en el slider',p:'Últimos 30 días"),
("${g.s?`<div class=\"stat\"><small>${T.s}</small><b>${g.s}</b></div>`:''}","${g.s?`<div class=\"stat\"><small>${T.s}</small><b>${g.s}</b></div><div class=\"stat\"><small>${T.k}</small><b>${g.k||0}</b></div>`:''}")]
for f in sys.argv[1:]:
    s=open(f).read()
    if 'function slSell()' in s: print('ok',f); continue
    for a,b in R:
        n=s.count(a)
        if a.startswith("rep_s:") : assert n>=1,(f,a); s=s.replace(a,b); continue
        assert n==1,(f,n,a[:70]); s=s.replace(a,b)
    open(f,'w').write(s); print('patched',f)
