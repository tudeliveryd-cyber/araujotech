// somente leitura: auditoria de lançamento da Guía (preços, planos, WhatsApp, cidades, demos, celular, links, idiomas, erros)
const { chromium, devices } = require('playwright');
const B = 'https://guiadesantarita.com';
const PAGES = ['/', '/anunciar/', '/negocios/', '/negocio/dr-jonathan-salinas', '/l/dr-jonathan-salinas', '/tu-delivery/', '/sobre/', '/llegar/', '/conoce/', '/terminos/'];
const out = (k, v) => console.log('AUD ' + k + ' ' + (typeof v === 'string' ? v : JSON.stringify(v)));
(async () => { const b = await chromium.launch();
  for (const lang of ['es', 'pt']) for (const [dev, o] of [['m', devices['iPhone 13']], ['d', { viewport: { width: 1366, height: 900 } }]]) {
    const ctx = await b.newContext(Object.assign({}, o, { timezoneId: 'America/Asuncion', locale: lang === 'pt' ? 'pt-BR' : 'es-PY' }));
    await ctx.addInitScript(l => { try { localStorage.setItem('at_lang', l) } catch (e) {} }, lang);
    for (const pg of PAGES) { const p = await ctx.newPage(); const errs = [], bad = []; p.on('pageerror', e => errs.push(e.message.slice(0, 120))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 120)); }); p.on('response', r => { if (r.status() >= 400 && /guiadesantarita|araujotech/.test(r.url())) bad.push(r.status() + ' ' + r.url().slice(0, 100)); });
      try { await p.goto(B + pg + '?v=' + Date.now(), { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) { out('NAV', [lang, dev, pg, e.message.slice(0, 80)]); }
      await p.waitForTimeout(2500); for (let y = 0; y < 15000; y += 900) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60); }
      const r = await p.evaluate(() => { const tx = document.body.innerText; const pr = [...new Set((tx.match(/(Gs\.?|₲)\s?\d{2,3}(\.\d{3})+[^\n]{0,30}/g) || []))].slice(0, 30);
        const wa = [...document.querySelectorAll('a[href*="wa.me"],a[href*="api.whatsapp"]')].map(a => a.href); const waBad = wa.filter(h => !/wa\.me\/595\d{8,9}(\?text=|$)|wa\.me\/\?text=/.test(h));
        const old = (tx.match(/\b(Esencial|Crecimiento|Premium|VIP)\b[^\n]{0,40}/g) || []).slice(0, 8);
        const lang = document.documentElement.lang; const esLeft = (tx.match(/\b(Ver todos|Abierto ahora|Contratar por WhatsApp|Negocios destacados|Planes de la Guía)\b/g) || []).slice(0, 5);
        return { over: document.documentElement.scrollWidth - innerWidth, pr, nwa: wa.length, waBad: waBad.slice(0, 5), old, lang, esLeft, cty: [...document.querySelectorAll('.cty')].map(e => e.textContent).slice(0, 6), imgBroken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src && !/^data:/.test(i.src)).map(i => i.src.slice(0, 80)).slice(0, 5), title: document.title.slice(0, 60) }; });
      out('PAGE', Object.assign({ lang, dev, pg, errs: errs.slice(0, 4), http: bad.slice(0, 4) }, r)); await p.close(); }
    await ctx.close(); }
  // demonstrações do Vitrix: aviso de conteúdo ilustrativo
  const c2 = await b.newContext(devices['iPhone 13']); for (const d of ['/demo-comida/', '/demo-ropa/', '/demo/']) { const p = await c2.newPage(); await p.goto('https://araujotechsistemas.com' + d, { waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(2500);
    out('DEMO', { d, bar: await p.evaluate(() => { const x = document.querySelector('.dqbar .dqx'); return x ? getComputedStyle(x, '::after').content + ' / ' + getComputedStyle(document.querySelector('.dqbar')).display : 'sem barra'; }) }); await p.close(); }
  // formulário de /anunciar: cada plano -> mensagem
  const c3 = await b.newContext(devices['iPhone 13']); const p = await c3.newPage(); await p.goto(B + '/anunciar/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const vals = await p.$$eval('input[name=pl]', l => l.map(i => i.value)); out('FORM-OPTS', vals);
  for (const v of vals) { await p.fill('#n', 'Prueba'); await p.locator('#r').selectOption({ index: 1 }); await p.fill('#p', 'Ana'); await p.fill('#w', '0981 123 456'); await p.check(`input[name=pl][value="${v}"]`);
    const u = await new Promise(async res => { const h = rq => { if (/wa\.me/.test(rq.url())) { p.off('request', h); res(rq.url()); } }; p.on('request', h); await p.route(/wa\.me/, r => r.abort()); await p.evaluate(() => document.querySelector('#f [type=submit]').click()); setTimeout(() => res(''), 4000); });
    out('FORM', { v, plan: (decodeURIComponent(u.split('text=')[1] || '').match(/Plan: .*/) || [''])[0], to: (u.match(/wa\.me\/\d+/) || [''])[0] }); await p.goto(B + '/anunciar/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800); }
  await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
