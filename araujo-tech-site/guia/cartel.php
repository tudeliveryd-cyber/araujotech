<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Cartel "Estamos en la Guía de Santa Rita" para imprimir e colar no local: logo e nome do negócio + QR para a página dele na Guía.
// /guia/cartel.php?id=<loja> (cliente Vitrix) ou ?id=d-<ficha> (ficha simples / aliado Tu Delivery). ?t=a4 para folha A4 (padrão A5).
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: no-store'); header('X-Robots-Tag: noindex');
require __DIR__ . '/../sitio/prods_lib.php';
require __DIR__ . '/../sitio/guia_lib.php';
$e = function ($x) { return htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8'); };
$id = strtolower((string)($_GET['id'] ?? ''));
$host = strtolower(preg_replace('/^www\./', '', (string)($_SERVER['HTTP_HOST'] ?? '')));
$base = $host === 'guiadesantarita.com' ? 'https://guiadesantarita.com/' : 'https://araujotechsistemas.com/guia/';
$shown = $host === 'guiadesantarita.com' ? 'guiadesantarita.com' : 'araujotechsistemas.com/guia';
$name = ''; $seg = ''; $logo = ''; $url = ''; $kind = '';
if (preg_match('/^d-([a-z0-9]{2,40})$/', $id, $m)) {
  foreach ((array)(guia_doc()['gdir'] ?? []) as $x) {
    if (!is_array($x) || preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')) !== $m[1]) continue;
    $name = trim((string)($x['n'] ?? '')); $seg = trim((string)($x['d'] ?? ''));
    if (preg_match('#^data:image/(jpeg|png|webp);base64,#', (string)($x['lg'] ?? ''))) $logo = '/sitio/gimg.php?d=' . $m[1] . '&v=' . substr(md5((string)$x['lg']), 0, 8);
    $url = $base . '?q=' . rawurlencode($name); $kind = !empty($x['td']) ? 'td' : 'dir'; break;
  }
} elseif (preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $id)) {
  foreach (guia_clients() as $x) if ($x['id'] === $id) {
    $name = $x['name']; $seg = $x['segEs'];
    $logo = preg_match('#^https://[^\s"\'<>]+$#', (string)$x['logo']) ? $x['logo'] : '';
    $url = $base . $id; $kind = 'vx'; break;
  }
}
if ($name === '') { http_response_code(404); echo '<!doctype html><meta charset="utf-8"><title>Cartel</title><p style="font-family:sans-serif;padding:24px">No encontramos ese negocio en la Guía.</p>'; exit; }
$a4 = ($_GET['t'] ?? '') === 'a4';
$wd = preg_split('/\s+/', trim(preg_replace('/[^\p{L}\p{N} ]/u', '', $name))); $ini = mb_strtoupper(count($wd) > 1 ? mb_substr($wd[0], 0, 1) . mb_substr($wd[1], 0, 1) : mb_substr($wd[0], 0, 2));
$lead = $kind === 'vx' ? 'Escaneá, mirá nuestro catálogo y pedí por WhatsApp' : 'Escaneá, mirá nuestros horarios y pedí por WhatsApp';
$leadPt = $kind === 'vx' ? 'Escaneie, veja nosso catálogo e peça pelo WhatsApp' : 'Escaneie, veja nossos horários e peça pelo WhatsApp';
?><!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cartel · <?= $e($name) ?> · Guía de Santa Rita</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
<style>
@page{size:<?= $a4 ? 'A4' : 'A5' ?> portrait;margin:0}
:root{--k:<?= $a4 ? '1.414' : '1' ?>;--night:#24093F;--deep:#4A0A80;--purple:#8A12D6;--yellow:#FFC21A}
*{box-sizing:border-box;margin:0}
body{background:#E9E3F0;font-family:"Red Hat Text",system-ui,sans-serif;color:#1A1222;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.bar{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:14px}
.bar a,.bar button{font:inherit;font-weight:700;font-size:15px;padding:10px 16px;border-radius:999px;border:1px solid #CFC3DD;background:#fff;color:var(--deep);text-decoration:none;cursor:pointer}
.bar .pri{background:var(--deep);border-color:var(--deep);color:#fff}
.pg{width:calc(148mm*var(--k));height:calc(210mm*var(--k));margin:0 auto 24px;background:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 50px -20px rgba(36,9,63,.45)}
.top{background:radial-gradient(calc(120mm*var(--k)) calc(70mm*var(--k)) at 90% 0%,#6A17BD,transparent 70%),var(--night);color:#fff;padding:calc(10mm*var(--k)) calc(10mm*var(--k)) calc(16mm*var(--k));text-align:center}
.brand{display:flex;align-items:center;justify-content:center;gap:calc(3mm*var(--k))}
.brand img{height:calc(10mm*var(--k));width:auto}.brand span{width:1px;height:calc(7mm*var(--k));background:rgba(255,255,255,.4)}.brand b{font-family:"Red Hat Display",system-ui,sans-serif;font-weight:900;font-size:calc(7mm*var(--k));color:var(--yellow)}
.top p{margin-top:calc(6mm*var(--k));font-size:calc(5.2mm*var(--k));font-weight:500;color:#E3D3FA}
.top h1{font-family:"Red Hat Display",system-ui,sans-serif;font-weight:900;font-size:calc(11.5mm*var(--k));line-height:1;letter-spacing:-.02em;margin-top:calc(1mm*var(--k))}
.biz{margin:calc(-9mm*var(--k)) auto 0;position:relative;display:flex;align-items:center;gap:calc(4mm*var(--k));background:#fff;border:1px solid #E4DAF0;border-radius:calc(5mm*var(--k));padding:calc(3.5mm*var(--k)) calc(6mm*var(--k)) calc(3.5mm*var(--k)) calc(3.5mm*var(--k));max-width:88%;box-shadow:0 10px 24px -14px rgba(36,9,63,.5)}
.lg{width:calc(16mm*var(--k));height:calc(16mm*var(--k));border-radius:calc(3.5mm*var(--k));overflow:hidden;flex:none;background:#F3ECFB;display:grid;place-items:center;border:1px solid #E4DAF0}
.lg img{width:100%;height:100%;object-fit:cover}.lg b{font-family:"Red Hat Display",system-ui,sans-serif;font-weight:900;color:var(--purple);font-size:calc(6mm*var(--k))}
.biz h2{font-family:"Red Hat Display",system-ui,sans-serif;font-weight:900;font-size:calc(7mm*var(--k));line-height:1.05}.biz small{display:block;color:#5F566B;font-size:calc(3.8mm*var(--k));margin-top:calc(.8mm*var(--k))}
.mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(4mm*var(--k)) calc(10mm*var(--k)) 0;text-align:center}
.qr{width:calc(64mm*var(--k));height:calc(64mm*var(--k));padding:calc(3mm*var(--k));border:calc(.8mm*var(--k)) solid var(--night);border-radius:calc(5mm*var(--k));background:#fff}
.qr svg{display:block;width:100%;height:100%}
.mid p{margin-top:calc(4mm*var(--k));font-weight:700;font-size:calc(4.6mm*var(--k));max-width:calc(110mm*var(--k))}
.mid p.pt{margin-top:calc(1mm*var(--k));font-weight:500;color:#5F566B;font-size:calc(3.6mm*var(--k))}
.ft{background:var(--yellow);color:var(--night);text-align:center;padding:calc(4.5mm*var(--k)) calc(8mm*var(--k));margin-top:calc(6mm*var(--k))}
.ft b{font-family:"Red Hat Display",system-ui,sans-serif;font-weight:900;font-size:calc(6mm*var(--k));letter-spacing:-.01em}
.ft small{display:block;font-size:calc(3.2mm*var(--k));font-weight:700;margin-top:calc(.6mm*var(--k))}
.tag{display:inline-flex;align-items:center;gap:calc(1.5mm*var(--k));margin-top:calc(2.5mm*var(--k));font-size:calc(3.4mm*var(--k));font-weight:700;padding:calc(1.2mm*var(--k)) calc(3mm*var(--k));border-radius:999px;background:#4A0A80;color:#fff}
@media print{body{background:#fff}.bar{display:none}.pg{margin:0;box-shadow:none}}
</style></head><body>
<div class="bar"><button class="pri" onclick="print()">Imprimir o guardar PDF</button><a href="?id=<?= $e($id) ?>">Tamaño A5</a><a href="?id=<?= $e($id) ?>&amp;t=a4">Tamaño A4</a></div>
<div class="pg">
 <div class="top"><div class="brand"><img src="/img/vitrix/vitrix-blanco-nombre.png" alt="Vitrix"><span></span><b>Guía</b></div>
 <p>Estamos en la</p><h1>Guía de Santa Rita</h1></div>
 <div class="biz"><span class="lg"><?= $logo ? '<img src="' . $e($logo) . '" alt="">' : '<b>' . $e($ini) . '</b>' ?></span><span><h2><?= $e($name) ?></h2><?= $seg !== '' ? '<small>' . $e($seg) . '</small>' : '' ?></span></div>
 <div class="mid">
  <div class="qr" id="qr" data-u="<?= $e($url) ?>"></div>
  <p><?= $e($lead) ?></p>
  <p class="pt"><?= $e($leadPt) ?></p>
  <?php if ($kind === 'td') { ?><span class="tag">Aliado Tu Delivery</span><?php } elseif ($kind === 'vx') { ?><span class="tag">Catálogo Vitrix</span><?php } ?>
 </div>
 <div class="ft"><b><?= $e($shown) ?></b><small>Restaurantes, tiendas, qué comer ahora y más · Santa Rita, Alto Paraná</small></div>
</div>
<script src="/guia/qr.js"></script>
<script>(function(){var el=document.getElementById('qr');try{var m=qrMatrix(el.dataset.u),n=m.length,q=2,s=n+q*2,p='';for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(m[r][c])p+='M'+(c+q)+' '+(r+q)+'h1v1h-1z';el.innerHTML='<svg viewBox="0 0 '+s+' '+s+'" shape-rendering="crispEdges" role="img" aria-label="Código QR"><rect width="'+s+'" height="'+s+'" fill="#fff"/><path d="'+p+'" fill="#24093F"/></svg>'}catch(e){el.textContent=el.dataset.u}})();</script>
</body></html>
