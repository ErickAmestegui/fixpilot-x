import {readFile,mkdir,writeFile,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import {execFileSync} from 'node:child_process';
const base='https://erickamestegui.github.io/fixpilot-x/',root=resolve('site-release');
const manifests=await Promise.all(['docs/challenge-evidence/stable-public-manifest.json','docs/podium-evidence/challenge-public-manifest.json'].map(async p=>JSON.parse(await readFile(p,'utf8'))));
for(const manifest of manifests){
 if(manifest.base!==base)throw Error('Unexpected preservation origin.');
 for(const f of manifest.files){
  if(!/^(challenge\/)?(index\.html|release\.json|assets\/[A-Za-z0-9_.-]+)$/.test(f.path))throw Error('Invalid preserved path.');
  const target=resolve(root,f.path);if(!target.startsWith(root+sep))throw Error('Path escaped release.');
  const r=await fetch(new URL(f.path,base));if(!r.ok)throw Error('Current public demo unavailable; publication refused.');
  const b=Buffer.from(await r.arrayBuffer());if(b.length!==f.bytes||createHash('sha256').update(b).digest('hex')!==f.sha256)throw Error(`Published bytes changed: ${f.path}. Publication refused.`);
  await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,b);
 }
}
await cp('dist',resolve(root,'podium'),{recursive:true});
await writeFile(resolve(root,'podium','release.json'),JSON.stringify({sourceCommit:process.env.GITHUB_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),preserved:manifests.flatMap(m=>m.files),mode:'Browser engine on public site; MCP Apps and HTTP need localhost. Human study pending.'},null,2));
console.log('Preserved root and Challenge byte for byte. New version is isolated at /podium/?judge.');
