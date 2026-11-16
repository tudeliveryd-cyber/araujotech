// Auditoria dos botões da Guía no ar: toca em cada botão/link e confere se algo acontece (rolagem, mudança de tela, menu, link válido).
// Só leitura: não envia formulários; links externos (WhatsApp, Maps) são só conferidos, não abertos.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  fs.mkdirSync('fotos', { recursive: true });
  const base = process.env.BASE || 'https://guiadesantarita.com';
  const b = await chromium.launch(); const rep = [];
  for (const [w, h, tag] of [[390, 844, 'cel'], [1366, 900, 'pc']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1 GuiaAudit' });
    await ctx.route(/wa\.me|google\.com\/maps|instagram|facebook/, r => r.abort());
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const open = async () => { await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}); await p.waitForTimeout(2500); await p.evaluate(() => { const i = document.querySelector('.inst'); if (i) i.remove(); }); };
    await open();
    const sels = await p.evaluate(() => {
      const out = []; const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const add = (sel, list) => list.forEach((e, i) => { if (vis(e) || e.closest('#more')) out.push({ sel, i, txt: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40), href: e.getAttribute('href') || '' }) });
      ['.hdr a, .hdr button', '.hero button, .hero a', '#atl button, #atl a', '#dst button, #dst a', '#list button, #list a, #list summary', 'footer a', '#bnav button'].forEach(s => add(s, [...document.querySelectorAll(s)]));
      return out; });
    for (const s of sels) {
      await open();
      if (s.sel === '#more') {}
      const before = await p.evaluate(() => ({ y: Math.round(scrollY), u: location.href, cat: typeof CAT !== 'undefined' ? CAT : '', q: document.getElementById('q').value, more: !document.getElementById('more').hidden, map: typeof MAPON !== 'undefined' ? MAPON : null, html: document.getElementById('list').innerHTML.length + document.getElementById('atl').innerHTML.length }));
      const el = (await p.$$(s.sel))[s.i]; if (!el) { rep.push({ tag, ...s, res: 'sumiu' }); continue; }
      const ext = /^https?:/.test(s.href) && !s.href.includes(new URL(base).host);
      if (ext || /^tel:/.test(s.href)) { rep.push({ tag, ...s, res: 'externo' }); continue; }
      const popup = p.waitForEvent('popup', { timeout: 1500 }).catch(() => null);
      await el.scrollIntoViewIfNeeded().catch(() => {});
      const y0 = await p.evaluate(() => Math.round(scrollY));
      await el.click({ timeout: 4000 }).catch(e => rep.push({ tag, ...s, res: 'não deu para tocar: ' + e.message.split('\n')[0] }));
      await p.waitForTimeout(1200); const pp = await popup;
      const after = await p.evaluate(() => ({ y: Math.round(scrollY), u: location.href, cat: typeof CAT !== 'undefined' ? CAT : '', q: document.getElementById('q') ? document.getElementById('q').value : '', more: document.getElementById('more') ? !document.getElementById('more').hidden : false, map: typeof MAPON !== 'undefined' ? MAPON : null, html: document.getElementById('list') ? document.getElementById('list').innerHTML.length + document.getElementById('atl').innerHTML.length : 0 }));
      const changed = pp || after.u !== before.u || Math.abs(after.y - y0) > 30 || after.cat !== before.cat || after.q !== before.q || after.more !== before.more || after.map !== before.map || after.html !== before.html;
      rep.push({ tag, sel: s.sel, txt: s.txt, href: s.href, res: changed ? 'ok' : 'NADA ACONTECEU', d: { y0, y: after.y, u: after.u.replace(base, ''), cat: after.cat, q: after.q, more: after.more } });
    }
    rep.push({ tag, erros: errs });
    await ctx.close();
  }
  fs.writeFileSync('fotos/auditoria.json', JSON.stringify(rep, null, 1));
  console.log(rep.filter(r => r.res && r.res !== 'ok' && r.res !== 'externo').length, 'problemas de', rep.length);
  await b.close();
})();
