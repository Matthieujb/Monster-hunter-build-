// Modèle transparent d'estimation physique, non formule certifiée MH Wilds.
export function estimatePhysicalDamage(input){
 const keys=['trueRaw','motionValue','hitzone','sharpness','affinity','criticalMultiplier','otherMultiplier'];
 for(const key of keys)if(!Number.isFinite(Number(input[key])))throw Error('Valeur numérique invalide : '+key);
 const {trueRaw,motionValue,hitzone,sharpness,affinity,criticalMultiplier,otherMultiplier}=Object.fromEntries(keys.map(k=>[k,Number(input[k])]));
 if(trueRaw<0||motionValue<0||hitzone<0||hitzone>100||sharpness<0||affinity< -100||affinity>100||criticalMultiplier<0||otherMultiplier<0)throw Error('Paramètres hors limites');
 const base=trueRaw*motionValue/100*hitzone/100*sharpness*otherMultiplier;
 const expectedCrit=affinity>=0?1+affinity/100*(criticalMultiplier-1):1+(-affinity)/100*(.75-1);
 return {base,expected:base*expectedCrit,criticalFactor:expectedCrit,assumptions:['Attaque brute réelle renseignée manuellement','Critique négatif : 0,75 (hypothèse)','Sans élément, statut, défense, arrondi du jeu ni conditions de talents'],verifiedFormula:false};
}
