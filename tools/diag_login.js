// SÓ LEITURA: abre o painel, lista erros do console e tenta entrar com um usuário que NÃO existe (só para ver se o login responde).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })).newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text().slice(0, 200)); });
  p.on('response', r => { if (/identitytoolkit|securetoken|firestore/.test(r.url()) && r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url().slice(0, 120)); });
  for (const u of ['https://fogaomineiro.araujotechsistemas.com/painel/', 'https://araujotechsistemas.com/painel/']) {
    await p.goto(u, { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(6000);
    console.log('URL', u, 'login visível:', await p.locator('#lg_user').isVisible().catch(() => false));
    await p.fill('#lg_user', 'teste-inexistente-diag'); await p.fill('#lg_pass', 'x1y2z3w4'); await p.press('#lg_pass', 'Enter'); await p.waitForTimeout(6000);
    console.log('TELA', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 400));
  }
  errs.forEach(e => console.log('ERRO', e)); await b.close(); })().catch(e => { console.error(e); process.exit(1); });
