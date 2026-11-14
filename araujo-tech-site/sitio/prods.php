<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página do cliente
// Produtos em destaque do catálogo Vitrix para o site padrão da empresa (araujotechsistemas.com/<nome>).
// prods.php?id=<loja>  →  {"cur":"USD","items":[{"id","n":{"es","pt"},"price","promo","img"}]}
// Só leitura do catálogo público. Fica 10 minutos em cache no servidor.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
$id = (string)($_GET['id'] ?? '');
if (!preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $id)) { echo '{"items":[]}'; exit; }
require __DIR__ . '/prods_lib.php';
$shop = at_shop_cfg($id);
if (isset($_GET['dbg'])) { $pp = $shop['cfg']['products'] ?? []; echo json_encode(['ok' => (bool)$shop, 'status' => $shop['status'] ?? null, 'mc' => $shop['mc'] ?? null, 'n' => count($pp), 'ph' => array_slice(array_map(function ($p) { return substr((string)($p['photo'] ?? ''), 0, 12); }, $pp), 0, 6)]); exit; } // conferência (sem dados privados)
if (!$shop || ($shop['status'] ?? '') === 'suspenso' || empty($shop['cfg']['products'])) { echo '{"items":[]}'; exit; }
$cfg = $shop['cfg'];
$hid = [];
foreach (($cfg['cats'] ?? []) as $c) if (!empty($c['hide'])) $hid[$c['id'] ?? ''] = 1;
$list = [];
foreach ($cfg['products'] as $i => $p) {
  if (!is_array($p) || (($p['on'] ?? true) === false) || isset($hid[$p['cat'] ?? ''])) continue;
  $ph = (string)($p['photo'] ?? '');
  if (!preg_match('/^m:([a-z0-9]{2,24})$/', $ph, $m)) continue;           // só produto com foto
  $n = $p['n'] ?? ''; if (!is_array($n)) $n = ['es' => (string)$n, 'pt' => (string)$n];
  if (trim(($n['es'] ?? '') . ($n['pt'] ?? '')) === '') continue;
  $score = (!empty($p['feat']) ? 100 : 0) + ((+($p['promo'] ?? 0) > 0) ? 10 : 0) - $i * 0.01;
  $list[] = ['s' => $score, 'id' => (string)($p['id'] ?? ''), 'n' => ['es' => (string)($n['es'] ?? $n['pt'] ?? ''), 'pt' => (string)($n['pt'] ?? $n['es'] ?? '')],
    'price' => +($p['price'] ?? 0), 'promo' => +($p['promo'] ?? 0), 'img' => '/sitio/pimg.php?s=' . rawurlencode($id) . '&k=' . $m[1]];
}
usort($list, function ($a, $b) { return $b['s'] <=> $a['s']; });
$list = array_slice($list, 0, 8);
foreach ($list as &$x) unset($x['s']); unset($x);
$st = $cfg['store'] ?? [];
echo json_encode(['cur' => (($st['cur'] ?? '') === 'USD') ? 'USD' : 'PYG', 'total' => count($cfg['products']), 'items' => $list], JSON_UNESCAPED_UNICODE);
