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
  await a.route('**/sitio/guia_stats.php', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, v: 50, vd: { [td]: 7 }, c: { 'd-a': 3, b: 2, 'panaderia-sol': 7, 'd-zz': 1 }, s: { x: 10, 'c-panaderia-sol': 120 }, k: { 'c-panaderia-sol': 9 }, q: { alm: 1, almuer: 1, almuerzo: 1, pizza: 2 }, p: { conoce: 4 }, geo: { 'Santa Rita|PY': 6, 'Asunción|PY': 3, 'Paraná|BR': 1 } }) }));
  await a.route('**/sitio/guia.php?g=1*', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ dir: [{ id: 'a', n: 'Café Uno', wa: '0981', a: 'Centro', hrs: '8-12', lg: '/x.png', td: true }, { id: 'b', n: 'Ferretería Dos' }], ads: [{ id: 'k1' }], clas: [], ev: [{ t: 'Feria' }], util: [{ n: 'Hospital' }] }) }));
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
  const gu = await a.evaluate(() => [...document.querySelectorAll('.cg-gu .cg-kpis:not(.cg-guc) .cg-k:not(#cg-on) b')].map(x => x.textContent));
  check(gu.join(',') === '7,50,13,130,4', 'visão geral mostra os números da Guía (hoje, 30 dias, toques, anúncios, Conocé): ' + gu.join(','));
  const con = await a.evaluate(async () => { const f0 = window.fetch; window.fetch = (x, o) => /guia_stats/.test(String(x)) && /"on":1/.test(String((o || {}).body || '')) ? Promise.resolve(new Response(JSON.stringify({ ok: true, n: 4, pk: 9, at: '10:15', h: {} }))) : f0(x, o); await guOnLoad(); window.fetch = f0; const e = document.getElementById('cg-on'); return e ? e.innerText.replace(/\s+/g, ' ') : ''; });
  check(/^4 conectados ahora · pico de hoy 9 \(10:15\)/.test(con), 'Central, parte da Guía: "conectados ahora" com o pico do dia (' + con + ')');
  const geo = await a.evaluate(() => [...document.querySelectorAll('.cg-geo:not(.cg-top) li')].map(li => li.querySelector('span').textContent + '=' + li.querySelector('b').textContent));
  check(geo.length === 3 && geo[0] === 'Santa Rita, Paraguay=60%' && /Brasil=10%/.test(geo[2]), 'de onde entram: lugares com porcentagem (' + geo.join(' · ') + ')');
  const top = await a.evaluate(() => [...document.querySelectorAll('.cg-top li')].map(li => li.querySelector('span').textContent + '=' + li.querySelector('b').textContent).join(' · '));
  check(/=7/.test(top.split(' · ')[0]) && /Café Uno=3/.test(top) && /Ferretería Dos=2/.test(top) && /quitado de la Guía=1/.test(top), 'negócios mais tocados com o nome de cada um (' + top + ')');
  const gc = await a.evaluate(() => ({ k: [...document.querySelectorAll('.cg-guc .cg-k')].map(x => x.innerText.replace(/\s+/g, ' ')), q: (document.querySelector('.cg-gq') || {}).textContent || '' }));
  check(gc.k.some(x => /^2 negocios sin catálogo/.test(x)) && gc.k.some(x => /^1 aliados Tu Delivery/.test(x)) && gc.k.some(x => /^1 banners en el aire/.test(x)) && /Ferretería Dos/.test(gc.q) && !/Café Uno/.test(gc.q), 'Central: o que está publicado na Guía e as fichas com dados para completar (' + gc.k.join(' | ') + ')');
  const wq = await a.evaluate(() => (document.querySelector('.cg-wk') || {}).innerText || '');
  check(/almuerzo \(3\)/.test(wq) && /pizza \(2\)/.test(wq) && !/alm \(/.test(wq), 'lo más buscado junta alm/almuer/almuerzo (' + wq.replace(/\n/g, ' ') + ')');
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
  const PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const mdir = [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ id: 'm' + i, n: 'Café ' + i, g: 'food', tu: ['de'], d: '', lg: i % 2 ? PX : '' })).concat([{ id: 'x1', n: 'Pizzería Noche', g: 'food', tu: ['ce'], d: '' }, { id: 'x2', n: 'Panadería Sol', g: 'food', tu: [], d: 'Desayunos y meriendas' }]);
  await a.route('**/sitio/guia.php?g=1*', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ dir: mdir }) }));
  check(await a.locator('.cg-ph [data-act="cgmeal"]').count() === 1, 'Central: botão Flyer del horario na Guía');
  await a.evaluate(() => { document.querySelector('.cg-ph [data-act="cgmeal"]').dataset.k = 'de'; });
  await a.click('.cg-ph [data-act="cgmeal"]'); await a.w(2500);
  const mf = async () => a.evaluate(async () => { const sh = document.querySelector('.sheet[data-k="cgmeal"]'); if (!sh) return null; const ims = [...sh.querySelectorAll('figure img')]; for (const im of ims) { try { await im.decode(); } catch (e) {} } return { sz: ims.map(i => i.naturalWidth + 'x' + i.naturalHeight).join(','), dl: [...sh.querySelectorAll('a[download]')].map(x => x.getAttribute('download')).join(','), tx: sh.innerText, more: !!sh.querySelector('[data-act="cgmealn"]') }; });
  const m1 = await mf();
  check(m1 && m1.sz === '1080x1350,1080x1920', 'flyer do desayuno em feed 1080×1350 e status 1080×1920 (' + (m1 && m1.sz) + ')');
  check(m1 && /6 de 9 negocios/.test(m1.tx) && m1.more, 'flyer usa 6 dos 9 negócios do desayuno (marcados ou pelo texto), e tem Otros negocios');
  check(m1 && /guia-desayuno-\d{4}-\d{2}-\d{2}-feed\.png/.test(m1.dl) && /-status\.png/.test(m1.dl), 'botões de baixar feed e status com nome do horário');
  await a.click('.sheet[data-k="cgmeal"] [data-act="cgmeal"][data-k="ce"]'); await a.w(2000);
  const m2 = await mf();
  check(m2 && /1 de 1 negocios/.test(m2.tx) && !m2.more && /guia-cena/.test(m2.dl), 'trocar para Cena usa só quem atende à noite');
  await a.evaluate(() => closeSheet());
  await a.click('.cg-nav button[data-k="rep"]'); await a.w(600);
  const rp = await a.evaluate(() => [...document.querySelectorAll('.cg-t tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ')).find(t => /Panadería Sol/.test(t)) || '');
  check(/120/.test(rp) && /9/.test(rp) && /7/.test(rp), 'Informes: resultados da Guía por cliente (slider, toques, lista): ' + rp);
  await a.click('[data-act="cgrepimg"][data-sid="panaderia-sol"]'); await a.w(2000);
  const ri = await a.evaluate(async () => { for (let i = 0; i < 40 && !document.querySelector('.sheet[data-k="cgrepimg"] img'); i++) await new Promise(r => setTimeout(r, 250)); const im = document.querySelector('.sheet[data-k="cgrepimg"] img'); if (!im) return 'sem img'; try { await im.decode(); } catch (e) {} return im.naturalWidth + 'x' + im.naturalHeight; });
  check(ri === '1080x1350', 'imagem de resultados 1080×1350 para mandar ao cliente (' + ri + ')');
  await a.evaluate(() => closeSheet()); await a.click('.cg-nav button[data-k="home"]'); await a.w(300);
  await a.click('.cg-nav button[data-k="cfg"]'); await a.w(1200);
  check(await a.locator('.cg-atl li').count() === 12, 'Configuración: accesos da portada (12 originais)');
  await a.click('[data-act="cgatladd"]'); await a.w(300);
  const na = await a.locator(".cg-atl li").count() - 1;
  await a.fill(`[data-atl="${na}.es"]`, 'Corredores de seguros'); await a.fill(`[data-atl="${na}.q"]`, 'seguro corredor'); await a.selectOption(`select[data-atl="${na}.ic"]`, 'seg');
  for (let i = na; i > 0; i--) { await a.click(`[data-act="cgatlmv"][data-k="${i}"][data-d="-1"]`); await a.w(120); }
  await a.click('[data-act="cgatlsave"]'); await a.w(2000);
  const sit = L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json) || {};
  check(sit.gatl && sit.gatl.length === 13 && sit.gatl[0].k === 'q' && sit.gatl[0].es === 'Corredores de seguros' && sit.gatl[0].q === 'seguro corredor' && sit.gatl[0].ic === 'seg' && sit.gatl[1].k === 'all', 'acesso novo salvo em primeiro lugar (posição escolhida)');
  await a.click('.cg-nav button[data-k="home"]'); await a.w(300);
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
  const lk = await a.evaluate(() => [...document.querySelectorAll('.sheet[data-k="cgficha"] .cg-links a')].map(x => x.getAttribute('href')));
  check(lk.length === 2 && lk.some(h => /araujotechsistemas.com\/painel\/\?loja=/.test(h)), 'ficha do cliente tem Ver catálogo e Panel del local (' + lk.join(' · ') + ')');
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
