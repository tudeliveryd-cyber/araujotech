<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Página de cada negócio na Guía Vitrix: /guia/<negocio>. Só negócios publicados na Guía (Panel Araújo Tech).
// Tudo vem do catálogo público (nome, horário, endereço, WhatsApp, produtos em destaque). Pronta para o Google e para compartilhar.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
require __DIR__ . '/../sitio/prods_lib.php';
require __DIR__ . '/../sitio/guia_lib.php';
$id = strtolower((string)($_GET['id'] ?? ''));
$c = null;
if (preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $id)) foreach (guia_clients() as $x) if ($x['id'] === $id) { $c = $x; break; }
$sh = $c ? at_shop_cfg($id) : null;
if (!$c || !$sh || ($sh['status'] ?? '') === 'suspenso') { http_response_code(404); header('Location: /guia/', true, 302); exit; }
$cfg = $sh['cfg']; $st = $cfg['store'] ?? [];
$e = function ($x) { return htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8'); };
$tx = function ($v) { if (is_array($v)) return trim((string)($v['es'] ?? $v['pt'] ?? '')); return trim((string)$v); };
$name = $c['name'] ?: $tx($st['name'] ?? $id);
$slogan = $tx($st['slogan'] ?? '');
$seg = $c['segEs']; $city = $c['city'];
$catUrl = preg_match('#^https://[^\s"\'<>]+$#', $c['url']) ? $c['url'] : 'https://' . $id . '.araujotechsistemas.com/';
$logo = preg_match('#^https://[^\s"\'<>]+$#', $c['logo']) ? (preg_match('#/logo\.php$#', $c['logo']) ? $c['logo'] . '?v=2' : $c['logo']) : '';
$pimg = function ($ref) use ($id) { return preg_match('/^m:([a-z0-9]{2,24})$/', (string)$ref, $m) ? '/sitio/pimg.php?s=' . rawurlencode($id) . '&k=' . $m[1] : ''; };
$cover = $pimg($st['cover'] ?? '');
// produtos em destaque (com foto)
$prods = []; $hid = [];
foreach (($cfg['cats'] ?? []) as $k) if (!empty($k['hide'])) $hid[$k['id'] ?? ''] = 1;
foreach (($cfg['products'] ?? []) as $i => $p) {
  if (!is_array($p) || ($p['on'] ?? true) === false || isset($hid[$p['cat'] ?? ''])) continue;
  $im = $pimg($p['photo'] ?? ''); if (!$im) continue;
  $pr = +($p['price'] ?? 0); $pm = +($p['promo'] ?? 0); $isP = $pm > 0 && ($pr <= 0 || $pm < $pr);
  $prods[] = ['s' => (!empty($p['feat']) ? 100 : 0) + ($isP ? 10 : 0) - $i * 0.01, 'id' => (string)($p['id'] ?? ''), 'n' => $tx($p['n'] ?? ''), 'pr' => $pr, 'pm' => $isP ? $pm : 0, 'img' => $im];
}
usort($prods, function ($a, $b) { return $b['s'] <=> $a['s']; }); $prods = array_slice(array_filter($prods, function ($p) { return $p['n'] !== ''; }), 0, 6);
if (!$cover && $prods) $cover = $prods[0]['img'];
$usd = ($st['cur'] ?? '') === 'USD';
$money = function ($v) use ($usd) { return $usd ? 'US$ ' . number_format($v, 2, ',', '.') : 'Gs. ' . number_format($v, 0, ',', '.'); };
// horário
$days = is_array($st['days'] ?? null) && count($st['days']) === 7 ? $st['days'] : null;
$tz = new DateTimeZone('America/Asuncion'); $now = new DateTime('now', $tz); $wd = (int)$now->format('w'); $nm = (int)$now->format('G') * 60 + (int)$now->format('i');
$toM = function ($h) { return preg_match('/^(\d{1,2}):(\d{2})$/', (string)$h, $m) ? (int)$m[1] * 60 + (int)$m[2] : null; };
$ivs = function ($d) use ($toM) { $o = []; if (!is_array($d) || ($d['on'] ?? true) === false) return $o; foreach (['a', 'b'] as $k) { $r = $d[$k] ?? null; if (is_array($r) && $toM($r[0] ?? '') !== null && $toM($r[1] ?? '') !== null) { $a = $toM($r[0]); $b = $toM($r[1]); if ($b <= $a) $b += 1440; $o[] = [$a, $b, $r[0], $r[1]]; } } return $o; };
$open = null;
if ($days && empty($st['paused'])) {
  $open = ['on' => false];
  foreach ($ivs($days[$wd]) as $v) if ($nm >= $v[0] && $nm < $v[1]) $open = ['on' => true, 'until' => $v[3]];
  if (!$open['on']) foreach ($ivs($days[($wd + 6) % 7]) as $v) if ($v[1] > 1440 && $nm < $v[1] - 1440) $open = ['on' => true, 'until' => $v[3]];
}
$DN = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; $DP = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']; $SCH = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
$addr = trim(preg_replace('/^[\s—-]+/u', '', (string)($st['address'] ?? ''))); $loc = guia_loc($id, $sh); $lat = $loc['lat'] ?? null; $lng = $loc['lng'] ?? null; $hasGeo = (bool)$loc;
$mapQ = $hasGeo ? $lat . ',' . $lng : trim($name . ', ' . ($addr ?: ($city ?: 'Santa Rita')) . (stripos($addr, 'Santa Rita') === false && stripos($addr, $city ?: 'zz') === false ? ', ' . ($city ?: 'Santa Rita') : '')) . (stripos($addr, 'Alto Paran') === false ? ', Alto Paraná' : '') . ', Paraguay';
// sempre com o país: sem ele, 'Fogão Mineiro, Centro' caía num restaurante de Juiz de Fora (Brasil)
$mapUrl = 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($mapQ);
$wa = preg_replace('/\D/', '', (string)($st['whatsapp'] ?? '')); if ($wa && $wa[0] === '0') $wa = '595' . substr($wa, 1); elseif ($wa && strpos($wa, '595') !== 0 && strlen($wa) <= 10) $wa = '595' . $wa;
$waUrl = $wa ? 'https://wa.me/' . $wa . '?text=' . rawurlencode('Hola ' . $name . ', te encontré en la Guía Vitrix') : '';
$url = 'https://araujotechsistemas.com/guia/' . $id;
$desc = ($slogan ?: ($seg ?: 'Negocio')) . ' en ' . ($city ?: 'Santa Rita') . '. Mirá el catálogo, horarios y ubicación, y pedí por WhatsApp.';
$img = $cover ? 'https://araujotechsistemas.com' . $cover : ($logo ?: 'https://araujotechsistemas.com/img/vitrix/og.jpg');
// dados estruturados
$ld = ['@context' => 'https://schema.org', '@type' => 'LocalBusiness', 'name' => $name, 'url' => $url, 'image' => $img, 'description' => $desc];
if ($wa) $ld['telephone'] = '+' . $wa;
if ($addr || $city) $ld['address'] = array_filter(['@type' => 'PostalAddress', 'streetAddress' => $addr, 'addressLocality' => $city ?: 'Santa Rita', 'addressRegion' => 'Alto Paraná', 'addressCountry' => 'PY']);
if ($hasGeo) $ld['geo'] = ['@type' => 'GeoCoordinates', 'latitude' => +$lat, 'longitude' => +$lng];
if ($days) { $oh = []; foreach ($days as $i => $d) foreach ($ivs($d) as $v) $oh[] = ['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => 'https://schema.org/' . ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][$i], 'opens' => $v[2], 'closes' => $v[3]]; if ($oh) $ld['openingHoursSpecification'] = $oh; }
$ld['sameAs'] = [$catUrl];
$ic = function ($p, $s = 20) { return '<svg aria-hidden="true" width="' . $s . '" height="' . $s . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' . $p . '</svg>'; };
$I = ['back' => '<path d="M15 5l-7 7 7 7"/>', 'cat' => '<path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/>', 'wa' => '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2z"/>', 'pin' => '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 'share' => '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4"/>', 'clock' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 'bike' => '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8M10 9l2 4h4"/>', 'seal' => '<path d="M12 2.5l2.4 1.8 3 .1.9 2.8 2.4 1.8-.9 2.9.9 2.8-2.4 1.8-.9 2.8-3 .1L12 21.5l-2.4-1.8-3-.1-.9-2.8-2.4-1.8.9-2.8-.9-2.9 2.4-1.8.9-2.8 3-.1z"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>', 'store' => '<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM9 20v-6h6v6"/>'];
$ini = function ($n) { $w = preg_split('/\s+/', trim($n)); $o = ''; foreach (array_slice($w, 0, 2) as $x) $o .= mb_strtoupper(mb_substr($x, 0, 1)); return $o; };
?><!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?= $e($name) ?> · <?= $e($seg ?: 'Santa Rita') ?> | Guía Vitrix</title>
<meta name="description" content="<?= $e($desc) ?>">
<link rel="canonical" href="<?= $e($url) ?>">
<meta property="og:type" content="business.business"><meta property="og:title" content="<?= $e($name) ?> · Guía Vitrix"><meta property="og:description" content="<?= $e($desc) ?>"><meta property="og:url" content="<?= $e($url) ?>"><meta property="og:image" content="<?= $e($img) ?>"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/vitrix/vitrix-icono.png?v=4"><link rel="manifest" href="/guia/manifest.webmanifest"><link rel="apple-touch-icon" href="/guia/icon-180.png"><meta name="theme-color" content="#24093F">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
<script type="application/ld+json"><?= str_replace('</', '<\/', json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) ?></script>
<style>
:root{--purple:#8A12D6;--deep:#4A0A80;--night:#24093F;--lilac:#F3ECFB;--ink:#1A1222;--muted:#5F566B;--line:#E4DAF0;--yellow:#FFC21A;--display:"Red Hat Display",system-ui,sans-serif;--text:"Red Hat Text",system-ui,sans-serif}
*{box-sizing:border-box;margin:0}body{font-family:var(--text);color:var(--ink);background:#FBF8FE;line-height:1.5}a{color:inherit}
.wrap{max-width:980px;margin:0 auto;padding:0 20px}
.hdr{background:var(--night);color:#fff}.nav{display:flex;align-items:center;gap:14px;height:64px}
.bk{display:inline-flex;align-items:center;gap:6px;text-decoration:none;font-weight:700;font-size:14px;padding:7px 12px 7px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.35)}
.nav img{height:30px;width:auto;display:block}.nav .sp{flex:1}
.hero{position:relative;background:var(--night);color:#fff;overflow:hidden}
.hero .cv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.45}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(36,9,63,.35),rgba(36,9,63,.92))}
.hero .wrap{position:relative;z-index:1;padding-top:56px;padding-bottom:34px;display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap}
.lg{width:104px;height:104px;border-radius:24px;background:#fff;overflow:hidden;display:grid;place-items:center;flex:none;box-shadow:0 14px 30px -12px rgba(0,0,0,.6)}.lg img{width:100%;height:100%;object-fit:cover}.lg b{font-family:var(--display);font-size:36px;color:var(--purple)}
.ht{flex:1;min-width:240px}.ht h1{font-family:var(--display);font-weight:900;font-size:clamp(30px,5vw,46px);line-height:1.05}
.ht p{color:#E3D3FA;margin-top:6px;font-size:16px}
.bdg{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.bd{font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px;display:inline-flex;align-items:center;gap:5px}
.bd.on{background:#E7F7EE;color:#11845A}.bd.off{background:#F1EEF4;color:var(--muted)}.bd.dl{background:rgba(255,255,255,.14);color:#fff}.bd.st{background:var(--yellow);color:#3D2600}
.acts{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0 8px}
.btn{display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:700;font-size:15.5px;text-decoration:none;padding:13px 18px;border-radius:14px;border:1px solid var(--line);background:#fff;color:var(--deep);cursor:pointer}
.btn.pri{background:var(--yellow);border-color:var(--yellow);color:var(--night)}.btn.wa{background:#16A34A;border-color:#16A34A;color:#fff}
.sec{margin:28px 0}.sec h2{font-family:var(--display);font-weight:900;font-size:22px;margin-bottom:12px;display:flex;gap:10px;align-items:center}.sec h2 svg{color:var(--purple)}
.box{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px}
.hrs{display:grid;gap:4px}.hrs div{display:flex;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:10px;font-size:15px}.hrs div.td{background:var(--lilac);font-weight:700}.hrs span:first-child{white-space:nowrap}.hrs span:last-child{color:var(--muted);text-align:right}.hrs div.td span:last-child{color:var(--deep)}
.map{width:100%;height:280px;border:0;border-radius:14px;display:block;margin-top:12px;background:var(--lilac)}
.pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.pr{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column}.pr img{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:var(--lilac)}
.pr span{padding:10px 12px;display:flex;flex-direction:column;gap:2px}.pr b{font-size:14px;line-height:1.25}.pr i{font-style:normal;font-weight:800;color:#C2410C}.pr s{font-size:12.5px;color:var(--muted)}
.cta{margin:34px 0 46px;border-radius:22px;padding:24px;background:linear-gradient(120deg,var(--deep),var(--purple));color:#fff;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.cta b{font-family:var(--display);font-size:22px}.cta p{color:#EBDDFB;font-size:15px}.cta a{background:#fff;color:var(--deep);text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px}
footer{padding:22px 0 36px;text-align:center;color:var(--muted);font-size:14px;border-top:1px solid var(--line)}footer a{color:var(--deep);font-weight:700;text-decoration:none}
@media (min-width:760px){/* computador: tudo centralizado numa coluna */
.hero .wrap{flex-direction:column;align-items:center;text-align:center;padding-top:64px;padding-bottom:40px}.ht{flex:none;min-width:0}.bdg{justify-content:center}
.acts{justify-content:center}.sec{max-width:760px;margin-left:auto;margin-right:auto}.sec h2{justify-content:center}
.sec .hrs{max-width:520px;margin:0 auto}.sec .box>p{text-align:center}.pg{justify-content:center;grid-template-columns:repeat(auto-fit,minmax(150px,180px))}
.cta{max-width:760px;margin-left:auto;margin-right:auto}}
@media (max-width:420px){.hrs div{font-size:13.5px;padding:7px 8px}.hrs span:last-child{white-space:nowrap}}
@media (max-width:600px){.lg{width:82px;height:82px;border-radius:20px}.btn{flex:1 1 auto;justify-content:center}.bk span{display:none}.bk{padding:7px}}
</style></head>
<body>
<header class="hdr"><div class="wrap nav"><a class="bk" href="/guia/" aria-label="Volver a la Guía"><?= $ic($I['back'], 18) ?><span>Guía Vitrix</span></a><span class="sp"></span><a href="/guia/" aria-label="Guía Vitrix"><img src="/img/vitrix/vitrix-blanco-nombre.png" alt="Vitrix"></a></div></header>
<section class="hero"><?php if ($cover): ?><img class="cv" src="<?= $e($cover) ?>" alt="" onerror="this.remove()"><?php endif; ?>
<div class="wrap">
<span class="lg"><?php if ($logo): ?><img src="<?= $e($logo) ?>" alt="Logo de <?= $e($name) ?>"><?php else: ?><b><?= $e($ini($name)) ?></b><?php endif; ?></span>
<div class="ht"><h1><?= $e($name) ?></h1><p><?= $e(implode(' · ', array_filter([$slogan ?: $seg, $city]))) ?></p>
<div class="bdg"><?php if ($c['dest']): ?><span class="bd st"><?= $ic($I['seal'], 13) ?><span data-pt="Recomendado">Recomendado</span></span><?php endif; ?><?php if ($open): ?><span class="bd <?= $open['on'] ? 'on' : 'off' ?>"><span data-pt="<?= $open['on'] ? 'Aberto agora' . (!empty($open['until']) ? ' · até as ' . $e($open['until']) : '') : 'Fechado agora' ?>"><?= $open['on'] ? 'Abierto ahora' . (!empty($open['until']) ? ' · hasta las ' . $e($open['until']) : '') : 'Cerrado ahora' ?></span></span><?php endif; ?><?php if (!empty($st['delivery'])): ?><span class="bd dl"><?= $ic($I['bike'], 13) ?>Delivery</span><?php endif; ?><?php if (!empty($st['pickup'])): ?><span class="bd dl"><?= $ic($I['store'], 13) ?><span data-pt="Retirada">Retiro</span></span><?php endif; ?></div></div>
</div></section>
<main class="wrap">
<div class="acts">
<a class="btn pri" href="<?= $e($catUrl) ?>"><?= $ic($I['cat']) ?><span data-pt="Ver catálogo e pedir">Ver catálogo y pedir</span></a>
<?php if ($waUrl): ?><a class="btn wa" href="<?= $e($waUrl) ?>" target="_blank" rel="noopener"><?= $ic($I['wa']) ?>WhatsApp</a><?php endif; ?>
<a class="btn" href="<?= $e($mapUrl) ?>" target="_blank" rel="noopener"><?= $ic($I['pin']) ?><span data-pt="Como chegar">Cómo llegar</span></a>
<button class="btn" type="button" id="sh"><?= $ic($I['share']) ?><span data-pt="Compartilhar">Compartir</span></button>
</div>
<?php if ($prods): ?><section class="sec"><h2><?= $ic($I['cat'], 22) ?><span data-pt="Produtos em destaque">Productos destacados</span></h2><div class="pg">
<?php foreach ($prods as $p): ?><a class="pr" href="<?= $e($catUrl . ($p['id'] !== '' ? '?p=' . rawurlencode($p['id']) : '')) ?>"><img src="<?= $e($p['img']) ?>" alt="<?= $e($p['n']) ?>" loading="lazy" onerror="this.style.visibility='hidden'"><span><b><?= $e($p['n']) ?></b><?php if ($p['pm']): ?><i><?= $e($money($p['pm'])) ?></i><?php if ($p['pr'] > 0): ?><s><?= $e($money($p['pr'])) ?></s><?php endif; ?><?php elseif ($p['pr'] > 0): ?><i><?= $e($money($p['pr'])) ?></i><?php endif; ?></span></a>
<?php endforeach; ?></div></section><?php endif; ?>
<?php if ($days): ?><section class="sec"><h2><?= $ic($I['clock'], 22) ?><span data-pt="Horários">Horarios</span></h2><div class="box hrs">
<?php foreach ([1, 2, 3, 4, 5, 6, 0] as $i): $v = $ivs($days[$i]); ?><div class="<?= $i === $wd ? 'td' : '' ?>"><span data-pt="<?= $DP[$i] ?><?= $i === $wd ? ' · hoje' : '' ?>"><?= $DN[$i] ?><?= $i === $wd ? ' · hoy' : '' ?></span><span<?= $v ? '' : ' data-pt="Fechado"' ?>><?= $v ? $e(implode(' · ', array_map(function ($x) { return $x[2] . '–' . $x[3]; }, $v))) : 'Cerrado' ?></span></div>
<?php endforeach; ?></div></section><?php endif; ?>
<section class="sec"><h2><?= $ic($I['pin'], 22) ?><span data-pt="Localização">Ubicación</span></h2><div class="box"><p><?= $e($addr ?: ($city ?: 'Santa Rita') . ', Alto Paraná') ?></p>
<iframe class="map" title="Mapa de <?= $e($name) ?>" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=<?= rawurlencode($mapQ) ?>&amp;z=<?= $hasGeo ? 16 : 15 ?>&amp;output=embed"></iframe>
<p style="margin-top:10px"><a class="btn" href="<?= $e($mapUrl) ?>" target="_blank" rel="noopener"><?= $ic($I['pin']) ?><span data-pt="Abrir no Google Maps">Abrir en Google Maps</span></a></p></div></section>
<section class="cta"><div><b data-pt="Mais negócios de Santa Rita">Más negocios de Santa Rita</b><p data-pt="Ofertas, farmácia de plantão, ônibus e tudo o que é útil na cidade.">Ofertas, farmacia de turno, ómnibus y todo lo útil de la ciudad.</p></div><a href="/guia/" data-pt="Abrir a Guia Vitrix">Abrir la Guía Vitrix</a></section>
</main>
<footer><div class="wrap"><span data-pt="Guia Vitrix · Uma iniciativa de">Guía Vitrix · Una iniciativa de</span> <a href="/">Araújo Tech Sistemas</a> <span data-pt="e">y</span> Tu Delivery</div></footer>
<script>try{if(localStorage.getItem('at_lang')==='pt'){document.documentElement.lang='pt';document.querySelectorAll('[data-pt]').forEach(function(e){e.textContent=e.getAttribute('data-pt')})}}catch(e){}</script>
<script>
document.getElementById('sh').addEventListener('click',function(){var u=<?= json_encode($url) ?>,t=<?= json_encode($name . ' · Guía Vitrix') ?>;if(navigator.share){navigator.share({title:t,url:u}).catch(function(){})}else{window.open('https://wa.me/?text='+encodeURIComponent(t+' '+u),'_blank','noopener')}});
try{if(!navigator.webdriver){var u='/sitio/guia_hit.php?t=c&id=<?= rawurlencode($id) ?>';if(navigator.sendBeacon)navigator.sendBeacon(u);else fetch(u,{method:'POST',keepalive:true})}}catch(e){}
</script>
</body></html>
