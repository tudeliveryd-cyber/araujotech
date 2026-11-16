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
  if (stripos((string)($_SERVER['HTTP_HOST'] ?? ''), 'araujotechsistemas.com') === false) { // hospedagem própria da Guía: as contagens ficam no servidor principal
    $f = sys_get_temp_dir() . '/guia-top.json'; $j = (is_file($f) && time() - filemtime($f) < 900) ? (string)@file_get_contents($f) : '';
    if ($j === '') { $j = (string)@file_get_contents('https://araujotechsistemas.com/sitio/guia.php?top=1', false, stream_context_create(['http' => ['timeout' => 4]])); $t = json_decode($j, true); if (is_array($t) && isset($t['q'])) @file_put_contents($f, $j); else $j = '{"q":[]}'; }
    header('Cache-Control: public, max-age=900'); echo $j; exit;
  }
  $tz = new DateTimeZone('America/Asuncion'); $now = new DateTime('now', $tz); $q = [];
  foreach ([(clone $now)->modify('first day of last month')->format('Y-m'), $now->format('Y-m')] as $m) { $d = json_decode((string)@file_get_contents(__DIR__ . '/datos/hits-' . $m . '.json'), true); foreach ((array)($d['q'] ?? []) as $k => $n) $q[$k] = ($q[$k] ?? 0) + (int)$n; }
  // Só aparece em público o que bate com um negócio da Guía ou com um rubro conhecido: o contador é aberto,
  // então sem este filtro qualquer pessoa poderia fazer uma palavra ofensiva aparecer na página.
  require_once __DIR__ . '/guia_lib.php';
  $nrm = function ($x) { return strtr(mb_strtolower((string)$x), ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ã' => 'a', 'õ' => 'o', 'â' => 'a', 'ê' => 'e', 'ô' => 'o', 'ç' => 'c']); };
  $hay = ' comida restaurante almuerzo cena desayuno pizza pizzeria hamburguesa lomito empanada asado parrilla sushi helado heladeria cafe cafeteria panaderia confiteria bebidas cerveza supermercado despensa carniceria verduleria farmacia remedios salud clinica dentista medico optica ropa moda tienda calzados zapatos accesorios joyas cosmeticos perfumes belleza peluqueria barberia salon unas muebles sofa hogar colchones electrodomesticos celulares informatica ferreteria construccion pinturas materiales autos motos repuestos taller nautica pesca agro veterinaria mascotas petshop flores floreria libreria juguetes deportes gimnasio suplementos lavanderia grafica imprenta delivery abogado escribano contador arquitecto ingeniero influencer profesor clases hotel omnibus taxi regalos ofertas promociones turno guardia ';
  foreach (guia_clients() as $c) $hay .= $nrm($c['name'] . ' ' . $c['segEs'] . ' ' . $c['segPt']) . ' ';
  arsort($q); $o = [];
  foreach ($q as $k => $n) {
    if ($n < 2) break;
    $t = str_replace('-', ' ', $k); $okw = 0; $bad = false;
    foreach (explode(' ', $nrm($t)) as $w) { if (strlen($w) < 3) continue; if (strpos($hay, $w) === false) { $bad = true; break; } $okw++; }
    if ($bad || !$okw) continue;
    $o[] = $t; if (count($o) >= 8) break;
  }
  header('Cache-Control: public, max-age=900'); echo json_encode(['q' => $o], JSON_UNESCAPED_UNICODE); exit;
}
if (isset($_GET['hoy'])) { // 'Hoy en Santa Rita': clima (MET Norway) e câmbio de referência (ExchangeRate-API), buscados pelo servidor e guardados em cache
  $get = function ($url) { if (!function_exists('curl_init')) return null; $c = curl_init($url); curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_ENCODING => '', CURLOPT_USERAGENT => 'GuiaVitrix/1.0 (https://araujotechsistemas.com/guia/)']); $r = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); return ($r !== false && $code === 200) ? $r : null; };
  // $fresh = tempo em que não busca de novo; $stale = até quando o dado velho ainda pode ser mostrado se a fonte falhar
  $cached = function ($name, $fresh, $stale, $make) { $f = sys_get_temp_dir() . '/at_hoy_' . $name . '.json'; $old = is_file($f) ? json_decode((string)@file_get_contents($f), true) : null; $age = is_file($f) ? time() - filemtime($f) : PHP_INT_MAX;
    if (is_array($old) && $age < $fresh) return $old;
    if ($age < 120 && $old === false) return null; // falhou há pouco: não insiste a cada visita
    $new = $make(); if (is_array($new)) { @file_put_contents($f, json_encode($new)); return $new; }
    if (is_array($old) && $age < $stale) return $old;
    if (!is_array($old)) @file_put_contents($f, 'false');
    return null; };
  $tz = new DateTimeZone('America/Asuncion');
  $w = $cached('w', 1800, 3 * 3600, function () use ($get, $tz) {
    $j = json_decode((string)$get('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=-25.79&lon=-55.08'), true); $ts = $j['properties']['timeseries'] ?? null; if (!is_array($ts) || !$ts) return null;
    $now = time(); $cur = null; $mx = null; $mn = null; $rain = 0.0;
    foreach ($ts as $e) { $t = strtotime((string)($e['time'] ?? '')); $v = $e['data']['instant']['details']['air_temperature'] ?? null; if (!$t || !is_numeric($v)) continue;
      if ($t < $now - 3600 || $t > $now + 24 * 3600) continue;
      if ($cur === null) $cur = ['t' => (float)$v, 'c' => (string)($e['data']['next_1_hours']['summary']['symbol_code'] ?? ($e['data']['next_6_hours']['summary']['symbol_code'] ?? ''))];
      $mx = $mx === null ? (float)$v : max($mx, (float)$v); $mn = $mn === null ? (float)$v : min($mn, (float)$v);
      $pr = $e['data']['next_1_hours']['details']['precipitation_amount'] ?? null; if (is_numeric($pr)) $rain += (float)$pr; }
    if ($cur === null || $cur['t'] < -10 || $cur['t'] > 55 || !preg_match('/^[a-z_]{0,40}$/', $cur['c'])) return null;
    return ['t' => (int)round($cur['t']), 'c' => $cur['c'], 'max' => (int)round($mx), 'min' => (int)round($mn), 'rain' => round($rain, 1), 'at' => (new DateTime('now', $tz))->format('H:i')];
  });
  $fx = $cached('fx', 6 * 3600, 48 * 3600, function () use ($get, $tz) {
    $j = json_decode((string)$get('https://open.er-api.com/v6/latest/USD'), true); if (($j['result'] ?? '') !== 'success') return null;
    $pyg = $j['rates']['PYG'] ?? null; $brl = $j['rates']['BRL'] ?? null; if (!is_numeric($pyg) || !is_numeric($brl) || $pyg < 3000 || $pyg > 30000 || $brl < 1 || $brl > 30) return null;
    $u = (int)($j['time_last_update_unix'] ?? 0);
    return ['usd' => (int)(round($pyg / 10) * 10), 'brl' => (int)round($pyg / $brl), 'd' => (new DateTime('@' . ($u > 1600000000 ? $u : time())))->setTimezone($tz)->format('Y-m-d')];
  });
  header('Cache-Control: public, max-age=600'); echo json_encode(['w' => $w, 'fx' => $fx]); exit;
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
  $wa = preg_replace('/\D/', '', (string)($st['whatsapp'] ?? '')); if (strlen($wa) >= 8) $o['wa'] = $wa; // o mesmo WhatsApp público do catálogo (botão nos destaques)
  if (!function_exists('guia_reviews')) require_once __DIR__ . '/guia_lib.php';
  $rv = guia_reviews($id, $s); if ($rv) { $o['rt'] = $rv['avg']; $o['rn'] = $rv['n']; }
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
