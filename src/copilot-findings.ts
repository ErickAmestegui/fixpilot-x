import {getAssembly,plan,type AssemblyState} from './engine';
import {assemblyTitle,localizedStep,resourceName} from './rescue-i18n';
import type {ScenarioComparison,RecoveryPlan} from './rescue';
export type EngineFinding={label:string;value:string};
/** Presentation only: every value comes from the original validated engine/catalog. */
export function engineFindings(state:AssemblyState,working:AssemblyState,language:'en'|'es',input:{hypothetical:boolean;comparison?:ScenarioComparison;recovery?:RecoveryPlan;review?:{stepId:number;action:'complete'|'undo'};canceled:string[];catalog?:{partId?:string|null;stepId?:number|null}}):EngineFinding[]{
 const t=(en:string,es:string)=>language==='es'?es:en,a=getAssembly(state),out:EngineFinding[]=[],none=t('None','Ninguno');
 const nums=(ids:number[])=>ids.join(', ')||none,resources=(ids:string[])=>ids.map(id=>`${id} · ${resourceName(id,state,language)}`).join('; ')||none;
 const add=(label:string,value:string)=>out.push({label,value});
 if(input.catalog){
  add(t('Project','Proyecto'),`${assemblyTitle(a.id,language)} · ${a.steps.length} ${t('steps','pasos')}`);
  const part=input.catalog.partId;
  if(part){add(t('Resource','Recurso'),resources([part]));add(t('Used in steps','Usado en pasos'),nums(a.steps.filter(s=>s.parts.includes(part)).map(s=>s.id)));}
  const step=a.steps.find(s=>s.id===input.catalog!.stepId)??(part&&a.steps.filter(s=>s.parts.includes(part)).length===1?a.steps.find(s=>s.parts.includes(part)):undefined);
  if(step){add(t('Step','Paso'),`${step.id} · ${localizedStep(step,state,language).title}`);add(t('Required parts','Piezas necesarias'),resources(step.parts));add(t('Required tools','Herramientas necesarias'),resources(step.tools));add(t('Prerequisites','Requisitos previos'),nums(step.dependencies));}
  else if(!part){add(t('Catalog parts','Piezas del catálogo'),resources(a.parts.map(p=>p.id)));add(t('Catalog tools','Herramientas del catálogo'),resources(a.tools.map(p=>p.id)));}
 }else if(input.comparison){
  for(const scenario of input.comparison.scenarios){add(`${scenario.id} · ${t('missing parts','piezas ausentes')}`,resources(scenario.hypothetical.missing));add(`${scenario.id} · ${t('unavailable tools','herramientas ausentes')}`,resources(scenario.hypothetical.missingTools));add(`${scenario.id} · ${t('ready now','disponibles ahora')}`,nums(scenario.available));add(`${scenario.id} · ${t('blocked','bloqueados')}`,nums(scenario.blocked));}
 }else if(input.review){add(t('Review required','Revisión necesaria'),`${input.review.stepId} · ${localizedStep(a.steps.find(s=>s.id===input.review!.stepId)!,state,language).title}`);add(t('Recording','Registro'),t('Not changed. Separate human approval required.','Sin cambios. Requiere aprobación humana separada.'));
 }else{
  add(t('View','Vista'),input.hypothetical?t('Hypothetical only','Solo hipotética'):t('Actual record','Registro real'));
  if(input.canceled.length)add(t('Canceled hypothetical shortage','Escasez hipotética cancelada'),resources(input.canceled));
  add(t('Missing parts','Piezas ausentes'),resources(working.missing));add(t('Unavailable tools','Herramientas ausentes'),resources(working.missingTools));
  add(t('Ready now','Disponibles ahora'),nums(plan(working).filter(s=>s.status==='available').map(s=>s.id)));add(t('Blocked','Bloqueados'),nums(plan(working).filter(s=>s.status==='blocked').map(s=>s.id)));
 }
 if(input.recovery){add(t('Recovery requirements','Requisitos de recuperación'),input.recovery.resources.map(r=>`${resources([r.id])} (${t('steps','pasos')} ${nums(r.steps)})`).join('; ')||none);add(t('Prerequisite reports still needed','Confirmaciones previas necesarias'),nums(input.recovery.prerequisiteSteps));}
 add(t('Actual confirmed steps · unchanged','Pasos reales confirmados · sin cambios'),nums(state.completed));return out;
}
