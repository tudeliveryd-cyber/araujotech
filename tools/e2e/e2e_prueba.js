// Período de prueba gratis ao criar cliente no Panel Araújo Tech: vencimento = fim da prueba, sem pagamento registrado,
// etiqueta "Prueba · faltan X días", fora da receita mensal; ao registrar o primeiro pagamento a prueba termina.
const L = require('./lib');
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  const day = n => { const d = new Date(Date.now() - 3 * 3600e3 + n * 864e5); return d.toISOString().slice(0, 10); };

  sec('A. Catálogo Vitrix com prueba de 15 días');
  await a.act('newshop'); await a.w(300);
  const opts = await a.evaluate(() => [...document.querySelectorAll('#ns_trial option')].map(o => o.textContent));
  info(JSON.stringify(opts));
  check(opts.length === 4 && /Pagó hoy/.test(opts[0]) && opts.includes('Prueba gratis de 15 días') && opts.includes('Prueba gratis de 30 días'), 'o formulário tem "Inicio": pagou hoje, ou prueba de 7, 15 ou 30 dias');
  await a.set('#ns_name', 'Mueblería Prueba'); await a.set('#ns_wa', '595981000981');
  await a.locator('#ns_trial').selectOption('15');
  await a.act('createshop'); await a.w(3500);
  let s = await a.evaluate(() => { const x = PL.shops.find(z => z.name === 'Mueblería Prueba'); return x && { id: x.id, due: x.due, trial: x.trial, pays: x.pays.length }; });
  info(JSON.stringify(s));
  const due15 = [day(15), day(16)];
  check(s && due15.includes(s.due) && s.trial === 15 && s.pays === 0, 'vence em 15 dias, marcado como prueba e sem pagamento registrado');
  const pill = async id => a.evaluate(id => { const c = [...document.querySelectorAll('[data-sid="' + id + '"]')].map(e => e.closest('article,.card,li,tr,.shop')).find(Boolean); const p = c && c.querySelector('.pill.st-trial'); return p ? p.textContent : ''; }, id);
  await a.evaluate(() => { render(); }); await a.w(300);
  const pt = await pill(s.id); info(pt);
  check(/^Prueba · faltan 1[45] días$/.test(pt), 'na lista aparece "Prueba · faltan 15 días"');

  sec('B. Pagou hoje (sem prueba) continua igual');
  await a.act('newshop'); await a.w(300);
  await a.set('#ns_name', 'Mueblería Paga'); await a.set('#ns_wa', '595981000982'); await a.act('createshop'); await a.w(3500);
  const pg = await a.evaluate(() => { const x = PL.shops.find(z => z.name === 'Mueblería Paga'); return { due: x.due, trial: 'trial' in x, pays: x.pays.length }; });
  check([day(30), day(31)].includes(pg.due) && !pg.trial && pg.pays === 1, 'sem prueba: vence em 30 dias e o pagamento fica registrado, como antes');
  const mrr = await a.evaluate(() => { const act = PL.shops.filter(s => s.status !== 'suspenso'); return { all: act.reduce((t, s) => t + monthOf(s), 0), paid: act.filter(s => !s.trial).reduce((t, s) => t + monthOf(s), 0) }; });
  info(JSON.stringify(mrr));
  check(mrr.paid < mrr.all, 'quem está em prueba não entra na receita mensal');

  sec('C. Outro sistema (Agenda) com prueba de 7 días');
  await a.evaluate(() => { try { seedSysPlans(); } catch (e) {} });
  await a.act('newclient'); await a.w(300); await a.locator('[data-act=ncsys][data-k=agenda]').click(); await a.w(200);
  check(await a.locator('#nc_trial').count() === 1, 'o formulário de outros sistemas também tem a opção');
  await a.set('#nc_name', 'Peluquería Prueba'); await a.locator('#nc_trial').selectOption('7');
  if (await a.locator('[data-nc=paid]').count()) await a.locator('[data-nc=paid]').check();
  await a.act('createclient'); await a.w(3000);
  const ag = await a.evaluate(() => { const x = PL.shops.find(z => z.name === 'Peluquería Prueba'); return x && { due: x.due, trial: x.trial, pays: x.pays.length }; });
  info(JSON.stringify(ag));
  check(ag && [day(7), day(8)].includes(ag.due) && ag.trial === 7 && ag.pays === 0, 'vence em 7 dias, sem pagamento (mesmo com "pagó ahora" marcado)');

  sec('D. Primeiro pagamento termina a prueba');
  await a.evaluate(id => acts.shoppay({ dataset: { sid: id } }), s.id); await a.w(2500);
  const af = await a.evaluate(id => { const x = PL.shops.find(z => z.id === id); return { due: x.due, trial: 'trial' in x, pays: x.pays.length }; }, s.id);
  info(JSON.stringify(af));
  check(!af.trial && af.pays === 1 && [day(45), day(46)].includes(af.due), 'ao pagar: sai da prueba, registra o pagamento e os 30 dias contam a partir do fim da prueba');
  await a.evaluate(() => render()); await a.w(300);
  check(!(await pill(s.id)), 'a etiqueta "Prueba" some');
  check(!a.errs.length, 'sem erros de JavaScript', a.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
