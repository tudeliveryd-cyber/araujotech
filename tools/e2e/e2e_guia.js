// Guía Vitrix no Panel Araújo Tech: banners pagos do slider e lugares públicos ficam em platform/sitio,
// e salvar o texto do site da Araújo Tech não apaga nada disso.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L; const fs = require('fs'), path = require('path'), os = require('os');
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const doc = async () => L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json) || {};
  await L.fsReq(P, 'PATCH', 'platform/sitio', 'owner', L.fields({ clientes: [{ id: 'x', name: 'Cliente X', sys: 'catalogo' }], clientesAt: '2026-11-01' }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);

  await a.evaluate(() => { ui.view = 'platform'; render(); }); await a.w(500);
  sec('A. Abrir a Guía no painel');
  check(await a.locator('[data-act="gusite"]').count() > 0, 'o painel tem o botão Guía ao lado do site da Araújo Tech');
  await a.act('gusite'); await a.w(2000);
  check(await a.evaluate(() => !!ui.gu && ui.gu.ads.length === 0 && ui.gu.util.length === 0), 'abre vazio (sem banners e sem lugares)');

  sec('B. Banner pago com imagem, link e datas');
  await a.act('guadd', '[data-k="ads"]'); await a.w(300);
  const img = path.join(os.tmpdir(), 'e2e_banner.png');
  fs.writeFileSync(img, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAEElEQVR4nGP4z8DAwMDAAAAN+AH/2s0B3wAAAABJRU5ErkJggg==', 'base64'));
  await a.locator('input[data-gufile="0"]').setInputFiles(img); await a.w(1500);
  check(await a.evaluate(() => /^data:image\/jpeg/.test(ui.gu.ads[0].img)), 'a imagem do banner foi carregada (JPEG)');
  await a.fill('[data-gu="ads.0.t"]', 'Promo Teste'); await a.fill('[data-gu="ads.0.u"]', 'javascript:alert(1)');
  await a.act('gusave'); await a.w(1500);
  check(!(await doc()).gads, 'link inválido no banner não deixa salvar');
  await a.fill('[data-gu="ads.0.u"]', 'https://example.com/promo'); await a.fill('[data-gu="ads.0.to"]', '2026-12-31');
  check(await a.locator('.gu-ad .pill.gu-ok').count() === 1, 'o banner aparece como "En el aire"');

  sec('C. Lugares públicos');
  await a.act('guseed'); await a.w(300);
  const n0 = await a.evaluate(() => ui.gu.util.length); check(n0 >= 10, 'carrega a lista sugerida (' + n0 + ' lugares)');
  check(await a.evaluate(() => ui.gu.util.every(x => !x.tel)), 'a lista sugerida vem sem telefone (nada inventado)');
  await a.fill('[data-gu="util.0.tel"]', '061 000 000'); await a.fill('[data-gu="util.0.a"]', 'Calle Teste 1');
  await a.act('guadd', '[data-k="util"]'); await a.w(300);
  const last = n0; await a.fill(`[data-gu="util.${last}.n"]`, 'Balneario Teste'); await a.locator(`select[data-gu="util.${last}.c"]`).selectOption('ocio');
  if (process.env.SHOT) { await a.evaluate(() => document.querySelector('.sheet').scrollTop = 0); await a.screenshot({ path: process.env.SHOT + '/gu1.png' }); await a.evaluate(() => document.querySelector('.sheet').scrollTop = 900); await a.screenshot({ path: process.env.SHOT + '/gu2.png' }); }
  await a.act('gusave'); await a.w(2500);
  let d = await doc(); info(JSON.stringify({ ads: (d.gads || []).length, util: (d.gutil || []).length, at: d.gadsAt }));
  check((d.gads || []).length === 1 && d.gads[0].u === 'https://example.com/promo' && d.gads[0].to === '2026-12-31' && d.gads[0].on === true, 'banner salvo com link, data e ativo');
  check((d.gutil || []).length === n0 + 1 && d.gutil[0].tel === '061 000 000' && d.gutil[n0].c === 'ocio', 'lugares salvos com telefone e tipo');
  check((d.clientes || []).length === 1, 'os clientes da vitrine continuam lá');

  sec('D. Salvar o texto do site não apaga a Guía');
  await a.act('close'); await a.act('atsite'); await a.w(2500); await a.act('atsave'); await a.w(2500);
  d = await doc();
  check((d.gads || []).length === 1 && (d.gutil || []).length === n0 + 1, 'banners e lugares continuam depois de salvar o site');

  sec('E. Remover');
  await a.act('close'); await a.act('gusite'); await a.w(2000);
  check(await a.evaluate(n => ui.gu.ads.length === 1 && ui.gu.util.length === n, n0 + 1), 'reabre com o que foi salvo');
  await a.act('gurm', '[data-k="ads"][data-i="0"]'); await a.act('gusave'); await a.w(2000);
  d = await doc(); check((d.gads || []).length === 0 && (d.gutil || []).length === n0 + 1, 'remover o banner tira só o banner');
  check(!a.errs.length, 'sem erros de JavaScript', a.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
