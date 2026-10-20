import { getAssembly, plan, validateState, type AssemblyState, type PlanEntry } from './engine';

export interface ScenarioChanges {
  missingParts?: string[]; recoveredParts?: string[]; unavailableTools?: string[]; recoveredTools?: string[]; undoSteps?: number[];
}
export interface StepCause {
  stepId: number; missingParts: string[]; unavailableTools: string[]; prerequisites: number[]; chains: number[][];
}
export interface RecoveryPlan {
  stepId?: number;
  resources: { kind: 'part' | 'tool'; id: string; steps: number[] }[];
  prerequisiteSteps: number[]; availableSteps: number[]; blockedSteps: number[];
  requiresHumanVerification: true;
}
export interface ScenarioPreview {
  base: AssemblyState; changes: ScenarioChanges; hypothetical: AssemblyState; baseToken: string;
  directAffected: number[]; indirectAffected: number[]; available: number[]; blocked: number[];
  invalidatedCompleted: number[];
  diff: { stepId: number; before: PlanEntry['status']; after: PlanEntry['status'] }[];
  unchanged: number[];
  causes: StepCause[]; recovery: RecoveryPlan;
}
export interface ScenarioComparison {
  baseToken: string; scenarios: (ScenarioPreview & { id: string })[];
  pairs: { left: string; right: string; onlyLeftAvailable: number[]; onlyRightAvailable: number[]; onlyLeftBlocked: number[]; onlyRightBlocked: number[] }[];
}
export class RescueError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'RescueError'; }
}
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
function assertState(state: AssemblyState): void {
  if (!validateState(state)) throw new RescueError('INVALID_STATE', 'The saved assembly state is invalid. Restore a valid checkpoint.');
}
function clone(state: AssemblyState): AssemblyState {
  return { version: 1, ...(state.assemblyId === undefined ? {} : { assemblyId: state.assemblyId }),
    completed: [...state.completed], missing: [...state.missing], missingTools: [...state.missingTools],
    selectedPart: state.selectedPart, selectedStep: state.selectedStep, revision: state.revision,
    history: state.history.map(({ id, at, tool, message, kind, revision }) => ({ id, at, tool, message, kind, revision })) };
}
/** Canonical known-schema snapshot, not a hash. Array and history order are retained. */
export function scenarioBaseToken(state: AssemblyState): string {
  assertState(state);
  const value = clone(state);
  return JSON.stringify([value.version, value.assemblyId ?? null, value.completed, value.missing, value.missingTools,
    value.selectedPart, value.selectedStep, value.revision,
    value.history.map(entry => [entry.id, entry.at, entry.tool, entry.message, entry.kind, entry.revision])]);
}
export function normalizeScenarioChanges(state: AssemblyState, value: unknown): ScenarioChanges {
  assertState(state);
  if (!object(value)) throw new RescueError('INVALID_CHANGES', 'Provide a scenario changes object.');
  const keys = ['missingParts', 'recoveredParts', 'unavailableTools', 'recoveredTools', 'undoSteps'] as const;
  if (Object.keys(value).some(key => !keys.includes(key as typeof keys[number]))) throw new RescueError('INVALID_CHANGES', 'Unknown scenario change field.');
  const assembly = getAssembly(state);
  const normalized: ScenarioChanges = {};
  for (const key of keys) {
    if (value[key] === undefined) continue;
    const entries = value[key];
    const validIds: (string | number)[] = key === 'undoSteps' ? assembly.steps.map(step => step.id)
      : key === 'missingParts' || key === 'recoveredParts' ? assembly.parts.map(part => part.id) : assembly.tools.map(tool => tool.id);
    if (!Array.isArray(entries) || entries.length > validIds.length || entries.some(id => !validIds.includes(id)) || new Set(entries).size !== entries.length)
      throw new RescueError('INVALID_RESOURCE', 'Scenario IDs must be unique and belong to the current assembly.');
    if (key === 'undoSteps') normalized.undoSteps = [...entries as number[]].sort((a, b) => a - b);
    else normalized[key] = [...entries as string[]].sort();
  }
  if (normalized.missingParts?.some(id => normalized.recoveredParts?.includes(id)) || normalized.unavailableTools?.some(id => normalized.recoveredTools?.includes(id)))
    throw new RescueError('CONTRADICTORY_CHANGES', 'A resource cannot be missing and recovered in the same scenario.');
  return normalized;
}
function descendants(state: AssemblyState, roots: number[]): Set<number> {
  const result = new Set(roots);
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of getAssembly(state).steps) if (!result.has(step.id) && step.dependencies.some(id => result.has(id))) { result.add(step.id); changed = true; }
  }
  return result;
}
function causesFor(state: AssemblyState): StepCause[] {
  const entries = plan(state);
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const chains = (id: number): number[][] => {
    const entry = byId.get(id)!;
    if (entry.status === 'complete') return [];
    const paths: number[][] = [];
    if (entry.parts.some(part => state.missing.includes(part)) || entry.tools.some(tool => state.missingTools.includes(tool))) paths.push([id]);
    for (const dependency of entry.dependencies) if (byId.get(dependency)!.status !== 'complete') {
      for (const path of chains(dependency)) paths.push([id, ...path]);
    }
    // A leaf without a resource shortage is still a real prerequisite action, not a shortage.
    return paths.length ? paths : [[id]];
  };
  return entries.filter(entry => entry.status !== 'complete').map(entry => ({ stepId: entry.id,
    missingParts: entry.parts.filter(id => state.missing.includes(id)), unavailableTools: entry.tools.filter(id => state.missingTools.includes(id)),
    prerequisites: entry.dependencies.filter(id => byId.get(id)!.status !== 'complete'), chains: chains(entry.id) }));
}
export function explainRecovery(state: AssemblyState, stepId?: number): RecoveryPlan {
  assertState(state);
  const entries = plan(state);
  if (stepId !== undefined && !entries.some(entry => entry.id === stepId)) throw new RescueError('INVALID_STEP', 'Choose a step in the current assembly.');
  const relevant = new Set<number>();
  const visit = (id: number): void => {
    const step = entries.find(entry => entry.id === id)!;
    if (step.status === 'complete' || relevant.has(id)) return;
    relevant.add(id); step.dependencies.forEach(visit);
  };
  if (stepId === undefined) entries.forEach(entry => visit(entry.id)); else visit(stepId);
  const resources: RecoveryPlan['resources'] = [];
  for (const kind of ['part', 'tool'] as const) for (const id of kind === 'part' ? state.missing : state.missingTools) {
    const steps = entries.filter(entry => relevant.has(entry.id) && (kind === 'part' ? entry.parts : entry.tools).includes(id)).map(entry => entry.id);
    if (steps.length) resources.push({ kind, id, steps });
  }
  return { ...(stepId === undefined ? {} : { stepId }), resources,
    prerequisiteSteps: entries.filter(entry => relevant.has(entry.id) && entry.id !== stepId).map(entry => entry.id),
    availableSteps: entries.filter(entry => relevant.has(entry.id) && entry.status === 'available').map(entry => entry.id),
    blockedSteps: entries.filter(entry => relevant.has(entry.id) && entry.status === 'blocked').map(entry => entry.id), requiresHumanVerification: true };
}
export function previewScenario(state: AssemblyState, changes: ScenarioChanges): ScenarioPreview {
  const normalized = normalizeScenarioChanges(state, changes);
  const base = clone(state), hypothetical = clone(state), assembly = getAssembly(state);
  const updated = (current: string[], added: string[] = [], removed: string[] = []): string[] => [...new Set([...current.filter(id => !removed.includes(id)), ...added])].sort();
  hypothetical.missing = updated(base.missing, normalized.missingParts, normalized.recoveredParts);
  hypothetical.missingTools = updated(base.missingTools, normalized.unavailableTools, normalized.recoveredTools);
  // Installed-part loss invalidates digital confirmations; tool loss never undoes completed work.
  const invalidRoots = assembly.steps.filter(step => base.completed.includes(step.id) && step.parts.some(id => hypothetical.missing.includes(id))).map(step => step.id);
  const invalid = descendants(base, [...invalidRoots, ...normalized.undoSteps ?? []]);
  hypothetical.completed = base.completed.filter(id => !invalid.has(id));
  const invalidatedCompleted = base.completed.filter(id => invalid.has(id)).sort((a, b) => a - b);
  if (!validateState(hypothetical)) throw new RescueError('INVALID_RESULT', 'The scenario would produce an inconsistent assembly state.');
  const before = plan(base), after = plan(hypothetical);
  const parts = [...normalized.missingParts ?? [], ...normalized.recoveredParts ?? []];
  const tools = [...normalized.unavailableTools ?? [], ...normalized.recoveredTools ?? []];
  const directAffected = assembly.steps.filter(step => normalized.undoSteps?.includes(step.id) || step.parts.some(id => parts.includes(id)) || step.tools.some(id => tools.includes(id))).map(step => step.id);
  const allAffected = descendants(base, directAffected);
  return { base, changes: normalized, hypothetical, baseToken: scenarioBaseToken(base), directAffected,
    indirectAffected: assembly.steps.filter(step => allAffected.has(step.id) && !directAffected.includes(step.id)).map(step => step.id),
    available: after.filter(step => step.status === 'available').map(step => step.id), blocked: after.filter(step => step.status === 'blocked').map(step => step.id), invalidatedCompleted,
    diff: after.flatMap((step, index) => step.status === before[index].status ? [] : [{ stepId: step.id, before: before[index].status, after: step.status }]),
    unchanged: after.filter((step,index)=>step.status===before[index].status).map(step=>step.id),
    causes: causesFor(hypothetical), recovery: explainRecovery(hypothetical) };
}
export function compareScenarios(state: AssemblyState, scenarios: { id: string; changes: ScenarioChanges }[]): ScenarioComparison {
  assertState(state);
  if (!Array.isArray(scenarios) || scenarios.length < 1 || scenarios.length > 6 || scenarios.some(item => !object(item) || typeof item.id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(item.id) || Object.keys(item).some(key => key !== 'id' && key !== 'changes')) || new Set(scenarios.map(item => item.id)).size !== scenarios.length)
    throw new RescueError('INVALID_SCENARIOS', 'Provide one to six scenarios with unique IDs (letters, digits, underscore or hyphen; maximum 64 characters).');
  const previews = scenarios.map(item => ({ id: item.id, ...previewScenario(state, item.changes) }));
  const pairs: ScenarioComparison['pairs'] = [];
  for (let left = 0; left < previews.length; left++) for (let right = left + 1; right < previews.length; right++) {
    const a = previews[left], b = previews[right];
    pairs.push({ left: a.id, right: b.id, onlyLeftAvailable: a.available.filter(id => !b.available.includes(id)), onlyRightAvailable: b.available.filter(id => !a.available.includes(id)),
      onlyLeftBlocked: a.blocked.filter(id => !b.blocked.includes(id)), onlyRightBlocked: b.blocked.filter(id => !a.blocked.includes(id)) });
  }
  return { baseToken: scenarioBaseToken(state), scenarios: previews, pairs };
}
