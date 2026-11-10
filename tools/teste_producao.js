// Testes em PRODUÇÃO com navegador de verdade (roda no GitHub Actions). SÓ LEITURA nas lojas reais:
// nunca toca em "Enviar pedido" numa loja real nem grava nada no Firebase. Pedido completo só nas demonstrações (dados locais).
const { chromium } = require('playwright');
const SITE = process.env.SITE || 'https://araujotechsistemas.com';
const KEY = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U';
const FS = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents';
let fails = 0;
const ok = m => console.log('OK    | ' + m);
const bad = m => { fails++; console.log('FALHA | ' + m); };
const info = m => console.log('INFO  | ' + m);
const num = s => +String(s).replace(/[^\d]/g, '');
const gsTxt = n => 'Gs. ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

(async () => {
  const b = await chromium.launch();
  const mk = async (opt) => { const ctx = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, opt)); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 140))); await p.addInitScript(() => { window.__opened = []; window.open = u => { window.__opened.push(String(u)); return null; }; }); return { ctx, p }; };

  // ---------- 1. MOEDAS ----------
  console.log('\n== 1. Moedas conforme o país do visitante (página de planos, produção)');
  let R = null; try { R = (await (await fetch('https://open.er-api.com/v6/latest/USD')).json()).rates; info('cotação ao vivo: 1 US$ = ' + R.PYG + ' guaranis = ' + R.BRL + ' reais'); } catch (e) { bad('não consegui ler a cotação ao vivo'); }
  const casos = [['Paraguai', 'America/Asuncion', 'es-PY', 'PY'], ['Brasil', 'America/Sao_Paulo', 'pt-BR', 'BR'], ['Espanha', 'Europe/Madrid', 'es-ES', 'XX'], ['Estados Unidos', 'America/New_York', 'en-US', 'XX'], ['Argentina', 'America/Argentina/Buenos_Aires', 'es-AR', 'XX']];
  for (const [pais, tz, loc, cc] of casos) {
    const { ctx, p } = await mk({ timezoneId: tz, locale: loc });
    try {
      await p.goto(SITE + '/vitrix/', { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(1500);
      const plans = await p.evaluate(() => [...document.querySelectorAll('.plan')].map(e => ({ n: e.querySelector('h3').innerText, usd: e.querySelector('.price b').innerText, loc: (e.querySelector('.loc') || {}).innerText || '', inst: e.querySelector('.inst').innerText.replace(/\s+/g, ' '), lz: (e.querySelector('.lzp') || {}).innerText || '' })));
      if (plans.length !== 4) { bad(pais + ': esperava 4 planos, achei ' + plans.length); continue; }
      const usd = plans.map(x => num(x.usd));
      if (usd.join() !== '16,32,56,96') bad(pais + ': preços em dólar ' + usd.join('/') + ' (esperado 16/32/56/96)');
      let errs = [];
      plans.forEach((x, i) => {
        if (cc === 'XX') { if (/≈|Gs\.|R\$/.test(x.loc + x.inst + x.lz)) errs.push(x.n + ' mostra moeda local: "' + (x.loc || x.inst) + '"'); }
        else if (R) { const exp = cc === 'PY' ? Math.round(usd[i] * R.PYG / 5000) * 5000 : Math.round(usd[i] * R.BRL); const got = num(x.loc);
          if (cc === 'PY' && !/Gs\./.test(x.loc)) errs.push(x.n + ' sem Gs.: "' + x.loc + '"'); if (cc === 'BR' && !/R\$/.test(x.loc)) errs.push(x.n + ' sem R$: "' + x.loc + '"');
          if (Math.abs(got - exp) > (cc === 'PY' ? 5000 : 1)) errs.push(x.n + ': mostra ' + x.loc + ', esperado ' + exp);
          if (x.lz && Math.abs(num(((x.lz.split('≈')[1] || '').split(')')[0])) - exp * 10) > (cc === 'PY' ? 50000 : 10)) errs.push(x.n + ' anual: "' + x.lz + '", esperado ' + exp * 10); }
      });
      if (errs.length) bad(pais + ' (' + tz + '): ' + errs.join('; ')); else ok(pais + ' (' + tz + '): ' + plans.map(x => x.usd + (x.loc ? ' ' + x.loc : '')).join(' | ') + (cc === 'XX' ? '  → só dólar' : ''));
      if (p.errs.length) bad(pais + ': erro de JavaScript na página: ' + p.errs[0]);
    } catch (e) { bad(pais + ': ' + String(e.message).slice(0, 120)); }
    await ctx.close();
  }

  // ---------- 2. CONTADOR ----------
  console.log('\n== 2. Contador de vagas da promoção de lançamento');
  try {
    const j = await (await fetch(FS + '/licencias/_lz?key=' + KEY)).json(); const F = j.fields || {}; const v = k => F[k] ? +(F[k].integerValue || F[k].doubleValue || 0) : null;
    const used = v('used') || 0, max = v('max') || 20, left = Math.max(0, max - used), upd = F.updated ? F.updated.stringValue : '(sem data)';
    info('Firebase real: ' + used + ' vagas usadas de ' + max + ' → restam ' + left + ' · gravado pelo admin em ' + upd);
    for (const [lang, url, re] of [['ES', SITE + '/vitrix/', /Quedan (\d+) de (\d+) cupos/], ['PT', SITE + '/vitrix/?lang=pt', /Restam (\d+) de (\d+) vagas/], ['Inicial', SITE + '/', /(?:Quedan|Restam) (\d+) de (\d+)/]]) {
      const { ctx, p } = await mk({ timezoneId: 'America/Asuncion', locale: lang === 'PT' ? 'pt-BR' : 'es-PY' });
      await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(1200);
      if (lang === 'PT') { const bt = p.locator('button', { hasText: /^PT$/ }).first(); if (await bt.count()) { await bt.click(); await p.waitForTimeout(500); } }
      const txt = await p.evaluate(() => document.body.innerText); const m = txt.match(re);
      if (left === 0) { /paga 10|pagá 10|Pagá 10/i.test(txt) ? bad(lang + ': vagas esgotadas mas a promoção ainda aparece') : ok(lang + ': vagas esgotadas e a promoção não aparece'); }
      else if (!m) bad(lang + ' (' + url + '): não mostra as vagas restantes');
      else if (+m[1] !== left || +m[2] !== max) bad(lang + ': mostra "' + m[0] + '", o Firebase diz ' + left + ' de ' + max);
      else ok(lang + ': mostra "' + m[0] + '", igual ao Firebase');
      await ctx.close();
    }
  } catch (e) { bad('contador: ' + String(e.message).slice(0, 140)); }

  // ---------- 3. TRABALHE CONOSCO ----------
  console.log('\n== 3. Formulário "Trabajá con nosotros" (produção)');
  for (const lang of ['es', 'pt']) {
    const { ctx, p } = await mk({ timezoneId: 'America/Asuncion', locale: lang === 'pt' ? 'pt-BR' : 'es-PY' });
    try {
      await p.goto(SITE + '/trabaja/', { waitUntil: 'networkidle', timeout: 60000 });
      if (lang === 'pt') { await p.locator('button', { hasText: /^PT$/ }).first().click(); await p.waitForTimeout(400); }
      await p.evaluate(() => document.getElementById('f').requestSubmit ? null : null);
      await p.locator('#f button[type=submit]').click(); await p.waitForTimeout(300);
      const o0 = await p.evaluate(() => window.__opened.length);
      if (o0) bad(lang + ': formulário vazio abriu o WhatsApp'); else ok(lang + ': formulário vazio não é enviado');
      await p.fill('[name=n]', 'Prueba Auditoría'); await p.fill('[name=c]', 'Santa Rita'); await p.fill('[name=w]', '0981 000 111');
      for (const k of ['d', 'e', 'k']) { const s = p.locator('select[name=' + k + ']'); if (await s.count()) await s.selectOption({ index: 1 }); }
      await p.fill('[name=m]', 'Mensaje de prueba & acentos ñ ç');
      await p.locator('#f button[type=submit]').click(); await p.waitForTimeout(500);
      const u = await p.evaluate(() => window.__opened[0] || '');
      const msg = decodeURIComponent((u.split('text=')[1] || ''));
      const need = ['Prueba Auditoría', 'Santa Rita', '0981 000 111', 'Mensaje de prueba & acentos ñ ç', lang === 'pt' ? 'Quero trabalhar' : 'Quiero trabajar'];
      const miss = need.filter(x => !msg.includes(x));
      if (!/^https:\/\/wa\.me\/595982086171\?text=/.test(u)) bad(lang + ': link do WhatsApp errado: ' + u.slice(0, 80));
      else if (miss.length) bad(lang + ': mensagem sem: ' + miss.join(', '));
      else if (/: —/.test(msg)) bad(lang + ': opção escolhida não entrou na mensagem');
      else ok(lang + ': abre wa.me/595982086171 com a mensagem completa → ' + msg.replace(/\n+/g, ' / ').slice(0, 230));
      if (p.errs.length) bad(lang + ': erro de JavaScript: ' + p.errs[0]);
    } catch (e) { bad('trabaja ' + lang + ': ' + String(e.message).slice(0, 140)); }
    await ctx.close();
  }
  try { const r = await fetch('https://wa.me/595982086171', { redirect: 'manual' }); (r.status >= 200 && r.status < 400) ? ok('o número do WhatsApp existe para o wa.me (HTTP ' + r.status + ')') : bad('wa.me respondeu ' + r.status); } catch (e) { info('wa.me não pôde ser consultado daqui'); }

  // ---------- 4. CATÁLOGOS ----------
  // Confere dados e contas de um catálogo já aberto. enviar=true só nas demonstrações.
  async function conferir(p, nome, enviar) {
    const out = []; const E = m => out.push(m);
    const d = await p.evaluate(() => {
      const S = pub.store, L = x => (x && typeof x === 'object') ? (x.es || x.pt || '') : String(x || '');
      const pr = pub.products || [], cats = (pub.cats || []).map(c => c.id);
      const pe = []; pr.forEach(q => { const n = L(q.n); if (!n.trim()) pe.push('produto sem nome (' + q.id + ')'); if (!(+q.price > 0) || !isFinite(+q.price)) pe.push(n + ': preço inválido (' + q.price + ')'); if (q.promo && !(+q.promo > 0 && +q.promo < +q.price)) pe.push(n + ': promoção ' + q.promo + ' não é menor que o preço ' + q.price); if (!cats.includes(q.cat)) pe.push(n + ': categoria inexistente'); (q.g || []).forEach(g => (g.o || []).forEach(o => { if (!(+o.p >= 0)) pe.push(n + ': adicional com preço inválido'); })); });
      const br = (S.bairros || []); const be = []; const seen = {}; br.forEach(x => { const n = String(x.name || x.n || '').trim(); if (!n) be.push('bairro sem nome'); if (seen[n.toLowerCase()]) be.push('bairro repetido: ' + n); seen[n.toLowerCase()] = 1; const f = x.fee; if (f !== '' && f != null && !(+f >= 0 && isFinite(+f))) be.push(n + ': taxa inválida (' + f + ')'); });
      const cp = (S.coupons || []); const ce = []; cp.forEach(c => { if (!/^[A-Z0-9]{2,20}$/.test(String(c.code || ''))) ce.push('cupom com código inválido: ' + c.code); if (c.type === 'pct' && !(+c.value > 0 && +c.value <= 100)) ce.push(c.code + ': porcentagem inválida ' + c.value); if (c.type !== 'pct' && c.type !== 'frete' && !(+c.value > 0)) ce.push(c.code + ': valor inválido ' + c.value); });
      return { name: S.name, np: pr.length, on: pr.filter(q => q.on).length, nb: br.length, nbFee: br.filter(x => x.fee !== '' && x.fee != null && +x.fee >= 0).length, nc: cp.filter(c => c.on).length, feeMode: S.feeMode || '', delivery: S.delivery !== false, pe, be, ce, simple: (pr.find(q => q.on && !(q.g || []).length && !q.u) || pr.find(q => q.on) || {}).id || '', wa: String(S.whatsapp || '').replace(/\D/g, ''), coupons: cp.filter(c => c.on).map(c => ({ code: c.code, type: c.type, value: +c.value, min: +c.min || 0 })), paused: !!S.paused };
    });
    d.pe.concat(d.be, d.ce).forEach(E);
    if (!d.np) E('nenhum produto cadastrado'); if (d.wa.length < 9) E('WhatsApp do local inválido (' + d.wa + ')');
    let conta = 'sem produto para testar';
    if (d.simple) {
      // fluxo pela tela: produto → carrinho → finalizar → delivery → cada bairro
      const card = p.locator('[data-act=open][data-pid="' + d.simple + '"]:visible').first();
      if (!(await card.count())) { E('produto ' + d.simple + ' não aparece no catálogo'); }
      else {
        await card.click(); await p.waitForTimeout(500);
        const add = p.locator('[data-act=addcart]:visible'); if (await add.count()) { await add.first().click(); await p.waitForTimeout(500); }
        const st0 = await p.evaluate(() => ({ n: cart.length, sub: cart.length ? subtotal() : 0 }));
        if (!st0.n) { conta = 'não foi possível adicionar ao carrinho (loja fechada/pausada ou opção obrigatória)'; }
        else {
          await p.evaluate(() => { checkoutSheet(); }); await p.waitForTimeout(500);
          const rows = async () => p.evaluate(() => { const s = document.querySelector('.sheet'); if (!s) return null; const t = s.innerText.split('\n').map(x => x.trim()).filter(Boolean); const after = k => { const i = t.findIndex(x => k.test(x)); return i < 0 ? '' : t[i + 1] || ''; }; return { sub: after(/^Subtotal$/i), fee: after(/^(Costo de envío|Taxa de entrega|Envío|Entrega)$/i), disc: (t.find(x => /^-\s?Gs\./.test(x)) || ''), total: after(/^Total$/i) }; });
          const n = s => +String(s).replace(/[^\d]/g, '');
          let probs = [], vistos = 0;
          if (d.delivery) {
            const md = p.locator('[data-act=mode]:visible').first(); if (await md.count()) { await md.click(); await p.waitForTimeout(400); }
            const sel = p.locator('[data-ck=bairro]');
            if (await sel.count()) {
              const opts = await sel.evaluate(e => [...e.options].map(o => ({ v: o.value, t: o.textContent.trim() })).filter(o => o.v));
              for (const o of opts.slice(0, 40)) {
                await sel.selectOption(o.v); await p.waitForTimeout(250); const r = await rows(); if (!r) { probs.push('checkout fechou em ' + o.t); break; }
                const m = o.t.match(/Gs\.\s?([\d.]+)/); vistos++;
                if (m) { if (n(r.fee) !== n(m[1]) && !/gratis|sin costo|grátis|sem custo/i.test(r.fee)) probs.push(o.t + ': mostra envio "' + r.fee + '"'); if (/Gs\./.test(r.fee) && n(r.total) !== n(r.sub) + n(r.fee) - n(r.disc)) probs.push(o.t + ': total ' + r.total + ' ≠ ' + r.sub + ' + ' + r.fee); }
                else if (/Gs\.\s?[1-9]/.test(r.fee)) probs.push(o.t + ': bairro sem valor mas cobra ' + r.fee);
              }
            }
          }
          // cupons ativos
          let cup = 0;
          for (const c of d.coupons.slice(0, 6)) {
            const inp = p.locator('[data-ck=couponIn]'); if (!(await inp.count())) break; await inp.fill(c.code); await p.locator('[data-act=applycoupon]:visible').click(); await p.waitForTimeout(350);
            const r = await rows(); const st = await p.evaluate(() => ({ err: (typeof ckErr !== 'undefined' && ckErr.coupon) || '', cp: ck.coupon || '', sub: subtotal() }));
            if (st.sub < c.min) { if (!st.err) probs.push('cupom ' + c.code + ': aceito abaixo do mínimo'); }
            else if (c.type === 'pct') { const exp = Math.round(st.sub * c.value / 100); if (Math.abs(n(r.disc) - exp) > 1) probs.push('cupom ' + c.code + ' (' + c.value + '%): desconto ' + r.disc + ', esperado ' + exp); else cup++; }
            else if (st.cp === c.code) cup++; else probs.push('cupom ' + c.code + ': não aplicou (' + st.err + ')');
            const rm = p.locator('[data-act=rmcoupon]:visible'); if (await rm.count()) { await rm.click(); await p.waitForTimeout(250); }
          }
          probs.forEach(E);
          conta = vistos + ' bairros conferidos na tela, ' + cup + ' cupons conferidos';
          if (enviar) {
            const pk = p.locator('[data-act=mode]:visible'); if (await pk.count() > 1) { await pk.nth(1).click(); await p.waitForTimeout(300); }
            await p.fill('[data-ck=name]', 'Prueba'); await p.fill('[data-ck=phone]', '0981000111'); await p.waitForTimeout(200);
            const tm = p.locator('[data-ck=time]'); if (await tm.count()) { const o = await tm.evaluate(e => [...e.options].map(x => x.value).filter(Boolean)); if (o.length) await tm.selectOption(o[0]); }
            await p.locator('[data-act=send]:visible').click(); await p.waitForTimeout(700);
            const r = await p.evaluate(() => ({ n: orders.length, o: orders[0] ? { total: orders[0].total, sub: orders[0].sub, no: orders[0].no } : null, cart: cart.length, err: Object.values(typeof ckErr !== 'undefined' ? ckErr : {}).join(' ') }));
            if (!r.o) E('pedido de demonstração não registrado (' + (r.err || 'loja fechada às 11:00?') + ')'); else if (r.o.total !== r.o.sub) { E('pedido de retiro com total ' + r.o.total + ' ≠ subtotal ' + r.o.sub); } else conta += ', pedido de demonstração Nº ' + r.o.no + ' registrado (total ' + r.o.total + ')';
          }
          await p.evaluate(() => { cart = []; saveCart(); closeSheet(); });
        }
      }
    }
    if (p.errs.length) E('erro de JavaScript: ' + p.errs[0]);
    const res = nome + ' "' + d.name + '": ' + d.np + ' produtos (' + d.on + ' ativos), ' + d.nb + ' bairros (' + d.nbFee + ' com valor), ' + d.nc + ' cupons ativos · ' + conta;
    out.length ? bad(res + ' → ' + out.slice(0, 6).join('; ') + (out.length > 6 ? ' (+' + (out.length - 6) + ')' : '')) : ok(res);
  }

  console.log('\n== 4. Catálogos reais (dados do Firebase de produção, só leitura — nenhum pedido é enviado)');
  let shops = [];
  try { const j = await (await fetch(FS + '/shops?pageSize=100&mask.fieldPaths=status&key=' + KEY)).json(); shops = (j.documents || []).map(d => ({ id: d.name.split('/').pop(), status: d.fields && d.fields.status ? d.fields.status.stringValue : '' })); info('lojas no Firebase: ' + (shops.map(s => s.id + (s.status ? ' (' + s.status + ')' : '')).join(', ') || 'nenhuma')); } catch (e) { bad('não consegui listar as lojas: ' + String(e.message).slice(0, 100)); }
  for (const s of shops) {
    const host = s.id === 'fogao-mineiro' ? 'fogaomineiro' : s.id; const { ctx, p } = await mk({ timezoneId: 'America/Asuncion', locale: 'es-PY' });
    try {
      await p.clock.install({ time: new Date() }).catch(() => {});
      await p.goto('https://' + host + '.araujotechsistemas.com/', { waitUntil: 'load', timeout: 60000 });
      await p.waitForFunction(() => typeof pub !== 'undefined' && pub && pub.products && document.querySelector('[data-act=open]'), null, { timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(4000);
      const st = await p.evaluate(() => ({ nf: /no encontrado|não encontrado/i.test(document.title), susp: !!document.querySelector('.susp-wrap'), ready: !!document.querySelector('[data-act=open]'), url: location.href, txt: document.body.innerText.slice(0, 120).replace(/\n+/g, ' / ') }));
      if (st.nf) { ok('endereço ' + s.id + ' (documento só de sitio web, sem catálogo): mostra "Catálogo no encontrado", nenhum produto e nenhum pedido possível'); }
      else if (st.susp) { (s.status === 'suspenso' ? ok : bad)('loja ' + s.id + ' (' + (s.status || 'sem status') + '): mostra o aviso de catálogo indisponível e nenhum produto → "' + st.txt + '"'); }
      else if (s.status === 'suspenso') { let campos = '?'; try { const dj = await (await fetch(FS + '/shops/' + s.id + '?key=' + KEY)).json(); campos = Object.keys(dj.fields || {}).map(k => k + ':' + JSON.stringify(dj.fields[k]).length).join(', '); } catch (e) {}
        const dg = await p.evaluate(() => ({ url: location.href, title: document.title, shop: typeof SHOP !== 'undefined' ? SHOP : '', mode: typeof MODE !== 'undefined' ? MODE : '', st: typeof SHOP_STATUS !== 'undefined' ? SHOP_STATUS : '', sub: !!window.TDC_SUB, name: pub && pub.store && pub.store.name, txt: document.body.innerText.slice(0, 160).replace(/\n+/g, ' / ') }));
        bad('loja ' + s.id + ' está suspensa mas o catálogo continua aberto · diagnóstico: ' + JSON.stringify(dg) + ' · campos do documento: ' + campos + ' · erros: ' + p.errs.join(' | ')); }
      else if (!st.ready) { info(s.id + ': não abriu como catálogo (' + st.url + ') → "' + st.txt + '"'); } else await conferir(p, 'loja ' + s.id, false);
    } catch (e) { bad('loja ' + s.id + ': ' + String(e.message).slice(0, 140)); }
    await ctx.close();
  }

  if (process.env.DEMOS === 'nao') { console.log('\n== RESULTADO: ' + fails + ' falha(s)'); await b.close(); process.exit(fails ? 1 : 0); }
  console.log('\n== 5. Demonstrações no ar (pedido completo com dados locais, horário simulado 11:00 de hoje)');
  let demos = [];
  try { demos = require('fs').readdirSync(require('path').join(__dirname, '..', 'araujo-tech-site')).filter(x => /^demo(-[a-z]+)?$/.test(x) && x !== 'demo-agenda').sort(); } catch (e) {}
  if (!demos.length) demos = ['demo', 'demo-farmacia', 'demo-pizzeria'];
  info(demos.length + ' demonstrações: ' + demos.join(', '));
  for (const dm of demos) {
    const { ctx, p } = await mk({ timezoneId: 'America/Asuncion', locale: 'es-PY' });
    try {
      const t = new Date(); t.setUTCHours(14, 0, 0, 0); await p.clock.install({ time: t });
      await p.goto(SITE + '/' + dm + '/', { waitUntil: 'load', timeout: 60000 });
      await p.waitForFunction(() => typeof pub !== 'undefined' && document.querySelector('[data-act=open]'), null, { timeout: 20000 }).catch(() => {});
      if (!(await p.locator('[data-act=open]').count())) bad(dm + ': catálogo não carregou'); else await conferir(p, dm, true);
    } catch (e) { bad(dm + ': ' + String(e.message).slice(0, 140)); }
    await ctx.close();
  }

  console.log('\n== RESULTADO: ' + fails + ' falha(s)');
  await b.close(); process.exit(fails ? 1 : 0);
})();
