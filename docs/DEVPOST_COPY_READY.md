# Devpost — final copy-ready fields

Copy each field separately. The entrant completes identity, eligibility, ownership attestations and final submission personally. No submission confirmation is implied by this document.

## Project name

FixPilot X

## Elevator pitch / tagline

The manual that adapts to you: a 3D assembly copilot that replans around missing parts and tools while preserving valid progress.

## About the project

### Inspiration

Assembly rarely follows a perfect script. A missing brace or unavailable tool can leave a person staring at a manual that offers no useful next step. FixPilot X asks a different question: what can you still complete without breaking the procedure's dependencies?

### What it does

FixPilot X combines conversation, original interactive 3D models and a dependency planner. Report “I'm missing B7” and the inventory changes, the absent brace becomes a clearly marked red ghost, affected steps are blocked, and independent work remains available. Recover B7 and the plan updates without discarding valid progress or skipping prerequisites.

The experience supports an eight-step table and a six-step organizer through one schema-based engine. Each project keeps independent browser memory. Users can inspect a part, report a missing tool in context, review a prior-step correction, confirm completed work and export validated backups. A Plan Inspector shows actual tool arguments, before/after state, affected dependencies and available alternatives.

### How it works

React and TypeScript coordinate the interface; Three.js renders original code-generated geometry. A deterministic command router maps supported contextual requests to real assembly tools. The optional local MCP server uses the official SDK and Streamable HTTP: the browser initializes a session, discovers 18 tools and invokes them against isolated state. The same engine runs directly in the browser when disconnected. No paid model or cloud service is required.

### What makes it different

The central feature is interruption recovery, not a chatbot placed beside a manual. Conversation, inventory, procedure and 3D share validated state. The second assembly demonstrates that replanning is not a hard-coded B7 animation. Completion requires an explicit user report; animation never pretends to inspect physical work.

### Verification and next steps

The verified build passed 164 unit/integration tests and nine browser scenarios. The final captioned demonstration shows actual MCP responses, B7 replanning and recovery, independent work, both complete assemblies and retained progress. An additional independent open source project, MCP Scenario Lab, makes stateful MCP regression scenarios reusable for other developers.

FixPilot X is a simulated Alexa+ experience, developed with Codex. It has no native Alexa connection or runtime LLM. These educational models are not manufacturer-approved construction instructions or physical safety certification. Next steps are real-user evaluation, broader command coverage and manufacturer-validated assembly schemas.

## Built with

TypeScript, JavaScript, React, Three.js, Vite, Node.js, Express, Zod, Model Context Protocol (MCP), MCP TypeScript SDK, Web Audio API, Web Speech API, Lucide, Vitest, Playwright, GitHub Actions, Codex

## Try it out links

Primary source and setup: https://github.com/ErickAmestegui/fixpilot-x

Judge reproduction guide: https://github.com/ErickAmestegui/fixpilot-x/blob/main/docs/JUDGE_QUICKSTART.md

Additional independent developer tool: https://github.com/ErickAmestegui/mcp-scenario-lab

Do not present the owner-private Sites URL as unrestricted judge access. A locally runnable public repository and public demo are the primary evaluation route.

## Video demo link

Final 2:14 video: https://youtu.be/ok_BsZNJxzk

Published publicly with entrant authorization. YouTube Studio confirmed publication and completed its checks without reporting problems. An unauthenticated oEmbed request returned HTTP 200, and the privacy-enhanced public embed played to 40 seconds without requesting sign-in. Local source duration is 2:14.24; English captions are burned into the image, with no narrated audio.

Backup, retained unchanged: https://youtu.be/cmGh1VtHgUk

## Primary track

Alexa+

## Alexa+ category disclosure

FixPilot X submits through the simulated Alexa+ experience route. Codex assisted development; runtime commands use bounded deterministic routing. The planner, 3D models, inventory changes and tool operations execute real code. The optional MCP implementation is genuine and runs locally over Streamable HTTP with observed protocol 2025-11-25, initialization, discovery and calls. There is no native Alexa+ or Echo connection, private Amazon SDK/CLI/simulator, Alexa voice, Shopping integration, runtime LLM or AWS service.

## Explain the MCP integration

The browser uses the official MCP SDK Client and StreamableHTTPClientTransport to connect to a loopback server using McpServer and StreamableHTTPServerTransport. It initializes the protocol, discovers 18 tools, transfers validated current progress, then performs real tools/call operations such as mark_part_missing, complete_step and restore_part. Tool results update the same state that drives the plan and 3D view. Tests verify 2025-11-25 negotiation, isolation, schema errors, blocked-operation refusal, confirmation, export/restore and cleanup. Server sessions live in RAM; durable browser memory uses separate per-project localStorage and validated JSON backups. No continuously hosted public MCP endpoint is claimed.

## Mini challenge selection

Open Source. Do not select AWS Builder on current evidence: no actual Kiro Crew task or AWS integration is verified.

## Open Source contribution URL

https://github.com/ErickAmestegui/mcp-scenario-lab/tree/v0.1.0

## Open Source repository URL

https://github.com/ErickAmestegui/mcp-scenario-lab

## GitHub username

ErickAmestegui

## Open Source contribution description

I created MCP Scenario Lab as a new, additional MIT-licensed developer tool alongside FixPilot X. It tests stateful MCP workflows that discovery-only checks miss: a tool response may look successful while leaving incorrect state behind.

The generic JavaScript CLI uses the official SDK to initialize Streamable HTTP sessions, discover tools, execute trusted JSON scenarios, check structured results with JSON Pointer assertions, and generate JSON/Markdown reports. Tool names and state expectations come from configuration, not FixPilot-specific logic. Expected tool/JSON-RPC errors are distinguished from transport failures; an unexpected state stops dependent calls, and session cleanup is reported.

An original inventory fixture demonstrates mutation, rejection without state loss and recovery. An optional scenario tests B7 recovery against the actual FixPilot server. Fifteen automated tests passed, including real JSON and SSE HTTP sessions; the independent inventory scenario passed 6/6 calls and the FixPilot scenario 7/7. Public Node 22/Ubuntu CI passed, and a clean public clone installed and passed all tests. This is a reusable regression tool, not an official protocol conformance certifier. Complete source, MIT license, examples, evidence and limitations are public in the separate repository.

## Product Feedback

**Official MCP TypeScript SDK:** Used for genuine client/server initialization, Streamable HTTP, discovery, tool calls and cleanup. The shared transport APIs made the assembly engine reusable across clients. Real integration tests worked for isolated sessions and validated snapshots. JSON versus SSE response handling needs careful attention in custom observation code; the related bug was in our Scenario Lab observer, not the SDK. We would use it again.

**React, TypeScript and Vite:** Used for UI state, typed engine integration and development/production builds. Incremental integration and clean-clone builds worked. Windows helper resolution and generated-video watching needed local workarounds; the production bundle remains about 1.1 MB before gzip and merits later optimization. We would use this stack again.

**Three.js and Lucide:** Used for original procedural 3D geometry, camera/selection controls and interface icons. Code-generated models avoided purchased assets and made inventory/progress state visible. Software WebGL tests do not establish performance across physical GPUs; broader device and spatial-accessibility testing remains. We would use them again.

**Node.js, Express, CORS and Zod:** Used for the loopback MCP service, origin handling and tool-input validation. Session isolation, rejected origins, malformed requests and schema validation were exercised. The prototype intentionally has no public authentication or durable server database. We would use them again with separate production-hosting work if needed.

**Web Audio and Web Speech:** Used for optional synthesized tones, browser recognition and speech output. Sound starts disabled and text remains usable. Recognition support varies and may use a browser-vendor service. Simulated API tests do not verify a physical microphone or audible quality. We would use these as optional enhancements, never as the only interaction path.

**Vitest, Playwright and GitHub Actions:** Used for domain/HTTP tests, browser scenarios, authentic screen recording and Ubuntu verification. Separate evidence classes helped distinguish real transport calls from simulated speech/audio events. Browser executable detection and excluding generated files from source watching improved reproducibility. We would use them again.

**Codex, GitHub and Sites:** Codex assisted implementation and review; GitHub provides public source, MIT licensing, tags and CI; Sites retains the stable supplemental V2 preview. The Site is owner-private and does not host the loopback MCP service. Public source and the video provide the primary judge route. We would use these tools again with explicit access checks.

**Alexa+ developer tools:** Only public documentation was used. Gated SDK/CLI/simulator access and native device onboarding were not available or claimed. The official FAQ clarified the simulation route. Consistent access notices on individual setup pages would help; no hands-on Amazon product defect is asserted.

## Friction log 1

Tool: Vite development watcher on Windows, with Playwright recording output.

Task: Finalize an authentic WebM recording while keeping the local preview running.

Steps: Start Vite; run the final recorder with output under demo-final-results; finalize video.webm while the watcher monitors that generated directory.

Expected: Generated recordings do not trigger source reload or terminate the preview.

Observed: A Windows EBUSY file-watch error stopped Vite; the next browser batch failed with ERR_CONNECTION_REFUSED. The recording itself passed. This was our development configuration, not an Amazon defect.

Severity: Medium.

Workaround: Exclude recording, test-result and report directories from the source watcher; restart Vite. All nine browser scenarios then passed.

Recommendation: Keep generated media outside watched source trees or ignore it explicitly, and check preview reachability before browser suites.

## Friction log 2

Tool: Sites installation helper and Node/npm on Windows.

Task: Install the existing application's dependencies.

Steps: Run the original helper install flow from the Windows project directory using the then-current bundled runtime configuration.

Expected: Invoke the installed npm entry point.

Observed: The helper resolved npm beneath the project and failed with MODULE_NOT_FOUND. The original runtime conditions may differ on other machines; no Amazon SDK defect is claimed.

Severity: Medium.

Workaround: Invoke the installed Node executable with the official absolute npm CLI path and workspace cache. Subsequent installation and builds succeeded.

Recommendation: Resolve npm from runtime metadata, validate the resolved path and give an actionable diagnostic before installation.

## Optional feature request

Tool: Alexa+ public developer documentation.

Request: Show a consistent access-status notice on every gated SDK/CLI/simulator setup page, with a direct link to the supported hackathon simulation/MCP route.

Why it matters: The official FAQ explains the access restriction, but developers can reach individual setup guides before finding it.

Priority: Important. This is documentation feedback based on the official FAQ, not a claimed private-tool test.

## Testing instructions / credentials

No judge credentials, Echo, AWS account or paid API key are required for local evaluation. Clone the public repository, run npm ci, npm test and npm run dev, then open the printed localhost URL. Start npm run mcp in a second terminal; choose Configuración → Integración MCP opcional → Conectar servidor local. Follow JUDGE_QUICKSTART.md for the exact B7 and organizer commands. Do not use the owner-private Site as the only test route. The UI is Spanish; judge instructions and the demo captions are English.

## Entrant-only fields

The entrant must personally provide accurate team/identity information, residence, age and eligibility disclosures; review ownership/licensing attestations; confirm category selections and linked materials; accept the applicable declarations; and press Submit. No personal information or eligibility answers are supplied by this software package.
