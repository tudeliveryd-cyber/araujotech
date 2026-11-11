// Contatos pelo WhatsApp (regras v13): o site e as demonstrações somam 1 por toque; ninguém de fora lê nem altera; o admin vê no painel.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
const hoje = (() => { const d = new Date(Date.now() - 3 * 3600e3); return d.toISOString().slice(0, 10); })();
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const get = async () => L.unfields((await L.fsReq(P, 'GET', 'cliques/' + hoje, 'owner')).json) || {};
  const RULES = process.env.RULES || '';

  sec('A. Página do Vitrix: botões de WhatsApp contam');
  const V = await L.open({ w: 390, init: () => { window.__clk = true; } }); const v = V.p;
  await v.goto('https://araujotechsistemas.com/vitrix/'); await v.w(2500);
  await v.locator('.plan a[href*="wa.me"]').first().click({ noWaitAfter: true }).catch(() => {}); await v.w(1500);
  await v.locator('#cout a[href*="wa.me"]').first().click({ noWaitAfter: true }).catch(() => {}); await v.w(1500);
  let c = await get();
  check(c.wa === 2, 'Vitrix: 2 toques no WhatsApp gravados (wa=' + c.wa + ')', JSON.stringify(c));

  sec('B. Demonstração: "Quiero uno así" conta à parte');
  const D = await L.open({ w: 1280, init: () => { window.__clk = true; } }); const d = D.p;
  await d.goto('https://araujotechsistemas.com/demo-sushi/'); await d.w(3000);
  await d.locator('.dn.dq').first().click({ noWaitAfter: true }).catch(() => {}); await d.w(1500);
  c = await get();
  check(c.demo === 1 && c.wa === 2, 'demo: toque gravado em "demo" sem mexer em "wa" (demo=' + c.demo + ')', JSON.stringify(c));
  const M = await L.open({ w: 390, init: () => { window.__clk = true; } }); const m = M.p;
  await m.goto('https://araujotechsistemas.com/demo-farmacia/'); await m.w(3000);
  const bar = await m.locator('.dqbar a').count();
  check(bar === 1, 'demo no celular: barra "Quiero uno así" aparece embaixo do topo');
  await m.locator('.dqbar a').first().click({ noWaitAfter: true }).catch(() => {}); await m.w(1500);
  c = await get(); check(c.demo === 2, 'demo no celular: toque gravado (demo=' + c.demo + ')');

  sec('C. Regras: ninguém de fora lê nem altera os números');
  const T = async (desc, method, path, body, exp) => { const r = await L.fsReq(P, method, path, null, body); check(r.status === exp, desc + ' → HTTP ' + r.status + ' (esperado ' + exp + ')'); };
  await T('anônimo não lê os contatos', 'GET', 'cliques/' + hoje, null, 403);
  await T('anônimo não pode trocar o número (wa=500)', 'PATCH', 'cliques/' + hoje, L.fields({ wa: 500, demo: 2 }), 403);
  await T('anônimo não pode zerar', 'PATCH', 'cliques/' + hoje, L.fields({ wa: 0, demo: 0 }), 403);
  await T('anônimo não pode somar nos dois ao mesmo tempo', 'PATCH', 'cliques/' + hoje, L.fields({ wa: 3, demo: 3 }), 403);
  await T('anônimo não pode gravar outro campo', 'PATCH', 'cliques/' + hoje, L.fields({ wa: 3, demo: 2, x: 1 }), 403);
  await T('anônimo não cria dia com nome inválido', 'PATCH', 'cliques/hackeado', L.fields({ wa: 1 }), 403);
  await T('anônimo não cria dia já começando em 100', 'PATCH', 'cliques/2026-01-01', L.fields({ wa: 100 }), 403);
  await T('anônimo pode somar 1 (como o site faz)', 'PATCH', 'cliques/' + hoje, L.fields({ wa: 3, demo: 2 }), 200);
  const adm = await L.signIn(...ADM);
  const ra = await L.fsReq(P, 'GET', 'cliques/' + hoje, adm.idToken); check(ra.status === 200, 'admin lê os contatos → HTTP ' + ra.status);

  sec('D. Admin: o painel mostra os contatos');
  await L.fsReq(P, 'PATCH', 'visitas/' + hoje, null, L.fields({ n: 1, u: 1 }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  const tx = await a.txt();
  const blk = (tx.match(/Contactos por WhatsApp[\s\S]{0,400}/) || [''])[0].replace(/\s+/g, ' ');
  info('painel: ' + blk.slice(0, 260));
  check(/Contactos por WhatsApp/.test(tx), 'admin: aparece "Contactos por WhatsApp"');
  check(/Hoy \/ 5 \/ 3 desde el sitio · 2 desde las demostraciones/.test(blk), 'admin: hoje = 5 (3 pelo site e 2 pelas demonstrações)', blk.slice(0, 200));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
