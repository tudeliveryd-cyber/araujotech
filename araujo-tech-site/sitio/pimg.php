<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página do cliente
// Foto de um produto do catálogo como arquivo de imagem (para o site padrão da empresa), em no máximo 800 px.
// pimg.php?s=<loja>&k=<código da foto>. Ao ler um pacote de fotos do catálogo, guarda todas as fotos dele no cache.
$s = (string)($_GET['s'] ?? ''); $k = (string)($_GET['k'] ?? '');
if (!preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $s) || !preg_match('/^[a-z0-9]{2,24}$/', $k)) { http_response_code(404); exit; }
require __DIR__ . '/prods_lib.php';
function pimg_file($s, $k) { return sys_get_temp_dir() . '/at_pimg_' . md5($s) . '_' . $k . '.jpg'; }
function pimg_out($f) { header('X-Content-Type-Options: nosniff'); header('Content-Type: image/jpeg'); header('Cache-Control: public, max-age=604800'); header('Content-Length: ' . filesize($f)); readfile($f); exit; }
function pimg_save($s, $k, $data) {
  if (!preg_match('#^data:image/[a-z+]+;base64,(.+)$#s', $data, $m)) return;
  $bin = base64_decode($m[1]); if (!$bin) return;
  if (function_exists('imagecreatefromstring') && ($im = @imagecreatefromstring($bin))) {
    $w = imagesx($im); $h = imagesy($im); $sc = min(1, 800 / max($w, $h, 1));
    $nw = max(1, (int)round($w * $sc)); $nh = max(1, (int)round($h * $sc));
    $dst = imagecreatetruecolor($nw, $nh); imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255));
    imagecopyresampled($dst, $im, 0, 0, 0, 0, $nw, $nh, $w, $h);
    ob_start(); imagejpeg($dst, null, 82); $bin = ob_get_clean();
  }
  @file_put_contents(pimg_file($s, $k), $bin);
}
$f = pimg_file($s, $k);
if (is_file($f) && time() - filemtime($f) < 7 * 86400) pimg_out($f);
$shop = at_shop_cfg($s);
$n = $shop ? max(1, min(40, (int)$shop['mc'])) : 0;
for ($i = 0; $i < $n; $i++) {
  $r = at_get(AT_FS . rawurlencode($s) . '/media/p' . $i . '?key=' . AT_KEY);
  if (!$r) continue;
  $mf = (json_decode($r, true)['fields']['m']['mapValue']['fields'] ?? []);
  foreach ($mf as $key => $v) { if (preg_match('/^m:([a-z0-9]{2,24})$/', $key, $mm) && isset($v['stringValue'])) pimg_save($s, $mm[1], $v['stringValue']); }
  if (is_file($f)) pimg_out($f);
}
http_response_code(404);
