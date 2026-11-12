"""Restore the exact v15 snapshot and apply the reviewable patch; never deploy."""
from pathlib import Path
import hashlib, shutil, subprocess, sys, zipfile
root=Path(__file__).resolve().parents[1]
archive=root/'exports/wilds-sites-v15.zip'
if hashlib.sha256(archive.read_bytes()).hexdigest()!='3797b3a8441a05e5796485f560bd06b5dd4dd05264cb2167dd9ba42a0e208320':
    raise SystemExit('Archive v15 différente : arrêt, aucune modification appliquée.')
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root/'sites-review/worktree'
if out.exists():raise SystemExit('Le dossier cible existe déjà. Choisir un nouveau dossier vide de travail.')
out.mkdir(parents=True)
with zipfile.ZipFile(archive) as z:
    for entry in z.infolist():
        relative=Path(entry.filename)
        if relative.parts[0]!='site' or '..' in relative.parts:raise SystemExit('Chemin archive invalide')
        target=out/'dist'/Path(*relative.parts[1:])
        if entry.is_dir():target.mkdir(parents=True,exist_ok=True)
        else:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(entry))
subprocess.run(['git','init','-q',str(out)],check=True)
patch=str(root/'exports/stabilisation-v15.patch')
subprocess.run(['git','apply','--check',patch],cwd=out,check=True)
subprocess.run(['git','apply',patch],cwd=out,check=True)
shutil.copytree(root/'sites-review/tests',out/'tests')
tests=sorted(str(p.relative_to(out)) for pattern in ['tests/*.test.mjs','tests/*.test.cjs','dist/advanced/*.test.mjs'] for p in out.glob(pattern))
subprocess.run(['node','--test',*tests],cwd=out,check=True)
print('Code préparé et testé :',out)
