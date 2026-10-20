import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import type { Server as HttpServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createInitialState } from '../src/engine.js';
import { executeTool as execute } from '../src/rescue-tools.js';

const part = { partId: z.string().min(1).max(16) };
const step = { stepId: z.number().int().min(1).max(8) };
const scenarioChanges=z.object({
  missingParts:z.array(z.string().min(1).max(16)).max(20).optional(),
  recoveredParts:z.array(z.string().min(1).max(16)).max(20).optional(),
  unavailableTools:z.array(z.string().min(1).max(32)).max(10).optional(),
  recoveredTools:z.array(z.string().min(1).max(32)).max(10).optional(),
  undoSteps:z.array(z.number().int().min(1).max(8)).max(8).optional(),
}).strict();
type Definition = { description: string; inputSchema: z.ZodRawShape; readOnly?: boolean };

export const TOOL_DEFINITIONS: Record<string, Definition> = {
  preview_scenario:{description:'Read-only counterfactual resource and progress analysis. Returns a validated hypothetical copy and exact base token; never changes actual inventory, confirmations or audit.',inputSchema:{changes:scenarioChanges},readOnly:true},
  compare_scenarios:{description:'Compare one to six independent counterfactuals against the same actual snapshot using the real dependency planner.',inputSchema:{scenarios:z.array(z.object({id:z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),changes:scenarioChanges}).strict()).min(1).max(6)},readOnly:true},
  explain_recovery:{description:'Read actual or hypothetical graph-derived resource requirements and prerequisite work. This does not certify physical safety or optimize repair order.',inputSchema:{stepId:step.stepId.optional(),changes:scenarioChanges.optional()},readOnly:true},
  apply_scenario:{description:'Atomically apply reviewed resource changes and digital confirmation invalidation. Requires explicit client human approval and an exact unchanged base token; rejects stale proposals.',inputSchema:{changes:scenarioChanges,baseToken:z.string().min(1).max(250_000),confirmed:z.boolean().optional()}},
  load_assembly: { description: 'Load a catalog assembly in this isolated session. Resets this session only.', inputSchema: { assemblyId: z.enum(['table','organizer']).optional() } },
  get_assembly_state: { description: 'Read this session’s current assembly and action history.', inputSchema: {}, readOnly: true },
  list_parts: { description: 'List original model parts and their inventory states.', inputSchema: {}, readOnly: true },
  inspect_part: { description: 'Inspect and select a part by its identifier.', inputSchema: part },
  explain_part_impact: { description: 'Compute the dependency impact of a hypothetical missing part without changing inventory.', inputSchema: part, readOnly: true },
  mark_part_missing: { description: 'Report a missing part and invalidate dependent assembly steps.', inputSchema: part },
  restore_part: { description: 'Report a recovered part and recompute valid next steps.', inputSchema: part },
  get_available_steps: { description: 'Find safe, currently available steps from the dependency graph.', inputSchema: {}, readOnly: true },
  complete_step: { description: 'Record the user’s physical completion confirmation only when dependencies and safety checks permit.', inputSchema: { ...step, confirmed: z.boolean().optional() } },
  undo_step: { description: 'Undo a completed step. Explicit cascade confirmation is required to invalidate completed descendants.', inputSchema: { ...step, cascade: z.boolean().optional() } },
  select_step: { description: 'Select a step and return its actual instructions and dependency status.', inputSchema: step },
  set_tool_available: { description: 'Report whether an assembly tool is available and recompute the plan.', inputSchema: { toolId: z.enum(['hex', 'screwdriver']), available: z.boolean() } },
  recalculate_plan: { description: 'Recompute dependencies, missing parts, and available alternatives.', inputSchema: {} },
  explain_blockage: { description: 'Explain why progress is blocked and which alternatives remain.', inputSchema: { stepId: z.number().int().min(1).max(8).optional() }, readOnly: true },
  get_safety_requirements: { description: 'Read assembly precautions. Software cannot inspect physical installation.', inputSchema: { stepId: z.number().int().min(1).max(8).optional() }, readOnly: true },
  focus_3d_part: { description: 'Select a real part in shared state for the 3D client to focus.', inputSchema: part },
  save_progress: { description: 'Return a portable snapshot. The caller must persist it.', inputSchema: {}, readOnly: true },
  restore_progress: { description: 'Validate and restore a caller-provided progress snapshot in this session.', inputSchema: { serialized: z.string().max(250_000) } },
};

function makeServer() {
  let state = createInitialState();
  const server = new McpServer({ name: 'fixpilot-x', version: '1.0.0' });
  for (const [name, definition] of Object.entries(TOOL_DEFINITIONS)) {
    server.registerTool(name, {
      description: definition.description,
      inputSchema: definition.inputSchema,
      annotations: { readOnlyHint: definition.readOnly ?? false, openWorldHint: false },
    }, async (args) => {
      try {
        const result = execute(state, name as Parameters<typeof execute>[1], args);
        state = result.state;
        return {
          content: [{ type: 'text' as const, text: result.message }],
          structuredContent: { ...result },
          isError: false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Tool execution failed.';
        return { content: [{ type: 'text' as const, text: message }], structuredContent: { state, message, kind: 'error' }, isError: true };
      }
    });
  }
  return server;
}

function localOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return ['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && origin === url.origin;
  } catch { return false; }
}

/** Local-only development server; deliberately not a public hosting/authentication layer. */
export function createMcpApp() {
  const app = express();
  type Session = { server: McpServer; transport: StreamableHTTPServerTransport; touched: number };
  const sessions = new Map<string, Session>();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const host = req.hostname;
    if (!['localhost', '127.0.0.1', '[::1]'].includes(host) || (req.headers.origin && !localOrigin(req.headers.origin))) {
      res.status(403).json({ error: 'Only loopback hosts and local browser origins are allowed.' });
      return;
    }
    next();
  });
  app.use(cors({ origin: (origin, callback) => callback(null, !origin || localOrigin(origin)), exposedHeaders: ['Mcp-Session-Id', 'MCP-Protocol-Version'], allowedHeaders: ['Content-Type', 'Accept', 'Mcp-Session-Id', 'MCP-Protocol-Version', 'Last-Event-ID'], methods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }));
  app.use(express.json({ limit: '256kb' }));
  app.get('/health', (_req, res) => res.json({ name: 'fixpilot-x', transport: 'Streamable HTTP', minimumProtocol: '2025-11-25', sessions: sessions.size }));
  const expire = async () => {
    for (const [id, session] of sessions) {
      if (Date.now() - session.touched > 30 * 60_000) {
        sessions.delete(id);
        await session.server.close();
      }
    }
  };
  app.all('/mcp', async (req, res) => {
    try {
      await expire();
      const id = req.headers['mcp-session-id'];
      if (id && typeof id !== 'string') { res.status(400).json({ error: 'Invalid session identifier.' }); return; }
      let session = typeof id === 'string' ? sessions.get(id) : undefined;
      if (id && !session) { res.status(404).json({ error: 'Session expired or not found; initialize a new session.' }); return; }
      if (!session) {
        if (req.method !== 'POST' || !isInitializeRequest(req.body)) { res.status(400).json({ error: 'Initialize an MCP session first.' }); return; }
        if (sessions.size >= 128) { res.status(503).json({ error: 'Local session capacity reached. Close an existing session.' }); return; }
        const server = makeServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true,
          onsessioninitialized: sessionId => { sessions.set(sessionId, { server, transport, touched: Date.now() }); },
        });
        transport.onclose = () => { if (transport.sessionId) sessions.delete(transport.sessionId); };
        await server.connect(transport);
        session = { server, transport, touched: Date.now() };
      }
      session.touched = Date.now();
      await session.transport.handleRequest(req, res, req.body);
    } catch {
      if (!res.headersSent) res.status(500).json({ error: 'MCP request failed. Reconnect and retry.' });
    }
  });
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(error instanceof SyntaxError ? 400 : 413).json({ error: 'Invalid or oversized JSON request.' });
  });
  return { app, close: async () => { await Promise.all([...sessions.values()].map(session => session.server.close())); sessions.clear(); } };
}

export async function startMcpServer(port = 3101) {
  const { app, close } = createMcpApp();
  const httpServer = await new Promise<HttpServer>((resolve, reject) => {
    const listener = app.listen(port, '127.0.0.1', () => resolve(listener));
    listener.once('error', reject);
  });
  const address = httpServer.address();
  if (!address || typeof address === 'string') throw new Error('Could not determine local server port.');
  return { url: `http://127.0.0.1:${address.port}/mcp`, close: async () => {
    await close();
    httpServer.closeAllConnections();
    await new Promise<void>((resolve, reject) => httpServer.close(error => error ? reject(error) : resolve()));
  } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startMcpServer().then(server => {
    console.log(`FixPilot X MCP ready: ${server.url} (loopback only)`);
    for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void server.close().then(() => process.exit(0)); });
  }).catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}
