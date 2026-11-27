// somente leitura: flyer "¿No sabés dónde almorzar?" com negócios da Guía marcados para almoço (dados publicados). Arg: es|pt
const { chromium } = require('playwright');
(async () => { const lg = (process.argv[2] || 'es').trim() === 'pt' ? 'pt' : 'es';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('https://araujotechsistemas.com/admin/?v=' + Date.now(), { waitUntil: 'networkidle' });
  const info = await p.evaluate(async (lg) => {
    const j = await (await fetch('/sitio/guia.php?g=1&v=' + Date.now())).json(); const dir = (j.dir || []).filter(x => x && x.n && x.on !== false);
    let l = dir.filter(x => Array.isArray(x.tu) && x.tu.includes('al')); l = l.sort((a, c) => (c.lg ? 1 : 0) - (a.lg ? 1 : 0)).slice(0, 6);
    const T = lg === 'pt' ? { k: 'Guia de Santa Rita · almoço', h: 'Não sabe<br>onde almoçar?', s: 'Encontre opções no nosso Guia, com WhatsApp e localização de cada lugar.', f: 'Veja todas as opções de hoje em', w: 'Canal do Guia no WhatsApp' } : { k: 'Guía de Santa Rita · almuerzo', h: '¿No sabés<br>dónde almorzar?', s: 'Encontrá opciones en nuestra Guía, con WhatsApp y ubicación de cada lugar.', f: 'Mirá todas las opciones de hoy en', w: 'Canal de la Guía en WhatsApp' };
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const card = x => `<div class="c">${x.lg ? `<img src="${esc(x.lg)}">` : `<div class="ini">${esc(x.n.trim()[0] || '')}</div>`}<b>${esc(x.n)}</b></div>`;
    const moon = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFC21A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>`;
    const css = `@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;700;800;900&display=swap');*{box-sizing:border-box;margin:0}body{background:#000}
    .f{width:1080px;position:relative;overflow:hidden;font-family:'Red Hat Display',system-ui,sans-serif;color:#fff;background:radial-gradient(900px 700px at 85% 8%,#4A1590 0%,transparent 60%),linear-gradient(170deg,#1A0B3D 0%,#2B0B58 55%,#120626 100%);padding:84px 80px;display:flex;flex-direction:column}
    .st{height:1920px;padding:150px 80px 130px}.fe{height:1350px;padding:72px 80px 64px}
    .moon{position:absolute;right:70px;top:70px;width:190px;height:190px}.st .moon{top:120px;width:220px;height:220px}
    .dots i{position:absolute;width:6px;height:6px;border-radius:50%;background:#FFC21A;opacity:.6}
    .k{font-weight:800;font-size:30px;letter-spacing:.02em;color:#FFC21A}
    h1{font-weight:900;font-size:104px;line-height:.92;margin:18px 0 22px;letter-spacing:-.02em}.st h1{font-size:150px;margin:30px 0 34px}
    .s{font-size:36px;font-weight:600;line-height:1.25;max-width:900px;color:#E9DEFA}
    .g{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px}.st .g{grid-template-columns:repeat(2,1fr);gap:26px;margin-top:80px}
    .c{background:#fff;color:#1E0A3C;border-radius:28px;padding:20px 16px 18px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
    .c img,.ini{width:128px;height:128px;border-radius:24px;object-fit:contain;background:#fff}.st .c img,.st .ini{width:190px;height:190px}
    .ini{display:flex;align-items:center;justify-content:center;background:#EFE6FA;color:#4A0A80;font-weight:900;font-size:80px}
    .c b{font-size:27px;font-weight:800;line-height:1.15}.st .c b{font-size:32px}
    .ft{margin-top:auto;padding-bottom:0;display:flex;align-items:flex-end;justify-content:space-between;gap:30px;border-top:2px solid rgba(255,255,255,.18);padding-top:36px}
    .ft p{font-size:30px;font-weight:600;color:#E9DEFA;max-width:600px;line-height:1.25}.ft .u{display:block;font-size:44px;font-weight:900;color:#fff;margin-top:6px}
    .ft .w{display:block;font-size:30px;font-weight:700;color:#FFC21A;margin-top:14px}.lg{display:flex;flex-direction:column;align-items:flex-end;gap:18px}.lg img{height:84px;width:auto}.lg img.td{height:96px;background:#fff;border-radius:18px;padding:8px 14px}.lg img.gu{height:70px}`;
    const dots = Array.from({ length: 22 }, (_, i) => `<i style="left:${(i * 137) % 1040}px;top:${(i * 263) % 520 + 30}px;opacity:${.25 + (i % 4) * .15}"></i>`).join('');
    const one = cls => `<div class="f ${cls}"><div class="moon">${moon}</div><p class="k">${T.k}</p><h1>${T.h}</h1><p class="s">${T.s}</p><div class="g">${l.map(card).join('')}</div>
      <div class="ft"><p>${T.f}<span class="u">guiadesantarita.com</span><span class="w">${T.w}</span></p><div class="lg"><img class="gu" src="/img/guia/guia-logo-blanco-hd.png" style="height:96px"></div></div></div>`;
    document.head.innerHTML = `<meta charset="utf-8"><style>${css}</style>`; document.body.innerHTML = one('fe') + one('st');
    await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); await new Promise(r => setTimeout(r, 800));
    return l.map(x => x.n + ' | ' + (x.tu || []).join(',') + ' | lg:' + (x.lg ? 1 : 0)).concat(['imgs ok ' + [...document.images].filter(i => i.naturalWidth).length + '/' + document.images.length]);
  }, lg);
  console.log('INFO ' + JSON.stringify(info));
  const fs = await p.$$('.f'); console.log('IMG-feed<<' + (await fs[0].screenshot()).toString('base64') + '>>'); console.log('IMG-status<<' + (await fs[1].screenshot()).toString('base64') + '>>');
  await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
