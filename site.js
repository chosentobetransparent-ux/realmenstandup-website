// Mobile menu + dropdown toggle (shared by every page)
(function(){
  var body=document.body, t=document.querySelector('.menu-toggle'), nav=document.getElementById('mainnav');
  if(t){
    t.addEventListener('click',function(){
      var open=body.classList.toggle('nav-open');
      t.setAttribute('aria-expanded',open?'true':'false');
    });
    nav.addEventListener('click',function(e){
      if(e.target.tagName==='A'){ body.classList.remove('nav-open'); t.setAttribute('aria-expanded','false'); }
    });
  }
  document.querySelectorAll('.drop>button').forEach(function(b){
    b.addEventListener('click',function(){
      var li=b.parentNode, open=li.classList.toggle('open');
      b.setAttribute('aria-expanded',open?'true':'false');
    });
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){ body.classList.remove('nav-open'); document.querySelectorAll('.drop.open').forEach(function(d){d.classList.remove('open');}); }
  });
})();
