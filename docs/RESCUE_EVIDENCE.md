# Rescue Intelligence verification

Verified locally on October 19, 2026 (America/La_Paz), Windows, Node 24.16.0, Edge Chromium/WebGL. This report describes `rescue-intelligence`, not the historical V2 tag. Raw video evidence timestamps use UTC and may show October 20.

## Actual results

- **204/204 automated unit/integration tests passed** in the final full run: 49 original engine, 68 original intent, 7 catalog, 6 projects, 25 audio, 12 actual MCP HTTP integration, 30 counterfactual/recovery and 7 bounded Rescue intent tests.
- **Nine legacy browser scenarios passed** in the integration run. They covered the original assembly experience including full table/organizer completion and recovery. Historical screenshot artifacts were restored after that run; V1/V2 assets remain intact.
- **Four Rescue browser scenarios passed** after compact-interface and accessibility fixes: nonmutating multi-resource preview/comparison/cancel, explicit apply/partial recovery/stale base/project isolation; real MCP outage/retry; translated English/Spanish mobile instructions and no horizontal overflow; main-conversation entry and keyboard review/cancel with a single canvas.
- Final TypeScript check and production Vite build passed. Bundle warning: the combined Three.js/application JavaScript is approximately 1.18 MB before compression (331 kB gzip); no runtime paid service/API key is required.
- Independent MCP Scenario Lab branch `rescue-scenarios`: **21/21 tests passed**. Its generic inventory capture example passed **3/3 real calls**; the FixPilot Rescue example passed **13/13 real calls**, with 22 tools discovered, protocol `2025-11-25` and HTTP DELETE session termination. Reports omit captured tokens, credentials, arguments and raw state.
- The new automated screen recording completed successfully, including actual MCP preview, compare, explain and apply responses, partial recovery preserving `[1,2,3]`, table completion **8/8**, a second assembly challenge and saved-project isolation. Recorded WebM: **143.88 seconds**, 1600×1000, English UI and full English captions. No audible narration is claimed. The recorder adds observer captions only; state changes use real controls and tool calls.

The 13 browser scenarios were verified in two runs (nine legacy, then four Rescue), not reported as one fabricated combined run. The demonstration is a separate asserted workflow, not an extra inflated unit-test count.

## Adversarial invariants

The Rescue tests enumerate every valid prerequisite-closed completion subset for both supplied schemas and combinations of missing parts/tools. They verify validated results, no mutation of actual state, available/blocked sets from the existing planner, stable confirmed work where valid, and a full partition into changed/unchanged steps. They reject unknown/duplicate IDs, contradictory resource reports, unsupported fields, invalid undo IDs, unconfirmed applies, stale inventory/progress/history/selection, malformed states, exhausted revisions and no-op applies. Missing installed parts cascade affected digital confirmations; tool loss does not erase completed work. Arrays/history are cloned and repeated previews are deterministic.

An intentionally injected HTTP 500 in the browser test verifies that failed preview transport does not partially apply state; a real subsequent MCP preview and approved apply succeed. This is an explicit test fault, not a production incident or real-user friction claim.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run dev
# Separate terminal while dev stays running:
npx playwright install chromium
npm run test:e2e
# Stop other MCP processes on 3101 before recording:
npm run demo:rescue
```

The recorder starts/stops its own actual MCP server. It writes `../fixpilot-rescue-demo.webm` and a sanitized `../fixpilot-rescue-mcp-evidence.json`. Keep runtime media/reports outside Git; screenshots and sanitized evidence can be committed. The old final recorder requires the historical V2 checkout to reproduce its 18-tool assertions.

Real screenshots: [hypothetical model](screenshots/rescue/judge-preview.png), [MCP audit](screenshots/rescue/judge-audit.png), [mobile Spanish](screenshots/rescue/mobile-spanish.png). Captions in judge screenshots are observer overlays from the actual recording. The actual/hypothetical banner and engine statuses are product UI.

## Scope of evidence

These tests demonstrate software behavior for two original educational assemblies. They do not certify physical construction, arbitrary manual ingestion, native Alexa integration, a hosted MCP service, competition eligibility or an optimized repair order. A configured CI workflow is not itself a passing remote run. GitHub Actions and any public preview must be verified separately after branch publication.

Stable rollback: `devpost-ready-2026-10-19`, commit `bfa022592175b99293d34e72ad93aebb439cb5d0`; V1 and V2 tags/videos remain unchanged. Sites V2 is not overwritten by this branch. Browser saves retain schema version 1 and the original storage keys.
