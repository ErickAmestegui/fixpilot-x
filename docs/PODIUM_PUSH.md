# Podium Push

Branch: `podium-push`, based on `rescue-challenge` at `c52a7e527afadebd3eba3196865e79f7060d71e7`. Pre-change checkpoint: `checkpoint-before-podium-push`. No changes to the original engine, its 22 tools, Qwen, the Open Source repository, the contest video or Devpost.

## Judge Mode

Open `?judge` in this version, or choose **Enter Judge Mode** in its Challenge workbench. The optional guide hides advanced controls while preserving the same session. Start an explicitly simulated two-report fixture, choose any table part, preview its absence, review and apply it, compare leaving it missing with recovering it, then preview/review/apply recovery. The model, dependency graph, scoreboard and receipts use real calculated results. Approximately 60 seconds is a target, not a measured beginner result. No automatic clock, canned outcome, LLM or automatic physical completion is used.

Missing an already-used part can invalidate prior reports. Recovery does not resurrect those reports. For example, B7 leaves the two initial reports intact; B1 invalidates step 2 while preserving step 1. Both cases must pass. Switching to the full workbench preserves the record and exposes arbitrary combinations and the second assembly. The public browser dispatcher is not MCP transport; the local MCP connection and Apps host are explicitly labeled.

## One local launch

Prerequisites: Node.js **22+**, npm (included with Node), an extracted source folder, and internet on first installation. Use the `podium-push` branch, or download its [source ZIP](https://github.com/ErickAmestegui/fixpilot-x/archive/refs/heads/podium-push.zip); the older stable branches intentionally do not contain this launcher. Windows: double-click `Start-FixPilot.cmd`. All platforms: open a terminal in the source folder and run:

```sh
npm run local
```

The launcher installs locked dependencies if absent, builds the current host and self-contained card, then starts MCP on **127.0.0.1:3101** and the production preview on **127.0.0.1:5175**. It opens `http://127.0.0.1:5175/?mcp-app`; click **Connect MCP App**. `http://127.0.0.1:5175/?judge` opens Judge Mode; use **Connect real MCP** there for genuine tool transport. `npm run local -- --no-open` suppresses browser opening for reproducible QA.

Keep the launcher window open. Ctrl+C stops its own two services. Ports occupied by another process cause an explicit refusal; the launcher never kills or silently reuses them. A service failure closes the companion service. Setup requires no key, model or paid service. This is one launch action after prerequisites, **not** a zero-install application, a remote hosted MCP service, or universally certified host compatibility. The launcher CLI and Node 24 execution are tested on Windows. Automatic browser opening is best effort with the printed URL as fallback; macOS/Linux native execution requires testing.

Card review and separate host approval remain mandatory. Host decline is not success. Existing exact-state and server origin/loopback restrictions remain. Never expose this unauthenticated local service through port forwarding, public binding or a tunnel.

## External validation

Run [the three-task protocol](BEGINNER_VALIDATION_PROTOCOL.md) with real beginners and fill [the blank CSV](beginner-validation-template.csv). Human impact evidence is pending. No participant or time-saving claims may be inferred from browser automation.

## Evidence and release decision

See `podium-evidence/` for recorded genuine tool calls, exported records, screenshots, installation environment and verification results. Videos are local artifacts under `demo-podium-results/`; they show automated interactions with real calculations, not human research. The existing public Challenge and classic Rescue must remain accessible. This branch must not overwrite their published bytes when packaging a separately hosted improvement.

## Reproduce the engineering checks and video

With dependencies installed, run npm test and npm run build. In one terminal run npm run dev; in another run npm run test:e2e (22 browser scenarios). Stop the local launcher first so the tests can own port 3101. Run npm run demo:podium for the paced, captioned real-MCP recording. It uses the same local dev server and starts/stops its own MCP service. An installed Chromium/Chrome/Edge browser is needed by Playwright; the standard Playwright browser installer can supply Chromium when none is installed. This is engineering QA, not human validation.

The repeated-proposal regression is material: every edit, including identical proposals, reschedules a fresh preview and clears approval. Previous asynchronous results still cannot replace a newer proposal. Before-fix failures and subsequent checks are retained, rather than reporting only successful runs.

Local gate: 219 unit/integration tests pass; 22 browser scenarios pass, with all four Judge cases repeated after the final readiness guard. Three complete production-host checks pass with 10 actual calls each, 22-tool discovery, independent alternatives, host refusal without mutation, approved recovery and nonlocal-Origin rejection. The isolated copy and original build produce identical bundle names. Rendered interactive controls fell from 57 to 28 in the same recorded state; this is not a human usability score. See retained development failures and corrections in podium-evidence/development-note.json. Publication verification is recorded separately after deployment.
