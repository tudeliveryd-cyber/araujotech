<?php
@ini_set('display_errors', '0'); // avisos do PHP nunca aparecem na página do cliente
// Serve as fotos do site do cliente como arquivo de imagem (para a prévia do WhatsApp/Facebook).
// img.php?id=<loja>&k=sh  (sh = foto principal, sl = logo, sg0..sg7 = galeria)
$id = $_GET['id'] ?? ''; $k = $_GET['k'] ?? '';
if (!preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $id) || !preg_match('/^(sh|sl|sg[0-7])$/', $k)) { http_response_code(404); exit; }
$cache = sys_get_temp_dir() . '/at_img_' . md5($id . '|' . $k . '|' . ($_GET['v'] ?? '')) . '.jpg';
if (is_file($cache) && time() - filemtime($cache) < 86400) { at_out(@file_get_contents($cache), 'image/jpeg'); }
$url = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/shops/' . rawurlencode($id) . '/media/' . $k . '?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U';
$r = null;
if (function_exists('curl_init')) { $c = curl_init($url); curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8]); $r = curl_exec($c); if (curl_getinfo($c, CURLINFO_HTTP_CODE) != 200) $r = null; }
else { $r = @file_get_contents($url); if ($r === false) $r = null; }
if (!$r) { http_response_code(404); exit; }
$j = json_decode($r, true); $m = $j['fields']['m']['stringValue'] ?? '';
if (!preg_match('#^data:(image/[a-z+]+);base64,(.+)$#s', $m, $mm)) { http_response_code(404); exit; }
$bin = base64_decode($mm[2]); $type = $mm[1];
// reduz para no máximo 1200 px (o WhatsApp não mostra imagens muito pesadas)
if (function_exists('imagecreatefromstring') && ($im = @imagecreatefromstring($bin))) {
  $w = imagesx($im); $h = imagesy($im); $sc = min(1, 1200 / max($w, $h));
  if ($sc < 1 || strlen($bin) > 300000 || $type !== 'image/jpeg') {
    $nw = max(1, (int)round($w * $sc)); $nh = max(1, (int)round($h * $sc));
    $dst = imagecreatetruecolor($nw, $nh); imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255));
    imagecopyresampled($dst, $im, 0, 0, 0, 0, $nw, $nh, $w, $h);
    ob_start(); imagejpeg($dst, null, 80); $bin = ob_get_clean(); $type = 'image/jpeg';
  }
}
if ($type === 'image/jpeg') @file_put_contents($cache, $bin);
at_out($bin, $type);
function at_out($bin, $type) { header('Content-Type: ' . $type); header('Cache-Control: public, max-age=86400'); header('Content-Length: ' . strlen($bin)); echo $bin; exit; }
