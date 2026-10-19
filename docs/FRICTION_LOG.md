# Product feedback and authentic friction log

Prepared 19 October 2026. Recorded development observations, not newly reproduced failures. Historical fixes are not reopened for demonstration. Research-tool, environment and our own defects are distinguished from Amazon products. No private Amazon SDK, Echo, AWS runtime or Kiro Crew was used. No Amazon product defect is asserted.

## F01 — Prize-route research fetch

| Field | Record |
| --- | --- |
| Tool | Research browser / Devpost fetch |
| Task attempted | Verify official prize details. |
| Reproduction steps | Open `https://amazonappdev2026.devpost.com/prizes` through the research fetch alongside `/rules` and `/details/faqs`. |
| Expected | Readable prize information. |
| Observed | Fetch returned `Internal Error`; rules loaded. Root cause was not isolated. This does not establish failure in a normal browser or Devpost itself. |
| Severity | Low; alternate authoritative source available. |
| Solution applied | Read the prize table in official rules. |
| Developer recommendation | Fetch client should distinguish its own failures from page/HTTP errors; retain the rules table as canonical. |
| Evidence / limit | Prior development record; no retained network trace or claim of ongoing failure. |

## F02 — Windows npm helper resolution

| Field | Record |
| --- | --- |
| Tool | Sites local installation helper and Node/npm on Windows |
| Task attempted | Install existing project dependencies. |
| Reproduction steps | Run the original helper install flow from the Windows project directory with the then-current bundled runtime configuration. |
| Expected | Invoke installed npm and install dependencies. |
| Observed | Helper resolved npm beneath the project and failed with `MODULE_NOT_FOUND`. Environment/helper integration issue, not Amazon SDK behavior. |
| Severity | Medium; initial build blocked. |
| Solution applied | Invoke installed Node with the official absolute npm CLI path and a workspace cache. Later installs/builds succeeded. |
| Developer recommendation | Resolve npm from runtime metadata and validate/display the resolved path before invocation. |
| Evidence / limit | Recorded setup outcome. Original runtime conditions may not exist on another machine; README uses normal npm instructions. |

## F03 — Browser could not reach restricted preview

| Field | Record |
| --- | --- |
| Tool | Vite in a restricted execution network |
| Task attempted | Open localhost preview. |
| Reproduction steps | Start Vite in the original restricted network context, then open its loopback URL in the attached browser. |
| Expected | HTTP 200 and app UI. |
| Observed | Browser could not reach the first server. No application or Amazon defect was established. |
| Severity | Medium; visual verification blocked. |
| Solution applied | Restart same server with approved network access; HTTP 200 and rendering observed. |
| Developer recommendation | Check reachability from the browser network context and explain when browser/execution sandboxes differ. |
| Evidence / limit | Recorded HTTP/render result and subsequent browser checks; not a general claim about every sandbox. |

## F04 — Our non-finite audio boundary

| Field | Record |
| --- | --- |
| Tool | FixPilot Web Audio wrapper and Vitest simulated API |
| Task attempted | Keep optional tones finite and quiet for invalid volumes. |
| Reproduction steps | Supply a non-finite `SoundBus` volume, unlock through the simulated context, play a cue, inspect envelope gain. Parameterized boundaries are in `tests/audio.test.ts`. |
| Expected | Finite gain within the quiet maximum. |
| Observed | Initial tests exposed a non-finite boundary. This was our implementation bug. |
| Severity | Medium; malformed preferences could break sound playback. |
| Solution applied | Corrected gain sanitization/clamping in `src/audio.ts`; 25 audio checks passed in recorded verification. |
| Developer recommendation | Validate persisted numeric preferences at the audio boundary and keep invalid-number regressions. |
| Evidence / limit | `tests/audio.test.ts`, `src/audio.ts`, `EVIDENCE.md`. Simulated API tests do not establish audible hardware quality. |

## F05 — Browser executable unavailable

| Field | Record |
| --- | --- |
| Tool | Playwright on Windows |
| Task attempted | Run V2 browser scenarios. |
| Reproduction steps | Launch the old Edge-only configuration on a host without the configured `msedge.exe`. |
| Expected | Installed compatible browser launches. |
| Observed | Checks could not start because previous executable was absent. Browser availability issue, not an Amazon or app runtime error. |
| Severity | Medium; browser regressions blocked. |
| Solution applied | Configuration now checks explicit override, Edge paths and Chrome. V2 scenarios ran in Chrome; other systems can install Playwright Chromium. |
| Developer recommendation | Document a browser override and validate the executable before tests. |
| Evidence / limit | `playwright.config.ts` and nine results in `EVIDENCE_V2.md`. Speech-event simulation is not physical microphone testing. |

## F06 — Historical count repeated without version qualifier

| Field | Record |
| --- | --- |
| Tool | Our feedback documentation and MCP catalog |
| Task attempted | Describe current tool discovery accurately. |
| Reproduction steps | Compare V1 `EVIDENCE.md` and old feedback paragraph against V2 definitions/discovery assertion. |
| Expected | Versioned historical results and consistent current count. |
| Observed | V1 correctly recorded 17 tools; an unqualified feedback paragraph repeated 17 after V2 added `explain_part_impact`. Our documentation defect. |
| Severity | Low; behavior unaffected, reviewer trust at risk. |
| Solution applied | Current feedback explicitly distinguishes V1 17 from V2 18; historical V1 evidence remains unchanged. |
| Developer recommendation | Tie claims to releases and derive current assertions from actual discovery. |
| Evidence / limit | `server/mcp.ts`, `tests/mcp.test.ts`, `EVIDENCE.md`, `EVIDENCE_V2.md`. |

## F07 — Recording output crashed the local development watcher

| Field | Record |
| --- | --- |
| Tool | Our Vite development configuration on Windows / Playwright recording |
| Task attempted | Finalize a local WebM screen recording while the development preview was running. |
| Reproduction steps | Run Vite; run the final recorder with output beneath `demo-final-results`; finalize its `video.webm` while the watcher monitors that directory. |
| Expected | Generated recording files do not affect source hot reload or preview availability. |
| Observed | The watcher raised Windows `EBUSY` for the locked WebM and stopped Vite. The completed recording passed; the next nine browser checks failed immediately with `ERR_CONNECTION_REFUSED`. This was our development configuration, not an Amazon defect. |
| Severity | Medium; local preview/testing interrupted, deployed static Site unaffected. |
| Solution applied | Exclude recording directories, test results and Playwright reports from Vite's source watcher; restart the local preview and rerun the browser checks. Final rerun results are recorded in `EVIDENCE_FINAL.md`. |
| Developer recommendation | Keep generated media/traces outside watched source directories, or ignore them explicitly; surface server availability before running browser suites. |
| Evidence / limit | Actual watcher error and failed navigation were observed during the October 19 final pass. The fix affects local development, not the assembly engine. |

## Product feedback

| Tool and purpose | Onboarding / what worked | What needs work / limits | Would use again? |
| --- | --- | --- | --- |
| Official MCP TypeScript SDK: server and browser transport | Shared APIs supported initialization, discovery, calls and termination; real HTTP checks covered isolated sessions and snapshots. | Distinguish transport errors from domain warnings. Our loopback deployment lacks public hosting/auth. No SDK bug or benchmark claimed. | Yes; another client can reuse the tested engine. |
| React / Vite / TypeScript: UI and build | Incremental integration and type checks worked; public clean clone compiled. | Windows helper/network setup needed F02/F03; bundle about 1.1 MB before gzip is an optimization opportunity, not a measured latency claim. | Yes for a browser prototype. |
| Three.js: original geometry, camera, animations | Code-generated assets avoided purchases; browser checks covered view controls, selection and missing-part rendering. | Software WebGL is possible in tests. Broader GPU/device and spatial-accessibility validation remains. Buttons supplement 3D picking. | Yes for this spatial workflow. |
| Web Audio / Web Speech: optional tones and voice | Off by default, text fallback and simulated API checks supported safe optional enhancement. | Browser support varies and recognition may use a vendor service. No physical microphone/audible-quality check. F04 was our bug. | Yes, with text fallback. |
| Codex: development assistance | Helped implement/inspect/test existing source; output was verified against behavior. | Not native Alexa integration or a runtime model; generated changes still need review. | Yes with reproducible checks. |
| GitHub: code and CI | Public source, MIT, tags and lockfile support independent review; V2 URL verified. | Hosting does not submit Devpost or grant private Site access. | Yes. |
| Sites: supplemental preview | V2 saved/deployed while V1 remained recoverable. | Owner-private; does not host loopback MCP. Public code/video or resolved audience access is required for judges. | Yes with clear audience controls. |
| Playwright / Vitest: checks and recording | Separated domain, real HTTP and UI evidence; recording uses actual actions. | Browser availability needed F05; mocks do not replace hardware validation. | Yes. |
| Alexa+ developer tools: documentation only | FAQ clarified allowed route and gated access. | No hands-on SDK onboarding/device tests claimed. Consistent gating notices on setup pages would help; this follows FAQ disclosure, not an invented personal incident. | Evaluate after access; no direct-use verdict. |

Dependencies and browser APIs are not Amazon products. Submit relevant authentic entries without relabeling them as Amazon defects or promising a bonus. The current live MCP catalog is **18** tools; historical V1 evidence correctly records **17**.
