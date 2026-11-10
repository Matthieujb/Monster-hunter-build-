import { verifyCatalog, indexCatalog } from './catalog.mjs';

export function validateBuild(build, catalog, options={}) {
  const errors=[],warnings=[], rawSkills={}, effectiveSkills={}, activeSetBonuses=[];
  const issue=(severity,code,message,context={})=> (severity==='error'?errors:warnings).push({severity,code,message,...context});
  const check=verifyCatalog(catalog);
  if(!check.ok){ for(const code of check.errors) issue('error','CATALOG_INVALID',code); return {status:'invalid',errors,warnings,rawSkills,effectiveSkills,activeSetBonuses,catalogVersion:catalog?.version??null,certified:false}; }
  if(!build || typeof build!=='object') {issue('error','BUILD_INVALID','Build manquant');return {status:'invalid',errors,warnings,rawSkills,effectiveSkills,activeSetBonuses,catalogVersion:catalog.version,certified:false};}
  const index=indexCatalog(catalog), equipped=[], expectedParts=['weapon','head','chest','arms','waist','legs'];
  const equipmentByPart=build.equipment||{};
  let incomplete=false;
  for(const part of expectedParts){
    const id=equipmentByPart[part];
    if(!id){incomplete=true;continue;}
    const item=index.equipment.get(id);
    if(!item){issue('error','UNKNOWN_EQUIPMENT',`Équipement inconnu : ${id}`,{part});continue;}
    if(item.part!==part){issue('error','EQUIPMENT_PART',`Équipement incompatible avec ${part}`,{part,equipmentId:id});continue;}
    equipped.push(item);
    for(const [key,level] of Object.entries(item.skills||{})) rawSkills[key]=(rawSkills[key]||0)+level;
  }
  const slotMap=new Map();for(const e of equipped)for(const slot of e.slots||[]) {
    if(slotMap.has(slot.id))issue('error','DUPLICATE_SLOT_ID',`ID emplacement répété ${slot.id}`);
    slotMap.set(slot.id,{...slot,equipmentId:e.id});
  }
  const used=new Set();
  for(const binding of build.decorations||[]) {
    if(!binding || !binding.slotId || !binding.decorationId){issue('error','DECORATION_BINDING','Affectation incomplète');continue;}
    const slot=slotMap.get(binding.slotId), gem=index.decorations.get(binding.decorationId);
    if(used.has(binding.slotId))issue('error','SLOT_OCCUPIED',`Emplacement utilisé plusieurs fois : ${binding.slotId}`,{slotId:binding.slotId});
    used.add(binding.slotId);
    if(!slot){issue('error','UNKNOWN_SLOT',`Emplacement inexistant : ${binding.slotId}`,{slotId:binding.slotId});continue;}
    if(!gem){issue('error','UNKNOWN_DECORATION',`Joyau inconnu : ${binding.decorationId}`,{slotId:binding.slotId});continue;}
    let legal=true;
    if(gem.size>slot.size){issue('error','SLOT_SIZE',`Joyau de taille ${gem.size} dans un emplacement ${slot.size}`,{slotId:binding.slotId});legal=false;}
    if(gem.kind!==slot.kind){issue('error','SLOT_TYPE',`Joyau ${gem.kind} incompatible avec emplacement ${slot.kind}`,{slotId:binding.slotId});legal=false;}
    if(used.has(binding.slotId) && (build.decorations||[]).filter(d=>d?.slotId===binding.slotId).length>1)legal=false;
    if(legal)for(const [key,level] of Object.entries(gem.skills||{}))rawSkills[key]=(rawSkills[key]||0)+level;
  }
  const talisman=build.talisman;
  if(talisman){
    if(talisman.verificationStatus!=='verified')issue('warning','UNVERIFIED_TALISMAN','Talisman non certifié');
    if(Object.keys(talisman.skills||{}).length>3)issue('error','INVALID_TALISMAN','Plus de trois talents renseignés');
    for(const [key,level] of Object.entries(talisman.skills||{})){
      if(!index.skills.has(key)||!Number.isInteger(level)||level<1)issue('error','INVALID_TALISMAN_SKILL',`Talent de talisman invalide : ${key}`);
      else rawSkills[key]=(rawSkills[key]||0)+level;
    }
  }
  for(const bonus of catalog.setBonuses){
    if(equipped.filter(item=>item.setId===bonus.setId).length >=bonus.requiredPieces){
      activeSetBonuses.push(bonus.id);
      for(const [key,level] of Object.entries(bonus.skills||{}))rawSkills[key]=(rawSkills[key]||0)+level;
    }
  }
  for(const [key,raw] of Object.entries(rawSkills)){
    const skill=index.skills.get(key);
    if(!skill){issue('error','UNKNOWN_SKILL',`Talent inexistant : ${key}`);continue;}
    effectiveSkills[key]=Math.min(raw,skill.maxLevel);
    if(raw>skill.maxLevel) issue('warning','SKILL_OVERFLOW',`Talent ${skill.name}: ${raw} > plafond ${skill.maxLevel}`);
  }
  const patchMismatch=build.catalogVersion && build.catalogVersion!==catalog.version;
  if(patchMismatch)issue('warning','CATALOG_VERSION_MISMATCH',`Build ${build.catalogVersion}, catalogue ${catalog.version}`);
  const unverified=[...equipped,...(build.decorations||[]).map(x=>index.decorations.get(x.decorationId)).filter(Boolean),...catalog.setBonuses.filter(x=>activeSetBonuses.includes(x.id))].some(x=>x.verificationStatus!=='verified');
  if(unverified||catalog.manifest.verificationStatus!=='verified')issue('warning','UNVERIFIED_DATA','Données illustratives ou non vérifiées : aucune certification possible');
  if(Object.keys(build.weaponConfiguration||{}).length)issue('warning','WEAPON_CONFIGURATION_UNVERIFIED','Configuration d’arme spécifique à confirmer avec des règles vérifiées');
  const status=errors.length?'invalid':incomplete?'incomplete':'valid';
  const certified=status==='valid' && !warnings.some(x=>['UNVERIFIED_DATA','UNVERIFIED_TALISMAN','WEAPON_CONFIGURATION_UNVERIFIED','CATALOG_VERSION_MISMATCH'].includes(x.code));
  return {status,errors,warnings,rawSkills,effectiveSkills,activeSetBonuses,catalogVersion:catalog.version,certified};
}
