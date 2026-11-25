<?php
@ini_set('display_errors', '0'); error_reporting(0);
// 25/11 (Jean): "link para o Instagram" de cada negócio da Guía: guiadesantarita.com/l/<nome>.
// Uma página só do negócio (logo, WhatsApp, ligar, como chegar, Instagram, menu, horários), para pôr na bio do Instagram dele.
// Usa os mesmos dados da ficha da Guía (guia_item); se o negócio sair da Guía, a página avisa e manda para a Guía.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
require __DIR__ . '/../sitio/prods_lib.php';
require __DIR__ . '/../sitio/guia_lib.php';
$id = (string)($_GET['id'] ?? '');
$x = preg_match('/^[a-z0-9-]{2,90}$/', $id) ? guia_item('negocio', $id) : null;
$e = function ($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); };
$G = 'https://guiadesantarita.com/';
$wa = function ($n) { $n = preg_replace('/\D/', '', (string)$n); if ($n !== '' && $n[0] === '0') $n = '595' . substr($n, 1); elseif ($n !== '' && strpos($n, '595') !== 0 && strlen($n) <= 10) $n = '595' . $n; return $n; };
$safe = function ($u) { return preg_match('#^https://[^\s"\'<>]+$#i', (string)$u) ? (string)$u : ''; };
if (!$x) {
  http_response_code(404);
  echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guía de Santa Rita</title><meta name="robots" content="noindex"><style>body{font-family:system-ui,sans-serif;background:#24093F;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px}a{color:#FFC21A;font-weight:700}</style></head><body><p>Este enlace ya no está disponible.<br><br><a href="' . $G . '">Ver la Guía de Santa Rita</a></p></body></html>';
  exit;
}
$n = (string)$x['n']; $d = trim((string)($x['dx'] ?? '') ?: (string)($x['d'] ?? '')); $self = $G . 'l/' . rawurlencode($id); $ficha = $G . 'negocio/' . rawurlencode($id);
$lg = (string)($x['lg'] ?? ''); $lgU = $lg !== '' ? (preg_match('#^https?://#', $lg) ? $lg : 'https://guiadesantarita.com' . $lg) : '';
$w = $wa($x['wa'] ?? '') ?: (preg_match('/^(\+?595|0)?9\d{8}$/', preg_replace('/\D/', '', (string)($x['tel'] ?? ''))) ? $wa($x['tel']) : '');
$tel = preg_replace('/[^\d+]/', '', (string)($x['tel'] ?? ''));
$map = $safe($x['map'] ?? '') ?: 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($n . ' Santa Rita, Alto Paraná, Paraguay');
$ig = trim((string)($x['ig'] ?? '')); $igU = $ig === '' ? '' : (preg_match('#^https://#', $ig) ? $safe($ig) : 'https://instagram.com/' . rawurlencode(ltrim($ig, '@')));
$mu = $safe($x['mu'] ?? '');
$dy = (is_array($x['dy'] ?? null) && count($x['dy']) === 7) ? array_values($x['dy']) : null;
$hrs = trim((string)($x['hrs'] ?? ''));
// 25/11 (Jean): o próprio cliente personaliza o link no painel dele (Mi cuenta): botões e ordem, serviços, cor e "cerrado hasta"
$web = $safe($x['web'] ?? '');
$sv = array_values(array_filter((array)($x['sv'] ?? []), 'is_array'));
$cz = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($x['cz'] ?? '')) ? (string)$x['cz'] : '';
$COR = ['pur' => ['#24093F', '#8A12D6', '#4A0A80'], 'azu' => ['#0A1E3F', '#1F6FD1', '#123D7A'], 'ver' => ['#062B22', '#169B62', '#0B5A3E'], 'roj' => ['#2E0710', '#D12A3F', '#7A1424'], 'nar' => ['#2E1405', '#E8711A', '#8A3B0B'], 'neg' => ['#121014', '#55525C', '#2A272F']];
$C = $COR[$x['cor'] ?? ''] ?? $COR['pur'];
$TR = []; foreach ([$d, $hrs] as $tt) if (($tp = guia_tr($tt)) !== '') $TR[$tt] = $tp; // português automático
$DN = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
$rows = [];
if ($dy) foreach ([1, 2, 3, 4, 5, 6, 0] as $k) { $o = $dy[$k]; $r = [];
  if (!empty($o['on'])) foreach (['a', 'b'] as $s) { $p = $o[$s] ?? []; if (!empty($p[0]) && !empty($p[1])) $r[] = $p[0] === $p[1] ? '24 horas' : $p[0] . '–' . $p[1]; }
  $rows[] = [$k, $DN[$k], $r ? implode(' · ', $r) : 'Cerrado']; }
$desc = $d !== '' ? $n . ' · ' . $d . ' · Santa Rita' : $n . ' · Santa Rita';
$ic = function ($p) { return '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' . $p . '</svg>'; };
$I = ['wa' => '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2z"/>', 'tel' => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>', 'map' => '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 'ig' => '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/>', 'mu' => '<path d="M4 5h16M4 12h16M4 19h10"/>', 'sh' => '<path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>', 'gu' => '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><path d="M9 10h6"/>', 'clk' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 'web' => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'];
$msg = 'Hola, te encontré en la Guía de Santa Rita y quiero más información.';
?><!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?= $e($n) ?> · Guía de Santa Rita</title>
<meta name="description" content="<?= $e($desc) ?>">
<link rel="canonical" href="<?= $e($ficha) ?>">
<meta property="og:type" content="profile"><meta property="og:title" content="<?= $e($n) ?>"><meta property="og:description" content="<?= $e($desc) ?>"><meta property="og:url" content="<?= $e($self) ?>"><meta property="og:image" content="<?= $e($lgU ?: 'https://araujotechsistemas.com/img/guia/og-guia.jpg?v=3') ?>">
<link rel="icon" href="<?= $e($lgU ?: '/img/guia/favicon.png?v=4') ?>"><meta name="theme-color" content="<?= $C[0] ?>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--night:<?= $C[0] ?>;--deep:<?= $C[2] ?>;--purple:<?= $C[1] ?>;--yellow:#FFC21A;--ok:#15803D;--display:"Red Hat Display",system-ui,sans-serif;--text:"Red Hat Text",system-ui,sans-serif}
*{box-sizing:border-box;margin:0}
body{font-family:var(--text);color:#fff;min-height:100vh;background:radial-gradient(520px 420px at 85% -5%,color-mix(in srgb,var(--purple) 75%,transparent),transparent 70%),radial-gradient(520px 520px at 0% 105%,color-mix(in srgb,var(--deep) 90%,transparent),transparent 65%),var(--night);line-height:1.45}
.w{max-width:480px;margin:0 auto;padding:40px 18px 28px;display:flex;flex-direction:column;align-items:center;text-align:center}
.lg{width:124px;height:124px;border-radius:30px;background:#fff;overflow:hidden;display:grid;place-items:center;box-shadow:0 20px 50px rgba(0,0,0,.45);border:3px solid rgba(255,255,255,.9)}
.lg img{width:100%;height:100%;object-fit:cover;display:block}
.lg b{font-family:var(--display);font-weight:900;font-size:46px;color:var(--deep)}
h1{font-family:var(--display);font-weight:900;font-size:30px;line-height:1.1;letter-spacing:-.3px;margin-top:18px}
.d{color:#DCCDF5;font-size:16.5px;margin-top:6px}
.st{display:inline-flex;align-items:center;gap:7px;margin-top:12px;font-size:14px;font-weight:700;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.12)}
.st i{width:8px;height:8px;border-radius:50%;background:#9CA3AF}.st.on i{background:#22C55E}.st.on{background:rgba(34,197,94,.18)}
.bts{width:100%;display:flex;flex-direction:column;gap:12px;margin-top:26px}
.bt{display:flex;align-items:center;gap:12px;width:100%;padding:16px 18px;border-radius:18px;text-decoration:none;font-weight:700;font-size:16.5px;color:var(--night);background:#fff;border:0;font-family:inherit;cursor:pointer;text-align:left}
.bt span{flex:1}.bt svg{flex:none}
.bt.wa{background:var(--ok);color:#fff}
.bt.gh{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.22)}
.bt:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
.hr{width:100%;margin-top:22px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:18px;padding:14px 16px;text-align:left}
.hr h2{display:flex;align-items:center;gap:8px;font-family:var(--display);font-size:16px;font-weight:900;margin-bottom:8px}
.hr table{width:100%;border-collapse:collapse;font-size:14.5px}.hr td{padding:4px 0;color:#E3D3FA}.hr td:last-child{text-align:right;color:#fff;font-weight:700}
.hr tr.hoy td{color:var(--yellow)}
.hr p{color:#E3D3FA;font-size:14.5px}
.ft{margin-top:26px;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:13.5px;color:#CDB8F0}
.ft a{color:#fff;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
.ft img{height:28px;width:auto}
.ft .an{color:var(--yellow)}
.sv{width:100%;margin-top:22px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:18px;padding:14px 16px;text-align:left}
.sv h2{font-family:var(--display);font-size:16px;font-weight:900;margin-bottom:6px}
.sv li{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-top:1px solid rgba(255,255,255,.1);font-size:15px;list-style:none}.sv li:first-child{border-top:0}
.sv ul{padding:0}.sv b{white-space:nowrap;color:var(--yellow)}
.st.cz{background:rgba(239,68,68,.2)}.st.cz i{background:#EF4444}
.tst{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#fff;color:var(--night);font-weight:700;padding:10px 16px;border-radius:999px;display:none}
</style></head><body>
<main class="w">
 <div class="lg"><?= $lgU ? '<img src="' . $e($lgU) . '" alt="">' : '<b>' . $e(mb_strtoupper(mb_substr($n, 0, 1))) . '</b>' ?></div>
 <h1><?= $e($n) ?></h1>
 <?= $d !== '' ? '<p class="d">' . $e($d) . '</p>' : '' ?>
 <span class="st" id="st" hidden><i></i><b></b></span>
 <div class="bts">
<?php
$B = [];
if ($w) $B['wa'] = '<a class="bt wa" data-c="wa" href="' . $e('https://wa.me/' . $w . '?text=' . rawurlencode($msg)) . '" target="_blank" rel="noopener">' . $ic($I['wa']) . '<span>Escribir por WhatsApp</span></a>';
if ($tel !== '') $B['tel'] = '<a class="bt" data-c="tel" href="tel:' . $e($tel) . '">' . $ic($I['tel']) . '<span>Llamar</span></a>';
if ($mu) $B['mu'] = '<a class="bt" data-c="mu" href="' . $e($mu) . '" target="_blank" rel="noopener">' . $ic($I['mu']) . '<span>Ver menú o catálogo</span></a>';
$B['map'] = '<a class="bt" data-c="map" href="' . $e($map) . '" target="_blank" rel="noopener">' . $ic($I['map']) . '<span>Cómo llegar</span></a>';
if ($igU) $B['ig'] = '<a class="bt gh" data-c="ig" href="' . $e($igU) . '" target="_blank" rel="noopener">' . $ic($I['ig']) . '<span>Instagram</span></a>';
if ($web) $B['web'] = '<a class="bt gh" data-c="web" href="' . $e($web) . '" target="_blank" rel="noopener">' . $ic($I['web']) . '<span>Sitio web</span></a>';
$B['gu'] = '<a class="bt gh" data-c="gu" href="' . $e($ficha) . '">' . $ic($I['gu']) . '<span>Ver en la Guía de Santa Rita</span></a>';
$B['sh'] = '<button class="bt gh" type="button" id="sh">' . $ic($I['sh']) . '<span>Compartir</span></button>';
$ord = is_array($x['bt'] ?? null) ? $x['bt'] : ['wa', 'tel', 'mu', 'map', 'ig', 'web', 'gu', 'sh'];
foreach ($ord as $k) if (isset($B[$k])) echo '  ' . $B[$k] . "\n";
?>
 </div>
 <?php if ($sv): ?><section class="sv"><h2>Servicios</h2><ul><?php foreach ($sv as $v): ?><li><span><?= $e($v['t'] ?? '') ?></span><?= ($v['p'] ?? '') !== '' ? '<b>' . $e($v['p']) . '</b>' : '' ?></li><?php endforeach; ?></ul></section><?php endif; ?>
 <?php if ($rows || $hrs !== ''): ?><section class="hr"><h2><?= $ic($I['clk']) ?><span>Horarios</span></h2><?php if ($rows): ?><table><?php foreach ($rows as [$k, $dn, $v]): ?><tr data-d="<?= $k ?>"><td><?= $e($dn) ?></td><td><?= $e($v) ?></td></tr><?php endforeach; ?></table><?php endif; ?><?= $hrs !== '' ? '<p' . ($rows ? ' style="margin-top:8px"' : '') . '>' . $e($hrs) . '</p>' : '' ?></section><?php endif; ?>
 <div class="ft"><a href="<?= $G ?>"><img src="/img/guia/guia-logo.webp" alt="Guía de Santa Rita" width="58" height="28"></a><span>Encontrá más negocios de Santa Rita en la Guía</span><a class="an" href="<?= $G ?>anunciar/">¿Querés tu link como este?</a></div>
</main>
<p class="tst" id="tst">Enlace copiado</p>
<script>
(()=>{const DY=<?= json_encode($dy, JSON_HEX_TAG | JSON_HEX_AMP) ?>,TR=<?= json_encode((object)$TR, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>,SL=<?= json_encode($id) ?>,CZ=<?= json_encode($cz) ?>;
 let L='es';try{const s=localStorage.getItem('at_lang');L=s?s:(/^pt/i.test(navigator.language||'')?'pt':'es')}catch(e){L=/^pt/i.test(navigator.language||'')?'pt':'es'}
 const now=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Asuncion'})),wd=now.getDay(),mn=now.getHours()*60+now.getMinutes(),toM=s=>{const m=/^(\d{1,2}):(\d{2})$/.exec(s||'');return m?+m[1]*60+ +m[2]:null};
 const hoy=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
 if(CZ&&CZ>=hoy){const st=document.getElementById('st');st.hidden=false;st.classList.add('cz');st.querySelector('b').textContent=CZ===hoy?(L==='pt'?'Fechado hoje':'Cerrado hoy'):(L==='pt'?'Fechado até ':'Cerrado hasta ')+CZ.slice(8,10)+'/'+CZ.slice(5,7);const tr=document.querySelector('tr[data-d="'+wd+'"]');if(tr)tr.className='hoy'}
 else if(Array.isArray(DY)&&DY.length===7){let on=false,un='';const chk=(d,off)=>{const o=DY[d];if(!o||!o.on)return;[o.a,o.b].forEach(r=>{if(!r||!r[0]||!r[1])return;const a=toM(r[0]);let b=toM(r[1]);if(a==null||b==null)return;if(b<=a)b+=1440;const n=mn+off;if(n>=a&&n<b){on=true;un=r[0]===r[1]?'':r[1]}})};chk(wd,0);if(!on)chk((wd+6)%7,1440);
  const st=document.getElementById('st');st.hidden=false;st.classList.toggle('on',on);st.querySelector('b').textContent=on?(L==='pt'?'Aberto agora':'Abierto ahora')+(un?(L==='pt'?' · até ':' · hasta ')+un:''):(L==='pt'?'Fechado agora':'Cerrado ahora');
  const tr=document.querySelector('tr[data-d="'+wd+'"]');if(tr)tr.className='hoy'}
 const beacon=q=>{try{if(!navigator.webdriver&&navigator.sendBeacon)navigator.sendBeacon('https://araujotechsistemas.com/sitio/guia_hit.php?'+q)}catch(e){}};
 beacon('t=p&id=bio');document.querySelectorAll('[data-c]').forEach(a=>a.addEventListener('click',()=>beacon('t=c&id='+encodeURIComponent(('bio-'+SL).slice(0,70)))));
 document.getElementById('sh').addEventListener('click',async()=>{const u=location.href.split('?')[0];try{if(navigator.share){await navigator.share({title:document.title,url:u});return}}catch(e){return}try{await navigator.clipboard.writeText(u);const t=document.getElementById('tst');t.style.display='block';setTimeout(()=>t.style.display='none',1800)}catch(e){}});
 if(L==='pt'){document.documentElement.lang='pt';const U={'Escribir por WhatsApp':'Escrever pelo WhatsApp','Llamar':'Ligar','Ver menú o catálogo':'Ver menu ou catálogo','Cómo llegar':'Como chegar','Ver en la Guía de Santa Rita':'Ver no Guia de Santa Rita','Compartir':'Compartilhar','Sitio web':'Site','Servicios':'Serviços','Horarios':'Horários','Domingo':'Domingo','Lunes':'Segunda','Martes':'Terça','Miércoles':'Quarta','Jueves':'Quinta','Viernes':'Sexta','Sábado':'Sábado','Cerrado':'Fechado','Encontrá más negocios de Santa Rita en la Guía':'Encontre mais negócios de Santa Rita no Guia','¿Querés tu link como este?':'Quer um link como este?','Enlace copiado':'Link copiado'};
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode())a.push(w.currentNode);a.forEach(n=>{const k=n.nodeValue.trim();const v=TR[k]||U[k];if(k&&v)n.nodeValue=n.nodeValue.replace(k,v)});
  document.querySelectorAll('a[href*="wa.me"]').forEach(x=>x.href=x.href.replace(/text=[^&]*/,'text='+encodeURIComponent('Olá, te encontrei no Guia de Santa Rita e quero mais informações.')))}
})();
</script>
</body></html>
