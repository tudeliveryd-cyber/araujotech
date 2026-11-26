// somente leitura: gera o flyer do horário da Central (mesmo código do admin) com os dados publicados da Guía. Arg: de|al|me|ce [es|pt]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => { const [k, lg] = (process.argv[2] || 'al es').split(/\s+/);
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'admin', 'index.html'), 'utf8');
  const a = src.indexOf('const CG_TU='), s0 = src.indexOf('async function cgMeal'); let i = src.indexOf('{', s0), d = 0, q = null;
  for (; i < src.length; i++) { const c = src[i]; if (q) { if (c === '\\') { i++; continue } if (c === q) q = null; continue } if (c === "'" || c === '"' || c === '`') { q = c; continue } if (c === '{') d++; else if (c === '}') { d--; if (!d) break } }
  const code = src.slice(a, i + 1);
  const br = await chromium.launch(); const p = await br.newPage(); await p.goto('https://araujotechsistemas.com/admin/?v=' + Date.now(), { waitUntil: 'networkidle' }); console.log('ORIG', p.url(), await p.evaluate(async () => { try { const r = await fetch('/sitio/guia.php?g=1&v=' + Date.now()); const j = await r.json(); return r.status + ' dir=' + (j.dir || []).length + ' al=' + (j.dir || []).filter(x => (x.tu || []).includes('al')).length } catch (e) { return 'erro ' + e.message } }));
  await p.addStyleTag({ url: 'https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;600;800;900&display=swap' }).catch(() => {}); await p.waitForTimeout(1500);
  const out = await p.evaluate(async ([code, k, lg]) => { window.ui = {}; window.lang = lg || 'es'; try { (0, eval)("lang='" + (lg === 'pt' ? 'pt' : 'es') + "'") } catch (e) {} window.toast = m => { window.__err = m }; window.isoDay = t => new Date(t).toISOString().slice(0, 10); window.esc = s => String(s); window.t = s => s; window.ic = () => '';
    let html = ''; window.openSheet = h => { html = h }; (0, eval)(code); try { await document.fonts.load('900 40px "Red Hat Display"') } catch (e) {} await cgMeal(k);
    const us = [...html.matchAll(/<img src="(blob:[^"]+)"/g)].map(m => m[1]); const r = []; for (const u of us) { const bl = await (await fetch(u)).blob(); r.push(await new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result.split(',')[1]); f.readAsDataURL(bl) })) }
    return { err: window.__err || '', imgs: r, meta: (html.match(/(\d+) de (\d+)/) || [''])[0] }; }, [code, k, lg]);
  console.log('FLY', out.err, out.meta, out.imgs.length); out.imgs.forEach((x, i) => console.log('IMG-' + (i ? 'status' : 'feed') + '<<' + x + '>>')); await br.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
