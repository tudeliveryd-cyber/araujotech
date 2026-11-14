// Painel do local: aviso de vencimento do plano (só o dono) e resumo do dia para copiar ou mandar por WhatsApp.
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
  await a.set('#ns_name', 'Aviso E2E'); await a.set('#ns_wa', '595981000977');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Aviso E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const O = await L.open({ w: 1280 }); const o = O.p;
  await o.goto('https://' + shop.id + '.araujotechsistemas.com/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77');
  await o.press('#np_b', 'Enter'); await o.waitForSelector('#np_a', { state: 'detached', timeout: 45000 }).catch(() => {}); await o.w(2500);

  sec('A. O vencimento e o valor do plano chegam à loja');
  let lim = {}; for (let i = 0; i < 10 && !lim.due; i++) { await a.w(1000); lim = (L.unfields((await L.fsReq(P, 'GET', 'shops/' + shop.id, 'owner')).json) || {}).lim || {}; }
  info(JSON.stringify(lim));
  check(/^\d{4}-\d{2}-\d{2}$/.test(lim.due || '') && typeof lim.plan === 'string' && lim.plan && 'pg' in lim, 'a loja recebe o vencimento, o plano e o valor (junto com os limites)');

  sec('B. Aviso no painel do dono');
  const dia = n => { const d = new Date(Date.now() - 3 * 3600e3 + n * 864e5); return d.toISOString().slice(0, 10); };
  const card = async (n, extra) => o.evaluate(([due, extra]) => { LIM = Object.assign({}, LIM, { due, pu: 16, pg: 100000, plan: 'Esencial', trial: 0 }, extra || {}); ui.tab = 'resumo'; render(); const c = document.getElementById('duCard'); return c ? { t: c.innerText.replace(/\s+/g, ' '), late: c.classList.contains('late'), href: decodeURIComponent(c.querySelector('a').href) } : null; }, [dia(n), extra]);
  check(await card(20) === null, 'faltando 20 dias: sem aviso');
  const c3 = await card(3); info(JSON.stringify(c3));
  check(c3 && /Tu plan vence en 3 días/.test(c3.t) && /Esencial/.test(c3.t) && /US\$ 16/.test(c3.t) && /Gs\. 100\.000/.test(c3.t) && !c3.late, 'faltando 3 dias: aviso com o plano e o valor');
  check(c3 && /wa\.me\/595982086171/.test(c3.href) && /Aviso E2E/.test(c3.href) && /plan Esencial/.test(c3.href), 'o botão abre o WhatsApp da Araújo Tech com o nome do local e o plano');
  const c0 = await card(0); check(c0 && /vence hoy/.test(c0.t), 'no dia: "vence hoy"');
  const cl = await card(-2); check(cl && cl.late && /venció el/.test(cl.t), 'vencido: aviso em vermelho com a data');
  const ct = await card(2, { trial: 15 }); check(ct && /Tu prueba gratis termina/.test(ct.t) && !/US\$/.test(ct.t) && /prueba gratis termina/.test(ct.href), 'em prueba: fala do fim da prueba, sem valor');
  check(await o.evaluate(() => { const r = CLOUD.role; CLOUD.role = 'caja'; const h = dueCard() + daySumCard(); CLOUD.role = r; return h === ''; }), 'caixa e garçom não veem o aviso nem o resumo');

  sec('C. Resumo do dia');
  await card(20);
  check(await o.locator('#dsCard [data-act=daysum]').count() === 2, 'o resumo tem Copiar e Enviar por WhatsApp');
  const vazio = await o.evaluate(() => daySumText()); check(/Hoy todavía no hay pedidos/.test(vazio), 'sem pedidos: diz que ainda não há pedidos');
  const tx = await o.evaluate(() => { const now = new Date().toISOString(); const bak = orders.slice(); orders.push({ date: now, status: 'entregue', total: 50000, mode: 'delivery', items: [{ n: 'Pizza', q: 2 }, { n: 'Gaseosa', q: 1 }] }, { date: now, status: 'aceito', total: 30000, mode: 'pickup', items: [{ n: 'Pizza', q: 1 }] }, { date: now, status: 'aceito', total: 20000, canal: 'caja', items: [{ n: 'Queso por kg', q: 0.25 }] }, { date: now, status: 'cancelado', total: 99000, mode: 'delivery', items: [{ n: 'Otro', q: 9 }] }, { date: '2020-01-01T10:00:00Z', status: 'entregue', total: 77000, items: [{ n: 'Viejo', q: 5 }] }); const t = daySumText(); orders.length = 0; bak.forEach(x => orders.push(x)); return t; });
  info(tx.replace(/\n/g, ' | '));
  check(/Pedidos: 3/.test(tx) && /Ventas: Gs\.? ?100\.000/.test(tx) && /Delivery: 1 · Retiro: 1 · En el local: 1/.test(tx) && /Cancelados: 1/.test(tx), 'conta pedidos, vendas e canais de hoje; cancelado e dia antigo ficam fora da soma');
  check(/1\. Pizza × 3/.test(tx) && /Queso por kg × 0\.25/.test(tx) && !/Viejo|Otro/.test(tx), 'mais vendidos com as quantidades certas');
  await o.locator('#dsCard [data-act=daysum][data-k=wa]').click(); await o.w(300);
  check((await o.evaluate(() => window.__opened || [])).some(u => /^https:\/\/wa\.me\/\?text=/.test(u)), 'Enviar por WhatsApp abre o WhatsApp com o texto');
  check(!o.errs.length && !a.errs.length, 'sem erros de JavaScript', o.errs.concat(a.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
