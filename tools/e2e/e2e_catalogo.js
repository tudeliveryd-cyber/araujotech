// Ponta a ponta do Catálogo Digital: admin → loja → painel → catálogo → pedido → equipe → permissões.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { ok, bad, info, sec, check } = L;
const STOP = process.env.STOP || '';
(async () => {
  // ---------- preparação ----------
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  await L.fsReq(P, 'PATCH', 'billing/semilla', 'owner', L.fields({ name: 'Semilla', status: 'ativo', user: 'semilla', plan: 'basico', due: '2026-12-01', pays: [], created: '2026-11-01' }));

  sec('A. Admin: entrar e registrar um local');
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', 'errada123'); await a.press('#lg_pass', 'Enter'); await a.w(2500);
  check(await a.locator('#lg_user').count() > 0, 'admin: senha errada é recusada', await a.txt());
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(3500);
  check(await a.locator('[data-act=newshop]').count() > 0, 'admin: entra com a conta de administrador (Firebase Auth)', (await a.txt()).slice(0, 200));
  check(!(await a.txt()).includes('Boi de Ouro'), 'admin: lista vem da nuvem (sem clientes de exemplo)');
  await a.act('newshop');
  await a.set('#ns_name', 'Prueba E2E'); await a.w(300);
  const sub0 = await a.inputValue('#ns_sub'); info('dirección sugerida: ' + sub0);
  await a.locator('[data-act=nsramo][data-r=restaurante], [data-act=nsramo]').first().click(); await a.w(300);
  await a.set('#ns_wa', '595981000111');
  await a.act('createshop'); await a.w(4000);
  let shop = await a.evaluate(() => { const s = PL.shops.find(x => /Prueba E2E/.test(x.name)); return s ? { id: s.id, user: s.user, pass: s.pass, status: s.status, plan: s.plan, due: s.due } : null; });
  check(!!shop, 'admin: local registrado aparece na lista', (await a.txt('.sheet')).slice(0, 300) + ' | ' + a.errs.join('|') + '|' + (a.cons || []).join('|').slice(0, 300));
  if (!shop) return L.done();
  info('local: ' + JSON.stringify(shop));
  check(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(shop.pass), 'admin: senha provisória é aleatória (formato XXXX-XXXX), não 123456');
  const SID = shop.id, HOST = 'https://' + SID + '.araujotechsistemas.com';
  const dShop = await L.fsReq(P, 'GET', 'shops/' + SID, 'owner'), dBill = await L.fsReq(P, 'GET', 'billing/' + SID, 'owner');
  check(dShop.status === 200 && !!L.unfields(dShop.json).cfg, 'Firebase: documento da loja criado com o catálogo inicial');
  info('bairros no cadastro inicial: ' + JSON.stringify((JSON.parse(L.unfields(dShop.json).cfg).store.bairros || []).slice(0, 4)));
  check(dBill.status === 200, 'Firebase: cobrança da loja criada (privada)');
  const tk0 = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass);
  check(!!tk0.idToken, 'Firebase Auth: usuário do dono criado com a senha provisória', JSON.stringify(tk0).slice(0, 160));
  const su = await L.fsReq(P, 'GET', 'shopUsers/' + tk0.localId, 'owner'); const suD = L.unfields(su.json) || {};
  check(suD.shop === SID && suD.mc === true, 'Firebase: vínculo usuário → loja com troca de senha obrigatória', JSON.stringify(suD));
  info('planos: ' + await a.evaluate(() => JSON.stringify(PL.plans.map(p => ({id:p.id,n:p.n,sys:p.sys,p:p.p,usd:p.usd,inst:p.inst,instUsd:p.instUsd,max:p.max}))).slice(0,900)+' fx='+JSON.stringify(PL.fx)));
  if (STOP === 'A') return L.done();

  sec('B. Dono: primeiro acesso com a senha provisória');
  const O = await L.open({ w: 390 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.w(3000);
  await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', 'senha-errada'); await o.press('#lg_pass', 'Enter'); await o.w(2500);
  check(await o.locator('#lg_user').count() > 0, 'painel: senha errada é recusada', (await o.txt()).slice(0, 200));
  await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); await o.w(3500);
  check(await o.locator('#np_a').count() > 0, 'painel: no primeiro acesso o sistema exige criar a senha própria', (await o.txt()).slice(0, 300));
  await o.fill('#np_a', shop.pass); await o.fill('#np_b', shop.pass); await o.press('#np_b', 'Enter'); await o.w(1500);
  check(await o.locator('#np_a').count() > 0, 'painel: repetir a senha provisória como nova é recusado', (await o.txt()).slice(0, 200));
  await o.fill('#np_a', '123'); await o.fill('#np_b', '123'); await o.press('#np_b', 'Enter'); await o.w(1500);
  check(await o.locator('#np_a').count() > 0, 'painel: senha curta é recusada');
  const NEWP = 'DonoNovo#77';
  await o.fill('#np_a', NEWP); await o.fill('#np_b', NEWP); await o.press('#np_b', 'Enter'); await o.w(4000);
  check(await o.locator('[data-act=tab]').count() > 0, 'painel: senha própria criada e painel aberto', (await o.txt()).slice(0, 300) + '|' + o.errs.join('|'));
  const tOld = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass), tNew = await L.signIn(shop.user + '@araujotechsistemas.com', NEWP);
  check(!tOld.idToken && !!tNew.idToken, 'Firebase Auth: a senha provisória deixou de funcionar e a nova funciona');
  const su2 = L.unfields((await L.fsReq(P, 'GET', 'shopUsers/' + tk0.localId, 'owner')).json) || {};
  check(su2.mc !== true, 'Firebase: marca de troca obrigatória removida', JSON.stringify(su2));
  await o.dump('painel do dono', 700);
  if (STOP === 'B') return L.done();
  const tab = async (pg, t) => { await pg.evaluate(t => { ui.tab = t; render(); }, t); await pg.w(500); };
  const step = async (name, fn, pg) => { try { await fn(); } catch (e) { let d = ''; try { if (pg) d = ' | tela: ' + (await pg.txt('.sheet')).slice(0, 500) + ' | ' + (await pg.txt()).slice(0, 300) + ' | erros: ' + pg.errs.join(';'); } catch (x) {} bad(name + ': exceção ' + String(e.message).split('\n')[0].slice(0, 200) + d); } };
  const IMG = require('path').join(L.DIRS.site, 'img', require('fs').readdirSync(require('path').join(L.DIRS.site, 'img')).find(f => /\.(png|jpg)$/.test(f)));
  const shopDoc = async () => L.unfields((await L.fsReq(P, 'GET', 'shops/' + SID, 'owner')).json) || {};
  const cfgOf = d => { try { return JSON.parse(d.cfg); } catch (e) { return {}; } };
  let PID = '', PID2 = '';

  sec('C. Painel: dados salvos de forma permanente');
  await step('produtos', async () => {
    await tab(o, 'products'); await o.act('newprod');
    await o.set('#ed_nes', 'Milanesa E2E'); await o.set('#ed_des', 'Con papas'); await o.set('#ed_pr', '30000');
    await o.setInputFiles('#prodFile', IMG); await o.w(2500);
    await o.act('saveprod'); await o.w(3000);
    await o.act('newprod'); await o.set('#ed_nes', 'Gaseosa E2E'); await o.set('#ed_pr', '8000');
    await o.set('#ed_bc', '7790001112223'); await o.act('saveprod'); await o.w(3000);
    const ids = await o.evaluate(() => { const f = n => (pub.products.find(p => p.n.es === n) || {}).id || ''; return [f('Milanesa E2E'), f('Gaseosa E2E')]; }); PID = ids[0]; PID2 = ids[1];
    await o.set('#pk_' + PID2, '5'); await o.w(2500);
    check(!!PID && !!PID2, 'painel: dois produtos criados (um só com nome em espanhol, com foto; outro com estoque e código de barras)', (await o.txt('.sheet')).slice(0, 200));
    await tab(o, 'delivery'); await o.set('#br_f_0', '7000'); await o.set('#br_f_1', '12000'); await o.w(3000);
    const d = await shopDoc(), c = cfgOf(d); const pr = (c.products || []).find(p => p.id === PID) || {}, p2 = (c.products || []).find(p => p.id === PID2) || {};
    check(pr.price === 30000 && pr.n && pr.n.es === 'Milanesa E2E' && pr.n.pt === 'Milanesa E2E', 'Firebase: produto gravado na nuvem (preço e nome nos dois idiomas)', JSON.stringify(pr).slice(0, 200));
    check(+p2.stock === 5 && p2.bc === '7790001112223', 'Firebase: estoque e código de barras gravados', JSON.stringify(p2).slice(0, 240));
    info('bairros depois de salvar 2 taxas: ' + JSON.stringify(c.store.bairros.slice(0, 4)));
    check(c.store && c.store.bairros[0].fee === 7000 && c.store.bairros[1].fee === 12000, 'Firebase: taxas por bairro gravadas', JSON.stringify(c.store && c.store.bairros.slice(0, 2)));
    const hasMedia = Object.keys(d).some(k => /^media/i.test(k)) || /data:image|"img":"m:/.test(d.cfg || '');
    check(hasMedia || !!pr.img, 'Firebase: foto do produto gravada', 'campos: ' + Object.keys(d).join(',') + ' img=' + String(pr.img).slice(0, 40));
  });
  if (STOP === 'C') return L.done();

  sec('D. Cliente anônimo: catálogo e pedido real');
  const C = await L.open({ w: 390 }); const c = C.p; let ORD = null;
  await step('catálogo', async () => {
    { const t = new Date(); t.setUTCHours(15, 5, 0, 0); await c.clock.setFixedTime(t); } // 12:05 em Asunción: local aberto
    await c.goto(HOST + '/'); await c.waitForFunction(() => typeof pub !== 'undefined' && document.querySelector('[data-act=open]') && pub.products.some(p => p.n.es === 'Milanesa E2E'), null, { timeout: 20000 }).catch(() => {});
    const st = await c.evaluate(() => ({ has: document.body.innerText.includes('Milanesa E2E'), img: !!([...document.images].find(i => i.closest('[data-pid]') && /Milanesa/.test(i.closest('[data-pid]').innerText) && i.naturalWidth > 0)), name: pub.store.name }));
    check(st.has && st.name === 'Prueba E2E', 'catálogo público (outro aparelho, sem login) mostra o produto novo', JSON.stringify(st));
    check(st.img, 'catálogo público mostra a foto enviada pelo painel');
    info('catálogo: bairros carregados = ' + await c.evaluate(() => JSON.stringify(pub.store.bairros.slice(0, 4)) + ' feeApproved=' + JSON.stringify(pub.store.feeApproved || null) + ' lim=' + JSON.stringify(LIM)));
    await c.locator('[data-act=open][data-pid="' + PID + '"]:visible').first().click(); await c.w(500); await c.act('addcart');
    await c.locator('[data-act=open][data-pid="' + PID2 + '"]:visible').first().click(); await c.w(500); await c.act('addcart'); 
    await c.act('cart'); const ct = c.locator('.sheet button:visible', { hasText: 'Continuar' }); if (await ct.count()) { await ct.first().click(); await c.w(400); } else await c.act('checkout');
    await c.locator('[data-act=mode]:visible').first().click(); await c.w(400);
    await c.fill('[data-ck=name]', 'Cliente E2E'); await c.fill('[data-ck=phone]', '0981 555 444');
    const bo = await c.locator('[data-ck=bairro]').evaluate(e => [...e.options].map(x => x.value + '|' + x.textContent.trim()).slice(0, 3)); 
    await c.selectOption('[data-ck=bairro]', { index: 1 }); await c.w(300);
    const rf = c.locator('[data-ck=ref]'); if (await rf.count()) await rf.fill('Casa verde');
    if (await c.locator('[data-ck=couponIn]').count()) { await c.fill('[data-ck=couponIn]', 'BIENVENIDO10'); await c.act('applycoupon'); }
    const cup = await c.evaluate(() => ck.coupon || ''); info('cupom no plano Esencial: ' + (cup ? 'aplicado' : 'não disponível (correto: cupons são do plano Crecimiento)') + ' · bairros: ' + bo.join(' ; '));
    await c.act('send'); await c.w(3500);
    const errTxt = await c.evaluate(() => Object.values(typeof ckErr !== 'undefined' ? ckErr : {}).join(' '));
    const q = await L.fsReq(P, 'GET', 'shops/' + SID + '/orders', 'owner'); const docs = (q.json && q.json.documents) || [];
    check(docs.length === 1, 'Firebase: o pedido do cliente foi gravado', 'docs=' + docs.length + ' err=' + errTxt + ' | ' + (await c.txt('.sheet')).slice(0, 200));
    if (docs.length) { ORD = L.unfields(docs[0]); ORD._id = docs[0].name.split('/').pop();
      const exp = 30000 + 8000 + 7000 - (cup ? 3800 : 0);
      check(ORD.total === exp && ORD.fee === 7000 && ORD.sub === 38000, 'pedido: subtotal 38.000 + envio 7.000' + (cup ? ' − cupom 3.800' : '') + ' = ' + exp, JSON.stringify({ total: ORD.total, fee: ORD.fee, sub: ORD.sub, disc: ORD.disc }));
      check(ORD.name === 'Cliente E2E' && /San José/.test(ORD.bairro || ''), 'pedido: nome, telefone e bairro gravados', JSON.stringify({ n: ORD.name, b: ORD.bairro, ph: ORD.phone })); }
    const wa = decodeURIComponent(await c.evaluate(() => { const l = document.querySelector('.sheet a.btn-main'); return l ? l.href : ''; }));
    check(/wa\.me\/595981000111/.test(wa) && /Milanesa E2E/.test(wa) && /Cliente E2E/.test(wa) && /45\.000/.test(wa), 'pedido: botão "Abrir WhatsApp" leva ao número do local com a mensagem completa (itens, cliente e total)', wa.slice(0, 200));
  }, c);
  if (STOP === 'D') return L.done();

  sec('E. Dois aparelhos ao mesmo tempo');
  const O2 = await L.open({ w: 1366 }); const o2 = O2.p;
  await step('tempo real', async () => {
    await tab(o, 'orders');
    check((await o.txt()).includes('Cliente E2E'), 'painel (celular já aberto): o pedido chegou sozinho, sem recarregar', (await o.txt()).slice(0, 300));
    await o2.goto(HOST + '/painel/'); await o2.w(2500); await o2.fill('#lg_user', shop.user); await o2.fill('#lg_pass', NEWP); await o2.press('#lg_pass', 'Enter'); await o2.w(3500);
    await tab(o2, 'orders');
    check((await o2.txt()).includes('Cliente E2E'), 'segundo aparelho (computador) entra com a senha nova e vê o mesmo pedido');
    await o2.locator('select:visible').first().selectOption('preparo'); await o2.w(2500);
    const s1 = await o.evaluate(() => (orders[0] || {}).status);
    check(s1 === 'preparo', 'mudança de status no computador aparece no celular em segundos', 'status no celular: ' + s1);
    const tr = await c.evaluate(() => ({ t: typeof TRACK !== 'undefined' && TRACK ? TRACK.status : null, box: (document.querySelector('#trackBox') || {}).innerText || '' }));
    check(tr.t === 'preparo', 'cliente: o acompanhamento do pedido atualiza sozinho no aparelho dele', JSON.stringify(tr).slice(0, 200));
    // edição simultânea: preço no computador, depois conferir no celular
    await tab(o2, 'products'); await o2.set('#pp_' + PID, '31000'); await o2.w(3000);
    await o.reload(); await o.w(3500);
    const pr = await o.evaluate(id => (pub.products.find(p => p.id === id) || {}).price, PID);
    check(pr === 31000, 'preço alterado no computador aparece no celular ao reabrir', 'preço no celular: ' + pr);
  });
  if (STOP === 'E') return L.done();

  sec('F. Equipe: usuários por função');
  let cocPass = '';
  await step('equipe', async () => {
    await tab(o, 'resumo');
    await o.set('#tm_u', 'cajae2e'); await o.set('#tm_p', 'CajaE2E#55'); await o.selectOption('#tm_r', 'caja'); await o.act('teamadd'); await o.w(3500);
    cocPass = await o.inputValue('#tm_p');
    await o.set('#tm_u', 'cocinae2e'); await o.selectOption('#tm_r', 'cocina'); await o.act('teamadd'); await o.w(3500);
    check(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(cocPass), 'equipe: a senha sugerida para o funcionário é aleatória', cocPass);
    const tx = await o.txt(); check(/cajae2e/.test(tx) && /cocinae2e/.test(tx), 'equipe: os dois usuários aparecem na lista do dono', tx.slice(-400));
    const K = await L.open({ w: 390 }); const k = K.p; await k.goto(HOST + '/painel/'); await k.w(2500);
    await k.fill('#lg_user', 'cajae2e'); await k.fill('#lg_pass', 'CajaE2E#55'); await k.press('#lg_pass', 'Enter'); await k.w(3500);
    const kt = await k.evaluate(() => ({ np: !!document.querySelector('#np_a'), tabs: [...new Set([...document.querySelectorAll('[data-act=tab]')].map(e => e.dataset.tab || e.dataset.t || e.innerText.trim()))], vis: typeof visTabs === 'function' ? visTabs() : null, role: typeof CLOUD !== 'undefined' ? CLOUD.role : '' }));
    const kall = JSON.stringify(kt.tabs).toLowerCase();
    check(!kt.np && /caja/.test(kall) && /pedidos|orders/.test(kall) && !/product|aparien|custom|env[ií]o|delivery|cliente/.test(kall), 'caixa: entra e vê só caixa e pedidos (sem produtos, aparência nem configurações)', JSON.stringify(kt));
    await K.ctx.close();
    const Z = await L.open({ w: 390 }); const z = Z.p; await z.goto(HOST + '/painel/'); await z.w(2500);
    await z.fill('#lg_user', 'cocinae2e'); await z.fill('#lg_pass', cocPass); await z.press('#lg_pass', 'Enter'); await z.w(3500);
    check(await z.locator('#np_a').count() > 0, 'cozinha: com senha provisória, é obrigada a criar a própria no primeiro acesso', (await z.txt()).slice(0, 200));
    await z.fill('#np_a', 'CocinaE2E#9'); await z.fill('#np_b', 'CocinaE2E#9'); await z.press('#np_b', 'Enter'); await z.w(4000);
    const zt = await z.evaluate(() => ({ tabs: [...new Set([...document.querySelectorAll('[data-act=tab]')].map(e => e.dataset.tab || e.dataset.t || e.innerText.trim()))], txt: document.body.innerText.slice(0, 200) }));
    check(zt.tabs.length <= 1 && !/product|caja|pedidos/i.test(JSON.stringify(zt.tabs)) && /Milanesa E2E|Cocina/i.test(await z.txt()), 'cozinha: vê só a tela da cozinha, com o pedido em preparo', JSON.stringify(zt));
    await Z.ctx.close();
  }, o);
  if (STOP === 'F') return L.done();

  sec('G. Permissões no Firebase (regras reais, por tipo de usuário)');
  await step('regras', async () => {
    // segunda loja, para provar o isolamento
    await a.act('newshop'); await a.set('#ns_name', 'Otra E2E'); await a.w(300); await a.locator('[data-act=nsramo]').first().click(); await a.w(300); await a.set('#ns_wa', '595981000222'); await a.act('createshop'); await a.w(4000);
    const other = await a.evaluate(() => { const s = PL.shops.find(x => /Otra E2E/.test(x.name)); return s ? { id: s.id, user: s.user, pass: s.pass } : null; });
    check(!!other, 'admin: segundo local registrado'); if (!other) return;
    const own = (await L.signIn(shop.user + '@araujotechsistemas.com', NEWP)).idToken, caj = (await L.signIn('cajae2e@araujotechsistemas.com', 'CajaE2E#55')).idToken, oth = (await L.signIn(other.user + '@araujotechsistemas.com', other.pass)).idToken, adm = (await L.signIn(...ADM)).idToken;
    const T = async (desc, method, pth, tok, exp, body) => { const r = await L.fsReq(P, method, pth, tok, body); const okk = Array.isArray(exp) ? exp.includes(r.status) : r.status === exp; check(okk, desc + ' → HTTP ' + r.status, 'esperado ' + exp); return r; };
    const O1 = 'shops/' + SID + '/orders', OID = ORD ? ORD._id : 'x';
    await T('dono lê os pedidos da própria loja', 'GET', O1, own, 200);
    await T('dono lê os dados privados (custos) da própria loja', 'GET', 'shops/' + SID + '/priv/main', own, [200, 404]);
    await T('dono de OUTRA loja não lê os pedidos desta', 'GET', O1, oth, 403);
    await T('dono de OUTRA loja não altera esta loja', 'PATCH', 'shops/' + SID + '?updateMask.fieldPaths=updated', oth, 403, L.fields({ updated: 'x' }));
    await T('dono de OUTRA loja não altera um pedido desta', 'PATCH', O1 + '/' + OID + '?updateMask.fieldPaths=status', oth, 403, L.fields({ status: 'cancelado' }));
    await T('dono não lê a cobrança (billing) nem da própria loja', 'GET', 'billing/' + SID, own, 403);
    await T('dono não lê os dados do admin', 'GET', 'platform/config', own, 403);
    await T('dono não consegue se marcar como ativo/alterar o próprio plano (campos do admin)', 'PATCH', 'shops/' + SID + '?updateMask.fieldPaths=lim', own, 403, L.fields({ lim: { max: 0, off: [] } }));
    await T('dono não consegue reativar a própria loja (status)', 'PATCH', 'shops/' + SID + '?updateMask.fieldPaths=status', own, 403, L.fields({ status: 'ativo2' }));
    await T('dono não cria usuário para outra loja', 'PATCH', 'shopUsers/intruso1', own, 403, L.fields({ shop: other.id, role: 'caja' }));
    await T('caixa lê os pedidos', 'GET', O1, caj, 200);
    await T('caixa não lê os custos privados do dono', 'GET', 'shops/' + SID + '/priv/main', caj, 403);
    await T('caixa não cria usuários', 'PATCH', 'shopUsers/intruso2', caj, 403, L.fields({ shop: SID, role: 'caja' }));
    await T('caixa não lê a lista de usuários da loja', 'GET', 'shopUsers', caj, 403);
    await T('anônimo não lê pedidos', 'GET', O1, null, 403);
    await T('anônimo não lê um pedido pelo código', 'GET', O1 + '/' + OID, null, 403);
    await T('anônimo não altera pedido', 'PATCH', O1 + '/' + OID + '?updateMask.fieldPaths=status', null, 403, L.fields({ status: 'entregue' }));
    await T('anônimo não altera a loja', 'PATCH', 'shops/' + SID + '?updateMask.fieldPaths=cfg', null, 403, L.fields({ cfg: '{}' }));
    await T('anônimo não apaga a loja', 'DELETE', 'shops/' + SID, null, 403);
    await T('anônimo não lê usuários', 'GET', 'shopUsers', null, 403);
    await T('anônimo não lê cobranças', 'GET', 'billing', null, 403);
    await T('anônimo lê o catálogo público', 'GET', 'shops/' + SID, null, 200);
    await T('anônimo acompanha o próprio pedido pelo código', 'GET', 'shops/' + SID + '/track/' + OID, null, 200);
    await T('admin lê cobranças', 'GET', 'billing', adm, 200);
    await T('admin lê os pedidos de qualquer loja', 'GET', O1, adm, 200);
    const rw = await L.fsReq(P, 'PATCH', 'shops/' + SID + '?updateMask.fieldPaths=updated', caj, L.fields({ updated: 'caixa-alterou' }));
    info('caixa gravando no documento da loja pela API → HTTP ' + rw.status + (rw.status === 200 ? ' (necessário para a baixa de estoque; na v11 a cozinha fica bloqueada)' : ''));
    global.__other = other;
    if (/v11/.test(process.env.RULES || '')) {
      const zc = (await L.signIn('cocinae2e@araujotechsistemas.com', 'CocinaE2E#9')).idToken;
      await T('v11: cozinha não altera os dados da loja', 'PATCH', 'shops/' + SID + '?updateMask.fieldPaths=updated', zc, 403, L.fields({ updated: 'x' }));
      await T('v11: cozinha continua lendo e atualizando pedidos', 'PATCH', O1 + '/' + OID + '?updateMask.fieldPaths=kds', zc, 200, L.fields({ kds: 'ok' }));
      await T('v11: caixa continua gravando na loja (baixa de estoque)', 'PATCH', 'shops/' + SID + '?updateMask.fieldPaths=updated', caj, 200, L.fields({ updated: 'caja' }));
      await T('v11: pedido com número adulterado é recusado', 'POST', O1, null, 403, L.fields({ no: '9"><img src=x>', name: 'x', total: 1 }));
      await T('v11: pedido com total em texto é recusado', 'POST', O1, null, 403, L.fields({ no: 5, name: 'x', total: '<b>1</b>' }));
      await T('v11: pedido com comprovante que não é imagem é recusado', 'POST', O1, null, 403, L.fields({ no: 5, name: 'x', total: 1, proof: 'x" onerror="alert(1)' }));
      await T('v11: pedido com nome gigante é recusado', 'POST', O1, null, 403, L.fields({ no: 5, name: 'x'.repeat(500), total: 1 }));
      await T('v11: pedido bem formado de visitante é aceito', 'POST', O1, null, 200, L.fields({ no: 9001, name: 'Teste regra', phone: '0981', total: 1000, sub: 1000, fee: null, status: 'aguardando', mode: 'pickup', lines: [], items: [], proof: 'data:image/jpeg;base64,/9j/4AAQ' }));
      await T('v11: pedido para loja que não existe é recusado', 'POST', 'shops/nao-existe-e2e/orders', null, 403, L.fields({ no: 1, name: 'x', total: 1 }));
    }
  }, a);
  if (STOP === 'G') return L.done();

  sec('H. Admin: pagamento, suspensão e backup');
  await step('admin', async () => {
    const due0 = await a.evaluate(id => PL.shops.find(x => x.id === id).due, SID), pay0 = await a.evaluate(id => (PL.shops.find(x => x.id === id).pays || []).length, SID);
    await a.locator('[data-act=shoppay][data-sid="' + SID + '"]:visible').first().click(); await a.w(1500);
    await a.w(1500);
    const s1 = await a.evaluate(id => { const s = PL.shops.find(x => x.id === id); return { due: s.due, pays: (s.pays || []).length }; }, SID);
    check(s1.pays === pay0 + 1 && s1.due > due0, 'admin: registrar pagamento grava o pago e avança o vencimento (' + due0 + ' → ' + s1.due + ')', JSON.stringify(s1));
    const bd = L.unfields((await L.fsReq(P, 'GET', 'billing/' + SID, 'owner')).json) || {};
    check((bd.pays || []).length === pay0 + 1 && bd.due === s1.due, 'Firebase: pagamento gravado na cobrança', JSON.stringify({ due: bd.due, pays: bd.pays }).slice(0, 200));
    await a.locator('[data-act=shopstatus][data-sid="' + SID + '"]:visible').first().click(); await a.w(3000);
    const sd = await shopDoc(); check(sd.status === 'suspenso', 'admin: suspender grava o status na loja', 'status=' + sd.status);
    const V = await L.open({ w: 390 }); const v = V.p; await v.goto(HOST + '/'); await v.w(5000);
    const vs = await v.evaluate(() => ({ susp: !!document.querySelector('.susp-wrap'), prods: document.querySelectorAll('[data-act=open]').length, txt: document.body.innerText.slice(0, 120) }));
    check(vs.susp && vs.prods === 0, 'catálogo suspenso: cliente vê o aviso de indisponível e nenhum produto', JSON.stringify(vs));
    const ro = await L.fsReq(P, 'POST', 'shops/' + SID + '/orders', null, L.fields({ name: 'x', total: 1 }));
    if (/v11/.test(process.env.RULES || '')) check(ro.status === 403, 'v11: loja suspensa não aceita pedido nem pela API → HTTP ' + ro.status); else info('pedido direto pela API com a loja suspensa → HTTP ' + ro.status + (ro.status === 200 ? ' (a regra atual aceita; fecha com as regras v11)' : ''));
    await V.ctx.close();
    await a.locator('[data-act=shopstatus][data-sid="' + SID + '"]:visible, [data-act=shoppay][data-sid="' + SID + '"].pri:visible').first().click(); await a.w(2500);
    if (await a.locator('.sheet .btn-main:visible').count()) { await a.locator('.sheet .btn-main:visible').first().click(); await a.w(2500); }
    const sd2 = await shopDoc(); check(sd2.status === 'ativo', 'admin: reativar devolve a loja ao ar', 'status=' + sd2.status);
    const dlP = a.waitForEvent('download', { timeout: 20000 }).catch(() => null); await a.act('backup'); const dl = await dlP;
    if (!dl) { bad('admin: backup não gerou arquivo → ' + (await a.txt('.sheet')).slice(0, 200) + a.errs.join(';')); }
    else { const fp = await dl.path(); const txt = require('fs').readFileSync(fp, 'utf8'); let j = null; try { j = JSON.parse(txt); } catch (e) {}
      check(!!j && txt.includes('Prueba E2E') && txt.includes('Milanesa E2E') && txt.includes('Cliente E2E'), 'admin: o backup baixado contém a loja, os produtos e os pedidos (' + Math.round(txt.length / 1024) + ' KB, ' + dl.suggestedFilename() + ')', txt.slice(0, 200)); }
  }, a);
  if (STOP === 'H') return L.done();

  sec('I. Caixa: venda no balcão e estoque');
  await step('caixa', async () => {
    const st0 = +(cfgOf(await shopDoc()).products.find(p => p.id === PID2) || {}).stock;
    info('estoque da Gaseosa depois do pedido online (era 5, 1 vendida): ' + st0);
    await o2.reload(); await o2.w(3500); await tab(o2, 'caja');
    let bt = o2.locator('[data-act=posadd][data-pid="' + PID2 + '"]:visible'); if (!(await bt.count())) { const q = o2.locator('#posq, [data-pos=q], input[type=search]:visible').first(); if (await q.count()) { await q.fill('Gaseosa'); await o2.w(400); } bt = o2.locator('[data-act=posadd]:visible', { hasText: 'Gaseosa E2E' }); }
    await bt.first().click(); await o2.w(400); await bt.first().click(); await o2.w(400);
    const pt = await o2.evaluate(() => { const s = posState(); return { n: s.items.reduce((a, i) => a + i.q, 0), tot: typeof posTotal === 'function' ? posTotal() : null }; });
    check(pt.n === 2, 'caixa: 2 unidades adicionadas à venda', JSON.stringify(pt));
    await o2.act('poscharge'); await o2.w(3500);
    const q = await L.fsReq(P, 'GET', 'shops/' + SID + '/orders', 'owner'); const docs = ((q.json && q.json.documents) || []).map(L.unfields);
    const pos = docs.find(d => d.total === 16000);
    check(docs.filter(d => d.no && d.no < 9000).length === 2 && !!pos, 'Firebase: a venda do caixa foi gravada (Gs. 16.000)', JSON.stringify(docs.map(d => [d.no, d.total, d.status, d.mode])));
    await o2.w(2500); const st1 = +(cfgOf(await shopDoc()).products.find(p => p.id === PID2) || {}).stock;
    check(st1 === st0 - 2, 'estoque baixa sozinho depois da venda no caixa (' + st0 + ' → ' + st1 + ')');
    check(st0 === 4, 'estoque baixou 1 unidade com o pedido online aceito (5 → ' + st0 + ')');
    // leitor de código de barras (sem câmera): digitar o código busca o produto
    await o2.act('close'); const bc = await o2.evaluate(code => { const p = pub.products.find(x => x.bc === code); return p ? p.n.es : ''; }, '7790001112223');
    check(bc === 'Gaseosa E2E', 'código de barras gravado encontra o produto (a leitura pela câmera depende de aparelho)');
  }, o2);
  if (STOP === 'I') return L.done();

  sec('J. Entrega, avaliação e CRM');
  await step('avaliação', async () => {
    await tab(o2, 'orders'); const sel = o2.locator('.ord:has-text("Cliente E2E") select:visible, select:visible').first(); await sel.selectOption('entregue').catch(async () => { await sel.selectOption({ index: (await sel.evaluate(e => e.options.length)) - 2 }); }); await o2.w(3000);
    const tr = await c.evaluate(() => (typeof TRACK !== 'undefined' && TRACK ? TRACK.status : null));
    check(tr === 'entregue', 'cliente: vê o pedido como entregue', 'track=' + tr);
    await c.act('close'); await c.w(500);
    await c.locator('[data-act=rate]:visible').nth(4).click(); await c.w(1500);
    await c.fill('#rv_txt', 'Muy rico, llegó a tiempo'); await c.act('ratesend'); await c.w(2500);
    const rv = ((await L.fsReq(P, 'GET', 'shops/' + SID + '/reviews', 'owner')).json.documents || []).map(L.unfields);
    check(rv.length === 1 && rv[0].stars === 5 && /Muy rico/.test(rv[0].text), 'Firebase: avaliação do cliente gravada (5 estrelas e comentário)', JSON.stringify(rv).slice(0, 200));
    const r2 = await L.fsReq(P, 'PATCH', 'shops/' + SID + '/reviews/pedido-inventado', null, L.fields({ stars: 1, text: 'falsa', name: 'x', no: 1, date: 'x' }));
    check(r2.status === 403, 'regras: não dá para criar avaliação de um pedido que não existe → HTTP ' + r2.status);
    const N = await L.open({ w: 390 }); await N.p.goto(HOST + '/'); await N.p.w(5000);
    check(/Muy rico, llegó a tiempo/.test(await N.p.txt()), 'catálogo: outro visitante vê a avaliação publicada', (await N.p.txt()).slice(-300)); await N.ctx.close();
    await tab(o2, 'clientes'); const ctx2 = await o2.txt(); check(/Cliente E2E/.test(ctx2), 'painel: o cliente do pedido aparece na lista de clientes', ctx2.slice(-300));
  }, c);

  sec('K. Mesas por QR');
  await step('mesas', async () => {
    for (const t of ['caja', 'delivery', 'custom']) { await tab(o2, t); if (await o2.locator('#sx_tables').count()) break; }
    if (!(await o2.locator('#sx_tables').count())) { info('campo de mesas não encontrado no plano Esencial: ' + (await o2.txt()).slice(0, 200)); return; }
    await o2.set('#sx_tables', '4'); await o2.w(3000);
    const M = await L.open({ w: 390 }); const m = M.p; { const t = new Date(); t.setUTCHours(15, 5, 0, 0); await m.clock.setFixedTime(t); }
    await m.goto(HOST + '/?mesa=2'); await m.waitForFunction(() => typeof pub !== 'undefined' && document.querySelector('[data-act=open]'), null, { timeout: 20000 }).catch(() => {});
    await m.w(1500);
    check(/Mesa 2/.test(await m.txt()), 'mesa: o link do QR abre o catálogo identificado como Mesa 2');
    await m.locator('[data-act=callw]:visible').first().click(); await m.w(800);
    if (await m.locator('.sheet').count()) { const b = m.locator('.sheet .btn-main:visible, .sheet [data-act=callsend]:visible'); if (await b.count()) { await b.first().click(); } else await m.dump('sheet chamada', 400); }
    await m.w(2500);
    let docs = ((await L.fsReq(P, 'GET', 'shops/' + SID + '/orders?pageSize=50', 'owner')).json.documents || []).map(L.unfields);
    const call = docs.find(d => d.call);
    check(!!call && String(call.mesa) === '2', 'Firebase: o chamado do garçom foi gravado com a mesa', JSON.stringify(docs.filter(d => d.call || d.mesa)).slice(0, 200));
    await m.locator('[data-act=open][data-pid="' + PID + '"]:visible').first().click(); await m.w(500); await m.act('addcart');
    await m.act('cart'); const ct = m.locator('.sheet button:visible', { hasText: 'Continuar' }); if (await ct.count()) { await ct.first().click(); await m.w(400); } else await m.act('checkout');
    const nm = m.locator('[data-ck=name]:visible'); if (await nm.count()) await nm.fill('Mesa Dos');
    await m.act('send'); await m.w(3500);
    docs = ((await L.fsReq(P, 'GET', 'shops/' + SID + '/orders?pageSize=50', 'owner')).json.documents || []).map(L.unfields);
    const mo = docs.find(d => !d.call && String(d.mesa) === '2');
    check(!!mo && mo.total === 31000, 'Firebase: pedido feito da mesa gravado com a mesa e o total (Gs. 31.000)', (await m.txt('.sheet')).slice(0, 200) + JSON.stringify(docs.map(d => [d.no, d.mesa, d.total, d.call])));
    await tab(o2, 'salon'); const st = await o2.txt();
    check(/Mesa 2/.test(st), 'painel: a mesa 2 aparece com pedido/chamado no salão', st.slice(0, 400));
    await M.ctx.close();
  }, o2);

  sec('L. Plano Crecimiento: venda por kg, atacado e "leve 3, pague 2"');
  await step('vendas', async () => {
    const psel = a.locator('select[data-f=plan][data-sid="' + SID + '"], [data-sid="' + SID + '"] select[data-f=plan], input[data-f=plan][data-sid="' + SID + '"][value=pro]');
    if (await psel.count()) { const tg = await psel.first().evaluate(e => e.tagName); if (tg === 'SELECT') await psel.first().selectOption('pro'); else await psel.first().check(); }
    else await a.evaluate(sid => { const e = [...document.querySelectorAll('[data-f=plan]')].find(x => (x.dataset.sid === sid || x.dataset.shop === sid || x.dataset.i === String(PL.shops.findIndex(s => s.id === sid))) && (x.tagName === 'SELECT' || x.value === 'pro')); if (e) { if (e.tagName === 'SELECT') e.value = 'pro'; else e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); } }, SID);
    await a.w(3500);
    const lim = (await shopDoc()).lim || {}; check(lim.plan === 'Crecimiento' || (lim.off || []).length === 1, 'admin: mudar o plano para Crecimiento grava os limites novos na loja', JSON.stringify(lim));
    await o2.reload(); await o2.w(4000); await tab(o2, 'products');
    const mk = async (name, price, fn) => { await o2.act('newprod'); await o2.set('#ed_nes', name); await o2.set('#ed_pr', String(price)); await fn(); await o2.act('saveprod'); await o2.w(2500); return o2.evaluate(n => (pub.products.find(p => p.n.es === n) || {}).id || '', name); };
    const kg = await mk('Queso E2E', 40000, async () => { await o2.selectOption('#ed_u', 'kg'); await o2.w(300); });
    const ws = await mk('Yerba E2E', 10000, async () => { await o2.set('#ed_wq', '3'); await o2.set('#ed_wp', '9000'); });
    const bx = await mk('Jabon E2E', 5000, async () => { await o2.set('#ed_bx', '3'); await o2.set('#ed_by', '2'); });
    check(!!kg && !!ws && !!bx, 'painel: produtos por kg, com preço de atacado e com promoção 3×2 criados', [kg, ws, bx].join(','));
    const X = await L.open({ w: 390 }); const x = X.p; { const t = new Date(); t.setUTCHours(15, 10, 0, 0); await x.clock.setFixedTime(t); }
    await x.goto(HOST + '/'); await x.waitForFunction(() => typeof pub !== 'undefined' && pub.products.some(p => p.n.es === 'Jabon E2E') && document.querySelector('[data-act=open]'), null, { timeout: 20000 }).catch(() => {});
    const add = async (pid, plus) => { await x.locator('[data-act=open][data-pid="' + pid + '"]:visible').first().click(); await x.w(500); for (let i = 0; i < plus; i++) { await x.locator('[data-act=pq][data-d="1"]:visible').last().click(); await x.w(200); } await x.act('addcart'); };
    await add(kg, 0); await add(ws, 2); await add(bx, 2);
    const ln = await x.evaluate(() => cart.map(l => { const p = pub.products.find(q => q.id === l.pid); return { n: p.n.es, q: l.q, u: p.u || '' }; }));
    const qk = (ln.find(l => l.n === 'Queso E2E') || {}).q || 0, exp = Math.round(qk * 40000) + 27000 + 10000;
    info('carrinho: ' + JSON.stringify(ln) + ' → esperado ' + Math.round(qk * 40000) + ' (queijo ' + qk + ' kg × 40.000) + 27.000 (3 × 9.000 atacado) + 10.000 (leve 3, pague 2) = ' + exp);
    await x.act('cart'); const ct = x.locator('.sheet button:visible', { hasText: 'Continuar' }); if (await ct.count()) { await ct.first().click(); await x.w(400); } else await x.act('checkout');
    await x.locator('[data-act=mode]:visible').nth(1).click(); await x.w(400); await x.fill('[data-ck=name]', 'Cliente Mayorista'); await x.fill('[data-ck=phone]', '0981 777 888');
    const tm = x.locator('[data-ck=time]'); if (await tm.count()) { const ov = await tm.evaluate(e => [...e.options].map(o => o.value).filter(Boolean)); if (ov.length) await tm.selectOption(ov[0]); }
    await x.act('send'); await x.w(3500);
    const docs = ((await L.fsReq(P, 'GET', 'shops/' + SID + '/orders?pageSize=50', 'owner')).json.documents || []).map(L.unfields); const od = docs.find(d => d.name === 'Cliente Mayorista');
    check(!!od && od.total === exp && qk > 0, 'pedido com kg + atacado + 3×2: total gravado = ' + exp, od ? JSON.stringify({ total: od.total, sub: od.sub }) : (await x.txt('.sheet')).slice(0, 300));
    await X.ctx.close();
  }, o2);
  await L.done();
})().catch(e => { console.log('EXC', e.stack); process.exit(2); });
