# Guía: botão para carregar a lista de clientes Tu Delivery (15/11) como aliados, ocultos até completar WhatsApp/logo/horário
import sys
LIST="[['Boi','food','Restaurante'],['Santin','food','Restaurante'],['Bom Corte','food','Restaurante'],['Divina Mesa','food','Restaurante'],['Restaurante Guerrero','food','Restaurante'],['Chipería Santa Rita','food','Chipería'],['Castelleto','food','Desayuno y cena'],['Le Café','food','Desayuno y merienda'],['Eder Espetinho','food','Espetinho'],['Cabeção','food','Cena'],['Nick Lanches','food','Lanches'],['Pizzaria Franci','food','Pizzería'],['Rústico Burguer','food','Hamburguesería'],['3 Fronteras','food','Cena'],['América Helados','food','Heladería'],['Amandeu','food','Merienda, açaí y helados'],['Grido','food','Heladería'],['Gelatus','food','Heladería'],['Closet VIP','shop','Ropería'],['Kyrios','shop','Ropería']]"
R=[
("hid:'Oculta',td:'Cliente Tu Delivery: sello",
 "hid:'Oculta',seed:'Cargar clientes Tu Delivery',seeded:'{n} clientes agregados (ocultos). Completá WhatsApp, logo y horario, marcá Mostrar en la Guía y guardá.',nowa:'Falta WhatsApp',td:'Cliente Tu Delivery: sello"),
("hid:'Oculta',td:'Cliente Tu Delivery: selo",
 "hid:'Oculta',seed:'Carregar clientes Tu Delivery',seeded:'{n} clientes adicionados (ocultos). Complete WhatsApp, logo e horário, marque Mostrar na Guia e salve.',nowa:'Falta WhatsApp',td:'Cliente Tu Delivery: selo"),
("<button class=\"btn sm\" data-act=\"guadd\" data-k=\"dir\">${ic('plus',15)}${gt('add')}</button></h3><p class=\"sub\">${T.sub}</p>",
 "${g.dir.some(x=>x.td)?'':`<button class=\"btn sm\" data-act=\"gutdseed\">${ic('list',15)}${T.seed}</button>`}<button class=\"btn sm\" data-act=\"guadd\" data-k=\"dir\">${ic('plus',15)}${gt('add')}</button></h3><p class=\"sub\">${T.sub}</p>"),
("${x.td?`<span class=\"pill gu-ok\">${T.tdp}</span>`:''}",
 "${x.td?`<span class=\"pill gu-ok\">${T.tdp}</span>`:''}${x.td&&!String(x.wa||'').trim()?`<span class=\"pill gu-off\">${T.nowa}</span>`:''}"),
(" gudirlgrm(el){",
 " gutdseed(){const g=ui.gu;if(!g)return;const have=new Set(g.dir.map(x=>String(x.n).trim().toLowerCase()));let n=0;"+LIST+".forEach(([nm,gr,d])=>{if(have.has(nm.toLowerCase()))return;g.dir.push({id:guId(),n:nm,g:gr,d,tel:'',wa:'',a:'',map:'',hrs:'',ig:'',lg:'',td:true,on:false});n++});guSheet();toast(gdt('seeded').replace('{n}',n))},\n gudirlgrm(el){"),
]
for f in sys.argv[1:]:
    s=open(f).read()
    if 'gutdseed' in s: print('ok',f); continue
    for a,b in R:
        assert s.count(a)==1,(f,s.count(a),a[:70]); s=s.replace(a,b)
    open(f,'w').write(s); print('patched',f)
