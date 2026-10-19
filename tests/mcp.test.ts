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
