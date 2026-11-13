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
  body=$(mktemp); code=$(curl -sS -L -A "$UA" --compressed --max-time 40 -o "$body" -w '%{http_code}' "$url" 2>/dev/null || echo 000)
  tam=$(wc -c < "$body")
  if [ "$code" != "200" ]; then bad "$url -> HTTP $code"
  elif [ -n "$marca" ] && ! grep -q -- "$marca" "$body"; then bad "$url -> 200, mas SEM a versão nova (falta '$marca')"
  else ok "$url -> 200, ${tam} bytes${marca:+, versão nova confirmada ($marca)}"; fi
  rm -f "$body"
done <<'URLS'
https://araujotechsistemas.com/|clientes.js?v=1
https://araujotechsistemas.com/vitrix/|vxClientes
https://araujotechsistemas.com/catalogo-digital/|vitrix
https://araujotechsistemas.com/img/vitrix/vitrix-blanco.png|
https://araujotechsistemas.com/trabaja/|
https://araujotechsistemas.com/demo/|vxMark
https://araujotechsistemas.com/demo-farmacia/|q_none
https://araujotechsistemas.com/demo-agenda/|badPhone
https://araujotechsistemas.com/demo-pesca/|Puerto Dorado
https://araujotechsistemas.com/demo-comida/|Sabor Casero
https://araujotechsistemas.com/admin/|syncPubClients
https://araujotechsistemas.com/painel/|syncPubClients
https://araujotechsistemas.com/licencia.js|
https://araujotechsistemas.com/clientes.js|AT_CLIENTES
https://araujotechsistemas.com/sitemap.xml|
https://fogaomineiro.araujotechsistemas.com/|syncPubClients
https://fogaomineiro.araujotechsistemas.com/painel/|forceMc
https://teste.araujotechsistemas.com/|syncPubClients
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
# vitrine de clientes do site: lista publicada pelo Panel Araújo Tech (só leitura)
vc=$(curl -sS --max-time 30 "https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U&mask.fieldPaths=clientes" 2>/dev/null | python3 -c 'import sys,json
try:
  d=json.load(sys.stdin);v=d.get("fields",{}).get("clientes",{}).get("arrayValue",{}).get("values",[])
  print(" | ".join(x["mapValue"]["fields"]["name"]["stringValue"]+" ("+x["mapValue"]["fields"]["sys"]["stringValue"]+")" for x in v))
except Exception as e: print("")' 2>/dev/null || true)
if [ -n "$vc" ]; then ok "vitrine de clientes no site -> $vc"; else echo "AVISO | vitrine de clientes ainda vazia (abrir o Panel Araújo Tech publica a lista)"; fi
# vídeo do produto: o servidor responde, recusa envio sem login e aceita a origem do painel
vp=$(curl -sS --max-time 20 "https://teste.araujotechsistemas.com/video.php?op=ping" 2>/dev/null || true)
if echo "$vp" | grep -q '"ok":true' && echo "$vp" | grep -q '"curl":true' && echo "$vp" | grep -q '"w":true'; then ok "video.php -> no ar ($vp)"; else bad "video.php -> resposta inesperada: $vp"; fi
va=$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' -X POST --data-binary 'x' "https://teste.araujotechsistemas.com/video.php?op=up&shop=teste&up=aaaaaaaaaaaaaaaa&i=0&n=1&off=0" 2>/dev/null || true)
if [ "$va" = "401" ]; then ok "video.php -> sem login é recusado (401)"; else bad "video.php -> sem login devolveu $va (esperado 401)"; fi
vo=$(curl -sS --max-time 20 -o /dev/null -D - -X OPTIONS -H 'Origin: https://araujotechsistemas.com' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,x-at-token' "https://teste.araujotechsistemas.com/video.php" 2>/dev/null || true)
if echo "$vo" | grep -qi '^access-control-allow-origin: https://araujotechsistemas.com' && echo "$vo" | grep -qi 'x-at-token'; then ok "video.php -> painel em araujotechsistemas.com pode enviar (CORS)"; else bad "video.php -> CORS: $(echo "$vo" | head -3 | tr '\r\n' ' ')"; fi

echo; echo "== RESULTADO: $FALHAS falha(s)"
[ "$FALHAS" = "0" ]
