// Fonctions pures : catalogue local, optimisation exploratoire, partage et comparaison.
// Aucune donnée de démonstration n'est certifiée comme donnée officielle.
import {validateBuild} from './validate-build.mjs';
export const PARTS=['weapon','head','chest','arms','waist','legs'];
export function compatibleGems(slot,decorations){return decorations.filter(g=>g.kind===slot.kind&&Number.isInteger(g.size)&&g.size<=slot.size);}
export function evaluateGoals(build,catalog,goals){
 const result=validateBuild(build,catalog);
 const missing=Object.entries(goals).filter(([,level])=>level>0).map(([id,level])=>({id,required:level,actual:result.effectiveSkills[id]||0})).filter(x=>x.actual<x.required);
 return {result,missing,matched:missing.length===0&&result.status==='valid',score:Object.entries(goals).reduce((s,[id,l])=>s+Math.min(result.effectiveSkills[id]||0,l),0)};
}
export function compareBuilds(a,b,catalog){
 const va=validateBuild(a,catalog),vb=validateBuild(b,catalog);
 return {a:va,b:vb,skills:[...new Set([...Object.keys(va.effectiveSkills),...Object.keys(vb.effectiveSkills)])].sort().map(id=>({id,a:va.effectiveSkills[id]||0,b:vb.effectiveSkills[id]||0,difference:(vb.effectiveSkills[id]||0)-(va.effectiveSkills[id]||0)}))};
}
export function optimizeDecorations(build,catalog,goals,{limit=30000}={}){
 // Recherche exacte sur les emplacements équipés et les joyaux du catalogue.
 // Ne remplace jamais l'équipement ni les joyaux déjà sertis.
 const base=structuredClone(build),equipped=Object.values(base.equipment||{}).map(id=>catalog.equipment.find(e=>e.id===id)).filter(Boolean);
 const slots=equipped.flatMap(e=>e.slots||[]).filter(s=>!(base.decorations||[]).some(d=>d.slotId===s.id));
 const targetIds=new Set(Object.entries(goals).filter(([,v])=>v>0).map(([k])=>k));
 const candidates=slots.map(slot=>[null,...compatibleGems(slot,catalog.decorations).filter(g=>Object.keys(g.skills||{}).some(k=>targetIds.has(k)))]);
 let explored=0,best=null,bestEval=null;
 const visit=(index,bindings)=>{
  if(explored>=limit)return;
  if(index===slots.length){
   explored++;
   const candidate={...base,decorations:[...(base.decorations||[]),...bindings]};
   const outcome=evaluateGoals(candidate,catalog,goals);
   if(outcome.result.status==='invalid')return;
   const weight=outcome.score*100-bindings.length;
   if(!best||weight>bestEval.weight){best=candidate;bestEval={...outcome,weight};}
   return;
  }
  for(const gem of candidates[index]){
   if(explored>=limit)break;
   visit(index+1,gem?[...bindings,{slotId:slots[index].id,decorationId:gem.id}]:bindings);
  }
 };
 visit(0,[]);
 return {build:best,evaluation:bestEval,explored,truncated:explored>=limit,complete:!!bestEval?.matched,mode:'joyaux uniquement',catalogCertified:catalog.manifest.verificationStatus==='verified'};
}
export function encodeShare(build){return btoa(Array.from(new TextEncoder().encode(JSON.stringify(build)),x=>String.fromCharCode(x)).join('')).replace(/[+]/g,'-').replace(/[/]/g,'_').replace(/=+$/,'');}
export function decodeShare(token){
 if(!/^[A-Za-z0-9_-]{1,20000}$/.test(token))throw Error('Lien de partage invalide');
 const raw=atob(token.replace(/-/g,'+').replace(/_/g,'/'));
 const parsed=JSON.parse(new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0))));
 if(!parsed||typeof parsed!=='object'||!parsed.equipment||!Array.isArray(parsed.decorations))throw Error('Build invalide');
 return parsed;
}
export function validateCustomTalisman(t,catalog){
 const entries=Object.entries(t?.skills||{});
 const errors=[];
 if(entries.length>3)errors.push('Un talisman ne peut contenir plus de trois talents.');
 for(const [id,level] of entries){
  const skill=catalog.skills.find(x=>x.id===id);
  if(!skill||!Number.isInteger(level)||level<1||level>skill.maxLevel)errors.push('Talent ou niveau de talisman invalide : '+id);
 }
 return errors;
}
