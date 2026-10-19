# Alexa+ eligibility and evidence audit

Checked 19 October 2026. Engineering review, not an eligibility ruling. The organizer decides eligibility. This document neither submits the project nor completes personal declarations.

## Selected route

**Submit a simulated Alexa+ experience built using Codex, with source and a working web demonstration.** Runtime command routing is bounded and deterministic. The planner, inventory and 3D run real code. There is no native Alexa connection, runtime LLM, private Amazon SDK, Echo requirement, AWS service or Shopping integration.

The [official rules](https://amazonappdev2026.devpost.com/rules), Alexa+ submission paragraph, permit simulation without a prescribed runtime framework or MCP surface. The [official FAQ](https://amazonappdev2026.devpost.com/details/faqs) confirms gated Alexa+ tools are unavailable to entrants. The additional MCP server demonstrates interoperability, not Amazon deployment.

## Evidence checklist

Source inspection and the existing [V2 verification record](EVIDENCE_V2.md) support the findings below. This audit does not claim a new test run. Reproduce checks using the README.

| Requirement / evidence | Implementation and reproducible check | Limit |
| --- | --- | --- |
| Functional simulation | `src/intent.ts` resolves supported requests; `src/App.tsx` invokes the engine or connected client; `src/engine.ts` updates graph-derived state. | No general AI reasoning. Codex is a development tool. |
| Real Streamable HTTP | `server/mcp.ts` instantiates official SDK `McpServer` and `StreamableHTTPServerTransport`; `/mcp` delegates requests to that transport. `src/mcp-client.ts` imports and calls the official client transport. | `/health` alone is not MCP evidence. Streamable HTTP may return JSON; continuous SSE is not necessary for every result. |
| Version negotiation | `tests/mcp.test.ts` initializes over actual HTTP with `2025-11-25`, asserts the returned version/session ID and terminates the session. | This tests compatibility; no custom minimum-version rejection policy exists. The health field is descriptive, not enforcement. |
| Discovery | SDK client connects and calls `listTools`; test asserts 18 tools and the confirmation schema. | Historical V1 had 17; V2 adds `explain_part_impact`. |
| Real calls / modifications | Integration scenario confirms work, marks B7 missing, refuses blocked work, completes alternatives 3/6, restores B7 and reaches 8/8. Another scenario reaches organizer 6/6 with tool recovery. | Returned live states, not fixtures presented as execution. |
| Confirmation | Completion without confirmation preserves progress; UI has an explicit checkbox. Cascading undo requires confirmation. | A recorded user report is not physical inspection. |
| Errors | Tests exercise invalid schemas (`isError`), malformed snapshots (domain warning), unknown sessions, missing initialization and remote origins. Browser validates incoming state. | A valid missing-part change may return `kind: warning` with `isError: false`. Read both returned state and domain result. |
| Isolation | Each initialized session owns separate engine state; two-client test verifies it. | RAM only, not cloud accounts or a durable server database. |
| Export / restore | `save_progress` returns serialized state; `restore_progress` validates it. Test transfers snapshots between sessions and checks rejection preserves existing work. | Caller must persist the returned data. Restart/expiry loses unsaved server state. |
| Browser persistence | `src/projects.ts` uses separate localStorage keys for table and organizer. Browser checks cover switching/reload; UI offers validated JSON backups and storage-write feedback. | Origin/profile-specific; clearing storage loses memory. No cross-device sync. |
| Inspector | `src/PlanInspector.tsx` displays real arguments and before/after plans/blockers. | Detailed traces are capped and reset on project switch; persisted engine audit history is a separate record. |
| Cleanup / protection | SDK session termination on disconnect/test cleanup; loopback binding, host/origin checks and session isolation. | No public auth, durable hosting, resumable event-store guarantee or official conformance certification. |

The normative reference is the [MCP 2025-11-25 transport specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports). Tests sample relevant behavior; they are not exhaustive protocol certification.

## Judge access and remaining gates

The [public repository](https://github.com/ErickAmestegui/fixpilot-x), MIT license, local instructions and [public backup demo](https://youtu.be/cmGh1VtHgUk) are the primary evaluation route. Sites is owner-private: **do not describe its URL as unrestricted judge access**. If used as a private test target, resolve access and document it without publishing personal credentials. A separately verified free public static preview can supplement the repository. MCP must be tested from localhost; remote browser origins are rejected intentionally.

Rules require accessible code/video, English materials, product feedback and a video below three minutes. Private website testing requires access instructions. Maintain evaluation access through November 20. Target submission is October 22; official cutoff is October 23, 2026, 15:00 America/La_Paz. Eligibility declarations, account authorization and final submission remain personal entrant actions.

## Kiro Crew / AWS Builder decision

**Do not claim AWS Builder on current evidence.** No actual Kiro Crew task or runtime AWS use is recorded. Codex is not Kiro.

Rules recognize Kiro Crew development use without a runtime AWS service. [Official Crew information](https://kiro.dev/crew/) says its software is free/open source but inference requires a signed-in Kiro account and consumes plan usage. [Pricing](https://kiro.dev/pricing/) advertises a $0 tier with 50 credits and includes Crew. This is a potential free route, not proof that this user's account has access or remaining quota. [Setup documentation](https://kiro.dev/docs/crew/) supports Windows and requires first-run sign-in.

Read-only inspection found no `kiro-cli`, `kirocrew` or `kiro` command on PATH. Account access/quota and a successful task are unverified. No billing, upgrade, promotional credits or installation was activated in this audit. If access becomes available, verify the $0 plan, perform one useful review task, retain prompt/output and tested changes, and stop at any account/payment gate. Until real evidence exists, omit this mini-challenge claim.

## Open Source separation

The primary MIT repository alone is not an additional contribution. MCP Scenario Lab needs substantive independent implementation, license, verified public URLs and its own evidence before being claimed. Its publication is recorded separately; this audit does not predeclare it.
