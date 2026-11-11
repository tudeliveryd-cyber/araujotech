<?php
// Logo da loja do subdomínio como imagem (quadrado 600x600, fundo branco), para a prévia do link no WhatsApp/Facebook.
// A loja vem do endereço (nome.araujotechsistemas.com/logo.php). Sem logo: 404.
require __DIR__ . '/catalogo_lib.php';
$host = strtolower($_SERVER['HTTP_HOST'] ?? '');
if (!preg_match('/^([a-z0-9][a-z0-9-]{1,60})\.araujotechsistemas\.com$/', $host, $m)) { http_response_code(404); exit; }
$id = $m[1];
$cache = sys_get_temp_dir() . '/at_logo_' . md5($id . '|' . ($_GET['v'] ?? '')) . '.jpg';
if (is_file($cache) && time() - filemtime($cache) < 86400) lg_out(@file_get_contents($cache), 'image/jpeg');
$s = cat_shop($id);
if (!$s || $s['logo'] === '') { http_response_code(404); exit; }
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
if (preg_match('#^https?://#', $src)) { header('Location: ' . $src, true, 302); exit; }
if (!preg_match('#^data:(image/[a-z+.-]+);base64,(.+)$#s', $src, $mm)) { http_response_code(404); exit; }
$bin = base64_decode($mm[2]); $type = $mm[1];
// coloca o logo centralizado num quadrado branco de 600 px (fica bonito na prévia do WhatsApp)
if (function_exists('imagecreatefromstring') && ($im = @imagecreatefromstring($bin))) {
  $w = imagesx($im); $h = imagesy($im); $N = 600; $pad = 48;
  $sc = min(($N - 2 * $pad) / $w, ($N - 2 * $pad) / $h);
  $nw = max(1, (int)round($w * $sc)); $nh = max(1, (int)round($h * $sc));
  $dst = imagecreatetruecolor($N, $N); imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255));
  imagealphablending($dst, true);
  imagecopyresampled($dst, $im, (int)(($N - $nw) / 2), (int)(($N - $nh) / 2), 0, 0, $nw, $nh, $w, $h);
  ob_start(); imagejpeg($dst, null, 86); $bin = ob_get_clean(); $type = 'image/jpeg';
  @file_put_contents($cache, $bin);
}
lg_out($bin, $type);
function lg_out($bin, $type) { header('Content-Type: ' . $type); header('Cache-Control: public, max-age=86400'); header('Content-Length: ' . strlen($bin)); echo $bin; exit; }
