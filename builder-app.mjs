import {validateBuild} from './validate-build.mjs';
const read=async name=>{const r=await fetch('./'+name);if(!r.ok)throw new Error('Chargement de '+name);return r.json()};
const $=id=>document.getElementById(id);
const partLabels={weapon:'Arme',head:'Tête',chest:'Torse',arms:'Bras',waist:'Taille',legs:'Jambes'};
let catalog, build, part='head';
const localKey='wilds-kit-demo-build-v1';
function defaultBuild(){return {catalogVersion:catalog.version,equipment:{weapon:'demo-weapon',head:'demo-helm',chest:'demo-mail',arms:'demo-gloves',waist:'demo-waist',legs:'demo-boots'},decorations:[]};}
function itemFor(p){return catalog.equipment.find(e=>e.id===build.equipment[p])}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function render(){
 const picker=$('equipmentPicker');if(picker){picker.replaceChildren();for(const item of catalog.equipment.filter(x=>x.part===part))picker.append(new Option(item.name,item.id));picker.value=build.equipment[part]||'';picker.onchange=()=>{const previous=itemFor(part);const oldSlots=new Set((previous?.slots||[]).map(s=>s.id));build.equipment[part]=picker.value;build.decorations=build.decorations.filter(d=>!oldSlots.has(d.slotId));render()};}

 $('equipmentList').replaceChildren();
 for(const [p,label] of Object.entries(partLabels)){
  const e=itemFor(p),b=el('button','equipment-button'+(p===part?' active':''));b.type='button';const t=el('span');t.append(el('strong','',label),el('small','',e?.name||'Aucune pièce'));b.append(el('span','symbol','◇'),t,el('span','','›'));b.addEventListener('click',()=>{part=p;render()});$('equipmentList').append(b);
 }
 const e=itemFor(part);$('selectedPiece').textContent=e?.name||'Aucune pièce';$('slots').replaceChildren();
 for(const slot of e?.slots||[]){
  const row=el('div','slotrow'),lab=el('label'),txt=el('span','',`Emplacement ${slot.kind==='weapon'?'arme':'armure'}`),sz=el('span','slot-size','◇'.repeat(slot.size));lab.append(txt,sz);
  const select=el('select');select.setAttribute('aria-label',`Joyau pour ${slot.id}`);select.append(new Option('— Aucun joyau —',''));
  for(const gem of catalog.decorations.filter(x=>x.kind===slot.kind&&x.size<=slot.size))select.append(new Option(`${gem.name} · taille ${gem.size}`,gem.id));
  const selected=build.decorations.find(x=>x.slotId===slot.id);select.value=selected?.decorationId||'';
  select.addEventListener('change',()=>{build.decorations=build.decorations.filter(x=>x.slotId!==slot.id);if(select.value)build.decorations.push({slotId:slot.id,decorationId:select.value});render()});row.append(lab,select);$('slots').append(row);
 }
 const v=validateBuild(build,catalog);if($('buildSummary'))$('buildSummary').textContent=`${Object.values(build.equipment).filter(Boolean).length} pièces · ${build.decorations.length} joyau(x) · ${v.activeSetBonuses.length} bonus de set`;$('status').textContent=v.status==='valid'?'STRUCTURE VALIDE':v.status==='incomplete'?'INCOMPLET':'INCOMPATIBLE';$('status').className=v.status==='invalid'?'invalid':'';$('certification').textContent=v.certified?'Données certifiées':'Données de démo non certifiables';$('errorCount').textContent=v.errors.length;$('warningCount').textContent=v.warnings.length;
 for(const [id,items,empty] of [['errors',v.errors,'Aucune erreur détectée'],['warnings',v.warnings,'Aucun avertissement']]){const ul=$(id);ul.replaceChildren();for(const x of items)ul.append(el('li','',x.message));if(!items.length)ul.append(el('li','',empty));}
 $('skills').replaceChildren();const entries=Object.entries(v.effectiveSkills);if(!entries.length)$('skills').append(el('p','smalltext','Aucun talent renseigné.'));for(const [id,lvl] of entries){const skill=catalog.skills.find(x=>x.id===id);const row=el('div','skillrow');row.append(el('span','',skill?.name||id),el('span','pips',`${lvl}/${skill?.maxLevel||'?'} · ${'◆'.repeat(lvl)}`));$('skills').append(row)}
}
function gemCards(){const q=$('searchGem').value.toLocaleLowerCase('fr-FR'),kind=$('gemType').value;const target=$('gemCards');target.replaceChildren();for(const gem of catalog.decorations.filter(g=>(kind==='all'||g.kind===kind)&&g.name.toLocaleLowerCase('fr-FR').includes(q))){const c=el('div','gemcard'),icon=el('div','gem-icon'+(gem.kind==='weapon'?' weapon':''),'◇'),t=el('div');t.append(el('strong','',gem.name),el('small','',`Taille ${gem.size} · ${gem.kind==='weapon'?'Arme':'Armure'}`));c.append(icon,t);target.append(c)} }
function damage(){const a=Number($('attack').value)||0,m=Number($('motion').value)||0,h=Number($('hitzone').value)||0,s=Number($('sharpness').value)||0;$('damageValue').textContent=Math.max(0,a*m/100*h/100*s).toFixed(1)}
async function init(){try {const [manifest,equipment,decorations,skills,setBonuses]=await Promise.all(['manifest.json','equipment.json','decorations.json','skills.json','set-bonuses.json'].map(read));catalog={manifest,version:manifest.catalogVersion,equipment,decorations,skills,setBonuses};build=defaultBuild();$('version').textContent=catalog.version;render();gemCards();damage();}catch(e){$('status').textContent='CHARGEMENT IMPOSSIBLE';$('selectedPiece').textContent=String(e);console.error(e)}}
$('menuToggle').addEventListener('click',()=>{const show=$('navigation').classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String(show))});document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{$('navigation').classList.remove('open');document.querySelectorAll('nav a').forEach(x=>x.classList.toggle('active',x===a))}));
$('saveBtn').addEventListener('click',()=>{if(!build)return;localStorage.setItem(localKey,JSON.stringify(build));alert('Build de démonstration sauvegardé sur ce navigateur.')});
$('loadBtn').addEventListener('click',()=>{try{const saved=JSON.parse(localStorage.getItem(localKey));if(!saved){alert('Aucune sauvegarde de démo.');return}if(!saved.equipment||!Array.isArray(saved.decorations))throw Error('Format invalide');build=saved;render()}catch(e){alert('Chargement impossible : '+e.message)}});
$('clearBtn').addEventListener('click',()=>{if(!catalog)return;build=defaultBuild();render()});$('searchGem').addEventListener('input',gemCards);$('gemType').addEventListener('change',gemCards);for(const id of ['attack','motion','hitzone','sharpness'])$(id).addEventListener('input',damage);if($('copyBtn'))$('copyBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(build,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='wilds-build-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});init();
