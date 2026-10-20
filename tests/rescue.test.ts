import { describe, expect, it } from 'vitest';
import { ASSEMBLIES, createInitialState, execute, getAssembly, plan, validateState, type AssemblyState } from '../src/engine';
import { compareScenarios, explainRecovery, previewScenario, scenarioBaseToken, type ScenarioChanges } from '../src/rescue';
import { executeTool } from '../src/rescue-tools';

function frozen<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(frozen); Object.freeze(value); }
  return value;
}
const complete = (state: AssemblyState, ...ids: number[]) => ids.reduce((current, stepId) => execute(current, 'complete_step', { stepId, confirmed: true }).state, state);
const errorCode = (state: AssemblyState, tool: string, args: Record<string, unknown>) => {
  const result = executeTool(state, tool, args);
  expect(result.state).toBe(state); expect(result.kind).toBe('warning');
  return (result.data as {errorCode:string}).errorCode;
};

describe('Rescue Intelligence hypothetical dependency engine', () => {
  it('derives direct and transitive B7 effects and real independent alternatives without touching actual work', () => {
    const state = frozen(complete(createInitialState(), 1, 2));
    const original = JSON.stringify(state);
    const result = previewScenario(state, { missingParts: ['B7'] });
    expect(result.directAffected).toEqual([4]); expect(result.indirectAffected).toEqual([5, 7, 8]);
    expect(result.available).toEqual([3, 6]); expect(result.blocked).toEqual([4, 5, 7, 8]);
    expect(result.invalidatedCompleted).toEqual([]); expect(result.hypothetical.revision).toBe(state.revision);
    expect(result.causes.find(cause => cause.stepId === 8)?.chains).toContainEqual([8, 7, 5, 4]);
    expect(result.causes.find(cause => cause.stepId === 4)?.missingParts).toEqual(['B7']);
    expect(result.recovery.resources).toContainEqual({ kind: 'part', id: 'B7', steps: [4] });
    expect(JSON.stringify(state)).toBe(original);
    result.base.completed.push(8); result.hypothetical.history[0].message = 'tampered'; result.changes.missingParts!.push('A1');
    expect(JSON.stringify(state)).toBe(original);
  });
  it('invalidates only consuming confirmed steps and their completed descendants for an installed resource loss', () => {
    const state = frozen(complete(createInitialState(), 1, 2, 3, 4, 5, 6, 7, 8));
    const result = previewScenario(state, { missingParts: ['B7'] });
    expect(result.invalidatedCompleted).toEqual([4, 5, 7, 8]);
    expect(result.hypothetical.completed).toEqual([1, 2, 3, 6]);
    expect(result.diff).toEqual([4, 5, 7, 8].map(stepId => ({ stepId, before: 'complete', after: 'blocked' })));
    expect(validateState(result.hypothetical)).toBe(true);
    expect(state.completed).toHaveLength(8);
  });
  it('tool loss never retroactively invalidates already confirmed work', () => {
    const state = frozen(complete(createInitialState(), 1, 2, 3, 4, 5, 6, 7, 8));
    const result = previewScenario(state, { unavailableTools: ['hex', 'screwdriver'] });
    expect(result.invalidatedCompleted).toEqual([]); expect(result.hypothetical.completed).toEqual(state.completed);
    expect(result.blocked).toEqual([]); expect(result.recovery.resources).toEqual([]);
  });
  it('combines multiple resource changes and digital undo in one validated hypothetical state', () => {
    const state = frozen(complete(createInitialState(), 1, 2, 3, 4, 5, 6, 7, 8));
    const result = previewScenario(state, { missingParts: ['B7'], unavailableTools: ['screwdriver'], undoSteps: [2] });
    expect(result.invalidatedCompleted).toEqual([2, 3, 4, 5, 7, 8]);
    expect(result.hypothetical.completed).toEqual([1, 6]); expect(result.available).toEqual([2]);
    expect(result.hypothetical.missingTools).toEqual(['screwdriver']);
    expect(validateState(result.hypothetical)).toBe(true);
  });
  it('recovery does not restore invalidated confirmations or mark pending dependencies complete', () => {
    const state = previewScenario(complete(createInitialState(), 1, 2, 3, 4, 5, 6), { missingParts: ['B7'] }).hypothetical;
    const result = previewScenario(state, { recoveredParts: ['B7'] });
    expect(result.hypothetical.completed).toEqual([1, 2, 3, 6]); expect(result.available).toEqual([4]);
    expect(result.blocked).toEqual([]); expect(plan(result.hypothetical).find(step => step.id === 5)?.status).toBe('pending');
  });
  it('scopes recovery to the requested step and its unfinished ancestors, with direct resource consumers', () => {
    const state = previewScenario(complete(createInitialState(), 1, 2), { missingParts: ['B7'], unavailableTools: ['screwdriver'] }).hypothetical;
    const result = explainRecovery(state, 5);
    expect(result.resources).toEqual([{ kind: 'part', id: 'B7', steps: [4] }]);
    expect(result.prerequisiteSteps).toEqual([3, 4]); expect(result.availableSteps).toEqual([3]);
    expect(result.blockedSteps).toEqual([4, 5]); expect(result.requiresHumanVerification).toBe(true);
    expect(explainRecovery(state, 1).resources).toEqual([]);
  });
  it('explains contextual hypothetical recovery without applying its proposed changes', () => {
    const state = frozen(complete(createInitialState(), 1, 2));
    const result = executeTool(state, 'explain_recovery', { stepId: 5, changes: { missingParts: ['B7'] } });
    expect(result.state).toBe(state); expect(result.message).toContain('hypothetical');
    expect(result.data).toMatchObject({ resources: [{ kind: 'part', id: 'B7', steps: [4] }], blockedSteps: [4, 5] });
    expect(state.missing).toEqual([]);
  });
  it.each([
    { missingParts: ['B7', 'B7'] }, { missingParts: ['O5'] }, { recoveredParts: ['NO'] },
    { unavailableTools: ['hammer'] }, { unavailableTools: ['hex', 'hex'] }, { undoSteps: [0] }, { undoSteps: [2, 2] },
    { missingParts: ['B7'], recoveredParts: ['B7'] }, { unavailableTools: ['hex'], recoveredTools: ['hex'] },
    { missingParts: 'B7' }, { unexpected: [] }, { undoSteps: [NaN] },
  ])('rejects the complete invalid proposal without partial changes: %j', changes => {
    const state = frozen(complete(createInitialState(), 1, 2)); const before = JSON.stringify(state);
    expect(() => previewScenario(state, changes as ScenarioChanges)).toThrow();
    expect(executeTool(state, 'preview_scenario', { changes }).state).toBe(state);
    expect(JSON.stringify(state)).toBe(before);
  });
  it('compares independent alternatives from the same snapshot, and exposes pairwise differences', () => {
    const state = frozen(complete(createInitialState(), 1, 2));
    const result = compareScenarios(state, [{ id: 'B7', changes: { missingParts: ['B7'] } }, { id: 'Allen', changes: { unavailableTools: ['hex'] } }]);
    expect(result.scenarios.map(item => item.baseToken)).toEqual([scenarioBaseToken(state), scenarioBaseToken(state)]);
    expect(result.scenarios[0].hypothetical.missingTools).toEqual([]);
    expect(result.scenarios[1].hypothetical.missing).toEqual([]);
    expect(result.pairs[0].onlyLeftAvailable).toEqual([3]);
    expect(result.pairs[0].onlyRightBlocked).toContain(3);
    result.scenarios[0].base.completed.push(8);
    expect(result.scenarios[1].base.completed).toEqual([1, 2]); expect(state.completed).toEqual([1, 2]);
  });
  it('rejects duplicate IDs, malformed scenarios, excessive payloads, and cross-project IDs atomically', () => {
    const state = frozen(createInitialState());
    for (const scenarios of [[], Array.from({ length: 7 }, (_, i) => ({ id: String(i), changes: {} })), [{ id: 'a', changes: {} }, { id: 'a', changes: {} }], [null], [{ id: 'a', changes: { missingParts: ['O5'] } }]]) {
      expect(executeTool(state, 'compare_scenarios', { scenarios }).state).toBe(state);
      expect(executeTool(state, 'compare_scenarios', { scenarios }).kind).toBe('warning');
    }
  });
  it('all new reads retain the exact input object and audit, including bounded near-limit revision states', () => {
    const state = frozen({ ...complete(createInitialState(), 1), revision: Number.MAX_SAFE_INTEGER - 1 });
    for (const [tool, args] of [['preview_scenario', { changes: {} }], ['compare_scenarios', { scenarios: [{ id: 'a', changes: {} }] }], ['explain_recovery', {}]] as const) {
      const result = executeTool(state, tool, args); expect(result.state).toBe(state); expect(result.kind).toBe('info');
    }
  });
  it('canonical tokens are stable across object key order but bind every known state field and history', () => {
    const state = complete(createInitialState(), 1, 2);
    const reordered = Object.fromEntries(Object.entries(state).reverse()) as unknown as AssemblyState;
    expect(scenarioBaseToken(state)).toBe(scenarioBaseToken(reordered));
    for (const changed of [{ ...state, selectedPart: 'B7' }, { ...state, selectedStep: 3 }, { ...state, revision: state.revision + 1 }, { ...state, history: state.history.map((entry, i) => i ? entry : { ...entry, message: 'other' }) }, { ...state, missingTools: ['hex'] }])
      expect(scenarioBaseToken(changed)).not.toBe(scenarioBaseToken(state));
    expect(scenarioBaseToken(createInitialState('table'))).not.toBe(scenarioBaseToken(createInitialState('organizer')));
  });
  it('requires an exact current snapshot and literal human approval, never trusts caller hypothetical state', () => {
    const state = frozen(complete(createInitialState(), 1, 2)); const changes = { missingParts: ['B7'] };
    const preview = previewScenario(state, changes);
    expect(errorCode(state, 'apply_scenario', { changes, baseToken: preview.baseToken })).toBe('CONFIRMATION_REQUIRED');
    expect(errorCode(state, 'apply_scenario', { changes, baseToken: preview.baseToken, confirmed: 'true' })).toBe('CONFIRMATION_REQUIRED');
    const updated = execute(state, 'select_step', { stepId: 3 }).state;
    expect(errorCode(updated, 'apply_scenario', { changes, baseToken: preview.baseToken, confirmed: true })).toBe('STALE_BASE');
    expect(errorCode(state, 'apply_scenario', { changes, baseToken: preview.baseToken, confirmed: true, hypothetical: { completed: [8] } })).toBe('INVALID_ARGUMENTS');
  });
  it('applies atomically, creates one auditable revision and rejects replay', () => {
    const state = frozen(complete(createInitialState(), 1, 2, 3, 4, 5, 6, 7, 8));
    const changes = { missingParts: ['B7'] }, baseToken = scenarioBaseToken(state);
    const result = executeTool(state, 'apply_scenario', { changes, baseToken, confirmed: true });
    expect(result.kind).toBe('success'); expect(result.state.completed).toEqual([1, 2, 3, 6]);
    expect(result.state.revision).toBe(state.revision + 1); expect(result.state.history).toHaveLength(state.history.length + 1);
    expect(result.state.history.at(-1)?.tool).toBe('apply_scenario'); expect(result.message).toContain('4, 5, 7, 8');
    expect(validateState(result.state)).toBe(true); expect((result.data as {applied:boolean}).applied).toBe(true);
    expect(errorCode(result.state, 'apply_scenario', { changes, baseToken, confirmed: true })).toBe('STALE_BASE');
    expect(state.missing).toEqual([]); expect(state.completed).toHaveLength(8);
  });
  it('refuses no-op and invalid applies without appending audit entries', () => {
    const state = frozen(createInitialState()); const baseToken = scenarioBaseToken(state);
    expect(errorCode(state, 'apply_scenario', { changes: {}, baseToken, confirmed: true })).toBe('NO_CHANGES');
    expect(errorCode(state, 'apply_scenario', { changes: { missingParts: ['B7', 'B7'] }, baseToken, confirmed: true })).toBe('INVALID_RESOURCE');
    expect(errorCode(state, 'explain_recovery', { stepId: 100 })).toBe('INVALID_STEP');
    const invalid = frozen({ ...state, completed: [8] });
    expect(errorCode(invalid, 'preview_scenario', { changes: {} })).toBe('INVALID_STATE');
  });
  it('clones and normalizes frozen proposal arrays without changing them', () => {
    const state = frozen(createInitialState());
    const changes = frozen({ missingParts: ['B7', 'A1'], unavailableTools: ['screwdriver', 'hex'], undoSteps: [3, 2] });
    const result = previewScenario(state, changes);
    expect(result.changes).toEqual({ missingParts: ['A1', 'B7'], unavailableTools: ['hex', 'screwdriver'], undoSteps: [2, 3] });
    expect(changes.missingParts).toEqual(['B7', 'A1']); expect(changes.undoSteps).toEqual([3, 2]);
  });
  it('retains a bounded chronological audit and avoids imported audit ID collisions', () => {
    const state = createInitialState(); state.revision = 100;
    state.history = Array.from({ length: 100 }, (_, i) => ({ id: i === 0 ? 'rescue-101' : `old-${i}`, at: new Date(0).toISOString(), revision: i + 1, kind: 'info' as const, tool: 'old', message: 'old' }));
    frozen(state);
    const result = executeTool(state, 'apply_scenario', { changes: { missingParts: ['B7'] }, baseToken: scenarioBaseToken(state), confirmed: true });
    expect(result.state.history).toHaveLength(100); expect(result.state.history.at(-1)?.id).toBe('rescue-101-1');
    expect(result.state.history.at(-1)?.revision).toBe(101); expect(validateState(result.state)).toBe(true);
    expect(state.history[0].id).toBe('rescue-101');
  });
  it('refuses approved apply at the revision boundary while reads still work', () => {
    const state = frozen({ ...createInitialState(), revision: Number.MAX_SAFE_INTEGER - 1 });
    expect(errorCode(state, 'apply_scenario', { changes: { missingParts: ['B7'] }, baseToken: scenarioBaseToken(state), confirmed: true })).toBe('REVISION_LIMIT');
    expect(executeTool(state, 'preview_scenario', { changes: { missingParts: ['B7'] } }).kind).toBe('info');
  });
  it('preserves planner invariants for every valid completion subset and every part/tool loss in both assemblies', () => {
    let checked = 0;
    for (const assembly of ASSEMBLIES) for (let mask = 0; mask < 2 ** assembly.steps.length; mask++) {
      const state = { ...createInitialState(assembly.id), completed: assembly.steps.filter((_, index) => mask & 2 ** index).map(step => step.id) };
      if (!validateState(state)) continue;
      frozen(state);
      for (const changes of [...assembly.parts.map(part => ({ missingParts: [part.id] })), ...assembly.tools.map(tool => ({ unavailableTools: [tool.id] }))]) {
        const result = previewScenario(state, changes);
        expect(validateState(result.hypothetical)).toBe(true);
        expect(result.hypothetical.revision).toBe(state.revision); expect(result.hypothetical.history).toEqual(state.history);
        for (const id of result.hypothetical.completed) {
          const step = getAssembly(result.hypothetical).steps.find(entry => entry.id === id)!;
          expect(step.dependencies.every(dependency => result.hypothetical.completed.includes(dependency))).toBe(true);
          expect(step.parts.every(part => !result.hypothetical.missing.includes(part))).toBe(true);
        }
        expect(result.available.every(id => !result.hypothetical.completed.includes(id))).toBe(true);
        expect([...result.unchanged,...result.diff.map(entry=>entry.stepId)].sort((a,b)=>a-b)).toEqual(assembly.steps.map(step=>step.id).sort((a,b)=>a-b));
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(100);
  });
});
