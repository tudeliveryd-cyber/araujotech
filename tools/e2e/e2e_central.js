// Central de Gestão (Panel Araújo Tech): menu com 12 módulos, números reais, busca geral, pagamentos com confirmação,
// registro de atividades, despesas, hospedagens, suporte, sistemas, exportação e versão de celular.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { sec, check, info } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026']; await L.signUp(...ADM);
  const day = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const B = { 'panaderia-sol': { name: 'Panadería Sol', sys: 'catalogo', plan: 'pro', due: day(12), status: 'ativo', city: 'Santa Rita', seg: { es: 'Panadería', pt: 'Padaria' }, pays: [{ date: day(-3), v: 250000 }, { date: day(-33), v: 250000 }], created: day(-40) },
    'barberia-norte': { name: 'Barbería Norte', sys: 'agenda', plan: '', due: day(-2), status: 'ativo', city: 'Santa Rita', pays: [{ date: day(-32), v: 120000 }], created: day(-60) },
    'iglesia-vida': { name: 'Iglesia Vida', sys: 'pulpito', plan: '', due: day(5), status: 'suspenso', city: 'Naranjal', pays: [], created: day(-20) } };
  for (const [id, x] of Object.entries(B)) await L.fsReq(P, 'PATCH', 'billing/' + id, 'owner', L.fields(x));
  const cfgDoc = async () => L.unfields((await L.fsReq(P, 'GET', 'platform/config', 'owner')).json) || {};
  await L.fsReq(P, 'POST', 'gsub', null, L.fields({ tp: 'job', co: 'Empresa X', t: 'Cajero', d: 'Turno mañana con experiencia.', wa: '595981000222', until: day(10), at: '2026-11-16T10:00:00Z', st: 'pend', l: 'es' }));
  const A = await L.open({ w: 1366, central: true }); const a = A.p;
  const td = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  await a.route('**/sitio/guia_stats.php', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, v: 50, vd: { [td]: 7 }, c: { a: 3, b: 2 }, s: { x: 10 }, k: {}, q: {}, p: { conoce: 4 }, geo: { 'Santa Rita|PY': 6, 'Asunción|PY': 3, 'Paraná|BR': 1 } }) }));
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  check(await a.evaluate(() => CLOUD.plLoaded === true && PL.shops.length === 3), 'clientes reais carregados da nuvem (3)');

  sec('A. Casca e visão geral');
  const h = await a.evaluate(() => ({ cgm: document.body.classList.contains('cgm'), top: getComputedStyle(document.getElementById('top')).display, nav: [...document.querySelectorAll('.cg-nav button')].map(b => b.dataset.k), kp: [...document.querySelectorAll('.cg-kpis .cg-k b')].map(b => b.textContent), real: (() => { const sh = PL.shops; return [sh.length, sh.filter(s => s.status !== 'suspenso').length, sh.filter(s => s.status === 'suspenso').length]; })() }));
  check(h.cgm && h.top === 'none' && h.nav.join(',') === 'home,cli,sis,pla,sub,fin,dom,sup,rep,usr,sec,cfg', 'Central abre com menu lateral de 12 módulos');
  check(+h.kp[0] === h.real[0] && +h.kp[1] === h.real[1] && +h.kp[2] === h.real[2], 'números da visão geral = dados reais (' + h.kp.slice(0, 3).join('/') + ')');
  const rev = await a.evaluate(() => { const m = new Date().toISOString().slice(0, 7); return PL.shops.reduce((t, s) => t + (s.pays || []).filter(p => String(p.date).slice(0, 7) === m).reduce((x, p) => x + (+p.v || 0), 0), 0); });
  check(h.kp[4] === 'Gs. ' + rev.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'), 'cobrado no mês = soma dos pagamentos registrados');

  await a.w(1500);
  const gu = await a.evaluate(() => [...document.querySelectorAll('.cg-gu .cg-k b')].map(x => x.textContent));
  check(gu.join(',') === '7,50,5,10,4', 'visão geral mostra os números da Guía (hoje, 30 dias, toques, anúncios, Conocé): ' + gu.join(','));
  const geo = await a.evaluate(() => [...document.querySelectorAll('.cg-geo li')].map(li => li.querySelector('span').textContent + '=' + li.querySelector('b').textContent));
  check(geo.length === 3 && geo[0] === 'Santa Rita, Paraguay=60%' && /Brasil=10%/.test(geo[2]), 'de onde entram: lugares com porcentagem (' + geo.join(' · ') + ')');
  check(await a.locator('.cg-gu [data-act="gusite"]').count() === 1 && await a.locator('.cg-gu [data-act="cggur"]').count() === 1, 'botões Ver detalles e Actualizar na Guía');
  const md = await a.evaluate(() => { const e = document.querySelector('.cg-mod'); return e ? e.innerText : ''; });
  check(/1 para revisar/.test(md) && /Cajero/.test(md), 'aviso de publicações esperando revisão na visão geral');
  check(/Últimos 7 días: 7 visitas/.test(await a.txt('.cg-gu')), 'resumo da semana com as visitas dos últimos 7 dias');
  check(await a.locator('.cg-mi', { hasText: 'Cajero' }).count() === 1, 'a publicação aparece na própria Central, com Aprobar e Rechazar');
  await a.click('.cg-mi [data-act="cgsubok"]'); await a.w(3000);
  const st1 = L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json) || {};
  check((st1.gjobs || []).some(j => j.t === 'Cajero' && j.co === 'Empresa X' && j.on) && ((await L.fsReq(P, 'GET', 'gsub?pageSize=20', 'owner')).json.documents || []).length === 0 && !(await a.evaluate(() => !!document.querySelector('.cg-mod'))), 'aprovar pela Central publica a vaga e tira da fila');
  await a.route('**/sitio/guia.php?jobs=1*', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ jobs: [{ id: 'g:1', t: 'Cajera', co: { n: 'Super Sol' }, k: 'part', until: day(9) }, { id: 'g:2', t: 'Repartidor con moto', co: { n: 'Tu Delivery' }, k: 'full', until: day(20) }] }) }));
  await a.click('[data-act="cgflyer"]'); await a.w(2500);
  const fl = await a.evaluate(() => { const sh = document.querySelector('.sheet[data-k="cgflyer"]'); const im = sh && sh.querySelector('img'); const dl = sh && sh.querySelector('a[download]'); return { ok: !!(im && im.naturalWidth === 1080 && im.naturalHeight === 1920), dl: dl && dl.getAttribute('download') }; });
  check(fl.ok && /^vacantes-santa-rita-\d{4}-\d{2}-\d{2}\.png$/.test(fl.dl || ''), 'flyer de vagas 1080×1920 gerado com as vagas reais e botão de baixar');
  await a.evaluate(() => closeSheet());
  sec('B. Navegação por todos os módulos');
  for (const k of ['cli', 'sis', 'pla', 'sub', 'fin', 'dom', 'sup', 'rep', 'usr', 'sec', 'cfg', 'home']) {
    await a.click(`.cg-nav button[data-k="${k}"]`); await a.w(300);
    const r = await a.evaluate(k => ({ cur: document.querySelector('.cg-nav button[aria-current="page"]').dataset.k, txt: document.querySelector('.cg-body').innerText.length }), k);
    check(r.cur === k && r.txt > 40, 'módulo ' + k + ' abre');
  }

  sec('C. Busca geral');
  const nm = await a.evaluate(() => PL.shops[1].name);
  await a.fill('#cgq', nm.slice(0, 5)); await a.w(300);
  check(await a.evaluate(n => [...document.querySelectorAll('#cgRes button b')].some(b => b.textContent.includes(n)), nm), 'busca acha o cliente "' + nm + '"');
  await a.click('#cgRes button[data-k="cli"]'); await a.w(500);
  check(await a.evaluate(() => !!document.querySelector('.sheet[data-k="cgficha"]')), 'resultado abre a ficha do cliente');
  await a.evaluate(() => closeSheet());

  sec('D. Registrar pagamento (com confirmação) e atividade');
  await a.click('.cg-nav button[data-k="cli"]'); await a.w(300);
  const sid = await a.evaluate(() => PL.shops[0].id);
  const n0 = await a.evaluate(id => PL.shops.find(s => s.id === id).pays.length, sid);
  a.autoDialog = false; await a.click(`.cg-t button[data-act="shoppay"][data-sid="${sid}"]`); await a.w(400); a.autoDialog = true;
  check(await a.evaluate(id => PL.shops.find(s => s.id === id).pays.length, sid) === n0, 'cancelar a confirmação não registra o pagamento');
  await a.click(`.cg-t button[data-act="shoppay"][data-sid="${sid}"]`); await a.w(2500);
  check(await a.evaluate(id => PL.shops.find(s => s.id === id).pays.length, sid) === n0 + 1, 'confirmando, o pagamento é registrado');
  check(/confirm|Registrar el pago/.test(a.dialogs.join(' ')) || a.dialogs.length >= 2, 'pediu confirmação antes de registrar');
  await a.click('.cg-nav button[data-k="home"]'); await a.w(300);
  check(/Pago registrado/.test(await a.txt('.cg-act')), 'aparece em Últimas actividades');

  sec('E. Finanças: gasto, exportação');
  await a.click('.cg-nav button[data-k="fin"]'); await a.w(300);
  await a.click('[data-act="cgexp"]'); await a.w(300);
  await a.click('[data-act="cgexpsave"]'); await a.w(200);
  check(/Complet/.test(await a.txt('#cgeErr')), 'gasto sem dados é recusado');
  await a.fill('#cge_desc', 'Hosting MaxDominios'); await a.fill('#cge_v', '150.000'); await a.selectOption('#cge_cat', 'host');
  await a.click('[data-act="cgexpsave"]'); await a.w(2500);
  check(/Hosting MaxDominios/.test(await a.txt('.cg-body')) && /Gs\. 150\.000/.test(await a.txt('.cg-kpis')), 'gasto aparece na lista e em Gastos del mes');
  const [dl] = await Promise.all([a.waitForEvent('download', { timeout: 5000 }).catch(() => null), a.click('[data-act="cgcsv"]')]);
  check(!!dl && /araujotech-finanzas-.*\.csv$/.test(dl.suggestedFilename()), 'exporta CSV');

  sec('F. Domínios, suporte, sistemas');
  await a.click('.cg-nav button[data-k="dom"]'); await a.w(300);
  await a.click('[data-act="cghost"]'); await a.w(300); await a.fill('#cgh_prov', 'MaxDominios'); await a.fill('#cgh_plan', 'cPanel'); await a.fill('#cgh_dom', 'araujotechsistemas.com\nguiadesantarita.com'); await a.fill('#cgh_ven', '2026-12-01'); await a.fill('#cgh_cost', '300000');
  await a.click('[data-act="cghostsave"]'); await a.w(600);
  check(/MaxDominios/.test(await a.txt('.cg-body')) && /guiadesantarita\.com/.test(await a.txt('.cg-body')), 'hospedagem cadastrada e domínios listados');
  await a.click('.cg-nav button[data-k="sup"]'); await a.w(300);
  await a.click('.cg-p [data-act="cgsupn"]'); await a.w(300); await a.fill('#cgt_cli', nm); await a.fill('#cgt_subj', 'Cambiar logo'); await a.selectOption('#cgt_pri', 'high');
  await a.click('[data-act="cgsupsave"]'); await a.w(600);
  check(/Cambiar logo/.test(await a.txt('.cg-body')), 'atendimento criado');
  await a.click('.cg-nav button[data-k="sis"]'); await a.w(300);
  await a.click('[data-act="cgsised"][data-k="catalogo"]'); await a.w(300);
  await a.selectOption('#cgs_st', 'ok'); await a.fill('#cgs_dom', 'araujotechsistemas.com'); await a.fill('#cgs_url', 'https://araujotechsistemas.com/vitrix/'); await a.fill('#cgs_h', 'Nueva versión del panel');
  await a.click('[data-act="cgsissave"]'); await a.w(2500);
  check(await a.evaluate(() => PL.gest.sis.catalogo.hist.length === 1 && PL.gest.sis.catalogo.dom === 'araujotechsistemas.com'), 'sistema editado, com histórico de alteração');
  const d = await cfgDoc();
  check(d.gest && d.gest.exp.length === 1 && d.gest.host.length === 1 && d.gest.sup.length === 1 && d.gest.audit.length >= 4, 'tudo salvo na nuvem (platform/config.gest)', JSON.stringify(Object.keys(d.gest || {})));

  sec('G. Segurança: suspender pede confirmação; auditoria filtra');
  await a.click('.cg-nav button[data-k="cli"]'); await a.w(300);
  await a.click(`.cg-t button[data-act="cgficha"][data-sid="${sid}"]`); await a.w(400);
  a.autoDialog = false; await a.click('.sheet [data-act="shopstatus"]'); await a.w(400); a.autoDialog = true;
  check(await a.evaluate(id => PL.shops.find(s => s.id === id).status !== 'suspenso', sid), 'cancelar não suspende');
  await a.evaluate(() => closeSheet());
  await a.click('.cg-nav button[data-k="sec"]'); await a.w(300); await a.fill('#cgaf', 'Hosting'); await a.w(300);
  check(/Gasto anotado/.test(await a.txt('#cgAud')) && !/Pago registrado/.test(await a.txt('#cgAud')), 'filtro do registro de atividades');
  check(a.errs.length === 0, 'sem erros de JavaScript no computador', a.errs.join(' | '));

  sec('H. Celular');
  const M = await L.open({ w: 390, central: true }); const m = M.p;
  await m.goto('https://araujotechsistemas.com/admin/'); await m.w(2500);
  if (await m.locator('#lg_user').count()) { await m.fill('#lg_user', ADM[0]); await m.fill('#lg_pass', ADM[1]); await m.press('#lg_pass', 'Enter'); await m.w(6000); }
  const r = await m.evaluate(() => ({ side: getComputedStyle(document.querySelector('.cg-side')).display, bn: getComputedStyle(document.querySelector('.cg-bnav')).display, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  check(r.side === 'none' && r.bn === 'grid' && r.sw <= r.cw, 'celular: menu de baixo, sem menu lateral, sem rolagem para o lado (' + r.sw + ')');
  for (const k of ['cli', 'fin', 'home']) { await m.click(`.cg-bnav button[data-k="${k}"]`); await m.w(300); check(await m.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'celular: ' + k + ' sem cortes'); }
  await m.click('.cg-bnav [data-act="cgmore"]'); await m.w(300);
  check(await m.locator('.cg-morel button').count() === 12, '"Más" mostra os 12 módulos');
  await m.click('.cg-morel button[data-k="sup"]'); await m.w(400);
  check(/Cambiar logo/.test(await m.txt('.cg-body')), 'celular vê os mesmos dados (atendimento)');
  check(m.errs.length === 0, 'sem erros de JavaScript no celular', m.errs.join(' | '));
  await L.done();
})().catch(async e => { console.error(e); L.bad('erro: ' + e.message); await L.done(); });
