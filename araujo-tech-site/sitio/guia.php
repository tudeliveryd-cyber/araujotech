<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página
// Guía Vitrix: horários e entrega de cada catálogo (para "Abierto ahora" e "Con delivery"). Só leitura do catálogo público.
// guia.php?ids=loja1,loja2  →  {"loja1":{"days":[...],"del":true,"pick":true,"cv":capa,"sl":slogan}}
// guia.php?g=1  →  {"ads":[banners pagos no ar hoje],"util":[lugares públicos] ou null,"pros":[profissionais em destaque]}
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
require __DIR__ . '/prods_lib.php';
if (isset($_GET['ofs'])) { // ofertas de hoje: produtos em promoção (com foto) dos catálogos da Guía
  $o = []; foreach (array_slice(array_unique(array_filter(explode(',', (string)$_GET['ofs']))), 0, 40) as $id) {
    if (!preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $id)) continue; $sh = at_shop_cfg($id);
    if (!$sh || ($sh['status'] ?? '') === 'suspenso' || !empty($sh['cfg']['store']['paused'])) continue;
    $hid = []; foreach (($sh['cfg']['cats'] ?? []) as $c) if (!empty($c['hide'])) $hid[$c['id'] ?? ''] = 1;
    $cand = [];
    foreach (($sh['cfg']['products'] ?? []) as $p) {
      if (!is_array($p) || ($p['on'] ?? true) === false || isset($hid[$p['cat'] ?? ''])) continue;
      $pr = +($p['price'] ?? 0); $pm = +($p['promo'] ?? 0); $isP = $pm > 0 && ($pr <= 0 || $pm < $pr);
      if ($isP) $cand[] = [0, $p]; elseif (!empty($p['feat']) && $pr > 0) $cand[] = [1, $p];
    }
    usort($cand, function ($a, $b) { return $a[0] <=> $b[0]; });
    $n = 0; foreach ($cand as [$kind, $p]) {
      if ($n >= 2) break;
      $pr = +($p['price'] ?? 0); $pm = $kind === 0 ? +($p['promo'] ?? 0) : 0;
      if (!preg_match('/^m:([a-z0-9]{2,24})$/', (string)($p['photo'] ?? ''), $m)) continue;
      $nm = $p['n'] ?? ''; if (!is_array($nm)) $nm = ['es' => (string)$nm, 'pt' => (string)$nm];
      $o[] = ['s' => $id, 'p' => (string)($p['id'] ?? ''), 'n' => ['es' => (string)($nm['es'] ?? $nm['pt'] ?? ''), 'pt' => (string)($nm['pt'] ?? $nm['es'] ?? '')], 'price' => $pr, 'promo' => $pm, 'pm' => $kind === 0, 'cur' => (($sh['cfg']['store']['cur'] ?? '') === 'USD') ? 'USD' : 'PYG', 'img' => '/sitio/pimg.php?s=' . rawurlencode($id) . '&k=' . $m[1]];
      $n++;
    }
  }
  usort($o, function ($a, $b) { return ($b['pm'] <=> $a['pm']); });
  echo json_encode(array_slice($o, 0, 16), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit;
}
if (isset($_GET['top'])) { // 'Lo más buscado': as buscas da Guía com resultado, deste mês e do anterior (só as que se repetem)
  $tz = new DateTimeZone('America/Asuncion'); $now = new DateTime('now', $tz); $q = [];
  foreach ([(clone $now)->modify('first day of last month')->format('Y-m'), $now->format('Y-m')] as $m) { $d = json_decode((string)@file_get_contents(__DIR__ . '/datos/hits-' . $m . '.json'), true); foreach ((array)($d['q'] ?? []) as $k => $n) $q[$k] = ($q[$k] ?? 0) + (int)$n; }
  arsort($q); $o = []; foreach ($q as $k => $n) { if ($n < 2) break; $o[] = str_replace('-', ' ', $k); if (count($o) >= 8) break; }
  header('Cache-Control: public, max-age=900'); echo json_encode(['q' => $o], JSON_UNESCAPED_UNICODE); exit;
}
if (isset($_GET['news'])) { require __DIR__ . '/guia_lib.php'; echo json_encode(guia_news(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
if (isset($_GET['g'])) { require __DIR__ . '/guia_lib.php'; echo json_encode(guia_pub(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; } // banners pagos e lugares públicos
$out = [];
$ids = array_slice(array_unique(array_filter(explode(',', (string)($_GET['ids'] ?? '')))), 0, 60);
foreach ($ids as $id) {
  if (!preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $id)) continue;
  $s = at_shop_cfg($id);
  if (!$s || ($s['status'] ?? '') === 'suspenso') continue;
  $st = $s['cfg']['store'] ?? [];
  $days = [];
  if (is_array($st['days'] ?? null) && count($st['days']) === 7) foreach ($st['days'] as $d) {
    $days[] = ['on' => ($d['on'] ?? true) !== false, 'a' => array_slice((array)($d['a'] ?? []), 0, 2), 'b' => array_slice((array)($d['b'] ?? []), 0, 2)];
  }
  $o = ['days' => $days, 'del' => !empty($st['delivery']), 'pick' => !empty($st['pickup']), 'paused' => !empty($st['paused'])];
  // capa e slogan do catálogo (slider da Guía para os clientes Premium e VIP)
  if (preg_match('/^m:([a-z0-9]{2,24})$/', (string)($st['cover'] ?? ''), $m)) $o['cv'] = '/sitio/pimg.php?s=' . rawurlencode($id) . '&k=' . $m[1];
  else { $best = null; foreach ((array)($s['cfg']['products'] ?? []) as $p) { if (!is_array($p) || ($p['on'] ?? true) === false || !preg_match('/^m:([a-z0-9]{2,24})$/', (string)($p['photo'] ?? ''), $m)) continue; if (!empty($p['feat'])) { $best = $m[1]; break; } if ($best === null) $best = $m[1]; }
    if ($best) $o['cv'] = '/sitio/pimg.php?s=' . rawurlencode($id) . '&k=' . $best; } // sem foto de capa: a foto de um produto do catálogo
  $sl = $st['slogan'] ?? '';
  if (is_array($sl)) $sl = ['es' => trim((string)($sl['es'] ?? $sl['pt'] ?? '')), 'pt' => trim((string)($sl['pt'] ?? $sl['es'] ?? ''))]; else $sl = trim((string)$sl) === '' ? null : ['es' => trim((string)$sl), 'pt' => trim((string)$sl)];
  if ($sl && ($sl['es'] . $sl['pt']) !== '') $o['sl'] = $sl;
  if (!function_exists('guia_loc')) require_once __DIR__ . '/guia_lib.php';
  if ($loc = guia_loc($id, $s)) { $o['lat'] = round($loc['lat'], 5); $o['lng'] = round($loc['lng'], 5); } // para 'Cerca de mí' e o mapa (só localização confirmada)
  $out[$id] = $o;
}
echo json_encode($out ?: new stdClass(), JSON_UNESCAPED_UNICODE);
