(function(){
  'use strict';
  var canvas=document.getElementById('three-bg');
  if(!canvas || typeof THREE==='undefined') return;

  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse=window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var isHome=document.body.classList.contains('home-motion');
  var W=innerWidth,H=innerHeight,renderer;

  try{
    renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:!coarse,alpha:true,powerPreference:'high-performance'});
  }catch(err){
    canvas.style.display='none';
    return;
  }

  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.08:1.45));
  renderer.setClearColor(0x060608,0);

  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(48,W/H,.1,100);
  camera.position.set(0,0,8.2);

  var root=new THREE.Group(); scene.add(root);
  var core=new THREE.Group(); root.add(core);
  core.position.set(coarse?0:.78,.08,-.2);

  // Faceted brand core.
  var geo=new THREE.IcosahedronGeometry(1.35,2);
  var solid=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:0x111217,roughness:.24,metalness:.72,transparent:true,opacity:.9,clearcoat:1,clearcoatRoughness:.2}));
  core.add(solid);
  var edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo,18),new THREE.LineBasicMaterial({color:0xc8ff00,transparent:true,opacity:.31}));
  core.add(edges);

  // M29 monogram rendered into a texture, then placed in actual 3D space.
  try{
    var logoCanvas=document.createElement('canvas'); logoCanvas.width=512; logoCanvas.height=256;
    var ctx=logoCanvas.getContext('2d');
    ctx.clearRect(0,0,512,256);
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font='900 150px Arial, sans-serif';
    ctx.fillStyle='#c8ff00'; ctx.fillText('M29',256,128);
    var tex=new THREE.CanvasTexture(logoCanvas); tex.needsUpdate=true;
    var logo=new THREE.Mesh(new THREE.PlaneGeometry(2.05,1.02),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.92,depthTest:false,depthWrite:false}));
    logo.position.set(0,0,1.43); logo.renderOrder=8; core.add(logo);
  }catch(e){}

  var rings=[];
  [[1.85,.018,0xc8ff00,.27],[2.18,.012,0xffffff,.12],[2.55,.01,0x888899,.08]].forEach(function(v,i){
    var m=new THREE.Mesh(new THREE.TorusGeometry(v[0],v[1],6,120),new THREE.MeshBasicMaterial({color:v[2],transparent:true,opacity:v[3]}));
    m.rotation.set(1.1+i*.28,.3+i*.6,.2-i*.25); core.add(m); rings.push(m);
  });

  var sats=[];
  for(var i=0;i<7;i++){
    var g=i%2?new THREE.OctahedronGeometry(.18+i*.025,0):new THREE.IcosahedronGeometry(.15+i*.02,0);
    var m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i%3===0?0xc8ff00:0xb9bbc6,wireframe:true,transparent:true,opacity:i%3===0?.38:.18}));
    var a=i/7*Math.PI*2;
    m.position.set(Math.cos(a)*(2.2+i*.11),Math.sin(a)*(1.7+i*.07),-.5-(i%3)*.3);
    root.add(m); sats.push({m:m,a:a,r:2.2+i*.11,s:.16+i*.018});
  }

  scene.add(new THREE.AmbientLight(0xb9c3ca,.62));
  var key=new THREE.PointLight(0xc8ff00,1.3,20); key.position.set(-3,3,4); scene.add(key);
  var rim=new THREE.PointLight(0x7b5ea7,.78,16); rim.position.set(4,-2,2); scene.add(rim);

  var count=coarse?120:360,positions=new Float32Array(count*3),colors=new Float32Array(count*3);
  for(var p=0;p<count;p++){
    positions[p*3]=(Math.random()-.5)*20;
    positions[p*3+1]=(Math.random()-.5)*14;
    positions[p*3+2]=(Math.random()-.5)*8-2;
    var acc=Math.random()>.82;
    colors[p*3]=acc?.78:.25; colors[p*3+1]=acc?1:.26; colors[p*3+2]=acc?0:.31;
  }
  var pg=new THREE.BufferGeometry();
  pg.setAttribute('position',new THREE.BufferAttribute(positions,3));
  pg.setAttribute('color',new THREE.BufferAttribute(colors,3));
  var particles=new THREE.Points(pg,new THREE.PointsMaterial({vertexColors:true,size:coarse?.023:.035,transparent:true,opacity:.4,depthWrite:false}));
  scene.add(particles);

  var mx=0,my=0,smx=0,smy=0,t=0,targetScroll=0,scroll=0;
  if(!coarse){
    addEventListener('mousemove',function(e){mx=(e.clientX/W-.5)*2;my=-(e.clientY/H-.5)*2;},{passive:true});
  }
  addEventListener('scroll',function(){
    var max=Math.max(1,document.documentElement.scrollHeight-H);
    targetScroll=(scrollY||0)/max;
  },{passive:true});

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function visibilityForScroll(){
    if(!isHome) return .2;
    var y=scrollY||0;
    var hero=document.querySelector('.hero');
    var reel=document.querySelector('.motion-reel');
    var statement=document.querySelector('.motion-statement');
    var services=document.querySelector('.services-preview');
    var projects=document.querySelector('.motion-projects');
    var why=document.querySelector('.why');
    if(!hero) return .25;
    var heroEnd=hero.offsetTop+hero.offsetHeight;
    if(y < heroEnd){ return 1-clamp(y/heroEnd,0,1)*.74; }
    if(reel && y < reel.offsetTop+reel.offsetHeight){ return .2; }
    if(statement && y < statement.offsetTop+statement.offsetHeight){
      var center=y+H*.5, sc=statement.offsetTop+statement.offsetHeight*.5;
      var closeness=1-clamp(Math.abs(center-sc)/(statement.offsetHeight*.7),0,1);
      return .08+closeness*.12;
    }
    if(services && y < services.offsetTop+services.offsetHeight){ return 0; }
    if(projects && y < projects.offsetTop+projects.offsetHeight){ return .11; }
    if(why && y < why.offsetTop+why.offsetHeight){ return .04; }
    return 0;
  }

  function render(){
    if(!reduce) requestAnimationFrame(render);
    t+=reduce?0:.0042;
    scroll+=(targetScroll-scroll)*.045;
    smx+=(mx-smx)*.035; smy+=(my-smy)*.035;

    var heroProgress=isHome?clamp((scrollY||0)/Math.max(H,1),0,1):0;
    core.rotation.y=t*.55+smx*.3+heroProgress*.95;
    core.rotation.x=t*.18+smy*.2-heroProgress*.22;
    core.rotation.z=Math.sin(t*.6)*.07;
    var sc=1+Math.sin(t*.8)*.022+heroProgress*.1;
    core.scale.setScalar(sc);

    rings.forEach(function(r,i){
      if(!reduce){r.rotation.z+=(.0017+i*.00065)*(i%2?1:-1);r.rotation.x+=.0005*(i+1);}
    });
    sats.forEach(function(o,i){
      var a=o.a+t*o.s;
      o.m.position.x=Math.cos(a)*o.r;
      o.m.position.y=Math.sin(a)*(1.35+i*.055);
      if(!reduce){o.m.rotation.x+=.0055;o.m.rotation.y+=.0075;}
    });
    particles.rotation.y=t*.024+scroll*.08;

    root.position.x=smx*.26+(isHome?heroProgress*.45:0);
    root.position.y=smy*.16-(isHome?heroProgress*.2:0);
    camera.position.z=8.2-(isHome?heroProgress*.45:0);
    camera.position.x=smx*.16; camera.position.y=smy*.1;
    camera.lookAt(0,0,-.2);
    edges.material.opacity=.22+Math.sin(t)*.075+heroProgress*.05;

    canvas.style.opacity=String(visibilityForScroll());
    renderer.render(scene,camera);
  }

  canvas.style.transition='opacity .18s linear';
  render();
  addEventListener('resize',function(){
    W=innerWidth;H=innerHeight;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.08:1.45));
    core.position.x=coarse?0:.78;
  },{passive:true});
})();
