# The Rescue Challenge

The `rescue-challenge` branch starts at stable Rescue checkpoint `ea8be24`. Qwen remains frozen on `real-ai-copilot` at `75b4a14`; no model, LLM endpoint, weight download or paid service is used here.

## What the judge can challenge

Open `/?challenge` locally. Select either original assembly, enter prior completed steps and optional starting shortages, then launch a **simulated, isolated challenge record**. Prior steps must satisfy the real dependency graph. Resource shortages are calculated after those reports; installed-part loss may invalidate reports, while tool loss never retroactively undoes completed work.

Change any catalog part or tool to missing, recovered or unchanged. Live previews run after a 220 ms input debounce. There are no stored scenario answers. The original planner computes readiness, shortage blockers, withdrawn digital confirmations and graph paths. Capture option A, edit B and compare: both use the same authoritative record, without inheriting each other's draft. Recovery never resurrects a withdrawn report.

The existing Three.js viewer shows the displayed state. Missing components are labeled red ghosts; exploded and final-reference views remain distinct from recorded assembly progress. The dependency map uses the original catalog edges and planner statuses. Its nodes and the step buttons are keyboard accessible.

Approval starts unchecked, resets when inputs change and uses the preview's exact state token. The original engine rejects stale or unapproved application. Individual completion reports still require a separate checkbox and validation. This is a digital demonstration of the original educational models, not physical inspection, manufacturer instructions, structural certification or a dismantling recommendation.

The Challenge never reads or writes the saved assembly's browser storage. Its record is in memory and resets on reload. Export JSON before closing it. Classic Rescue keeps its original persistence.

## Run

Requirements: Node.js 22+, npm and a modern WebGL browser. No API key or account is required to run locally.

```sh
git clone --branch rescue-challenge https://github.com/ErickAmestegui/fixpilot-x.git
cd fixpilot-x
npm ci
npm run build
npm run mcp
# In another terminal:
npm run dev
```

Open `http://127.0.0.1:5173/?challenge` and choose **Connect real MCP**. It discovers the existing 22-tool catalog and creates a separate session; it does not transfer changes to a saved user project. Browser-only mode is labeled explicitly and uses the same original dispatcher, without MCP transport.

## Official MCP Apps feasibility and implementation

The official extension and SDK were investigated first. A working minimal browser integration was obtained within the two-hour research/integration limit: actual MCP initialization, 22-tool discovery, UI resource read, Apps handshake and a real preview. The extension did not need to be abandoned.

We pinned the official `@modelcontextprotocol/ext-apps` 1.7.5 and compatible MCP SDK 1.32.1. This retains the existing SDK generation instead of migrating the stable server to SDK v2. Only the four existing Rescue tools gain UI metadata: `preview_scenario`, `compare_scenarios`, `explain_recovery`, `apply_scenario`. **There are still 22 MCP tools.** The new resource is `ui://fixpilot-x/rescue-card.html`, MIME `text/html;profile=mcp-app`.

Open `http://127.0.0.1:5173/?mcp-app`. Our **local reference host** uses the official `AppBridge`; the card uses official `App`. The host advertises `io.modelcontextprotocol/ui`, reads the server resource and completes `ui/initialize` / `ui/notifications/initialized`. Card operations travel through the bridge and genuine MCP Streamable HTTP. This is an actual MCP App implementation verified in this host, not a claim of certification or verified compatibility with Alexa+, ChatGPT, Claude Desktop or every other host.

The self-contained card reuses the Challenge and original 3D viewer. It runs in a script-only iframe with an opaque origin, no `allow-same-origin`, no direct network access and a restrictive CSP. Message transport checks the source window. The host proxies only the required Rescue and fixture/report capabilities. Applying a scenario requires an additional, separately unchecked **host** approval; the embedded card cannot click it through the sandbox. There is no sampling or LLM generation.

`npm run build:mcp-app` produces the ignored `.mcp-app/rescue-card.html`. Build it before reading the resource. Other hosts must implement the official extension and their own approval policy; unsupported hosts can still use the original tools without rendering the card. The ~1.32 MB self-contained UI and third-party host policies have not been universally tested. The server is deliberately loopback-only, not a free public authenticated MCP service.

Official sources: [MCP Apps SDK and compatibility notes](https://github.com/modelcontextprotocol/ext-apps), [v1.7.5 basic-host reference](https://github.com/modelcontextprotocol/ext-apps/tree/v1.7.5/examples/basic-host), [official quickstart](https://apps.extensions.modelcontextprotocol.io/api/documents/quickstart.html).

## Verify and reproduce

```sh
npm test
npm run build
# Leave Vite running, stop any separate MCP server before the browser suite:
npm run test:e2e
# Starts its own real MCP server on an unused port:
npm run test:challenge:matrix
# With npm run mcp running, replay exports in fresh isolated sessions:
npm run challenge:replay -- docs/challenge-evidence/real-mcp-export.json
npm run challenge:replay -- docs/challenge-evidence/organizer-export.json
npm run challenge:replay -- docs/challenge-evidence/demo-export.json
# Stop the separate MCP server first; the recording starts its own:
npm run demo:challenge
```

The matrix checks all part/tool-shortage subsets in both assemblies at three simulated progress profiles: 4,608 actual MCP preview calls. It does not enumerate every valid progress sequence or certify physical safety. The replay recalculates current state tokens and compares final inventory/progress; audit timestamps and IDs are regenerated. Recorded digital approvals are replayed only in a new synthetic session.

The recording uses UI actions, actual MCP and official Apps handshakes. Captions describe the observed UI; they do not inject state or tool responses. Its selected examples are scripted for reproducibility, while outcomes are calculated live. It is not an independent user study or an unseen-language benchmark.

## Evidence and limitations

- 219 unit/integration tests passed: all 204 stable tests plus 15 Challenge boundaries.
- 18 browser tests passed: 13 existing regressions plus 5 Challenge flows, including real HTTP, late loss/recovery, 8/8, the organizer, nonempty saved-project preservation, mobile and host approval rejection.
- 4,608 genuine MCP calculations passed; [summary and raw hash](challenge-evidence/matrix-summary.json), [lossless raw JSON archive](challenge-evidence/matrix.json.gz). The generated plain JSON stays available locally. The original full demo responses are also losslessly archived; its readable transcript substitutes the bundled HTML body with its byte count/hash, retaining all actual tool results.
- Three exports replayed to the same final inventory/progress; see `replay-table.json`, `replay-organizer.json`, `replay-demo.json` in [evidence](challenge-evidence/).
- One genuine recording passed. Actual video duration: 92.60 seconds, 1600×1000 VP9/WebM, English captions, no audio narration. The existing contest video is unchanged.
- Dependency audit reported zero known vulnerabilities in this branch's installed dependency graph on October 20, 2026. This is not a general security certification.
- The original large main-bundle build warning remains. Only two catalog assemblies are supported. Challenge labels are English; the preserved Classic Rescue remains bilingual.

Development failures are not hidden: a seed initially used a legacy installed-part report that refused to invalidate completed work; the fixture now uses original atomic Rescue preview/apply. A pending live preview could erase a just-opened comparison; comparison now waits for a validated current preview. The first matrix's final assertion mistook the legacy getter's audit entry for a Rescue read mutation; its failed artifact is retained losslessly as `matrix-development-failed.json.gz`, and the corrected check uses the deliberately audit-pure Rescue preview. The original engine was not changed to satisfy these checks. Delivery screenshots are fresh real viewport/element captures; earlier full-page originals remain in local checkpoint `4ccab78`.

## Publication boundary

Only publish after passing the checks and showing an advantage over stable Rescue: isolated judge-selected starting records, immediate consequences, visible graph, export/replay and a genuinely interactive MCP App. The planned separate public route is `https://erickamestegui.github.io/fixpilot-x/challenge/`; publication status is recorded in the delivery report.

The release packager verifies the SHA256 of the currently published stable HTML, JavaScript and CSS against [the captured manifest](challenge-evidence/stable-public-manifest.json), preserves those exact bytes at the root, and adds the new build under `/challenge/`. If stable bytes differ, publication fails. No merge into `main` or `rescue-intelligence` is required. Public mode uses the browser engine. Actual MCP transport and Apps need localhost; Alexa+ remains simulated.
