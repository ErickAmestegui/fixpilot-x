# Rescue Intelligence — delivery

**Recommendation: SHIP the technical upgrade.** The entrant still reviews/updates Devpost and performs submission. No competition award or eligibility is guaranteed.

## Exact links

- Public interactive preview: https://erickamestegui.github.io/fixpilot-x/?rescue
- Definitive public Rescue video (2:24, English UI and captions): https://youtu.be/-VrmiK0tyqg
- Upgrade source: https://github.com/ErickAmestegui/fixpilot-x/tree/rescue-intelligence
- Independent contribution: https://github.com/ErickAmestegui/mcp-scenario-lab/tree/rescue-scenarios
- English Devpost replacement fields: [DEVPOST_RESCUE_UPDATE.md](DEVPOST_RESCUE_UPDATE.md)
- Reproduction / judge challenges / supported commands: [RESCUE_INTELLIGENCE.md](RESCUE_INTELLIGENCE.md)
- Tests and limitations: [RESCUE_EVIDENCE.md](RESCUE_EVIDENCE.md)

## What changed from V2

V2 planned from reported actual inventory. Rescue Intelligence also evaluates validated hypothetical copies, multiple simultaneous setbacks, direct/transitive effects, per-step comparison and graph-derived recovery requirements. The existing planner and renderer remain shared. Human review is separate from exploration; apply rejects a stale base and records one atomic operation. Partial recovery preserves valid work. The new judge workbench is English/Spanish and permits custom resource/undo configurations for both original assemblies.

The genuine MCP catalog grew from 18 to 22 tools: `preview_scenario`, `compare_scenarios`, `explain_recovery`, `apply_scenario`. MCP Scenario Lab independently verifies these calls with generic live-result capture/reuse; it does not depend on FixPilot runtime code.

## Evidence

- 204/204 automated unit/integration tests; nine legacy and four Rescue browser scenarios passed in their documented runs.
- Scenario Lab: 21/21 tests, 3/3 independent capture calls and 13/13 Rescue calls passed.
- Node 22 Ubuntu CI and Pages succeeded at technical checkpoint `b04c18a3a5e3de709e5a41c3821a02f5a7345635`. Scenario Lab CI succeeded at `24af62c4a8d197160cb2237470c2767cf31b3084`.
- Definitive recorder passed with MCP responses through table 8/8, explicit switch to the local engine for the second assembly and retained table progress. Sanitized exchanges are [recorded here](rescue-mcp-recording-evidence.json).
- Public YouTube oEmbed returned HTTP 200 with the correct title without cookies or account credentials. The `youtube-nocookie.com` player on a credential-free local wrapper advanced to 15 seconds. Studio confirmed publication and completed checks with no reported problems. Original WebM duration: 143.68 seconds; YouTube displays 2:24. These are point-in-time checks, not a guarantee against later platform restrictions.
- Public Pages returned HTTP 200, loaded the final asset, disabled remote-origin MCP connection and calculated a new hypothesis successfully. It runs the browser engine. Genuine MCP requires the documented localhost setup.

Proof images: [public preview](screenshots/rescue/public-preview.png), [public playback](screenshots/rescue/public-playback.png), [hypothetical 3D](screenshots/rescue/judge-preview.png), [actual audit](screenshots/rescue/judge-audit.png), [mobile Spanish](screenshots/rescue/mobile-spanish.png).

## Preservation and rollback

`main`, Sites V2, V1/V2 tags and the two earlier public videos remain unchanged. Stable V2 is `devpost-ready-2026-10-19` / `bfa022592175b99293d34e72ad93aebb439cb5d0`. The new free static preview is separate. No force push, license change, paid service, exposed local server or Devpost submission was performed. A superseded first Rescue take remains private and is not the submission link.

Final documentation/media-link commits do not alter the verified runtime; they can skip CI without claiming an unobserved test run. To reproduce this upgrade, clone the branch explicitly rather than default `main`.

## Remaining entrant actions

1. Open the public preview and definitive video yourself.
2. Copy the updated About, Built with, Alexa+ disclosure, Open Source supplement, authentic development feedback and exact links from DEVPOST_RESCUE_UPDATE.md.
3. Select real Rescue screenshots. Replace historical current-version claims with 22 tools and the accurately scoped evidence. Keep V2 as backup.
4. Review team/credits, required category fields, official eligibility and personal declarations. Do not claim native Alexa integration, arbitrary manual conversion, a production LLM or physical certification.
5. Review and submit the entry personally by October 22, 2026. No technical blocker was found in the tested scope; submission itself remains the entrant's responsibility.
