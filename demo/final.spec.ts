import {test,expect,type Page} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {startMcpServer} from '../server/mcp';

// Observer-only overlays: captions and a summary of actual browser HTTP responses.
// Assembly state changes exclusively through the product's UI and MCP tools.
async function caption(page:Page,text:string,seconds=4){
  await page.evaluate(text=>{
    let layer=document.getElementById('demo-subtitles');
    if(!layer){layer=document.createElement('div');layer.id='demo-subtitles';Object.assign(layer.style,{position:'fixed',bottom:'0',left:'0',right:'0',zIndex:'10000',background:'#102d42f5',color:'#fff',padding:'18px 42px',font:'500 23px/1.45 system-ui',textAlign:'center',pointerEvents:'none',borderTop:'3px solid #00a9e8'});document.body.append(layer);}
    layer.textContent=text;
  },text);
  await page.waitForTimeout(seconds*1000);
}
async function send(page:Page,text:string){const box=page.getByRole('textbox',{name:'Escribí un comando'});await box.fill(text);await box.press('Enter');await expect(box).toHaveValue('');await expect(box).toBeEnabled();}
async function complete(page:Page,id:number){await page.getByRole('button',{name:new RegExp(`^Paso ${id}:`)}).click();await page.getByRole('button',{name:'Ya completé este paso',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'Confirmar',exact:true}).click();await expect(page.getByRole('button',{name:new RegExp(`^Paso ${id}:`)})).toHaveAccessibleName(/Completado$/);await page.waitForTimeout(150);}

test('record final competition demo from real UI and actual MCP responses',async({page})=>{
  const service=await startMcpServer(3101),video=page.video()!;
  const observed:{method:string;tool?:string;status:number;protocol?:string;sessionIssued?:boolean;toolCount?:number;completed?:number[];missing?:string[];isError?:boolean}[]=[];
  const pending:Promise<void>[]=[];
  page.on('response',response=>{
    if(response.url()!==service.url||response.request().method()!=='POST')return;
    pending.push((async()=>{try{
      const request=response.request().postDataJSON(),body=await response.json();
      if(!request.method||!body.result)return;
      const result=body.result,state=result.structuredContent?.state;
      observed.push({method:request.method,...(request.params?.name?{tool:request.params.name}:{}),status:response.status(),...(request.method==='initialize'?{protocol:result.protocolVersion,sessionIssued:!!response.headers()['mcp-session-id']}:{}),...(result.tools?{toolCount:result.tools.length}:{}),...(state?{completed:state.completed,missing:state.missing}:{}),...(request.method==='tools/call'?{isError:result.isError===true}:{})});
    }catch{/* Notifications and event-stream responses have no JSON result. */}})());
  });
  try{
    const began=Date.now();await page.goto('/');
    await caption(page,'FIXPILOT X · The manual that adapts to you. A simulated Alexa+ experience with real 3D assembly and tools.',6);
    await page.getByRole('button',{name:'Configuración',exact:true}).click();const settings=page.getByRole('dialog');await settings.locator('summary').click();await settings.getByRole('button',{name:'Conectar servidor local',exact:true}).click();await expect(settings.getByRole('status')).toContainText('MCP conectado · 18 herramientas');
    await Promise.all(pending);expect(observed.find(x=>x.method==='initialize')).toMatchObject({protocol:'2025-11-25',sessionIssued:true,status:200});expect(observed.find(x=>x.method==='tools/list')?.toolCount).toBe(18);
    await caption(page,'A genuine local MCP session: Streamable HTTP, protocol initialization, discovery and 18 callable tools.',6);await page.keyboard.press('Escape');
    await complete(page,1);await complete(page,2);
    await caption(page,'The 3D model follows confirmed progress. User confirmation records a report; it does not inspect physical work.',5);
    await send(page,'Mostrame B7');await send(page,'¿Por qué la necesito?');
    await caption(page,'“Show me B7. Why do I need it?” Context selects the structural brace and explains its role.',5);
    await send(page,'Me falta esa pieza');await expect(page.getByRole('button',{name:/^Paso 4:/})).toHaveAccessibleName(/Bloqueado$/);
    await caption(page,'“I am missing that part.” A real mark_part_missing call changes inventory. The red ghost means absent, not installed.',6);
    await Promise.all(pending);const missing=observed.find(x=>x.tool==='mark_part_missing');expect(missing).toMatchObject({status:200,missing:['B7'],completed:[1,2],isError:false});
    await page.evaluate(proof=>{const card=document.createElement('pre');card.id='demo-http-proof';card.textContent='OBSERVED MCP HTTP RESPONSES\n\n'+JSON.stringify(proof,null,2);Object.assign(card.style,{position:'fixed',top:'130px',left:'calc(50% - 300px)',width:'600px',zIndex:'9999',background:'#102d42fa',color:'#fff',border:'2px solid #00a9e8',borderRadius:'16px',padding:'24px',font:'19px/1.4 monospace',boxShadow:'0 12px 60px #0004',pointerEvents:'none'});document.body.append(card);},{protocol:observed.find(x=>x.method==='initialize')?.protocol,transport:'Streamable HTTP',toolsDiscovered:18,tool:missing!.tool,httpStatus:missing!.status,missing:missing!.missing,completed:missing!.completed});
    await caption(page,'This observer panel displays captured HTTP responses from this run. No assembly state is injected by the recorder.',7);await page.evaluate(()=>document.getElementById('demo-http-proof')?.remove());
    await page.getByRole('button',{name:'How FixPilot Thinks',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('mark_part_missing');
    await caption(page,'The Plan Inspector exposes the actual tool, arguments and dependency changes: steps 4, 5, 7 and 8 are blocked.',7);
    await mkdir('docs/screenshots/final',{recursive:true});await page.screenshot({path:'docs/screenshots/final/b7-inspector.png'});await page.keyboard.press('Escape');
    await send(page,'Bueno, avancemos con otra cosa');await caption(page,'“Let us do something else.” The planner finds available work from the current graph, rather than skipping requirements.',5);await complete(page,3);await complete(page,6);
    await caption(page,'The shelf and separate foot preparation are valid independent steps. Their completed progress is preserved.',5);
    await send(page,'Encontré B7');await expect(page.getByRole('button',{name:/^Paso 4:/})).toHaveAccessibleName(/Disponible$/);
    await caption(page,'“I found B7.” restore_part updates inventory. Step 4 unlocks; downstream operations still require their prerequisites.',6);
    for(const id of [4,5,7,8])await complete(page,id);await expect(page.getByText('8 de 8 pasos completados',{exact:true})).toBeVisible();
    await caption(page,'8/8. Every completion passed validation through real MCP calls. This is a software demonstration, not structural certification.',5);
    await page.getByRole('button',{name:'Mi proyecto',exact:true}).click();await page.getByRole('button',{name:'Abrir Organizador de escritorio',exact:true}).click();
    await caption(page,'A second original assembly uses the same planner. Switching projects saves progress and returns to the browser engine.',5);
    await complete(page,1);await page.getByRole('button',{name:/^Paso 2:/}).click();await send(page,'No tengo la llave necesaria para este paso');await expect(page.getByRole('button',{name:/^Paso 2:/})).toHaveAccessibleName(/Bloqueado$/);
    await caption(page,'“I do not have the tool for this step.” Context identifies the Allen key. Dependent work is blocked; felt-pad preparation remains available.',6);await complete(page,5);
    await caption(page,'Complete independent step 5 while the tool is missing. Recovery will preserve this work.',5);await send(page,'Encontré la llave Allen');
    for(const id of [2,3,4,6])await complete(page,id);await expect(page.getByText('6 de 6 pasos completados',{exact:true})).toBeVisible();
    await caption(page,'Tool recovered. The organizer reaches 6/6 through the same validated engine. No hard-coded B7-only workflow.',5);
    await page.screenshot({path:'docs/screenshots/final/organizer-completed.png'});
    await page.getByRole('button',{name:'Mi proyecto',exact:true}).click();await page.getByRole('button',{name:'Abrir Mesa auxiliar modular',exact:true}).click();await expect(page.getByText('8 de 8 pasos completados',{exact:true})).toBeVisible();
    await caption(page,'Back to the table: still 8/8. Browser persistence is independent per project; MCP sessions are in memory.',5);
    await caption(page,'Alexa+ is simulated. MCP and assembly tools are real. No Echo, private Amazon SDK, paid AI API or AWS service is connected.',6);
    await caption(page,'Code and reproduction: github.com/ErickAmestegui/fixpilot-x · Original geometry · MIT license · FixPilot X',Math.max(5,(132000-(Date.now()-began))/1000));
    await Promise.all(pending);expect(observed.filter(x=>x.method==='tools/call').length).toBeGreaterThan(15);expect(observed.find(x=>x.tool==='restore_part')?.missing).toEqual([]);
    await writeFile(path.resolve('..','fixpilot-x-final-mcp-evidence.json'),JSON.stringify({recordedAt:new Date().toISOString(),source:'Observed browser HTTP responses during the unmodified application workflow',exchanges:observed},null,2));
    await page.close();await video.saveAs(path.resolve('..','fixpilot-x-final-demo.webm'));
  }finally{await service.close();}
});
