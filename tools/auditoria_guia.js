// SÓ LEITURA: auditoria da Guía no ar (guiadesantarita.com). Não grava nada.
// Abre a portada no celular e no computador, junta todos os links internos (portada, menu Más, rodapé, páginas de categoria),
// confere a resposta de cada um, procura nomes repetidos, categorias vazias, erros de JavaScript e a data do clima/câmbio.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'https://guiadesantarita.com/';
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
(async () => {
  const b = await chromium.launch(); const out = { links: {}, errs: [], notes: [] };
  for (const [nm, W, mob] of [['cel', 390, true], ['pc', 1366, false]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: 860 }, isMobile: mob, hasTouch: mob, locale: 'es-PY', timezoneId: 'America/Asuncion' });
    const p = await ctx.newPage(); p.on('pageerror', e => out.errs.push(nm + ' ' + e.message));
    await p.goto(BASE, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(7000);
    const grab = async lab => { const l = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => [a.href, (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 40)])); l.forEach(([h, t]) => { if (!out.links[h]) out.links[h] = { t, de: lab }; }); };
    await grab(nm + ' portada');
    if (nm === 'cel') { await p.evaluate(() => { const m = document.querySelector('#bnav [data-b=more]'); if (m) m.click(); }); await p.waitForTimeout(800); await grab('cel menu Más');
      const mb = await p.evaluate(() => [...document.querySelectorAll('#more button, #more a')].map(x => (x.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40))); out.notes.push('Menu Más: ' + mb.join(' | ')); await p.evaluate(() => { const s = document.getElementById('more'); if (s) s.hidden = true; }); }
    if (nm === 'pc') {
      const data = await p.evaluate(() => { const all = (LIST || []).map(c => ({ n: c.name, g: c._g, v: 1 })).concat(dirL().map(c => ({ n: c.name, g: c._g, bas: c.bas }))); const cats = GR.map(g => [g[0], g[2].es, all.filter(c => c.g === g[0]).length]);
        const util = utilAll().map(u => ({ n: u.n, c: u.c, tel: !!u.tel, map: !!u.map, src: u.src || '' }));
        const wx = (document.querySelector('.infr') || document.body).textContent.match(/actualizado[^·]{0,20}/i); return { all, cats, util, wx: wx ? wx[0] : '', ev: (G.ev || []).map(e => [e.t, e.d]), news: !!(NEWS && NEWS.items && NEWS.items.length) }; });
      const seen = {}; data.all.forEach(c => { const k = norm(c.n); (seen[k] = seen[k] || []).push(c); });
      out.dup = Object.values(seen).filter(l => l.length > 1).map(l => l.map(c => c.n + (c.v ? ' (Vitrix)' : ' (ficha)')).join(' = '));
      const us = {}; data.util.forEach(u => { const k = norm(u.n); (us[k] = us[k] || []).push(u.c); }); out.dupUtil = Object.entries(us).filter(([, l]) => l.length > 1).map(([k, l]) => k + ' [' + l.join(',') + ']');
      out.cats = data.cats; out.util = { total: data.util.length, comTel: data.util.filter(u => u.tel).length, semMapa: data.util.filter(u => !u.map).length, porCat: data.util.reduce((o, u) => (o[u.c] = (o[u.c] || 0) + 1, o), {}) };
      out.neg = { total: data.all.length, vitrix: data.all.filter(c => c.v).length, fichas: data.all.filter(c => !c.v).length, basicas: data.all.filter(c => c.bas).length };
      out.clima = data.wx; out.ev = data.ev; out.news = data.news;
      for (const g of data.cats.filter(c => c[2] > 0)) { await p.evaluate(k => { CAT = k; SPV = ''; render(); }, g[0]); await p.waitForTimeout(400); await grab('pc categoria ' + g[1]); }
      for (const k of ['qh', 'hot', 'far', 'job', 'cla', 'alq', 'fer']) { await p.evaluate(k => { CAT = 'all'; SPV = k; render(); }, k); await p.waitForTimeout(500); const h = await p.evaluate(() => ((document.querySelector('#list h2') || {}).textContent || '').trim() + ' · ' + document.querySelectorAll('#list .pc, #list .card, #list .job, #list .cl').length + ' itens'); out.notes.push('Página ' + k + ': ' + h); await grab('pc página ' + k); }
    }
    await ctx.close();
  }
  // resposta de cada link interno (sem baixar imagens grandes)
  const own = Object.keys(out.links).filter(h => /^https:\/\/(guiadesantarita\.com|araujotechsistemas\.com)\//.test(h) && !/\.(jpg|jpeg|png|webp|svg)(\?|$)/i.test(h));
  const bad = [];
  for (const h of own) { const u = h.split('#')[0]; if (out.links[u + '#ok']) continue; out.links[u + '#ok'] = 1;
    try { const r = await fetch(u, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (auditoria Guía)' } }); if (r.status >= 400) bad.push(r.status + ' ' + u + ' ← ' + out.links[h].de + ' "' + out.links[h].t + '"'); else if (r.status >= 300) out.notes.push('redireciona ' + r.status + ' ' + u + ' → ' + r.headers.get('location')); } catch (e) { bad.push('ERRO ' + u + ' ' + e.message); } }
  const ext = Object.keys(out.links).filter(h => /^https?:/.test(h) && !own.includes(h) && !/#ok$/.test(h));
  console.log('== AUDITORIA ' + new Date().toISOString());
  console.log('Links internos conferidos: ' + own.length + ' · com problema: ' + bad.length); bad.forEach(x => console.log('  LINK ' + x));
  console.log('Links externos (não abertos): ' + ext.length);
  console.log('Negócios: ' + JSON.stringify(out.neg)); console.log('Categorias (negócios): ' + out.cats.map(c => c[1] + ' ' + c[2]).join(' · '));
  console.log('Repetidos (negócios): ' + (out.dup.length ? out.dup.join(' | ') : 'nenhum'));
  console.log('Lugares públicos: ' + JSON.stringify(out.util)); console.log('Repetidos (lugares): ' + (out.dupUtil.length ? out.dupUtil.join(' | ') : 'nenhum'));
  console.log('Clima/câmbio: ' + out.clima); console.log('Agenda: ' + JSON.stringify(out.ev)); console.log('Notícias do parceiro: ' + out.news);
  out.notes.forEach(n => console.log('NOTA ' + n)); console.log('Erros de JavaScript: ' + (out.errs.length ? out.errs.join(' | ') : 'nenhum'));
  await b.close();
})();
