# Guía no painel: não perde o que foi preenchido (rascunho no aparelho + salva ao fechar) e "Usar mi ubicación" / "Buscar en Maps" na ficha
import sys
PAY="{gads:c.ads,gutil:c.util,gpro:c.pros,gbus:c.bus,gturno:c.turno,gev:c.ev,gnews:c.news,gdir:c.dir}"
R=[
("saved:'Guía guardada. En el sitio aparece en hasta 5 minutos.',",
 "saved:'Guía guardada. En el sitio aparece en hasta 5 minutos.',nosave:'No se guardó: hay un dato para corregir (link o mapa). Lo que cargaste quedó en este aparato; abrí la Guía de nuevo para corregir y guardar.',rec:'Recuperamos lo que habías cargado y no estaba guardado. Revisá y tocá Guardar Guía.',recx:'Descartar esos cambios',"),
("saved:'Guia salva. No site aparece em até 5 minutos.',",
 "saved:'Guia salva. No site aparece em até 5 minutos.',nosave:'Não foi salvo: há um dado para corrigir (link ou mapa). O que você preencheu ficou neste aparelho; abra a Guia de novo para corrigir e salvar.',rec:'Recuperamos o que você tinha preenchido e não estava salvo. Confira e toque em Salvar Guia.',recx:'Descartar essas mudanças',"),
# gusite: snapshot + rascunho
("CLOUD.api.getSiteCfg().then(c=>{ui.gu=guNorm(c);if(document.querySelector('.sheet[data-k=\"gu\"]'))guSheet();guStats()})",
 "CLOUD.api.getSiteCfg().then(c=>{ui.gu=guNorm(c);ui.guSnap=guSig(ui.gu);ui.guRec=false;const dr=guDraftLoad();if(dr){Object.keys(ui.gu).forEach(k=>{if(!(k in dr))dr[k]=ui.gu[k]});if(guSig(dr)!==ui.guSnap){ui.gu=dr;ui.guRec=true}else guDraftClear()}if(document.querySelector('.sheet[data-k=\"gu\"]'))guSheet();guStats()})"),
# gusave: depois de salvar, novo snapshot e apaga rascunho
("try{await CLOUD.api.putGuia("+PAY+");toast(gt('saved'))}",
 "try{await CLOUD.api.putGuia("+PAY+");ui.guSnap=guSig(g);ui.guRec=false;guDraftClear();toast(gt('saved'))}"),
# guSet: rascunho
("function guSet(path,v){","function guSet(path,v){guDraftLater();"),
# fechar a janela com mudanças: salva sozinho
("function closeSheet(){","function closeSheet(){try{if(document.querySelector('.sheet[data-k=\"gu\"]')&&ui.gu&&ui.guSnap!=null&&guSig(ui.gu)!==ui.guSnap)setTimeout(guSaveQuiet,0)}catch(e){}"),
# helpers
("function guClean(g){","""const GU_DK='at_gu_draft';let GU_DT=null;
function guSig(g){try{return JSON.stringify(guClean(g))}catch(e){return ''}}
function guDraftClear(){try{localStorage.removeItem(GU_DK)}catch(e){}}
function guDraftSave(){try{if(!ui.gu||ui.guSnap==null)return;if(guSig(ui.gu)===ui.guSnap){guDraftClear();return}localStorage.setItem(GU_DK,JSON.stringify({t:Date.now(),g:ui.gu}))}catch(e){}}
function guDraftLater(){clearTimeout(GU_DT);GU_DT=setTimeout(guDraftSave,700)}
function guDraftLoad(){try{const d=JSON.parse(localStorage.getItem(GU_DK)||'null');if(d&&d.g&&typeof d.g==='object'&&Date.now()-d.t<14*864e5)return d.g}catch(e){}return null}
async function guSaveQuiet(){const g=ui.gu;if(!g||ui.guSaving)return;guDraftSave();const c=guClean(g);if(c.bad||c.badp||c.bade||c.badn||c.badd||c.badm){toast(gt('nosave'),true);return}if(JSON.stringify(c.ads).length+JSON.stringify(c.pros).length+JSON.stringify(c.news).length+JSON.stringify(c.dir).length>880000){toast(gt('big'),true);return}ui.guSaving=true;try{await CLOUD.api.putGuia("""+PAY+""");ui.guSnap=guSig(g);ui.guRec=false;guDraftClear();toast(gt('saved'))}catch(e){console.warn(e);toast(gt('err'),true)}ui.guSaving=false}
function guClean(g){"""),
# ficha: GPS e buscar no Maps
("  <div class=\"row2\">${gxFld('dir.'+i+'.a',T.a,x.a)}${gxFld('dir.'+i+'.map',T.map,x.map,{im:'url',ph:'https://maps.app.goo.gl/…'})}</div>",
 "  <div class=\"row2\">${gxFld('dir.'+i+'.a',T.a,x.a)}${gxFld('dir.'+i+'.map',T.map,x.map,{im:'url',ph:'https://maps.app.goo.gl/…'})}</div>\n  <div class=\"gu-loc\"><button class=\"btn sm\" data-act=\"gudirgps\" data-i=\"${i}\">${ic('pin',14)}${T.gps}</button><a class=\"btn sm\" href=\"https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((x.n||'')+' Santa Rita, Alto Paraná')}\" target=\"_blank\" rel=\"noopener\">${ic('search',14)}${T.gmaps}</a><span class=\"note\">${T.gps_n}</span></div>"),
("nowa:'Falta WhatsApp',tovx:'Pasar a Vitrix'","nowa:'Falta WhatsApp',gps:'Usar mi ubicación',gmaps:'Buscar en Maps',gps_n:'Si estás en el local, tocá Usar mi ubicación. Si no, buscá en Maps, tocá Compartir → Copiar link y pegalo arriba.',gps_ok:'Ubicación cargada. Acordate de guardar.',gps_err:'No se pudo leer la ubicación. Permití la ubicación en el navegador o pegá el link de Maps.',tovx:'Pasar a Vitrix'"),
("nowa:'Falta WhatsApp',tovx:'Passar para Vitrix'","nowa:'Falta WhatsApp',gps:'Usar minha localização',gmaps:'Buscar no Maps',gps_n:'Se você está no local, toque em Usar minha localização. Se não, busque no Maps, toque em Compartilhar → Copiar link e cole acima.',gps_ok:'Localização carregada. Lembre de salvar.',gps_err:'Não foi possível ler a localização. Permita a localização no navegador ou cole o link do Maps.',tovx:'Passar para Vitrix'"),
(" gudirlgrm(el){",
 " gudirgps(el){const g=ui.gu;const x=g&&g.dir[+el.dataset.i];if(!x)return;if(!navigator.geolocation){toast(gdt('gps_err'),true);return}navigator.geolocation.getCurrentPosition(p=>{x.map='https://www.google.com/maps?q='+p.coords.latitude.toFixed(6)+','+p.coords.longitude.toFixed(6);guDraftLater();guSheet();toast(gdt('gps_ok'))},()=>toast(gdt('gps_err'),true),{enableHighAccuracy:true,timeout:15000,maximumAge:60000})},\n gudraftx(){guDraftClear();ui.guRec=false;acts.gusite()},\n gudirlgrm(el){"),
(".gu-dy{",".gu-loc{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:-2px 0 8px}.gu-loc .note{flex-basis:100%}.gu-rec{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#FFF4CC;color:#5A3E00;border-radius:12px;padding:10px 12px;margin:0 0 12px;font-size:14px}.gu-dy{"),
]
for f in sys.argv[1:]:
    s=open(f).read()
    if 'guSaveQuiet' in s: print('ok',f); continue
    for a,b in R:
        assert s.count(a)==1,(f,s.count(a),a[:80]); s=s.replace(a,b)
    open(f,'w').write(s); print('patched',f)
