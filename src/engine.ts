/** Renderer-independent assembly model. Completion records a human report, never a physical verification. */
export interface Part { id: string; name: string; description: string }
export interface Step { id: number; title: string; description: string; parts: string[]; tools: string[]; dependencies: number[]; safety: string }
export type ResultKind = 'success' | 'warning' | 'info';
export interface LogEntry { id: string; at: string; tool: string; message: string; kind: ResultKind; revision: number }
export interface AssemblyState { version: 1; completed: number[]; missing: string[]; missingTools: string[]; selectedPart: string | null; selectedStep: number; revision: number; history: LogEntry[] }
export interface PlanEntry extends Step { status: 'complete' | 'available' | 'blocked' | 'pending'; reasons: string[] }
export interface ToolResult { state: AssemblyState; message: string; kind: ResultKind; data?: unknown }

export const PARTS: Part[] = [
  { id: 'D1', name: 'Base inferior', description: 'Panel inferior de 48 × 36 cm; los laterales se fijan en sus bordes y los pies debajo.' },
  { id: 'B1', name: 'Panel lateral izquierdo', description: 'Panel vertical izquierdo; sostiene la repisa y la cubierta.' },
  { id: 'B2', name: 'Panel lateral derecho', description: 'Panel vertical derecho; sostiene la repisa y la cubierta.' },
  { id: 'C1', name: 'Repisa central', description: 'Repisa intermedia de 44 × 32 cm que se fija entre B1 y B2.' },
  { id: 'B7', name: 'Travesaño posterior', description: 'Travesaño estructural horizontal entre los laterales, bajo la cubierta. Evita el desplazamiento lateral; no se puede omitir ni sustituir.' },
  { id: 'A1', name: 'Panel superior', description: 'Cubierta de 52 × 40 cm. Se instala después de la repisa y el travesaño B7.' },
  { id: 'F1', name: 'Juego de cuatro pies', description: 'Cuatro pies cortos con placas de montaje preperforadas y protectores.' },
  { id: 'S1', name: 'Kit de tornillos y herrajes', description: 'Tornillos, conectores y soportes del diseño original. Usar únicamente las fijaciones correspondientes; no improvisar sustitutos.' },
];
export const TOOLS = [{ id: 'hex', name: 'Llave Allen' }, { id: 'screwdriver', name: 'Destornillador' }];
export const STEPS: Step[] = [
  { id: 1, title: 'Preparar la base', description: 'Colocá D1 sobre una superficie plana protegida, con los orificios de unión accesibles. Identificá sus bordes y separá las fijaciones.', parts: ['D1'], tools: [], dependencies: [], safety: 'Trabajá sobre una superficie estable y despejada. Este prototipo no sustituye las instrucciones de un fabricante.' },
  { id: 2, title: 'Instalar paneles laterales', description: 'Alineá B1 y B2 con los orificios de D1. Sostené cada panel mientras colocás los conectores S1. Mantené el conjunto apoyado.', parts: ['D1', 'B1', 'B2', 'S1'], tools: ['hex'], dependencies: [1], safety: 'Sostené los paneles hasta fijarlos. No cargues el conjunto ni lo dejes de pie sin apoyo antes de instalar B7.' },
  { id: 3, title: 'Instalar repisa central', description: 'Con el conjunto apoyado, alineá C1 entre B1 y B2 y fijala con sus soportes S1. Este paso puede realizarse mientras falta B7.', parts: ['C1', 'S1'], tools: ['hex'], dependencies: [2], safety: 'Mantené los laterales apoyados y las manos fuera de los puntos de unión. No cargues la repisa.' },
  { id: 4, title: 'Fijar travesaño B7', description: 'Uní B7 horizontalmente entre los laterales, por la parte posterior, debajo de la futura cubierta. Usá las fijaciones S1.', parts: ['B7', 'S1'], tools: ['hex'], dependencies: [2], safety: 'B7 es estructural. No continúes con la cubierta si falta o está dañado; no uses una pieza improvisada.' },
  { id: 5, title: 'Colocar panel superior', description: 'Alineá A1 sobre los laterales y el travesaño ya fijados. Instalá sus conectores S1 y ajustá con cuidado.', parts: ['A1', 'S1'], tools: ['hex'], dependencies: [3, 4], safety: 'Verificá manualmente las uniones de C1 y B7 antes de apoyar A1. No aprietes en exceso.' },
  { id: 6, title: 'Preparar los cuatro pies', description: 'Sobre la mesa de trabajo, prepará las placas y protectores de F1 con S1. Dejá los cuatro pies separados del mueble, listos para fijar.', parts: ['F1', 'S1'], tools: ['screwdriver'], dependencies: [1], safety: 'Los pies se preparan por separado. No intentes voltear ni sostener el mueble incompleto para colocarlos.' },
  { id: 7, title: 'Fijar pies a la base', description: 'Con el conjunto completo y apoyado de forma segura sobre una superficie protegida, fijá los cuatro pies preparados en los puntos de D1.', parts: ['D1', 'F1', 'S1'], tools: ['screwdriver'], dependencies: [5, 6], safety: 'Pedí ayuda para mover el conjunto si no podés sujetarlo cómodamente. Nunca trabajes debajo de un mueble sostenido a mano.' },
  { id: 8, title: 'Revisión final', description: 'Colocá el mueble en suelo plano. Revisá manualmente todas las uniones, que los cuatro pies apoyen y que no haya movimiento inesperado.', parts: [], tools: [], dependencies: [7], safety: 'La app registra tu confirmación; no verifica la resistencia física. No te subas, no lo uses como asiento ni lo cargues sin una capacidad validada.' },
];

export function createInitialState(): AssemblyState {
  return { version: 1, completed: [], missing: [], missingTools: [], selectedPart: null, selectedStep: 1, revision: 0, history: [] };
}

/** True for a directed cycle. Unknown dependencies and duplicate IDs are invalid graphs and throw. */
export function detectCycles(steps: Pick<Step, 'id' | 'dependencies'>[]): boolean {
  const graph = new Map(steps.map(step => [step.id, step.dependencies]));
  if (graph.size !== steps.length || steps.some(step => step.dependencies.some(id => !graph.has(id)))) throw new Error('Grafo inválido: identificadores duplicados o dependencia desconocida.');
  const visiting = new Set<number>();
  const visited = new Set<number>();
  const visit = (id: number): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if (graph.get(id)!.some(visit)) return true;
    visiting.delete(id); visited.add(id); return false;
  };
  return steps.some(step => visit(step.id));
}

export function plan(state: AssemblyState): PlanEntry[] {
  if (detectCycles(STEPS)) throw new Error('Dependencias circulares: montaje detenido.');
  const entries = new Map<number, PlanEntry>();
  const calculate = (step: Step): PlanEntry => {
    if (entries.has(step.id)) return entries.get(step.id)!;
    const dependencies = step.dependencies.map(id => calculate(STEPS.find(item => item.id === id)!));
    const missing = step.parts.filter(id => state.missing.includes(id));
    const tools = step.tools.filter(id => state.missingTools.includes(id));
    const hardBlocked = dependencies.filter(item => item.status === 'blocked');
    const waiting = dependencies.filter(item => item.status !== 'complete');
    const completed = state.completed.includes(step.id);
    const reasons = completed ? [] : [
      ...missing.map(id => `Falta la pieza ${id}.`),
      ...tools.map(id => `Falta ${TOOLS.find(tool => tool.id === id)?.name ?? id}.`),
      ...hardBlocked.map(item => `Paso ${item.id} bloqueado: ${item.reasons.join(' ')}`),
      ...waiting.filter(item => item.status !== 'blocked').map(item => `Completá primero el paso ${item.id}.`),
    ];
    const status: PlanEntry['status'] = completed ? 'complete' : missing.length || tools.length || hardBlocked.length ? 'blocked' : waiting.length ? 'pending' : 'available';
    const entry = { ...step, status, reasons }; entries.set(step.id, entry); return entry;
  };
  return STEPS.map(calculate);
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const uniqueList = <T>(value: unknown, valid: (item: unknown) => item is T): value is T[] => Array.isArray(value) && value.length <= 100 && value.every(valid) && new Set(value).size === value.length;
const partId = (value: unknown): value is string => typeof value === 'string' && PARTS.some(part => part.id === value);
const stepId = (value: unknown): value is number => typeof value === 'number' && STEPS.some(step => step.id === value);
const toolId = (value: unknown): value is string => typeof value === 'string' && TOOLS.some(tool => tool.id === value);
const safeInteger = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;

export function validateState(value: unknown): value is AssemblyState {
  if (!record(value) || value.version !== 1 || !uniqueList(value.completed, stepId) || !uniqueList(value.missing, partId) || !uniqueList(value.missingTools, toolId) || !(value.selectedPart === null || partId(value.selectedPart)) || !stepId(value.selectedStep) || !safeInteger(value.revision) || value.revision >= Number.MAX_SAFE_INTEGER) return false;
  if (!Array.isArray(value.history) || value.history.length > 100) return false;
  let previousRevision = -1;
  const ids = new Set<string>();
  for (const entry of value.history) {
    if (!record(entry) || typeof entry.id !== 'string' || entry.id.length > 100 || ids.has(entry.id) || typeof entry.at !== 'string' || !Number.isFinite(Date.parse(entry.at)) || typeof entry.tool !== 'string' || entry.tool.length > 100 || typeof entry.message !== 'string' || entry.message.length > 5000 || !['success', 'warning', 'info'].includes(entry.kind as string) || !safeInteger(entry.revision) || entry.revision > value.revision || entry.revision <= previousRevision) return false;
    previousRevision = entry.revision; ids.add(entry.id);
  }
  const completed = value.completed;
  const missing = value.missing;
  return completed.every(id => {
    const step = STEPS.find(item => item.id === id)!;
    return step.dependencies.every(dependency => completed.includes(dependency)) && step.parts.every(part => !missing.includes(part));
  });
}

export function serializeState(state: AssemblyState): string {
  if (!validateState(state)) throw new Error('Estado inválido; no se puede guardar.');
  return JSON.stringify(state);
}

export function restoreState(serialized: string): AssemblyState {
  if (typeof serialized !== 'string' || serialized.length > 250_000) throw new Error('Archivo de progreso inválido o demasiado grande.');
  let value: unknown;
  try { value = JSON.parse(serialized); } catch { throw new Error('El progreso no contiene JSON válido.'); }
  if (!validateState(value)) throw new Error('Progreso inconsistente: revisá piezas, pasos y dependencias. No se importó.');
  // Construct a known-key value; extra fields and prototype-like keys never cross the boundary.
  return { version: 1, completed: [...value.completed], missing: [...value.missing], missingTools: [...value.missingTools], selectedPart: value.selectedPart, selectedStep: value.selectedStep, revision: value.revision, history: value.history.map(({ id, at, tool, message, kind, revision }) => ({ id, at, tool, message, kind, revision })) };
}

export function execute(state: AssemblyState, tool: string, args: Record<string, unknown> = {}): ToolResult {
  if (!validateState(state)) return { state, message: 'Estado inválido: recuperá una copia válida antes de continuar.', kind: 'warning' };
  if (state.revision >= Number.MAX_SAFE_INTEGER - 1) return { state, message: 'El contador de acciones del archivo importado excede el límite. No se modificó el montaje.', kind: 'warning' };
  const finish = (message: string, kind: ResultKind = 'info', next: AssemblyState = state, data?: unknown): ToolResult => {
    const revision = state.revision + 1;
    const usedIds = new Set(next.history.map(entry => entry.id));
    let id = `action-${revision}`;
    for (let suffix = 1; usedIds.has(id); suffix++) id = `action-${revision}-${suffix}`;
    const entry: LogEntry = { id, at: new Date().toISOString(), tool: String(tool).slice(0, 100), message, kind, revision };
    return { state: { ...next, revision, history: [...next.history, entry].slice(-100) }, message, kind, ...(data === undefined ? {} : { data }) };
  };
  if (!record(args)) return finish('Argumentos inválidos.', 'warning');
  const normalizedPart = typeof args.partId === 'string' ? args.partId.toUpperCase().trim() : args.partId;
  const requiresPart = ['inspect_part', 'mark_part_missing', 'restore_part', 'focus_3d_part'].includes(tool);
  if (requiresPart && !partId(normalizedPart)) return finish('Pieza desconocida. Usá D1, B1, B2, C1, B7, A1, F1 o S1.', 'warning');
  const requiresStep = ['complete_step', 'undo_step', 'select_step'].includes(tool);
  if (requiresStep && !stepId(args.stepId)) return finish('Paso inválido. Elegí un número del 1 al 8.', 'warning');
  switch (tool) {
    case 'load_assembly': return finish('Montaje reiniciado. Prepará la base D1 para comenzar.', 'success', createInitialState());
    case 'get_assembly_state': return finish(`${state.completed.length} de 8 pasos confirmados por vos. ${state.missing.length ? `Piezas faltantes: ${state.missing.join(', ')}.` : 'No hay piezas declaradas faltantes.'}`, 'info', state, { completed: state.completed, missing: state.missing, missingTools: state.missingTools, plan: plan(state) });
    case 'list_parts': return finish('Estas son las 8 referencias del montaje. F1 y S1 representan juegos de componentes.', 'info', state, PARTS.map(part => ({ ...part, available: !state.missing.includes(part.id) })));
    case 'inspect_part':
    case 'focus_3d_part': {
      const part = PARTS.find(item => item.id === normalizedPart)!;
      return finish(`${part.id} · ${part.name}. ${part.description}${state.missing.includes(part.id) ? ' Está declarada faltante.' : ''}`, 'info', { ...state, selectedPart: part.id }, part);
    }
    case 'mark_part_missing': {
      const id = normalizedPart as string;
      const installed = STEPS.filter(step => state.completed.includes(step.id) && step.parts.includes(id));
      if (installed.length) return finish(`${id} figura en pasos ya confirmados (${installed.map(step => step.id).join(', ')}). Primero deshacé esos pasos y sus dependencias; no se cambió el inventario.`, 'warning');
      if (state.missing.includes(id)) return finish(`${id} ya está declarada faltante.`, 'info');
      const next = { ...state, missing: [...state.missing, id], selectedPart: id };
      const available = plan(next).filter(step => step.status === 'available').map(step => step.id);
      return finish(`${id} marcada como faltante. ${available.length ? `Podés avanzar con ${available.length === 1 ? 'el paso' : 'los pasos'} ${available.join(', ')}.` : 'No hay pasos disponibles con los requisitos actuales.'} Las operaciones dependientes quedan bloqueadas.`, 'warning', next, { plan: plan(next) });
    }
    case 'restore_part': {
      const id = normalizedPart as string;
      if (!state.missing.includes(id)) return finish(`${id} ya figura disponible.`, 'info');
      const next = { ...state, missing: state.missing.filter(part => part !== id), selectedPart: id };
      return finish(`${id} recuperada. El plan se recalculó; cada paso conserva sus dependencias.`, 'success', next, { plan: plan(next) });
    }
    case 'set_tool_available': {
      if (!toolId(args.toolId) || typeof args.available !== 'boolean') return finish('Indicá una herramienta válida (hex o screwdriver) y available: true/false.', 'warning');
      const id = args.toolId;
      const next = { ...state, missingTools: args.available ? state.missingTools.filter(item => item !== id) : [...new Set([...state.missingTools, id])] };
      return finish(`${TOOLS.find(item => item.id === id)!.name}: ${args.available ? 'disponible' : 'no disponible'}. Plan actualizado.`, args.available ? 'success' : 'warning', next, { plan: plan(next) });
    }
    case 'get_available_steps':
    case 'recalculate_plan': {
      const entries = plan(state); const available = entries.filter(step => step.status === 'available');
      return finish(available.length ? `Podés hacer: ${available.map(step => `paso ${step.id} · ${step.title}`).join('; ')}. No omitas las condiciones de seguridad.` : state.completed.length === 8 ? 'Los 8 pasos están confirmados por vos. La resistencia física no ha sido verificada por la app.' : 'No hay pasos disponibles. Revisá las piezas y herramientas faltantes.', 'info', state, entries);
    }
    case 'select_step': {
      const step = STEPS.find(item => item.id === args.stepId)!;
      return finish(`Paso ${step.id}: ${step.description}`, 'info', { ...state, selectedStep: step.id, selectedPart: step.parts[0] ?? null }, plan(state).find(item => item.id === step.id));
    }
    case 'complete_step': {
      const step = plan(state).find(item => item.id === args.stepId)!;
      if (step.status === 'complete') return finish(`El paso ${step.id} ya está confirmado.`, 'info');
      if (step.status !== 'available') return finish(`No podés completar el paso ${step.id}. ${step.reasons.join(' ')}`, 'warning', state, step);
      if (args.confirmed !== true) return finish(`Confirmá que realizaste el paso ${step.id} y revisaste: ${step.safety}`, 'info', state, { requiresConfirmation: true, stepId: step.id });
      const next = { ...state, completed: [...state.completed, step.id].sort((a, b) => a - b), selectedStep: step.id, selectedPart: step.parts[0] ?? null };
      return finish(`Paso ${step.id} registrado como completado por vos. La app no verifica el montaje físico.`, 'success', next, { completedStep: step.id, plan: plan(next) });
    }
    case 'undo_step': {
      const id = args.stepId as number;
      if (!state.completed.includes(id)) return finish(`El paso ${id} aún no está completado.`, 'info');
      const affected = new Set([id]);
      let changed = true;
      while (changed) { changed = false; for (const step of STEPS) if (!affected.has(step.id) && step.dependencies.some(dependency => affected.has(dependency))) { affected.add(step.id); changed = true; } }
      const completedAffected = state.completed.filter(step => affected.has(step));
      if (completedAffected.length > 1 && args.cascade !== true) return finish(`Deshacer el paso ${id} también invalida los pasos ${completedAffected.filter(step => step !== id).join(', ')}. Confirmá la cascada para actualizar el registro.`, 'warning', state, { requiresCascade: true, affectedSteps: completedAffected });
      const next = { ...state, completed: state.completed.filter(step => !affected.has(step)), selectedStep: id };
      return finish(`Se retiró la confirmación de ${completedAffected.length === 1 ? 'el paso' : 'los pasos'} ${completedAffected.join(', ')}. Esto cambia el registro; no indica que debas desmontar físicamente el mueble.`, 'success', next, { affectedSteps: completedAffected });
    }
    case 'explain_blockage': {
      if (args.stepId !== undefined && !stepId(args.stepId)) return finish('Paso inválido. Elegí un número del 1 al 8.', 'warning');
      const entries = plan(state).filter(step => args.stepId === undefined ? step.status === 'blocked' : step.id === args.stepId);
      return finish(entries.length ? entries.map(step => `Paso ${step.id}: ${step.reasons.join(' ') || (step.status === 'complete' ? 'ya está completado.' : 'disponible.')}`).join('\n') : 'No hay pasos bloqueados por piezas o herramientas faltantes.', 'info', state, entries);
    }
    case 'get_safety_requirements': {
      if (args.stepId !== undefined && !stepId(args.stepId)) return finish('Paso inválido. Elegí un número del 1 al 8.', 'warning');
      const steps = STEPS.filter(step => args.stepId === undefined || step.id === args.stepId);
      return finish(steps.map(step => `Paso ${step.id}: ${step.safety}`).join('\n'), 'info', state, steps.map(({ id, safety }) => ({ id, safety })));
    }
    case 'save_progress': return finish('Progreso preparado para guardar. La interfaz confirma por separado si el almacenamiento tuvo éxito.', 'info', state, { serialized: serializeState(state) });
    case 'restore_progress': {
      try {
        const restored = restoreState(args.serialized as string);
        // Keep the local audit trail chronological; imported history remains in the source file.
        return finish('Progreso validado e importado. Plan recalculado.', 'success', { ...restored, revision: state.revision, history: state.history }, { plan: plan(restored) });
      } catch (error) { return finish(error instanceof Error ? error.message : 'No se pudo importar el progreso.', 'warning'); }
    }
    default: return finish(`Herramienta desconocida: ${String(tool).slice(0, 80)}. No se modificó el montaje.`, 'warning');
  }
}
