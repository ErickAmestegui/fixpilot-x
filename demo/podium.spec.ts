import {test,expect,type Page} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {startMcpServer} from '../server/mcp';
let server:Awaited<ReturnType<typeof startMcpServer>>;
test.beforeAll(async()=>{server=await startMcpServer(3101);});
test.afterAll(async()=>{await server.close();});
// Captions narrate observed UI only. They never supply tool results or change app state.
async function caption(page:Page,text:string,ms=5000){await page.evaluate(text=>{let el=document.getElementById('recording-caption');if(!el){el=document.createElement('div');el.id='recording-caption';el.style.cssText='position:fixed;bottom:16px;left:10%;right:10%;padding:14px 20px;text-align:center;color:white;background:#102b40ed;border-radius:12px;font:18px system-ui;z-index:100000;pointer-events:none';document.body.append(el);}el.textContent=text;},text);await page.waitForTimeout(ms);}
test('Readable Judge Mode recording — genuine tools, independent alternatives and approval',async({page})=>{
 const calls:unknown[]=[];page.on('request',r=>{if(r.url()===server.url&&r.method()==='POST'){const b=r.postDataJSON();if(b.method==='tools/call')calls.push(b.params);}});
 await page.goto('/?judge');await page.getByRole('button',{name:'Connect real MCP',exact:true}).click();await expect(page.locator('.challenge-transport-label')).toContainText('MCP Streamable HTTP');
 await caption(page,'Judge Mode: a guided rescue using real local MCP tools. No LLM.',4000);
 await page.getByRole('button',{name:'Start guided rescue'}).click();await expect(page.locator('.challenge-final')).toContainText('2/8');
 await caption(page,'Two reports are a simulated starting fixture. Your saved projects stay untouched.',5000);
 await page.getByRole('button',{name:'Preview missing part',exact:true}).click();await expect(page.getByTestId('challenge-blocked')).toHaveText('4, 5, 7, 8');await page.locator('.challenge-visual').scrollIntoViewIfNeeded();
 await caption(page,'B7 is missing in this preview. The red ghost is not an installed part.',6000);
 await page.locator('.challenge-dependencies').scrollIntoViewIfNeeded();await caption(page,'The original dependency engine computes the blocked steps and their prerequisites.',5000);
 await page.locator('.challenge-approval').scrollIntoViewIfNeeded();await expect(page.getByRole('button',{name:'Apply to challenge record',exact:true})).toBeDisabled();
 await caption(page,'Preview alone changes nothing. Applying the shortage requires explicit review.',5000);
 await page.getByLabel('I reviewed this challenge change').check();await page.getByRole('button',{name:'Apply to challenge record',exact:true}).click();await expect(page.locator('.challenge-final')).toContainText('Missing: B7');
 await page.getByRole('button',{name:'Compare: keep missing vs recover'}).click();await expect(page.locator('.challenge-comparison article')).toHaveCount(2);await page.locator('.challenge-comparison').scrollIntoViewIfNeeded();
 await caption(page,'Two independent alternatives use the same recorded base. Neither comparison is applied.',6000);
 await page.getByRole('button',{name:'Preview recovery in 3D'}).click();await expect(page.getByLabel('I reviewed this challenge change')).toBeEnabled();await page.locator('.challenge-visual').scrollIntoViewIfNeeded();
 await caption(page,'Recovery is also hypothetical until approved. The 3D view follows the calculated inventory.',6000);
 await page.getByLabel('I reviewed this challenge change').check();await page.getByRole('button',{name:'Apply to challenge record',exact:true}).click();await expect(page.locator('.challenge-final')).toContainText('Missing: None');await expect(page.locator('.challenge-final')).toContainText('2/8');
 await page.locator('.challenge-final').scrollIntoViewIfNeeded();await caption(page,'Recovery preserved the two reports. It never claims later physical work is complete.',5000);
 await page.getByRole('button',{name:/Inspect receipts/}).click();await page.locator('.challenge-evidence').scrollIntoViewIfNeeded();await caption(page,'Inspect or export actual tool arguments, results, timings and state fingerprints.',5000);
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export evidence JSON'}).click();await mkdir('docs/podium-evidence',{recursive:true});await(await pending).saveAs('docs/podium-evidence/demo-export.json');
 await writeFile('docs/podium-evidence/demo-calls.json',JSON.stringify({mocked:false,captions:'Authored narration of observed UI; not model output or participant data',calls},null,2));
 const video=page.video();await page.close();await video?.saveAs('demo-podium-results/fixpilot-judge-mode.webm');
});
