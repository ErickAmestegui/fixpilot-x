# FixPilot X

**The manual that adapts to you.** A functional assembly copilot with an original interactive 3D table, a dependency planner, deterministic conversational commands, and an optional genuine MCP server.

Built for the Alexa+ track of Build, Ship, Shape 2026. **The Alexa+ experience is simulated.** The planner, inventory, 3D interactions, persistence, and MCP tools run real code. There is no connection to an Alexa device, private Amazon SDK, paid AI API, or Amazon Shopping.

For evaluation, start with the [judge quickstart](docs/JUDGE_QUICKSTART.md), [final public 2:14 demo](https://youtu.be/ok_BsZNJxzk), [final verification](docs/EVIDENCE_FINAL.md) and [recording notes](docs/DEMO_FINAL.md). [Final Devpost fields](docs/DEVPOST_COPY_READY.md) are prepared for entrant review. The separate additional open source contribution is [MCP Scenario Lab](https://github.com/ErickAmestegui/mcp-scenario-lab), a generic stateful MCP test runner with its own license, fixture and tests.

## Rescue Intelligence upgrade

The separate `rescue-intelligence` branch adds a bilingual judge workbench at `/?rescue`: hypothetical multi-resource changes, graph explanations, scenario comparison, explicit atomic approval and partial recovery. [Run and challenge the upgrade](docs/RESCUE_INTELLIGENCE.md); [current verification](docs/RESCUE_EVIDENCE.md). V2 tags and videos remain preserved. The current catalog has **22 real MCP tools**; the 18-tool and 164-test references below describe historical V2.

## Run locally

Use Node.js 22 LTS or newer with npm, a modern desktop browser, and WebGL. Installation needs internet; the app has no paid-service dependency or runtime API key. No Echo or AWS account is required.

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite (normally `http://127.0.0.1:5173`). For reproducible installation after the lockfile is present, use `npm ci`. Keep the terminal running. The original assembly UI is in Spanish; open `/?rescue` for the English/Spanish judge workbench.

To exercise genuine MCP, open a second terminal in the same directory:

```sh
npm run mcp
```

In the app, open **Configuración → Integración MCP opcional → Conectar servidor local**. The client initializes the protocol, discovers the tools, and transfers validated current progress to a separate server session. Future assembly actions then call real MCP tools at `http://127.0.0.1:3101/mcp`. Disconnect to continue with the in-browser engine. Closing the server loses its in-memory sessions; the UI retains its last successful local snapshot.

## Try the adaptive workflow

1. Start a new project or reset from **Mi proyecto**. Select step 1, press **Ya completé este paso**, read its safety note, and confirm. Repeat for step 2.
2. Enter **Me falta B7**. B7 becomes missing; step 4 and dependent steps are blocked.
3. Ask **¿Qué puedo hacer mientras tanto?** Steps 3 and 6 remain available. Complete either through the confirmation dialog. Step 6 prepares feet separately, so it does not require turning an incomplete frame over.
4. Enter **Encontré B7**. Step 4 becomes available; step 5 still requires steps 3 and 4.
5. Open **Registro de operaciones** to inspect tool names, revisions, and actual plan state.

Other examples: **Mostrame la pieza B7**, **Mostrame el paso 3**, **Acercá la cámara**, **Mostrame la parte de atrás**, **Guardá el progreso**. Direct buttons remain available for every core operation. This is bounded intent recognition, not free-form LLM reasoning.

Rotate by dragging, zoom with the wheel or buttons, and click parts to inspect them. **Despiece** shows the exploded model, **Mi montaje** shows recorded progress, and **Vista final** is a reference view. Animation previews never confirm physical work. The inventory and step panels also provide keyboard-operable alternatives to picking a 3D object.

## Sound, voice, and persistence

Sound starts disabled and never plays on page load. Enable original Web Audio tones and set volume in **Configuración**. Speech recognition is optional, browser-dependent, and only activated by the microphone button; some browsers use an external vendor service. Text input works without it. Optional speech synthesis uses browser voices, not Alexa's voice. Reduced-motion preferences respect both the OS and app setting.

Progress and preferences use local browser storage. **Mi proyecto** exports/imports validated JSON backups. Failed storage writes are surfaced. The app does not verify physical assembly, structural strength, or load capacity. The furniture is an original educational prototype; do not use its model as manufacturer-approved construction guidance.

## Verify and build

```sh
npm test
npm run build
npm run preview
```

To run the browser checks, leave `npm run dev` running and run `npm run test:e2e` in a second terminal. On Windows, the configuration detects installed Microsoft Edge or Google Chrome. On other systems, first install the test browser with `npx playwright install chromium`. The tests include an actual browser MCP connection; keep port 3101 free for its temporary server. CI installs from the lockfile and checks the engine, MCP, audio, TypeScript and production build; a successful local run is not a claim that remote CI has run.

`tests/mcp.test.ts` starts a real temporary loopback server and uses the official SDK client. It covers protocol negotiation, discovery, missing-B7 replanning/recovery, session isolation, validation, state import, and browser-origin restrictions. The engine tests exercise domain invariants. Browser checks are maintained separately; see the evidence notes for checks actually run in this delivery.

## Project map

| Path | Purpose |
| --- | --- |
| `src/engine.ts` | Parts, steps, graph planner, safe state transitions and snapshots |
| `src/intent.ts` | Deterministic Spanish/English command routing |
| `src/AssemblyViewer.tsx` | Original Three.js geometry and state-driven presentation |
| `src/App.tsx` | Shared UI orchestration, confirmations, storage and browser speech |
| `src/audio.ts` | Original optional Web Audio feedback |
| `src/mcp-client.ts` | Official SDK browser transport and result validation |
| `server/mcp.ts` | Session-isolated, loopback-only Streamable HTTP server |
| `tests/` | Automated domain and integration checks |
| `docs/` | Architecture, sources, demo script, submission draft and feedback |

Read [architecture](docs/ARCHITECTURE.md), [MCP tools](docs/MCP.md), [verified sources](docs/SOURCES.md), [demo script](docs/DEMO.md), [Devpost draft](docs/DEVPOST.md), and [feedback](docs/FRICTION_LOG.md).

## Submission status and scope

V2 source is public at [ErickAmestegui/fixpilot-x](https://github.com/ErickAmestegui/fixpilot-x). The functional V2 checkpoint is `789b9c2`; V1 remains recoverable through `v1-stable`. The [public demonstration](https://youtu.be/cmGh1VtHgUk) is 78.8 seconds with English subtitles. Sites version 2 is published privately at [FixPilot X](https://fixpilot-x-assembly.lorgiogc.chatgpt.site); the judge route is the public repository and video. A public clean clone installed and compiled successfully. Devpost entry and personal eligibility declarations are not yet completed. See the [submission checklist](docs/SUBMISSION_CHECKLIST.md) for remaining tasks.

V2 supports two original assemblies through the same schema-based planner, as verified below. There is no PDF-to-3D conversion, camera validation, open-ended repair advice, cloud account synchronization, or automatic Shopping integration. Dependencies retain their own licenses; this project's original source is [MIT-licensed](LICENSE). Geometry is constructed in code, icons use Lucide, and tones are synthesized rather than copied from Amazon or other apps.

## Verified V2 features

The verified V1 record remains in [EVIDENCE.md](docs/EVIDENCE.md). V2 on `main` and `v2-competition` passed 164 unit/integration tests and nine browser scenarios. Results and limits are recorded in [EVIDENCE_V2.md](docs/EVIDENCE_V2.md).

| Verified V2 feature | Behavior |
| --- | --- |
| Two schema-based assemblies | Original eight-step table and six-step desk organizer (`organizer`), using one dependency planner |
| Independent saved projects | Each assembly keeps its own browser progress when switching and reloading |
| Missing tools and recovery | Tool availability changes actual blockers, alongside missing-part recovery |
| Contextual bounded commands | Resolve supported references against selected/previous state; clarify ambiguous instructions |
| Prior-step undo | Reverse recorded work with prerequisite validation and explicit confirmation where needed |
| Plan Inspector | Display actual before/after available steps and blockers rather than scripted explanation |

The genuine local MCP server exposes 18 tools, including schema-selected assembly loading and non-mutating part-impact explanation. Browser initialization, discovery, calls and disconnect passed against the real server. See [competition position](docs/COMPETITION_POSITION.md), [judge audit](docs/JUDGE_AUDIT.md), and [GitHub delivery instructions](docs/GITHUB_DELIVERY.md).

To reproduce the English-subtitled screen recording, leave the app running and execute `npm run demo:record`. The recorder performs real UI actions and asserts progress; it adds only explanatory captions. Install Playwright's official FFmpeg component if needed with `npx playwright install ffmpeg`. The delivery recording is 78.8 seconds; no audible narration or native Alexa connection is claimed.
