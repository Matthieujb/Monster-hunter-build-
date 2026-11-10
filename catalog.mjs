export function verifyCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return {ok:false,errors:['CATALOG_MISSING']};
  if (!catalog.version || !catalog.manifest || !Array.isArray(catalog.equipment) || !Array.isArray(catalog.decorations) || !Array.isArray(catalog.skills) || !Array.isArray(catalog.setBonuses)) errors.push('CATALOG_SCHEMA');
  const ids = new Set();
  for (const [kind, entries] of [['equipment',catalog.equipment||[]],['decorations',catalog.decorations||[]],['skills',catalog.skills||[]],['setBonuses',catalog.setBonuses||[]]]) {
    for (const entry of entries) {
      const id = `${kind}:${entry.id}`;
      if (!entry.id || ids.has(id)) errors.push(`DUPLICATE_OR_MISSING_ID:${id}`);
      ids.add(id);
    }
  }
  const skillIds = new Set((catalog.skills||[]).map(x=>x.id));
  for (const item of [...(catalog.equipment||[]),...(catalog.decorations||[]),...(catalog.setBonuses||[])]) {
    for (const key of Object.keys(item.skills||{})) if (!skillIds.has(key)) errors.push(`UNKNOWN_SKILL:${item.id}:${key}`);
  }
  for (const item of catalog.equipment||[]) {
    for (const slot of item.slots||[]) if (!Number.isInteger(slot.size) || slot.size<1 || slot.size>3 || !['weapon','armor'].includes(slot.kind)) errors.push(`INVALID_SLOT:${item.id}`);
  }
  for (const gem of catalog.decorations||[]) if (!Number.isInteger(gem.size) || gem.size<1 || gem.size>3 || !['weapon','armor'].includes(gem.kind)) errors.push(`INVALID_DECORATION:${gem.id}`);
  return {ok:errors.length===0,errors};
}
export function indexCatalog(catalog) {
  return {equipment:new Map(catalog.equipment.map(e=>[e.id,e])),decorations:new Map(catalog.decorations.map(d=>[d.id,d])),skills:new Map(catalog.skills.map(s=>[s.id,s]))};
}
