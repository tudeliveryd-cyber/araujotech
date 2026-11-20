// SÓ LEITURA: grava um passo a passo da Guía no celular (vídeo) e imprime no log em base64 (VID64). Não grava nada no site.
// PASSOS: lista separada por ";" de ações: "goto:URL", "wait:ms", "scroll:#id", "click:seletor", "js:código".
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-PY', timezoneId: 'America/Asuncion', recordVideo: { dir: 'vid', size: { width: 390, height: 844 } } });
  const p = await ctx.newPage(); const log = [];
  for (const st of (process.env.PASSOS || '').split(';').map(s => s.trim()).filter(Boolean)) {
    const [k, ...r] = st.split(':'); const v = r.join(':');
    try {
      if (k === 'goto') { await p.goto(v, { waitUntil: 'load', timeout: 60000 }); }
      else if (k === 'wait') await p.waitForTimeout(+v);
      else if (k === 'scroll') { const ok = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const y = e.getBoundingClientRect().top + scrollY - 70; const y0 = scrollY, t0 = performance.now(); return new Promise(res => { const f = t => { const k = Math.min(1, (t - t0) / 1600); scrollTo(0, y0 + (y - y0) * (1 - Math.pow(1 - k, 3))); k < 1 ? requestAnimationFrame(f) : res(true) }; requestAnimationFrame(f) }) }, v); log.push(st + ' → ' + ok); }
      else if (k === 'scrollby') await p.evaluate(px => new Promise(res => { const y0 = scrollY, t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / 1400); scrollTo(0, y0 + px * (1 - Math.pow(1 - k, 3))); k < 1 ? requestAnimationFrame(f) : res() }; requestAnimationFrame(f) }), +v);
      else if (k === 'click') { await p.locator(v).first().click({ timeout: 10000 }); }
      else if (k === 'js') { log.push(st + ' → ' + JSON.stringify(await p.evaluate(v))); }
    } catch (e) { log.push('FALHOU ' + st + ' ' + e.message.split('\n')[0]); }
  }
  log.forEach(l => console.log('PASSO ' + l));
  const path = await p.video().path(); await ctx.close(); await b.close();
  const s = fs.readFileSync(path).toString('base64'); console.log('VIDSIZE ' + s.length);
  for (let i = 0; i < s.length; i += 60000) console.log('VID64 ' + s.slice(i, i + 60000));
})();
