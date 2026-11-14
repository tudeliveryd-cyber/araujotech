// O site padrão acompanha o WhatsApp (e o endereço) do catálogo: trocou no painel, troca no site.
// Se o cliente trocou o WhatsApp direto no editor do site, a troca dele é respeitada.
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
  await a.act('newshop'); await a.w(300);
  await a.set('#ns_name', 'Tienda Sync E2E'); await a.set('#ns_wa', '595981000991');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Tienda Sync E2E'); return s && { id: s.id, user: s.user, pass: s.pass, site: !!s.site }; });
  info(JSON.stringify({ id: shop.id, site: shop.site }));
  const site = async () => (L.unfields((await L.fsReq(P, 'GET', 'shops/' + shop.id, 'owner')).json) || {}).site || {};
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const O = await L.open({ w: 390 }); const o = O.p;
  await o.goto('https://' + shop.id + '.araujotechsistemas.com/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); }
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.waitForSelector('#np_a', { state: 'detached', timeout: 45000 }).catch(() => {}); await o.w(2500);

  await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Tienda Sync E2E'); s.siteExtra = true; if (!hasSite(s)) planOf(s).site = true; ensureSite(s, true); savePL(); }); await a.w(4000);
  let s0 = {}; for (let i = 0; i < 10 && !s0.slug; i++) { await a.w(1000); s0 = await site(); }
  check(!!s0.slug, 'o site padrão foi criado (' + s0.slug + ')');
  sec('A. Trocar o WhatsApp no painel troca no site');
  await o.evaluate(() => { pub.store.whatsapp = '595993487585'; pub.store.address = 'Calle Nueva 123, Santa Rita'; draft = clone(pub); queueCloudSave(); }); await o.w(6000);
  let s1 = await site(); info(JSON.stringify({ wa: s1.wa, addr: s1.addr, src: s1.src }));
  check(s1.wa === '595993487585', 'o site passou a usar o WhatsApp novo do catálogo');
  check(s1.addr === 'Calle Nueva 123, Santa Rita', 'e o endereço novo');
  check(s1.slug === s0.slug && s1.on === s0.on, 'o endereço do site e o "ligado" não mudam');

  sec('B. Troca feita no editor do site é respeitada');
  await o.evaluate(id => CLOUD.api.putShop(id, { site: { wa: '595981777777' } }), shop.id); await o.w(1500);
  await o.evaluate(() => { pub.store.whatsapp = '595982555555'; draft = clone(pub); queueCloudSave(); }); await o.w(6000);
  let s2 = await site(); info(JSON.stringify({ wa: s2.wa }));
  check(s2.wa === '595981777777', 'o WhatsApp escolhido no editor do site continua');

  sec('C. Ao abrir o painel, o site já se acerta sozinho');
  await L.fsReq(P, 'PATCH', 'shops/' + shop.id + '?updateMask.fieldPaths=site.wa&updateMask.fieldPaths=site.src', 'owner', L.fields({ site: { wa: '595982086171' } }));
  await o.reload(); await o.w(9000);
  let s3 = await site(); info(JSON.stringify({ wa: s3.wa }));
  check(s3.wa === '595982555555', 'site antigo com o número errado é corrigido ao abrir o painel');

  sec('D. Admin abre o site com os dados da nuvem');
  await a.evaluate(id => acts.siteedit({ dataset: { sid: id } }), shop.id); await a.w(2500);
  check(await a.evaluate(() => ui.se && ui.se.wa) === '595982555555', 'o editor do site no admin mostra o WhatsApp atual (não um antigo)');
  sec('E. Trocar para um plano sem site desliga o site (e os dados ficam)');
  const sw = await a.evaluate(id => { const s = PL.shops.find(x => x.id === id); const p = PL.plans.find(x => x.id !== s.plan && !x.site && (x.sys || 'catalogo') === 'catalogo'); s.siteExtra = false; return { from: s.plan, to: p && p.id }; }, shop.id); info(JSON.stringify(sw));
  const pick = async v => { await a.evaluate(() => { ui.view = 'platform'; render(); }); await a.w(400); await a.locator('select[data-shop="' + shop.id + '"][data-f="plan"]').first().selectOption(v); await a.w(3000); };
  await pick(sw.to); let s5 = await site(); info(JSON.stringify({ on: s5.on, wa: s5.wa }));
  check(s5.on === false && s5.wa === '595982555555' && s5.slug === s0.slug, 'plano sem site: o site fica desligado, sem perder WhatsApp nem endereço');
  await pick(sw.from); s5 = await site();
  check(s5.on === true && s5.wa === '595982555555', 'voltando ao plano com site, o site liga de novo');
  check(!a.errs.length && !o.errs.length, 'sem erros de JavaScript', a.errs.concat(o.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
