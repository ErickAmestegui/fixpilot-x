# Podium Push — delivery and evidence

Runtime/source checkpoint: **321839ed4c72eb4a8cc8d1a47145d0e797daec5b**, branch `podium-push`. Pre-change checkpoint `checkpoint-before-podium-push` points to **c52a7e527afadebd3eba3196865e79f7060d71e7**. Both branches are published. No merge into `main`, `rescue-intelligence` or `real-ai-copilot`.

## Decisions

| Improvement | Decision | Evidence and boundary |
|---|---|---|
| Optional Judge Mode | SHIP | Real selectable shortages, independent comparison, approved recovery and the existing 3D model. Rendered interactive controls reduced from 57 to 28 in the same state. Roughly one minute is the experience target, not a measured beginner result. |
| One local MCP launch | SHIP for the verified Windows setup | Clean source copy initially had no dependencies; launcher installed 218 locked packages and built both host/card. Three final complete host checks passed, 10 genuine MCP calls each. Node 24.16 tested, Node 22+ prerequisite. Native macOS/Linux execution remains untested. |
| Beginner test protocol and template | SHIP as research materials | Three tasks, definitions, blank recording fields, consent and predeclared internal gates are ready. |
| Claim of validated human impact | NO-SHIP | Zero participants. Actual beginner sessions and their outcomes are still pending. No interview, participant, time-saving or usability success is invented. |

## Use and reproduce

- Guided preview: `https://erickamestegui.github.io/fixpilot-x/podium/?judge`.
- Preserved Challenge: `https://erickamestegui.github.io/fixpilot-x/challenge/`.
- Preserved classic Rescue: `https://erickamestegui.github.io/fixpilot-x/?rescue`.
- Source: `https://github.com/ErickAmestegui/fixpilot-x/tree/podium-push`.
- Download that branch, install Node.js 22+, then double-click `Start-FixPilot.cmd` on Windows or run `npm run local`. First launch needs internet for dependencies. Click **Connect MCP App** after the host opens. A printed URL provides a browser fallback. Keep the terminal open; Ctrl+C stops owned services. Ports occupied by other processes are refused, never silently reused or killed.

MCP remains at loopback `127.0.0.1:3101`; the local production host is at `127.0.0.1:5175`. The public preview uses the original browser dispatcher, **not** MCP HTTP. Official SDK Apps handshake and real Streamable HTTP are verified in the included local reference host; no native Alexa+ integration or universal host certification is claimed. Card and separate host approvals, exact-state validation and origin checks remain intact.

## Actual checks

- 219/219 unit and integration tests; production build passed.
- 22/22 browser scenarios (18 existing, four new). The four affected Judge cases passed again after the final preview-readiness guard. CI performs the full suite against the published runtime commit.
- B7 retains two starting reports; B1 loss invalidates step 2 but preserves step 1. Recovery never resurrects invalidated reports. Second assembly O5 and restarting the guide are covered.
- Identical repeated preview proposals are recomputed and reset approval. The before-fix failure was reproduced eight times and retained. Initial-preview timing failures and follow-up successes are disclosed in `podium-evidence/development-note.json`; only the final gated build is proposed for release.
- Three complete checks of the final production MCP App: 22-tool discovery, official Apps handshake, genuine preview/comparison/apply, host decline without mutation, then approved recovery to 2/8. Nonlocal Origin rejected with 403. Actual arguments, timings and source hashes are retained in the three `clean-install-gated-*.json` files.
- Original checkout and isolated copy produced identical named bundles. Windows command wrapper executed and reached both ready services; automatic browser opening is best effort, with printed URL fallback.
- Packaged smoke check: ten preserved public files match their original SHA-256 and byte count; independent C1 shortage/comparison/recovery ends at 2/8; saved classic progress remains unchanged; no page errors or MCP requests in public browser mode.
- Production dependency audit: zero vulnerabilities at verification time. Original engine, server, 22 tools and viewer source remain unchanged. The previous 4,608-call engine matrix is preserved, not unnecessarily rerun for this UI/launcher change.

Videos are actual automated UI recordings, not human research: `demo-podium-results/fixpilot-judge-mode.webm` (about 53 seconds, English authored captions, no audio), and `demo-podium-results/clean-install-mcp-app.webm`. The files are local; metadata/digests are in `podium-evidence/videos.json`. Recreate the guided recording with `npm run dev` and, in another terminal, `npm run demo:podium`; stop another local MCP launcher first. No contest video was replaced or uploaded.

Run [the three-task protocol](BEGINNER_VALIDATION_PROTOCOL.md) with actual beginners and fill [the CSV template](beginner-validation-template.csv). No synthetic observations are acceptable as user validation.

## Publication verification

Verified live on October 21, 2026: HTTP 200, runtime commit 321839ed4c72eb4a8cc8d1a47145d0e797daec5b. Both CI runs and the deployment job completed successfully. A new anonymous browser completed C1 and B7 shortages, independent comparison, explicit application and recovery. Ten previous public files retain their exact hashes. Final state preserved reports [1,2], with no missing parts. Local launcher was relaunched and the real MCP host verification passed (22 discovered tools, 10 calls, host decline unchanged, fresh approval required). No functional code changed during closure. See closure.json, closure-local.json, closure-public-export.json and public-live.json.

The requested 90-second evaluation sequence is functionally covered. No human completion-time claim is made: the raw browser inspection recording includes command pauses (3:19), while the existing paced technical demonstration lasts about 53 seconds. Real beginner timing remains pending.

CI references: [source verification](https://github.com/ErickAmestegui/fixpilot-x/actions/runs/39549795858), [publication and full browser gate](https://github.com/ErickAmestegui/fixpilot-x/actions/runs/39549795770).

No Qwen development/evaluation, new model, paid API, Devpost change/submission, personal declaration, official contest-video change or Scenario Lab repository change was made. Existing public demonstrations are preserved by hashes, not reconstructed.
