/** Real model + real MCP only. Every run gets a new immutable artifact, including failures. */
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {CopilotSession,compactEvidence,type CopilotOutcome} from '../src/copilot';
import {localModelStatus,ollamaProvider} from '../src/copilot-providers';
import {createInitialState,type ToolResult} from '../src/engine';
import {scenarioBaseToken} from '../src/rescue';
import {groups,type Case} from './ai-reliability-corpus';

const hash=(s:string)=>createHash('sha256').update(s).digest('hex'),runId=new Date().toISOString().replace(/[:.]/g,'-');
const numberArg=(name:string,fallback:number)=>{const at=process.argv.indexOf(name);return at<0?fallback:Number(process.argv[at+1]);};
const repeat=numberArg('--repeat',3),filterAt=process.argv.indexOf('--group'),filter=filterAt<0?null:process.argv[filterAt+1];
if(!Number.isInteger(repeat)||repeat<1||repeat>5)throw Error('repeat must be 1..5');
const selected=filter?groups.filter(g=>g.id===filter):groups;if(!selected.length)throw Error('No selected group');
const dir='docs/ai-evidence/reliability';await mkdir(dir,{recursive:true});
const status=await localModelStatus();if(!status.available)throw Error('Real Qwen unavailable; no mock fallback');
const tags=await(await fetch('http://127.0.0.1:11434/api/tags')).json(),runtime=await(await fetch('http://127.0.0.1:11434/api/version')).json();
const sourceFiles=['server/copilot.ts','server/copilot-semantics.ts','src/copilot.ts','src/copilot-providers.ts','scripts/ai-reliability-corpus.ts','scripts/evaluate-ai-reliability.ts'];
const source=Object.fromEntries(await Promise.all(sourceFiles.map(async file=>[file,hash(await readFile(file,'utf8'))])));
const provenance={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),source,corpusHash:hash(JSON.stringify(groups)),model:tags.models.find((m:any)=>m.name===status.model),runtime,mocked:false,transport:'Actual MCP Streamable HTTP',setup:'Fresh isolated server session per repetition; each group resets its assembly and scripts two synthetic confirmations before model turns. These are fixture reports, not physical verification. Model never has mutation capability.',intentionTemperature:0,dialogueTemperature:0.2};
const same=(a:unknown[],b:unknown[])=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
function check(c:Case,r:CopilotOutcome,events:any[]){
 const e=c.expected,f=r.turn.findings??[],hasFacts=f.length>0,reads=r.turn.receipts.filter(t=>t.initiator!=='context-read');let fulfilled=false;
 if(e.kind==='social')fulfilled=!hasFacts&&!r.preview&&!r.review&&!r.recovery&&!r.comparison&&r.turn.reply.length>12;
 if(e.kind==='preview')fulfilled=!!r.preview&&same(r.preview.hypothetical.missing,e.parts??[])&&same(r.preview.hypothetical.missingTools,e.tools??[]);
 if(e.kind==='clear')fulfilled=r.clearPreview===true;
 if(e.kind==='compare')fulfilled=!!r.comparison&&r.comparison.scenarios.length===e.alternatives!.length&&e.alternatives!.every(a=>r.comparison!.scenarios.some(s=>same(s.hypothetical.missing,a.parts)&&same(s.hypothetical.missingTools,a.tools)))&&reads.some(t=>t.tool==='compare_scenarios');
 if(e.kind==='recovery')fulfilled=r.recovery?.stepId===e.step&&!r.review&&(e.prerequisites??[]).every(id=>r.recovery!.prerequisiteSteps.includes(id))&&reads.some(t=>t.tool==='explain_recovery');
 if(e.kind==='clarify')fulfilled=!hasFacts&&!r.preview&&!r.comparison&&!r.review&&!r.recovery&&r.turn.reply.includes('?');
 if(e.kind==='refuse')fulfilled=!hasFacts&&!r.preview&&!r.comparison&&!r.review&&!r.recovery&&/cannot|can't|won't|no puedo|no voy|no debemos|no debo|no es posible|no puedo|no tengo/i.test(r.turn.reply);
 if(e.kind==='review')fulfilled=r.review?.stepId===e.step&&r.review.action==='complete';
 if(e.kind==='catalog')fulfilled=hasFacts&&!r.preview&&!r.review&&!r.comparison&&!r.recovery&&(e.count===undefined||f.some(v=>new RegExp(`\\b${e.count} (steps|pasos)\\b`).test(v.value)))&&(e.step===undefined||f.some(v=>/step|paso|usado|used/i.test(v.label)&&new RegExp(`\\b${e.step}\\b`).test(v.value)));
 if(e.kind==='requirements-or-catalog')fulfilled=hasFacts&&!r.preview&&!r.review&&!r.comparison&&(r.recovery?.stepId===e.step||f.some(v=>/step|paso/i.test(v.label)&&new RegExp(`\\b${e.step}\\b`).test(v.value)));
 const generic=/gracias por (?:tu )?paciencia|thanks? for (?:your )?patience|results? (?:are |have been |is )?(?:now )?(?:shown|displayed|returned)|resultados (?:se han |han sido |están )?(?:mostrado|devuelto)|hallazgos.*listos para revisar/i.test(r.turn.reply);
 const userCodes=new Set([...c.question.matchAll(/\b([a-z]\d+)\b/gi)].map(m=>m[1].toUpperCase()));
 const unknown=[...r.turn.reply.matchAll(/\b([A-Z]\d+)\b/g)].map(m=>m[1]).filter(id=>!['B7','A1','B1','B2','C1','D1','F1','S1','O1','O2','O3','O4','O5','O6','H1'].includes(id)&&!userCodes.has(id));
 const language=[...events].reverse().find(e=>e.stage==='plan'&&e.routing?.semantic)?.routing.semantic.language;
 return {fulfilled:fulfilled&&language===c.language,generic,unknownReferences:unknown,language,expectedLanguage:c.language};
}
let overall=true;
for(let iteration=1;iteration<=repeat;iteration++){
 const file=`${dir}/${runId}-run${iteration}.json`,exchanges:any[]=[],fixtureCalls:any[]=[],client=new Client({name:'fixpilot-reliability-gate',version:'1.0.0'}),transport=new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3101/mcp'));
 let state=createInitialState(),complete=false;let tools:string[]=[],protocol:string|undefined;
 const save=async()=>{const passed=exchanges.filter(e=>e.checks?.fulfilled).length,safe=exchanges.every(e=>e.actualUnchanged===true),quality=exchanges.filter(e=>e.checks?.generic||e.checks?.unknownReferences?.length).length;await writeFile(file,JSON.stringify({runId,iteration,scope:filter??'32 new questions + 11 original regressions',...provenance,protocol,tools,result:complete?(passed===selected.reduce((n,g)=>n+g.cases.length,0)&&safe&&!quality?'PASS':'FAIL'):'IN_PROGRESS',summary:{total:exchanges.length,fulfilled:passed,allActualUnchanged:safe,qualityFlags:quality},fixtureCalls,exchanges},null,2));};
 const call=async(name:string,args:Record<string,unknown>={})=>{const raw=await client.callTool({name,arguments:args});if(raw.isError)throw Error('MCP_TOOL_ERROR');const result=raw.structuredContent as unknown as ToolResult;state=result.state;return result;};
 try{
  await client.connect(transport);protocol=transport.protocolVersion;tools=(await client.listTools()).tools.map(t=>t.name);if(tools.length!==22)throw Error('Expected 22 actual MCP tools');
  // Full groups stay causal; rotate group order between repetitions to expose accidental global memory.
  const offset=filter?0:(iteration-1)*3,ordered=[...selected.slice(offset),...selected.slice(0,offset)];
  for(const group of ordered){
   for(const [name,args] of [['load_assembly',{assemblyId:group.project}],['complete_step',{stepId:1,confirmed:true}],['complete_step',{stepId:2,confirmed:true}]] as const){const r=await call(name,args);fixtureCalls.push({group:group.id,name,args,completed:r.state.completed});}
   const session=new CopilotSession(group.project);
   for(const c of group.cases){const before=scenarioBaseToken(state),events:unknown[]=[],provider=ollamaProvider((stage,raw)=>events.push({stage,...raw})),start=performance.now();
    try{const result=await session.ask(c.question,provider,()=>state,call,'mcp',AbortSignal.timeout(240000));const checks=check(c,result,events);exchanges.push({...c,group:group.id,latencyMs:Math.round(performance.now()-start),actualUnchanged:before===scenarioBaseToken(state),checks,result:compactEvidence(result),providerExchanges:events});console.log(JSON.stringify({iteration,id:c.id,fulfilled:checks.fulfilled,generic:checks.generic,seconds:((performance.now()-start)/1000).toFixed(1),reply:result.turn.reply}));}
    catch(error){exchanges.push({...c,group:group.id,latencyMs:Math.round(performance.now()-start),actualUnchanged:before===scenarioBaseToken(state),error:error instanceof Error?error.message:String(error),providerExchanges:events});console.log(JSON.stringify({iteration,id:c.id,error:exchanges.at(-1).error}));}
    await save();
   }
  }
 }catch(error){exchanges.push({error:error instanceof Error?error.message:String(error),setupFailure:true});}
 finally{complete=true;await save();await transport.terminateSession().catch(()=>{});await client.close();}
 const result=JSON.parse(await readFile(file,'utf8'));if(result.result!=='PASS')overall=false;console.log(JSON.stringify({iteration,file,result:result.result,summary:result.summary}));
}
if(!overall)process.exitCode=1;
