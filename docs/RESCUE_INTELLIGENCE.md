# Rescue Intelligence — judge quickstart

This upgrade preserves the V2 assembly planner and Three.js renderer. It adds counterfactual inventory/progress analysis, structured comparison and graph-derived recovery requirements. It does not add an LLM or a native Alexa+ connection.

## Run

Use Node 22+, then `npm ci`, `npm run dev`. Open `http://127.0.0.1:5173/?rescue`. The workbench starts in English; its language selector also supports Spanish. The existing assembly UI remains available through **Return to assembly**. Both original assemblies retain separate browser snapshots.

For actual MCP transport, run `npm run mcp` in another terminal and choose **Connect local MCP**. This is optional: the static app invokes the identical dispatcher locally when disconnected. An internet-hosted preview is a browser-engine demonstration, not a remotely hosted MCP server. Loopback/origin protections are retained; do not expose the server or disable them to make a public preview connect.

## Five-minute challenge

1. Confirm table steps 1 and 2 using the human-review dialog.
2. Ask **What if I'm missing B7 and my screwdriver?** Actual inventory, progress and audit remain byte-for-byte unchanged. Hypothetically, step 3 is available; steps 4–8 are blocked. Red ghosts mean absent, not installed.
3. Toggle **Actual project** / **Hypothetical preview**. Ask **Why is step 5 blocked?** Inspect causal paths and requirements.
4. Ask **Compare alternatives**. A, B and C are editable example conditions evaluated by the real planner, not cached outcomes. Alternatively use **Resource controls**, **Save draft as A**, edit B, and **Compare A with current draft B**.
5. Cancel a preview and check **Live actual snapshot**. Preview again and review the exact changes and every removed digital confirmation before checking the approval box and applying.
6. Confirm step 3. Ask **Show me what changes if I recover B7.** Preview, approve and verify steps 1–3 remain confirmed while the screwdriver remains unavailable. Recover the tool, then complete 4–8.
7. Switch to the organizer and try different part/tool IDs. Table progress remains saved. **Progress changes** previews undo cascades; independent valid confirmations remain. An unavailable actual step cannot be confirmed.

All displayed availability is calculated from the current graph, inventory and prerequisite confirmations. Recovering a resource never automatically reconfirms invalidated work. Undo changes the digital record, not physical assembly.

## Bounded command grammar

Supported forms (case/accent normalized, catalog IDs required):

| Intent | English | Spanish |
|---|---|---|
| Multiple shortages | What if I'm missing B7 and my screwdriver? | ¿Qué pasaría si me faltaran B7 y el destornillador? |
| Alternative wording | What if B7 and the Allen key are missing? | ¿Y si faltan B7 y la llave Allen? |
| Partial recovery | Show me what changes if I recover B7. | Mostrame qué cambia si recupero solamente B7. |
| Available work | What can I still do? | ¿Qué pasos seguirían disponibles? |
| Cause | Why is step 5 blocked? | ¿Por qué no puedo completar el paso 5? |
| Top panel | Why can't I complete the top? | ¿Por qué no puedo completar la cubierta? |
| Recovery scope | What should I recover first? | ¿Qué recupero primero? |
| Compare conditions | Compare missing B7 versus missing B7 and screwdriver | Compara falta B7 versus faltan B7 y el destornillador |
| Example conditions | Compare alternatives | Compara alternativas |
| Open review only | Apply this scenario | Aplicar este escenario |

Recovery retains other draft conditions. “That part” / “esa pieza” resolves a selected part; absent context, invalid identifiers, unsupported combined clauses and duplicate resources request clarification rather than partial execution. This is intentionally not arbitrary conversation. The resource selectors support combinations beyond the grammar. “Recover first” reports a set of requirements, not an optimized physical repair order. Text never approves a state change.

## Architecture and MCP contract

`rescue-intent → rescue-tools → rescue → existing engine.plan / validateState`

The browser workbench and genuine MCP server share this dispatcher. Existing tools remain delegated to the unchanged original engine. The original renderer receives either actual state or a validated hypothetical copy; there is one renderer, not a second visual-only planner.

The catalog now has **22 tools**, including:

| Tool | Arguments | Effect |
|---|---|---|
| preview_scenario | `{changes}` | Read-only validated hypothetical copy, direct/indirect effects, changed and unchanged statuses, causes, recovery and exact base token |
| compare_scenarios | `{scenarios:[{id,changes}]}` (1–6) | Read-only scenarios against the same base, per-step and pairwise differences |
| explain_recovery | `{stepId?,changes?}` | Read-only actual or hypothetical prerequisite/resource requirements |
| apply_scenario | `{changes,baseToken,confirmed:true}` | Revalidates base and changes; one atomic actual change and audit event |

`changes` supports `missingParts`, `recoveredParts`, `unavailableTools`, `recoveredTools`, `undoSteps`. Unknown fields/IDs, contradictions, invalid states and stale proposals are refused without modifying the input. A missing installed component invalidates its consuming confirmations and confirmed descendants in the preview; losing a tool preserves already completed work. The apply token covers all validated state fields and is an exact canonical snapshot, not a cryptographic signature or authorization credential. The client is responsible for human review; a caller-provided `confirmed:true` is not proof of identity or physical work.

MCP uses the official SDK's Streamable HTTP initialization, discovery and invocation with tested protocol `2025-11-25`. The three new query tools declare read-only annotations. Actual state is session-local on the server and backed up per project in browser storage. The workbench request trace is temporary and includes transport; only successful actual changes enter the saved audit. Transport failure leaves the last successful client snapshot authoritative; read it before retrying.

## Evidence and limits

See [Rescue verification](RESCUE_EVIDENCE.md), the executable [recording](../demo/rescue.spec.ts), and the independent [MCP Scenario Lab example](https://github.com/ErickAmestegui/mcp-scenario-lab/blob/rescue-scenarios/examples/fixpilot-rescue.json).

Only two original assembly schemas and their generated geometry are supported. There is no arbitrary-manual conversion, sensor inspection, physical certification, optimized repair solver, mandatory generative AI, native Alexa SDK or device integration. English instructions/errors/confirmations are translated; raw legacy audit messages/JSON can retain Spanish. Browser storage is local, not cross-device cloud memory. Tests are software evidence, not proof of competition eligibility or physical safety.

Stable V2 remains tagged `devpost-ready-2026-10-19` (`bfa0225`), with its [public 2:14 backup video](https://youtu.be/ok_BsZNJxzk). Checkout that tag to reproduce the historical V2 recording/counts. The Rescue upgrade lives on `rescue-intelligence`; no force push or deletion is required for rollback.
