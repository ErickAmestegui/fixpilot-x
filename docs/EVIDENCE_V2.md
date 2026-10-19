# Verified V2 evidence — 19 October 2026

The integrated V2 build passed the checks below in the delivery workspace on `v2-competition`, as reported by the final verifier. This records actual software checks, not physical assembly certification. The functional release checkpoint is `789b9c2bbbad062a1f100068d66d8662d367df1d`, published on the public repository main branch. Later documentation commits record the final public links. V1 evidence remains in `EVIDENCE.md`, Git history and the public `v1-stable` tag.

## Automated checks

| Check | Observed result |
| --- | --- |
| Dependency engine | 49 tests passed |
| Deterministic commands | 68 tests passed |
| Assembly catalog | 7 tests passed |
| Projects and Plan Inspector | 6 tests passed |
| Optional audio | 25 tests passed using simulated Web Audio APIs |
| Real MCP HTTP integration | 9 tests passed |
| Total unit/integration checks | 164 passed |
| Browser scenarios | All 9 passed in installed Google Chrome (8 integrated scenarios plus 1 targeted speech-event scenario) |

The browser configuration supports installed Edge/Chrome fallback. The earlier Edge executable path was no longer present; the final eight scenarios used Chrome. Historical V1 Edge results remain historical evidence, not the browser used for V2.

## Verified behavior

- Both the eight-step original table and six-step desk organizer use the same schema-based dependency planner.
- The table retains the B7 interruption/recovery flow and reaches 8/8 confirmed progress.
- The organizer reaches 6/6; separate projects survive switching and reload without overwriting each other.
- Missing tools block affected work; tool recovery recalculates the plan.
- Contextual deterministic commands use actual selection/state. Hypothetical part-impact questions leave inventory and completion unchanged.
- Prior-step correction supports cancel and explicit cascading undo; independent step 6 remains completed when it is outside the dependency cascade.
- The Plan Inspector compares actual before/after available steps and blockers.
- Responsive organizer interactions were checked at mobile size.
- The real local browser MCP client initializes, discovers 18 tools, invokes tools, and disconnects while retaining successful state. The catalog includes `load_assembly` selection and `explain_part_impact`.

## Real V2 screenshots

- `screenshots/v2/organizer-blocked.png`: organizer with actual blocked work.
- `screenshots/v2/organizer-completed.png`: actual 6/6 organizer completion.
- `screenshots/v2/organizer-mobile.png`: mobile organizer layout.

These are captures of the running app, not concept images. V1 screenshots remain available separately.

## Limits and delivery status

Browser automation verifies software rendering/state and may use software WebGL; no native-GPU benchmark is claimed. Speech indicator, interim/final transcript handling and permission-denial recovery passed a separate browser test using simulated SpeechRecognition events. Physical microphone capture and audible voice quality were not verified. Audio unit tests use simulated APIs. The app does not inspect physical work, establish structural safety or provide manufacturer-approved assembly instructions. Alexa+ remains explicitly simulated, with genuine local MCP tools and bounded deterministic language routing; no native Alexa device or runtime LLM connection is claimed.

A real screen recording with English subtitles was produced through UI automation: 78.8 seconds, 1600 × 1000, 25 fps, WebM VP9. A decoded frame was inspected. The video contains no narrated audio. The entrant authorized upload and accepted the upload conditions. YouTube Studio confirmed public publication: https://youtu.be/cmGh1VtHgUk. Watch-page playback was tested in the signed-in browser; independent signed-out playback is not claimed. V2 is published at https://github.com/ErickAmestegui/fixpilot-x, checkpoint `789b9c2`. The entrant chose to complete Devpost authentication personally; no draft or submission confirmation has been created. TypeScript and the production Vite build passed after the final MCP concurrency guard. The affected browser MCP test was rerun and passed. Final release publication is recorded separately with its actual commit. Sites version 2 was saved and deployed successfully with the V2 checkpoint; V1 remains recoverable. A fresh public Git clone without credentials installed all 224 locked packages and passed TypeScript and production compilation. This checks a clean directory on the same Windows host, not every operating system.
