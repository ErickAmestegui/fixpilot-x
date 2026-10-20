import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('..',import.meta.url));
const services=[['MCP',['--import','tsx','server/mcp.ts']],['Local AI',['--import','tsx','server/copilot.ts']],['Browser UI',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--strictPort']]];
let stopping=false;
const children=services.map(([name,args])=>{const child=spawn(process.execPath,args,{cwd,stdio:'inherit',windowsHide:true});child.on('error',()=>{console.error(`${name} could not start. Check Node 22+ and npm ci.`);stop(1);});child.on('exit',code=>{if(!stopping&&code)stop(code);});return child;});
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();setTimeout(()=>process.exit(code),400).unref();}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
console.log('FixPilot real AI copilot: http://127.0.0.1:5173/?ai');
console.log('Ollama prerequisite: ollama pull qwen2.5:7b (one-time download). Keep Ollama running.');
console.log('Connect the local model in the UI. MCP is optional; connect it to inspect real HTTP tool calls. Stop this launcher with Ctrl+C.');
