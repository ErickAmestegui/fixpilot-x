import {plan,getAssembly,type AssemblyState} from './engine';

export interface ActionTrace {
  at:string; request:string; intent:string; tool:string; args:Record<string,unknown>;
  before:{assembly:string;revision:number;completed:number[];missing:string[];missingTools:string[]};
  after:ActionTrace['before'];
  changed:{step:number;before:string;after:string;dependencies:number[]}[];
  available:number[];blocked:number[];message:string;result:string;
}
export function traceAction(before:AssemblyState,after:AssemblyState,request:string,tool:string,args:Record<string,unknown>,message:string,result:string):ActionTrace {
  const summarize=(s:AssemblyState)=>({assembly:getAssembly(s).id,revision:s.revision,completed:[...s.completed],missing:[...s.missing],missingTools:[...s.missingTools]});
  const previous=plan(before),next=plan(after);
  return {at:new Date().toISOString(),request,intent:tool,tool,args,before:summarize(before),after:summarize(after),changed:next.filter(step=>previous.find(p=>p.id===step.id)?.status!==step.status).map(step=>({step:step.id,before:previous.find(p=>p.id===step.id)?.status||'—',after:step.status,dependencies:step.dependencies})),available:next.filter(s=>s.status==='available').map(s=>s.id),blocked:next.filter(s=>s.status==='blocked').map(s=>s.id),message,result};
}
export default function PlanInspector({traces}:{traces:ActionTrace[]}){
  return <div className="plan-inspector"><p className="modal-lead">Solicitud → herramienta → grafo → resultado. Datos de las operaciones de esta sesión, sin respuestas prefabricadas.</p>{!traces.length?<p>Ejecutá una instrucción para inspeccionar su efecto real.</p>:[...traces].reverse().map((trace,index)=><details className="trace-card" key={`${trace.at}-${index}`} open={index===0}><summary><span className={`trace-result ${trace.result}`}>{trace.result==='error'?'Error':trace.result==='warning'?'Revisar':'Resultado'}</span><strong>{trace.request}</strong><small>{trace.tool}</small></summary><dl><dt>Intención / herramienta</dt><dd><code>{trace.intent}</code><pre>{JSON.stringify(trace.args,null,2)}</pre></dd><dt>Pasos afectados</dt><dd>{trace.changed.length?<ul>{trace.changed.map(s=><li key={s.step}>Paso {s.step}: {s.before} → <b>{s.after}</b> <small>(requiere {s.dependencies.join(', ')||'ninguno'})</small></li>)}</ul>:'Sin cambios de estado en los pasos.'}</dd><dt>Alternativas disponibles</dt><dd>{trace.available.join(', ')||'Ninguna'}</dd><dt>Operaciones bloqueadas</dt><dd>{trace.blocked.join(', ')||'Ninguna'}</dd><dt>Resultado</dt><dd>{trace.message}</dd></dl><div className="trace-state"><div><h4>Antes · r{trace.before.revision}</h4><pre>{JSON.stringify(trace.before,null,2)}</pre></div><div><h4>Después · r{trace.after.revision}</h4><pre>{JSON.stringify(trace.after,null,2)}</pre></div></div></details>)}</div>;
}
