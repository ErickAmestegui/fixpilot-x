import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { startMcpServer } from '../server/mcp';
import { plan, type ToolResult } from '../src/engine';

describe('real MCP Streamable HTTP integration', () => {
  let service: Awaited<ReturnType<typeof startMcpServer>>;
  const clients: { client: Client; transport: StreamableHTTPClientTransport }[] = [];
  beforeAll(async () => { service = await startMcpServer(0); });
  afterAll(async () => {
    for (const { client, transport } of clients) {
      await transport.terminateSession().catch(() => {});
      await client.close();
    }
    await service.close();
  });
  async function connect() {
    const client = new Client({ name: 'fixpilot-test', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(service.url));
    clients.push({ client, transport });
    await client.connect(transport);
    return client;
  }
  async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
    const response = await client.callTool({ name, arguments: args });
    expect(response.isError).not.toBe(true);
    return response.structuredContent as unknown as ToolResult;
  }

  it('negotiates protocol 2025-11-25 over HTTP and issues a session identifier', async () => {
    const response = await fetch(service.url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'protocol-proof', version: '1.0' } } }),
    });
    expect(response.status).toBe(200);
    expect((await response.json()).result.protocolVersion).toBe('2025-11-25');
    const session = response.headers.get('mcp-session-id');
    expect(session).toMatch(/^[a-f\d-]{36}$/);
    await fetch(service.url, { method: 'DELETE', headers: { 'Mcp-Session-Id': session!, 'MCP-Protocol-Version': '2025-11-25' } });
  });

  it('discovers registered tools using the official SDK client', async () => {
    const client = await connect();
    const result = await client.listTools();
    expect(result.tools.map(tool => tool.name)).toEqual(expect.arrayContaining(['mark_part_missing', 'restore_part', 'complete_step', 'restore_progress']));
    expect(result.tools.find(tool => tool.name === 'complete_step')?.inputSchema.properties).toHaveProperty('confirmed');
    expect(result.tools).toHaveLength(22);
  });

  it('previews and compares without mutation, then atomically applies approval and rejects stale reuse',async()=>{
    const client=await connect();await call(client,'complete_step',{stepId:1,confirmed:true});const base=await call(client,'complete_step',{stepId:2,confirmed:true});
    const changes={missingParts:['B7'],unavailableTools:['screwdriver']};
    const result=await call(client,'preview_scenario',{changes});expect(result.state).toEqual(base.state);
    const preview=result.data as {baseToken:string;available:number[];blocked:number[]};expect(preview.available).toEqual([3]);expect(preview.blocked).toEqual([4,5,6,7,8]);
    const compared=await call(client,'compare_scenarios',{scenarios:[{id:'A',changes},{id:'B',changes:{missingParts:['B7']}}]});expect(compared.state).toEqual(base.state);
    const refused=await call(client,'apply_scenario',{changes,baseToken:preview.baseToken});expect(refused.state).toEqual(base.state);expect(refused.data).toMatchObject({errorCode:'CONFIRMATION_REQUIRED'});
    const applied=await call(client,'apply_scenario',{changes,baseToken:preview.baseToken,confirmed:true});expect(applied.state.missing).toEqual(['B7']);expect(applied.state.missingTools).toEqual(['screwdriver']);expect(applied.state.completed).toEqual([1,2]);expect(applied.state.history.at(-1)?.tool).toBe('apply_scenario');expect(applied.state.revision).toBe(base.state.revision+1);
    const stale=await call(client,'apply_scenario',{changes,baseToken:preview.baseToken,confirmed:true});expect(stale.data).toMatchObject({errorCode:'STALE_BASE'});expect(stale.state).toEqual(applied.state);
    const explanation=await call(client,'explain_recovery',{stepId:5});expect(explanation.state).toEqual(applied.state);expect(explanation.data).toMatchObject({resources:[{kind:'part',id:'B7',steps:[4]}]});
    const recovered=await call(client,'preview_scenario',{changes:{recoveredParts:['B7']}});expect(recovered.state).toEqual(applied.state);const recoveredPreview=recovered.data as typeof preview;expect(recoveredPreview.available).toEqual([3,4]);
    const partial=await call(client,'apply_scenario',{changes:{recoveredParts:['B7']},baseToken:recoveredPreview.baseToken,confirmed:true});expect(partial.state.missing).toEqual([]);expect(partial.state.missingTools).toEqual(['screwdriver']);expect(partial.state.completed).toEqual([1,2]);
  });

  it('recovers after MCP schema and domain errors without accepting partial hypothetical changes',async()=>{
    const client=await connect();const base=await call(client,'get_assembly_state');
    const malformed=await client.callTool({name:'preview_scenario',arguments:{changes:{missingParts:'B7'}}});expect(malformed.isError).toBe(true);
    const unknown=await call(client,'preview_scenario',{changes:{missingParts:['B7','X99']}});expect(unknown.data).toMatchObject({errorCode:'INVALID_RESOURCE'});expect(unknown.state).toEqual(base.state);
    const contradictory=await call(client,'preview_scenario',{changes:{missingParts:['B7'],recoveredParts:['B7']}});expect(contradictory.data).toMatchObject({errorCode:'CONTRADICTORY_CHANGES'});expect(contradictory.state).toEqual(base.state);
    const good=await call(client,'preview_scenario',{changes:{missingParts:['B7']}});expect(good.state).toEqual(base.state);expect(good.kind).toBe('info');
    const second=await connect();const independent=await call(second,'get_assembly_state');expect(independent.state.missing).toEqual([]);
  });

  it('advertises new analysis tools as read-only and application as an explicit mutation',async()=>{
    const client=await connect(),catalog=await client.listTools();for(const name of ['preview_scenario','compare_scenarios','explain_recovery'])expect(catalog.tools.find(t=>t.name===name)?.annotations?.readOnlyHint).toBe(true);
    expect(catalog.tools.find(t=>t.name==='apply_scenario')?.annotations?.readOnlyHint).toBe(false);
    const base=await call(client,'get_assembly_state');const result=await call(client,'explain_recovery',{stepId:5,changes:{missingParts:['B7'],unavailableTools:['hex']}});expect(result.state).toEqual(base.state);expect(result.data).toMatchObject({stepId:5,resources:expect.arrayContaining([{kind:'part',id:'B7',steps:[4]},{kind:'tool',id:'hex',steps:[2,3,4,5]}])});
  });

  it('runs the second catalog and missing-tool recovery through the same MCP engine',async()=>{
    const client=await connect();await call(client,'load_assembly',{assemblyId:'organizer'});await call(client,'complete_step',{stepId:1,confirmed:true});
    let result=await call(client,'set_tool_available',{toolId:'hex',available:false});expect(plan(result.state).filter(s=>s.status==='available').map(s=>s.id)).toEqual([5]);
    await call(client,'complete_step',{stepId:5,confirmed:true});await call(client,'set_tool_available',{toolId:'hex',available:true});
    for(const stepId of [2,3,4,6])result=await call(client,'complete_step',{stepId,confirmed:true});expect(result.state.assemblyId).toBe('organizer');expect(result.state.completed).toEqual([1,2,3,4,5,6]);
    const other=await connect(),saved=await call(other,'save_progress');const rejected=await call(client,'restore_progress',saved.data as Record<string,unknown>);expect(rejected.kind).toBe('warning');expect(rejected.state.completed).toEqual([1,2,3,4,5,6]);
  });

  it('explains hypothetical part loss without mutating the inventory',async()=>{
    const client=await connect();await call(client,'complete_step',{stepId:1,confirmed:true});await call(client,'complete_step',{stepId:2,confirmed:true});
    const result=await call(client,'explain_part_impact',{partId:'B7'});expect(result.state.missing).toEqual([]);expect(result.state.completed).toEqual([1,2]);expect(result.message).toContain('4');
  });

  it('executes the missing-B7 alternative and recovery through actual tool calls', async () => {
    const client = await connect();
    await call(client, 'complete_step', { stepId: 1, confirmed: true });
    await call(client, 'complete_step', { stepId: 2, confirmed: true });
    let result = await call(client, 'mark_part_missing', { partId: 'B7' });
    expect(result.state.missing).toContain('B7');
    expect(plan(result.state).find(step => step.id === 4)?.status).toBe('blocked');
    expect(plan(result.state).filter(step => step.status === 'available').map(step => step.id)).toEqual([3, 6]);
    result = await call(client, 'complete_step', { stepId: 4, confirmed: true });
    expect(result.state.completed).not.toContain(4);
    await call(client, 'complete_step', { stepId: 3, confirmed: true });
    await call(client, 'complete_step', { stepId: 6, confirmed: true });
    result = await call(client, 'restore_part', { partId: 'B7' });
    expect(plan(result.state).find(step => step.id === 4)?.status).toBe('available');
    for (const stepId of [4, 5, 7, 8]) result = await call(client, 'complete_step', { stepId, confirmed: true });
    expect(result.state.completed).toHaveLength(8);
  });

  it('isolates inventories and progress between clients', async () => {
    const first = await connect(); const second = await connect();
    await call(first, 'mark_part_missing', { partId: 'B7' });
    await call(first, 'complete_step', { stepId: 1, confirmed: true });
    const result = await call(second, 'get_assembly_state');
    expect(result.state.missing).toEqual([]);
    expect(result.state.completed).toEqual([]);
  });

  it('requires confirmation and rejects schema-invalid calls', async () => {
    const client = await connect();
    expect((await call(client, 'complete_step', { stepId: 1 })).state.completed).toEqual([]);
    const invalid = await client.callTool({ name: 'complete_step', arguments: { stepId: 99, confirmed: true } });
    expect(invalid.isError).toBe(true);
    expect((await call(client, 'get_assembly_state')).state.completed).toEqual([]);
  });

  it('exports, validates, and restores progress across sessions', async () => {
    const first = await connect(); const second = await connect();
    await call(first, 'complete_step', { stepId: 1, confirmed: true });
    const saved = await call(first, 'save_progress');
    const restored = await call(second, 'restore_progress', saved.data as Record<string, unknown>);
    expect(restored.state.completed).toEqual([1]);
    const rejected = await call(second, 'restore_progress', { serialized: '{invalid' });
    expect(rejected.kind).toBe('warning');
    expect(rejected.state.completed).toEqual([1]);
  });

  it('rejects remote origins, unknown sessions, and calls without initialization', async () => {
    expect((await fetch(service.url, { method: 'POST', headers: { Origin: 'https://untrusted.example' } })).status).toBe(403);
    expect((await fetch(service.url, { headers: { 'Mcp-Session-Id': 'not-real' } })).status).toBe(404);
    expect((await fetch(service.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) })).status).toBe(400);
    const allowed = await fetch(service.url, { method: 'OPTIONS', headers: { Origin: 'http://127.0.0.1:5173', 'Access-Control-Request-Method': 'POST' } });
    expect(allowed.headers.get('access-control-allow-origin')).toBe('http://127.0.0.1:5173');
  });
});
