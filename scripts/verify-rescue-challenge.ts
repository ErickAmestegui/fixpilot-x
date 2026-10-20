import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {mkdir,writeFile} from 'node:fs/promises';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {startMcpServer} from '../server/mcp';
import {ASSEMBLIES,validateState,type ToolResult} from '../src/engine';
import {seedChallenge} from '../src/challenge';
import {scenarioBaseToken,type ScenarioPreview} from '../src/rescue';
import {RESCUE_APP_URI,RESCUE_APP_TOOLS} from '../src/mcp-app-shared';
const digest=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const subsets=(ids:string[])=>Array.from({length:2**ids.length},(_,mask)=>ids.filter((_,i)=>mask&(1<<i)));
const service=await startMcpServer(0),client=new Client({name:'fixpilot-blind-matrix',version:'1.0.0'}),transport=new StreamableHTTPClientTransport(new URL(service.url));
const rows:unknown[]=[],began=Date.now();let failure:string|undefined,toolCount=0,resourceBytes=0;
async function call(name:string,args:Record<string,unknown>={}){const raw=await client.callTool({name,arguments:args});assert(!raw.isError);return raw.structuredContent as unknown as ToolResult;}
try{
 await client.connect(transport);const tools=(await client.listTools()).tools;toolCount=tools.length;assert.equal(toolCount,22);
 for(const name of RESCUE_APP_TOOLS)assert.equal((tools.find(t=>t.name===name)?._meta?.ui as any)?.resourceUri,RESCUE_APP_URI);
 const content=(await client.readResource({uri:RESCUE_APP_URI})).contents[0];assert.equal(content.mimeType,'text/html;profile=mcp-app');assert('text'in content);resourceBytes=Buffer.byteLength(content.text);assert(!/<script[^>]+\ssrc=/.test(content.text));
 for(const a of ASSEMBLIES){
  await call('load_assembly',{assemblyId:a.id});
  for(const completed of [[],[1,2],a.steps.map(s=>s.id)]){
   const fixture=seedChallenge({assemblyId:a.id,completed,missingParts:[],missingTools:[]});await call('restore_progress',{serialized:JSON.stringify(fixture)});
   const actual=(await call('get_assembly_state')).state,before=scenarioBaseToken(actual);
   for(const missingParts of subsets(a.parts.map(p=>p.id)))for(const unavailableTools of subsets(a.tools.map(t=>t.id))){
    const changes={missingParts,unavailableTools},start=performance.now(),r=await call('preview_scenario',{changes}),p=r.data as ScenarioPreview;
    assert.equal(scenarioBaseToken(r.state),before);assert.equal(p.baseToken,before);assert(validateState(p.hypothetical));
    assert.deepEqual(p.hypothetical.missing,missingParts.slice().sort());assert.deepEqual(p.hypothetical.missingTools,unavailableTools.slice().sort());
    assert(!p.available.some(id=>p.blocked.includes(id)));
    for(const id of p.hypothetical.completed){const step=a.steps.find(s=>s.id===id)!;assert(!step.parts.some(id=>missingParts.includes(id)));assert(step.dependencies.every(dep=>p.hypothetical.completed.includes(dep)));}
    if(!missingParts.length)assert.deepEqual(p.hypothetical.completed,actual.completed,'Tool loss must retain prior completed work');
    rows.push({assemblyId:a.id,prior:completed,tool:'preview_scenario',changes,ms:Math.round(performance.now()-start),available:p.available,blocked:p.blocked,invalidatedCompleted:p.invalidatedCompleted,stateUnchanged:true,resultSha256:digest(p)});
   }
   // The legacy getter records an audit read. Rescue preview is deliberately audit-pure.
   assert.equal(scenarioBaseToken((await call('preview_scenario',{changes:{}})).state),before);console.log(JSON.stringify({assembly:a.id,prior:completed,verified:rows.length}));
  }
 }
}catch(e){failure=e instanceof Error?e.message:String(e);process.exitCode=1;}
finally{
 const data={at:new Date().toISOString(),mocked:false,protocol:transport.protocolVersion,toolCount,resource:{uri:RESCUE_APP_URI,mimeType:'text/html;profile=mcp-app',bytes:resourceBytes},result:failure?'FAIL':'PASS',failure,total:rows.length,durationMs:Date.now()-began,scope:'All part/tool-shortage subsets for both original assemblies at three explicitly simulated prior-progress profiles. Not every possible progress sequence, no LLM and no physical verification.',rows};
 const raw=JSON.stringify(data,null,2);await mkdir('docs/challenge-evidence',{recursive:true});await writeFile('docs/challenge-evidence/matrix.json',raw);await writeFile('docs/challenge-evidence/matrix.json.gz',gzipSync(raw));await writeFile('docs/challenge-evidence/matrix-summary.json',JSON.stringify({...data,rows:undefined,rawArchive:'matrix.json.gz',rawSha256:createHash('sha256').update(raw).digest('hex')},null,2));console.log(JSON.stringify({...data,rows:undefined}));
 await transport.terminateSession().catch(()=>{});await client.close();await service.close();
}
