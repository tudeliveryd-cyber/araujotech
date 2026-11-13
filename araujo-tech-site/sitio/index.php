<?php
@ini_set('display_errors', '0'); // avisos do PHP nunca aparecem na página do cliente
// Site do cliente (araujotechsistemas.com/<nome>).
// Entrega o mesmo index.html, mas já com título, descrição e foto do negócio nas etiquetas
// que o WhatsApp, o Facebook e o Google leem (eles não rodam JavaScript).
// Qualquer falha aqui só faz cair no index.html normal.
header('Content-Type: text/html; charset=utf-8');
$html = @file_get_contents(__DIR__ . '/index.html');
if ($html === false) { http_response_code(500); exit('Error'); }
try {
  $slug = '';
  if (isset($_GET['s'])) $slug = $_GET['s'];
  else {
    $path = trim((string)parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
    $slug = explode('/', $path)[0] ?? '';
  }
  $slug = strtolower(trim($slug));
  if ($slug !== '' && $slug !== 'sitio' && preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $slug)) {
    $rec = at_site($slug);
    if ($rec) $html = at_meta($html, $rec, $slug);
  }
} catch (Throwable $e) { /* segue com o html normal */ }
echo $html;

function at_http($url, $post = null) {
  if (function_exists('curl_init')) {
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 4]);
    if ($post !== null) { curl_setopt($c, CURLOPT_POST, true); curl_setopt($c, CURLOPT_POSTFIELDS, $post); curl_setopt($c, CURLOPT_HTTPHEADER, ['Content-Type: application/json']); }
    $r = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE);
    return ($r !== false && $code >= 200 && $code < 300) ? $r : null;
  }
  $opt = ['http' => ['timeout' => 6, 'ignore_errors' => true]];
  if ($post !== null) $opt['http'] += ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => $post];
  $r = @file_get_contents($url, false, stream_context_create($opt));
  return $r === false ? null : $r;
}
function at_val($v) {
  if (!is_array($v)) return null;
  if (isset($v['stringValue'])) return $v['stringValue'];
  if (isset($v['integerValue'])) return (int)$v['integerValue'];
  if (isset($v['doubleValue'])) return $v['doubleValue'];
  if (isset($v['booleanValue'])) return $v['booleanValue'];
  if (isset($v['mapValue'])) { $o = []; foreach (($v['mapValue']['fields'] ?? []) as $k => $x) $o[$k] = at_val($x); return $o; }
  if (isset($v['arrayValue'])) return array_map('at_val', $v['arrayValue']['values'] ?? []);
  return null;
}
function at_site($slug) {
  $cache = sys_get_temp_dir() . '/at_site_' . md5($slug) . '.json';
  if (is_file($cache) && time() - filemtime($cache) < 300) { $d = json_decode(@file_get_contents($cache), true); if (is_array($d)) return $d ?: null; }
  $q = json_encode(['structuredQuery' => [
    'select' => ['fields' => [['fieldPath' => 'site.name'], ['fieldPath' => 'site.tag'], ['fieldPath' => 'site.about'], ['fieldPath' => 'site.tpl'], ['fieldPath' => 'site.ph'], ['fieldPath' => 'site.on'], ['fieldPath' => 'site.city'], ['fieldPath' => 'status']]],
    'from' => [['collectionId' => 'shops']],
    'where' => ['fieldFilter' => ['field' => ['fieldPath' => 'site.slug'], 'op' => 'EQUAL', 'value' => ['stringValue' => $slug]]],
    'limit' => 1]]);
  $r = at_http('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents:runQuery?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U', $q);
  if ($r === null) return null;
  $j = json_decode($r, true); $rec = [];
  foreach ((array)$j as $row) {
    if (!empty($row['document'])) {
      $f = $row['document']['fields'] ?? [];
      $rec = ['id' => basename($row['document']['name']), 'site' => at_val($f['site'] ?? null) ?: [], 'status' => at_val($f['status'] ?? null)];
      break;
    }
  }
  @file_put_contents($cache, json_encode($rec));
  return $rec ?: null;
}
function at_meta($html, $rec, $slug) {
  $s = $rec['site']; $e = function ($x) { return htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8'); };
  if (($s['on'] ?? true) === false || ($rec['status'] ?? '') === 'suspenso') return $html;
  $name = trim((string)($s['name'] ?? '')); if ($name === '') return $html;
  $tag = trim((string)($s['tag'] ?? ''));
  $desc = trim((string)($s['about'] ?? '')) ?: ($tag ?: $name);
  if (function_exists('mb_substr') && mb_strlen($desc) > 160) $desc = rtrim(mb_substr($desc, 0, 157)) . '…';
  $tplImg = ['restaurante' => 'photo-1644447381290-85358ae625cb', 'farmacia' => 'photo-1580281657529-557a6abb6387', 'iglesia' => 'photo-1709482590897-1e647801cb2d', 'comercio' => 'photo-1672777368915-609039407e1c'];
  $ph = $s['ph'] ?? [];
  if (!empty($ph['h'])) $img = 'https://araujotechsistemas.com/sitio/img.php?id=' . rawurlencode($rec['id']) . '&k=sh&v=' . rawurlencode((string)($ph['v'] ?? '1'));
  else $img = 'https://images.unsplash.com/' . ($tplImg[$s['tpl'] ?? ''] ?? $tplImg['comercio']) . '?auto=format&fit=crop&w=1200&h=630&q=70';
  $title = $name . ($tag ? ' — ' . $tag : '');
  $url = 'https://araujotechsistemas.com/' . $slug;
  $meta = "<title>{$e($title)}</title>\n"
    . "<meta property=\"og:type\" content=\"website\">\n"
    . "<meta property=\"og:site_name\" content=\"{$e($name)}\">\n"
    . "<meta property=\"og:title\" content=\"{$e($title)}\">\n"
    . "<meta property=\"og:description\" content=\"{$e($desc)}\">\n"
    . "<meta property=\"og:url\" content=\"{$e($url)}\">\n"
    . "<meta property=\"og:image\" content=\"{$e($img)}\">\n"
    . "<meta name=\"twitter:card\" content=\"summary_large_image\">\n"
    . "<link rel=\"canonical\" href=\"{$e($url)}\">";
  $html = preg_replace('#<title>[^<]*</title>#', $meta, $html, 1);
  $html = preg_replace('#<meta name="description" content="[^"]*">#', '<meta name="description" content="' . $e($desc) . '">', $html, 1);
  return $html;
}
