// SÓ LEITURA: toca em cada quadro de categoria da Guía (celular) e compara o número do quadro com o que aparece.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'es-PY', timezoneId: 'America/Asuncion', serviceWorkers: 'block' })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('https://guiadesantarita.com/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}); await p.waitForTimeout(5000);
  const tiles = await p.evaluate(() => [...document.querySelectorAll('[data-c],[data-pk],[data-a]')].filter(e => e.closest('.tg,.tiles,#atl,.cats,.tg-all')).map(e => ({ sel: e.dataset.c ? `[data-c="${e.dataset.c}"]` : e.dataset.pk ? `[data-pk="${e.dataset.pk}"]` : `[data-a="${e.dataset.a}"]`, t: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) })));
  const seen = new Set();
  for (const t of tiles) { if (seen.has(t.sel)) continue; seen.add(t.sel);
    await p.goto('https://guiadesantarita.com/', { waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForTimeout(2500);
    const ok = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, t.sel); if (!ok) { console.log('TILE', t.sel, '|', t.t, '| nao achado'); continue; }
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => ({ cards: document.querySelectorAll('#list .card, #list article, .grp .card, .spv .pl, .spv .card, .spv a.pl, .grid > *').length, empty: !!document.querySelector('.empty, .none, .vazio'), txt: (document.querySelector('#list') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 160) }));
    console.log('TILE', t.sel, '|', t.t, '| itens na tela:', r.cards, r.empty ? '| VAZIO' : '', '|', r.txt);
  }
  console.log('ERROS JS', errs.length, errs.slice(0, 3).join(' || '));
  await b.close();
})();
