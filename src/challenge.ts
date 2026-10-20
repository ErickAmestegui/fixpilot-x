import {createInitialState, getAssembly, plan, validateState, type AssemblyState, type ToolResult} from './engine';
import {executeTool} from './rescue-tools';
import {normalizeScenarioChanges, scenarioBaseToken, type ScenarioChanges, type ScenarioPreview} from './rescue';

export interface ChallengeSeed {assemblyId:string; completed:number[]; missingParts:string[]; missingTools:string[]}
export interface ChallengeReceipt {id:number; tool:string; args:Record<string,unknown>; transport:string; ms:number; kind:string; before:string; after:string; data?:unknown; error?:string}
export type ChallengePort={label:string; call:(tool:string,args:Record<string,unknown>)=>Promise<ToolResult>; close?:()=>Promise<void>};
/** An explicitly simulated starting record. Never reads or writes saved user projects. */
export function seedChallenge(seed:ChallengeSeed):AssemblyState {
 let state=createInitialState(seed.assemblyId);const a=getAssembly(state);
 if(new Set(seed.completed).size!==seed.completed.length||seed.completed.some(id=>!a.steps.some(s=>s.id===id)))throw Error('Unknown or duplicate starting step.');
 for(const id of [...seed.completed].sort((x,y)=>x-y)){
  if(plan(state).find(s=>s.id===id)?.status!=='available')throw Error(`Starting step ${id} needs its prerequisites. Select them too.`);
  state=executeTool(state,'complete_step',{stepId:id,confirmed:true}).state;
 }
 const changes=normalizeScenarioChanges(state,{missingParts:seed.missingParts,unavailableTools:seed.missingTools});
 if((changes.missingParts?.length??0)+(changes.unavailableTools?.length??0)>0){
  // Explicitly simulated fixture: reuse Rescue's atomic invalidation, never bypass it.
  const p=executeTool(state,'preview_scenario',{changes}).data as ScenarioPreview;
  const r=executeTool(state,'apply_scenario',{changes,baseToken:p.baseToken,confirmed:true});
  if(r.kind==='warning')throw Error(r.message);state=r.state;
 }
 if(!validateState(state))throw Error('Invalid starting record.');return state;
}
export function readSeed(value:unknown):ChallengeSeed {
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Expected a challenge object.');
 const v=value as Record<string,unknown>;if(Object.keys(v).some(k=>!['assemblyId','completed','missingParts','missingTools'].includes(k)))throw Error('Unknown challenge field.');
 if(typeof v.assemblyId!=='string'||!Array.isArray(v.completed)||!Array.isArray(v.missingParts)||!Array.isArray(v.missingTools))throw Error('Provide assemblyId, completed, missingParts and missingTools arrays.');
 const seed=v as unknown as ChallengeSeed;seedChallenge(seed);return seed;
}
export function createBrowserChallenge():ChallengePort {
 let state=createInitialState();return {label:'Browser engine · no MCP transport',call:async(name,args)=>{const r=executeTool(state,name,args);state=r.state;return r;}};
}
/** UI session, same port for browser dispatcher, MCP HTTP and the official MCP App bridge. */
export class ChallengeSession {
 state=createInitialState();receipts:ChallengeReceipt[]=[];private active=false;
 constructor(readonly port:ChallengePort){}
 async call(tool:string,args:Record<string,unknown>={}):Promise<ToolResult>{
  if(this.active)throw Error('An operation is already running.');this.active=true;
  const before=scenarioBaseToken(this.state),start=performance.now();
  try{
   const r=await this.port.call(tool,args);if(!validateState(r.state))throw Error('Invalid tool state.');
   const after=scenarioBaseToken(r.state);
   if(['preview_scenario','compare_scenarios','explain_recovery'].includes(tool)){
    if(after!==before)throw Error('A read changed the challenge record.');
    const expected=executeTool(this.state,tool,args);
    if(JSON.stringify(expected.data)!==JSON.stringify(r.data))throw Error('Tool data does not match the original dependency engine.');
   }
   if(r.kind==='warning')throw Error((r.data as {errorCode?:string})?.errorCode??r.message);
   this.state=r.state;this.receipts.push({id:this.receipts.length+1,tool,args:structuredClone(args),transport:this.port.label,ms:Math.round(performance.now()-start),kind:r.kind,before,after,data:r.data});return r;
  }catch(error){this.receipts.push({id:this.receipts.length+1,tool,args:structuredClone(args),transport:this.port.label,ms:Math.round(performance.now()-start),kind:'error',before,after:scenarioBaseToken(this.state),error:error instanceof Error?error.message:'Request failed'});throw error;}
  finally{this.active=false;}
 }
 async start(seed:ChallengeSeed){const state=seedChallenge(seed);if(getAssembly(this.state).id!==seed.assemblyId)await this.call('load_assembly',{assemblyId:seed.assemblyId});return this.call('restore_progress',{serialized:JSON.stringify(state)});}
 async preview(changes:ScenarioChanges){return (await this.call('preview_scenario',{changes})).data as ScenarioPreview;}
}
