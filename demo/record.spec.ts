import {test,expect,type Page} from '@playwright/test';
import path from 'node:path';

// Reproducible recording of real UI operations. Only the English subtitle layer is added by this recorder.
async function caption(page:Page,text:string,seconds=3){await page.evaluate(text=>{
  let layer=document.getElementById('demo-subtitles');
  if(!layer){layer=document.createElement('div');layer.id='demo-subtitles';layer.setAttribute('role','note');Object.assign(layer.style,{position:'fixed',bottom:'0',left:'0',right:'0',zIndex:'10000',background:'#193c4ff5',color:'#fff',padding:'12px 30px',font:'16px system-ui',textAlign:'center',lineHeight:'1.45',pointerEvents:'none'});document.body.append(layer);}
  layer.textContent=text;
},text);await page.waitForTimeout(seconds*1000);}
async function send(page:Page,text:string){const box=page.getByRole('textbox',{name:'Escribí un comando'});await box.fill(text);await box.press('Enter');await expect(box).toHaveValue('');await expect(box).toBeEnabled();}
async function complete(page:Page,id:number){await page.getByRole('button',{name:new RegExp(`^Paso ${id}:`)}).click();await page.getByRole('button',{name:'Ya completé este paso',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'Confirmar',exact:true}).click();await expect(page.getByRole('button',{name:new RegExp(`^Paso ${id}:`)})).toHaveAccessibleName(/Completado$/);await page.waitForTimeout(900);}

test('record an authentic V2 competition demonstration with complete English subtitles',async({page})=>{
  const video=page.video()!;
  await page.goto('/');
  await caption(page,'FixPilot X — The manual that adapts to you. A simulated Alexa+ experience with real assembly tools.',4);
  await complete(page,1);await complete(page,2);
  await caption(page,'The original 3D model follows confirmed progress. A confirmation records my report, not a physical inspection.',3);
  await send(page,'Mostrame B7');await send(page,'¿Por qué la necesito?');
  await caption(page,'“Show me B7. Why do I need it?” Context resolves the active structural brace.',4);
  await send(page,'Me falta esa pieza');
  await caption(page,'“I am missing that part.” The dependency engine blocks steps 4, 5, 7 and 8. Independent work remains available.',5);
  await page.getByRole('button',{name:'How FixPilot Thinks',exact:true}).click();
  await caption(page,'Plan Inspector shows the actual request, tool arguments, affected dependencies and before/after state.',5);
  await page.keyboard.press('Escape');await send(page,'Bueno, avancemos con otra cosa');await complete(page,3);
  await caption(page,'“Let us do something else.” The shelf is valid independent work, calculated from the current graph.',4);
  await send(page,'Encontré B7');await page.getByRole('button',{name:/^Paso 4:/}).click();await send(page,'No tengo la llave necesaria para este paso');
  await caption(page,'A second disruption: “I do not have the tool for this step.” The active step identifies the Allen key.',5);
  await complete(page,6);
  await caption(page,'Preparing the feet needs another tool, so it remains available. Completed work is preserved.',4);
  await send(page,'Encontré la llave Allen');await complete(page,4);await complete(page,5);await complete(page,7);await complete(page,8);
  await expect(page.getByText('8 de 8 pasos completados',{exact:true})).toBeVisible();
  await caption(page,'Tool recovered. Requirements still apply. The assembly reaches 8/8 with a consistent, persistent state.',4);
  await page.getByRole('button',{name:'Mi proyecto',exact:true}).click();await page.getByRole('button',{name:'Abrir Organizador de escritorio',exact:true}).click();
  await caption(page,'The same planner powers a different original six-step organizer. Each project has its own saved progress.',5);
  await complete(page,1);await page.getByRole('button',{name:/^Paso 2:/}).click();await send(page,'No tengo la llave Allen');await complete(page,5);
  await caption(page,'Different graph, same tools: prepare the felt pads while the Allen key is unavailable.',5);
  await page.getByRole('button',{name:'Mi proyecto',exact:true}).click();await page.getByRole('button',{name:'Abrir Mesa auxiliar modular',exact:true}).click();
  await expect(page.getByText('8 de 8 pasos completados',{exact:true})).toBeVisible();
  await caption(page,'Your valid work stays saved. Native Alexa+ is not connected; the optional local MCP implementation is genuine.',5);
  await caption(page,'Source and reproduction instructions: github.com/ErickAmestegui/fixpilot-x · FixPilot X',4);
  await page.close();await video.saveAs(path.resolve('..','fixpilot-x-v2-demo.webm'));
});
