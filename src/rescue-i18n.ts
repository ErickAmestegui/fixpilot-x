import { getAssembly, type AssemblyState, type Step } from './engine';
export type RescueLanguage = 'en' | 'es';
type TextStep = Pick<Step, 'title' | 'description' | 'safety'>;
const table: TextStep[] = [
{title:'Prepare the base',description:'Place D1 on a protected, flat surface with its joining holes accessible. Identify its edges and separate the fasteners.',safety:'Use a stable, clear work surface. This prototype does not replace manufacturer instructions.'},
{title:'Install the side panels',description:'Align B1 and B2 with the holes in D1. Hold each panel while fitting S1 connectors. Keep the assembly supported.',safety:'Support panels until secured. Do not load the assembly or leave it standing unsupported before B7 is installed.'},
{title:'Install the center shelf',description:'With the assembly supported, align C1 between B1 and B2 and secure it with S1 brackets. This can be done while B7 is missing.',safety:'Keep the side panels supported and hands clear of joints. Do not load the shelf.'},
{title:'Secure rear brace B7',description:'Fit B7 horizontally between the side panels at the rear, below the future top. Use S1 fasteners.',safety:'B7 is structural. Do not install the top if it is missing or damaged. Do not improvise a replacement.'},
{title:'Install the top panel',description:'Align A1 over the secured sides and brace. Fit its S1 connectors and tighten carefully.',safety:'Manually check C1 and B7 joints before placing A1. Do not overtighten.'},
{title:'Prepare the four feet',description:'On the work surface, prepare F1 plates and protectors with S1. Leave all four feet separate, ready to attach.',safety:'Prepare the feet separately. Do not turn or try to hold the incomplete furniture to fit them.'},
{title:'Attach feet to the base',description:'With the complete assembly safely supported on a protected surface, attach the prepared feet at the D1 mounting points.',safety:'Ask for help moving the assembly if needed. Never work beneath furniture held by hand.'},
{title:'Final inspection',description:'Place the furniture on a flat floor. Manually check every joint, all four foot contacts and any unexpected movement.',safety:'The app records your confirmation; it does not verify physical strength. Do not climb on it, use it as a seat or load it without a validated capacity.'}
];
const organizer: TextStep[] = [
{title:'Prepare the base',description:'Place O1 on a protected surface and identify the frame mounting holes.',safety:'Use a flat, clear table. This is an original demonstration design.'},
{title:'Attach the side frames',description:'Align O2 and O3 with O1 and secure them with H1 connectors and the Allen key.',safety:'Hold each frame while joining it. Keep the assembly supported and unloaded.'},
{title:'Install the upper shelf',description:'Align O4 between the frames and secure it with H1 connectors and the Allen key.',safety:'Hold the shelf while tightening. Do not overtighten or place objects on it yet.'},
{title:'Secure the rear bar',description:'Position O5 behind the assembly below the shelf. Attach it with H1 screws and the screwdriver.',safety:'The bar belongs to the complete design. Do not omit it or improvise fasteners.'},
{title:'Prepare the felt pads',description:'Separate the four O6 pads and check their adhesive. Prepare them without moving the incomplete assembly.',safety:'Prepare the pads separately and retain their backing films until installation.'},
{title:'Fit felt pads and inspect',description:'With the complete assembly safely supported, fit O6 underneath O1. Place it on the desk and check the joints and support.',safety:'The app records your inspection; it does not verify physical strength. Do not climb on it, use it as a seat or load it without a validated capacity.'}
];
const names: Record<string,string>={D1:'Bottom base',B1:'Left side panel',B2:'Right side panel',C1:'Center shelf',B7:'Structural rear brace',A1:'Top panel',F1:'Four-foot set',S1:'Assembly fasteners',O1:'Organizer base',O2:'Left side frame',O3:'Right side frame',O4:'Upper bridge shelf',O5:'Rear retaining bar',O6:'Felt pad set',H1:'Organizer fasteners',hex:'Allen key',screwdriver:'Screwdriver'};
export function resourceName(id:string,state:AssemblyState,lang:RescueLanguage):string {const schema=getAssembly(state);return lang==='en'?names[id]??id:[...schema.parts,...schema.tools].find(p=>p.id===id)?.name??id;}
export function localizedStep(step:Step,state:AssemblyState,lang:RescueLanguage):Step {return lang==='es'?step:{...step,...(getAssembly(state).id==='organizer'?organizer:table)[step.id-1]};}
export function assemblyTitle(id:string,lang:RescueLanguage):string{return lang==='en'?(id==='organizer'?'Desktop organizer':'Modular side table'):getAssembly(id).title;}
export function statusLabel(status:string,lang:RescueLanguage):string{return ({en:{complete:'Confirmed',available:'Available',blocked:'Blocked',pending:'Waiting'},es:{complete:'Confirmado',available:'Disponible',blocked:'Bloqueado',pending:'Pendiente'}}[lang] as Record<string,string>)[status]??status;}
export function errorLabel(code:string,lang:RescueLanguage):string {
 const messages:Record<string,[string,string]>={
 STALE_BASE:['The actual project changed. Preview again before applying.','El proyecto real cambió. Volvé a previsualizar antes de aplicar.'],
 CONFIRMATION_REQUIRED:['Review and explicitly confirm the proposal before applying.','Revisá y confirmá explícitamente la propuesta antes de aplicar.'],
 INVALID_RESOURCE:['Use unique resource IDs from this project catalog.','Usá códigos de recurso únicos de este catálogo.'],
 CONTRADICTORY_CHANGES:['A resource cannot be both missing and recovered in one proposal.','Un recurso no puede estar ausente y recuperado en la misma propuesta.'],
 INVALID_SCENARIOS:['Provide two or more valid scenario configurations with unique names.','Indicá dos o más configuraciones válidas con nombres únicos.'],
 INVALID_STEP:['Choose a valid step from the current project.','Elegí un paso válido del proyecto actual.'],
 INVALID_CHANGES:['The scenario configuration is invalid. Review the resource and undo selections.','La configuración del escenario es inválida. Revisá los recursos y pasos a retirar.'],
 INVALID_ARGUMENTS:['The tool arguments are invalid. Review the request and retry.','Los argumentos de la herramienta son inválidos. Revisá la solicitud y reintentá.'],
 INVALID_STATE:['The project state is invalid. Restore a valid checkpoint before continuing.','El estado del proyecto es inválido. Recuperá un checkpoint válido antes de continuar.'],
 REVISION_LIMIT:['The project revision limit was reached. Preserve a checkpoint before continuing.','Se alcanzó el límite de revisiones del proyecto. Conservá un checkpoint antes de continuar.'],
 INVALID_RESULT:['The resulting state failed validation. The scenario was not applied.','El estado resultante no superó la validación. No se aplicó el escenario.'],
 NO_CHANGES:['This proposal makes no actual changes. Edit the draft to propose a different scenario.','Esta propuesta no produce cambios reales. Editá el borrador para proponer otro escenario.']
 };return messages[code]?.[lang==='en'?0:1]??(lang==='en'?'The request was refused. No scenario was applied. Review the proposal and preview again.':'La solicitud fue rechazada. No se aplicó el escenario. Revisá la propuesta y volvé a previsualizar.');
}
