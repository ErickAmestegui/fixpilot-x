import {describe,it,expect} from 'vitest';
import {createInitialState,execute,serializeState} from '../src/engine';
import {projectKey,loadProject,loadActiveProject,saveProject,selectProject} from '../src/projects';
import {traceAction} from '../src/PlanInspector';
function storage():Storage{const values=new Map<string,string>();return {get length(){return values.size;},clear:()=>values.clear(),key:index=>[...values.keys()][index]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>{values.set(key,String(value));},removeItem:key=>{values.delete(key);}};}
describe('independent project persistence',()=>{
  it('keeps legacy table progress and organizer state in independent slots',()=>{
    const disk=storage();let table=createInitialState();table=execute(table,'complete_step',{stepId:1,confirmed:true}).state;saveProject(table,disk);
    let organizer=selectProject('organizer',disk);organizer=execute(organizer,'mark_part_missing',{partId:'O5'}).state;saveProject(organizer,disk);
    expect(loadActiveProject(disk).missing).toEqual(['O5']);
    expect(selectProject('table',disk).completed).toEqual([1]);
    expect(loadProject('table',disk).missing).toEqual([]);
    expect(loadProject('organizer',disk).completed).toEqual([]);
  });
  it('reads a V1 snapshot without assemblyId',()=>{const disk=storage(),state=createInitialState();delete state.assemblyId;disk.setItem(projectKey('table'),serializeState(state));expect(loadActiveProject(disk).completed).toEqual([]);});
  it('rejects cross-project saved contents and retains both copies',()=>{const disk=storage(),snapshot=serializeState(createInitialState('table'));disk.setItem(projectKey('organizer'),snapshot);expect(()=>selectProject('organizer',disk)).toThrow('otro montaje');expect(disk.getItem(projectKey('organizer'))).toBe(snapshot);expect(disk.getItem('fixpilot-x:active-assembly')).toBeNull();});
  it('propagates storage failure instead of falsely confirming a save',()=>{const disk=storage();disk.setItem=()=>{throw new Error('Quota');};expect(()=>saveProject(createInitialState(),disk)).toThrow('Quota');});
});
describe('real operation inspector',()=>{
  it('derives changed blockers and valid alternatives from the engine results',()=>{
    let before=createInitialState();for(const stepId of [1,2])before=execute(before,'complete_step',{stepId,confirmed:true}).state;
    const result=execute(before,'mark_part_missing',{partId:'B7'}),trace=traceAction(before,result.state,'Me falta B7','mark_part_missing',{partId:'B7'},result.message,result.kind);
    expect(trace.blocked).toEqual([4,5,7,8]);expect(trace.available).toEqual([3,6]);expect(trace.changed.map(s=>s.step)).toEqual([4,5,7,8]);expect(trace.before.missing).toEqual([]);expect(trace.after.missing).toEqual(['B7']);expect(trace.before.revision+1).toBe(trace.after.revision);
  });
  it('shows rejected operations without fabricated changes',()=>{const before=createInitialState(),result=execute(before,'complete_step',{stepId:8,confirmed:true}),trace=traceAction(before,result.state,'Terminé el paso 8','complete_step',{stepId:8},result.message,result.kind);expect(trace.result).toBe('warning');expect(trace.changed).toEqual([]);expect(trace.after.completed).toEqual([]);});
});
