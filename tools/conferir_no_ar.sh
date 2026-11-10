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
https://araujotechsistemas.com/|lzhome
https://araujotechsistemas.com/catalogo-digital/|lzBan
https://araujotechsistemas.com/trabaja/|
https://araujotechsistemas.com/demo/|cleanOrder
https://araujotechsistemas.com/demo-farmacia/|q_none
https://araujotechsistemas.com/demo-agenda/|badPhone
https://araujotechsistemas.com/admin/|tmpPass
https://araujotechsistemas.com/painel/|cleanOrder
https://araujotechsistemas.com/licencia.js|
https://araujotechsistemas.com/sitemap.xml|
https://fogaomineiro.araujotechsistemas.com/|cleanOrder
https://fogaomineiro.araujotechsistemas.com/painel/|tmpPass
https://teste.araujotechsistemas.com/|cleanOrder
https://teste.araujotechsistemas.com/agenda/|badPhone
https://teste.araujotechsistemas.com/agenda/gestion.html|isTmp
https://barberialoli.araujotechsistemas.com/reservas.html|badPhone
https://barberialoli.araujotechsistemas.com/gestion.html|isTmp
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
  code=$(curl -sS -g --max-time 30 -o /dev/null -w '%{http_code}' "$B/$1?key=$K&pageSize=1" 2>/dev/null || echo 000)
  if [ "$code" = "$2" ]; then ok "$3 -> HTTP $code (esperado)"; else bad "$3 -> HTTP $code (esperado $2)"; fi; }
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
probe "visitas" 403 "contador de visitas sem login"

echo; echo "== 4. Firebase da Tu Delivery (Meu Púlpito e Caja): dados privados fechados"
K2="AIzaSyAIF3GBWko0C8S5xuvxG9ufPZXizAjDwCs"; B="https://firestore.googleapis.com/v1/projects/tu-delivery-1eb61/databases/(default)/documents"; K="$K2"
probe "pulpito" 403 "sermões dos pastores sem login"
probe "planos" 403 "planos dos usuários do Meu Púlpito sem login"
probe "turnos" 403 "cadastro dos deliverys sem login"
probe "empresa" 403 "dados da empresa (Caja) sem login"
probe "config/roles" 403 "papéis de administrador sem login"

echo; echo "== RESULTADO: $FALHAS falha(s)"
[ "$FALHAS" = "0" ]
