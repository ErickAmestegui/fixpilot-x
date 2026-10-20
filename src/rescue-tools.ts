import { execute, validateState, type AssemblyState, type LogEntry, type ToolResult } from './engine';
import { compareScenarios, explainRecovery, previewScenario, RescueError, scenarioBaseToken, type ScenarioChanges } from './rescue';

const rescueTools = ['preview_scenario', 'compare_scenarios', 'explain_recovery', 'apply_scenario'];
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
/** New reads and all new refusals retain the exact original state, including audit/revision. */
export function executeTool(state: AssemblyState, tool: string, args: Record<string, unknown> = {}): ToolResult {
  if (!rescueTools.includes(tool)) return execute(state, tool, args);
  const refuse = (errorCode: string, message: string): ToolResult => ({ state, kind: 'warning', message, data: { errorCode } });
  try {
    if (!validateState(state)) return refuse('INVALID_STATE', 'The saved assembly state is invalid. Restore a valid checkpoint.');
    const allowed = tool === 'compare_scenarios' ? ['scenarios'] : tool === 'explain_recovery' ? ['stepId', 'changes'] : tool === 'apply_scenario' ? ['changes', 'baseToken', 'confirmed'] : ['changes'];
    if (!object(args) || Object.keys(args).some(key => !allowed.includes(key))) return refuse('INVALID_ARGUMENTS', 'Unknown or invalid tool arguments.');
    if (tool === 'preview_scenario') return { state, kind: 'info', message: 'Hypothetical plan only. The actual assembly and its confirmations have not changed.', data: previewScenario(state, args.changes as ScenarioChanges) };
    if (tool === 'compare_scenarios') return { state, kind: 'info', message: 'Independent scenarios evaluated against the same actual snapshot. No changes were applied.', data: compareScenarios(state, args.scenarios as Parameters<typeof compareScenarios>[1]) };
    if (tool === 'explain_recovery') return { state, kind: 'info', message: `Recovery requirements from the ${args.changes === undefined ? 'actual' : 'hypothetical'} dependency graph. Resource recovery does not confirm physical work.`, data: explainRecovery(args.changes === undefined ? state : previewScenario(state, args.changes as ScenarioChanges).hypothetical, args.stepId as number | undefined) };
    if (typeof args.baseToken !== 'string' || args.baseToken !== scenarioBaseToken(state)) return refuse('STALE_BASE', 'The actual assembly changed. Preview the scenario again before applying it.');
    const preview = previewScenario(state, args.changes as ScenarioChanges);
    if (args.confirmed !== true) return refuse('CONFIRMATION_REQUIRED', 'Review the proposed inventory changes and every invalidated digital confirmation, then explicitly approve the scenario.');
    if (state.revision >= Number.MAX_SAFE_INTEGER - 1) return refuse('REVISION_LIMIT', 'The revision counter cannot advance. Restore a valid checkpoint.');
    const next = preview.hypothetical;
    if (JSON.stringify([next.completed, next.missing, next.missingTools]) === JSON.stringify([state.completed, [...state.missing].sort(), [...state.missingTools].sort()])) return refuse('NO_CHANGES', 'This scenario makes no actual change.');
    const revision = state.revision + 1;
    const usedIds = new Set(state.history.map(entry => entry.id));
    let id = `rescue-${revision}`;
    for (let suffix = 1; usedIds.has(id); suffix++) id = `rescue-${revision}-${suffix}`;
    const message = `Scenario applied after explicit approval. Missing parts: ${next.missing.join(', ') || 'none'}; unavailable tools: ${next.missingTools.join(', ') || 'none'}; digital confirmations invalidated: ${preview.invalidatedCompleted.join(', ') || 'none'}. Physical work was not verified or undone.`;
    const entry: LogEntry = { id, at: new Date().toISOString(), tool, message, kind: 'success', revision };
    const applied: AssemblyState = { ...next, revision, history: [...next.history, entry].slice(-100) };
    if (!validateState(applied)) return refuse('INVALID_RESULT', 'The proposed result failed validation. No changes were applied.');
    return { state: applied, kind: 'success', message, data: { applied: true, preview } };
  } catch (error) {
    return refuse(error instanceof RescueError ? error.code : 'INVALID_ARGUMENTS', error instanceof RescueError ? error.message : 'The scenario could not be validated. No changes were applied.');
  }
}
