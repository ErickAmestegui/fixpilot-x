import { describe, expect, it } from 'vitest';
import { createInitialState, detectCycles, execute, PARTS, plan, restoreState, serializeState, STEPS, validateState, type AssemblyState } from '../src/engine';

const complete = (state: AssemblyState, stepId: number) => execute(state, 'complete_step', { stepId, confirmed: true }).state;
const through = (...steps: number[]) => steps.reduce(complete, createInitialState());
const status = (state: AssemblyState, id: number) => plan(state).find(step => step.id === id)!.status;
describe('adaptive assembly graph', () => {
  it('starts at zero with only the first step available', () => {
    const state = createInitialState();
    expect(validateState(state)).toBe(true);
    expect(plan(state).filter(step => step.status === 'available').map(step => step.id)).toEqual([1]);
    expect(detectCycles(STEPS)).toBe(false);
    expect(PARTS).toHaveLength(8);
  });
  it('supports a complete normal assembly with validated states', () => {
    let state = createInitialState();
    for (const step of STEPS) {
      const result = execute(state, 'complete_step', { stepId: step.id, confirmed: true });
      expect(result.kind).toBe('success');
      state = result.state;
      expect(validateState(state)).toBe(true);
    }
    expect(state.completed).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(plan(state).every(step => step.status === 'complete')).toBe(true);
    expect(execute(state, 'get_available_steps').message).toContain('no ha sido verificada');
  });
  it('blocks B7 dependents and permits the shelf and feet preparation', () => {
    let state = through(1, 2);
    state = execute(state, 'mark_part_missing', { partId: 'b7' }).state;
    expect(state.missing).toEqual(['B7']);
    expect(plan(state).filter(step => step.status === 'blocked').map(step => step.id)).toEqual([4, 5, 7, 8]);
    expect(plan(state).filter(step => step.status === 'available').map(step => step.id)).toEqual([3, 6]);
    state = complete(complete(state, 6), 3);
    expect(state.completed).toEqual([1, 2, 3, 6]);
    expect(execute(state, 'complete_step', { stepId: 5, confirmed: true }).kind).toBe('warning');
    state = execute(state, 'restore_part', { partId: 'B7' }).state;
    expect(status(state, 4)).toBe('available');
    expect(status(state, 5)).toBe('pending');
    for (const step of [4, 5, 7, 8]) state = complete(state, step);
    expect(state.completed).toHaveLength(8);
  });
  it('allows initial base preparation when B7 is missing from the start', () => {
    const state = execute(createInitialState(), 'mark_part_missing', { partId: 'B7' }).state;
    expect(status(state, 1)).toBe('available');
    expect(complete(state, 1).completed).toEqual([1]);
  });
  it('requires both shelf and stiffener before the top', () => {
    expect(status(through(1, 2, 3), 5)).toBe('pending');
    expect(status(through(1, 2, 4), 5)).toBe('pending');
    expect(status(through(1, 2, 4, 3), 5)).toBe('available');
  });
  it('requires both assembled body and prepared feet before attachment', () => {
    expect(status(through(1, 6), 7)).toBe('pending');
    expect(status(through(1, 2, 3, 4, 5), 7)).toBe('pending');
    expect(status(through(1, 6, 2, 3, 4, 5), 7)).toBe('available');
  });
  it('propagates a missing tool and restores it without undoing completed steps', () => {
    let state = through(1, 2);
    state = execute(state, 'set_tool_available', { toolId: 'hex', available: false }).state;
    expect(status(state, 2)).toBe('complete');
    expect(status(state, 3)).toBe('blocked');
    expect(status(state, 6)).toBe('available');
    expect(validateState(state)).toBe(true);
    state = execute(state, 'set_tool_available', { toolId: 'hex', available: true }).state;
    expect(status(state, 3)).toBe('available');
  });
  it('refuses dependency skips and never mutates the caller', () => {
    const state = createInitialState(); const before = JSON.stringify(state);
    const result = execute(state, 'complete_step', { stepId: 8, confirmed: true });
    expect(result.kind).toBe('warning');
    expect(result.state.completed).toEqual([]);
    expect(JSON.stringify(state)).toBe(before);
  });
  it('requires explicit physical-completion confirmation', () => {
    const result = execute(createInitialState(), 'complete_step', { stepId: 1 });
    expect(result.state.completed).toEqual([]);
    expect(result.data).toEqual({ requiresConfirmation: true, stepId: 1 });
    expect(execute(createInitialState(), 'complete_step', { stepId: 1, confirmed: 'true' }).state.completed).toEqual([]);
  });
  it('rejects a missing component already involved in confirmed work', () => {
    const result = execute(through(1, 2, 4), 'mark_part_missing', { partId: 'B7' });
    expect(result.kind).toBe('warning');
    expect(result.state.missing).toEqual([]);
    expect(result.state.completed).toContain(4);
  });
  it('cascades undo only after confirmation and preserves independent work', () => {
    const state = through(1, 2, 3, 4, 5, 6, 7, 8);
    const unconfirmed = execute(state, 'undo_step', { stepId: 4 });
    expect(unconfirmed.kind).toBe('warning');
    expect(unconfirmed.state.completed).toEqual(state.completed);
    expect(unconfirmed.data).toEqual({ requiresCascade: true, affectedSteps: [4, 5, 7, 8] });
    const confirmed = execute(state, 'undo_step', { stepId: 4, cascade: true });
    expect(confirmed.state.completed).toEqual([1, 2, 3, 6]);
    expect(validateState(confirmed.state)).toBe(true);
    expect(execute(confirmed.state, 'mark_part_missing', { partId: 'B7' }).state.missing).toEqual(['B7']);
  });
  it('undoes a leaf directly and all work when undoing the root with consent', () => {
    const state = through(1, 2, 3, 4, 5, 6, 7, 8);
    expect(execute(state, 'undo_step', { stepId: 8 }).state.completed).toHaveLength(7);
    expect(execute(state, 'undo_step', { stepId: 1, cascade: true }).state.completed).toEqual([]);
  });
  it('detects cycles and rejects invalid graphs', () => {
    expect(detectCycles([{ id: 1, dependencies: [2] }, { id: 2, dependencies: [1] }])).toBe(true);
    expect(detectCycles([{ id: 1, dependencies: [1] }])).toBe(true);
    expect(detectCycles([{ id: 1, dependencies: [] }, { id: 2, dependencies: [1] }])).toBe(false);
    expect(() => detectCycles([{ id: 1, dependencies: [99] }])).toThrow();
    expect(() => detectCycles([{ id: 1, dependencies: [] }, { id: 1, dependencies: [] }])).toThrow();
  });
});

describe('persistence and tool boundaries', () => {
  it('round trips a state and returns a detached object', () => {
    const state = execute(through(1, 2, 6), 'mark_part_missing', { partId: 'B7' }).state;
    const restored = restoreState(serializeState(state));
    expect(restored).toEqual(state);
    restored.completed.push(3);
    expect(state.completed).toEqual([1, 2, 6]);
  });
  it.each([
    { completed: [2] }, { completed: [1, 1] }, { completed: [9] }, { completed: ['1'] },
    { completed: [1], missing: ['D1'] }, { missing: ['Q1'] }, { missingTools: ['drill'] },
    { selectedStep: 0 }, { selectedPart: 'Z9' }, { revision: -1 }, { revision: 0.2 }, { version: 2 },
    { history: [{ tool: 'made-up' }] }, { completed: null }, { missing: {} },
  ])('rejects corrupt persisted fields %j', patch => {
    const bad = { ...createInitialState(), ...patch };
    expect(validateState(bad)).toBe(false);
    expect(() => restoreState(JSON.stringify(bad))).toThrow();
  });
  it('rejects invalid JSON and oversized imports', () => {
    expect(() => restoreState('{')).toThrow();
    expect(() => restoreState('x'.repeat(250_001))).toThrow();
    expect(() => restoreState('null')).toThrow();
  });
  it('drops unknown imported keys', () => {
    expect(restoreState(JSON.stringify({ ...createInitialState(), unexpected: 'ignored', __proto__: {} }))).not.toHaveProperty('unexpected');
  });
  it('imports state while preserving a chronological local audit history', () => {
    const saved = serializeState(through(1, 2, 3, 4, 5, 6));
    const result = execute(createInitialState(), 'restore_progress', { serialized: saved });
    expect(result.state.completed).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.state.revision).toBe(1);
    expect(validateState(result.state)).toBe(true);
    const failed = execute(result.state, 'restore_progress', { serialized: '{}' });
    expect(failed.kind).toBe('warning');
    expect(failed.state.completed).toEqual(result.state.completed);
  });
  it('keeps unique action IDs after restoring unusual but valid historical IDs', () => {
    const saved = execute(createInitialState(), 'get_assembly_state').state;
    saved.history[0].id = 'action-2';
    const restored = restoreState(serializeState(saved));
    const result = execute(restored, 'complete_step', { stepId: 1, confirmed: true });
    expect(result.state.history.map(entry => entry.id)).toEqual(['action-2', 'action-2-1']);
    expect(result.state.completed).toEqual([1]);
    expect(validateState(result.state)).toBe(true);
  });
  it('rejects duplicate or reversed historical revisions and future entries', () => {
    const saved = through(1, 2);
    for (const revision of [1, 0, 3]) {
      const candidate = structuredClone(saved);
      candidate.history[1].revision = revision;
      expect(validateState(candidate)).toBe(false);
      expect(() => restoreState(JSON.stringify(candidate))).toThrow();
    }
  });
  it('rejects a revision overflow without corrupting a restored state', () => {
    const state = { ...createInitialState(), revision: Number.MAX_SAFE_INTEGER - 1 };
    expect(validateState(state)).toBe(true);
    const result = execute(state, 'complete_step', { stepId: 1, confirmed: true });
    expect(result.kind).toBe('warning');
    expect(result.state).toBe(state);
    expect(validateState(result.state)).toBe(true);
  });
  it('logs real calls with bounded, unique history and monotonic revisions', () => {
    let state = createInitialState();
    for (let index = 0; index < 150; index++) state = execute(state, 'get_assembly_state').state;
    expect(state.history).toHaveLength(100);
    expect(state.revision).toBe(150);
    expect(new Set(state.history.map(entry => entry.id)).size).toBe(100);
    expect(validateState(state)).toBe(true);
  });
  it.each([
    ['complete_step', { stepId: '1', confirmed: true }], ['complete_step', { stepId: 99 }],
    ['mark_part_missing', { partId: 'Z1' }], ['inspect_part', {}],
    ['set_tool_available', { toolId: 'drill', available: true }],
    ['set_tool_available', { toolId: 'hex', available: 'false' }],
    ['explain_blockage', { stepId: '3' }], ['get_safety_requirements', { stepId: 0 }], ['unknown', {}],
  ])('rejects invalid tool call %s %j', (tool, args) => {
    const result = execute(createInitialState(), tool, args);
    expect(result.kind).toBe('warning');
    expect(result.state.completed).toEqual([]);
    expect(result.state.missing).toEqual([]);
    expect(validateState(result.state)).toBe(true);
  });
  it('selects and inspects without claiming completion', () => {
    const selected = execute(createInitialState(), 'select_step', { stepId: 4 });
    expect(selected.state.selectedStep).toBe(4);
    expect(selected.state.selectedPart).toBe('B7');
    expect(selected.state.completed).toEqual([]);
    expect(execute(selected.state, 'focus_3d_part', { partId: 'C1' }).state.selectedPart).toBe('C1');
  });
  it('exposes the exact blockage and physical safety requirements', () => {
    const state = execute(through(1, 2), 'mark_part_missing', { partId: 'B7' }).state;
    expect(execute(state, 'explain_blockage', { stepId: 8 }).message).toContain('B7');
    expect(execute(state, 'get_safety_requirements', { stepId: 4 }).message).toContain('estructural');
  });
  it('save prepares valid data without falsely claiming storage success', () => {
    const state = through(1, 2);
    const result = execute(state, 'save_progress');
    expect(restoreState((result.data as { serialized: string }).serialized)).toEqual(state);
    expect(result.message).toContain('por separado');
  });
  it('reset clears all work and returns to step one', () => {
    const state = execute(through(1, 2), 'mark_part_missing', { partId: 'B7' }).state;
    const reset = execute(state, 'load_assembly').state;
    expect(reset.completed).toEqual([]); expect(reset.missing).toEqual([]); expect(reset.selectedStep).toBe(1);
    expect(validateState(reset)).toBe(true);
  });
});
