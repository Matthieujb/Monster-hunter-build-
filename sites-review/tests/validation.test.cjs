const {test}=require('node:test'),assert=require('node:assert/strict'),V=require('../dist/domain/validation.js');
const c={version:'test',verified:false,equipment:['weapon','head','chest','arms','waist','legs'].map((part,i)=>({id:String(i),name:part,part,kind:part==='weapon'?'hammer':part,group:part==='weapon'?'weapon':'armor',slots:[1,3],skills:[{skill:{id:1},level:1}]})),decorations:[{id:1,name:'Test',slot:2,kind:'armor',skills:[]},{id:2,name:'Petit',slot:1,kind:'weapon',skills:[]}],skills:[{id:1,name:'Talent test',ranks:[{level:1},{level:3}]}]};
const b={gearItems:Object.fromEntries(c.equipment.map(x=>[x.part,x.id])),jewelPlacements:[]};
const check=(patch,code)=>assert.ok(V.validateBuild({...b,...patch},c).errors.some(e=>e.code===code));
test('pure, capped and provisional',()=>{const before=JSON.stringify(b),r=V.validateBuild(b,c);assert.equal(r.status,'valid');assert.equal(r.certified,false);assert.equal(r.effectiveSkills['1'],3);assert.ok(r.warnings.some(w=>w.code==='SKILL_OVERFLOW'));assert.equal(JSON.stringify(b),before)});
test('missing',()=>assert.equal(V.validateBuild({gearItems:{}},c).status,'incomplete'));
test('unknown equipment',()=>check({gearItems:{...b.gearItems,head:'404'}},'UNKNOWN_EQUIPMENT'));
test('wrong category',()=>check({weaponType:'bow'},'INVALID_WEAPON_CONFIG'));
test('slot size',()=>check({jewelPlacements:[{part:'head',slot:0,decorationId:1}]},'SLOT_SIZE'));
test('slot type',()=>check({jewelPlacements:[{part:'head',slot:0,decorationId:2}]},'SLOT_TYPE'));
test('duplicate',()=>check({jewelPlacements:[{part:'head',slot:1,decorationId:1},{part:'head',slot:1,decorationId:1}]},'SLOT_OCCUPIED'));
test('unknown slot',()=>check({jewelPlacements:[{part:'head',slot:9,decorationId:1}]},'UNKNOWN_SLOT'));
test('unknown decoration',()=>check({jewelPlacements:[{part:'head',slot:1,decorationId:404}]},'UNKNOWN_DECORATION'));
test('unknown cap never invented',()=>assert.equal(V.validateBuild(b,{...c,skills:[]}).effectiveSkills['1'],undefined));
test('advanced configurations uncertified',()=>assert.ok(V.validateBuild({...b,weaponConfig:{}},c).warnings.some(w=>w.message.includes('avancée'))));
test('no invented set activation',()=>assert.deepEqual(V.validateBuild(b,c).activeSetBonuses,[]));
test('duplicate catalog IDs rejected',()=>assert.ok(V.verifyCatalog({...c,decorations:[...c.decorations,c.decorations[0]]}).length));

const bonus={id:99,name:'Bonus test',kind:'group',ranks:[{level:1,setPiecesRequired:3}]};
function withBonus(count,duplicate=false){return {...c,skills:[...c.skills,bonus],equipment:c.equipment.map((e,i)=>({...e,skills:i>0&&i<=count?[...e.skills,...Array(duplicate?2:1).fill({skill:bonus,level:1})]:e.skills}))}}
test('bonus requires three distinct pieces and disappears below threshold',()=>{for(const count of [1,2,3,2]){const r=V.validateBuild(b,withBonus(count));assert.equal(r.effectiveSkills['99'],count===3?1:undefined);assert.deepEqual(r.activeSetBonuses,count===3?['99:1']:[])}});
test('duplicate ranks on same piece do not activate bonus',()=>assert.deepEqual(V.validateBuild(b,withBonus(2,true)).activeSetBonuses,[]));
