// Admin: dados para o pagamento entram sozinhos na mensagem "Cobrar por WhatsApp" e ficam guardados só no admin.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  // um cliente na cobrança (como na base real), senão o admin mostra a tela de migração
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  sec('A. Admin: cartão "Datos para el pago"');
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(6000);
  check(await a.locator('#pd_bank').count() === 1, 'admin: aparece o cartão de dados para o pagamento');
  const msg0 = await a.evaluate(() => cobMsg({ name: 'Loja Teste', plan: (PL.plans[0] || {}).id, due: new Date().toISOString().slice(0, 10), pays: [], sys: 'catalogo' }));
  check(!/Datos para el pago/.test(msg0), 'sem dados preenchidos, a mensagem não traz bloco vazio');
  await a.fill('#pd_bank', 'Banco Teste'); await a.fill('#pd_holder', 'Jean Teste'); await a.fill('#pd_acct', '123456'); await a.fill('#pd_alias', 'jean.alias'); await a.press('#pd_alias', 'Tab'); await a.w(2500);
  const msg = await a.evaluate(() => cobMsg({ name: 'Loja Teste', plan: (PL.plans[0] || {}).id, due: new Date().toISOString().slice(0, 10), pays: [], sys: 'catalogo' }));
  info('mensagem: ' + msg.replace(/\n/g, ' | ').slice(0, 300));
  check(/Datos para el pago:\nBanco: Banco Teste\nTitular: Jean Teste\nCuenta: 123456\nAlias: jean.alias\n\nCuando realices el pago/.test(msg), 'a mensagem de cobrança traz os dados, antes do "Cuando realices el pago"');
  const msgBr = await a.evaluate(() => cobMsg({ name: 'Loja BR', brl: true, plan: (PL.plans[0] || {}).id, due: new Date().toISOString().slice(0, 10), pays: [], sys: 'catalogo' }));
  check(/Dados para o pagamento:\nBanco: Banco Teste[\s\S]*Conta: 123456[\s\S]*\n\nQuando fizer o pagamento/.test(msgBr), 'cliente do Brasil: mensagem em português com os dados');
  const cb = await a.evaluate(() => { const x = document.querySelector('a[href*="wa.me/595981000111"]'); return x ? decodeURIComponent(x.href) : ''; });
  check(/Banco Teste/.test(cb) && /jean\.alias/.test(cb), 'botão "Cobrar por WhatsApp" do cliente já leva os dados', cb.replace(/\n/g, ' | '));
  sec('B. Guardado na nuvem, só para o admin');
  const adm = await L.signIn(...ADM);
  const r = await L.fsReq(P, 'GET', 'platform/config', adm.idToken); const d = L.unfields(r.json) || {};
  check(d.payData && d.payData.bank === 'Banco Teste' && d.payData.alias === 'jean.alias', 'dados salvos em platform/config', JSON.stringify(d.payData));
  check(Array.isArray(d.plans) && d.plans.length > 0, 'os planos continuam salvos junto (nada se perdeu)');
  const an = await L.fsReq(P, 'GET', 'platform/config', null); check(an.status === 403, 'sem login não lê os dados de pagamento → HTTP ' + an.status);
  const B = await L.open({ w: 1366 }); const b = B.p;
  await b.goto('https://araujotechsistemas.com/admin/'); await b.w(2500);
  await b.fill('#lg_user', ADM[0]); await b.fill('#lg_pass', ADM[1]); await b.press('#lg_pass', 'Enter'); await b.w(6000);
  check(await b.inputValue('#pd_bank').catch(() => '') === 'Banco Teste', 'outro aparelho do admin vê os mesmos dados');
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
