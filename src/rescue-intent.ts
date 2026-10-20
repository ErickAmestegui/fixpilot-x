import {getAssembly,type AssemblyState} from './engine';
import type {Intent} from './intent';
import type {ScenarioChanges} from './rescue';

export type RescueIntent = Intent | {approval:true};
export type RescueContext = {changes?:ScenarioChanges;partId?:string;stepId?:number};
/** Bounded grammar. Questions never produce an apply call or a confirmed action. */
export function parseRescueIntent(text:string,state:AssemblyState,context:RescueContext={},language:'en'|'es'='en'):RescueIntent|null{
  if(typeof text!=='string'||text.length>1000)return null;
  const input=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’]/g,"'").toLowerCase().replace(/^[¿¡]+|[?!.]+$/g,'').trim().replace(/\s+/g,' ');
  const clarify=():RescueIntent=>({message:language==='es'?'No cambié el montaje. Usá una condición clara, por ejemplo «¿Qué pasaría si me faltaran B7 y el destornillador?», o los controles de escenarios.':'The actual assembly is unchanged. Use a clear condition, such as “What if I am missing B7 and my screwdriver?”, or use the scenario controls.'});
  const action=(tool:string,args:Record<string,unknown>):RescueIntent=>({tool,args});
  if(/^(apply (this |the )?scenario|aplica(?:r)? (este |el )?escenario)$/.test(input))return /[¿?]/.test(text)?clarify():{approval:true};
  if(/^(what (?:steps (?:would |will )?still (?:be|remain) available|can i still do)|que pasos seguirian disponibles|que puedo hacer todavia)$/.test(input))return action('preview_scenario',{changes:context.changes??{}});
  const why=input.match(/^(?:why is (?:step )?(\d+) (?:blocked|unavailable)|por que (?:esta bloqueado|no puedo completar) (?:el )?paso (\d+))$/);
  if(why)return action('explain_recovery',{stepId:Number(why[1]||why[2]),...(context.changes?{changes:context.changes}:{})});
  if(/^(why (?:is the top blocked|can't i complete the top|can i not complete the top)|por que no puedo completar (?:la cubierta|el panel superior))$/.test(input))return action('explain_recovery',{stepId:getAssembly(state).id==='table'?5:3,...(context.changes?{changes:context.changes}:{})});
  if(/^(explain recovery|explain this blockage|explica la recuperacion|explica este bloqueo)$/.test(input))return action('explain_recovery',{stepId:context.stepId??state.selectedStep,...(context.changes?{changes:context.changes}:{})});
  if(/^(what should i recover first|que recupero primero)$/.test(input))return action('explain_recovery',context.changes?{changes:context.changes}:{});
  const definition=getAssembly(state);
  const parseCondition=(raw:string,prior:ScenarioChanges={}):ScenarioChanges|null=>{
    let clause=raw.trim().replace(/^(.+?) (?:is|are|were) missing$/,'missing $1');let recovering=false;
    const recover=/^(?:(?:i |we )?(?:recover|recovered|found)|recupero|recuperara|recuperar|recuperase|recupere|encontre)(?: only| solo| solamente)?\s+/;
    const missing=/^(?:(?:i(?: am|'m)? |we are )?missing|i (?:am missing|don't have|do not have)|(?:me )?(?:faltan|falta|faltaran|faltara|faltasen)|no tengo)\s+/;
    if(recover.test(clause)){recovering=true;clause=clause.replace(recover,'');}
    else if(missing.test(clause))clause=clause.replace(missing,'');
    else return null;
    clause=clause.replace(/\b(?:that part|this part|esa pieza|esta pieza)\b/g,(context.partId??state.selectedPart??'unknown').toLowerCase());
    const resources=[...clause.matchAll(/\b(?:llave allen|allen key|hex key|screwdriver|destornillador|allen|hex|[a-z]\d+)\b/g)].map(m=>m[0]);
    const remainder=clause.replace(/\b(?:llave allen|allen key|hex key|screwdriver|destornillador|allen|hex|[a-z]\d+)\b/g,'').replace(/\b(?:la|el|las|los|mi|mis|my|the|part|parts|pieza|piezas|and|y|only|solo|solamente)\b/g,'').replace(/[,\s]/g,'');
    if(!resources.length||remainder)return null;
    const changes:ScenarioChanges=Object.fromEntries(Object.entries(prior).map(([key,value])=>[key,[...value]]));
    const seen=new Set<string>();
    for(const resource of resources){
      const tool=/allen|hex/.test(resource)?'hex':/screwdriver|destornillador/.test(resource)?'screwdriver':null;
      const id=tool??resource.toUpperCase();
      if(seen.has(id)||(!tool&&!definition.parts.some(part=>part.id===id)))return null;seen.add(id);
      const key=tool?(recovering?'recoveredTools':'unavailableTools'):(recovering?'recoveredParts':'missingParts');
      const opposite=tool?(recovering?'unavailableTools':'recoveredTools'):(recovering?'missingParts':'recoveredParts');
      changes[opposite]=(changes[opposite]??[]).filter(item=>item!==id);
      changes[key]=[...new Set([...(changes[key]??[]),id])];
    }
    return changes;
  };
  const comparison=input.match(/^(?:compare|compara) (.+?) (?:versus|vs\.?|with|con) (.+)$/);
  if(comparison){if(/[;\n]/.test(text))return clarify();const a=parseCondition(comparison[1]),b=parseCondition(comparison[2]);return a&&b?action('compare_scenarios',{scenarios:[{id:'A',changes:a},{id:'B',changes:b}]}):clarify();}
  if(/^(compare (?:scenarios|alternatives)|compara (?:escenarios|alternativas))$/.test(input))return action('compare_scenarios',{scenarios:[{id:'A',changes:{missingParts:[definition.problemPartId]}},{id:'B',changes:{missingParts:[definition.problemPartId],unavailableTools:['screwdriver']}},{id:'C',changes:{recoveredParts:[definition.problemPartId],unavailableTools:['screwdriver']}}]});
  const hypothetical=input.match(/^(?:what if|what changes if|show me what changes if|que pasaria si|y si|que cambia si|mostrame que cambia si|muestrame que cambia si)\s+(.+)$/);
  if(hypothetical){if(/[;\n]/.test(text))return clarify();const changes=parseCondition(hypothetical[1],context.changes);return changes?action('preview_scenario',{changes}):clarify();}
  return null;
}
