# Verified delivery evidence — 19 October 2026

These are observed results, not a certification of physical furniture or native Alexa integration.

## Automated checks

| Check | Observed result |
| --- | --- |
| Dependency engine | 49 tests passed |
| Deterministic commands | 58 tests passed |
| Optional audio | 25 tests passed using a simulated Web Audio API |
| Real MCP HTTP integration | 7 tests passed using the official SDK and real loopback sockets |
| TypeScript | `tsc -b` passed |
| Production build | Vite build passed; static output generated in `dist/` |
| Edge browser scenarios | All 6 scenarios passed, with the MCP scenario rerun after correcting a test selector for a collapsed settings section |

The initial combined unit run exposed a non-finite volume boundary. The audio implementation was corrected and all 25 audio tests passed on rerun. The other 114 tests passed in the combined run. No unresolved test failure remains in this delivery.

The build reports a large JavaScript bundle (about 1.1 MB before gzip, about 310 KB gzipped), including Three.js and the optional MCP SDK. This is a performance optimization opportunity; it did not prevent the tested interactions. No frame-rate, latency, or hardware performance benchmark is claimed.

## Browser scenarios

1. Start at 0/8; confirm steps 1 and 2; report missing B7; verify 4/5/7/8 blocked and 3/6 available; reject completing a blocked step; complete independent 3/6; restore B7; finish 4/5/7/8; reach 8/8; reload without losing progress; replay without changing completion.
2. After 8/8, report installed B7 missing. The engine rejects the inconsistent inventory change and preserves all completed work. Explicit undo is required to change installed-component history.
3. Render WebGL, rotate, zoom, change camera, select a part, and show the final reference without completing physical work. No Three.js/WebGL runtime errors were observed.
4. Verify zero AudioContext construction at page load and while sound is disabled; enable sound only through a gesture; mute; persist preferences.
5. Use the keyboard to select a part, open completion, check its confirmation and confirm; honor OS reduced motion. Mobile navigation and document width checked at 390 × 844.
6. Start a real local MCP server. The browser initializes, discovers 17 tools, transfers existing step-1 progress, marks/restores B7 through real tool calls, and disconnects back to the local engine while preserving state.

The browser tests use installed Microsoft Edge in headless mode and allow a software WebGL renderer. They validate rendering and interactions, not native GPU performance on every device. Voice recognition and speech output are optional; no physical microphone or audible voice-quality test was performed. Audio unit tests explicitly use simulated browser APIs.

## Real screenshots

- `screenshots/desktop.png`: B7 absent and independent work completed.
- `screenshots/mobile.png`: responsive 3D and missing B7.
- `screenshots/completed.png`: actual 8/8 confirmed state.

Screenshots were captured from the running application. No concept image is presented as evidence of implementation.

## Integration route and remaining external work

Submit as a declared **simulated Alexa+ experience built with Codex**, with deterministic commands and real domain tools. The optional MCP service is genuine but loopback-only. The hosted static application uses its in-browser engine and does not expose that local server publicly.

GitHub publication, a public narrated YouTube/Vimeo video, personal entrant declarations and confirmed Devpost submission remain external delivery steps. `SUBMISSION_CHECKLIST.md` records these tasks. Sites publication is supplemental and private; it does not replace GitHub or the video.
