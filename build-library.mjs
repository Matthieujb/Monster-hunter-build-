// Stockage local : aucune donnée transmise au serveur.
export function saveBuild(storage,build,{name='Montage sans nom',max=30}={}){
 if(typeof name!=='string'||name.length>80||!name.trim())throw Error('Nom invalide');
 const existing=listBuilds(storage);if(existing.length>=max)throw Error('Bibliothèque pleine');
 const record={id:'build-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),name:name.trim(),savedAt:new Date().toISOString(),build:structuredClone(build)};
 storage.setItem('wilds-build-library-v1',JSON.stringify([...existing,record]));return record;
}
export function listBuilds(storage){try{const x=JSON.parse(storage.getItem('wilds-build-library-v1')||'[]');return Array.isArray(x)?x.filter(r=>r&&typeof r.id==='string'&&r.build?.equipment&&Array.isArray(r.build.decorations)):[]}catch{return []}}
export function removeBuild(storage,id){const list=listBuilds(storage);const updated=list.filter(r=>r.id!==id);storage.setItem('wilds-build-library-v1',JSON.stringify(updated));return updated.length!==list.length}
