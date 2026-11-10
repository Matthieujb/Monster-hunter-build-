import test from 'node:test';import assert from 'node:assert/strict';
import {estimatePhysicalDamage} from './damage-engine.mjs';
import {optimizeEquipment} from './build-optimizer.mjs';
import {saveBuild,listBuilds,removeBuild} from './build-library.mjs';
import {readFileSync} from 'node:fs';
const json=n=>JSON.parse(readFileSync(new URL('./'+n,import.meta.url),'utf8'));
const manifest=json('manifest.json'),catalog={manifest,version:manifest.catalogVersion,equipment:json('equipment.json'),decorations:json('decorations.json'),skills:json('skills.json'),setBonuses:json('set-bonuses.json')};
const build={catalogVersion:catalog.version,equipment:{weapon:'demo-weapon',head:'demo-helm',chest:'demo-mail',arms:'demo-gloves',waist:'demo-waist',legs:'demo-boots'},decorations:[]};
test('Dégâts de base et espérance critique positive',()=>{const x=estimatePhysicalDamage({trueRaw:200,motionValue:50,hitzone:50,sharpness:1,affinity:100,criticalMultiplier:1.25,otherMultiplier:1});assert.equal(x.base,50);assert.equal(x.expected,62.5);assert.equal(x.verifiedFormula,false)});
test('Affinité négative et entrées invalides',()=>{const base={trueRaw:200,motionValue:50,hitzone:50,sharpness:1,affinity:-100,criticalMultiplier:1.25,otherMultiplier:1};assert.equal(estimatePhysicalDamage(base).expected,37.5);assert.throws(()=>estimatePhysicalDamage({...base,affinity:101}))});
test('Optimisation équipement et joyaux du catalogue demo',()=>{const x=optimizeEquipment(build,catalog,{'demo-evasion':1},{limit:250,gemLimit:1500});assert.ok(x.build);assert.equal(x.complete,true);assert.equal(x.catalogCertified,false)});
test('Bibliothèque locale : sauvegarde, liste, suppression',()=>{const data=new Map();const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};const r=saveBuild(storage,build,{name:'Test'});assert.equal(listBuilds(storage)[0].name,'Test');assert.ok(removeBuild(storage,r.id));assert.equal(listBuilds(storage).length,0)});
test('Bestiaire et fabrication : ne pas présenter des données non vérifiées',()=>{assert.equal(json('bestiary.json').verificationStatus,'community-sourced-partial');assert.equal(json('bestiary.json').monsters.length,10);assert.ok(json('bestiary.json').monsters.every(m=>m.source.startsWith('https://')&&m.materials.every(x=>(x.chance===null||(Number.isInteger(x.chance)&&x.chance>=0&&x.chance<=100))&&['Novice','Expert'].includes(x.rank))));assert.deepEqual(json('crafting.json').recipes,[])});

test('Bestiaire : sources, rangs, probabilité et dépeçage vérifiables',()=>{const m=json('bestiary.json').monsters;assert.equal(m.find(x=>x.id==='chatacabra').materials.find(x=>x.name==='Écaille Chatacabra'&&x.method==='Dépeçage').chance,35);assert.equal(m.find(x=>x.id==='balahara').materials.find(x=>x.name==='Queue Balahara'&&x.method==='Dépeçage de queue sectionnée').chance,100);assert.equal(m.find(x=>x.id==='doshaguma').materials.find(x=>x.name==='Griffe Doshaguma'&&x.method==='Bris de patte avant').chance,100)});

test('Endgame : six monstres avec sources et taux inconnus non inventés',()=>{const data=json('bestiary.json');for(const id of ['arkveld','rey-dau','uth-duna','nu-udra','jin-dahaad','gogmazios']){const m=data.monsters.find(x=>x.id===id);assert.ok(m,id);assert.ok(m.materials.length>=6);assert.ok(m.materials.every(x=>x.chance===null));assert.ok(m.source.startsWith('https://'))}});
