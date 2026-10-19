import { describe, expect, it } from 'vitest';
import { createInitialState, execute } from '../src/engine';
import { parseIntent } from '../src/intent';

describe('bounded Spanish and English intent controller', () => {
  it.each(['Alexa, me falta B7', 'Me falta la pieza B7.', 'I am missing B7', "I'm missing part B7"])( 'parses missing part: %s', text => {
    expect(parseIntent(text, createInitialState())).toEqual({ tool: 'mark_part_missing', args: { partId: 'B7' } });
  });
  it.each(['Encontré B7', 'Ya tengo la pieza B7', 'I found B7'])('parses recovery: %s', text => {
    expect(parseIntent(text, createInitialState())).toEqual({ tool: 'restore_part', args: { partId: 'B7' } });
  });
  it.each(['Mostrame la pieza B7', '¿Dónde va B7?', 'Show me part B7'])('parses inspection: %s', text => {
    expect(parseIntent(text, createInitialState())).toEqual({ tool: 'inspect_part', args: { partId: 'B7' } });
  });
  it.each(['Terminé el paso tres', 'I finished step 3', 'Complete step three'])('requires confirmation for completion: %s', text => {
    expect(parseIntent(text, createInitialState())).toEqual({ tool: 'complete_step', args: { stepId: 3, confirmed: false } });
  });
  it('uses context for the current part and step', () => {
    const state = { ...createInitialState(), selectedPart: 'C1', selectedStep: 3 };
    expect(parseIntent('¿Dónde va esta pieza?', state)).toEqual({ tool: 'inspect_part', args: { partId: 'C1' } });
    expect(parseIntent('Ya terminé', state)).toEqual({ tool: 'complete_step', args: { stepId: 3, confirmed: false } });
    expect(parseIntent('Volvamos al paso anterior', state)).toEqual({ tool: 'select_step', args: { stepId: 2 } });
    expect(parseIntent('¿Dónde va esta pieza?', createInitialState())).toHaveProperty('message');
  });
  it.each([
    ['¿Qué puedo hacer mientras tanto?', 'get_available_steps'], ['What can I do meanwhile?', 'get_available_steps'],
    ['¿Por qué no puedo avanzar?', 'explain_blockage'], ['¿Cuánto falta?', 'get_assembly_state'],
    ['Guardá el progreso', 'save_progress'], ['List parts', 'list_parts'], ['Recalculá el plan', 'recalculate_plan'],
  ])('supports %s', (text, tool) => expect(parseIntent(text, createInitialState())).toHaveProperty('tool', tool));
  it.each([
    ['Acercá la cámara', 'zoom-in'], ['Alejá la cámara', 'zoom-out'], ['Giralo hacia la izquierda', 'rotate-left'],
    ['Rotate right', 'rotate-right'], ['Mostrame la parte de atrás', 'back'], ['Repetí la animación', 'replay'],
    ['Vista explotada', 'explode'], ['Vista ensamblada', 'assembled'],
  ])('supports camera command %s without a state tool', (text, view) => expect(parseIntent(text, createInitialState())).toEqual({ view }));
  it('tracks missing tools by known IDs', () => {
    expect(parseIntent('Me falta la llave Allen', createInitialState())).toEqual({ tool: 'set_tool_available', args: { toolId: 'hex', available: false } });
    expect(parseIntent('Encontré el destornillador', createInitialState())).toEqual({ tool: 'set_tool_available', args: { toolId: 'screwdriver', available: true } });
  });
  it.each(['Me falta Z99', 'Me falta', 'Me falta B7 y A1', 'No me falta B7', 'Maybe I found B7', 'Si falta B7', 'Me falta B7; encontré A1', 'Terminé el paso 9', 'hola', '', '¿Puedo saltarme B7?', 'complete step 3 or step 4', '¿Me falta B7?', 'Encontré B7?', '¿Me falta el destornillador?', 'Deshacer paso 1?', 'Me falta B.7', 'Complete step .1', 'Complete step 1. Then undo step 1', 'Me falta B7\nEncontré B7', "Don't complete step 1", 'No encontré B7', 'Nunca terminé el paso 1', 'Me falta B7, encontré B7', 'Complete step 1 actually step 2'])('does not act on ambiguous or unsupported command: %s', text => {
    expect(parseIntent(text, createInitialState())).toHaveProperty('message');
  });
  it('avoids accidental reset of existing work', () => {
    const state = execute(createInitialState(), 'complete_step', { stepId: 1, confirmed: true }).state;
    expect(parseIntent('Comenzá el montaje', state)).toHaveProperty('message');
    expect(parseIntent('Comenzá el montaje', createInitialState())).toEqual({ tool: 'load_assembly', args: {} });
    const toolsMissing = execute(createInitialState(), 'set_tool_available', { toolId: 'hex', available: false }).state;
    expect(parseIntent('Comenzá el montaje', toolsMissing)).toHaveProperty('message');
  });
  it('selects steps without completing them and never automatically confirms cascade', () => {
    expect(parseIntent('Mostrame el paso uno', createInitialState())).toEqual({ tool: 'select_step', args: { stepId: 1 } });
    expect(parseIntent('Deshacer el paso uno', createInitialState())).toEqual({ tool: 'undo_step', args: { stepId: 1, cascade: false } });
  });
  it('rejects excessive input', () => expect(parseIntent('x'.repeat(1001), createInitialState())).toHaveProperty('message'));
});
