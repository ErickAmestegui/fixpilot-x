import express from 'express';
import cors from 'cors';
import {pathToFileURL} from 'node:url';
import {z} from 'zod';
import {formatFor} from '../src/copilot.js';
const MODEL='qwen3:4b-instruct';
const local=(origin:string)=>{try{const u=new URL(origin);return ['http:','https:'].includes(u.protocol)&&['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&u.origin===origin;}catch{return false;}};
const bodySchema=z.object({stage:z.enum(['plan','answer']),assemblyId:z.enum(['table','organizer']).default('table'),messages:z.array(z.object({role:z.enum(['system','user','assistant']),content:z.string().max(40000)}).strict()).min(1).max(8)}).strict();
/** A fixed loopback-only Ollama adapter. No keys, arbitrary upstreams, tools or mutation endpoints. */
export function createCopilotApp(upstream:typeof fetch=fetch){
 const app=express();let active=false;app.disable('x-powered-by');
 app.use((req,res,next)=>{if(!['localhost','127.0.0.1','[::1]'].includes(req.hostname)||(req.headers.origin&&!local(req.headers.origin))){res.status(403).json({error:'LOCAL_ORIGIN_REQUIRED'});return;}next();});
 app.use(cors({origin:(origin,cb)=>cb(null,!origin||local(origin)),methods:['GET','POST','OPTIONS'],allowedHeaders:['Content-Type','X-FixPilot-Copilot']}));app.use(express.json({limit:'96kb'}));
 app.get('/health',async(_req,res)=>{try{const r=await upstream('http://127.0.0.1:11434/api/tags',{signal:AbortSignal.timeout(3000)});const data=await r.json();res.json({provider:'Ollama',model:MODEL,available:r.ok&&data.models?.some((m:{name:string})=>m.name===MODEL)===true,localOnly:true,cloud:false});}catch{res.json({provider:'Ollama',model:MODEL,available:false,localOnly:true,cloud:false});}});
 app.post('/chat',async(req,res)=>{if(req.headers['x-fixpilot-copilot']!=='1'){res.status(403).json({error:'CLIENT_HEADER_REQUIRED'});return;}const parsed=bodySchema.safeParse(req.body);if(!parsed.success){res.status(400).json({error:'INVALID_REQUEST'});return;}if(active){res.status(429).json({error:'MODEL_BUSY'});return;}active=true;const abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),180000);res.once('close',()=>{if(!res.writableEnded)abort.abort();});
  try{const started=Date.now(),r=await upstream('http://127.0.0.1:11434/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:abort.signal,body:JSON.stringify({model:MODEL,messages:parsed.data.messages,format:formatFor(parsed.data.stage,parsed.data.assemblyId),think:false,stream:false,keep_alive:'5m',options:{temperature:0.2,top_p:0.8,top_k:20,min_p:0,num_ctx:8192,num_predict:700}})});if(!r.ok){res.status(503).json({error:'MODEL_UNAVAILABLE'});return;}const data=await r.json();if(!data.done||typeof data.message?.content!=='string'||data.message.content.length>16000){res.status(502).json({error:'INVALID_MODEL_RESPONSE'});return;}res.json({content:data.message.content,model:data.model,provider:'Ollama',durationMs:Date.now()-started,tokens:data.eval_count});}catch{if(!res.destroyed)res.status(503).json({error:'MODEL_UNAVAILABLE'});}finally{clearTimeout(timeout);active=false;}
 });app.use((_err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(400).json({error:'INVALID_REQUEST'}));return app;
}
export async function startCopilotServer(port=3103,upstream:typeof fetch=fetch){const app=createCopilotApp(upstream);const server=await new Promise<ReturnType<typeof app.listen>>(resolve=>{const server=app.listen(port,'127.0.0.1',()=>resolve(server));});const address=server.address();return {url:`http://127.0.0.1:${typeof address==='object'&&address?address.port:port}`,close:async()=>{server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}};}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){startCopilotServer().then(s=>console.log(`FixPilot local AI adapter: ${s.url}; model ${MODEL}; no cloud provider`)).catch(()=>{process.exitCode=1;});}
