import {validateBuild} from './validate-build.mjs';
import {optimizeDecorations,compareBuilds,encodeShare,decodeShare,validateCustomTalisman} from './builder-features.mjs';
let snapshot=null;
function setupAdvanced(){
 const skillOptions=()=>catalog.skills.map(s=>'<option value="'+s.id+'">'+s.name.replaceAll('&','&amp;').replaceAll('<','&lt;')+'</option>').join('');
 const talisman=$('talismanEditor');talisman.replaceChildren();
 for(let i=0;i<3;i++){const line=el('div','editor-row');const skill=el('select');skill.id='talismanSkill'+i;skill.append(new Option('— Aucun —',''));for(const s of catalog.skills)skill.append(new Option(s.name,s.id));const lvl=el('input');lvl.id='talismanLevel'+i;lvl.type='number';lvl.min='1';lvl.max='10';lvl.value='1';lvl.setAttribute('aria-label','Niveau du talent '+(i+1));line.append(skill,lvl);talisman.append(line)}
 $('applyTalisman').onclick=()=>{const skills={};for(let i=0;i<3;i++){const id=$('talismanSkill'+i).value;if(id)skills[id]=Number($('talismanLevel'+i).value)}const t={skills,verificationStatus:'example-only'};const errors=validateCustomTalisman(t,catalog);$('talismanMessage').textContent=errors.join(' ')||'Talisman enregistré, non certifié.';if(errors.length)return;build.talisman=t;render()};
 const goals=$('goalEditor');goals.replaceChildren();for(const s of catalog.skills){const line=el('label','goal-row');line.append(el('span','',s.name));const n=el('input');n.type='number';n.min='0';n.max=String(s.maxLevel);n.value='0';n.dataset.skill=s.id;line.append(n);goals.append(line)}
 $('optimizeBtn').onclick=()=>{const goals={};for(const n of goals.querySelectorAll('input')){const v=Number(n.value);if(v>0)goals[n.dataset.skill]=Math.min(v,Number(n.max))}if(!Object.keys(goals).length){$('optimizeResult').textContent='Sélectionnez au moins un talent.';return}const result=optimizeDecorations(build,catalog,goals);if(result.build){build=result.build;render()}$('optimizeResult').textContent=(result.complete?'Objectifs atteints. ':'Objectifs non atteints. ')+result.explored+' combinaisons explorées'+(result.truncated?' (limite atteinte).':'')+' Résultat non certifié.'};
 $('applyWeapon').onclick=()=>{const system=$('weaponSystem').value;build.weaponConfiguration=system?{system,notes:$('weaponNotes').value,verificationStatus:'example-only'}:{};render()};
 $('snapshotBtn').onclick=()=>{snapshot=structuredClone(build);$('compareResult').textContent='Montage A mémorisé.'};
 $('compareBtn').onclick=()=>{if(!snapshot){$('compareResult').textContent='Mémorisez d’abord un montage A.';return}const comparison=compareBuilds(snapshot,build,catalog);const target=$('compareResult');target.replaceChildren();for(const skill of comparison.skills){const s=catalog.skills.find(x=>x.id===skill.id);target.append(el('div','skillrow', (s?.name||skill.id)+' : '+skill.a+' → '+skill.b))}};
 $('shareBtn').onclick=async()=>{const url=new URL(location.href);url.hash='build='+encodeShare(build);try{await navigator.clipboard.writeText(url.href);$('compareResult').textContent='Lien copié.'}catch{$('compareResult').textContent=url.href}};
 try{const params=new URLSearchParams(location.hash.slice(1));const token=params.get('build');if(token){const imported=decodeShare(token);if(imported.catalogVersion===catalog.version){build=imported;render();$('compareResult').textContent='Build importé depuis le lien.'}else $('compareResult').textContent='Version du catalogue incompatible avec le lien.'}}catch(e){$('compareResult').textContent='Lien invalide : '+e.message}
}

const read=async name=>{const r=await fetch('./'+name);if(!r.ok)throw new Error('Chargement de '+name);return r.json()};
const $=id=>document.getElementById(id);
const partLabels={weapon:'Arme',head:'Tête',chest:'Torse',arms:'Bras',waist:'Taille',legs:'Jambes'};
let catalog, build, part='head',hunterViewer=null;
const localKey='wilds-kit-demo-build-v1';
function defaultBuild(){return {catalogVersion:catalog.version,equipment:{weapon:'demo-weapon',head:'demo-helm',chest:'demo-mail',arms:'demo-gloves',waist:'demo-waist',legs:'demo-boots'},decorations:[]};}
function itemFor(p){return catalog.equipment.find(e=>e.id===build.equipment[p])}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function render(){
 if(hunterViewer)hunterViewer.equip(build,catalog);
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
async function init(){try {const [manifest,equipment,decorations,skills,setBonuses]=await Promise.all(['manifest.json','equipment.json','decorations.json','skills.json','set-bonuses.json'].map(read));catalog={manifest,version:manifest.catalogVersion,equipment,decorations,skills,setBonuses};build=defaultBuild();$('version').textContent=catalog.version;render();gemCards();damage();setupAdvanced();loadHunter3D();}catch(e){$('status').textContent='CHARGEMENT IMPOSSIBLE';$('selectedPiece').textContent=String(e);console.error(e)}}
$('menuToggle').addEventListener('click',()=>{const show=$('navigation').classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String(show))});document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{$('navigation').classList.remove('open');document.querySelectorAll('nav a').forEach(x=>x.classList.toggle('active',x===a))}));
$('saveBtn').addEventListener('click',()=>{if(!build)return;localStorage.setItem(localKey,JSON.stringify(build));alert('Build de démonstration sauvegardé sur ce navigateur.')});
$('loadBtn').addEventListener('click',()=>{try{const saved=JSON.parse(localStorage.getItem(localKey));if(!saved){alert('Aucune sauvegarde de démo.');return}if(!saved.equipment||!Array.isArray(saved.decorations))throw Error('Format invalide');build=saved;render()}catch(e){alert('Chargement impossible : '+e.message)}});
$('clearBtn').addEventListener('click',()=>{if(!catalog)return;build=defaultBuild();render()});$('searchGem').addEventListener('input',gemCards);$('gemType').addEventListener('change',gemCards);for(const id of ['attack','motion','hitzone','sharpness'])$(id).addEventListener('input',damage);if($('copyBtn'))$('copyBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(build,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='wilds-build-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});init();

async function loadHunter3D(){
 const host=$('hunter3d'),status=$('hunter3dStatus'),fallback=$('hunterFallback');
 if(!host)return;
 try{
  const {createHunterViewer}=await import('./hunter-viewer.mjs');
  hunterViewer=await createHunterViewer(host);
  hunterViewer.equip(build,catalog);
  fallback.hidden=true;status.textContent='Glisser pour tourner · Pincer pour zoomer';
  $('hunterZoomIn').onclick=()=>hunterViewer.zoomIn();
  $('hunterZoomOut').onclick=()=>hunterViewer.zoomOut();
  $('hunterReset').onclick=()=>hunterViewer.reset();
 }catch(error){console.warn('Visualiseur 3D indisponible',error);host.hidden=true;fallback.hidden=false;status.textContent='Mode 2D : WebGL ou connexion 3D indisponible';}
}
