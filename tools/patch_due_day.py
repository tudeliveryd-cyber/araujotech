#!/usr/bin/env python3
"""Painel do local: aviso de vencimento do plano (dono) e resumo do dia para copiar ou mandar por WhatsApp."""
FILES = ['404.html', 'index.html', 'admin/index.html', 'painel/index.html']

JS = r'''/* aviso de vencimento do plano e resumo do dia (só o dono vê) */
const DU_T={es:{h:'Tu plan vence',h_trial:'Tu prueba gratis termina',late:'— venció el {d}',today:'hoy',tom:'mañana',in:'en {n} días ({d})',plan:'Plan',pm:'por mes',sub:'Para seguir sin cortes, avisanos cuando hagas el pago.',btn:'Avisar el pago por WhatsApp',msg:'Hola Araújo Tech, soy de {s}. Quiero avisar el pago del plan {p} (vencimiento {d}).',msg_t:'Hola Araújo Tech, soy de {s}. Mi prueba gratis termina el {d} y quiero seguir con el plan {p}.',
  ds_h:'Resumen del día',ds_sub:'Ventas, pedidos y lo más vendido de hoy, listo para compartir.',ds_cp:'Copiar',ds_wa:'Enviar por WhatsApp',ds_ok:'Resumen copiado',ds_t:'Resumen del',ds_o:'Pedidos',ds_v:'Ventas',ds_tk:'Ticket promedio',ds_del:'Delivery',ds_pk:'Retiro',ds_loc:'En el local',ds_can:'Cancelados',ds_top:'Más vendidos',ds_none:'Hoy todavía no hay pedidos.'},
 pt:{h:'Seu plano vence',h_trial:'Seu teste grátis termina',late:'— venceu em {d}',today:'hoje',tom:'amanhã',in:'em {n} dias ({d})',plan:'Plano',pm:'por mês',sub:'Para seguir sem cortes, avise quando fizer o pagamento.',btn:'Avisar o pagamento por WhatsApp',msg:'Hola Araújo Tech, soy de {s}. Quiero avisar el pago del plan {p} (vencimiento {d}).',msg_t:'Hola Araújo Tech, soy de {s}. Mi prueba gratis termina el {d} y quiero seguir con el plan {p}.',
  ds_h:'Resumo do dia',ds_sub:'Vendas, pedidos e os mais vendidos de hoje, pronto para compartilhar.',ds_cp:'Copiar',ds_wa:'Enviar por WhatsApp',ds_ok:'Resumo copiado',ds_t:'Resumo de',ds_o:'Pedidos',ds_v:'Vendas',ds_tk:'Ticket médio',ds_del:'Delivery',ds_pk:'Retirada',ds_loc:'No local',ds_can:'Cancelados',ds_top:'Mais vendidos',ds_none:'Hoje ainda não há pedidos.'}};
const dut=k=>DU_T[lang==='pt'?'pt':'es'][k];
function duInfo(){if(!LIM||!/^\d{4}-\d{2}-\d{2}$/.test(String(LIM.due||''))||!isOwnerUI()||(CLOUD_ON&&CLOUD.admin))return null;const now=new Date(),a=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()),p=LIM.due.split('-'),b=Date.UTC(+p[0],+p[1]-1,+p[2]);const d=Math.round((b-a)/864e5);if(d>5||d<-60)return null;return {d,dt:p[2]+'/'+p[1]+'/'+p[0],trial:+LIM.trial||0}}
function dueCard(){const x=duInfo();if(!x)return '';const when=x.d<0?dut('late').replace('{d}',x.dt):x.d===0?dut('today'):x.d===1?dut('tom'):dut('in').replace('{n}',x.d).replace('{d}',x.dt);
 const val=+LIM.pu>0?'US$ '+(+LIM.pu)+(+LIM.pg>0?' (≈ Gs. '+Math.round(+LIM.pg).toLocaleString('es-PY')+')':''):(+LIM.pg>0?'Gs. '+Math.round(+LIM.pg).toLocaleString('es-PY'):'');
 const msg=dut(x.trial?'msg_t':'msg').replace('{s}',(pub.store&&pub.store.name)||SHOP).replace('{p}',LIM.plan||'').replace('{d}',x.dt);
 return `<div class="card du-card${x.d<0?' late':''}" id="duCard"><h3>${ic('clock',18)}${x.trial?dut('h_trial'):dut('h')} ${when}</h3><p class="sub">${dut('plan')} <b>${esc(LIM.plan||'')}</b>${val&&!x.trial?' · '+val+' '+dut('pm'):''}. ${dut('sub')}</p><a class="btn pri" style="align-self:flex-start" href="https://wa.me/595982086171?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('msg',15)}${dut('btn')}</a></div>`}
function daySumText(){const td=orders.filter(o=>isToday(o.date)),ok=td.filter(o=>o.status!=='cancelado'),can=td.length-ok.length;const rev=ok.reduce((s,o)=>s+(+o.total||0),0);
 const it={};ok.forEach(o=>(o.items||[]).forEach(i=>{const n=String(i.n||'').split(' + ')[0];if(n)it[n]=(it[n]||0)+(+i.q||0)}));const top=Object.entries(it).sort((a,b)=>b[1]-a[1]).slice(0,3);
 const del=ok.filter(o=>o.mode==='delivery').length,loc=ok.filter(o=>o.canal==='caja'||o.canal==='mesa'||o.mode==='mesa').length,pk=ok.length-del-loc;const d=new Date();
 const L=[((pub.store&&pub.store.name)||'')+' · '+dut('ds_t')+' '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(),''];
 if(!ok.length){L.push(dut('ds_none'));if(can)L.push(dut('ds_can')+': '+can);return L.join('\n')}
 L.push(dut('ds_o')+': '+ok.length,dut('ds_v')+': '+gs(rev),dut('ds_tk')+': '+gs(rev/ok.length),dut('ds_del')+': '+del+' · '+dut('ds_pk')+': '+pk+' · '+dut('ds_loc')+': '+loc);if(can)L.push(dut('ds_can')+': '+can);
 if(top.length){L.push('',dut('ds_top')+':');top.forEach(([n,q],i)=>L.push((i+1)+'. '+n+' × '+(Math.round(q*100)/100)))}return L.join('\n')}
function daySumCard(){if(!isOwnerUI())return '';return `<div class="card" id="dsCard"><h3>${ic('chart',18)}${dut('ds_h')}</h3><p class="sub">${dut('ds_sub')}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="daysum" data-k="cp">${ic('copy',14)}${dut('ds_cp')}</button><button class="btn sm" data-act="daysum" data-k="wa">${ic('msg',14)}${dut('ds_wa')}</button></div></div>`}
'''
CSS = ".card.du-card{border-color:#E9C46A;background:#FFFBEA;display:flex;flex-direction:column;gap:6px}.card.du-card.late{border-color:#F1A7A7;background:#FEF2F2}.du-card h3{margin:0}\n"


def patch(f):
    s = open(f, encoding='utf-8').read()
    if 'function dueCard(' in s:
        print(f, 'já tem'); return
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (f, a[:70], s.count(a))
        s = s.replace(a, b)
    rep('function tabResumo(){', JS + 'function tabResumo(){')
    rep(".gx-kpi{display:grid;", CSS + ".gx-kpi{display:grid;")
    # admin → loja: o vencimento e o valor do plano vão junto com os limites
    rep("{lim:Object.assign(limOf(planOf(s)),{td:tdOn(s)})}", "{lim:Object.assign(limOf(planOf(s)),{td:tdOn(s),due:s.due||'',trial:+s.trial||0,pu:+planOf(s).usd||0,pg:+planOf(s).price||0})}")
    # tela
    rep(" ${notifBtn()?`<div>${notifBtn()}</div>`:''}<div class=\"stats\">", " ${dueCard()}${notifBtn()?`<div>${notifBtn()}</div>`:''}<div class=\"stats\">")
    rep("</b></div></div>\n ${cvCard()}", "</b></div></div>\n ${daySumCard()}\n ${cvCard()}")
    rep(" gubusdup(el){", " daysum(el){const tx=daySumText();if(el.dataset.k==='wa')window.open('https://wa.me/?text='+encodeURIComponent(tx),'_blank','noopener');else copyText(tx,dut('ds_ok'))},\n gubusdup(el){")
    open(f, 'w', encoding='utf-8').write(s)
    print(f, 'ok')


for f in FILES:
    patch(f)
