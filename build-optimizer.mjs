import {validateBuild} from './validate-build.mjs';
import {optimizeDecorations,evaluateGoals,PARTS} from './builder-features.mjs';
// Recherche combinatoire plafonnée : équipements ET joyaux, aucune garantie de solution globale si tronquée.
export function optimizeEquipment(build,catalog,goals,{limit=250,gemLimit=1500}={}){
 if(!Number.isInteger(limit)||limit<1||limit>5000)throw Error('Limite invalide');
 const choices=PARTS.map(part=>catalog.equipment.filter(e=>e.part===part));
 if(choices.some(a=>!a.length))return {build:null,explored:0,truncated:false,complete:false};
 let explored=0,best=null,bestScore=-Infinity;
 const total=choices.reduce((n,a)=>n*a.length,1);
 const visit=(i,equipment)=>{
  if(explored>=limit)return;
  if(i===PARTS.length){
   explored++;
   const candidate={...build,equipment:{...equipment},decorations:[],catalogVersion:catalog.version};
   const opt=optimizeDecorations(candidate,catalog,goals,{limit:gemLimit});
   const b=opt.build||candidate;
   const evaluation=evaluateGoals(b,catalog,goals);
   if(evaluation.result.status==='invalid')return;
   const score=evaluation.score*1000+(evaluation.matched?100000:0)-(b.decorations||[]).length;
   if(score>bestScore){bestScore=score;best={build:b,evaluation,gemSearchTruncated:opt.truncated}}
   return;
  }
  for(const e of choices[i]){if(explored>=limit)break;visit(i+1,{...equipment,[PARTS[i]]:e.id})}
 };
 visit(0,{});
 return {build:best?.build||null,evaluation:best?.evaluation||null,explored,total,truncated:explored<total,gemSearchTruncated:best?.gemSearchTruncated||false,complete:!!best?.evaluation.matched,catalogCertified:catalog.manifest.verificationStatus==='verified'};
}
