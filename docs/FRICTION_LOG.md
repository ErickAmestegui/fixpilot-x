# Product feedback and evidence log

Prepared October 19, 2026. Only observed incidents belong here. Documentation research is distinct from hands-on product use. No private Amazon developer tool was accessed, so there is no fabricated SDK onboarding or device-testing feedback.

## Observed research incident

| Field | Observation |
| --- | --- |
| Tool / surface | Research browser opening the competition's separate `/prizes` URL |
| Task | Verify prize details from the user-provided official link |
| Steps | Open `https://amazonappdev2026.devpost.com/prizes` alongside rules and FAQ |
| Expected | Readable prize page |
| Observed | Research tool returned `Internal Error`; the rules page loaded successfully |
| Severity | Low; research continued |
| Workaround | Read the prize table in the official rules |
| Limitation | We did not establish whether the failure was the page, fetch service, or network. This is not evidence of an Amazon SDK defect. |
| Suggestion | Keep the rules prize table authoritative and verify linked routes before final submission |

## Product feedback by component

Observed Windows setup issue: the Sites installation helper resolved npm's entrypoint beneath the project and failed with `MODULE_NOT_FOUND`. Running the installed Node executable against the official absolute npm CLI path, with a workspace cache, installed the dependencies successfully. Local preview first ran inside a restricted network environment and could not be reached by the browser; rerunning the same Vite server with approved network access returned HTTP 200 and rendered the app. These are development-environment incidents, not Amazon SDK defects.

The real MCP tests passed protocol negotiation and session isolation; the browser also initialized, discovered 17 tools, invoked them and disconnected. See `EVIDENCE.md` for actual checks and limits. Audio testing found a non-finite volume boundary, now corrected. No private Amazon onboarding was attempted.

- **Official MCP TypeScript SDK:** Used at runtime by the local server and browser client for Streamable HTTP, discovery, and tool calls. Its transport/session abstractions support the required separation between session state and application logic. Actual test results belong in the final evidence record. No performance benchmark or production hosting claim is made.
- **Three.js:** Used to construct and render the original table geometry, manipulate the camera, and reflect part/progress state. No purchased model or copied furniture asset is needed.
- **React / Vite / TypeScript:** Used for the local application and production build. Setup is described in the README; report only installation and build outcomes actually observed.
- **Web Audio / Web Speech:** Optional browser features. Audio uses original synthesized tones. Speech support varies by browser and recognition may use a vendor service. Unsupported or denied microphone access must fall back to text.
- **Amazon Alexa+ tools:** Public documentation informed the architecture; private tooling was unavailable to entrants according to the official FAQ. No direct-use feedback is claimed. A clearer access restriction on every gated setup page would help avoid an unusable onboarding path.

Would we build on this stack again? Yes for a local assembly prototype: the domain engine can be tested independently and the official MCP transport lets the same tools serve another client. Public deployment, native Alexa integration, and physically validated assembly instructions need separate access and engineering.

Before submitting, replace general feedback with actual experience from the final tested build. Do not invent errors or exaggerate tool limitations to pursue a bonus.

V2 environment incident: the previous Edge executable was absent. Browser checks could not start, so configuration was extended to detect installed Edge or Chrome; the nine V2 browser scenarios then passed using installed Chrome. This was a browser availability issue. A separate speech-indicator test uses simulated browser events and makes no hardware microphone claim.
