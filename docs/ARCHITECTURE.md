# Architecture and trust boundaries

```text
Text / optional browser speech / direct UI controls
  -> deterministic intent router or UI tool request
  -> local execute(state, tool, args) OR official MCP Client
  -> per-session MCP server -> same execute(state, tool, args)
  -> validated state + result + audit entry
  -> React panels, dependency graph, Three.js model, optional sound
```

`src/engine.ts` defines the original eight-step table and six-step desk organizer as validated schemas. `src/engine.ts` supplies one planner, invariant validation, portable state and tools for either schema. Part and step identifiers are validated against the active assembly. It has no DOM, renderer, chat, network, or paid-model dependency. `plan` computes available, pending, blocked, and completed operations. Missing structural B7 blocks step 4 and its descendants; step 3 and the separate preparation in step 6 can proceed when their requirements are met. `complete_step` records a user confirmation, never sensor verification. Animation cannot complete a step. Undo checks completed descendants and requires explicit cascade confirmation.

The UI owns camera, animation playback, voice permissions, sound preferences, and physical confirmation dialogs. The engine owns assembly truth. A returned tool result updates every presentation from the same state; remote failure must not produce a local success. The original 3D furniture is a learning prototype, not a certified manufacturer design or a load-rated product.

`server/mcp.ts` creates one engine state and SDK server per initialized transport session. It supports real protocol initialization, `tools/list`, `tools/call`, and structured results at `/mcp`. It binds only to `127.0.0.1`, validates Host and browser Origin, caps JSON bodies and session count, and expires idle sessions. State is in memory; closing or restarting the process loses unsaved session state. Browser snapshots must be validated before restore. No accounts, public authorization, remote deployment, or multi-tenant security claims are made.

The Alexa+ interaction is declared simulation. The browser is our client, the MCP connection is real, and the assembly logic is real. There is no private Amazon SDK, native Alexa voice, Alexa device connection, Shopping API, or LLM. Text commands use a bounded deterministic grammar; unsupported inputs return guidance instead of inventing an action. Optional speech recognition depends on browser support and may use the browser vendor's service; text remains available.

The local state and audit history stay on this computer unless the user exports or publishes them. Do not put credentials or sensitive information into demo commands. Browser storage is convenience persistence, not backup. Exports provide a portable backup; imports reject impossible dependency states and unknown identifiers.

## Boundaries of the prototype

Two original assemblies are implemented; this is a bounded catalog, not arbitrary manual understanding. PDF-to-3D conversion, camera recognition, arbitrary repair instructions, production structural validation, shopping, and multi-user accounts are outside scope. Missing-tool controls are exposed in the app and share the engine/MCP validation boundary. `src/projects.ts` persists each assembly independently while retaining the legacy table key. The Plan Inspector compares actual before/after plan data; hypothetical part-impact tools do not mutate inventory or completed work. Contextual commands use bounded current-state references and preserve explicit undo/cascade confirmation. External integrations require separate access, authentication, and validation.
