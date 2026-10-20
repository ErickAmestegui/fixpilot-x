import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { startMcpServer } from '../server/mcp';

const STORE = 'fixpilot-x:assembly:v1';
const PREFS = 'fixpilot-x:preferences:v1';
const step = (page: Page, id: number) => page.getByRole('button', { name: new RegExp(`^Paso ${id}:`) });

async function send(page: Page, text: string) {
  const input = page.getByRole('textbox', { name: 'Escribí un comando' });
  await input.fill(text);
  await input.press('Enter');
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue('');
}

async function complete(page: Page, id: number) {
  await step(page, id).click();
  const action = page.getByRole('button', { name: 'Ya completé este paso', exact: true });
  await expect(action).toBeEnabled();
  await action.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: `Confirmar paso ${id}`, exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Confirmar', exact: true })).toBeDisabled();
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(step(page, id)).toHaveAccessibleName(/Completado$/);
}

async function storedState(page: Page): Promise<{ completed: number[]; missing: string[]; selectedPart: string | null; history: { tool: string }[] }> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), STORE);
}

async function settleCanvas(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

test('a missing B7 replans real work, independent steps remain possible, recovery completes and persists', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Mesa auxiliar modular' })).toBeVisible();
  await expect(step(page, 1)).toHaveAccessibleName(/Disponible$/);
  await expect(step(page, 2)).toHaveAccessibleName(/Pendiente$/);

  await complete(page, 1);
  await complete(page, 2);
  await send(page, 'Me falta B7');
  await expect(step(page, 4)).toHaveAccessibleName(/Bloqueado$/);
  await expect(step(page, 5)).toHaveAccessibleName(/Bloqueado$/);
  await expect(step(page, 3)).toHaveAccessibleName(/Disponible$/);
  await expect(step(page, 6)).toHaveAccessibleName(/Disponible$/);
  await expect(page.getByRole('button', { name: 'B7: Travesaño posterior, pieza faltante' })).toHaveClass(/is-missing/);

  await send(page, 'Completé el paso 4');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(step(page, 4)).toHaveAccessibleName(/Bloqueado$/);
  expect((await storedState(page)).completed).toEqual([1, 2]);
  await send(page, '¿Qué puedo hacer mientras tanto?');
  await expect(page.getByRole('log')).toContainText(/3/);
  await expect(page.getByRole('log')).toContainText(/6/);

  await complete(page, 3);
  await page.getByRole('button', { name: 'Despiece', exact: true }).click();
  await page.getByRole('button', { name: 'B7: Travesaño posterior, pieza faltante' }).click();
  await settleCanvas(page);
  await mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: 'docs/screenshots/desktop.png', fullPage: true });
  await complete(page, 6);
  await expect(step(page, 4)).toHaveAccessibleName(/Bloqueado$/);
  expect((await storedState(page)).completed).toEqual([1, 2, 3, 6]);
  await send(page, 'Encontré B7');
  await expect(step(page, 4)).toHaveAccessibleName(/Disponible$/);
  await expect(page.getByRole('button', { name: 'B7: Travesaño posterior', exact: true })).not.toHaveClass(/is-missing/);
  await complete(page, 4);
  await complete(page, 5);
  await complete(page, 7);
  await complete(page, 8);
  await expect(page.getByText('8 de 8 pasos completados', { exact: true })).toBeVisible();
  const beforeReload = await storedState(page);
  expect(beforeReload.completed).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(beforeReload.missing).toEqual([]);
  expect(beforeReload.history.some(entry => entry.tool === 'mark_part_missing')).toBe(true);
  expect(beforeReload.history.some(entry => entry.tool === 'restore_part')).toBe(true);
  await page.screenshot({ path: 'docs/screenshots/completed.png', fullPage: true });
  await send(page, 'Me falta B7');
  await expect(page.getByRole('log')).toContainText('Primero deshacé');
  expect((await storedState(page)).completed).toEqual(beforeReload.completed);
  expect((await storedState(page)).missing).toEqual([]);

  await page.reload();
  await expect(page.getByText('8 de 8 pasos completados', { exact: true })).toBeVisible();
  expect((await storedState(page)).completed).toEqual(beforeReload.completed);
  await page.getByRole('button', { name: 'Repetir animación' }).click();
  await settleCanvas(page);
  expect((await storedState(page)).completed).toEqual(beforeReload.completed);
  await page.getByRole('button', { name: 'Ver actividad', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('mark_part_missing');
  await expect(page.getByRole('dialog')).toContainText('restore_part');
});

test('browser initializes, discovers and invokes real MCP tools without losing local progress', async ({ page }) => {
  const service = await startMcpServer(3101);
  try {
    await page.goto('/');
    await complete(page, 1);
    await page.getByRole('button', { name: 'Configuración', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('summary').click();
    await dialog.getByRole('button', { name: 'Conectar servidor local', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('MCP conectado · 22 herramientas');
    await page.keyboard.press('Escape');
    await send(page, 'Me falta B7');
    expect((await storedState(page)).completed).toEqual([1]);
    expect((await storedState(page)).missing).toEqual(['B7']);
    await expect(step(page, 4)).toHaveAccessibleName(/Bloqueado$/);
    await send(page, 'Encontré B7');
    expect((await storedState(page)).completed).toEqual([1]);
    expect((await storedState(page)).missing).toEqual([]);
    await page.getByRole('button', { name: 'Configuración', exact: true }).click();
    await dialog.locator('summary').click();
    await dialog.getByRole('button', { name: 'Volver al motor local', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('Motor local');
  } finally { await service.close(); }
});

test('V2 contextual conversation explains hypotheticals, replans missing tools and safely reviews prior work',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await complete(page,1);await complete(page,2);
  await send(page,'Mostrame B7');await send(page,'¿Por qué la necesito?');await expect(page.getByRole('log')).toContainText('Travesaño estructural');
  await send(page,'¿Y si no la tengo?');expect((await storedState(page)).missing).toEqual([]);
  await send(page,'Me falta esa pieza');expect((await storedState(page)).missing).toEqual(['B7']);
  await send(page,'Bueno, avancemos con otra cosa');await expect(step(page,3)).toHaveAccessibleName(/Disponible$/);
  await send(page,'Ya la encontré');expect((await storedState(page)).missing).toEqual([]);expect((await storedState(page)).completed).toEqual([1,2]);
  await step(page,3).click();await send(page,'No tengo la llave necesaria para este paso');await expect(step(page,3)).toHaveAccessibleName(/Bloqueado$/);await expect(step(page,6)).toHaveAccessibleName(/Disponible$/);
  await complete(page,6);await send(page,'Encontré la llave Allen');await expect(step(page,3)).toHaveAccessibleName(/Disponible$/);
  await page.getByRole('button',{name:'How FixPilot Thinks',exact:true}).click();let dialog=page.getByRole('dialog');await expect(dialog).toContainText('Antes');await expect(dialog).toContainText('Después');await expect(dialog).toContainText('set_tool_available');await expect(dialog).toContainText('No tengo la llave necesaria para este paso');await page.keyboard.press('Escape');
  await complete(page,3);await send(page,'Coloqué mal el panel lateral');dialog=page.getByRole('dialog');await expect(dialog).toContainText('registro digital');expect((await storedState(page)).completed).toEqual([1,2,3,6]);await dialog.getByRole('button',{name:'Cancelar',exact:true}).click();expect((await storedState(page)).completed).toEqual([1,2,3,6]);
  await send(page,'Coloqué mal el panel lateral');await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'Confirmar',exact:true}).click();expect((await storedState(page)).completed).toEqual([1,6]);await expect(step(page,2)).toHaveAccessibleName(/Disponible$/);
});

test('V2 organizer completes with independent work, retains separate progress and displays absent parts honestly',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await complete(page,1);
  const choose=async(title:string)=>{await page.getByRole('button',{name:'Mi proyecto',exact:true}).click();await page.getByRole('button',{name:`Abrir ${title}`,exact:true}).click();await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();};
  await choose('Organizador de escritorio');await complete(page,1);await step(page,2).click();await send(page,'No tengo la llave necesaria para este paso');await expect(step(page,2)).toHaveAccessibleName(/Bloqueado$/);await expect(step(page,5)).toHaveAccessibleName(/Disponible$/);await complete(page,5);
  await send(page,'Encontré la llave Allen');await complete(page,2);await complete(page,3);await send(page,'Me falta O5');await expect(step(page,4)).toHaveAccessibleName(/Bloqueado$/);
  await page.getByRole('button',{name:'Vista final',exact:true}).click();const absent=page.getByRole('button',{name:'O5: Barra posterior, pieza faltante',exact:true});await expect(absent).toContainText('ausente');await expect(absent).toHaveClass(/is-missing/);
  await page.getByRole('button',{name:'Despiece',exact:true}).click();await settleCanvas(page);await mkdir('docs/screenshots/v2',{recursive:true});await page.screenshot({path:'docs/screenshots/v2/organizer-blocked.png',fullPage:true});
  await send(page,'Encontré O5');await complete(page,4);await complete(page,6);await expect(page.getByText('6 de 6 pasos completados',{exact:true})).toBeVisible();await page.screenshot({path:'docs/screenshots/v2/organizer-completed.png',fullPage:true});
  await choose('Mesa auxiliar modular');expect((await storedState(page)).completed).toEqual([1]);expect((await storedState(page)).missing).toEqual([]);await choose('Organizador de escritorio');await page.reload();await expect(page.getByText('6 de 6 pasos completados',{exact:true})).toBeVisible();
  await page.setViewportSize({width:390,height:844});await expect(page.locator('.assembly-viewer canvas')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.screenshot({path:'docs/screenshots/v2/organizer-mobile.png',fullPage:true});
});

test('simulated speech API events control the real listening indicator and execute final transcripts only',async({page})=>{
  await page.addInitScript(()=>{
    class Recognition {
      onstart?:()=>void;onend?:()=>void;onerror?:(event:unknown)=>void;onresult?:(event:unknown)=>void;
      constructor(){(window as any).__testRecognition=this;}
      start(){}stop(){this.onend?.();}abort(){this.onend?.();}
    }
    (window as any).SpeechRecognition=Recognition;
  });
  await page.goto('/');await page.getByRole('button',{name:'Activar micrófono',exact:true}).click();
  await expect(page.getByText('Micrófono activo',{exact:true})).not.toBeVisible();
  await page.evaluate(()=>(window as any).__testRecognition.onstart());
  await expect(page.getByText('Micrófono activo',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Detener micrófono',exact:true})).toBeVisible();
  await page.evaluate(()=>(window as any).__testRecognition.onresult({resultIndex:0,results:[{0:{transcript:'Me falta B7'},isFinal:false}]}));
  await expect(page.locator('.composer-bottom')).toContainText('Me falta B7');expect((await storedState(page)).missing||[]).toEqual([]);
  await page.evaluate(()=>(window as any).__testRecognition.onresult({resultIndex:0,results:[{0:{transcript:'Me falta B7'},isFinal:true}]}));
  await expect.poll(async()=>(await storedState(page)).missing).toEqual(['B7']);
  await page.getByRole('button',{name:'Activar micrófono',exact:true}).click();
  await page.evaluate(()=>(window as any).__testRecognition.onerror({error:'not-allowed'}));
  await expect(page.getByRole('log')).toContainText('El micrófono no tiene permiso');
  await expect(page.getByRole('textbox',{name:'Escribí un comando'})).toBeEnabled();
  await expect(page.getByText('Micrófono activo',{exact:true})).not.toBeVisible();
});

test('WebGL renders and camera controls change the model without changing completed work', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /WebGL|THREE|shader/i.test(message.text())) runtimeErrors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const canvas = page.locator('.assembly-viewer canvas');
  await expect(canvas).toBeVisible();
  await expect(page.getByText('Vista 3D no disponible', { exact: true })).not.toBeVisible();
  expect(await canvas.evaluate(element => !!((element as HTMLCanvasElement).getContext('webgl2') || (element as HTMLCanvasElement).getContext('webgl')))).toBe(true);
  await settleCanvas(page);
  const initial = await canvas.screenshot();
  await page.getByRole('button', { name: 'Girar a la izquierda', exact: true }).click();
  await settleCanvas(page);
  expect((await canvas.screenshot()).equals(initial)).toBe(false);
  const rotated = await canvas.screenshot();
  await page.getByRole('button', { name: 'Acercar', exact: true }).click();
  await settleCanvas(page);
  expect((await canvas.screenshot()).equals(rotated)).toBe(false);
  await page.getByRole('button', { name: 'Alejar', exact: true }).click();
  await page.getByRole('button', { name: 'Vista posterior', exact: true }).click();
  await page.getByRole('button', { name: 'Reiniciar cámara', exact: true }).click();
  await settleCanvas(page);
  await page.getByRole('button', { name: 'A1: Panel superior', exact: true }).click();
  await expect(page.getByRole('button', { name: 'A1: Panel superior', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect((await storedState(page)).selectedPart).toBe('A1');
  await page.getByRole('button', { name: 'Vista final', exact: true }).click();
  await expect(page.getByText('VISTA FINAL · REFERENCIA', { exact: true })).toBeVisible();
  expect((await storedState(page)).completed).toEqual([]);
  await page.getByRole('button', { name: 'Repetir animación', exact: true }).click();
  await settleCanvas(page);
  expect((await storedState(page)).completed).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test('sound is off by default, begins only after opting in, and preferences persist', async ({ page }) => {
  let audioConstructions = 0;
  await page.exposeFunction('__testAudioConstructed', () => { audioConstructions++; });
  await page.addInitScript(() => {
    // Observe the browser AudioContext API; no application internals are inspected.
    window.AudioContext = new Proxy(window.AudioContext, {
      construct(target, args, newTarget) {
        void (window as unknown as { __testAudioConstructed: () => void }).__testAudioConstructed();
        return Reflect.construct(target, args, newTarget);
      },
    });
  });
  await page.goto('/');
  await send(page, 'Me falta B7');
  expect(audioConstructions).toBe(0);
  await page.getByRole('button', { name: 'Configuración', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const sounds = dialog.getByRole('button', { name: 'Sonidos de interfaz', exact: true });
  await expect(sounds).toHaveAttribute('aria-pressed', 'false');
  await expect(dialog.getByRole('button', { name: 'Leer respuestas', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await sounds.click();
  await expect(sounds).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => audioConstructions).toBe(1);
  await sounds.click();
  await expect(sounds).toHaveAttribute('aria-pressed', 'false');
  await dialog.getByRole('button', { name: 'Reducir movimiento', exact: true }).click();
  await expect(page.locator('.app')).toHaveClass(/reduced-motion/);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await expect(page.locator('.app')).toHaveClass(/reduced-motion/);
  const preferences = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), PREFS);
  expect(preferences.sound).toBe(false);
  expect(preferences.voice).toBe(false);
  expect(preferences.reduced).toBe(true);
  expect(audioConstructions).toBe(1);
});

test('keyboard controls select parts and confirm work; system reduced motion is honored', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.app')).toHaveClass(/reduced-motion/);
  expect(await page.locator('.orb').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  const b7 = page.getByRole('button', { name: 'B7: Travesaño posterior', exact: true });
  await b7.focus();
  await page.keyboard.press('Enter');
  await expect(b7).toHaveAttribute('aria-pressed', 'true');
  await send(page, 'Completé el paso 1');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const checkbox = dialog.getByRole('checkbox');
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();
  await dialog.getByRole('button', { name: 'Confirmar', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(step(page, 1)).toHaveAccessibleName(/Completado$/);
  await page.getByRole('button', { name: 'Configuración', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog.getByRole('button', { name: 'Reducir movimiento', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Reducir movimiento', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('mobile navigation keeps the model, assistant, and plan usable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Paneles' });
  await expect(nav).toBeVisible();
  await expect(page.locator('.assembly-viewer canvas')).toBeVisible();
  const assertNoOverflow = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await assertNoOverflow();
  await nav.getByRole('button', { name: 'Asistente', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Escribí un comando' })).toBeVisible();
  await send(page, 'Me falta B7');
  await assertNoOverflow();
  await nav.getByRole('button', { name: 'Pasos', exact: true }).click();
  await expect(step(page, 4)).toHaveAccessibleName(/Bloqueado$/);
  await complete(page, 1);
  await assertNoOverflow();
  await nav.getByRole('button', { name: 'Modelo 3D', exact: true }).click();
  await page.getByRole('tab', { name: /^Piezas/ }).click();
  await expect(page.getByText('Cada pieza tiene su lugar.', { exact: true })).toBeVisible();
  await assertNoOverflow();
  await page.getByRole('tab', { name: 'Manual', exact: true }).click();
  await expect(page.getByText('Primero, un espacio seguro.', { exact: true })).toBeVisible();
  await assertNoOverflow();
  await page.getByRole('tab', { name: 'Vista 3D', exact: true }).click();
  await expect(page.locator('.assembly-viewer canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Despiece', exact: true }).click();
  await settleCanvas(page);
  await mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: 'docs/screenshots/mobile.png', fullPage: true });
});
