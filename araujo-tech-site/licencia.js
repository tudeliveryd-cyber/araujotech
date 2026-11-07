/* Araújo Tech · verificação de licença
   Uso: <script src="https://araujotechsistemas.com/licencia.js" data-cliente="codigo-do-cliente"></script>
   Opcional: data-publico="1" nas páginas que o público vê (mostra um aviso neutro, sem falar de pagamento).
   Se o admin marcar o cliente como suspenso, o sistema fica bloqueado. Ao reativar, libera sozinho. */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var id = (me.getAttribute('data-cliente') || '').trim();
  if (!id) return;
  var publico = me.getAttribute('data-publico') === '1';
  var KEY = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U';
  var URL = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/licencias/' + encodeURIComponent(id) + '?key=' + KEY;
  var CK = 'atlic_' + id;
  var pt = /^pt/i.test(navigator.language || '');
  var WA = '595982086171';
  var box = null;

  function txt(es, ptx) { return pt ? ptx : es; }

  function show(name) {
    if (box) return;
    var css = document.createElement('style');
    css.textContent = '#atlic{position:fixed;inset:0;z-index:2147483647;background:rgba(18,8,34,.96);display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
      '#atlic .c{background:#fff;color:#1A1222;border-radius:20px;max-width:420px;width:100%;padding:28px 24px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.4)}' +
      '#atlic .i{width:56px;height:56px;border-radius:50%;background:#F3ECFB;color:#8A12D6;display:grid;place-items:center;margin:0 auto 14px}' +
      '#atlic h2{margin:0 0 8px;font-size:21px}#atlic p{margin:0 0 18px;font-size:15px;line-height:1.5;color:#5F566B}' +
      '#atlic a{display:inline-flex;align-items:center;gap:8px;background:#8A12D6;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px;font-size:15px}' +
      '#atlic small{display:block;margin-top:16px;font-size:12px;color:#8a8196}';
    document.head.appendChild(css);
    box = document.createElement('div');
    box.id = 'atlic';
    var lock = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
    var msg = encodeURIComponent(txt('Hola, quiero reactivar mi sistema', 'Olá, quero reativar meu sistema') + (name ? ' (' + name + ')' : ''));
    box.innerHTML = publico
      ? '<div class="c"><div class="i">' + lock + '</div><h2>' + txt('No disponible por el momento', 'Indisponível no momento') + '</h2><p>' + txt('Este sistema está temporalmente fuera de servicio. Volvé a intentar más tarde.', 'Este sistema está temporariamente fora do ar. Tente novamente mais tarde.') + '</p><small>Araújo Tech Sistemas</small></div>'
      : '<div class="c"><div class="i">' + lock + '</div><h2>' + txt('Sistema suspendido', 'Sistema suspenso') + '</h2><p>' + txt('El acceso está pausado por falta de pago. Para reactivarlo, comunicate con Araújo Tech. Tus datos están guardados.', 'O acesso está pausado por falta de pagamento. Para reativar, fale com a Araújo Tech. Seus dados estão guardados.') + '</p><a href="https://wa.me/' + WA + '?text=' + msg + '" target="_blank" rel="noopener">WhatsApp 0982 086 171</a><small>Araújo Tech Sistemas</small></div>';
    (document.body || document.documentElement).appendChild(box);
    try { document.documentElement.style.overflow = 'hidden'; } catch (e) {}
  }
  function hide() {
    if (!box) return;
    box.remove(); box = null;
    try { document.documentElement.style.overflow = ''; } catch (e) {}
  }
  function apply(st, name) { if (st === 'suspenso') show(name); else hide(); }

  // estado guardado: bloqueia mesmo sem internet
  try { var c = JSON.parse(localStorage.getItem(CK) || 'null'); if (c && c.s) apply(c.s, c.n); } catch (e) {}

  function check() {
    fetch(URL, { cache: 'no-store' }).then(function (r) {
      if (r.status === 404) return { fields: {} };
      return r.ok ? r.json() : null;
    }).then(function (d) {
      if (!d) return;
      var f = d.fields || {};
      var st = f.status && f.status.stringValue || 'activo';
      var nm = f.name && f.name.stringValue || '';
      try { localStorage.setItem(CK, JSON.stringify({ s: st, n: nm, t: Date.now() })); } catch (e) {}
      apply(st, nm);
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check); else check();
  setInterval(check, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
})();
