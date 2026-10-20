# Devpost changes — entrant review required

Do not alter an already submitted entry without checking organizer rules. The entrant must review fields, eligibility and personal declarations and press Submit themselves. Historical V2 materials remain available; replace only the current-version claims below. Do not claim eligibility or a prize is guaranteed.

## Project headline

FixPilot X — Rescue Intelligence

## Elevator pitch

A 3D assembly copilot that lets you explore missing parts and tools, compare recovery plans, and approve changes before they affect your real progress.

## About the project — updated core description

Static instructions assume every part and tool is available. FixPilot X helps users understand what changes when that assumption breaks.

Rescue Intelligence adds counterfactual planning to our working 3D assembly copilot. Ask, “What if I am missing B7 and my screwdriver?” The application creates a validated hypothetical copy, calculates available and blocked operations from the actual dependency graph, and shows absent components as red transparent ghosts. Switching back to the actual project makes the boundary visible: exploration has not changed inventory, saved progress or audit history.

Users can compare alternatives against the same base state, inspect causal prerequisite paths and explore partial recovery. Recovering one resource does not pretend that every operation is unlocked. Proposed inventory changes and invalidated digital confirmations are shown before explicit human approval. At application time, the engine revalidates the exact base snapshot and applies one atomic change. A stale proposal is refused.

The browser provides English and Spanish judge controls, two original assembly schemas, independent project memory, human completion confirmations, digital undo and optional sounds. A configurable challenge workbench lets evaluators choose resource combinations and undo scenarios beyond the video examples. Every outcome is calculated by the same planner used in the original product.

The optional genuine MCP server implements Streamable HTTP initialization, discovery and invocation, tested with protocol 2025-11-25. Its 22 callable tools include preview_scenario, compare_scenarios, explain_recovery and apply_scenario. The first three are read-only. The fourth requires a reviewed change set, an unchanged base token and explicit confirmation from the client. The recording exercises actual browser-to-MCP calls.

Locally, 204 automated unit/integration tests, nine legacy browser scenarios and four new Rescue browser scenarios passed. Property tests enumerate valid completion subsets for both schemas. The independent MCP Scenario Lab also replayed a 13-call Rescue workflow against the real server, including live result capture, approval and partial recovery.

The Alexa+ experience is simulated transparently. Conversation uses bounded deterministic English/Spanish rules, not a production generative AI model. There is no native Alexa/Echo connection or private Amazon SDK. The app records user reports and cannot inspect physical work, certify safety or turn arbitrary manuals into 3D assemblies.

## Built with

TypeScript, React, Three.js, Vite, Node.js, Express, Model Context Protocol, @modelcontextprotocol/sdk, Zod, Vitest, Playwright, Web Audio API, GitHub Actions, GitHub Pages.

## Alexa+ category disclosure — replace previous tool count

This is a functional simulated Alexa+ experience with real application tools and an optional genuine MCP server. It does not connect natively to Alexa+, an Echo device, or a private Amazon SDK. The browser routes bounded English/Spanish requests to a deterministic assembly engine. With the local server connected, requests invoke 22 actual tools through Streamable HTTP MCP, including initialization, discovery and calls using tested protocol 2025-11-25. Without the server, the static preview invokes the same engine locally and labels that mode explicitly. Read-only hypothetical analysis never changes the actual project. Applying a proposal requires explicit human review and revalidation of the base state. No runtime LLM, paid AI API or AWS service is required.

## Open Source Mini Challenge — supplement the existing entry

MCP Scenario Lab is our separate MIT-licensed, application-independent contribution. It executes JSON-defined stateful scenarios against genuine Streamable HTTP MCP servers, verifies discovery and structured results, and produces sanitized JSON/Markdown reports. The new generic capture/reuse capability captures a live result with a JSON Pointer and supplies it to a later tool argument, enabling tests of versioned proposal/approval workflows without embedding application logic in the runner. Captured values are not included in reports. An independent inventory fixture demonstrates the feature without FixPilot X. Twenty-one automated tests and separate 3-call inventory / 13-call FixPilot Rescue examples passed locally. The original v0.1.0 checkpoint and its historical evidence remain available. This is a separate contribution, not a renamed copy of FixPilot X.

Code: https://github.com/ErickAmestegui/mcp-scenario-lab/tree/rescue-scenarios

License: https://github.com/ErickAmestegui/mcp-scenario-lab/blob/rescue-scenarios/LICENSE

Reusable example: https://github.com/ErickAmestegui/mcp-scenario-lab/blob/rescue-scenarios/examples/inventory-capture.json

Evidence: https://github.com/ErickAmestegui/mcp-scenario-lab/blob/rescue-scenarios/docs/evidence/fixpilot-rescue.md

## Product feedback / authentic development friction — optional supplement

The simulated experience exposed a critical distinction between exploring a shortage and reporting that it actually happened. Reusing a mutation-oriented conversation route for “what if” requests would make the demonstration misleading. We introduced read-only tools, an explicit hypothetical model and a separate review/apply boundary. We also found that a proposal can become stale after a legitimate completion, so the apply tool validates the entire current snapshot rather than trusting an old preview. During compact-layout testing, collapsed resource controls required clearer discovery, the language selector needed an explicit accessible name, and duplicated stale notices needed refinement. These were observed development issues in our own prototype, not user interviews or defects attributed to Alexa+. Our deliberate HTTP 500 is an adversarial test, not authentic production friction. We did not test a native Alexa device or private developer SDK, so we cannot offer first-hand feedback about those products.

## Links / final checklist

- Main code for this upgrade: https://github.com/ErickAmestegui/fixpilot-x/tree/rescue-intelligence
- Run/challenge instructions: https://github.com/ErickAmestegui/fixpilot-x/blob/rescue-intelligence/docs/RESCUE_INTELLIGENCE.md
- Verification: https://github.com/ErickAmestegui/fixpilot-x/blob/rescue-intelligence/docs/RESCUE_EVIDENCE.md
- Previous public backup demo, retain as backup: https://youtu.be/ok_BsZNJxzk
- New video: use the exact verified public URL from the delivery note, not the backup or a Studio edit URL.
- Optional static preview: use only after public deployment is verified. The local MCP remains optional and unexposed.
- Replace 18 tools with 22 and scope current test counts accurately. Preserve historical V2 counts in historical evidence.
- Upload real Rescue screenshots and ensure the selected video is under three minutes and public without sign-in.
- Keep existing truthful team/credit/AI-assisted-development disclosures; the entrant confirms their personal details and eligibility.
- Review all organizer-specific required fields, category choices and Open Source declarations. Review and submit by October 22, 2026.
