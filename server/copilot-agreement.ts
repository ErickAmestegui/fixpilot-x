import {z} from 'zod';
import {createInitialState,getAssembly} from '../src/engine.js';
import {mentionedResources} from '../src/copilot.js';
import type {ScenarioChanges} from '../src/rescue.js';

export type ControllerProposal={name:string;arguments:Record<string,unknown>};
/** Canonical query meaning, not a second dependency planner or a permission decision. */
export function proposalSignature(proposal:ControllerProposal,projectId:string,question:string,currentHypothesis:ScenarioChanges|null){
 const assembly=getAssembly(projectId),state=createInitialState(projectId),raw={...proposal.arguments};delete raw.language;delete raw.replyIntent;
 const partId=z.enum(assembly.parts.map(p=>p.id) as [string,...string[]]),resourceId=z.enum([...assembly.parts,...assembly.tools].map(r=>r.id) as [string,...string[]]);
 const stepId=z.number().int().refine(id=>assembly.steps.some(s=>s.id===id),'Unknown step');
 const stable=(value:unknown):string=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
 switch(proposal.name){
  case 'update_hypothetical_inventory':{
   let args:unknown=raw;if(raw.reports===undefined&&Object.keys(raw).every(k=>['resourceId','condition'].includes(k)))args={reports:[raw]};
   const {reports}=z.object({reports:z.array(z.object({resourceId,condition:z.enum(['missing','recovered'])}).strict()).min(1).max(10)}).strict().parse(args);
   const edits:ScenarioChanges={};for(const r of reports){const part=assembly.parts.some(p=>p.id===r.resourceId),key=part?(r.condition==='missing'?'missingParts':'recoveredParts'):(r.condition==='missing'?'unavailableTools':'recoveredTools');(edits[key]??=[]).push(r.resourceId);}
   // Same resource-flag composition as the controller; no steps are evaluated here.
   const result:ScenarioChanges=structuredClone(currentHypothesis??{});
   for(const [key,value] of Object.entries(edits))result[key as keyof ScenarioChanges]=[...new Set([...(result[key as keyof ScenarioChanges]??[]),...value])] as never;
   for(const [missing,recovered] of [['missingParts','recoveredParts'],['unavailableTools','recoveredTools']] as const){if(edits[missing]?.length)result[recovered]=(result[recovered]??[]).filter(id=>!edits[missing]!.includes(id));if(edits[recovered]?.length)result[missing]=(result[missing]??[]).filter(id=>!edits[recovered]!.includes(id));}
   for(const key of Object.keys(result) as (keyof ScenarioChanges)[]){if(!result[key]?.length)delete result[key];else result[key]=[...result[key]!].sort() as never;}
   return stable({name:proposal.name,result});
  }
  case 'compare_inventory_alternatives':{
   const {alternatives}=z.object({alternatives:z.array(z.object({source:z.string().min(1),condition:z.enum(['missing','recovered','unchanged','all_available'])}).strict()).min(2).max(4)}).strict().parse(raw),used:{from:number;to:number}[]=[];
   const groups=alternatives.map(({source,condition})=>{const from=question.indexOf(source),to=from+source.length;if(from<0||used.some(r=>from<r.to&&to>r.from))throw Error('INVALID_ALTERNATIVE_EVIDENCE');used.push({from,to});const ids=[...mentionedResources(source,state)].sort();if(['missing','recovered'].includes(condition)&&!ids.length)throw Error('UNIDENTIFIED_ALTERNATIVE');return {condition,ids};});
   return stable({name:proposal.name,groups:groups.map(g=>stable(g)).sort()});
  }
  case 'get_step_requirements':{
   const args=z.object({stepId:stepId.nullable().optional(),scope:z.enum(['hypothesis','actual']).optional()}).strict().parse(raw);
   return stable({name:proposal.name,stepId:args.stepId??null,scope:currentHypothesis?(args.scope??'hypothesis'):'actual'});
  }
  case 'get_project_catalog':{
   const args=z.object({partId:partId.nullable().optional(),stepId:stepId.nullable().optional()}).strict().parse(raw);
   const literalParts=[...mentionedResources(question,state)].filter(id=>assembly.parts.some(p=>p.id===id));const target=args.partId??(literalParts.length===1?literalParts[0]:null);
   const uses=target?assembly.steps.filter(s=>s.parts.includes(target)):[];
   return stable({name:proposal.name,partId:target,stepId:args.stepId??(uses.length===1?uses[0].id:null)});
  }
  case 'prepare_step_review':{const args=z.object({stepId,reviewAction:z.enum(['complete','undo'])}).strict().parse(raw);return stable({name:proposal.name,...args});}
  case 'answer_conversation':case 'ask_user_to_clarify':case 'decline_unsafe_request':case 'cancel_last_hypothesis':case 'clear_all_hypotheses':z.object({}).strict().parse(raw);return proposal.name;
  default:throw Error('UNKNOWN_CONTROLLER_OPERATION');
 }
}

export function agreedProposalIndex(proposals:ControllerProposal[],projectId:string,question:string,currentHypothesis:ScenarioChanges|null){
 const signatures=proposals.map(p=>{try{return proposalSignature(p,projectId,question,currentHypothesis);}catch{return null;}});
 const index=signatures.findIndex((signature,i)=>signature!==null&&signatures.some((other,j)=>j!==i&&other===signature));
 return {index:index<0?null:index,signatures};
}
