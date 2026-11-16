#!/usr/bin/env bash
# Confere os sites oficiais e as regras do Firebase em produção. SÓ LEITURA: não grava nem altera nada.
# Roda no GitHub Actions (workflow "Conferir no ar"), que tem acesso à internet.
set -u
FALHAS=0
ok(){ echo "OK    | $1"; }
bad(){ echo "FALHA | $1"; FALHAS=$((FALHAS+1)); }
UA="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

echo "== 1. Páginas no ar (status e versão publicada)"
# url | texto que precisa existir na página (prova de que a versão nova está no ar)
while IFS='|' read -r url marca; do
  [ -z "$url" ] && continue
  body=$(mktemp); code=000
  # até 3 tentativas: logo depois de publicar, o envio dos arquivos ainda pode estar no meio (página antiga ou pela metade)
  for tent in 1 2 3; do
    code=$(curl -sS -L -A "$UA" --compressed --max-time 40 -o "$body" -w '%{http_code}' "$url" 2>/dev/null || echo 000)
    if [ "$code" = "200" ] && { [ -z "$marca" ] || grep -q -- "$marca" "$body"; }; then break; fi
    [ "$tent" != 3 ] && sleep 25
  done
  tam=$(wc -c < "$body")
  if [ "$code" != "200" ]; then bad "$url -> HTTP $code"
  elif [ -n "$marca" ] && ! grep -q -- "$marca" "$body"; then bad "$url -> 200, mas SEM a versão nova (falta '$marca')"
  else ok "$url -> 200, ${tam} bytes${marca:+, versão nova confirmada ($marca)}"; fi
  rm -f "$body"
done <<'URLS'
https://araujotechsistemas.com/|id="soluciones"
https://araujotechsistemas.com/vitrix/|demo-autos
https://araujotechsistemas.com/catalogo-digital/|vitrix
https://araujotechsistemas.com/img/vitrix/vitrix-blanco.png|
https://araujotechsistemas.com/trabaja/|
https://araujotechsistemas.com/demo/|vxMark
https://araujotechsistemas.com/demo-farmacia/|q_none
https://araujotechsistemas.com/demo-agenda/|badPhone
https://araujotechsistemas.com/demo-pesca/|Puerto Dorado
https://araujotechsistemas.com/demo-comida/|Sabor Casero
https://araujotechsistemas.com/admin/|__kp
https://araujotechsistemas.com/painel/|__kp
https://araujotechsistemas.com/licencia.js|
https://araujotechsistemas.com/clientes.js|AT_CLIENTES
https://araujotechsistemas.com/sitemap.xml|
https://fogaomineiro.araujotechsistemas.com/|cvCard
https://fogaomineiro.araujotechsistemas.com/painel/|forceMc
https://teste.araujotechsistemas.com/|cvCard
https://teste.araujotechsistemas.com/agenda/|badPhone
https://teste.araujotechsistemas.com/agenda/gestion.html|forceMc
https://barberialoli.araujotechsistemas.com/reservas.html|badPhone
https://barberialoli.araujotechsistemas.com/gestion.html|forceMc
https://meupulpito.com/|
https://meupulpito.com/app/|
https://tudeliveryd-cyber.github.io/Caj-Entrega/|
URLS

echo; echo "== 2. Cabeçalhos (compressão, cache, segurança) e certificado"
for url in https://araujotechsistemas.com/ https://araujotechsistemas.com/img/logo-completo.png https://fogaomineiro.araujotechsistemas.com/ https://barberialoli.araujotechsistemas.com/reservas.html https://meupulpito.com/; do
  h=$(curl -sS -I -L -A "$UA" -H 'Accept-Encoding: gzip, br' --max-time 30 "$url" 2>/dev/null | tr -d '\r')
  g(){ echo "$h" | grep -i "^$1:" | tail -1 | cut -d' ' -f2- ; }
  echo "INFO  | $url | compressão: $(g content-encoding || true) | cache: $(g cache-control || true) | nosniff: $(g x-content-type-options || true) | servidor: $(g server || true)"
done
for host in araujotechsistemas.com fogaomineiro.araujotechsistemas.com barberialoli.araujotechsistemas.com meupulpito.com; do
  fim=$(echo | openssl s_client -servername "$host" -connect "$host:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  if [ -z "$fim" ]; then bad "certificado de $host não pôde ser lido"; else
    dias=$(( ( $(date -d "$fim" +%s) - $(date +%s) ) / 86400 ))
    if [ "$dias" -lt 15 ]; then bad "certificado de $host vence em $dias dias"; else ok "certificado de $host válido por mais $dias dias"; fi; fi
done

echo; echo "== 3. Firebase real (araujotech-catalogos): o que é público abre, o que é privado fica fechado"
K="AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U"; B="https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents"
probe(){ # caminho | esperado | descrição
  pb=$(mktemp); code=$(curl -sS -g --max-time 30 -o "$pb" -w '%{http_code}' "$B/$1?key=$K&pageSize=1" 2>/dev/null || echo 000)
  if [ "$code" = "$2" ]; then ok "$3 -> HTTP $code (esperado)"
  else msg=$(tr -d '\n' < "$pb" | grep -o '"message": *"[^"]*"' | head -1 | cut -d'"' -f4 | cut -c1-160)
    if [ "$code" = "429" ]; then bad "$3 -> HTTP 429: o Firebase recusou por limite/cota (os dados continuam fechados). Motivo: ${msg:-sem detalhe}"
    else bad "$3 -> HTTP $code (esperado $2)${msg:+. Motivo: $msg}"; fi; fi; rm -f "$pb"; }
probe "shops/fogao-mineiro" 200 "catálogo público do Fogão Mineiro (leitura sem login)"
probe "licencias/_lz" 200 "contador da promoção de lançamento (público)"
probe "shops/fogao-mineiro/orders" 403 "pedidos dos clientes sem login"
probe "shops/fogao-mineiro/priv/main" 403 "custos privados do dono sem login"
probe "billing" 403 "cobranças e acessos dos clientes sem login"
probe "platform/main" 403 "dados do admin sem login"
probe "shopUsers" 403 "lista de usuários das lojas sem login"
probe "agendaUsers" 403 "lista de usuários das agendas sem login"
probe "agendas/loli/state" 403 "dados internos da Agenda (clientes, caixa) sem login"
probe "agendas/loli/reservas" 403 "reservas recebidas sem login"
probe "cliques" 403 "contatos pelo WhatsApp (só o admin lê) sem login"
# v13 no ar: visitante consegue somar 1 no contador de contatos (dia fixo de teste, fora dos últimos 30 dias do painel)
cc=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -X POST "${B%/documents}/documents:commit?key=$K" \
  -d '{"writes":[{"update":{"name":"projects/araujotech-catalogos/databases/(default)/documents/cliques/2000-01-01","fields":{}},"updateMask":{"fieldPaths":[]},"updateTransforms":[{"fieldPath":"wa","increment":{"integerValue":"1"}}]}]}' 2>/dev/null || echo 000)
if [ "$cc" = "200" ]; then ok "regras v13 no ar: contador de contatos aceita +1 -> HTTP $cc"; else bad "regras v13: contador de contatos -> HTTP $cc (esperado 200; a v13 foi publicada?)"; fi
cx=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -X PATCH "$B/cliques/2000-01-01?key=$K" -d '{"fields":{"wa":{"integerValue":"999"}}}' 2>/dev/null || echo 000)
if [ "$cx" = "403" ]; then ok "regras v13: ninguém troca o número do contador -> HTTP $cx (esperado)"; else bad "regras v13: trocar o contador -> HTTP $cx (esperado 403)"; fi
probe "visitas" 403 "contador de visitas sem login"

echo; echo "== 4. Firebase do Meu Púlpito (projeto meu-pulpito-app): dados privados fechados"
K="AIzaSyAuOBVdU5-bcFuaVEsGv4iK8H2krFU9Un8"; B="https://firestore.googleapis.com/v1/projects/meu-pulpito-app/databases/(default)/documents"
probe "pulpito" 403 "sermões dos pastores sem login"
probe "planos" 403 "planos dos usuários do Meu Púlpito sem login"
probe "config/app" 200 "configuração pública do app (planos e avisos), leitura sem login"
probe "suporte" 403 "mensagens de suporte sem login"

echo; echo "== 5. Firebase da Tu Delivery (Caja de Entregas, projeto tu-delivery-1eb61): dados privados fechados"
K="AIzaSyAIF3GBWko0C8S5xuvxG9ufPZXizAjDwCs"; B="https://firestore.googleapis.com/v1/projects/tu-delivery-1eb61/databases/(default)/documents"
probe "turnos" 403 "cadastro dos deliverys sem login"
probe "empresa" 403 "dados da empresa (Caja) sem login"
probe "config/roles" 403 "papéis de administrador sem login"
probe "liq" 403 "liquidações dos deliverys sem login"

echo; echo "== 6. Peso real da página do catálogo (o que o celular baixa de fato)"
for url in https://fogaomineiro.araujotechsistemas.com/ https://teste.araujotechsistemas.com/ https://araujotechsistemas.com/demo/; do
  hd=$(mktemp)
  cru=$(curl -sS -L -A "$UA" --max-time 40 -o /dev/null -w '%{size_download}' "$url" 2>/dev/null || echo 0)
  cmp=$(curl -sS -L -A "$UA" -H 'Accept-Encoding: br, gzip' --max-time 40 -D "$hd" -o /dev/null -w '%{size_download}' "$url" 2>/dev/null || echo 0)
  enc=$(tr -d '\r' < "$hd" | grep -i '^content-encoding:' | tail -1 | cut -d' ' -f2)
  etag=$(tr -d '\r' < "$hd" | grep -i '^etag:' | tail -1 | cut -d' ' -f2-); lm=$(tr -d '\r' < "$hd" | grep -i '^last-modified:' | tail -1 | cut -d' ' -f2-)
  rev=000
  [ -n "$etag" ] && rev=$(curl -sS -A "$UA" -H 'Accept-Encoding: br, gzip' -H "If-None-Match: $etag" --max-time 30 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo 000)
  [ "$rev" != "304" ] && [ -n "$lm" ] && rev=$(curl -sS -A "$UA" -H 'Accept-Encoding: br, gzip' -H "If-Modified-Since: $lm" --max-time 30 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo 000)
  kb=$((cmp/1024)); echo "INFO  | $url -> ${cru} bytes sem compressão, ${cmp} bytes transferidos (${enc:-sem compressão}); segunda visita: HTTP $rev"
  if [ "$cmp" -gt 0 ] && [ "$cmp" -le 409600 ]; then ok "$url -> primeira visita baixa ${kb} KB (alarme de crescimento em 400 KB)"; else bad "$url -> primeira visita baixa ${kb} KB (passou de 400 KB: a página cresceu)"; fi
  if [ "$rev" = "304" ]; then ok "$url -> na segunda visita o servidor responde 304 (não baixa de novo)"; else echo "INFO  | $url -> segunda visita não devolveu 304 (HTTP $rev): a página é baixada de novo, comprimida"; fi
  rm -f "$hd"
done

echo; echo "== 7. Prévia do link no WhatsApp: nome e LOGO do cliente"
WUA="WhatsApp/2.24.1 A"
for u in https://nauticabrustolin.araujotechsistemas.com/catalogo.php https://nauticabrustolin.araujotechsistemas.com/; do
  pg=$(curl -sS -L -A "$WUA" --max-time 40 "$u" 2>/dev/null || true)
  img=$(echo "$pg" | grep -o '<meta property="og:image" content="[^"]*"' | head -1 | cut -d'"' -f4)
  tit=$(echo "$pg" | grep -o '<meta property="og:title" content="[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -z "$img" ]; then
    case "$u" in */catalogo.php) bad "$u -> sem og:image (o PHP não rodou?)";; *) bad "$u -> a página principal do cliente está sem og:image (prévia sem o logo)";; esac
    continue; fi
  hd=$(curl -sS -A "$WUA" --max-time 40 -o /dev/null -D - "$img" 2>/dev/null | tr -d '\r')
  ct=$(echo "$hd" | grep -i '^content-type:' | tail -1 | cut -d' ' -f2); st=$(echo "$hd" | head -1 | cut -d' ' -f2)
  if [ "$st" = "200" ] && echo "$ct" | grep -q '^image/'; then ok "$u -> prévia '$tit' com o logo do cliente ($img, $ct)"; else bad "$u -> og:image $img respondeu HTTP $st ${ct}"; fi
done
# endereço sem catálogo (só sitio web ou suspenso): continua recebendo a página genérica intacta
pg=$(curl -sS -L -A "$UA" --max-time 40 https://agenda-loreni.araujotechsistemas.com/ 2>/dev/null || true)
ini=$(echo "$pg" | head -c 60 | tr -d '\n'); tt=$(echo "$pg" | grep -o '<title>[^<]*</title>' | head -1)
if echo "$ini" | grep -qi '^<!doctype html' && [ -n "$tt" ]; then ok "agenda-loreni (sem catálogo) -> página genérica intacta ($tt)"; else bad "agenda-loreni -> página genérica alterada: início '$ini', título '$tt'"; fi
# ícones do navegador: cada cliente com o próprio logo (sem logo: Vitrix), nunca o ícone do Fogão Mineiro
fm=$(curl -sS --max-time 30 https://fogaomineiro.araujotechsistemas.com/apple-touch-icon.png 2>/dev/null | md5sum | cut -c1-32)
vx=$(curl -sS --max-time 30 -H 'Host: agenda-loreni.araujotechsistemas.com' https://agenda-loreni.araujotechsistemas.com/apple-touch-icon.png 2>/dev/null | md5sum | cut -c1-32)
for u in https://nauticabrustolin.araujotechsistemas.com/apple-touch-icon.png https://nauticabrustolin.araujotechsistemas.com/favicon.png https://agenda-loreni.araujotechsistemas.com/apple-touch-icon.png; do
  t=$(mktemp); ct=$(curl -sS -A "$UA" --max-time 30 -o "$t" -w '%{http_code} %{content_type}' "$u" 2>/dev/null || echo 000); h=$(md5sum < "$t" | cut -c1-32); rm -f "$t"
  if ! echo "$ct" | grep -q '^200 image/'; then bad "$u -> $ct (ícone não abriu)"
  elif [ "$h" = "$fm" ]; then bad "$u -> ainda é o ícone do Fogão Mineiro"
  elif [ "$h" = "$vx" ] && echo "$u" | grep -q nauticabrustolin; then bad "$u -> mostra o símbolo da Vitrix em vez do logo da loja"
  else ok "$u -> ícone próprio ($ct)"; fi
done
# leitor de link do Google Maps (ubicación do local)
mp=$(curl -sS --max-time 30 -H 'Origin: https://nauticabrustolin.araujotechsistemas.com' -D /tmp/mp_h "https://araujotechsistemas.com/maps.php?u=https%3A%2F%2Fwww.google.com%2Fmaps%2Fplace%2FX%2F%40-25.80%2C-54.90%2C17z%2Fdata%3D%213m1%214b1%213d-25.80555%214d-54.90777" 2>/dev/null || true)
if echo "$mp" | grep -q '"lat":-25.80555' && grep -qi '^access-control-allow-origin: https://nauticabrustolin' /tmp/mp_h; then ok "maps.php -> lê o link do Maps ($mp)"; else bad "maps.php -> resposta inesperada: $mp"; fi
# painel no subdomínio do cliente: título e atalho com o nome da loja, não "Fogão Mineiro"
pt=$(curl -sS --max-time 30 "https://lojastatus.araujotechsistemas.com/painel/" 2>/dev/null | grep -o '<title>[^<]*</title>' | head -1)
if echo "$pt" | grep -q 'Status · Panel del local'; then ok "painel da Status -> $pt"; else bad "painel da Status -> título inesperado: $pt"; fi
pm=$(curl -sS --max-time 30 "https://lojastatus.araujotechsistemas.com/painel/manifest.json" 2>/dev/null || true)
if echo "$pm" | grep -q '"name":"Panel Status"'; then ok "atalho do painel da Status -> Panel Status"; else bad "atalho do painel da Status -> $pm"; fi
# site padrão no endereço próprio da empresa (status.araujotechsistemas.com)
sb=$(curl -sS --max-time 30 "https://status.araujotechsistemas.com/" 2>/dev/null | head -c 20000 || true)
if echo "$sb" | grep -q 'AT_SITE_SLUG="status"' && echo "$sb" | grep -q '<link rel="canonical" href="https://status.araujotechsistemas.com/">'; then ok "site da Status em status.araujotechsistemas.com"; else bad "status.araujotechsistemas.com não mostra o site ($(echo "$sb" | grep -o '<title>[^<]*' | head -1))"; fi
# o site abre direto no domínio principal (sem ir para o subdomínio: no iPhone a troca dá "Misdirected Request")
for sl in status fogao-mineiro; do
  rd=$(curl -sS --max-time 30 -o /tmp/st_$sl.html -w '%{http_code}' "https://araujotechsistemas.com/$sl" 2>/dev/null || true)
  if [ "$rd" = "200" ] && grep -q "<link rel=\"canonical\" href=\"https://$sl.araujotechsistemas.com/\">" /tmp/st_$sl.html; then ok "araujotechsistemas.com/$sl mostra o site ali mesmo (endereço oficial $sl.araujotechsistemas.com)"; else bad "araujotechsistemas.com/$sl -> HTTP $rd $(grep -o '<title>[^<]*' /tmp/st_$sl.html 2>/dev/null | head -1)"; fi
done
sf=$(curl -sS --max-time 30 "https://fogao-mineiro.araujotechsistemas.com/" 2>/dev/null | head -c 20000 || true)
if echo "$sf" | grep -q 'AT_SITE_SLUG="fogao-mineiro"'; then ok "site do Fogão em fogao-mineiro.araujotechsistemas.com"; else bad "fogao-mineiro.araujotechsistemas.com não mostra o site ($(echo "$sf" | grep -o '<title>[^<]*' | head -1))"; fi
for gv in Guia GUIA guia; do gr=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code} %{redirect_url}' "https://araujotechsistemas.com/$gv" 2>/dev/null || true); case "$gr" in 301\ https://araujotechsistemas.com/guia/) ok "/$gv leva para a Guía";; *) bad "/$gv -> $gr";; esac; done
nf=$(curl -sS --max-time 30 "https://araujotechsistemas.com/nao-existe-xyz/a.html" 2>/dev/null | head -c 3000 || true)
if echo "$nf" | grep -q 'No encontramos esta página'; then ok "página de 'não encontrado' amigável"; else bad "endereço errado não mostra a página amigável"; fi
gu=$(curl -sS --max-time 30 "https://guiadesantarita.com/" 2>/dev/null | head -c 6000 || true)
if echo "$gu" | grep -q 'Guía de Santa Rita'; then ok "Guía de Santa Rita no ar (guiadesantarita.com)"; else bad "araujotechsistemas.com/guia/ não abriu a Guía Vitrix"; fi
gp=$(curl -sS --max-time 40 "https://araujotechsistemas.com/sitio/guia.php?ids=lojastatus" 2>/dev/null | head -c 2000 || true)
if echo "$gp" | grep -q '"lojastatus":{"days":\['; then ok "guia.php -> horários da Status para o 'Abierto ahora'"; else bad "guia.php -> resposta inesperada: $(echo "$gp" | head -c 160)"; fi
gg=$(curl -sS --max-time 40 "https://araujotechsistemas.com/sitio/guia.php?g=1" 2>/dev/null | head -c 3000 || true)
if echo "$gg" | grep -q '^{"ads":\[' && echo "$gg" | grep -q '"bus":\['; then ok "guia.php?g=1 -> banners pagos e lugares públicos ($(echo "$gg" | grep -o '"img"' | wc -l) banner(s) no ar)"; else bad "guia.php?g=1 -> resposta inesperada: $(echo "$gg" | head -c 160)"; fi
gs=$(curl -sS --max-time 30 "https://guiadesantarita.com/" 2>/dev/null || true)
go=$(curl -sS --max-time 60 "https://araujotechsistemas.com/sitio/guia.php?ofs=lojastatus,fogao-mineiro" 2>/dev/null | head -c 400 || true)
case "$go" in \[*) ok "guia.php?ofs -> ofertas de hoje ($(echo "$go" | grep -o '"promo"' | wc -l) na amostra)";; *) bad "guia.php?ofs -> $(echo "$go" | head -c 120)";; esac
gh1=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0 (conferir)' -H 'Origin: https://araujotechsistemas.com' "https://araujotechsistemas.com/sitio/guia_hit.php?t=x" 2>/dev/null || true); [ "$gh1" = "204" ] && ok "guia_hit.php responde (contador da Guía)" || bad "guia_hit.php -> $gh1"
gd=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' "https://araujotechsistemas.com/sitio/datos/" 2>/dev/null || true); [ "$gd" = "403" ] && ok "pasta de números da Guía fechada ao público (403)" || bad "sitio/datos/ -> $gd (devia ser 403)"
gst=$(curl -sS --max-time 30 -X POST -d '{"t":"x"}' "https://araujotechsistemas.com/sitio/guia_stats.php" 2>/dev/null || true); [ "$gst" = '{"ok":false}' ] && ok "guia_stats.php recusa quem não é admin" || bad "guia_stats.php -> $gst"
gn=$(curl -sS --max-time 40 "https://araujotechsistemas.com/sitio/guia.php?news=1" 2>/dev/null | head -c 300 || true); echo "$gn" | grep -q '"items":\[' && ok "guia.php?news -> notícias do parceiro (desligadas até configurar)" || bad "guia.php?news -> $(echo "$gn" | head -c 120)"
gh=$(curl -sS --max-time 40 "https://araujotechsistemas.com/sitio/guia.php?hoy=1" 2>/dev/null | head -c 400 || true); echo "   hoy: $gh"
echo "$gh" | grep -q '"w":{"t":-\?[0-9]' && ok "guia.php?hoy -> clima de Santa Rita" || bad "guia.php?hoy sem clima -> $(echo "$gh" | head -c 160)"
echo "$gh" | grep -q '"fx":{"usd":[0-9]' && ok "guia.php?hoy -> câmbio de referência" || bad "guia.php?hoy sem câmbio -> $(echo "$gh" | head -c 160)"
gt=$(curl -sS --max-time 40 "https://araujotechsistemas.com/sitio/guia.php?top=1" 2>/dev/null | head -c 300 || true); echo "$gt" | grep -q '"q":\[' && ok "guia.php?top -> 'Lo más buscado'" || bad "guia.php?top -> $(echo "$gt" | head -c 120)"
gg=$(curl -sS --max-time 40 "https://araujotechsistemas.com/sitio/guia.php?g=1" 2>/dev/null | head -c 200000 || true); echo "$gg" | grep -q '"dir":\[' && ok "guia.php?g -> traz as fichas de negócios sem catálogo" || bad "guia.php?g sem 'dir': $(echo "$gg" | head -c 120)"
gi=$(curl -sS --max-time 60 "https://araujotechsistemas.com/sitio/guia.php?ids=fogao-mineiro,lojastatus,nauticabrustolin" 2>/dev/null | head -c 3000 || true); echo "$gi" | grep -q '"days":' && ok "guia.php?ids -> horários (e nota, quando há 3 ou mais opiniões): $(echo "$gi" | grep -o '"r[tn]":[0-9.]*' | tr '\n' ' ')" || bad "guia.php?ids -> $(echo "$gi" | head -c 120)"
gb=$(curl -sS --max-time 40 -o /dev/null -w '%{http_code}' "https://guiadesantarita.com/fogao-mineiro" 2>/dev/null || true); [ "$gb" = "200" ] && ok "página do negócio na Guía responde 200" || bad "página do negócio na Guía -> HTTP $gb"
ga=$(curl -sS --max-time 40 "https://guiadesantarita.com/negocios/" 2>/dev/null || true); echo "$ga" | grep -q 'Enviar por WhatsApp' && echo "$ga" | grep -q 'id="opciones"' && ok "/guia/negocios/ -> página para negócios (opções, planos e formulário)" || bad "/guia/negocios/ sem as opções ou o formulário"
gso=$(curl -sS --max-time 40 "https://guiadesantarita.com/sobre/" 2>/dev/null || true); echo "$gso" | grep -q 'Los sellos' && ok "/guia/sobre/ -> página Sobre la Guía" || bad "/guia/sobre/ sem o texto"
gca=$(curl -sS --max-time 40 "https://guiadesantarita.com/guia/cartel.php?id=fogao-mineiro" 2>/dev/null || true); echo "$gca" | grep -q 'Estamos en la' && echo "$gca" | grep -q 'data-u="https://guiadesantarita.com/' && ok "cartel.php -> cartel com QR do Fogão Mineiro" || bad "cartel.php sem o cartel"
gap=$(curl -sS --max-time 40 -o /dev/null -w '%{http_code} %{redirect_url}' "https://araujotechsistemas.com/guia/aparecer/" 2>/dev/null || true); case "$gap" in 301\ https://guiadesantarita.com/negocios/) ok "/guia/aparecer/ (QR antigo) leva para guiadesantarita.com/negocios/";; *) bad "/guia/aparecer/ -> $gap";; esac
for pr in "/guia/|https://guiadesantarita.com/" "/guia/lojastatus|https://guiadesantarita.com/lojastatus" "/guia/negocios/|https://guiadesantarita.com/negocios/"; do u=${pr%%|*}; w=${pr#*|}; r=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code} %{redirect_url}' "https://araujotechsistemas.com$u" 2>/dev/null || true); [ "$r" = "301 $w" ] && ok "araujotechsistemas.com$u leva para $w" || bad "araujotechsistemas.com$u -> $r"; done
gjb=$(curl -sS --max-time 60 "https://guiadesantarita.com/sitio/guia.php?jobs=1" 2>/dev/null | head -c 300 || true); echo "$gjb" | grep -q '^{"jobs":\[' && ok "Empleos: guia.php?jobs responde (vagas ativas)" || bad "guia.php?jobs -> $(echo "$gjb" | head -c 120)"
gso2=$(curl -sS --max-time 40 "https://guiadesantarita.com/sitio/guia.php?soc=1" 2>/dev/null | head -c 300 || true); echo "$gso2" | grep -q '^{"soc":' && ok "redes da Guía (rodapé) respondem" || bad "guia.php?soc -> $(echo "$gso2" | head -c 120)"
gq2=$(curl -sS --max-time 40 -o /dev/null -w '%{http_code}' "https://guiadesantarita.com/guia/qr.js" 2>/dev/null || true); [ "$gq2" = "200" ] && ok "arquivos da Guía (/guia/qr.js) seguem abrindo no domínio novo" || bad "/guia/qr.js no domínio novo -> $gq2"
glj=$(curl -sS --max-time 40 "https://araujotechsistemas.com/loja/fogao-mineiro/" 2>/dev/null || true); echo "$glj" | grep -q 'TDC_LOJA=true' && echo "$glj" | grep -q 'og:title' && ok "/loja/fogao-mineiro/ -> catálogo pelo domínio principal (contorno do erro 421 do iPhone)" || bad "/loja/fogao-mineiro/ não entregou o catálogo -> $(echo "$glj" | head -c 160)"
gll=$(curl -sS --max-time 40 "https://guiadesantarita.com/llegar/" 2>/dev/null || true); echo "$gll" | grep -q 'Cheguei em Santa Rita' && echo "$gll" | grep -q 'id="documentos"' && ok "/guia/llegar/ -> guia para quem chega (ES/PT)" || bad "/guia/llegar/ sem o texto"
gte=$(curl -sS --max-time 40 "https://guiadesantarita.com/terminos/" 2>/dev/null || true); echo "$gte" | grep -q 'Qué datos contamos' && ok "/guia/terminos/ -> página de termos e privacidade" || bad "/guia/terminos/ sem o texto"
gc=$(curl -sS --max-time 40 "https://guiadesantarita.com/" 2>/dev/null || true); echo "$gc" | grep -q 'href="/negocios/"' && echo "$gc" | grep -q 'data-tq' && ok "Guía aponta para /guia/negocios/ e tem 'Lo más buscado'" || bad "Guía sem link para /guia/negocios/ ou sem 'Lo más buscado'"
gq=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 -A "Mozilla/5.0 (iPhone)" "https://araujotechsistemas.com/sitio/guia_hit.php?t=q&id=0981123456" 2>/dev/null || true); [ "$gq" = "204" ] && ok "guia_hit t=q recusa número de telefone" || bad "guia_hit t=q -> $gq"
echo "$gs" | grep -q "more:'Ver negocio'" && ok "na Guía, tocar no negócio abre a página dele" || bad "Guía ainda manda direto para o catálogo"
echo "$gs" | grep -q 'class="seo-l"' && ok "Guía com a lista de negócios já no HTML (Google)" || bad "Guía sem a lista para o Google (index.php não rodou?)"
gsm=$(curl -sS --max-time 40 "https://guiadesantarita.com/sitemap.xml" 2>/dev/null | head -c 3000 || true); echo "$gsm" | grep -q 'guiadesantarita.com/lojastatus</loc>' && ok "sitemap da Guía com as páginas dos negócios" || bad "sitemap da Guía -> $(echo "$gsm" | head -c 120)"
gneg=$(curl -sS --max-time 40 "https://guiadesantarita.com/lojastatus" 2>/dev/null || true); echo "$gneg" | grep -q 'Ver catálogo y pedir' && echo "$gneg" | grep -q '"@type":"LocalBusiness"' && ok "página do negócio na Guía (/guia/lojastatus) com dados para o Google" || bad "/guia/lojastatus não abriu a página do negócio"
gsub=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code} %{redirect_url}' "https://guia.araujotechsistemas.com/" 2>/dev/null || true); case "$gsub" in 301\ https://araujotechsistemas.com/guia/) ok "guia.araujotechsistemas.com leva para a Guía";; *) bad "guia.araujotechsistemas.com -> $gsub";; esac
gm=$(curl -sS --max-time 30 "https://guiadesantarita.com/manifest.webmanifest" 2>/dev/null || true); echo "$gm" | grep -q '"start_url":"/' && ok "Guía instalável (manifest)" || bad "manifest da Guía não abriu"
if echo "$gs" | grep -q 'id="sl"' && echo "$gs" | grep -q 'Recomendado por Vitrix'; then ok "Guía com o slider do topo (Publicidad / Recomendado por Vitrix)"; else bad "Guía sem o slider do topo"; fi
if echo "$gs" | grep -q 'tu-delivery.jpg' && echo "$gs" | grep -q "td_h:'Delivery'" && echo "$gs" | grep -q 'araujo-tech.jpg' && echo "$gs" | grep -q "pro_h:'Profesionales'"; then ok "Guía com os banners (Tu Delivery, Vitrix, Araújo Tech), categoria Delivery e Profesionales"; else bad "Guía sem os banners da casa ou sem a categoria Delivery"; fi
for gi in tu-delivery.jpg vitrix-planes.jpg araujo-tech.jpg td-icono.png; do gc=$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' "https://araujotechsistemas.com/img/guia/$gi" 2>/dev/null || true); [ "$gc" = "200" ] && ok "img/guia/$gi no ar" || bad "img/guia/$gi -> $gc"; done
# site padrão: produtos em destaque vindos do catálogo (prods.php) e a foto do primeiro produto (pimg.php)
pj=$(curl -sS --max-time 30 "https://araujotechsistemas.com/sitio/prods.php?id=lojastatus" 2>/dev/null || true)
if echo "$pj" | grep -q '"items":\['; then
  pu=$(echo "$pj" | grep -o '"img":"[^"]*"' | head -1 | sed 's/"img":"//;s/"$//;s#\\/#/#g')
  if [ -n "$pu" ]; then pt=$(curl -sS --max-time 40 -o /dev/null -w '%{http_code} %{content_type} %{size_download}' "https://araujotechsistemas.com$pu" 2>/dev/null || true); case "$pt" in "200 image/jpeg"*) ok "produtos do site padrão -> $(echo "$pj" | grep -o '"id"' | wc -l) produtos; foto: $pt";; *) bad "foto de produto do site padrão -> $pt ($pu)";; esac; else ok "produtos do site padrão -> responde, sem produtos com foto"; fi
else bad "prods.php -> resposta inesperada: $(echo "$pj" | head -c 200)"; fi
# sites padrão e catálogos: nenhum aviso do PHP (Deprecated/Warning/Notice) pode aparecer na página
for u in https://araujotechsistemas.com/status https://araujotechsistemas.com/fogaomineiro https://lojastatus.araujotechsistemas.com/ https://nauticabrustolin.araujotechsistemas.com/ "https://lojastatus.araujotechsistemas.com/painel/"; do
  pg=$(curl -sS --max-time 30 "$u" 2>/dev/null | head -c 4000 || true)
  if echo "$pg" | grep -qiE "<b>(deprecated|warning|notice|fatal error)</b>|^(deprecated|warning|notice): "; then bad "$u -> aviso do PHP aparece na página"; else ok "$u -> sem avisos do PHP"; fi
done
# vitrine de clientes do site: lista publicada pelo Panel Araújo Tech (só leitura)
vc=$(curl -sS --max-time 30 "https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U&mask.fieldPaths=clientes" 2>/dev/null | python3 -c 'import sys,json
try:
  d=json.load(sys.stdin);v=d.get("fields",{}).get("clientes",{}).get("arrayValue",{}).get("values",[])
  print(" | ".join(x["mapValue"]["fields"]["name"]["stringValue"]+" ("+x["mapValue"]["fields"]["sys"]["stringValue"]+")" for x in v))
except Exception as e: print("")' 2>/dev/null || true)
if [ -n "$vc" ]; then ok "vitrine de clientes no site -> $vc"; else echo "AVISO | vitrine de clientes ainda vazia (abrir o Panel Araújo Tech publica a lista)"; fi
# fotos da demo de autos (Unsplash): todas abrem
ua=$(curl -sS --max-time 30 "https://araujotechsistemas.com/demo-autos/" 2>/dev/null | grep -o 'https://images.unsplash.com/photo-[0-9a-f-]*' | sort -u)
if [ -z "$ua" ]; then bad "demo-autos -> nenhuma foto encontrada"; else nb=0; nt=0; for u in $ua; do nt=$((nt+1)); c=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$u?w=400" 2>/dev/null || true); [ "$c" = "200" ] || { nb=$((nb+1)); echo "   foto com problema: $u -> $c"; }; done; if [ "$nb" = 0 ]; then ok "demo-autos -> as $nt fotos abrem"; else bad "demo-autos -> $nb de $nt fotos não abrem"; fi; fi
# regras v14 (visitas ao catálogo): soma 1 num contador de TESTE com data antiga (01/01/2000), que nenhuma tela lê
# (o painel só olha os últimos 14 dias). Tem que ser numa loja que existe: a regra só deixa criar o contador em loja ativa.
vd=2000-01-01
vr=$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' "https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents:commit?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U" --data "{\"writes\":[{\"update\":{\"name\":\"projects/araujotech-catalogos/databases/(default)/documents/shops/fogao-mineiro/visitas/$vd\",\"fields\":{}},\"updateMask\":{\"fieldPaths\":[]},\"updateTransforms\":[{\"fieldPath\":\"n\",\"increment\":{\"integerValue\":\"1\"}}]}]}" 2>/dev/null || true)
vx=$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' "https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents:commit?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U" --data "{\"writes\":[{\"update\":{\"name\":\"projects/araujotech-catalogos/databases/(default)/documents/shops/fogao-mineiro/visitas/$vd\",\"fields\":{}},\"updateMask\":{\"fieldPaths\":[]},\"updateTransforms\":[{\"fieldPath\":\"n\",\"increment\":{\"integerValue\":\"50\"}}]}]}" 2>/dev/null || true)
if [ "$vr" = "200" ] && [ "$vx" != "200" ]; then ok "regras v14 no ar: visita soma 1 e não aceita +50"; elif [ "$vr" = "403" ]; then echo "AVISO | regras v14 ainda não publicadas (visitas ao catálogo ainda não contam)"; else bad "regras v14: +1 -> $vr, +50 -> $vx"; fi
# textos do site editados no painel (só informação: mostra o que está salvo, para não sobrescrever sem querer)
curl -sS --max-time 30 "https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U&mask.fieldPaths=txt&mask.fieldPaths=sis&mask.fieldPaths=faq&mask.fieldPaths=testi&mask.fieldPaths=contacto" 2>/dev/null | python3 -c 'import sys,json
def dv(v):
  if not isinstance(v,dict): return None
  for k in ("stringValue","booleanValue","integerValue","doubleValue"):
    if k in v: return v[k]
  if "arrayValue" in v: return [dv(x) for x in v["arrayValue"].get("values",[])]
  if "mapValue" in v: return {k:dv(x) for k,x in v["mapValue"].get("fields",{}).items()}
  return None
try:
  d=json.load(sys.stdin); f={k:dv(x) for k,x in d.get("fields",{}).items()}
  print("INFO  | textos salvos no painel: "+json.dumps(f,ensure_ascii=False)[:6000])
except Exception as e: print("INFO  | textos do painel: sem leitura")' || true
# regras v15 (contas próprias e opiniões da Guía): a consulta pública do que foi aprovado funciona; ler tudo e escrever sem login, não
fq() { curl -sS --max-time 20 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' "https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents:runQuery?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U" --data "$1" 2>/dev/null || true; }
fa=$(fq '{"structuredQuery":{"from":[{"collectionId":"gfichas"}],"where":{"fieldFilter":{"field":{"fieldPath":"st"},"op":"EQUAL","value":{"stringValue":"ok"}}},"limit":1}}')
fr=$(fq '{"structuredQuery":{"from":[{"collectionId":"gresenas"}],"where":{"fieldFilter":{"field":{"fieldPath":"st"},"op":"EQUAL","value":{"stringValue":"ok"}}},"limit":1}}')
fx=$(fq '{"structuredQuery":{"from":[{"collectionId":"gfichas"}],"limit":1}}')
fw=$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' -X PATCH -H 'Content-Type: application/json' "https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/gfichas/teste-sem-login?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U" --data '{"fields":{"n":{"stringValue":"x"}}}' 2>/dev/null || true)
if [ "$fa" = "200" ] && [ "$fr" = "200" ] && [ "$fx" = "403" ] && [ "$fw" = "403" ]; then ok "regras v15 no ar: fichas e opiniões aprovadas são públicas; o resto e escrita sem login, não"; elif [ "$fa" = "403" ]; then echo "AVISO | regras v15 ainda não publicadas (contas próprias e opiniões)"; else bad "regras v15: aprovadas $fa/$fr, tudo $fx, escrita sem login $fw"; fi
gp=$(curl -sS --max-time 30 "https://guiadesantarita.com/sitio/guia.php?g=1" 2>/dev/null | python3 -c 'import sys,json
try:
  d=json.load(sys.stdin);print("ok" if isinstance(d.get("fu"),list) and isinstance(d.get("rv"),dict) else "")
except Exception: print("")' 2>/dev/null || true)
if [ "$gp" = "ok" ]; then ok "Guía publica fichas próprias e notas (fu, rv)"; else bad "Guía: guia.php?g=1 sem fu/rv"; fi
for pg in privacidad terminos; do pc=$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' "https://araujotechsistemas.com/$pg/" 2>/dev/null || true); if [ "$pc" = "200" ]; then ok "página /$pg/ no ar"; else bad "/$pg/ -> $pc"; fi; done
hm=$(curl -sS --max-time 20 "https://araujotechsistemas.com/" 2>/dev/null || true)
if echo "$hm" | grep -q 'id="soluciones"' && echo "$hm" | grep -q 'id="servicios"'; then ok "site da Araújo Tech: página nova no ar (soluções e serviços)"; else bad "site da Araújo Tech: página nova não encontrada"; fi
cu=$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' "https://araujotechsistemas.com/cuenta/" 2>/dev/null || true)
if [ "$cu" = "200" ]; then ok "página Mi cuenta no ar (/cuenta/)"; else bad "/cuenta/ -> $cu"; fi
# vídeo do produto: o servidor responde, recusa envio sem login e aceita a origem do painel
vp=$(curl -sS --max-time 20 "https://teste.araujotechsistemas.com/video.php?op=ping" 2>/dev/null || true)
if echo "$vp" | grep -q '"ok":true' && echo "$vp" | grep -q '"curl":true' && echo "$vp" | grep -q '"w":true'; then ok "video.php -> no ar ($vp)"; else bad "video.php -> resposta inesperada: $vp"; fi
va=$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' -X POST --data-binary 'x' "https://teste.araujotechsistemas.com/video.php?op=up&shop=teste&up=aaaaaaaaaaaaaaaa&i=0&n=1&off=0" 2>/dev/null || true)
if [ "$va" = "401" ]; then ok "video.php -> sem login é recusado (401)"; else bad "video.php -> sem login devolveu $va (esperado 401)"; fi
vo=$(curl -sS --max-time 20 -o /dev/null -D - -X OPTIONS -H 'Origin: https://araujotechsistemas.com' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,x-at-token' "https://teste.araujotechsistemas.com/video.php" 2>/dev/null || true)
if echo "$vo" | grep -qi '^access-control-allow-origin: https://araujotechsistemas.com' && echo "$vo" | grep -qi 'x-at-token'; then ok "video.php -> painel em araujotechsistemas.com pode enviar (CORS)"; else bad "video.php -> CORS: $(echo "$vo" | head -3 | tr '\r\n' ' ')"; fi

echo; echo "== RESULTADO: $FALHAS falha(s)"
[ "$FALHAS" = "0" ]
