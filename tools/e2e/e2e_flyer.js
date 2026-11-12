// Admin: "Crear flyer" — monta a arte de lançamento (story e post) com o logo, as cores e o QR do catálogo do cliente.
const L = require('./lib'); const P = 'araujotech-catalogos'; const fs = require('fs');
const { info, sec, check } = L;
const OUT = process.env.FLYER_OUT || '';
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(6000);

  sec('A. Cliente novo com logo, em Santa Rosa');
  await a.act('newshop'); await a.w(400);
  await a.locator('[data-act=nsramo][data-r=pesca]').click(); await a.w(300);
  await a.locator('[data-act=citypick][data-c="Santa Rosa del Monday"]').click(); await a.w(300);
  await a.set('#ns_name', 'Náutica Río Paraná E2E'); await a.set('#ns_wa', '595981000501');
  // logo de teste: círculo azul com um peixe estilizado (desenhado aqui, não é logo real)
  await a.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 240; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 240, 240); x.fillStyle = '#0B3D91'; x.beginPath(); x.arc(120, 120, 100, 0, 7); x.fill(); x.fillStyle = '#F2B705'; x.beginPath(); x.ellipse(110, 120, 55, 28, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(160, 120); x.lineTo(195, 95); x.lineTo(195, 145); x.fill(); ui.ns.logo = c.toDataURL('image/png'); ui.ns.th = { header: '#0B2545', primary: '#F2B705', highlight: '#F2B705', price: '#F2B705', card: '#FFFFFF' }; ui.ns.uselc = true; });
  await a.act('createshop'); await a.w(4000);
  const sid = await a.evaluate(() => (PL.shops.find(x => /Río Paraná/.test(x.name)) || {}).id); info('loja: ' + sid);

  sec('B. Botão "Crear flyer" gera story e post');
  check(await a.locator('[data-act=annfly][data-sid="' + sid + '"]').count() === 1, 'botão "Crear flyer" no cartão do cliente');
  await a.locator('[data-act=annfly][data-sid="' + sid + '"]').click();
  await a.waitForFunction(() => window.ui && ui.ann && ui.ann.out && ui.ann.out.story && document.querySelectorAll('.sheet img[alt]').length >= 4, null, { timeout: 30000 }).catch(() => {});
  const r = await a.evaluate(() => { const o = ui.ann && ui.ann.out || {}; const dim = u => new Promise(res => { const i = new Image(); i.onload = () => res([i.width, i.height]); i.onerror = () => res(null); i.src = u; }); return Promise.all([dim(o.story || ''), dim(o.post || ''), dim(o.door || ''), dim(o.table || '')]).then(d => ({ story: d[0], post: d[1], door: d[2], table: d[3], s: o.story || '', p: o.post || '', dr: o.door || '', tb: o.table || '' })); });
  check(r.story && r.story[0] === 1080 && r.story[1] === 1920, 'story 1080×1920', JSON.stringify(r.story));
  check(r.post && r.post[0] === 1080 && r.post[1] === 1350, 'post 1080×1350', JSON.stringify(r.post));
  check(r.door && r.door[0] === 2400 && r.door[1] === 2400, 'adesivo da porta 2400×2400 (20 cm a 300 dpi)', JSON.stringify(r.door));
  check(r.table && r.table[0] === 1240 && r.table[1] === 1748, 'placa da mesa 1240×1748 (A6 a 300 dpi)', JSON.stringify(r.table));
  check(await a.locator('[data-act=anndl]').count() === 4, 'quatro botões de baixar/compartilhar');
  if (OUT) { fs.writeFileSync(OUT + '-story-es.png', Buffer.from(r.s.split(',')[1], 'base64')); fs.writeFileSync(OUT + '-post-es.png', Buffer.from(r.p.split(',')[1], 'base64')); fs.writeFileSync(OUT + '-door-es.png', Buffer.from(r.dr.split(',')[1], 'base64')); fs.writeFileSync(OUT + '-table-es.png', Buffer.from(r.tb.split(',')[1], 'base64')); }

  sec('C. Versão em português');
  await a.locator('[data-act=annlang][data-l=pt]').click();
  await a.waitForFunction(() => document.querySelector('[data-act=annlang][data-l=pt][aria-pressed=true]') && document.querySelectorAll('.sheet img[alt]').length >= 4, null, { timeout: 30000 }).catch(() => {});
  const pt = await a.evaluate(() => ui.ann && ui.ann.out.story || '');
  check(pt && pt !== r.s, 'arte em português gerada');
  if (OUT && pt) fs.writeFileSync(OUT + '-story-pt.png', Buffer.from(pt.split(',')[1], 'base64'));
  check(!a.errs.length, 'sem erros de JavaScript', a.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
