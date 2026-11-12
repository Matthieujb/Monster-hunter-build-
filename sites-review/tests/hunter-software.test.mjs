import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/advanced/vendor/three-0.170.0.mjs';
import {createSoftwareRenderer} from '../dist/advanced/software-renderer.mjs';

test('3D logicielle : projection, rotation, zoom et visibilité des équipements',()=>{
 const original=globalThis.document;let points=[];
 const context={setTransform(){},clearRect(){points=[]},beginPath(){},moveTo(x,y){points.push([x,y])},lineTo(x,y){points.push([x,y])},closePath(){},fill(){}};
 globalThis.document={createElement(){return {getContext(){return context}}}};
 try{
  const renderer=createSoftwareRenderer(THREE);renderer.setPixelRatio(1.5);renderer.setSize(390,340);
  assert.equal(renderer.domElement.width,585);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,390/340,.1,100);
  camera.position.set(0,0,7);camera.lookAt(0,0,0);
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,2,.5),new THREE.MeshBasicMaterial({color:0xc5a36a}));scene.add(mesh);
  renderer.render(scene,camera);assert.ok(points.length>0);assert.ok(points.flat().every(Number.isFinite));
  const initial=JSON.stringify(points);mesh.rotation.y=.8;renderer.render(scene,camera);assert.notEqual(JSON.stringify(points),initial);
  const extent=()=>Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0]));const distant=extent();
  camera.position.z=5;renderer.render(scene,camera);assert.ok(extent()>distant);
  mesh.visible=false;renderer.render(scene,camera);assert.equal(points.length,0);
  mesh.visible=true;camera.position.z=7;mesh.rotation.y=0;renderer.render(scene,camera);assert.equal(JSON.stringify(points),initial);
  renderer.dispose();assert.equal(renderer.domElement.width,1);
 }finally{globalThis.document=original}
});

test('3D logicielle : géométrie non indexée et faces hors du champ',()=>{
 const original=globalThis.document;let count=0;
 globalThis.document={createElement(){return {getContext(){return {setTransform(){},clearRect(){count=0},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){count++}}}}}};
 try{
  const renderer=createSoftwareRenderer(THREE);renderer.setSize(300,300);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,10);camera.position.z=5;camera.lookAt(0,0,0);
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1).toNonIndexed(),new THREE.MeshBasicMaterial());scene.add(mesh);
  renderer.render(scene,camera);assert.ok(count>0);
  mesh.position.z=20;renderer.render(scene,camera);assert.equal(count,0);
 }finally{globalThis.document=original}
});
