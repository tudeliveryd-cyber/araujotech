<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Página própria de uma vaga, um aviso ou um evento da Guía: /vacante/<id>, /aviso/<id>, /evento/<id>.
// Serve para compartilhar no WhatsApp com prévia (título e foto) e para o Google (JobPosting / Event).
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
require __DIR__ . '/../sitio/prods_lib.php';
require __DIR__ . '/../sitio/guia_lib.php';
$k = (string)($_GET['k'] ?? ''); $rid = (string)($_GET['id'] ?? '');
$id = str_replace('.', ':', $rid);
$x = (in_array($k, ['vacante', 'aviso', 'evento'], true) && preg_match('/^[A-Za-z0-9:_-]{2,90}$/', $id)) ? guia_item($k, $id) : null;
$e = function ($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); };
$host = preg_match('/(^|\.)guiadesantarita\.com$/i', (string)($_SERVER['HTTP_HOST'] ?? '')) ? 'https://guiadesantarita.com' : 'https://araujotechsistemas.com/guia';
$G = $host . '/';
$self = $host . '/' . $k . '/' . rawurlencode($rid);
$CK = ['per' => 'Perdidos y encontrados', 'inm' => 'Inmueble', 'veh' => 'Vehículo', 'var' => 'Productos y varios', 'ser' => 'Servicios'];
$COP = ['venta' => 'Venta', 'alq' => 'Alquiler', 'perd' => 'Se perdió', 'enc' => 'Se encontró'];
$JK = ['full' => 'Tiempo completo', 'part' => 'Medio tiempo', 'temp' => 'Temporal', 'first' => 'Primer empleo'];
$EK = ['rel' => 'Religioso', 'dep' => 'Deportivo', 'cul' => 'Cultural', 'com' => 'Comunitario', 'neg' => 'Feria o comercial', 'inf' => 'Infantil', 'otr' => 'Evento', 'fer' => 'Feriado'];
$MES = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
$fd = function ($d) use ($MES) { return preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', (string)$d, $m) ? (int)$m[3] . ' ' . $MES[(int)$m[2]] . ' ' . $m[1] : ''; };
$wa = function ($n) { $n = preg_replace('/\D/', '', (string)$n); if ($n !== '' && $n[0] === '0') $n = '595' . substr($n, 1); elseif ($n !== '' && strpos($n, '595') !== 0 && strlen($n) <= 10) $n = '595' . $n; return $n; };
$img = 'https://araujotechsistemas.com/img/guia/og-guia.jpg?v=2';
if (!$x) {
  http_response_code(410);
  $title = 'Esta publicación ya no está disponible'; $desc = 'Venció o fue retirada. Mirá lo que hay hoy en la Guía de Santa Rita.'; $tags = []; $body = ''; $btns = ''; $ld = '';
} else {
  if ($k === 'vacante') {
    $co = (string)($x['co']['n'] ?? '');
    $title = 'Vacante: ' . $x['t'] . ($co !== '' ? ' — ' . $co : '');
    $desc = mb_substr(preg_replace('/\s+/u', ' ', $x['d']), 0, 155);
    $tags = array_filter([$JK[$x['k']] ?? '', $x['sal'] ?? '', $x['until'] ? 'Hasta el ' . $fd($x['until']) : '']);
    $body = $x['d'] . ($x['r'] !== '' ? "\n\nRequisitos: " . $x['r'] : '');
    $msg = 'Hola, vi la vacante de ' . $x['t'] . ' en la Guía de Santa Rita y me interesa postularme' . ($co !== '' ? ' para ' . $co : '') . '.';
    $btns = '<a class="btn pri" href="' . $e('https://wa.me/' . $wa($x['wa']) . '?text=' . rawurlencode($msg)) . '" target="_blank" rel="noopener">Postularme por WhatsApp</a>';
    $ld = json_encode(['@context' => 'https://schema.org', '@type' => 'JobPosting', 'title' => $x['t'], 'description' => $x['d'], 'datePosted' => (new DateTime('now', new DateTimeZone('America/Asuncion')))->format('Y-m-d'), 'validThrough' => $x['until'] . 'T23:59:00-03:00',
      'employmentType' => ['full' => 'FULL_TIME', 'part' => 'PART_TIME', 'temp' => 'TEMPORARY', 'first' => 'INTERN'][$x['k']] ?? 'OTHER', 'hiringOrganization' => ['@type' => 'Organization', 'name' => $co ?: 'Empresa de Santa Rita'],
      'jobLocation' => ['@type' => 'Place', 'address' => ['@type' => 'PostalAddress', 'addressLocality' => 'Santa Rita', 'addressRegion' => 'Alto Paraná', 'addressCountry' => 'PY']]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $kind = 'Vacante de empleo';
  } elseif ($k === 'aviso') {
    $title = ($COP[$x['op']] ?? '') !== '' ? $COP[$x['op']] . ': ' . $x['t'] : $x['t'];
    $desc = mb_substr(preg_replace('/\s+/u', ' ', $x['d'] ?: ($CK[$x['k']] ?? 'Aviso')), 0, 155);
    $tags = array_filter([$CK[$x['k']] ?? '', $COP[$x['op']] ?? '', $x['pr'], $x['z']]);
    $body = $x['d'];
    if ($x['ph'] !== '') $img = 'https://araujotechsistemas.com' . $x['ph'];
    $btns = '<a class="btn pri" href="' . $e('https://wa.me/' . $wa($x['wa']) . '?text=' . rawurlencode('Hola, vi tu aviso "' . $x['t'] . '" en la Guía de Santa Rita y quiero más información.')) . '" target="_blank" rel="noopener">Consultar por WhatsApp</a>';
    $ld = ''; $kind = $CK[$x['k']] ?? 'Aviso';
  } else {
    $title = $x['t'];
    $desc = trim($fd($x['d']) . ($x['h'] ? ' · ' . $x['h'] : '') . ($x['l'] ? ' · ' . $x['l'] : '')) . ' — Agenda de Santa Rita.';
    $tags = array_filter([$EK[$x['k']] ?? 'Evento', $fd($x['d']), $x['h'], $x['l']]);
    $body = ''; $btns = $x['u'] ? '<a class="btn pri" href="' . $e($x['u']) . '" target="_blank" rel="noopener">Más información</a>' : '';
    $ld = json_encode(['@context' => 'https://schema.org', '@type' => 'Event', 'name' => $x['t'], 'startDate' => $x['d'] . ($x['h'] ? 'T' . $x['h'] . ':00-03:00' : ''), 'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
      'location' => ['@type' => 'Place', 'name' => $x['l'] ?: 'Santa Rita', 'address' => ['@type' => 'PostalAddress', 'addressLocality' => 'Santa Rita', 'addressRegion' => 'Alto Paraná', 'addressCountry' => 'PY']]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $kind = 'Agenda de Santa Rita';
  }
}
$back = $k === 'vacante' ? $G . '#empleos' : ($k === 'aviso' ? $G . '#clasificados' : $G . '#agenda');
?><!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?= $e($title) ?> | Guía de Santa Rita</title>
<meta name="description" content="<?= $e($desc) ?>">
<?php if ($x): ?><link rel="canonical" href="<?= $e($self) ?>"><?php else: ?><meta name="robots" content="noindex"><?php endif; ?>
<meta property="og:type" content="website"><meta property="og:site_name" content="Guía de Santa Rita"><meta property="og:title" content="<?= $e($title) ?>"><meta property="og:description" content="<?= $e($desc) ?>"><meta property="og:image" content="<?= $e($img) ?>"><meta property="og:url" content="<?= $e($self) ?>"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/guia/favicon.png?v=1"><meta name="theme-color" content="#24093F">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
<?php if ($ld): ?><script type="application/ld+json"><?= $ld ?></script><?php endif; ?>
<style>
:root{--purple:#8A12D6;--deep:#4A0A80;--night:#24093F;--lilac:#F3ECFB;--ink:#1A1222;--muted:#5F566B;--line:#E4DAF0;--yellow:#FFC21A;--display:"Red Hat Display",system-ui,sans-serif;--text:"Red Hat Text",system-ui,sans-serif}
*{box-sizing:border-box;margin:0}body{font-family:var(--text);color:var(--ink);background:#FBF8FE;line-height:1.55}
.hdr{background:#fff;border-bottom:1px solid #ECE6F3}.nav{max-width:760px;margin:0 auto;padding:0 18px;height:64px;display:flex;align-items:center;gap:12px}.nav img{height:40px;width:auto;display:block}.nav .sp{flex:1}
.bk{display:inline-flex;align-items:center;gap:6px;text-decoration:none;font-weight:700;font-size:14px;color:var(--deep);border:1px solid var(--line);background:#F4F0F9;border-radius:999px;padding:7px 12px}
main{max-width:760px;margin:0 auto;padding:22px 18px 40px}
.box{background:#fff;border:1px solid var(--line);border-radius:22px;overflow:hidden;box-shadow:0 24px 50px -32px rgba(36,9,63,.45)}
.ph{display:block;width:100%;max-height:420px;object-fit:cover;background:var(--lilac)}
.in{padding:22px}
.kd{font-size:13px;font-weight:700;color:var(--purple)}
h1{font-family:var(--display);font-weight:900;font-size:clamp(26px,5vw,36px);line-height:1.1;letter-spacing:-.4px;margin-top:6px}
.co{margin-top:6px;font-size:17px;font-weight:700;color:var(--deep)}
.tg{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.tg span{font-size:13.5px;font-weight:700;background:var(--lilac);color:var(--deep);border-radius:999px;padding:5px 11px}
.tx{margin-top:16px;font-size:16px;white-space:pre-line}
.act{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-weight:700;font-size:15px;text-decoration:none;border-radius:14px;padding:12px 16px;border:1px solid var(--line);background:#fff;color:var(--deep);cursor:pointer}
.btn.pri{background:#1FA855;border-color:#1FA855;color:#fff}
.nt{margin-top:16px;font-size:13.5px;color:var(--muted)}
.empty{text-align:center;padding:34px 22px}.empty h1{font-size:26px}.empty p{margin-top:10px;color:var(--muted)}
.btn:focus-visible,.bk:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
</style>
</head>
<body>
<header class="hdr"><div class="nav"><a class="bk" href="<?= $e($back) ?>">Volver a la Guía</a><span class="sp"></span><a href="<?= $e($G) ?>" aria-label="Guía de Santa Rita"><img src="/img/guia/guia-logo.webp" alt="Guía de Santa Rita" width="83" height="40"></a></div></header>
<main>
<?php if (!$x): ?>
<div class="box empty"><h1>Esta publicación ya no está disponible</h1><p>Venció o fue retirada por quien la publicó.</p><div class="act" style="justify-content:center"><a class="btn pri" style="background:var(--deep);border-color:var(--deep)" href="<?= $e($G) ?>">Ver lo que hay hoy en la Guía</a></div></div>
<?php else: ?>
<article class="box"><?php if ($k === 'aviso' && $x['ph'] !== ''): ?><img class="ph" src="<?= $e($x['ph']) ?>" alt=""><?php endif; ?><div class="in">
<p class="kd"><?= $e($kind) ?></p><h1><?= $e($x['t']) ?></h1>
<?php if ($k === 'vacante' && ($x['co']['n'] ?? '') !== ''): ?><p class="co"><?= $e($x['co']['n']) ?></p><?php endif; ?>
<?php if ($tags): ?><div class="tg"><?php foreach ($tags as $t): ?><span><?= $e($t) ?></span><?php endforeach; ?></div><?php endif; ?>
<?php if ($body !== ''): ?><p class="tx"><?= $e($body) ?></p><?php endif; ?>
<div class="act"><?= $btns ?><button class="btn" type="button" id="sh">Compartir</button><a class="btn" href="<?= $e($back) ?>">Ver más en la Guía</a></div>
<p class="nt"><?= $k === 'vacante' ? 'La Guía no garantiza la contratación: el contacto es directo con quien publica.' : ($k === 'aviso' ? 'Nunca pagues por adelantado sin ver el producto o el inmueble.' : 'Confirmá horario y lugar con los organizadores.') ?></p>
</div></article>
<?php endif; ?>
</main>
<footer id="gft"></footer><script src="/guia/rodape.js" defer></script>
<script>(function(){var b=document.getElementById('sh');if(!b)return;b.addEventListener('click',function(){var d={title:document.title,text:<?= json_encode($title, JSON_UNESCAPED_UNICODE) ?>,url:<?= json_encode($self, JSON_UNESCAPED_SLASHES) ?>};if(navigator.share)navigator.share(d).catch(function(){});else location.href='https://wa.me/?text='+encodeURIComponent(d.text+' '+d.url)})})();</script>
</body></html>
