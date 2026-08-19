(function(){
  'use strict';
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse=window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var mobile=window.matchMedia && window.matchMedia('(max-width: 900px)').matches;

  var progress=document.createElement('div');
  progress.className='motion-progress';
  document.body.appendChild(progress);

  document.querySelectorAll('.btn-primary,.btn-ghost,.nav-cta,.motion-project-link').forEach(function(el){el.classList.add('motion-magnet');});

  if(!reduce && !coarse){
    document.querySelectorAll('.motion-magnet').forEach(function(el){
      el.addEventListener('mousemove',function(e){
        var r=el.getBoundingClientRect();
        var x=(e.clientX-(r.left+r.width/2))*.15;
        var y=(e.clientY-(r.top+r.height/2))*.18;
        el.style.transform='translate3d('+x+'px,'+y+'px,0)';
      });
      el.addEventListener('mouseleave',function(){
        el.style.transition='transform .5s cubic-bezier(.2,.8,.2,1)';
        el.style.transform='translate3d(0,0,0)';
        setTimeout(function(){el.style.transition='';},520);
      });
    });
  }

  var statement=document.querySelector('[data-char-reveal]'),chars=[];
  if(statement){
    var text=statement.textContent.trim();
    statement.setAttribute('aria-label',text); statement.innerHTML='';
    Array.from(text).forEach(function(ch){
      var s=document.createElement('span');s.className='motion-char';s.setAttribute('aria-hidden','true');s.textContent=ch===' '?'\u00a0':ch;statement.appendChild(s);chars.push(s);
    });
  }

  var reelRows=[].slice.call(document.querySelectorAll('.motion-reel-row'));
  var stackCards=[].slice.call(document.querySelectorAll('.motion-project-card'));

  if(!reduce && !coarse){
    document.querySelectorAll('.motion-tile').forEach(function(el){
      el.classList.add('motion-tilt');
      el.addEventListener('mousemove',function(e){
        var r=el.getBoundingClientRect();
        var rx=((e.clientY-r.top)/r.height-.5)*-4.5;
        var ry=((e.clientX-r.left)/r.width-.5)*6;
        el.style.transform='perspective(900px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-3px)';
      });
      el.addEventListener('mouseleave',function(){el.style.transform='';});
    });
  }

  var ticking=false;
  function update(){
    ticking=false;
    var y=window.scrollY||document.documentElement.scrollTop;
    var max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    progress.style.transform='scaleX('+Math.min(1,y/max)+')';

    reelRows.forEach(function(row,i){
      var parent=row.closest('.motion-reel');if(!parent)return;
      var r=parent.getBoundingClientRect();
      var local=(window.innerHeight-r.top)*(mobile?.14:.2);
      var base=i%2===0?(mobile?-180:-260):(mobile?-370:-520);
      var x=i%2===0?base+local:base-local;
      row.style.transform='translate3d('+x+'px,0,0)';
    });

    if(statement&&chars.length){
      var sr=statement.getBoundingClientRect();
      var p=(window.innerHeight*.78-sr.top)/(window.innerHeight*.62+sr.height*.45);
      p=Math.max(0,Math.min(1,p));
      var on=Math.floor(p*chars.length*1.06);
      chars.forEach(function(c,idx){c.classList.toggle('on',idx<on);});
    }

    stackCards.forEach(function(card,i){
      var host=card.parentElement,rr=host.getBoundingClientRect();
      var travel=Math.max(1,host.offsetHeight-window.innerHeight*(mobile?.4:.25));
      var p=Math.max(0,Math.min(1,((mobile?78:100)-rr.top)/travel));
      var target=1-(stackCards.length-1-i)*(mobile?.014:.024);
      var scale=1-(1-target)*p;
      var yoff=i*(mobile?7:12)*p;
      card.style.transform='translate3d(0,'+yoff+'px,0) scale('+scale+')';
    });
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){mobile=window.matchMedia('(max-width: 900px)').matches;onScroll();},{passive:true});
  if(reduce){chars.forEach(function(c){c.classList.add('on');});}
  update();
})();
