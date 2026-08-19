(function(){
  var canvas=document.getElementById('three-bg');
  if(!canvas || typeof THREE==='undefined') return;
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse=window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var W=innerWidth,H=innerHeight;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:!coarse,alpha:true,powerPreference:'high-performance'});
  renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,coarse?1.15:1.5)); renderer.setClearColor(0x060608,0);
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(48,W/H,.1,100); camera.position.set(0,0,8.2);

  var root=new THREE.Group(); scene.add(root);
  var core=new THREE.Group(); root.add(core); core.position.set(.7,.1,-.2);

  // central faceted object — actual WebGL geometry, not a flat image
  var geo=new THREE.IcosahedronGeometry(1.35,2);
  var solid=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:0x111217,roughness:.24,metalness:.72,transparent:true,opacity:.88,clearcoat:1,clearcoatRoughness:.2}));
  core.add(solid);
  var edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo,18),new THREE.LineBasicMaterial({color:0xc8ff00,transparent:true,opacity:.31})); core.add(edges);

  // orbital rings
  var rings=[];
  [[1.85,.018,0xc8ff00,.27],[2.18,.012,0xffffff,.12],[2.55,.01,0x888899,.08]].forEach(function(v,i){
    var m=new THREE.Mesh(new THREE.TorusGeometry(v[0],v[1],6,120),new THREE.MeshBasicMaterial({color:v[2],transparent:true,opacity:v[3]}));
    m.rotation.set(1.1+i*.28,.3+i*.6,.2-i*.25); core.add(m); rings.push(m);
  });

  // satellites
  var sats=[];
  for(var i=0;i<7;i++){
    var g=i%2?new THREE.OctahedronGeometry(.18+i*.025,0):new THREE.IcosahedronGeometry(.15+i*.02,0);
    var m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i%3===0?0xc8ff00:0xb9bbc6,wireframe:true,transparent:true,opacity:i%3===0?.38:.18}));
    var a=i/7*Math.PI*2; m.position.set(Math.cos(a)*(2.2+i*.11),Math.sin(a)*(1.7+i*.07),-0.5-(i%3)*.3); root.add(m); sats.push({m:m,a:a,r:2.2+i*.11,s:.16+i*.018});
  }

  // soft lighting
  scene.add(new THREE.AmbientLight(0xb9c3ca,.65));
  var key=new THREE.PointLight(0xc8ff00,1.35,20); key.position.set(-3,3,4); scene.add(key);
  var rim=new THREE.PointLight(0x7b5ea7,.85,16); rim.position.set(4,-2,2); scene.add(rim);

  // particles
  var count=coarse?160:420,positions=new Float32Array(count*3),colors=new Float32Array(count*3);
  for(var p=0;p<count;p++){
    positions[p*3]=(Math.random()-.5)*20; positions[p*3+1]=(Math.random()-.5)*14; positions[p*3+2]=(Math.random()-.5)*8-2;
    var acc=Math.random()>.82; colors[p*3]=acc?.78:.25; colors[p*3+1]=acc?1:.26; colors[p*3+2]=acc?0:.31;
  }
  var pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(positions,3)); pg.setAttribute('color',new THREE.BufferAttribute(colors,3));
  var particles=new THREE.Points(pg,new THREE.PointsMaterial({vertexColors:true,size:coarse?.025:.038,transparent:true,opacity:.42,depthWrite:false})); scene.add(particles);

  var mx=0,my=0,smx=0,smy=0,t=0,scroll=0,targetScroll=0;
  if(!coarse) addEventListener('mousemove',function(e){mx=(e.clientX/W-.5)*2;my=-(e.clientY/H-.5)*2;},{passive:true});
  addEventListener('scroll',function(){var max=Math.max(1,document.documentElement.scrollHeight-H);targetScroll=(scrollY||0)/max;},{passive:true});

  function render(){
    if(!reduce) requestAnimationFrame(render);
    t+=reduce?0:.0045; scroll+=(targetScroll-scroll)*.05; smx+=(mx-smx)*.035; smy+=(my-smy)*.035;
    core.rotation.y=t*.55+smx*.32+scroll*1.5; core.rotation.x=t*.18+smy*.22-scroll*.32; core.rotation.z=Math.sin(t*.6)*.08;
    var sc=1+Math.sin(t*.8)*.025+scroll*.18; core.scale.setScalar(sc);
    rings.forEach(function(r,i){r.rotation.z+=reduce?0:(.0018+i*.0007)*(i%2?1:-1);r.rotation.x+=reduce?0:.0006*(i+1)});
    sats.forEach(function(o,i){var a=o.a+t*o.s; o.m.position.x=Math.cos(a)*o.r; o.m.position.y=Math.sin(a)*(1.35+i*.055);o.m.rotation.x+=reduce?0:.006;o.m.rotation.y+=reduce?0:.008;});
    particles.rotation.y=t*.025+scroll*.08;
    root.position.x=smx*.28; root.position.y=smy*.18-scroll*.25;
    camera.position.z=8.2-scroll*.75; camera.position.x=smx*.18; camera.position.y=smy*.12; camera.lookAt(0,0,-.2);
    edges.material.opacity=.22+Math.sin(t)*.08+scroll*.09;
    renderer.render(scene,camera);
  }
  render();
  addEventListener('resize',function(){W=innerWidth;H=innerHeight;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,coarse?1.15:1.5));},{passive:true});
})();
