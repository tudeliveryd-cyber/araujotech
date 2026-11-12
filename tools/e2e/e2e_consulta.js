// Modo consulta (autos, motos, imóveis, serviços): o produto tem "Consultar por WhatsApp" no lugar do carrinho.
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

  sec('A. Rubros novos no cadastro');
  await a.act('newshop'); await a.w(400);
  for (const r of ['autos', 'motos', 'inmobiliaria', 'servicios']) check(await a.locator('[data-act=nsramo][data-r=' + r + ']').count() === 1, 'rubro "' + r + '" na lista');
  await a.locator('[data-act=nsramo][data-r=otro]').click(); await a.w(300);
  await a.locator('#ns_segc').fill('Concesionaria del Este'); await a.w(300);
  check(/Autos y camionetas/.test(await a.txt('#nsSug')), '"Otro" com "Concesionaria" sugere Autos y camionetas');
  await a.locator('[data-act=nsramo][data-r=motos]').click(); await a.w(300);
  await a.set('#ns_name', 'Motos Consulta E2E'); await a.set('#ns_wa', '595981000701');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Motos Consulta E2E'); if (!s) return null; const c = S.get(mkK(s.id).pub, null); return { id: s.id, user: s.user, pass: s.pass, mode: c.store.mode, deliv: c.store.delivery, prods: c.products.map(p => [p.n.es, p.price, p.cq]) }; });
  info(JSON.stringify(shop));
  check(shop && shop.mode === 'consulta' && shop.deliv === false, 'catálogo de motos nasce em modo consulta, sem delivery');

  sec('B. Cliente no catálogo');
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const C = await L.open({ w: 390 }); const c = C.p;
  await c.goto(HOST + '/'); await c.waitForFunction(() => typeof pub !== 'undefined' && document.querySelector('[data-act=open]'), null, { timeout: 20000 }).catch(() => {});
  await c.w(800);
  await c.evaluate(() => { window.__wa = []; window.open = (u) => { window.__wa.push(u); return null; }; });
  const moto = shop.prods.findIndex(p => /150 cc/.test(p[0]));
  const ids = await c.evaluate(() => pub.products.map(p => ({ id: p.id, n: p.n.es })));
  const idMoto = ids.find(p => /150 cc/.test(p.n)).id, idCasco = ids.find(p => /Casco/.test(p.n)).id;
  check(await c.evaluate(([m, k]) => { const a = document.querySelector(`.pcard[data-pid="${m}"] .addb`), b = document.querySelector(`.pcard[data-pid="${k}"] .addb`); return !!a && !!b && a.innerHTML !== b.innerHTML && b.innerHTML.includes('M12 5v14') && a.innerHTML.includes('M4 20l1.4'); }, [idMoto, idCasco]).catch(e => String(e)) === true, 'cartão da moto com ícone de mensagem; acessório com "+"', await c.evaluate(([m, k]) => [m, k].map(i => { const e = document.querySelector(`.pcard[data-pid="${i}"] .addb`); return e ? e.innerHTML.replace(/<svg[^>]*>/,'').slice(0, 80) : 'sem .addb'; }).join(' || '), [idMoto, idCasco]));
  check(await c.evaluate(() => !/Solo retiro|programar tu pedido/.test(document.body.innerText)), 'cabeçalho sem "Solo retiro" nem "programar pedido"');
  await c.screenshot({ path: process.env.SHOT || '/tmp/cq.png', fullPage: false });
  await c.locator(`.pcard[data-pid="${idMoto}"]`).first().click(); await c.w(500);
  check(await c.locator('[data-act=cqsend]').count() === 1 && await c.locator('.sh-foot .stepper').count() === 0, 'moto: botão Consultar por WhatsApp, sem quantidade nem carrinho');
  await c.fill('#pnote', '¿Sigue disponible?'); await c.locator('#pnote').dispatchEvent('input'); await c.w(200);
  await c.act('cqsend'); await c.w(400);
  const wa = await c.evaluate(() => window.__wa[0] || '');
  const txt = decodeURIComponent((wa.split('text=')[1] || ''));
  info(wa.slice(0, 60) + ' | ' + txt.replace(/\n/g, ' / '));
  check(wa.startsWith('https://wa.me/595981000701'), 'abre o WhatsApp da loja');
  check(/Moto 150 cc 2025/.test(txt) && /9\.500\.000/.test(txt) && /Sigue disponible/.test(txt) && txt.includes(shop.id + '.araujotechsistemas.com'), 'mensagem com o produto, o preço, a pergunta e o link');
  await c.locator(`.pcard[data-pid="${idCasco}"]`).first().click(); await c.w(500);
  check(await c.locator('[data-act=addcart]').count() === 1 && await c.locator('[data-act=cqsend]').count() === 0, 'casco (acessório) continua com carrinho');
  await c.act('close').catch(() => {}); await c.w(300);
  check(await c.evaluate(() => cart.length) === 0, 'nada entrou no carrinho ao consultar');

  sec('C. Imobiliária: preço 0 vira "Consultar precio"');
  const ok = await a.evaluate(() => { const c = makeCfg('autos', { name: 'X' }); const p = c.products.find(p => p.price === 0); return { mode: c.store.mode, ask: !!p, html: sectionsHTML(c, true).includes(t('ask_price')) }; });
  check(ok.mode === 'consulta' && ok.ask && ok.html, 'autos: produto sem preço mostra "Consultar precio"', JSON.stringify(ok));
  check(!a.errs.length && !c.errs.length, 'sem erros de JavaScript', a.errs.concat(c.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
