const L=require('./lib');const P='araujotech-catalogos';(async()=>{
 await L.signUp('admin@araujotechsistemas.com','AdminTeste#2026');
 const {p}=await L.open({w:1366});await p.goto('https://araujotechsistemas.com/admin/');await p.w(2500);
 await p.fill('#lg_user','admin@araujotechsistemas.com');await p.fill('#lg_pass','AdminTeste#2026');await p.press('#lg_pass','Enter');await p.w(3500);await p.dump('admin dentro',1400);
 await p.act('newshop');await p.dump('newshop sheet',1400);
 console.log(await p.evaluate(()=>[...document.querySelectorAll('.sheet input,.sheet select,.sheet [data-act]')].filter(e=>e.getBoundingClientRect().width>0).map(e=>(e.id||'')+'|'+(e.dataset.act||'')+'|'+(e.dataset.r||e.dataset.v||'')+'|'+(e.placeholder||e.innerText||'').slice(0,18)).join('  ;  ')));
 console.log(p.errs,p.cons);await L.done()})();
