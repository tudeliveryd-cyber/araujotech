// Logo quadrado de fundo escuro (ex.: Status): no catálogo do subdomínio e no painel aparece com a moldura branca de cantos redondos.
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
  await a.set('#ns_name', 'Logo Quadrado E2E'); await a.set('#ns_wa', '595981000801');
  await a.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 400; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 400, 400); x.fillStyle = '#D4AF37'; x.font = 'bold 70px serif'; x.textAlign = 'center'; x.fillText('STATUS', 200, 225); ui.ns.logo = c.toDataURL('image/png'); });
  await a.act('createshop'); await a.w(4000);
  const id = await a.evaluate(() => (PL.shops.find(x => x.name === 'Logo Quadrado E2E') || {}).id);
  const C = await L.open({ w: 390 }); const c = C.p;
  await c.goto('https://' + id + '.araujotechsistemas.com/'); await c.waitForSelector('.chead-in .logo img', { timeout: 20000 }).catch(() => {}); await c.w(1500);
  const r = await c.evaluate(() => { const i = document.querySelector('.chead-in .logo img'); if (!i) return null; const cs = getComputedStyle(i); return { full: i.classList.contains('full'), rad: cs.borderTopLeftRadius, pad: cs.paddingTop }; });
  info(JSON.stringify(r));
  check(r && r.full && parseFloat(r.rad) >= 24 && parseFloat(r.pad) === 0, 'catálogo do cliente: logo escuro preenche a moldura com cantos redondos');
  if (process.env.SHOT) await c.locator('.chead').screenshot({ path: process.env.SHOT });
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
