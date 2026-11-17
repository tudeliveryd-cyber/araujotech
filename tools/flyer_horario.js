/* Gera os flyers do horário com os negócios reais da Guía, usando o mesmo código da Central (cgMeal).
   Só leitura: abre guiadesantarita.com, lê /sitio/guia.php e salva PNGs em ./flyers/ */
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const s = fs.readFileSync('araujo-tech-site/admin/index.html', 'utf8');
  const a = s.indexOf('/* flyer do horário'), b = s.indexOf('/* flyer de vagas');
  if (a < 0 || b < 0) throw new Error('cgMeal não encontrado');
  const code = s.slice(a, b);
  const br = await chromium.launch(); const p = await br.newPage();
  await p.goto('https://guiadesantarita.com/', { waitUntil: 'domcontentloaded' });
  await p.addScriptTag({ content: `window.ui={};window.lang='${process.env.GLANG === 'pt' ? 'pt' : 'es'}';window.toast=m=>{window.__err=m};window.esc=s=>String(s==null?'':s);window.t=k=>k;window.ic=()=>'';
window.isoDay=t=>new Date(t).toISOString().slice(0,10);window.openSheet=h=>{window.__h=h};
document.fonts&&document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;600;800;900&display=swap">');
${code.replace(/const (CG_TU|cgTuNow|cgNorm)=/g, 'window.$1=')}
window.cgMeal=cgMeal;` });
  await p.evaluate(async () => { try { await document.fonts.load('900 40px "Red Hat Display"'); await document.fonts.load('800 40px "Red Hat Display"'); await document.fonts.load('600 40px "Red Hat Display"'); } catch (e) {} });
  fs.mkdirSync('flyers', { recursive: true });
  for (const k of ['de', 'al', 'me', 'ce']) {
    for (const off of [0, 1]) {
      const r = await p.evaluate(async ([k, off]) => {
        window.__h = ''; window.__err = '';
        await cgMeal(k, off ? 1 : 0);
        if (window.__err) return { err: window.__err };
        const urls = [...window.__h.matchAll(/<img src="(blob:[^"]+)"/g)].map(m => m[1]);
        const out = []; for (const u of urls) { const bl = await (await fetch(u)).blob(); out.push(await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(bl); })); }
        const tx = (window.__h.match(/(\d+ de \d+)/) || [])[1]; return { out, tx };
      }, [k, off]);
      if (r.err) { console.log(k, 'ERRO', r.err); break; }
      console.log(k, off, r.tx);
      r.out.forEach((d, i) => fs.writeFileSync(`flyers/${k}-${off ? 'b' : 'a'}-${i ? 'status' : 'feed'}.png`, Buffer.from(d.split(',')[1], 'base64')));
      const m = (r.tx || '').match(/de (\d+)/); if (!m || +m[1] <= 6) break;
    }
  }
  for (const f of fs.readdirSync('flyers')) { const b = fs.readFileSync('flyers/' + f).toString('base64'); for (let i = 0; i < b.length; i += 60000) console.log('IMG64 ' + f + ' ' + b.slice(i, i + 60000)); }
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
