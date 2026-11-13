// Vitrine do site: os clientes cadastrados no Panel Araújo Tech aparecem sozinhos em araujotechsistemas.com
// (todos os sistemas na página inicial; só Vitrix na página do Vitrix). Teste, suspenso e "não mostrar" ficam de fora.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  // texto já salvo pelo editor do site: não pode se perder
  await L.fsReq(P, 'PATCH', 'platform/sitio', 'owner', L.fields({ txt: { es: { h1: 'Título editado' } } }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  const mk = async (name, wa) => { await a.act('newshop'); await a.w(300); await a.set('#ns_name', name); await a.set('#ns_wa', wa); await a.act('createshop'); await a.w(3500); };
  await mk('Panadería Sol', '595981000971');
  await mk('Loja Teste Vitrine', '595981000972');
  await a.evaluate(() => { try { seedSysPlans(); } catch (e) {} }); // planos dos outros sistemas (na nuvem vazia do teste ainda não existem)
  await a.act('newclient'); await a.w(300); await a.locator('[data-act=ncsys][data-k=agenda]').click(); await a.w(200);
  await a.set('#nc_name', 'Barbería Norte'); await a.act('createclient'); await a.w(3000); const ncErr = await a.evaluate(() => (document.getElementById('ncErr') || {}).textContent || ''); if (ncErr) info('ncErr: ' + ncErr);
  const pub = async () => { const d = L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json) || {}; return d; };
  let d = {}; for (let i = 0; i < 10; i++) { d = await pub(); if ((d.clientes || []).length >= 2) break; await a.w(1000); }
  info(JSON.stringify(await a.evaluate(() => ({ mode: MODE, pl: CLOUD.plLoaded, adm: CLOUD.admin, n: pubClients().length, f: typeof CLOUD.api.putSiteClients, sig: PUBCL_SIG.length }))));
  const names = (d.clientes || []).map(c => c.name); info(JSON.stringify(d.clientes || []).slice(0, 400));

  sec('A. Publicação automática');
  const sol = (d.clientes || []).find(c => c.name === 'Panadería Sol');
  check(!!sol && sol.sys === 'catalogo' && /^https:\/\/[a-z0-9-]+\.araujotechsistemas\.com\/$/.test(sol.url) && /logo\.php$/.test(sol.logo) && sol.city === 'Santa Rita', 'o cliente novo do Vitrix já aparece, com link do catálogo, logo e cidade');
  check(names.includes('Barbería Norte'), 'cliente de outro sistema (Agenda) também aparece');
  check(!names.includes('Loja Teste Vitrine'), 'cliente de teste nunca aparece');
  check(d.txt && d.txt.es && d.txt.es.h1 === 'Título editado', 'os textos já editados do site continuam lá');

  sec('B. Página inicial e página do Vitrix');
  const S = await L.open({ w: 390 }); const s = S.p;
  await s.goto('https://araujotechsistemas.com/'); await s.w(3000);
  const home = await s.evaluate(() => { const sec = document.getElementById('clientes'); return { hid: sec.hidden, cards: [...sec.querySelectorAll('.atc-card h3')].map(x => x.textContent), chips: [...sec.querySelectorAll('[data-atf]')].map(x => x.textContent), go: [...sec.querySelectorAll('.atc-go')].map(x => x.textContent + '>' + x.getAttribute('href')) }; });
  info(JSON.stringify(home));
  check(!home.hid && home.cards.includes('Panadería Sol') && home.cards.includes('Barbería Norte'), 'a página inicial mostra os clientes de todos os sistemas');
  check(home.chips.length === 3 && /Vitrix · 2/.test(home.chips.join('|')), 'filtros por sistema (Todos, Vitrix, Agenda)');
  check(home.go.some(x => /^Ver catálogo/.test(x) && /araujotechsistemas\.com\/$/.test(x)), 'o cliente do Vitrix tem "Ver catálogo"');
  if (process.env.SHOT) await s.locator('#clientes').screenshot({ path: process.env.SHOT });
  await s.locator('[data-atf=agenda]').click(); await s.w(300);
  check(JSON.stringify(await s.evaluate(() => [...document.querySelectorAll('#clientes .atc-card h3')].map(x => x.textContent))) === '["Barbería Norte"]', 'filtrar por Agenda mostra só a barbearia');
  await s.evaluate(() => { lang = 'pt'; render(); }); await s.w(300);
  check(await s.evaluate(() => document.querySelector('#clientes h2').textContent) === 'Negócios que já usam nossos sistemas', 'em português');
  await s.goto('https://araujotechsistemas.com/vitrix/'); await s.w(3000);
  const vx = await s.evaluate(() => { const sec = document.getElementById('clientes'); return { h: (sec.querySelector('h2') || {}).textContent, cards: [...sec.querySelectorAll('.atc-card h3')].map(x => x.textContent), chips: sec.querySelectorAll('[data-atf]').length }; });
  info(JSON.stringify(vx));
  check(/Negocios que ya venden con Vitrix|Negócios que já vendem/.test(vx.h) && vx.cards.includes('Panadería Sol') && !vx.cards.includes('Barbería Norte') && vx.chips === 0, 'a página do Vitrix mostra só quem usa o Vitrix');
  const lg = await s.evaluate(() => { const b = document.querySelector('#clientes .atc-lg'); return b && b.innerHTML; });
  check(/<b>PS<\/b>|<img/.test(lg || ''), 'sem logo carregado, aparecem as iniciais (PS)');

  sec('C. Desligar "Mostrar en el sitio" e suspender');
  const id = await a.evaluate(() => PL.shops.find(x => x.name === 'Panadería Sol').id);
  await a.evaluate(id => acts.editcl({ dataset: { sid: id } }), id); await a.w(400);
  check(await a.locator('#ec_web').isChecked(), '"Mostrar en el sitio" vem ligado');
  await a.locator('#ec_web').uncheck(); await a.act('saveec'); await a.w(3500);
  d = await pub(); check(!(d.clientes || []).some(c => c.name === 'Panadería Sol'), 'desligando, o cliente sai do site');
  await a.evaluate(id => acts.editcl({ dataset: { sid: id } }), id); await a.w(300); await a.locator('#ec_web').check(); await a.act('saveec'); await a.w(3500);
  d = await pub(); check((d.clientes || []).some(c => c.name === 'Panadería Sol'), 'ligando de novo, volta');
  await a.evaluate(id => { const s = PL.shops.find(x => x.id === id); s.status = 'suspenso'; savePL(); }, id); await a.w(3500);
  d = await pub(); check(!(d.clientes || []).some(c => c.name === 'Panadería Sol'), 'cliente suspenso sai do site');
  await a.evaluate(() => CLOUD.api.putSiteCfg({ txt: { es: { h1: 'Outro título' } } })); await a.w(800);
  d = await pub(); check(d.txt.es.h1 === 'Outro título' && (d.clientes || []).some(c => c.name === 'Barbería Norte'), 'salvar o editor do site não apaga a lista de clientes');
  check(!a.errs.length && !s.errs.length, 'sem erros de JavaScript', a.errs.concat(s.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
