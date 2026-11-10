// Visualiseur 3D stylisé : géométrie originale, aucune ressource extraite du jeu.
// Three.js chargé à la demande ; animation uniquement pendant l'interaction.
export async function createHunterViewer(host){
 const THREE=await import('https://esm.sh/three@0.170.0');
 const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(35,1,.1,100);
 camera.position.set(0,2.1,7.7);camera.lookAt(0,1.6,0);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.setClearColor(0x000000,0);host.append(renderer.domElement);
 const ambient=new THREE.HemisphereLight(0xe7d7b5,0x23392b,2.5);scene.add(ambient);
 const key=new THREE.DirectionalLight(0xffe1a5,2.2);key.position.set(3,6,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0x79b4a0,1.2);rim.position.set(-4,3,-3);scene.add(rim);
 const root=new THREE.Group();scene.add(root);
 const materials={metal:new THREE.MeshStandardMaterial({color:0x7c9180,metalness:.55,roughness:.42,flatShading:true}),trim:new THREE.MeshStandardMaterial({color:0xc5a36a,metalness:.65,roughness:.36,flatShading:true}),cloth:new THREE.MeshStandardMaterial({color:0x354c3e,roughness:.9,flatShading:true}),dark:new THREE.MeshStandardMaterial({color:0x24332d,roughness:.85,flatShading:true}),skin:new THREE.MeshStandardMaterial({color:0x8e6953,roughness:.8,flatShading:true})};
 const sections={};const mesh=(parent,geometry,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);parent.add(m);return m};
 const box=(p,w,h,d,m,x,y,z)=>mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const cone=(p,r1,r2,h,m,x,y,z)=>mesh(p,new THREE.CylinderGeometry(r1,r2,h,6),m,x,y,z);
 const part=(id)=>{const g=new THREE.Group();root.add(g);sections[id]=g;return g};
 // Silhouette humanoïde en pièces low-poly indépendantes.
 const body=part('chest');cone(body,.38,.48,.92,materials.metal,0,2.48,0);box(body,.9,.13,.43,materials.trim,0,2.91,0);
 const neck=part('head');cone(neck,.22,.25,.35,materials.skin,0,3.18,0);mesh(neck,new THREE.IcosahedronGeometry(.3,0),materials.metal,0,3.47,0);
 const helm=cone(neck,.39,.29,.24,materials.trim,0,3.65,0);helm.rotation.z=.03;
 const horns=[-1,1];for(const side of horns){const h=cone(neck,.045,.14,.45,materials.trim,side*.33,3.86,0);h.rotation.z=-side*.42}
 const arms=part('arms');for(const side of horns){const a=cone(arms,.17,.24,.86,materials.metal,side*.65,2.43,0);a.rotation.z=side*.18;cone(arms,.15,.19,.34,materials.trim,side*.77,1.91,.03)}
 const waist=part('waist');cone(waist,.42,.3,.34,materials.trim,0,1.94,0);for(const side of horns){const plate=box(waist,.27,.62,.16,materials.cloth,side*.38,1.65,.12);plate.rotation.z=side*.15}
 const legs=part('legs');for(const side of horns){cone(legs,.21,.27,.76,materials.metal,side*.23,1.33,0);cone(legs,.24,.18,.55,materials.dark,side*.23,.7,.05);box(legs,.36,.2,.65,materials.trim,side*.23,.38,.18)}
 const weapon=part('weapon');const shaft=cone(weapon,.065,.065,2.5,materials.trim,.95,2.12,-.3);shaft.rotation.z=-.3;
 const blade=box(weapon,.32,1.08,.14,materials.metal,1.3,3.2,-.3);blade.rotation.z=-.3;
 const pedestal=mesh(scene,new THREE.CylinderGeometry(1.2,1.35,.16,12),materials.dark,0,.12,0);
 mesh(scene,new THREE.TorusGeometry(1.1,.018,4,36),materials.trim,0,.21,0,Math.PI/2);
 let yaw=.4,pitch=0,zoom=7.7,drag=null,frame=0,disposed=false;
 const draw=()=>{if(disposed)return;root.rotation.y=yaw;root.rotation.x=pitch;camera.position.z=zoom;camera.lookAt(0,1.85,0);renderer.render(scene,camera)};
 const schedule=()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;draw()})};
 const onDown=e=>{drag={x:e.clientX,y:e.clientY};host.setPointerCapture(e.pointerId)};
 const onMove=e=>{if(!drag)return;yaw+=(e.clientX-drag.x)*.012;pitch=Math.max(-.35,Math.min(.35,pitch+(e.clientY-drag.y)*.006));drag={x:e.clientX,y:e.clientY};schedule()};
 const onUp=()=>{drag=null};
 const onWheel=e=>{e.preventDefault();zoom=Math.max(5,Math.min(11,zoom+Math.sign(e.deltaY)*.5));schedule()};
 host.addEventListener('pointerdown',onDown);host.addEventListener('pointermove',onMove);host.addEventListener('pointerup',onUp);host.addEventListener('pointercancel',onUp);host.addEventListener('wheel',onWheel,{passive:false});
 const observer=new ResizeObserver(()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();schedule()});observer.observe(host);
 const palette=[0x7c9180,0x69817b,0x9a866b,0x526c63,0x8b7772,0x64755d];
 function equip(build,catalog){
  for(const [i,id] of Object.keys(sections).entries()){
   const item=catalog.equipment.find(e=>e.id===build.equipment?.[id]);
   const index=item?Math.max(0,catalog.equipment.filter(e=>e.part===id).findIndex(e=>e.id===item.id)):0;
   const color=palette[(index+i)%palette.length];
   sections[id].traverse(obj=>{if(obj.isMesh&&obj.material===materials.metal){obj.material=obj.material.clone();obj.material.color.setHex(color)}});
   sections[id].visible=!!item;
  }
  schedule();
 }
 const reset=()=>{yaw=.4;pitch=0;zoom=7.7;schedule()};
 draw();
 return {equip,reset,zoomIn(){zoom=Math.max(5,zoom-.5);schedule()},zoomOut(){zoom=Math.min(11,zoom+.5);schedule()},dispose(){disposed=true;observer.disconnect();if(frame)cancelAnimationFrame(frame);host.removeEventListener('pointerdown',onDown);host.removeEventListener('pointermove',onMove);host.removeEventListener('pointerup',onUp);host.removeEventListener('pointercancel',onUp);host.removeEventListener('wheel',onWheel);scene.traverse(o=>{o.geometry?.dispose()});renderer.dispose();renderer.domElement.remove()}};
}
