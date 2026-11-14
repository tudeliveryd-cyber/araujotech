<?php
@ini_set('display_errors', '0'); // avisos do PHP nunca aparecem na página do cliente
// Logo da loja do subdomínio como imagem, para a prévia do link (WhatsApp/Facebook) e para os ícones do navegador.
// A loja vem do endereço (nome.araujotechsistemas.com/logo.php).
//  - sem ?s: quadrado 600x600 JPEG, fundo branco (prévia do link)
//  - ?s=favicon.png | apple-touch-icon.png | icon-192.png | icon-512.png | favicon.ico: ícone PNG no tamanho certo
//    (o .htaccess manda esses arquivos para cá nos subdomínios dos clientes, para não aparecer o ícone do Fogão Mineiro)
// Loja sem logo: no ícone, o símbolo da Vitrix; na prévia, 404.
require __DIR__ . '/catalogo_lib.php';
$host = strtolower($_SERVER['HTTP_HOST'] ?? '');
$icon = (string)($_GET['s'] ?? '');
$SIZES = ['favicon.png' => 64, 'favicon.ico' => 64, 'apple-touch-icon.png' => 180, 'apple-touch-icon-precomposed.png' => 180, 'icon-192.png' => 192, 'icon-512.png' => 512];
$N = $SIZES[$icon] ?? 0;
$s = null;
if (preg_match('/^([a-z0-9][a-z0-9-]{1,60})\.araujotechsistemas\.com$/', $host, $m)) $s = cat_shop($m[1]);
if (!$s || $s['logo'] === '') {
  if ($N) lg_out(@file_get_contents(__DIR__ . '/vitrix-icon.png'), 'image/png', 3600);
  http_response_code(404); exit;
}
$id = $s['id'];
$cache = sys_get_temp_dir() . '/at_logo2_' . md5($id . '|' . md5($s['logo']) . '|' . $N) . ($N ? '.png' : '.jpg');
if (is_file($cache) && time() - filemtime($cache) < 86400) lg_out(@file_get_contents($cache), $N ? 'image/png' : 'image/jpeg', $N ? 3600 : 86400);
$src = $s['logo'];
if (strpos($src, 'm:') === 0) {                       // logo guardado nos pacotes de imagens da loja
  $found = '';
  for ($i = 0; $i < max(1, $s['n']) && $i < 40 && $found === ''; $i++) {
    $r = cat_http('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/shops/' . rawurlencode($id) . '/media/p' . $i . '?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U');
    if (!$r) continue;
    $j = json_decode($r, true);
    $found = (string)($j['fields']['m']['mapValue']['fields'][$src]['stringValue'] ?? '');
  }
  $src = $found;
}
if (preg_match('#^https://[^\s"<>]+$#', $src)) { header('Location: ' . $src, true, 302); exit; }
if (!preg_match('#^data:(image/[a-z+.-]+);base64,(.+)$#s', $src, $mm)) {
  if ($N) lg_out(@file_get_contents(__DIR__ . '/vitrix-icon.png'), 'image/png', 3600);
  http_response_code(404); exit;
}
$bin = base64_decode($mm[2]); $type = $mm[1];
if (!in_array($type, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true)) { if ($N) lg_out(@file_get_contents(__DIR__ . '/vitrix-icon.png'), 'image/png', 3600); http_response_code(404); exit; } // nunca SVG: poderia trazer script
if (function_exists('imagecreatefromstring') && ($im = @imagecreatefromstring($bin))) {
  $w = imagesx($im); $h = imagesy($im);
  // logo que já é um quadro de cor (cantos opacos e não brancos): ocupa tudo, sem margem branca, fundo da cor do próprio logo
  $full = false; $cr = 255; $cg = 255; $cb = 255;
  if ($w > 8 && $h > 8) {
    $pts = [[2, 2], [$w - 3, 2], [2, $h - 3], [$w - 3, $h - 3]]; $ok = true; $sum = [0, 0, 0];
    foreach ($pts as [$x, $y]) { $c = imagecolorsforindex($im, imagecolorat($im, $x, $y)); if ($c['alpha'] > 10 || ($c['red'] > 235 && $c['green'] > 235 && $c['blue'] > 235)) { $ok = false; break; } $sum[0] += $c['red']; $sum[1] += $c['green']; $sum[2] += $c['blue']; }
    if ($ok) { $full = true; $cr = (int)($sum[0] / 4); $cg = (int)($sum[1] / 4); $cb = (int)($sum[2] / 4); }
  }
  $S = $N ?: 600; $pad = $full ? 0 : ($N ? (int)round($N * 0.06) : 48);   // ícone: margem pequena, como o ícone que o catálogo monta
  $sc = min(($S - 2 * $pad) / $w, ($S - 2 * $pad) / $h);
  $nw = max(1, (int)round($w * $sc)); $nh = max(1, (int)round($h * $sc));
  $dst = imagecreatetruecolor($S, $S); imagefill($dst, 0, 0, imagecolorallocate($dst, $cr, $cg, $cb));
  imagealphablending($dst, true);
  imagecopyresampled($dst, $im, (int)(($S - $nw) / 2), (int)(($S - $nh) / 2), 0, 0, $nw, $nh, $w, $h);
  ob_start(); if ($N) imagepng($dst, null, 6); else imagejpeg($dst, null, 86); $bin = ob_get_clean(); $type = $N ? 'image/png' : 'image/jpeg';
  @file_put_contents($cache, $bin);
}
lg_out($bin, $type, $N ? 3600 : 86400);
function lg_out($bin, $type, $age) { if ($bin === false || $bin === '') { http_response_code(404); exit; } header('X-Content-Type-Options: nosniff'); header('Content-Type: ' . $type); header('Cache-Control: public, max-age=' . $age); header('Content-Length: ' . strlen($bin)); echo $bin; exit; }
