// Abrir rápido: o catálogo aparece antes da nuvem responder (dados que o servidor põe na página, ou a cópia do celular),
// e o painel mostra a tela de entrar sem esperar o catálogo — sem mostrar dados de outra loja.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(400);
  await a.locator('[data-act=nsramo][data-r=farmacia]').click().catch(() => {}); await a.w(200);
  await a.set('#ns_name', 'Rapido E2E'); await a.set('#ns_wa', '595981000901');
  await a.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 200; const x = c.getContext('2d'); x.fillStyle = '#123'; x.fillRect(0, 0, 200, 200); ui.ns.logo = c.toDataURL('image/png'); });
  await a.act('createshop'); await a.w(4000);
  const id = await a.evaluate(() => (PL.shops.find(x => x.name === 'Rapido E2E') || {}).id);
  const doc = (await L.fsReq(P, 'GET', 'shops/' + id, 'owner')).json; const cfg = doc.fields.cfg.stringValue;
  const HOST = 'https://' + id + '.araujotechsistemas.com';
  const slow = async ctx => ctx.route(u => u.hostname === 'www.gstatic.com', async r => { await new Promise(z => setTimeout(z, 5000)); await r.fallback(); });
  const snap = p => p.evaluate(() => ({ boot: document.documentElement.classList.contains('tdc-boot'), h: (document.querySelector('.chead h1') || {}).textContent || '', pc: document.querySelectorAll('.pcard').length, logo: (() => { const im = document.querySelector('.chead-in .logo img'); return im ? im.getAttribute('src') || '' : ''; })() })).catch(e => ({ err: String(e) }));

  sec('A. 1ª visita: abre com os dados do servidor, sem esperar a nuvem');
  const C = await L.open({ w: 390, init: `window.TDC_PRE=${JSON.stringify({ id: '__ID__', cfg: '__CFG__' })}`.replace('"__ID__"', JSON.stringify(id)).replace('"__CFG__"', JSON.stringify(cfg)) }); const c = C.p;
  await slow(C.ctx);
  await c.goto(HOST + '/'); await c.w(1800);
  let s1 = await snap(c); info('1,8 s: ' + JSON.stringify(s1).slice(0, 200));
  check(!s1.boot && s1.h === 'Rapido E2E' && s1.pc > 0, 'em menos de 2 s o catálogo já aparece com o nome e os produtos certos (nuvem ainda carregando)');
  check(/logo\.php/.test(s1.logo), 'logo vem do servidor enquanto as imagens carregam');
  await c.w(14000); const s2 = await snap(c); info('16 s: ' + JSON.stringify(s2).slice(0, 120));
  check(s2.h === 'Rapido E2E' && /^data:image\//.test(s2.logo), 'depois a versão da nuvem assume (logo original)');

  sec('B. 2ª visita: abre na hora com a cópia do celular');
  await c.goto(HOST + '/'); await c.w(1500);
  const s3 = await snap(c); info(JSON.stringify(s3).slice(0, 120));
  check(!s3.boot && s3.h === 'Rapido E2E' && s3.pc > 0, '2ª visita aparece em 1,5 s mesmo com a nuvem lenta');

  sec('C. Painel: sem dados de outra loja na tela de entrar');
  const D = await L.open({ w: 390 }); const d = D.p;
  await d.goto(HOST + '/painel/');
  let first = null; for (let i = 0; i < 40 && !first; i++) { await d.w(150); first = await d.evaluate(() => document.querySelector('#loginForm') ? document.querySelector('.login').innerText.replace(/\n+/g, ' / ') : null); }
  info('primeira tela de entrar: ' + first);
  check(first && !/Restaurante|Fog[aã]o|Farmacia/.test(first), 'a tela de entrar não mostra nome de outra loja');
  await d.w(3000);
  check(/Rapido E2E/.test(await d.evaluate(() => document.querySelector('.login').innerText)), 'depois mostra o nome da loja');
  check(!c.errs.length && !d.errs.length, 'sem erros de JavaScript', c.errs.concat(d.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
