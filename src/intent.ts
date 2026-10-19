import { getAssembly, type AssemblyState } from './engine';

export type ViewIntent = 'rotate-left' | 'rotate-right' | 'back' | 'zoom-in' | 'zoom-out' | 'explode' | 'assembled' | 'replay';
export type Intent = { tool: string; args: Record<string, unknown> } | { message: string } | { view: ViewIntent };
const action = (tool: string, args: Record<string, unknown> = {}): Intent => ({ tool, args });
const clarify = (message: string): Intent => ({ message });

/** Deliberately bounded language recognition: never claim open-ended AI understanding. */
export function parseIntent(text: string, state: AssemblyState): Intent {
  if (typeof text !== 'string' || text.length > 1000) return clarify('Escribí una instrucción breve de montaje.');
  const { parts: PARTS, steps: STEPS } = getAssembly(state);
  const input = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/^alexa[,\s]+/, '').replace(/^[¿¡]+|[?!.]+$/g, '').trim().replace(/\s+/g, ' ');
  const change = (tool: string, args: Record<string, unknown> = {}) => /[¿?]/.test(text)
    ? clarify('No cambié el montaje: ese mensaje parece una pregunta. Indicá la acción como afirmación, por ejemplo «Me falta B7».')
    : action(tool, args);
  if (!input) return clarify('Probá «Me falta B7» o «¿Qué puedo hacer?».');
  if (/[;\n]/.test(text)) return clarify('Decime una acción por mensaje para evitar cambios ambiguos.');
  const selectedPart = PARTS.find(part => part.id === state.selectedPart);
  const selectedStep = STEPS.find(step => step.id === state.selectedStep);
  const contextPart = () => selectedPart ? action('inspect_part', { partId: selectedPart.id }) : clarify('Seleccioná una pieza o indicá su código para resolver esa referencia.');
  // Exact contextual phrases are resolved before general negation/compound guards.
  if (/^(por que (la|lo) necesito|para que sirve (esa|esta) pieza|que es esa pieza|donde va esa pieza|esa pieza)$/.test(input)) return contextPart();
  if (/^(y )?si no (la|lo) tengo$/.test(input)) return selectedPart ? action('explain_part_impact', { partId: selectedPart.id }) : clarify('Seleccioná la pieza sobre la que querés consultar. No cambié el inventario.');
  if (/^(ya (la|lo) encontre|encontre (esa|esta) pieza|recupere (esa|esta) pieza)$/.test(input)) {
    const missing = selectedPart ? (state.missing.includes(selectedPart.id) ? selectedPart.id : undefined) : state.missing.length === 1 ? state.missing[0] : undefined;
    return missing ? change('restore_part', { partId: missing }) : clarify('Indicá el código de la pieza recuperada; la referencia no identifica una pieza faltante de forma única.');
  }
  if (/^que puedo adelantar sin deshacer lo que ya termine$/.test(input)) return action('get_available_steps');
  if (/^(la anterior|el anterior)$/.test(input)) return action('select_step', { stepId: Math.max(1, state.selectedStep - 1) });
  if (/^(bueno[,]? )?avancemos con otra cosa$/.test(input)) return action('get_available_steps');
  if (/^(ese paso|mostrame ese paso|muestrame ese paso|ver ese paso)$/.test(input)) return selectedStep ? action('select_step', { stepId: selectedStep.id }) : clarify('Seleccioná el paso que querés consultar.');
  if (/^(termine|complete|ya termine) ese paso$/.test(input)) return selectedStep ? change('complete_step', { stepId: selectedStep.id, confirmed: false }) : clarify('Seleccioná un paso primero.');
  if (/^(me falta|no tengo) (esa|esta) pieza$/.test(input)) return selectedPart ? change('mark_part_missing', { partId: selectedPart.id }) : clarify('Seleccioná una pieza o indicá su código.');
  if (/^no tengo (la )?(llave|herramienta) necesaria para (este|ese) paso$/.test(input)) {
    const tools = selectedStep?.tools ?? [];
    return tools.length === 1 ? change('set_tool_available', { toolId: tools[0], available: false }) : clarify('Este paso no identifica una herramienta única. Indicá llave Allen o destornillador.');
  }
  const noPart = input.match(/^no tengo (?:(?:la )?pieza )?([a-z]\d+)$/);
  if (noPart) return PARTS.some(part => part.id === noPart[1].toUpperCase()) ? change('mark_part_missing', { partId: noPart[1].toUpperCase() }) : clarify('Esa pieza no pertenece al montaje actual.');
  if (/^no tengo (?:la |el )?(llave allen|allen|hex|destornillador|screwdriver)$/.test(input)) return change('set_tool_available', { toolId: /allen|hex/.test(input) ? 'hex' : 'screwdriver', available: false });
  const misplaced = input.match(/^(?:coloque|instale|puse) mal (?:el |la )?(panel lateral|marco lateral|repisa|barra posterior|travesano|esa pieza|esta pieza|[a-z]\d+)$/);
  if (misplaced) {
    const label = misplaced[1];
    const matching = /^(esa|esta) pieza$/.test(label) ? (selectedPart ? [selectedPart] : []) : PARTS.filter(part => part.id.toLowerCase() === label || part.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(label));
    const candidates = STEPS.filter(step => state.completed.includes(step.id) && matching.some(part => step.parts.includes(part.id)));
    const roots = candidates.filter(step => !candidates.some(other => other.id !== step.id && step.dependencies.includes(other.id)));
    return roots.length === 1 ? change('undo_step', { stepId: roots[0].id, cascade: false }) : clarify('Indicá la pieza o el paso que colocaste mal para revisar sus dependencias.');
  }
  // Negations, hypotheticals, multiple statements and compound commands must not mutate state.
  if (/\b(no|not|dont|don't|never|nunca|quizas|tal vez|maybe|if|si faltara|si falta|supongamos)\b/.test(input) && !/^(por que no puedo avanzar|why can i not continue|why cant i continue)$/.test(input)) return clarify('Necesito una instrucción afirmativa y concreta. Por ejemplo: «Me falta B7» o «Encontré B7».');
  if (/[;\n]/.test(text) || /\b(y|and|luego|then|o|or)\b/.test(input)) return clarify('Decime una acción por mensaje para evitar cambios ambiguos.');
  const ids = [...input.matchAll(/\b([a-z]\d+)\b/g)].map(match => match[1].toUpperCase());
  if (ids.length > 1) return clarify('Indicá una sola pieza por mensaje.');
  if (ids.length && !PARTS.some(part => part.id === ids[0])) return clarify(`No conozco la pieza ${ids[0]}. Podés consultar «Lista de piezas».`);
  const id = ids[0];
  const numberWords: Record<string, number> = { uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
  const stepMatch = input.match(/\b(?:paso|step)\s+(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|one|two|three|four|five|six|seven|eight)\b/);
  const step = stepMatch ? numberWords[stepMatch[1]] ?? Number(stepMatch[1]) : undefined;
  const exactStepCommand = (prefix: string) => new RegExp(`^(?:${prefix}) (?:el )?(?:paso|step) (?:\\d+|${Object.keys(numberWords).join('|')})$`).test(input);
  if (step !== undefined && !STEPS.some(item => item.id === step)) return clarify(`Este montaje tiene ${STEPS.length} pasos. Elegí del 1 al ${STEPS.length}.`);
  if (/^(me falta|falta|perdi|i am missing|i'm missing|missing|i lost)\s+(?:la pieza |pieza |part )?[a-z]\d+$/.test(input)) return change('mark_part_missing', { partId: id });
  if (/^(encontre|recupere|ya tengo|tengo|i found|found|recovered|i have)\s+(?:la pieza |pieza |part )?[a-z]\d+$/.test(input)) return change('restore_part', { partId: id });
  if (/^(mostrame|muestrame|mostrar|ver|inspeccionar|donde va|que es|show|show me|inspect|where is)\s+(?:la pieza |pieza |part )?[a-z]\d+$/.test(input)) return action('inspect_part', { partId: id });
  if (/^(donde va esta pieza|que es esta pieza|where does this part go)$/.test(input)) return state.selectedPart ? action('inspect_part', { partId: state.selectedPart }) : clarify('Seleccioná una pieza en el modelo o indicá su código, por ejemplo B7.');
  if (/^(me falta|encontre|i am missing|i found)\s+(?:la |el )?(llave allen|allen|hex|destornillador|screwdriver)$/.test(input)) return change('set_tool_available', { toolId: /allen|hex/.test(input) ? 'hex' : 'screwdriver', available: /^(encontre|i found)/.test(input) });
  if (/^(me falta|encontre|missing|found)( la pieza| pieza)?$/.test(input)) return clarify('¿Qué pieza? Indicá su código, por ejemplo B7.');
  if (/^(comenza|comenzar|inicia|iniciar|empeza|start)( el montaje| montaje| assembly| the assembly)?$/.test(input)) return state.completed.length || state.missing.length || state.missingTools.length ? clarify('Ya hay un montaje en curso. Usá el botón de reinicio para confirmar que querés borrar su progreso.') : change('load_assembly');
  if (exactStepCommand('mostrame|muestrame|mostrar|ver|show|show me') && step !== undefined) return action('select_step', { stepId: step });
  if (exactStepCommand('termine|complete|completar|ya termine|i finished|i completed|finished') && step !== undefined) return change('complete_step', { stepId: step, confirmed: false });
  if (/^(ya termine|termine|listo|done|i am done|i'm done)$/.test(input)) return change('complete_step', { stepId: state.selectedStep, confirmed: false });
  if (exactStepCommand('deshacer|deshace|undo') && step !== undefined) return change('undo_step', { stepId: step, cascade: false });
  if (/^(volvamos al paso anterior|paso anterior|previous step|go back)$/.test(input)) return action('select_step', { stepId: Math.max(1, state.selectedStep - 1) });
  if (/^(que puedo hacer( mientras tanto)?|que sigue|siguiente paso|pasos disponibles|what can i do( meanwhile)?|whats next|what's next|available steps)$/.test(input)) return action('get_available_steps');
  if (/^(por que no puedo avanzar|por que esta bloqueado|por que|bloqueos|why am i blocked|why can i not continue|why cant i continue|explain blockage)$/.test(input)) return action('explain_blockage');
  if (exactStepCommand('por que esta bloqueado') && step !== undefined) return action('explain_blockage', { stepId: step });
  if (/^(cuanto falta|progreso|estado|how much is left|progress|status)$/.test(input)) return action('get_assembly_state');
  if (/^(guarda|guardar|save)( el progreso| progreso| progress| my progress)?$/.test(input)) return action('save_progress');
  if (/^(lista de piezas|piezas|inventario|list parts|parts|inventory)$/.test(input)) return action('list_parts');
  if (/^(seguridad|precauciones|safety|safety requirements)$/.test(input)) return action('get_safety_requirements', { stepId: state.selectedStep });
  if (/^(recalcula|recalcular|replanifica|recalculate)( el plan| plan)?$/.test(input)) return action('recalculate_plan');
  const views: [RegExp, ViewIntent][] = [
    [/^(gira|giralo|rotar|rota)( hacia)?( la)? izquierda$|^rotate left$/, 'rotate-left'],
    [/^(gira|giralo|rotar|rota)( hacia)?( la)? derecha$|^rotate right$/, 'rotate-right'],
    [/^(mostrame|muestrame)( la)? parte de atras$|^vista posterior$|^show( me)? the back$/, 'back'],
    [/^(acerca|acercar)( la camara)?$|^zoom in$/, 'zoom-in'],
    [/^(aleja|alejar)( la camara)?$|^zoom out$/, 'zoom-out'],
    [/^(vista explotada|separar piezas|explode|exploded view)$/, 'explode'],
    [/^(vista ensamblada|montaje completo|assembled|assembled view)$/, 'assembled'],
    [/^(repeti|repetir)( la)? animacion$|^replay( animation)?$/, 'replay'],
  ];
  const view = views.find(([pattern]) => pattern.test(input));
  if (view) return { view: view[1] };
  return clarify('Puedo guiar este montaje con comandos concretos: «Me falta B7», «Mostrame el paso 3», «¿Qué puedo hacer?» o «Guardá el progreso». No interpreté una acción segura en ese mensaje.');
}
