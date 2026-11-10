const L=require('./lib');const P='araujotech-catalogos';(async()=>{
 await L.signUp('admin@araujotechsistemas.com','AdminTeste#2026');
 await L.fsReq(P,'PATCH','billing/semilla','owner',L.fields({name:'Semilla',status:'ativo',user:'semilla',plan:'basico',due:'2026-12-01',pays:[],created:'2026-11-01'}));
 const {p}=await L.open({w:1366});await p.goto('https://araujotechsistemas.com/admin/');await p.w(2500);
 await p.fill('#lg_user','admin@araujotechsistemas.com');await p.fill('#lg_pass','AdminTeste#2026');await p.press('#lg_pass','Enter');await p.w(3500);
 await p.act('newclient');
 const dumpS=async(t)=>console.log(t,await p.evaluate(()=>[...document.querySelectorAll('.sheet input,.sheet select,.sheet [data-act],.sheet textarea')].filter(e=>e.getBoundingClientRect().width>0).map(e=>(e.id||'')+'|'+(e.dataset.act||'')+'|'+(e.dataset.v||e.dataset.s||e.dataset.k||e.dataset.lvl||'')+'|'+(e.tagName==='SELECT'?[...e.options].map(o=>o.value).join(','):(e.placeholder||e.innerText||'').slice(0,14))).join(' ; ')));
 await p.locator('[data-act=ncsys]',{hasText:'Agenda'}).click();await p.w(400);await dumpS('agenda:');
 await p.set('#nc_name','Salón E2E');console.log('plans',await p.evaluate(()=>[...document.querySelector('#nc_plan').options].map(o=>o.value+':'+o.text).join(',')));await p.act('createclient');await p.w(3000);
 console.log(await p.evaluate(()=>JSON.stringify(PL.shops.map(s=>({id:s.id,n:s.name,sys:s.sys,user:s.user,pass:s.pass,lic:s.lic,ag:s.ag})))));
 const sid=await p.evaluate(()=>PL.shops.find(s=>/Sal/.test(s.name)).id);
 console.log('card acts',await p.evaluate(sid=>[...document.querySelectorAll('[data-sid="'+sid+'"]')].map(e=>e.dataset.act+':'+e.innerText.trim().slice(0,16)).join(' ; '),sid));
 console.log('card inputs',await p.evaluate(sid=>{const c=[...document.querySelectorAll('[data-sid="'+sid+'"]')][0].closest('.card,.shop,article,section,div[class]');return [...(c?c.querySelectorAll('input,select'):[])].map(e=>(e.id||'')+':'+(e.dataset.f||e.dataset.k||'')+':'+(e.placeholder||'')).join(' ; ')},sid));
 await p.locator('[data-act=agacc][data-sid="'+sid+'"]').first().click().catch(e=>console.log('no agacc'));await p.w(4000);console.log('toast/dialogs',p.dialogs,p.errs,(p.cons||[]).join('|').slice(0,300));
 console.log(await p.evaluate(sid=>JSON.stringify(PL.shops.find(s=>s.id===sid)),sid));
 console.log('card txt',await p.evaluate(sid=>{let c=document.querySelector('[data-sid="'+sid+'"]');for(let i=0;i<6&&c&&c.innerText.length<200;i++)c=c.parentElement;return c.innerText.replace(/\n+/g,' / ').slice(0,500)+' ## '+[...c.querySelectorAll('input,select')].map(e=>e.id+':'+(e.dataset.f||'')+':'+(e.dataset.sid||'')).join(' ; ')},sid));
 for(const c of ['licencias','agendaUsers','agendaPub']){const r=await L.fsReq(P,'GET',c,'owner');console.log(c,JSON.stringify((r.json.documents||[]).map(d=>[d.name.split('/').pop(),L.unfields(d)])).slice(0,400))}

 await L.done()})();
