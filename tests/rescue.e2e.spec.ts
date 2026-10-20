import {test,expect,type Page} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {startMcpServer} from '../server/mcp';
const KEY='fixpilot-x:assembly:v1';
const raw=(page:Page,key=KEY)=>page.evaluate(key=>localStorage.getItem(key),key);
async function state(page:Page){return JSON.parse((await raw(page))??'{}');}
async function ask(page:Page,text:string){const fallback=page.locator('.rescue-deterministic');if(await fallback.getAttribute('open')===null)await fallback.locator('summary').click();await page.getByLabel('Ask a bounded scenario question',{exact:true}).fill(text);await page.getByRole('button',{name:'Explore',exact:true}).click();await expect(page.getByRole('button',{name:'Preview scenario',exact:true})).toBeEnabled();}
async function resources(page:Page,language='en'){const summary=page.locator('summary').filter({hasText:language==='en'?'Resource controls':'Controles de recursos'});if(await summary.locator('..').getAttribute('open')===null)await summary.click();}
async function complete(page:Page,id:number){await page.getByRole('button',{name:new RegExp(`^${id}\\. `)}).click();await page.getByRole('button',{name:'Confirm actual step',exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog.getByRole('button',{name:'Confirm change',exact:true})).toBeDisabled();await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'Confirm change',exact:true}).click();await expect(dialog).not.toBeVisible();expect((await state(page)).completed).toContain(id);}
async function approve(page:Page){await expect(page.getByRole('button',{name:'Apply reviewed scenario',exact:true})).toBeDisabled();await page.getByRole('checkbox',{name:/I reviewed the resource changes/}).check();await page.getByRole('button',{name:'Apply reviewed scenario',exact:true}).click();await expect(page.getByText('Reviewed proposal applied. The actual project below is authoritative.',{exact:true})).toBeVisible();}

test('Rescue hypotheses stay detached, compare, cancel, apply and partially recover without lost work',async({page})=>{
  await page.goto('/?rescue');await complete(page,1);await complete(page,2);const before=await raw(page);
  await ask(page,"What if I'm missing B7 and my screwdriver?");await expect(page.locator('.rescue-mode-label')).toContainText('HYPOTHETICAL');await expect(page.getByRole('button',{name:'B7: Structural rear brace, missing part',exact:true})).toHaveClass(/is-missing/);
  expect(await raw(page)).toBe(before);await expect(page.locator('.rescue-results .rescue-metrics div').filter({hasText:'Hypothetical available'}).locator('dd')).toHaveText('3');
  await ask(page,'Why is step 5 blocked?');await expect(page.getByRole('heading',{name:'Hypothetical recovery requirements · step 5',exact:true})).toBeVisible();expect(await raw(page)).toBe(before);
  await ask(page,'Compare missing B7 versus missing B7 and screwdriver');await expect(page.getByRole('heading',{name:'Scenario comparison · same actual base',exact:true})).toBeVisible();expect(await raw(page)).toBe(before);
  await mkdir('docs/screenshots/rescue',{recursive:true});await page.screenshot({path:'docs/screenshots/rescue/hypothetical.png',fullPage:true});
  await page.getByRole('button',{name:'Cancel preview',exact:true}).click();expect(await raw(page)).toBe(before);await expect(page.locator('.rescue-mode-label')).toContainText('ACTUAL');
  await page.getByRole('button',{name:'Preview scenario',exact:true}).click();await approve(page);expect((await state(page)).missing).toEqual(['B7']);expect((await state(page)).missingTools).toEqual(['screwdriver']);expect((await state(page)).completed).toEqual([1,2]);
  await complete(page,3);await ask(page,'Show me what changes if I recover B7.');expect((await state(page)).missing).toEqual(['B7']);await approve(page);const recovered=await state(page);expect(recovered.missing).toEqual([]);expect(recovered.missingTools).toEqual(['screwdriver']);expect(recovered.completed).toEqual([1,2,3]);expect(recovered.history.at(-1).tool).toBe('apply_scenario');
  await resources(page);await page.getByLabel('Scenario A1',{exact:true}).selectOption('missing');await page.getByRole('button',{name:'Preview scenario',exact:true}).click();await complete(page,4);await expect(page.getByRole('alert').filter({hasText:'Stale preview'})).toBeVisible();await expect(page.getByRole('button',{name:'Apply reviewed scenario',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Cancel preview',exact:true}).click();
  const table=await raw(page);await page.getByLabel('Saved project',{exact:true}).selectOption('organizer');const organizerBefore=await raw(page,'fixpilot-x:assembly:v1:organizer');await resources(page);await page.getByLabel('Scenario O4',{exact:true}).selectOption('missing');await page.getByRole('button',{name:'Preview scenario',exact:true}).click();expect(await raw(page)).toBe(table);expect(await raw(page,'fixpilot-x:assembly:v1:organizer')).toBe(organizerBefore);
});

test('Rescue browser uses real MCP and recovers from a transport failure without partial apply',async({page})=>{
  const service=await startMcpServer(3101);try{
    await page.goto('/?rescue');await complete(page,1);await complete(page,2);await page.getByRole('button',{name:'Connect local MCP',exact:true}).click();await expect(page.getByText('Real MCP connected',{exact:true})).toBeVisible();const before=await raw(page);
    await page.route(service.url,async route=>{const req=route.request();if(req.method()==='POST'&&req.postDataJSON()?.params?.name==='preview_scenario')await route.fulfill({status:500,contentType:'application/json',body:'{"error":"Deliberate test outage"}'});else await route.continue();});
    await ask(page,'What if missing B7?');await expect(page.getByRole('alert')).toContainText('No response');expect(await raw(page)).toBe(before);
    await page.unroute(service.url);await page.getByRole('button',{name:'Preview scenario',exact:true}).click();await expect(page.locator('.rescue-mode-label')).toContainText('HYPOTHETICAL');expect(await raw(page)).toBe(before);await approve(page);expect((await state(page)).missing).toEqual(['B7']);
    await page.screenshot({path:'docs/screenshots/rescue/approved-mcp.png',fullPage:true});await page.close();
  }finally{await service.close();}
});

test('Rescue English instructions, Spanish switch, invalid route and mobile keyboard controls are consistent',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?rescue');await expect(page.getByRole('heading',{name:'1. Prepare the base',exact:true})).toBeVisible();await expect(page.getByText('Use a stable, clear work surface. This prototype does not replace manufacturer instructions.',{exact:false})).toBeVisible();
  await expect(page.getByRole('button',{name:'Confirm actual step',exact:true})).toBeEnabled();await page.getByRole('button',{name:/^5\. /}).click();await expect(page.getByRole('button',{name:'Confirm actual step',exact:true})).toBeDisabled();
  const before=await raw(page);await ask(page,'What if missing B7 and X999?');expect(await raw(page)).toBe(before);await expect(page.getByRole('status')).toContainText('clarification');
  await page.getByLabel('Language',{exact:true}).selectOption('es');await expect(page.getByRole('heading',{name:'5. Colocar panel superior',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Confirmar paso real',exact:true})).toBeDisabled();await expect(page.getByText('Verificá manualmente las uniones de C1 y B7 antes de apoyar A1. No aprietes en exceso.',{exact:false})).toBeVisible();
  await resources(page,'es');await page.getByLabel('Escenario B7',{exact:true}).selectOption('missing');await page.getByRole('button',{name:'Previsualizar escenario',exact:true}).click();await expect(page.locator('.rescue-mode-label')).toContainText('HIPOTÉTICO');expect(await raw(page)).toBe(before);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.screenshot({path:'docs/screenshots/rescue/mobile-spanish.png',fullPage:true});
});

test('main conversation opens a non-mutating rescue preview and keyboard approval can be canceled',async({page})=>{
  await page.goto('/');const before=await raw(page);const box=page.getByRole('textbox',{name:'Escribí un comando',exact:true});await box.fill("What if I'm missing B7 and my screwdriver?");await box.press('Enter');await expect(page.locator('.rescue-mode-label')).toContainText('HYPOTHETICAL');expect(await raw(page)).toBe(before);
  await page.getByRole('button',{name:'Cancel preview',exact:true}).click();await page.getByRole('button',{name:/^1\. /}).click();await page.getByRole('button',{name:'Confirm actual step',exact:true}).focus();await page.keyboard.press('Enter');const dialog=page.getByRole('dialog');await expect(dialog.getByRole('checkbox')).toBeFocused();await page.keyboard.press('Space');await expect(dialog.getByRole('button',{name:'Confirm change',exact:true})).toBeEnabled();await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();expect(await raw(page)).toBe(before);await expect(page.locator('canvas[role="img"]')).toHaveCount(1);
});
