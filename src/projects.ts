import {createInitialState,getAssembly,restoreState,serializeState,type AssemblyState} from './engine';

const ACTIVE='fixpilot-x:active-assembly';
export const projectKey=(id:string)=>id==='table'?'fixpilot-x:assembly:v1':`fixpilot-x:assembly:v1:${id}`;
export function loadProject(id:string,storage:Storage=localStorage):AssemblyState {
  const definition=getAssembly(id);
  const saved=storage.getItem(projectKey(definition.id));
  const state=saved?restoreState(saved):createInitialState(definition.id);
  if(getAssembly(state).id!==definition.id)throw new Error('El progreso pertenece a otro montaje. No se sobrescribió.');
  return state;
}
export function loadActiveProject(storage:Storage=localStorage){
  const id=storage.getItem(ACTIVE)||'table';
  return loadProject(id,storage);
}
export function saveProject(state:AssemblyState,storage:Storage=localStorage){storage.setItem(projectKey(getAssembly(state).id),serializeState(state));}
export function selectProject(id:string,storage:Storage=localStorage){const state=loadProject(id,storage);storage.setItem(ACTIVE,getAssembly(state).id);return state;}
