<?php
@ini_set('display_errors', '0'); error_reporting(0);
// POST t=<login>&u=<foto escolhida> → a própria foto (JPEG/PNG/WebP/GIF, até 8 MB), para o painel colocar no produto
// sem o dono precisar baixar e subir o arquivo. O navegador não pode buscar a foto de outro site direto (CORS).
require __DIR__ . '/img_lib.php'; img_cors();
if (img_key() === '') img_out(['ok' => false, 'e' => 'off']);
if (img_uid((string)($_POST['t'] ?? '')) === '') img_out(['ok' => false, 'e' => 'login'], 401);
$u = (string)($_POST['u'] ?? ''); $max = 8 * 1024 * 1024; $bin = '';
for ($hop = 0; $hop < 4; $hop++) {
  if (strlen($u) > 2000 || !($ip = img_url_ok($u))) img_out(['ok' => false, 'e' => 'url']);
  $p = parse_url($u); $port = $p['port'] ?? (strtolower($p['scheme']) === 'https' ? 443 : 80);
  $c = curl_init($u); $bin = ''; $loc = '';
  curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => false, CURLOPT_FOLLOWLOCATION => false, CURLOPT_TIMEOUT => 15, CURLOPT_CONNECTTIMEOUT => 6,
    CURLOPT_RESOLVE => [$p['host'] . ':' . $port . ':' . $ip], // conecta no IP já conferido
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Vitrix foto de produto)', CURLOPT_HTTPHEADER => ['Accept: image/avif,image/webp,image/*,*/*;q=0.5'],
    CURLOPT_HEADERFUNCTION => function ($c, $h) use (&$loc) { if (stripos($h, 'location:') === 0) $loc = trim(substr($h, 9)); return strlen($h); },
    CURLOPT_WRITEFUNCTION => function ($c, $d) use (&$bin, $max) { $bin .= $d; return strlen($bin) > $max ? 0 : strlen($d); }]);
  curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE);
  if ($code >= 300 && $code < 400 && $loc !== '') { $u = preg_match('#^https?://#i', $loc) ? $loc : ($p['scheme'] . '://' . $p['host'] . ($loc[0] === '/' ? '' : '/') . $loc); continue; }
  break;
}
if (($code ?? 0) !== 200 || $bin === '' || strlen($bin) > $max) img_out(['ok' => false, 'e' => 'get']);
$i = @getimagesizefromstring($bin); $ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!$i || !in_array($i['mime'], $ok, true)) img_out(['ok' => false, 'e' => 'tipo']); // nunca SVG nem HTML
header('Content-Type: ' . $i['mime']); header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
echo $bin;
