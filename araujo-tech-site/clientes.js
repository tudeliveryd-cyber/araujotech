/* Clientes reais da Araújo Tech, publicados sozinhos pelo Panel Araújo Tech (Firestore platform/sitio → clientes).
   Só aparecem clientes ativos, que não sejam de teste e que estejam marcados para "Mostrar en el sitio".
   Uso: AT_CLIENTES.load(lista => AT_CLIENTES.render(elemento, 'es'|'pt', { sys: 'catalogo' })) */
(function () {
  const URL = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U&mask.fieldPaths=clientes';
  const dv = v => { if (!v) return null; if ('stringValue' in v) return v.stringValue; if ('booleanValue' in v) return v.booleanValue; if ('integerValue' in v) return +v.integerValue; if ('doubleValue' in v) return v.doubleValue; if ('nullValue' in v) return null; if ('arrayValue' in v) return (v.arrayValue.values || []).map(dv); if ('mapValue' in v) { const o = {}; Object.entries(v.mapValue.fields || {}).forEach(([k, x]) => o[k] = dv(x)); return o; } return null; };
  const SYSN = { catalogo: { es: 'Vitrix', pt: 'Vitrix' }, agenda: { es: 'Agenda para salones', pt: 'Agenda para salões' }, pulpito: { es: 'Meu Púlpito', pt: 'Meu Púlpito' }, caja: { es: 'Caja de Entregas', pt: 'Caixa de Entregas' }, iglesia: { es: 'Sistema para iglesias', pt: 'Sistema para igrejas' }, otro: { es: 'Sistema a medida', pt: 'Sistema sob medida' } };
  const TX = { es: { all: 'Todos', cat: 'Ver catálogo', ag: 'Reservar turno', see: 'Visitar' }, pt: { all: 'Todos', cat: 'Ver catálogo', ag: 'Agendar horário', see: 'Visitar' } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ini = n => String(n).split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).slice(0, 2).map(w => w.match(/[\p{L}\p{N}]/u)[0]).join('').toUpperCase();
  const safeUrl = u => /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"'<>]*)?$/i.test(String(u || '')) ? u : '';
  let LIST = null; const waiting = [];
  function load(cb) {
    if (LIST) return cb(LIST); waiting.push(cb); if (waiting.length > 1) return;
    const done = l => { LIST = l; waiting.splice(0).forEach(f => { try { f(LIST); } catch (e) { console.warn(e); } }); };
    fetch(URL).then(r => r.ok ? r.json() : null).then(d => { const f = d && d.fields && d.fields.clientes; done(f ? (dv(f) || []).filter(x => x && x.name) : []); }).catch(() => done([]));
  }
  let css = false;
  function style() {
    if (css) return; css = true; const s = document.createElement('style');
    s.textContent = '.atc-fil{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}.atc-fil button{font:inherit;font-size:14px;font-weight:600;padding:8px 14px;border-radius:999px;border:1px solid var(--line,#e4e0ea);background:#fff;color:var(--text,#1b1530);cursor:pointer}.atc-fil button[aria-pressed=true]{background:var(--purple,#7b2ff2);border-color:var(--purple,#7b2ff2);color:#fff}'
      + '.atc-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}'
      + '.atc-card{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid var(--line,#e4e0ea);border-radius:18px;padding:16px;min-width:0}'
      + '.atc-lg{width:64px;height:64px;border-radius:16px;flex:none;overflow:hidden;display:grid;place-items:center;background:var(--lilac,#efe6ff);border:1px solid var(--line,#e4e0ea)}.atc-lg img{width:100%;height:100%;object-fit:cover;display:block}.atc-lg b{font-family:var(--display,inherit);font-size:22px;color:var(--purple,#7b2ff2)}'
      + '.atc-tx{min-width:0;display:flex;flex-direction:column;gap:3px}.atc-tx h3{margin:0;font-size:17px;line-height:1.2;overflow-wrap:anywhere}.atc-tx p{margin:0;font-size:13.5px;color:var(--muted,#6b6480);line-height:1.35}'
      + '.atc-go{align-self:flex-start;margin-top:6px;font-size:13.5px;font-weight:700;color:var(--purple,#7b2ff2);text-decoration:none}.atc-go:hover{text-decoration:underline}';
    document.head.appendChild(s);
  }
  function card(c, L) {
    const s = SYSN[c.sys] || SYSN.otro, seg = L === 'pt' ? (c.segPt || c.segEs) : (c.segEs || c.segPt);
    const meta = [s[L], seg, c.city].filter(Boolean).join(' · '), url = safeUrl(c.url), logo = safeUrl(c.logo);
    const go = url ? `<a class="atc-go" href="${esc(url)}" target="_blank" rel="noopener">${c.sys === 'catalogo' ? TX[L].cat : c.sys === 'agenda' ? TX[L].ag : TX[L].see} →</a>` : '';
    return `<article class="atc-card" data-sys="${esc(c.sys)}"><span class="atc-lg">${logo ? `<img src="${esc(logo)}" alt="" loading="lazy" width="64" height="64" data-ini="${esc(ini(c.name))}">` : `<b>${esc(ini(c.name))}</b>`}</span><div class="atc-tx"><h3>${esc(c.name)}</h3><p>${esc(meta)}</p>${go}</div></article>`;
  }
  // devolve quantos clientes foram mostrados (0 = a seção pode ficar escondida)
  function render(el, lang, opt) {
    if (!el || !LIST) return 0; style(); opt = opt || {}; const L = lang === 'pt' ? 'pt' : 'es';
    const base = LIST.filter(c => !opt.sys || c.sys === opt.sys); if (!base.length) { el.innerHTML = ''; return 0; }
    const syss = [...new Set(base.map(c => c.sys))]; const f = syss.includes(el.dataset.f) ? el.dataset.f : 'all';
    const chips = !opt.sys && syss.length > 1 ? `<div class="atc-fil" role="group">${[['all', TX[L].all, base.length]].concat(syss.map(s => [s, (SYSN[s] || SYSN.otro)[L], base.filter(c => c.sys === s).length])).map(([k, n, q]) => `<button type="button" data-atf="${esc(k)}" aria-pressed="${f === k}">${esc(n)} · ${q}</button>`).join('')}</div>` : '';
    el.innerHTML = chips + `<div class="atc-list">${base.filter(c => f === 'all' || c.sys === f).map(c => card(c, L)).join('')}</div>`;
    el.querySelectorAll('.atc-lg img').forEach(i => { i.onerror = () => { const b = document.createElement('b'); b.textContent = i.dataset.ini; i.replaceWith(b); }; });
    if (!el.dataset.atb) { el.dataset.atb = '1'; el.addEventListener('click', e => { const b = e.target.closest('[data-atf]'); if (!b) return; el.dataset.f = b.dataset.atf; render(el, el.dataset.lang || L, opt); }); }
    el.dataset.lang = L; return base.length;
  }
  // faixa compacta da página inicial (classe .cl do site): logo, nome e o sistema que usa
  const SMALL = { catalogo: { es: 'catálogo digital', pt: 'catálogo digital' }, agenda: { es: 'Agenda de turnos', pt: 'Agenda de horários' } };
  function strip(list, lang) {
    const L = lang === 'pt' ? 'pt' : 'es';
    return (list || []).map(c => {
      const seg = L === 'pt' ? (c.segPt || c.segEs) : (c.segEs || c.segPt), url = safeUrl(c.url), logo = safeUrl(c.logo), i = ini(c.name);
      const sub = c.sys === 'catalogo' ? 'Vitrix · ' + (seg || SMALL.catalogo[L]) : c.sys === 'agenda' ? SMALL.agenda[L] : (SYSN[c.sys] || SYSN.otro)[L];
      const img = logo ? `<img src="${esc(logo)}" alt="${esc(c.name)}" width="64" height="64" loading="lazy" data-ini="${esc(i)}" onerror="this.outerHTML='<span class=&quot;cl-in&quot;>'+this.dataset.ini+'</span>'">` : `<span class="cl-in">${esc(i)}</span>`;
      const inner = `${img}<span><b>${esc(c.name)}</b><small>${esc(sub)}</small></span>`;
      return url ? `<a class="cl" href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="cl">${inner}</div>`;
    }).join('');
  }
  window.AT_CLIENTES = { load, render, strip };
})();
