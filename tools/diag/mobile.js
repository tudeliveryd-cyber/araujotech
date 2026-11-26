// somente leitura: revisão de celular (iPhone 13) — rolagem lateral, botões pequenos demais para o dedo e letras muito pequenas.
//   node tools/diag/mobile.js "https://guiadesantarita.com/ https://guiadesantarita.com/anunciar/"
const { chromium, devices } = require('playwright');
(async () => { const urls = (process.argv[2] || 'https://guiadesantarita.com/').split(/\s+/).filter(Boolean);
  const b = await chromium.launch(); const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { timezoneId: 'America/Asuncion', locale: 'es-PY' }));
  for (const u of urls) { const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(u, { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(2500);
    for (let y = 0; y < 20000; y += 800) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); }
    const r = await p.evaluate(() => { const W = innerWidth, o = { over: document.documentElement.scrollWidth - W, wide: [], small: [], tiny: [] };
      document.querySelectorAll('body *').forEach(el => { const R = el.getBoundingClientRect(); if (!R.width || !R.height) return; const s = getComputedStyle(el); if (s.visibility === 'hidden') return;
        if (R.right > W + 2 && s.position !== 'fixed' && !el.closest('[class*="fr"],[class*="scroll"],.subt,.chips,#chips,.jbf,.ald-f,.qtu,.sug,.atl,.tt,.emq,.sl,#sld,.sl-dt') && o.wide.length < 6) o.wide.push((el.tagName + '.' + el.className).slice(0, 50) + ' →' + Math.round(R.right));
        if ((el.tagName === 'A' || el.tagName === 'BUTTON') && !el.closest('p,li') && (R.height < 32 || R.width < 32) && o.small.length < 10) o.small.push((el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0, 24) + '"').slice(0, 70) + ' ' + Math.round(R.width) + 'x' + Math.round(R.height));
        if ([...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()) && parseFloat(s.fontSize) < 12 && o.tiny.length < 8) o.tiny.push((el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0, 24) + '"').slice(0, 60) + ' ' + s.fontSize); });
      return o; });
    console.log('MOB ' + u + ' ' + JSON.stringify(Object.assign(r, { errs }))); await p.close(); }
  await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
