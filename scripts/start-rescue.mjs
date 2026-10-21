import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {createServer} from 'node:net';
import {fileURLToPath} from 'node:url';

// One foreground owner, two loopback-only children. Never reuse or kill another service.
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const children=new Set();let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();setTimeout(()=>process.exit(code),300).unref();process.exitCode=code;}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
function run(args){return new Promise((yes,no)=>{const child=spawn(process.execPath,args,{stdio:'inherit',windowsHide:true});children.add(child);child.once('error',no);child.once('exit',code=>{children.delete(child);code===0?yes():no(Error(`Setup command exited ${code}.`));});});}
async function free(port){await new Promise((yes,no)=>{const server=createServer();server.once('error',()=>no(Error(`Port ${port} is already occupied. Close that service yourself; nothing was stopped.`)));server.listen(port,'127.0.0.1',()=>server.close(yes));});}
function service(args){const child=spawn(process.execPath,args,{stdio:'inherit',windowsHide:true});children.add(child);child.once('error',e=>{console.error(e.message);stop(1);});child.once('exit',code=>{children.delete(child);if(!stopping){console.error(`A local service stopped (${code}). Closing this launch.`);stop(1);}});}
async function wait(url){for(let n=0;n<100;n++){if(stopping)throw Error('Launch cancelled.');try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});if(r.status<500)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw Error(`Local service did not become ready: ${url}`);}
try{
 if(Number(process.versions.node.split('.')[0])<22)throw Error('Install Node.js 22 or newer, then launch again. No model or API key is required.');
 await free(3101);await free(5175);
 const npm=process.env.npm_execpath;if(!npm||!existsSync(npm))throw Error('Start with npm run local, or double-click Start-FixPilot.cmd.');
 if(!existsSync('node_modules/.package-lock.json')){console.log('Installing locked dependencies (first launch requires internet).');await run([npm,'ci','--no-audit','--no-fund']);}
 console.log('Building the host and the self-contained MCP App from this source…');await run([npm,'run','build']);
 if(stopping)throw Error('Launch cancelled.');
 service(['--import','tsx','server/mcp.ts']);
 service(['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5175','--strictPort']);
 await wait('http://127.0.0.1:3101/mcp');await wait('http://127.0.0.1:5175/');
 const url='http://127.0.0.1:5175/?mcp-app';
 console.log(`FIXPILOT_LOCAL_READY ${url}\nClick Connect MCP App. Its separate host approval remains required.\nJudge Mode: http://127.0.0.1:5175/?judge\nKeep this window open. Ctrl+C stops both services. No public server is started.`);
 if(!process.argv.includes('--no-open')){
  const command=process.platform==='win32'?'explorer.exe':process.platform==='darwin'?'open':'xdg-open';
  const opener=spawn(command,[url],{stdio:'ignore',windowsHide:true});opener.on('error',()=>console.log(`Open ${url} in your browser.`));opener.unref();
 }
}catch(e){console.error(`Local launch failed: ${e.message}`);stop(1);}
