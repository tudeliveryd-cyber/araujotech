<?php
@ini_set('display_errors', '0'); error_reporting(0);
// 25/11 (Jean): "link para o Instagram" de cada negócio da Guía: guiadesantarita.com/l/<nome>.
// Uma página só do negócio (logo, WhatsApp, ligar, como chegar, Instagram, menu, horários), para pôr na bio do Instagram dele.
// Usa os mesmos dados da ficha da Guía (guia_item); se o negócio sair da Guía, a página avisa e manda para a Guía.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
require __DIR__ . '/../sitio/prods_lib.php';
require __DIR__ . '/../sitio/guia_lib.php';
$id = (string)($_GET['id'] ?? '');
$x = preg_match('/^[a-z0-9-]{2,90}$/', $id) ? guia_item('negocio', $id) : null;
$e = function ($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); };
$G = 'https://guiadesantarita.com/';
$wa = function ($n) { $n = preg_replace('/\D/', '', (string)$n); if ($n !== '' && $n[0] === '0') $n = '595' . substr($n, 1); elseif ($n !== '' && strpos($n, '595') !== 0 && strlen($n) <= 10) $n = '595' . $n; return $n; };
$safe = function ($u) { return preg_match('#^https://[^\s"\'<>]+$#i', (string)$u) ? (string)$u : ''; };
if (!$x) {
  http_response_code(404);
  echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guía de Santa Rita</title><meta name="robots" content="noindex"><style>body{font-family:system-ui,sans-serif;background:#24093F;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px}a{color:#FFC21A;font-weight:700}</style></head><body><p>Este enlace ya no está disponible.<br><br><a href="' . $G . '">Ver la Guía de Santa Rita</a></p></body></html>';
  exit;
}
$n = (string)$x['n']; $d = trim((string)($x['dx'] ?? '') ?: (string)($x['d'] ?? '')); $self = $G . 'l/' . rawurlencode($id); $ficha = $G . 'negocio/' . rawurlencode($id);
$lg = (string)($x['lg'] ?? ''); $lgU = $lg !== '' ? (preg_match('#^https?://#', $lg) ? $lg : 'https://guiadesantarita.com' . $lg) : '';
$w = $wa($x['wa'] ?? '') ?: (preg_match('/^(\+?595|0)?9\d{8}$/', preg_replace('/\D/', '', (string)($x['tel'] ?? ''))) ? $wa($x['tel']) : '');
$tel = preg_replace('/[^\d+]/', '', (string)($x['tel'] ?? ''));
$map = $safe($x['map'] ?? '') ?: 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($n . ' Santa Rita, Alto Paraná, Paraguay');
$ig = trim((string)($x['ig'] ?? '')); $igU = $ig === '' ? '' : (preg_match('#^https://#', $ig) ? $safe($ig) : 'https://instagram.com/' . rawurlencode(ltrim($ig, '@')));
$mu = $safe($x['mu'] ?? '');
$dy = (is_array($x['dy'] ?? null) && count($x['dy']) === 7) ? array_values($x['dy']) : null;
$hrs = trim((string)($x['hrs'] ?? ''));
// 25/11 (Jean): o próprio cliente personaliza o link no painel dele (Mi cuenta): botões e ordem, serviços, cor e "cerrado hasta"
$web = $safe($x['web'] ?? '');
$sv = array_values(array_filter((array)($x['sv'] ?? []), 'is_array'));
$cz = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($x['cz'] ?? '')) ? (string)$x['cz'] : '';
$COR = ['pur' => ['#24093F', '#8A12D6', '#4A0A80'], 'azu' => ['#0A1E3F', '#1F6FD1', '#123D7A'], 'ver' => ['#062B22', '#169B62', '#0B5A3E'], 'roj' => ['#2E0710', '#D12A3F', '#7A1424'], 'nar' => ['#2E1405', '#E8711A', '#8A3B0B'], 'neg' => ['#121014', '#55525C', '#2A272F']];
$C = $COR[$x['cor'] ?? ''] ?? $COR['pur'];
$TR = []; foreach ([$d, $hrs] as $tt) if (($tp = guia_tr($tt)) !== '') $TR[$tt] = $tp; // português automático
$DN = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
$rows = [];
if ($dy) foreach ([1, 2, 3, 4, 5, 6, 0] as $k) { $o = $dy[$k]; $r = [];
  if (!empty($o['on'])) foreach (['a', 'b'] as $s) { $p = $o[$s] ?? []; if (!empty($p[0]) && !empty($p[1])) $r[] = $p[0] === $p[1] ? '24 horas' : $p[0] . '–' . $p[1]; }
  $rows[] = [$k, $DN[$k], $r ? implode(' · ', $r) : 'Cerrado']; }
$desc = $d !== '' ? $n . ' · ' . $d . ' · Santa Rita' : $n . ' · Santa Rita';
$ic = function ($p) { return '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' . $p . '</svg>'; };
$I = ['wa' => '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2z"/>', 'tel' => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>', 'map' => '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 'ig' => '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/>', 'mu' => '<path d="M4 5h16M4 12h16M4 19h10"/>', 'sh' => '<path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>', 'gu' => '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><path d="M9 10h6"/>', 'clk' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 'web' => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'];
$msg = 'Hola, te encontré en la Guía de Santa Rita y quiero más información.';
// 25/11 (Jean): link "top" (melhor que os links grátis), mas sem catálogo: catálogo com fotos e pedidos é o Vitrix
$I += ['ok' => '<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'pin' => '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 'ct' => '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="M19 3v4M17 5h4"/>', 'sv' => '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>', 'go' => '<path d="M7 17 17 7M9 7h8v8"/>', 'st' => '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9v11h16V9"/><path d="M10 20v-5h4v5"/>'];
$NG = ['food' => 'Comida y bebidas', 'shop' => 'Tiendas y moda', 'health' => 'Salud y belleza', 'home' => 'Hogar y construcción', 'car' => 'Autos, motos y náutica', 'serv' => 'Servicios'];
foreach (guia_cat(guia_doc()['gcat'] ?? [])['neg'] as $cg) { if ($cg['n']['es'] !== '') $NG[$cg['k']] = $cg['n']['es']; foreach ($cg['tabs'] as $ct) if ($ct['n']['es'] !== '' && $ct['k'] === ($x['sub'] ?? '')) $NG['_sub'] = $ct['n']['es']; }
$kind = $NG['_sub'] ?? ($NG[$x['g'] ?? ''] ?? '');
if ($kind !== '' && ($tp = guia_tr($kind)) !== '') $TR[$kind] = $tp;
$addr = trim((string)($x['a'] ?? ''));
$ini = mb_strtoupper(mb_substr(preg_replace('/^(dr|dra|lic|ing)\.?\s+/i', '', $n), 0, 1));
?><!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?= $e($n) ?> · Guía de Santa Rita</title>
<meta name="description" content="<?= $e($desc) ?>">
<link rel="canonical" href="<?= $e($ficha) ?>">
<meta property="og:type" content="profile"><meta property="og:title" content="<?= $e($n) ?>"><meta property="og:description" content="<?= $e($desc) ?>"><meta property="og:url" content="<?= $e($self) ?>"><meta property="og:image" content="<?= $e($lgU ?: 'https://araujotechsistemas.com/img/guia/og-guia.jpg?v=3') ?>">
<link rel="icon" href="<?= $e($lgU ?: '/img/guia/favicon.png?v=4') ?>"><meta name="theme-color" content="<?= $C[0] ?>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--night:<?= $C[0] ?>;--deep:<?= $C[2] ?>;--purple:<?= $C[1] ?>;--yellow:#FFC21A;--ok:#16A34A;--line:rgba(255,255,255,.14);--glass:rgba(255,255,255,.07);--mist:#D9C9F2;--display:"Red Hat Display",system-ui,sans-serif;--text:"Red Hat Text",system-ui,sans-serif}
*{box-sizing:border-box;margin:0}
html{background:var(--night)}
body{font-family:var(--text);color:#fff;min-height:100vh;line-height:1.45;background:radial-gradient(640px 420px at 50% -120px,color-mix(in srgb,var(--purple) 85%,transparent),transparent 72%),radial-gradient(480px 480px at -10% 110%,color-mix(in srgb,var(--deep) 80%,transparent),transparent 70%),var(--night);-webkit-font-smoothing:antialiased}
.w{max-width:460px;margin:0 auto;padding:max(58px,calc(env(safe-area-inset-top) + 50px)) 18px 30px;position:relative}
.lng{position:absolute;top:max(14px,env(safe-area-inset-top));right:16px;display:flex;gap:2px;padding:3px;border-radius:999px;background:var(--glass);border:1px solid var(--line)}
.lng button{font:inherit;font-size:12.5px;font-weight:700;color:var(--mist);background:none;border:0;padding:6px 11px;border-radius:999px;cursor:pointer;min-width:40px}
.lng button[aria-pressed="true"]{background:#fff;color:var(--night)}.lng button:focus-visible{outline:2px solid var(--yellow);outline-offset:1px}
.hero{display:flex;flex-direction:column;align-items:center;text-align:center}
.lgw{position:relative}
.lg{width:116px;height:116px;border-radius:32px;background:#fff;overflow:hidden;display:grid;place-items:center;box-shadow:0 0 0 4px rgba(255,255,255,.95),0 0 0 10px rgba(255,255,255,.08),0 24px 60px rgba(0,0,0,.5)}
.lg img{width:100%;height:100%;object-fit:cover;display:block}
.lg b{font-family:var(--display);font-weight:900;font-size:48px;color:var(--deep)}
.vf{position:absolute;right:-8px;bottom:-8px;width:34px;height:34px;border-radius:50%;background:var(--yellow);color:var(--night);display:grid;place-items:center;box-shadow:0 0 0 4px var(--night)}
.vf svg{width:18px;height:18px}
h1{font-family:var(--display);font-weight:900;font-size:29px;line-height:1.1;letter-spacing:-.4px;margin-top:22px;text-wrap:balance}
.kd{margin-top:6px;color:var(--yellow);font-weight:700;font-size:13.5px;letter-spacing:.3px}
.d{color:var(--mist);font-size:15.5px;margin-top:8px;max-width:36ch;white-space:pre-line}
.chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:14px}
.st,.chip{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:700;padding:7px 12px;border-radius:999px;background:var(--glass);border:1px solid var(--line)}
.chip svg{width:15px;height:15px;color:var(--yellow)}
.st i{width:8px;height:8px;border-radius:50%;background:#9CA3AF}.st.on{background:rgba(22,163,74,.2);border-color:rgba(74,222,128,.35)}.st.on i{background:#4ADE80;box-shadow:0 0 0 4px rgba(74,222,128,.2)}
.st.cz{background:rgba(239,68,68,.18);border-color:rgba(248,113,113,.35)}.st.cz i{background:#F87171}
.cta{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin-top:26px;padding:17px 18px;border-radius:18px;background:var(--ok);color:#fff;text-decoration:none;font-weight:700;font-size:17px;box-shadow:0 14px 34px -12px rgba(22,163,74,.75)}
.cta.alt{background:#fff;color:var(--night);box-shadow:0 14px 34px -14px rgba(0,0,0,.6)}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.tl{display:flex;align-items:center;gap:11px;padding:14px;border-radius:16px;background:var(--glass);border:1px solid var(--line);color:#fff;text-decoration:none;font-weight:700;font-size:15px;font-family:inherit;cursor:pointer;text-align:left;min-height:58px}
.tl i{flex:none;width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.1);display:grid;place-items:center;color:var(--yellow)}
.tl i svg{width:19px;height:19px}
.tl:last-child:nth-child(odd){grid-column:1/-1}
.cta:focus-visible,.tl:focus-visible,.gu:focus-visible,.ft a:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
.card{margin-top:14px;padding:16px 18px;border-radius:20px;background:var(--glass);border:1px solid var(--line)}
.card h2{display:flex;align-items:center;gap:9px;font-family:var(--display);font-size:16px;font-weight:900;margin-bottom:8px}
.card h2 svg{width:19px;height:19px;color:var(--yellow)}
.sv{list-style:none;padding:0}.sv li{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:10px 0;border-top:1px solid var(--line);font-size:15px}.sv li:first-child{border-top:0;padding-top:4px}
.sv b{white-space:nowrap;color:var(--yellow);font-weight:700}
.card table{width:100%;border-collapse:collapse;font-size:14.5px}.card td{padding:5px 0;color:var(--mist)}.card td:last-child{text-align:right;color:#fff;font-weight:700}
.card tr.hoy td{color:var(--yellow)}
.card p{color:var(--mist);font-size:14.5px}
.ad{display:flex;align-items:center;justify-content:space-between;gap:12px}
.ad a{flex:none;color:var(--yellow);font-weight:700;font-size:14px;text-decoration:none;display:inline-flex;align-items:center;gap:4px}
.ad a svg{width:16px;height:16px}
.gu{display:flex;align-items:center;gap:12px;margin-top:14px;padding:14px 16px;border-radius:20px;background:#fff;color:var(--night);text-decoration:none}
.gu img{height:30px;width:auto}
.gu span{flex:1;font-size:14px;line-height:1.3}.gu b{display:block;font-size:15px}
.gu svg{width:20px;height:20px;color:var(--deep)}
.ft{margin-top:24px;text-align:center;font-size:13px;color:#BFA9E6}
.ft a{color:#fff;font-weight:700;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.35)}
.tst{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#fff;color:var(--night);font-weight:700;padding:10px 16px;border-radius:999px;display:none;box-shadow:0 10px 30px rgba(0,0,0,.4)}
@media (prefers-reduced-motion:no-preference){.hero,.cta,.tiles,.card,.gu{animation:up .5s ease-out both}.cta{animation-delay:.06s}.tiles{animation-delay:.1s}.card,.gu{animation-delay:.14s}@keyframes up{from{opacity:0;transform:translateY(10px)}}}
</style></head><body>
<main class="w">
 <div class="lng" role="group" aria-label="Idioma"><button type="button" data-l="es" aria-pressed="true">ES</button><button type="button" data-l="pt" aria-pressed="false">PT</button></div>
 <header class="hero">
  <div class="lgw"><div class="lg"><?= $lgU ? '<img src="' . $e($lgU) . '" alt="Logo de ' . $e($n) . '">' : '<b>' . $e($ini) . '</b>' ?></div><span class="vf" title="En la Guía de Santa Rita"><?= $ic($I['ok']) ?></span></div>
  <h1><?= $e($n) ?></h1>
  <?= $kind !== '' ? '<p class="kd">' . $e($kind) . '</p>' : '' ?>
  <?= $d !== '' ? '<p class="d">' . $e($d) . '</p>' : '' ?>
  <div class="chips"><span class="st" id="st" hidden><i></i><b></b></span><span class="chip"><?= $ic($I['pin']) ?><span>Santa Rita</span></span></div>
 </header>
<?php
$prim = '';
if ($w) $prim = '<a class="cta" data-c="wa" href="' . $e('https://wa.me/' . $w . '?text=' . rawurlencode($msg)) . '" target="_blank" rel="noopener">' . $ic($I['wa']) . '<span>Escribir por WhatsApp</span></a>';
elseif ($tel !== '') $prim = '<a class="cta alt" data-c="tel" href="tel:' . $e($tel) . '">' . $ic($I['tel']) . '<span>Llamar</span></a>';
echo ' ' . $prim . "\n";
$T = [];
$tl = function ($k, $href, $lab, $ext = true) use ($e, $ic, $I) { return '<a class="tl" data-c="' . $k . '" href="' . $e($href) . '"' . ($ext ? ' target="_blank" rel="noopener"' : '') . '><i>' . $ic($I[$k]) . '</i><span>' . $lab . '</span></a>'; };
if ($w && $tel !== '') $T[] = $tl('tel', 'tel:' . $tel, 'Llamar', false);
$T[] = $tl('map', $map, 'Cómo llegar');
if ($mu) $T[] = $tl('mu', $mu, 'Ver menú');
if ($igU) $T[] = $tl('ig', $igU, 'Instagram');
if ($web) $T[] = $tl('web', $web, 'Sitio web');
if ($w || $tel !== '') $T[] = '<button class="tl" type="button" id="vc"><i>' . $ic($I['ct']) . '</i><span>Guardar contacto</span></button>';
$T[] = '<button class="tl" type="button" id="sh"><i>' . $ic($I['sh']) . '</i><span>Compartir</span></button>';
echo ' <div class="tiles">' . implode('', $T) . "</div>\n";
?>
 <?php if ($sv): ?><section class="card"><h2><?= $ic($I['sv']) ?><span>Servicios</span></h2><ul class="sv"><?php foreach ($sv as $v): ?><li><span><?= $e($v['t'] ?? '') ?></span><?= ($v['p'] ?? '') !== '' ? '<b>' . $e($v['p']) . '</b>' : '' ?></li><?php endforeach; ?></ul></section><?php endif; ?>
 <?php if ($rows || $hrs !== ''): ?><section class="card"><h2><?= $ic($I['clk']) ?><span>Horarios</span></h2><?php if ($rows): ?><table><?php foreach ($rows as [$k, $dn, $v]): ?><tr data-d="<?= $k ?>"><td><?= $e($dn) ?></td><td><?= $e($v) ?></td></tr><?php endforeach; ?></table><?php endif; ?><?= $hrs !== '' ? '<p' . ($rows ? ' style="margin-top:8px"' : '') . '>' . $e($hrs) . '</p>' : '' ?></section><?php endif; ?>
 <?php if ($addr !== ''): ?><section class="card"><h2><?= $ic($I['pin']) ?><span>Dirección</span></h2><div class="ad"><p><?= $e($addr) ?></p><a href="<?= $e($map) ?>" target="_blank" rel="noopener"><span>Abrir mapa</span><?= $ic($I['go']) ?></a></div></section><?php endif; ?>
 <a class="gu" data-c="gu" href="<?= $e($ficha) ?>"><img src="/img/guia/guia-logo.webp" alt="" width="62" height="30"><span><b>Ver en la Guía de Santa Rita</b>Opiniones, fotos y más negocios de la ciudad</span><?= $ic($I['go']) ?></a>
 <p class="ft">¿Tenés un negocio en Santa Rita? <a href="<?= $G ?>anunciar/">Quiero mi link como este</a></p>
</main>
<p class="tst" id="tst">Enlace copiado</p>
<script>
(()=>{const DY=<?= json_encode($dy, JSON_HEX_TAG | JSON_HEX_AMP) ?>,TR=<?= json_encode((object)$TR, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>,SL=<?= json_encode($id) ?>,CZ=<?= json_encode($cz) ?>,VC=<?= json_encode(['n' => $n, 't' => $w ? '+' . $w : $tel, 'u' => $self, 'a' => $addr], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;
 let L='es';const QL=new URLSearchParams(location.search).get('l');try{const s=QL==='pt'||QL==='es'?QL:localStorage.getItem('at_lang');L=s?s:(/^pt/i.test(navigator.language||'')?'pt':'es')}catch(e){L=/^pt/i.test(navigator.language||'')?'pt':'es'}
 document.querySelectorAll('.lng [data-l]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.l===L));b.addEventListener('click',()=>{if(b.dataset.l===L)return;try{localStorage.setItem('at_lang',b.dataset.l)}catch(e){}const u=new URL(location.href);u.searchParams.set('l',b.dataset.l);location.replace(u.toString())})});
 const now=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Asuncion'})),wd=now.getDay(),mn=now.getHours()*60+now.getMinutes(),toM=s=>{const m=/^(\d{1,2}):(\d{2})$/.exec(s||'');return m?+m[1]*60+ +m[2]:null};
 const hoy=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0'),st=document.getElementById('st'),mark=()=>{const tr=document.querySelector('tr[data-d="'+wd+'"]');if(tr)tr.className='hoy'};
 if(CZ&&CZ>=hoy){st.hidden=false;st.classList.add('cz');st.querySelector('b').textContent=CZ===hoy?(L==='pt'?'Fechado hoje':'Cerrado hoy'):(L==='pt'?'Fechado até ':'Cerrado hasta ')+CZ.slice(8,10)+'/'+CZ.slice(5,7);mark()}
 else if(Array.isArray(DY)&&DY.length===7){let on=false,un='';const chk=(d,off)=>{const o=DY[d];if(!o||!o.on)return;[o.a,o.b].forEach(r=>{if(!r||!r[0]||!r[1])return;const a=toM(r[0]);let b=toM(r[1]);if(a==null||b==null)return;if(b<=a)b+=1440;const n=mn+off;if(n>=a&&n<b){on=true;un=r[0]===r[1]?'':r[1]}})};chk(wd,0);if(!on)chk((wd+6)%7,1440);
  st.hidden=false;st.classList.toggle('on',on);st.querySelector('b').textContent=on?(L==='pt'?'Aberto agora':'Abierto ahora')+(un?(L==='pt'?' · até ':' · hasta ')+un:''):(L==='pt'?'Fechado agora':'Cerrado ahora');mark()}
 const beacon=q=>{try{if(!navigator.webdriver&&navigator.sendBeacon)navigator.sendBeacon('https://araujotechsistemas.com/sitio/guia_hit.php?'+q)}catch(e){}};
 beacon('t=p&id=bio');document.querySelectorAll('[data-c]').forEach(a=>a.addEventListener('click',()=>beacon('t=c&id='+encodeURIComponent(('bio-'+SL).slice(0,70)))));
 const toast=m=>{const t=document.getElementById('tst');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',1800)};
 document.getElementById('sh').addEventListener('click',async()=>{const u=location.href.split('?')[0];try{if(navigator.share){await navigator.share({title:document.title,url:u});return}}catch(e){return}try{await navigator.clipboard.writeText(u);toast(L==='pt'?'Link copiado':'Enlace copiado')}catch(e){}});
 const vc=document.getElementById('vc');if(vc)vc.addEventListener('click',()=>{const q=v=>String(v||'').replace(/[\;,]/g,m=>'\\'+m).replace(/\n/g,' ');
  const card=['BEGIN:VCARD','VERSION:3.0','FN:'+q(VC.n),'ORG:'+q(VC.n),VC.t?'TEL;TYPE=CELL:'+VC.t:'',VC.a?'ADR;TYPE=WORK:;;'+q(VC.a)+';Santa Rita;Alto Paraná;;Paraguay':'','URL:'+VC.u,'NOTE:Guía de Santa Rita','END:VCARD'].filter(Boolean).join('\r\n');
  const a=document.createElement('a');a.href='data:text/vcard;charset=utf-8,'+encodeURIComponent(card);a.download=(VC.n||'contacto').replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-')+'.vcf';document.body.appendChild(a);a.click();a.remove();beacon('t=c&id='+encodeURIComponent(('bio-'+SL).slice(0,70)))});
 if(L==='pt'){document.documentElement.lang='pt';const U={'Escribir por WhatsApp':'Escrever pelo WhatsApp','Llamar':'Ligar','Ver menú':'Ver menu','Cómo llegar':'Como chegar','Ver en la Guía de Santa Rita':'Ver no Guia de Santa Rita','Opiniones, fotos y más negocios de la ciudad':'Opiniões, fotos e mais negócios da cidade','Compartir':'Compartilhar','Guardar contacto':'Salvar contato','Sitio web':'Site','Servicios':'Serviços','Horarios':'Horários','Dirección':'Endereço','Abrir mapa':'Abrir mapa','Domingo':'Domingo','Lunes':'Segunda','Martes':'Terça','Miércoles':'Quarta','Jueves':'Quinta','Viernes':'Sexta','Sábado':'Sábado','Cerrado':'Fechado','¿Tenés un negocio en Santa Rita?':'Tem um negócio em Santa Rita?','Quiero mi link como este':'Quero meu link como este'};
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode())a.push(w.currentNode);a.forEach(n=>{const k=n.nodeValue.trim();const v=TR[k]||U[k];if(k&&v)n.nodeValue=n.nodeValue.replace(k,v)});
  document.querySelectorAll('a[href*="wa.me"]').forEach(x=>x.href=x.href.replace(/text=[^&]*/,'text='+encodeURIComponent('Olá, te encontrei no Guia de Santa Rita e quero mais informações.')))}
})();
</script>
</body></html>
