# Rescue Challenge delivery — October 20, 2026

**Recommendation: SHIP. Published and verified without signing in.** The original deterministic engine has not been replaced. Qwen remains frozen and NO-SHIP on its separate branch. No Devpost form, Submit button or contestant declaration has been changed.

The new experience adds a verifiable advantage over Classic Rescue: a judge can choose an isolated starting record, enter different catalog shortages and recoveries, see live consequences and dependency paths, compare independent alternatives, explicitly approve a change and export/replay evidence. The working official-SDK MCP App is an additional local interface, not a native Alexa+ integration.

## Verification actually completed

| Check | Observed result |
| --- | --- |
| Unit/integration | 219/219 passed, including 204 preserved stable tests and 15 Challenge checks |
| Browser regression | 18/18 passed, including five new flows; genuine MCP and official Apps handshake/approval tested |
| Real MCP matrix | 4,608/4,608 passed over protocol 2025-11-25; 22 tools retained; three progress profiles across both assemblies |
| Export replay | Table, organizer and recorded-demo exports matched their final inventory/progress in fresh real MCP sessions |
| Recorded demo | 1/1 passed; 32 observed MCP responses; 92.60-second 1600×1000 WebM, English captions |
| Production and card build | Passed; pre-existing large-main-bundle warning remains |
| Packaged-route browser check | Passed: `/challenge/` works without a query, no browser errors, saved root progress retained, browser mode makes zero MCP network calls |
| Dependencies | Zero known vulnerabilities reported for installed graph after compatible SDK/build-tool updates; production-only audit also zero |

Raw evidence: [challenge-evidence](challenge-evidence/). The matrix is a software/protocol check, not an LLM benchmark or physical safety certification. Its failed development assertion is retained. See [method, real/simulated boundaries and limitations](RESCUE_CHALLENGE.md).

## Checkpoints and publication

Source branch: `rescue-challenge`, based on `ea8be24c0c77525b8bed09f8641a4f93ebb6cce6`. No merge into `main`, `rescue-intelligence` or the frozen `real-ai-copilot` experiment is performed. The separate MCP Scenario Lab repository is not modified.

The existing Pages workflow builds/tests this branch, then packages the SHA256-verified stable public HTML/JavaScript/CSS unchanged at the root and adds the new artifact under `/challenge/`. It deploys only after tests pass. The three existing public assets are pinned in [stable-public-manifest.json](challenge-evidence/stable-public-manifest.json); a mismatch refuses publication.

Public Challenge: **https://erickamestegui.github.io/fixpilot-x/challenge/** . Deployed runtime commit: [`c7b19c2`](https://github.com/ErickAmestegui/fixpilot-x/commit/c7b19c2f54988db79e96818811f546fe5d843f50). [Remote verification and publication](https://github.com/ErickAmestegui/fixpilot-x/actions/runs/39516848422) succeeded on attempt 2. The successful build, browser and matrix jobs were retained; only the initially blocked deploy job was rerun.

Public verification at `2026-10-21T00:01:24Z` (October 20 in Bolivia) passed with a new combined input: B7 and F1 initially missing, then recovery of F1. Readiness changed from step 3 to steps 3 and 6; applying the reviewed recovery kept B7 missing. An existing saved root step remained recorded. No page errors and zero MCP network calls were observed in browser-only public mode. All three original stable asset hashes matched exactly. See [public-live.json](challenge-evidence/public-live.json).

The environment initially rejected the new branch. Only the named `rescue-challenge` deployment policy was added; existing `main` and `rescue-intelligence` policy IDs and rules were retained. [Policy evidence](challenge-evidence/deployment-branch-policy.json). No branch protection was removed and no stable branch was merged or moved.

Git HTTPS transfers were interrupted. The official Git data API published the exact verified tree `295a58c814b453ed046bb48f1f24712b569db48d`; it matches local checkpoint `b09e2f6`. [Publication proof](challenge-evidence/source-publication.json). Original complete local history, including `4ccab78` and `e5563e9`, is preserved on `rescue-challenge-local-checkpoint`. Large evidence is archived losslessly; the full original captures remain in the earlier checkpoint.

The definitive existing contest video remains https://youtu.be/-VrmiK0tyqg and is not replaced. The new recording is supplementary. Its examples use scripted UI actions for reproducibility, while all consequences and MCP responses execute real code. No state or result mocking is used in that recording.

The complete new local file is `fixpilot-rescue-challenge.webm`, 18,255,652 bytes, 92.60 seconds. GitHub release asset uploads were interrupted, so **no public URL for this new video is claimed**. The [source release](https://github.com/ErickAmestegui/fixpilot-x/releases/tag/rescue-challenge-2026-10-20) is public; it must not be presented as a successful video upload. The original local recording is retained. Future `npm run demo:challenge` recordings save inside `demo-challenge-results/` for portable execution.

No product blocker remains in the verified scope. Limitations: actual MCP and the tested official-SDK Apps host require localhost, third-party host compatibility is not certified, and the supplementary video has not been uploaded publicly. This work does not certify physical safety or reopen the experimental LLM.

## Entrant action

Review [exact Devpost additions](CHALLENGE_DEVPOST_UPDATE.md). Keep the current video field and personal declarations unchanged unless you independently choose otherwise. The public Challenge uses the browser engine; actual MCP transport and the tested official Apps host require localhost. No blocking LLM dependency is introduced into the candidacy.
