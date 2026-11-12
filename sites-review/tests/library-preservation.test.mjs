import test from 'node:test';import assert from 'node:assert/strict';
import {saveBuild,removeBuild,readLibrary} from '../dist/advanced/build-library.mjs';
for(const original of ['{broken','{}','[null]',''])test('préserve bibliothèque invalide '+JSON.stringify(original),()=>{let value=original;const storage={getItem:()=>value,setItem:(k,v)=>value=v};assert.throws(()=>saveBuild(storage,{equipment:{},decorations:[]}));assert.throws(()=>removeBuild(storage,'x'));assert.throws(()=>readLibrary(storage));assert.equal(value,original)});
test('refus de stockage propagé sans faux succès',()=>{const storage={getItem:()=>null,setItem:()=>{throw Error('Quota')}};assert.throws(()=>saveBuild(storage,{equipment:{},decorations:[]}),/Quota/)});
