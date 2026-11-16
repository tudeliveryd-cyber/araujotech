// Fotos da Guía no ar (celular e computador), para revisar o visual. Só abre as páginas, não altera nada.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  fs.mkdirSync('fotos', { recursive: true });
  const b = await chromium.launch();
  const base = process.env.BASE || 'https://guiadesantarita.com';
  const pages = (process.env.PAGES || '/').split(',');
  for (const [w, h, tag] of [[390, 844, 'cel'], [1366, 900, 'pc']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1 GuiaFotos' });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    // prévia: a página inicial vem do repositório (mudanças ainda não publicadas); dados e imagens continuam os do ar
    if (process.env.LOCAL) await p.route(u => u.href === base + '/' || u.href === base + '/?' , r => r.fulfill({ body: fs.readFileSync('araujo-tech-site/guia/index.html'), contentType: 'text/html; charset=utf-8' }));
    for (const u of pages) {
      await p.goto(base + u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
      await p.waitForTimeout(2500);
      await p.evaluate(() => { const i = document.querySelector('.inst'); if (i) i.remove(); });
      const n = (u.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'inicio');
      const H = await p.evaluate(() => document.body.scrollHeight);
      for (let y = 0, i = 0; y < H && i < 12; y += 1400, i++)
        await p.screenshot({ path: `fotos/${tag}-${n}-${i}.png`, clip: { x: 0, y, width: w, height: Math.min(1400, H - y) }, fullPage: true });
      // links dos negócios, para fotografar alguns depois
      if (u === '/') fs.writeFileSync('fotos/links.txt', (await p.$$eval('a[href]', as => as.map(a => a.getAttribute('href')))).join('\n'));
    }
    fs.writeFileSync(`fotos/erros-${tag}.txt`, errs.join('\n'));
    await ctx.close();
  }
  await b.close();
})();
