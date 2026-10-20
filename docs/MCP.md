# MCP tools and local client

Run `npm run mcp`, then use the app's MCP connection control. Endpoint: `http://127.0.0.1:3101/mcp`. The official SDK implements Streamable HTTP, initialization, session negotiation, discovery, and invocation. The integration tests also exercise an explicit **2025-11-25** negotiation.

```ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const client = new Client({ name: 'my-client', version: '1.0.0' });
const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3101/mcp'));
await client.connect(transport);
const catalog = await client.listTools();
const result = await client.callTool({ name: 'mark_part_missing', arguments: { partId: 'B7' } });
console.log(catalog.tools.map(tool => tool.name), result.structuredContent);
await transport.terminateSession();
await client.close();
```

The verified V2 catalog has 18 tools. Each initialized session starts with a fresh table; `load_assembly` can select the six-step organizer. To transfer a local snapshot, invoke `restore_progress` with `{ serialized: JSON.stringify(validAssemblyState) }`. The engine validates the complete dependency state before applying it. This local service does not write snapshots to disk.

| Tool | Arguments | Effect |
| --- | --- | --- |
| `load_assembly` | optional `assemblyId: "table"\|"organizer"` | Load/reset the selected catalog assembly in this session; omitted ID retains the current assembly |
| `get_assembly_state` | none | State and current plan |
| `list_parts` | none | Part references from the active assembly schema |
| `inspect_part`, `focus_3d_part` | `partId` | Select and describe an existing part |
| `explain_part_impact` | `partId` | Explain a hypothetical missing-part dependency impact without changing inventory or completed work |
| `mark_part_missing`, `restore_part` | `partId` | Update inventory; recalculate dependencies |
| `set_tool_available` | `toolId: "hex"\|"screwdriver"`, `available` | Recalculate tool constraints |
| `get_available_steps`, `recalculate_plan` | none | Current graph-derived plan |
| `select_step` | `stepId` | Select a valid step: table 1..8, organizer 1..6 |
| `complete_step` | `stepId`, optional `confirmed` | Only `confirmed: true` can record available work |
| `undo_step` | `stepId`, optional `cascade` | Requires `cascade: true` for completed descendants |
| `explain_blockage` | optional `stepId` | Reasons and dependency blockers |
| `get_safety_requirements` | optional `stepId` | Relevant physical precautions |
| `save_progress` | none | `data.serialized`; caller persists it |
| `restore_progress` | `serialized` | Validate and import a snapshot |

Tools return text plus `structuredContent: { state, message, kind, data? }`. `kind` is `success`, `info`, or `warning`. A warning may represent a valid inventory change (missing B7), a safety refusal, or an invalid domain request; inspect returned state and data. SDK schema failures and unexpected exceptions use MCP `isError`. Every handled engine operation increments a revision and records an audit entry, even reads and refusals; read-only annotations refer to assembly progress and inventory.

The renderer reacts to selection and completion state. Animation playback is a UI operation, not an advertised MCP tool; playing it never marks the physical assembly complete. Browser CORS permits loopback origins only. The service is intended for a trusted user's local computer, not the public internet.

## Rescue Intelligence extension

The rescue-intelligence branch exposes 22 tools. See [the four new tools and exact contracts](RESCUE_INTELLIGENCE.md#architecture-and-mcp-contract). The original tools below remain unchanged. Query annotations are read-only; apply_scenario revalidates an exact base snapshot and requires confirmed:true from a human-reviewing client.
