import {readFile,mkdir,writeFile,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import {execFileSync} from 'node:child_process';
// Preserve the already-published stable bytes; refuse if someone has changed them.
const manifest=JSON.parse(await readFile('docs/challenge-evidence/stable-public-manifest.json','utf8'));
const expectedBase='https://erickamestegui.github.io/fixpilot-x/';if(manifest.base!==expectedBase)throw Error('Unexpected stable origin.');
const root=resolve('site-release');await mkdir(root,{recursive:true});
for(const file of manifest.files){
 if(file.path!=='index.html'&&!/^assets\/[A-Za-z0-9_.-]+$/.test(file.path))throw Error('Unexpected stable asset path.');
 const target=resolve(root,file.path);if(!target.startsWith(root+sep))throw Error('Asset escaped release root.');
 const response=await fetch(new URL(file.path,expectedBase));if(!response.ok)throw Error('Stable source is unavailable; publication refused.');
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Stable public bytes changed; publication refused.');
 await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,bytes);
}
await cp('dist',resolve(root,'challenge'),{recursive:true});
await writeFile(resolve(root,'challenge','release.json'),JSON.stringify({sourceCommit:process.env.GITHUB_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),stableCheckpoint:manifest.stableCheckpoint,stableFiles:manifest.files,publicMode:'Original browser engine. MCP HTTP and MCP Apps require localhost. No LLM or native Alexa+ connection.'},null,2));
console.log('Preserved '+manifest.files.length+' hash-verified stable assets; Challenge is isolated at /challenge/.');
