import { describe, expect, it } from 'vitest';
import { ASSEMBLIES, createInitialState, detectCycles, execute, getAssembly, PARTS, plan, restoreState, serializeState, STEPS, TOOLS, validateState, type AssemblyState } from '../src/engine';
const complete = (state: AssemblyState, stepId: number) => execute(state, 'complete_step', { stepId, confirmed: true }).state;

describe('assembly catalog uses one reusable planner', () => {
  it('preserves the V1 aliases and resolves legacy states', () => {
    expect(getAssembly('table').parts).toBe(PARTS);
    expect(getAssembly('table').steps).toBe(STEPS);
    expect(getAssembly('table').tools).toBe(TOOLS);
    const legacy = createInitialState(); delete legacy.assemblyId;
    expect(getAssembly(legacy).id).toBe('table');
    expect(restoreState(serializeState(legacy))).toEqual(legacy);
    expect(() => getAssembly('unknown')).toThrow();
    expect(() => createInitialState('unknown')).toThrow();
    expect(validateState({ ...legacy, assemblyId: 'unknown' })).toBe(false);
  });
  it.each(ASSEMBLIES.map(assembly => [assembly.id] as const))('validates and completes the %s graph', id => {
    const assembly = getAssembly(id);
    expect(detectCycles(assembly.steps)).toBe(false);
    expect(assembly.parts.some(part => part.id === assembly.problemPartId)).toBe(true);
    for (const step of assembly.steps) {
      expect(step.parts.every(part => assembly.parts.some(item => item.id === part))).toBe(true);
      expect(step.tools.every(tool => assembly.tools.some(item => item.id === tool))).toBe(true);
    }
    let state = createInitialState(id);
    expect(plan(state).filter(step => step.status === 'available').map(step => step.id)).toEqual([1]);
    for (const step of assembly.steps) { state = complete(state, step.id); expect(validateState(state)).toBe(true); }
    expect(state.completed).toHaveLength(assembly.steps.length);
    expect(restoreState(serializeState(state))).toEqual(state);
    expect(execute(state, 'get_assembly_state').message).toContain(`de ${assembly.steps.length}`);
    expect(execute(state, 'get_available_steps').message).toContain(`Los ${assembly.steps.length} pasos`);
  });
  it.each(ASSEMBLIES.map(assembly => [assembly.id, assembly.id === 'table' ? 6 : 5] as const))('retains independent work after tool loss and recovery in %s', (id, independent) => {
    let state = complete(createInitialState(id), 1);
    state = execute(state, 'set_tool_available', { toolId: 'hex', available: false }).state;
    expect(plan(state).filter(step => step.status === 'available').map(step => step.id)).toEqual([independent]);
    state = complete(state, independent);
    expect(plan(state).find(step => step.id === 2)?.status).toBe('blocked');
    state = execute(state, 'set_tool_available', { toolId: 'hex', available: true }).state;
    expect(state.completed).toEqual([1, independent]);
    for (const step of getAssembly(id).steps) state = complete(state, step.id);
    expect(state.completed).toHaveLength(getAssembly(id).steps.length);
  });
  it('keeps independent states and forbids cross-project imports and part IDs', () => {
    const table = execute(complete(createInitialState(), 1), 'mark_part_missing', { partId: 'B7' }).state;
    const organizer = complete(createInitialState('organizer'), 1);
    expect(organizer.missing).toEqual([]);
    expect(execute(organizer, 'inspect_part', { partId: 'B7' }).kind).toBe('warning');
    expect(execute(table, 'inspect_part', { partId: 'O5' }).kind).toBe('warning');
    expect(validateState({ ...organizer, missing: ['B7'] })).toBe(false);
    const imported = execute(organizer, 'restore_progress', { serialized: serializeState(table) });
    expect(imported.kind).toBe('warning'); expect(imported.state.assemblyId).toBe('organizer'); expect(imported.state.completed).toEqual([1]);
    expect(execute(organizer, 'load_assembly').state.assemblyId).toBe('organizer');
    expect(execute(table, 'load_assembly', { assemblyId: 'organizer' }).state.assemblyId).toBe('organizer');
  });
  it('explains hypothetical dependencies without changing inventory or completed work', () => {
    const state = complete(createInitialState('organizer'), 1);
    const result = execute(state, 'explain_part_impact', { partId: 'O5' });
    expect(result.data).toEqual({ partId: 'O5', directSteps: [4], affectedSteps: [4, 6], hypothetical: true });
    expect(result.state.completed).toEqual(state.completed); expect(result.state.missing).toEqual([]);
    expect(result.message).toContain('hipotética');
    const missing = execute(state, 'mark_part_missing', { partId: 'O5' }).state;
    expect(plan(missing).filter(step => step.status === 'blocked').map(step => step.id)).toEqual([4, 6]);
    expect(plan(missing).filter(step => step.status === 'available').map(step => step.id)).toEqual([2, 5]);
  });
});
