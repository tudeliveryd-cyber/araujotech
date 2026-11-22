// mede o que muda de lugar enquanto a página carrega (celular), somente leitura
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['Pixel 5'] }); const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__ls = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__ls.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), s: (e.sources || []).slice(0, 4).map(s => { const n = s.node; return n ? (n.id ? '#' + n.id : (n.tagName || '') + '.' + String(n.className || '').slice(0, 30)) + ' ' + Math.round(s.previousRect.y) + '>' + Math.round(s.currentRect.y) + ' h' + Math.round(s.previousRect.height) + '>' + Math.round(s.currentRect.height) : '?'; }) }); }).observe({ type: 'layout-shift', buffered: true });
  });
  const snap = async tag => console.log('SNAP ' + tag + ' ' + await p.evaluate(() => JSON.stringify(['.tbar', '.hdr', '#dst', '#sl', '.hero', '.hq', '#main', '#chips', '#atl', '#top2', '#list'].map(s => { const e = document.querySelector(s); if (!e) return s + ':-'; const r = e.getBoundingClientRect(); return s + ':' + Math.round(r.top + scrollY) + '/' + Math.round(r.height); })) + ' body=' + document.body.className + ' hero=' + [...(document.querySelector('.hero .wrap') || { children: [] }).children].map(e => e.tagName + '.' + String(e.className).slice(0, 12) + ':' + Math.round(e.getBoundingClientRect().height)).join(',')));
  if (process.env.DELAY) await p.route(new RegExp(process.env.DELAY), async r => { await new Promise(z => setTimeout(z, 2500)); r.continue(); });
  await p.goto(process.argv[2], { waitUntil: 'commit' });
  for (const ms of [150, 400, 800, 1500, 2500, 4000, 7000]) { await p.waitForTimeout(ms === 150 ? 150 : 600); try { await snap(ms); } catch (e) { } }
  await p.waitForTimeout(3000);
  const ls = await p.evaluate(() => window.__ls); let tot = 0; ls.forEach(x => { tot += x.v; console.log('SHIFT ' + JSON.stringify(x)); }); console.log('TOTAL ' + tot.toFixed(3));
  await b.close();
})();
