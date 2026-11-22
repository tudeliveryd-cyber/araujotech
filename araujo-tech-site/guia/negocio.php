<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Página de cada negócio na Guía de Santa Rita: /guia/<negocio>. Só negócios publicados na Guía (Panel Araújo Tech).
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
$catAbs = $catUrl;
// no domínio principal o catálogo abre em /loja/<nome>/: no iPhone, ir para o subdomínio dá "Misdirected Request" (erro da hospedagem)
if (preg_match('#^https://([a-z0-9-]+)\.araujotechsistemas\.com/?$#i', $catUrl, $cm) && !in_array(strtolower($cm[1]), ['www', 'guia'], true)) $catUrl = '/loja/' . (strtolower($cm[1]) === 'fogaomineiro' ? 'fogao-mineiro' : strtolower($cm[1])) . '/';
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
$dirUrl = 'https://www.google.com/maps/dir/?api=1&destination=' . rawurlencode($mapQ); // rota até o local (o Maps usa a localização de quem abre)
$pm = !empty($c['dest']) || !empty($c['vip']); // Premium e VIP: vitrine, vídeos e destaque visual
$vids = $pm ? guia_vids('v:' . $id) : [];
$wa = preg_replace('/\D/', '', (string)($st['whatsapp'] ?? '')); if ($wa && $wa[0] === '0') $wa = '595' . substr($wa, 1); elseif ($wa && strpos($wa, '595') !== 0 && strlen($wa) <= 10) $wa = '595' . $wa;
$waUrl = $wa ? 'https://wa.me/' . $wa . '?text=' . rawurlencode('Hola ' . $name . ', te encontré en la Guía de Santa Rita') : '';
$url = 'https://guiadesantarita.com/' . $id;
$tdv = in_array($id, (array)((guia_pub()['soc'] ?? [])->tdv ?? []), true); // selo Verificado: só quem trabalha com a Tu Delivery
$desc = ($slogan ?: ($seg ?: 'Negocio')) . ' en ' . ($city ?: 'Santa Rita') . '. Mirá el catálogo, horarios y ubicación, y pedí por WhatsApp.';
$img = $cover ? 'https://araujotechsistemas.com' . $cover : ($logo ?: 'https://araujotechsistemas.com/img/vitrix/og.jpg');
// dados estruturados
$ld = ['@context' => 'https://schema.org', '@type' => 'LocalBusiness', 'name' => $name, 'url' => $url, 'image' => $img, 'description' => $desc];
if ($wa) $ld['telephone'] = '+' . $wa;
if ($addr || $city) $ld['address'] = array_filter(['@type' => 'PostalAddress', 'streetAddress' => $addr, 'addressLocality' => $city ?: 'Santa Rita', 'addressRegion' => 'Alto Paraná', 'addressCountry' => 'PY']);
if ($hasGeo) $ld['geo'] = ['@type' => 'GeoCoordinates', 'latitude' => +$lat, 'longitude' => +$lng];
if ($days) { $oh = []; foreach ($days as $i => $d) foreach ($ivs($d) as $v) $oh[] = ['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => 'https://schema.org/' . ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][$i], 'opens' => $v[2], 'closes' => $v[3]]; if ($oh) $ld['openingHoursSpecification'] = $oh; }
$ld['sameAs'] = [$catAbs];
// opiniões dos clientes (mesmas regras do catálogo) e fotos do local (as do site padrão da empresa, quando existem)
$rv = guia_reviews($id, $sh);
if ($rv) $ld['aggregateRating'] = ['@type' => 'AggregateRating', 'ratingValue' => $rv['avg'], 'reviewCount' => $rv['n'], 'bestRating' => 5, 'worstRating' => 1];
$gal = []; $gn = max(0, min(8, (int)($sh['site']['g'] ?? 0))); $gv = preg_replace('/\D/', '', (string)($sh['site']['pv'] ?? ''));
for ($gi = 0; $gi < $gn; $gi++) $gal[] = '/sitio/img.php?id=' . rawurlencode($id) . '&k=sg' . $gi . ($gv !== '' ? '&v=' . $gv : '');
$stars = function ($n) { $o = ''; for ($k = 1; $k <= 5; $k++) $o .= '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="' . ($k <= $n ? 'currentColor' : 'none') . '" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>'; return $o; };
$nota = $rv ? str_replace('.', ',', number_format($rv['avg'], 1)) : '';
$ic = function ($p, $s = 20) { return '<svg aria-hidden="true" width="' . $s . '" height="' . $s . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' . $p . '</svg>'; };
$I = ['play' => '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>', 'back' => '<path d="M15 5l-7 7 7 7"/>', 'cat' => '<path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/>', 'wa' => '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2z"/>', 'pin' => '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 'share' => '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4"/>', 'clock' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 'bike' => '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8M10 9l2 4h4"/>', 'star' => '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>', 'img' => '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4 4 3 3-2 4 3"/>', 'seal' => '<path d="M12 2.5l2.4 1.8 3 .1.9 2.8 2.4 1.8-.9 2.9.9 2.8-2.4 1.8-.9 2.8-3 .1L12 21.5l-2.4-1.8-3-.1-.9-2.8-2.4-1.8.9-2.8-.9-2.9 2.4-1.8.9-2.8 3-.1z"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>', 'store' => '<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM9 20v-6h6v6"/>'];
$ini = function ($n) { $w = preg_split('/\s+/', trim($n)); $o = ''; foreach (array_slice($w, 0, 2) as $x) $o .= mb_strtoupper(mb_substr($x, 0, 1)); return $o; };
?><!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?= $e($name) ?> · <?= $e($seg ?: 'Santa Rita') ?> | Guía de Santa Rita</title>
<meta name="description" content="<?= $e($desc) ?>">
<link rel="canonical" href="<?= $e($url) ?>">
<meta property="og:type" content="business.business"><meta property="og:title" content="<?= $e($name) ?> · Guía de Santa Rita"><meta property="og:description" content="<?= $e($desc) ?>"><meta property="og:url" content="<?= $e($url) ?>"><meta property="og:image" content="<?= $e($img) ?>"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/guia/favicon.png?v=2"><link rel="manifest" href="/guia/manifest.webmanifest"><link rel="apple-touch-icon" href="/guia/icon-180.png?v=3"><meta name="theme-color" content="#24093F">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'"><noscript><link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet"></noscript>
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
.bd.rt{background:#fff;color:#8A5A00}.bd.rt svg{color:#F5A400;fill:#F5A400}.bd.rt small{font-weight:500;color:#6B5A3A}
.gal{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;scroll-snap-type:x mandatory}.gal a{flex:none;width:min(72vw,300px);aspect-ratio:4/3;border-radius:16px;overflow:hidden;background:var(--lilac);scroll-snap-align:start;border:1px solid var(--line)}.gal img{width:100%;height:100%;object-fit:cover;display:block}
.rvh{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.rvh b{font-family:var(--display);font-size:30px;line-height:1}.rvh small{color:var(--muted);font-size:13.5px}.stz{display:inline-flex;gap:1px;color:#F5A400}.rv{border-top:1px solid var(--line);margin-top:12px;padding-top:12px}.rv p{font-size:15px;margin:4px 0 2px}.rv small{color:var(--muted);font-size:13px}
.bd.on{background:#16A34A;color:#fff}.bd.off{background:#FDE8E8;color:#B42318}.bd.off::before{content:'';width:7px;height:7px;border-radius:50%;background:#DC2626}.bd.dl{background:rgba(255,255,255,.14);color:#fff}.bd.st{background:var(--yellow);color:#3D2600}
.acts{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0 8px}
.btn{display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:700;font-size:15.5px;text-decoration:none;padding:13px 18px;border-radius:14px;border:1px solid var(--line);background:#fff;color:var(--deep);cursor:pointer}
.btn.pri{background:var(--yellow);border-color:var(--yellow);color:var(--night)}.btn.wa{background:#16A34A;border-color:#16A34A;color:#fff}.btn.td{background:var(--night);border-color:var(--night);color:#fff}
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
.sec .hrs{max-width:520px;margin:0 auto}.sec.wide{max-width:980px}.gal{justify-content:safe center}.sec .rvs{max-width:620px;margin:0 auto;text-align:left}.sec .box.rvs>p{text-align:left}.sec .box>p{text-align:center}.pg{justify-content:center;grid-template-columns:repeat(auto-fit,minmax(150px,180px))}
.cta{max-width:760px;margin-left:auto;margin-right:auto}}
@media (max-width:420px){.hrs div{font-size:13.5px;padding:7px 8px}.hrs span:last-child{white-space:nowrap}}
@media (max-width:600px){.lg{width:82px;height:82px;border-radius:20px}.btn{flex:1 1 auto;justify-content:center}.bk span{display:none}.bk{padding:7px}}
.hdr{background:rgba(255,255,255,.97)!important;color:var(--ink,#1A1222)!important;border-bottom:1px solid #ECE6F3;position:sticky;top:0;z-index:60}
.hdr .bk{color:var(--deep,#4A0A80)!important;border-color:#E4DAF0!important;background:#F4F0F9!important}
.hdr .lang{border-color:#E4DAF0!important;color:#5F566B!important}.hdr .lang button{color:#5F566B}.hdr .lang button.on,.hdr .lang button[aria-pressed=true]{background:var(--deep,#4A0A80)!important;color:#fff!important}
.hdr .shb{border-color:#E4DAF0!important;color:var(--deep,#4A0A80)!important}
.vf{display:inline-flex;vertical-align:middle;margin-left:8px;color:#C9A3FF}.vf svg{display:block}
.rep{text-align:center;margin:18px auto 0;font-size:14px}.rep a{color:var(--muted,#5F566B);text-decoration:underline;text-underline-offset:3px}
.vds{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.vd{background:#fff;border:1px solid #EEE7F6;border-radius:16px;overflow:hidden;display:flex;flex-direction:column}
.vd iframe{display:block;width:100%;aspect-ratio:16/9;border:0;background:#111}.vd.vt iframe{aspect-ratio:9/16;max-height:620px}
.vd .vl{display:flex;align-items:center;gap:6px;padding:10px 14px;font-weight:700;font-size:14px;color:#4A0A80;text-decoration:none}
.hero.pm{box-shadow:inset 0 -4px 0 #FFC21A}.hero.pm .lg{box-shadow:0 0 0 4px #FFC21A,0 14px 30px -12px rgba(0,0,0,.6)}
</style></head>
<body>
<header class="hdr"><div class="wrap nav"><a class="bk" href="/guia/" aria-label="Volver a la Guía"><?= $ic($I['back'], 18) ?><span>Volver a la Guía</span></a><span class="sp"></span><a class="gsr" href="/guia/" aria-label="Guía de Santa Rita" style="display:flex;align-items:center;gap:10px;text-decoration:none"><img class="gsl" src="/img/guia/guia-logo.webp" alt="Guía de Santa Rita" width="83" height="40" style="height:40px;width:auto;display:block"></a></div></header>
<section class="hero<?= $pm ? ' pm' : '' ?>"><?php if ($cover): ?><img class="cv" src="<?= $e($cover) ?>" alt="" onerror="this.remove()"><?php endif; ?>
<div class="wrap">
<span class="lg"><?php if ($logo): ?><img src="<?= $e($logo) ?>" alt="Logo de <?= $e($name) ?>"><?php else: ?><b><?= $e($ini($name)) ?></b><?php endif; ?></span>
<div class="ht"><h1><?= $e($name) ?><?php if ($tdv): ?><span class="vf" title="Verificado: trabaja con Tu Delivery" aria-label="Verificado: trabaja con Tu Delivery"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12.00 1.00L14.41 3.02L17.50 2.47L18.58 5.42L21.53 6.50L20.98 9.59L23.00 12.00L20.98 14.41L21.53 17.50L18.58 18.58L17.50 21.53L14.41 20.98L12.00 23.00L9.59 20.98L6.50 21.53L5.42 18.58L2.47 17.50L3.02 14.41L1.00 12.00L3.02 9.59L2.47 6.50L5.42 5.42L6.50 2.47L9.59 3.02z"/><path d="m7.8 12.3 2.9 2.9 5.5-5.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><?php endif; ?></h1><p><?= $e(implode(' · ', array_filter([$slogan ?: $seg, $city]))) ?></p>
<div class="bdg"><?php if ($rv): ?><span class="bd rt" title="<?= $e($rv['n']) ?> opiniones"><?= $ic($I['star'], 13) ?><?= $e($nota) ?> <small>(<?= (int)$rv['n'] ?>)</small></span><?php endif; ?><?php if ($c['dest']): ?><span class="bd st"><?= $ic($I['seal'], 13) ?><span data-pt="Recomendado">Recomendado</span></span><?php endif; ?><?php if ($open): ?><span class="bd <?= $open['on'] ? 'on' : 'off' ?>"><span data-pt="<?= $open['on'] ? 'Aberto agora' . (!empty($open['until']) ? ' · até as ' . $e($open['until']) : '') : 'Fechado agora' ?>"><?= $open['on'] ? 'Abierto ahora' . (!empty($open['until']) ? ' · hasta las ' . $e($open['until']) : '') : 'Cerrado ahora' ?></span></span><?php endif; ?><?php if (!empty($st['delivery'])): ?><span class="bd dl"><?= $ic($I['bike'], 13) ?>Delivery</span><?php endif; ?><?php if (!empty($st['pickup'])): ?><span class="bd dl"><?= $ic($I['store'], 13) ?><span data-pt="Retirada">Retiro</span></span><?php endif; ?></div></div>
</div></section>
<main class="wrap">
<div class="acts">
<a class="btn pri" href="<?= $e($catUrl) ?>"><?= $ic($I['cat']) ?><span data-pt="Ver catálogo e pedir">Ver catálogo y pedir</span></a>
<?php if ($waUrl): ?><a class="btn wa" href="<?= $e($waUrl) ?>" target="_blank" rel="noopener"><?= $ic($I['wa']) ?>WhatsApp</a><?php endif; ?>
<a class="btn" href="<?= $e($dirUrl) ?>" target="_blank" rel="noopener"><?= $ic($I['pin']) ?><span data-pt="Como chegar">Cómo llegar</span></a>
<?php if (empty($st['delivery']) && empty($st['paused'])): /* o negócio não tem entrega própria: a Tu Delivery busca e leva */ ?><a class="btn td" id="tdb" href="<?= $e('https://wa.me/595982086171?text=' . rawurlencode('Hola Tu Delivery, quiero pedir un delivery de ' . $name . ' (lo vi en la Guía de Santa Rita)')) ?>" target="_blank" rel="noopener"><?= $ic($I['bike']) ?><span data-pt="Pedir com a Tu Delivery">Pedir con Tu Delivery</span></a><?php endif; ?>
<button class="btn" type="button" id="sh"><?= $ic($I['share']) ?><span data-pt="Compartilhar">Compartir</span></button>
</div>
<?php if ($prods && (!empty($c['dest']) || !empty($c['vip']))): /* vitrine de produtos: só Premium e VIP */ ?><section class="sec"><h2><?= $ic($I['cat'], 22) ?><span data-pt="Produtos em destaque">Productos destacados</span></h2><div class="pg">
<?php foreach ($prods as $p): ?><a class="pr" href="<?= $e($catUrl . ($p['id'] !== '' ? '?p=' . rawurlencode($p['id']) : '')) ?>"><img src="<?= $e($p['img']) ?>" alt="<?= $e($p['n']) ?>" loading="lazy" onerror="this.style.visibility='hidden'"><span><b><?= $e($p['n']) ?></b><?php if ($p['pm']): ?><i><?= $e($money($p['pm'])) ?></i><?php if ($p['pr'] > 0): ?><s><?= $e($money($p['pr'])) ?></s><?php endif; ?><?php elseif ($p['pr'] > 0): ?><i><?= $e($money($p['pr'])) ?></i><?php endif; ?></span></a>
<?php endforeach; ?></div></section><?php endif; ?>
<?php if ($vids): ?><section class="sec wide"><h2><?= $ic($I['play'], 22) ?><span data-pt="Vídeos">Videos</span></h2><div class="vds">
<?php foreach ($vids as $v): ?><div class="vd<?= $v['v'] ? ' vt' : '' ?>"><?php if ($v['src']): ?><iframe src="<?= $e($v['src']) ?>" title="Video de <?= $e($name) ?>" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><?php endif; ?><a class="vl" href="<?= $e($v['u']) ?>" target="_blank" rel="noopener"><?= $ic($I['play'], 16) ?><span data-pt="<?= $v['k'] === 'yt' ? 'Ver no YouTube' : ($v['k'] === 'tt' ? 'Ver no TikTok' : 'Ver no Instagram') ?>"><?= $v['k'] === 'yt' ? 'Ver en YouTube' : ($v['k'] === 'tt' ? 'Ver en TikTok' : 'Ver en Instagram') ?></span></a></div>
<?php endforeach; ?></div></section><?php endif; ?>
<?php if ($gal): ?><section class="sec wide"><h2><?= $ic($I['img'], 22) ?><span data-pt="Fotos do local">Fotos del local</span></h2><div class="gal">
<?php foreach ($gal as $gk => $gu): ?><a href="<?= $e($gu) ?>" target="_blank" rel="noopener"><img src="<?= $e($gu) ?>" alt="<?= $e($name) ?> · foto <?= $gk + 1 ?>" loading="lazy" onerror="this.parentNode.style.display='none'"></a>
<?php endforeach; ?></div></section><?php endif; ?>
<?php if ($days): ?><section class="sec"><h2><?= $ic($I['clock'], 22) ?><span data-pt="Horários">Horarios</span></h2><div class="box hrs">
<?php foreach ([1, 2, 3, 4, 5, 6, 0] as $i): $v = $ivs($days[$i]); ?><div class="<?= $i === $wd ? 'td' : '' ?>"><span data-pt="<?= $DP[$i] ?><?= $i === $wd ? ' · hoje' : '' ?>"><?= $DN[$i] ?><?= $i === $wd ? ' · hoy' : '' ?></span><span<?= $v ? '' : ' data-pt="Fechado"' ?>><?= $v ? $e(implode(' · ', array_map(function ($x) { return $x[2] . '–' . $x[3]; }, $v))) : 'Cerrado' ?></span></div>
<?php endforeach; ?></div></section><?php endif; ?>
<?php if ($rv): ?><section class="sec"><h2><?= $ic($I['star'], 22) ?><span data-pt="Opiniões dos clientes">Opiniones de clientes</span></h2>
<div class="box rvs"><p class="rvh"><b><?= $e($nota) ?></b><span class="stz"><?= $stars((int)round($rv['avg'])) ?></span><small data-pt="<?= (int)$rv['n'] ?> opiniões de pedidos reais"><?= (int)$rv['n'] ?> opiniones de pedidos reales</small></p>
<?php foreach ($rv['top'] as $r): ?><div class="rv"><span class="stz"><?= $stars((int)$r['s']) ?></span><p><?= $e($r['t']) ?></p><small><?= $e($r['n'] !== '' ? $r['n'] : 'Cliente') ?><?= preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $r['d'], $dm) ? ' · ' . $dm[3] . '/' . $dm[2] . '/' . $dm[1] : '' ?></small></div>
<?php endforeach; ?></div></section><?php endif; ?>
<section class="sec"><h2><?= $ic($I['pin'], 22) ?><span data-pt="Localização">Ubicación</span></h2><div class="box"><p><?= $e($addr ?: ($city ?: 'Santa Rita') . ', Alto Paraná') ?></p>
<iframe class="map" title="Mapa de <?= $e($name) ?>" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=<?= rawurlencode($mapQ) ?>&amp;z=<?= $hasGeo ? 16 : 15 ?>&amp;output=embed"></iframe>
<p style="margin-top:10px"><a class="btn" href="<?= $e($mapUrl) ?>" target="_blank" rel="noopener"><?= $ic($I['pin']) ?><span data-pt="Abrir no Google Maps">Abrir en Google Maps</span></a></p></div></section>
<p class="rep"><a href="<?= $e('https://wa.me/595982086171?text=' . rawurlencode('Hola, en la Guía de Santa Rita hay un dato incorrecto de ' . $name . ' (' . $url . '): ')) ?>" target="_blank" rel="noopener nofollow" data-pt="Algum dado errado? Avise a Guia">¿Algún dato incorrecto? Avisale a la Guía</a></p>
<section class="cta"><div><b data-pt="Mais negócios de Santa Rita">Más negocios de Santa Rita</b><p data-pt="Ofertas, farmácia de plantão, ônibus e tudo o que é útil na cidade.">Ofertas, farmacia de turno, ómnibus y todo lo útil de la ciudad.</p></div><a href="/guia/" data-pt="Abrir a Guia de Santa Rita">Abrir la Guía de Santa Rita</a></section>
</main>
<footer id="gft"></footer><script src="/guia/rodape.js" defer></script><script src="/guia/on.js" defer></script>
<script>try{if(localStorage.getItem('at_lang')==='pt'){document.documentElement.lang='pt';document.querySelectorAll('[data-pt]').forEach(function(e){e.textContent=e.getAttribute('data-pt')})}}catch(e){}</script>
<script>
var HU=(location.hostname.endsWith('guiadesantarita.com')?'https://araujotechsistemas.com':'')+'/sitio/guia_hit.php';/* os números ficam todos no servidor principal */
(function(){var b=document.getElementById('tdb');if(b)b.addEventListener('click',function(){try{if(!navigator.webdriver&&navigator.sendBeacon)navigator.sendBeacon(HU+'?t=p&id=td')}catch(e){}})})();
document.getElementById('sh').addEventListener('click',function(){var u=<?= json_encode($url) ?>,t=<?= json_encode($name . ' · Guía de Santa Rita') ?>;if(navigator.share){navigator.share({title:t,url:u}).catch(function(){})}else{window.open('https://wa.me/?text='+encodeURIComponent(t+' '+u),'_blank','noopener')}});
try{if(!navigator.webdriver){var u=HU+'?t=c&id=<?= rawurlencode($id) ?>';if(navigator.sendBeacon)navigator.sendBeacon(u);else fetch(u,{method:'POST',keepalive:true})}}catch(e){}
</script>
</body></html>
