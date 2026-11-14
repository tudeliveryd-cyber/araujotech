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
  check(await a.locator('[data-act="gusite"]').count() > 0, 'o painel tem o cartão Guía Vitrix com Administrar');
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
  sec('F. Profissionais em destaque');
  await a.act('guadd', '[data-k="pros"]'); await a.w(300);
  await a.locator('input[data-guprofile="0"]').setInputFiles(img); await a.w(1500);
  check(await a.evaluate(() => /^data:image\/jpeg/.test(ui.gu.pros[0].ph)), 'foto do profissional carregada');
  await a.fill('[data-gu="pros.0.n"]', 'Dra. Teste'); await a.locator('select[data-gu="pros.0.a"]').selectOption('derecho');
  await a.fill('[data-gu="pros.0.e"]', 'Abogada · Derecho laboral'); await a.fill('[data-gu="pros.0.wa"]', '0981 222 333'); await a.fill('[data-gu="pros.0.ig"]', '@dra.teste');
  await a.fill('[data-gu="pros.0.web"]', 'http://inseguro.com'); await a.act('gusave'); await a.w(1500);
  check(!((await doc()).gpro || []).length, 'link sem https no profissional não deixa salvar');
  await a.fill('[data-gu="pros.0.web"]', 'https://dra-teste.com'); await a.fill('[data-gu="pros.0.to"]', '2026-12-31');
  await a.act('gusave'); await a.w(2500); d = await doc(); const pr = (d.gpro || [])[0] || {}; info(JSON.stringify({ n: pr.n, a: pr.a, ig: pr.ig, wa: pr.wa, to: pr.to, ph: !!pr.ph }));
  check(pr.n === 'Dra. Teste' && pr.a === 'derecho' && pr.ig === 'dra.teste' && pr.wa === '0981 222 333' && pr.to === '2026-12-31' && pr.ph, 'profissional salvo com área, Instagram, WhatsApp, foto e vencimento');
  check((d.gutil || []).length === n0 + 1, 'os lugares continuam');
  await a.act('close'); await a.act('atsite'); await a.w(2500); await a.act('atsave'); await a.w(2500);
  check(((await doc()).gpro || []).length === 1, 'salvar o site não apaga os profissionais');
  sec('G. Horários de ônibus');
  await a.act('close'); await a.act('gusite'); await a.w(2000);
  await a.act('guadd', '[data-k="bus"]'); await a.w(300);
  await a.fill('[data-gu="bus.0.h"]', '06:15'); await a.fill('[data-gu="bus.0.e"]', 'Empresa Teste'); await a.fill('[data-gu="bus.0.dias"]', 'Lun a sáb');
  await a.act('gubusdup', '[data-i="0"]'); await a.w(300); await a.fill('[data-gu="bus.1.h"]', '05:40');
  await a.act('guadd', '[data-k="bus"]'); await a.w(300); await a.locator('select[data-gu="bus.2.d"]').selectOption('asu'); await a.w(300); await a.fill('[data-gu="bus.2.h"]', '21:00');
  await a.act('guadd', '[data-k="bus"]'); await a.w(300);
  await a.act('gusave'); await a.w(2500); d = await doc(); info(JSON.stringify(d.gbus));
  check((d.gbus || []).length === 3, 'salva os 3 horários com hora (o vazio fica de fora)');
  check(d.gbus[0].d === 'asu' && d.gbus[1].h === '05:40' && d.gbus[1].e === 'Empresa Teste' && d.gbus[2].h === '06:15', 'duplicar copia a empresa; fica ordenado por destino e hora');
  check(((d.gpro || []).length === 1) && (d.gutil || []).length === n0 + 1, 'profissionais e lugares continuam');
  sec('H. Premium recomendado, VIP com anúncio');
  const tiers = await a.evaluate(() => { PL.plans.push({ id: 't-vip', n: 'VIP', price: 1 }, { id: 't-prem', n: 'Premium', price: 1 }, { id: 't-bas', n: 'Básico', price: 1 }); const r = ['t-vip', 't-prem', 't-bas'].map(id => guTier({ plan: id, sys: 'catalogo' })); PL.plans.splice(-3, 3); return r; });
  info(JSON.stringify(tiers)); check(tiers[0] === 2 && tiers[1] === 1 && tiers[2] === 0, 'VIP = recomendado + slider, Premium = só recomendado, Básico = nada');
  check(!a.errs.length, 'sem erros de JavaScript', a.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
