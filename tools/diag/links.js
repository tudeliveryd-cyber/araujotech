// varredura somente leitura: links quebrados, erros de console, rolagem lateral no celular e cabeçalhos de segurança
const { chromium } = require('playwright');
(async () => {
  const starts = (process.argv[2] || 'https://guiadesantarita.com/ https://araujotechsistemas.com/ https://araujotechsistemas.com/vitrix/ https://fogaomineiro.araujotechsistemas.com/').split(/\s+/).filter(Boolean);
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const seen = new Map(), queue = starts.slice(), pages = []; const hosts = new Set(starts.map(u => new URL(u).host));
  const norm = u => { try { const x = new URL(u); x.hash = ''; return x.href; } catch (e) { return null; } };
  let opened = 0;
  while (queue.length && opened < 70) {
    const u = norm(queue.shift()); if (!u || pages.includes(u)) continue; pages.push(u); opened++;
    const p = await ctx.newPage(); const errs = [], bad = [];
    p.on('pageerror', e => errs.push('JS ' + String(e.message).slice(0, 140)));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR_BLOCKED|googletagmanager/.test(m.text())) errs.push('CON ' + m.text().slice(0, 140)); });
    p.on('response', r => { if (r.status() >= 400 && !/firestore|identitytoolkit|google-analytics/.test(r.url())) bad.push(r.status() + ' ' + r.url().slice(0, 130)); });
    let st = 0, hd = {};
    try { const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); st = r ? r.status() : 0; hd = r ? r.headers() : {}; await p.waitForTimeout(2500); } catch (e) { errs.push('NAV ' + String(e.message).slice(0, 80)); }
    const info = await p.evaluate(() => { const de = document.documentElement; const ov = de.scrollWidth - de.clientWidth; let who = ''; if (ov > 2) { for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.right > de.clientWidth + 2 && r.width > 0 && getComputedStyle(e).position !== 'fixed') { who = (e.tagName + '.' + String(e.className).slice(0, 30) + ' r=' + Math.round(r.right)); break; } } }
      const imgs = [...document.images].filter(i => i.complete && !i.naturalWidth && i.getAttribute('src') && getComputedStyle(i).display !== 'none').map(i => i.getAttribute('src').slice(0, 90));
      const noalt = [...document.images].filter(i => !i.hasAttribute('alt')).length;
      const small = [...document.querySelectorAll('a,button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24) && r.top < 3000 && !e.closest('p,li,small,.sl-dt,.sh-dots') ; }).slice(0, 4).map(e => (e.tagName + '.' + String(e.className).slice(0, 20) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height) + ' "' + (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 20) + '"'));
      return { ov, who, imgs, noalt, small, t: document.title.slice(0, 50), links: [...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => /^https?:/.test(h)) }; }).catch(() => ({ ov: 0, links: [], imgs: [], small: [] }));
    const prob = []; if (st >= 400 || !st) prob.push('STATUS ' + st); if (info.ov > 2) prob.push('ROLAGEM LATERAL ' + info.ov + 'px ' + info.who); if (info.imgs.length) prob.push('IMG QUEBRADA ' + info.imgs.slice(0, 3).join(' , ')); if (info.noalt) prob.push('IMG SEM ALT ' + info.noalt); if (info.small.length) prob.push('TOQUE PEQUENO ' + info.small.join(' ; ')); if (errs.length) prob.push([...new Set(errs)].slice(0, 3).join(' ; ')); if (bad.length) prob.push([...new Set(bad)].slice(0, 3).join(' ; '));
    console.log((prob.length ? 'PROB ' : 'OK   ') + u + (prob.length ? ' => ' + prob.join(' | ') : ''));
    if (starts.includes(u) || opened < 3) console.log('HDR  ' + u + ' ' + JSON.stringify(Object.fromEntries(['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy', 'referrer-policy', 'permissions-policy', 'cache-control', 'content-encoding', 'server'].map(k => [k, (hd[k] || '-').slice(0, 60)]))));
    for (const l of info.links) { const n = norm(l); if (!n) continue; if (!seen.has(n)) seen.set(n, u); try { if (hosts.has(new URL(n).host) && !pages.includes(n) && !queue.includes(n) && !/\/(demo|admin|painel|cuenta|entrar|loja)\b|\.(pdf|jpg|png|webp)$|[?&](q|c)=/.test(n) && queue.length < 400) queue.push(n); } catch (e) { } }
    await p.close();
  }
  // links restantes (internos e externos): só conferir se respondem
  const rest = [...seen.keys()].filter(u => !pages.includes(u) && !/wa\.me|whatsapp|facebook|instagram|tiktok|youtube|maps\.app|google\.[a-z.]+\/maps|goo\.gl|linkedin|twitter|x\.com/.test(u)).slice(0, 260); let nb = 0;
  for (const u of rest) { try { const r = await ctx.request.get(u, { timeout: 20000, maxRedirects: 5 }); if (r.status() >= 400) { nb++; console.log('LINK ' + r.status() + ' ' + u + '  (em ' + seen.get(u) + ')'); } } catch (e) { nb++; console.log('LINK ERRO ' + u + ' (em ' + seen.get(u) + ') ' + String(e.message).slice(0, 60)); } }
  console.log('FIM paginas=' + pages.length + ' links_conferidos=' + rest.length + ' links_ruins=' + nb);
  await b.close();
})();
