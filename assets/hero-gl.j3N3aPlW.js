import{S as e,b as t,f as n,i as r,l as i,t as a,v as o,w as s,y as c}from"./three.module.pCgyE1Ds.js";var l=`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`,u=`
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes, uTexRes, uMouse;
  uniform float uTime, uHover, uVel, uScroll;
  varying vec2 vUv;

  // UV en mode "cover" (comme object-fit: cover)
  vec2 coverUv(vec2 uv){
    float rs = uRes.x / uRes.y, ri = uTexRes.x / uTexRes.y;
    vec2 s = rs > ri ? vec2(1., ri / rs) : vec2(rs / ri, 1.);
    return (uv - .5) * s + .5;
  }

  void main(){
    vec2 uv = vUv;
    vec2 asp = vec2(uRes.x / uRes.y, 1.);

    // Ondulation de l'eau autour du curseur
    float d = distance(uv * asp, uMouse * asp);
    float ring = sin(d * 38. - uTime * 3.2) * smoothstep(.38, .0, d);
    uv += normalize(uv - uMouse + 1e-4) * ring * .0065 * uHover;

    // Houle au scroll (amplitude croissante)
    uv.x += sin(uv.y * 9. + uTime * .9) * .012 * uScroll;
    uv.y += cos(uv.x * 7. + uTime * .7) * .010 * uScroll;
    uv = (uv - .5) * (1. - uScroll * .08) + .5;          // léger zoom avant

    vec2 cuv = coverUv(uv);
    cuv.x = 1. - cuv.x;                                  // miroir : la yole passe à droite du titre
    float shift = .0035 * uVel + .004 * uScroll;           // décalage RVB
    vec3 col;
    col.r = texture2D(uTex, cuv + vec2(shift, 0.)).r;
    col.g = texture2D(uTex, cuv).g;
    col.b = texture2D(uTex, cuv - vec2(shift, 0.)).b;

    // Fondu vers le bleu nuit de la charte en sortie de hero
    vec3 night = vec3(.024, .102, .18);
    col = mix(col, night, smoothstep(.15, 1., uScroll) * .85);
    gl_FragColor = vec4(col, 1.);
  }
`;function d({video:d,container:f,gsap:p}){let m;try{m=new a({antialias:!1,alpha:!1,powerPreference:`high-performance`})}catch{return null}m.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),f.insertBefore(m.domElement,d.nextSibling),m.domElement.className=`hero__gl`;let h=new s(d);h.colorSpace=o;let g={uTex:{value:h},uRes:{value:new e(1,1)},uTexRes:{value:new e(1280,720)},uMouse:{value:new e(.5,.5)},uTime:{value:0},uHover:{value:0},uVel:{value:0},uScroll:{value:0}},_=new c,v=new r;_.add(new i(new n(2,2),new t({vertexShader:l,fragmentShader:u,uniforms:g})));let y=()=>{let{width:e,height:t}=f.getBoundingClientRect();m.setSize(e,t,!1),g.uRes.value.set(e,t)};y(),window.addEventListener(`resize`,y),d.addEventListener(`loadedmetadata`,()=>g.uTexRes.value.set(d.videoWidth,d.videoHeight));let b=new e(.5,.5),x={x:0,y:0,t:performance.now()};f.closest(`section`).addEventListener(`pointermove`,e=>{let t=f.getBoundingClientRect();b.set((e.clientX-t.left)/t.width,1-(e.clientY-t.top)/t.height);let n=performance.now(),r=Math.max(16,n-x.t),i=Math.hypot(e.clientX-x.x,e.clientY-x.y)/r;p.to(g.uVel,{value:Math.min(i,2.5),duration:.3,overwrite:!0}),p.to(g.uVel,{value:0,duration:1.2,delay:.3}),x={x:e.clientX,y:e.clientY,t:n},p.to(g.uHover,{value:1,duration:.6,overwrite:`auto`})}),f.closest(`section`).addEventListener(`pointerleave`,()=>p.to(g.uHover,{value:0,duration:1}));let S=!0;return new IntersectionObserver(([e])=>S=e.isIntersecting).observe(f),p.ticker.add(e=>{S&&(g.uTime.value=e,g.uMouse.value.lerp(b,.08),m.render(_,v))}),g}export{d as initHeroGL};