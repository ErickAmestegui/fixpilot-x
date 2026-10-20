# Rescue Challenge delivery — October 20, 2026

**Local recommendation: SHIP, subject to successful publication verification.** The original deterministic engine has not been replaced. Qwen remains frozen and NO-SHIP on its separate branch. No Devpost form, Submit button or contestant declaration has been changed.

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

Planned public Challenge: https://erickamestegui.github.io/fixpilot-x/challenge/ . Deployment commit, workflow result, public smoke verification and supplementary video link will be recorded after the actual publication. Until then, this is not a claim of a completed deployment.

The definitive existing contest video remains https://youtu.be/-VrmiK0tyqg and is not replaced. The new recording is supplementary. Its examples use scripted UI actions for reproducibility, while all consequences and MCP responses execute real code. No state or result mocking is used in that recording.

## Entrant action

Review [exact Devpost additions](CHALLENGE_DEVPOST_UPDATE.md). Keep the current video field and personal declarations unchanged unless you independently choose otherwise. The public Challenge uses the browser engine; actual MCP transport and the tested official Apps host require localhost. No blocking LLM dependency is introduced into the candidacy.
