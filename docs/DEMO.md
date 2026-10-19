# Actual-interaction demo — 100-second target

English narration script with readable English captions for Spanish controls. A captioned-only recording is acceptable; do not claim recorded narration unless audio is actually present. Record the running release. The table is the primary 90-second story; the final 10 seconds provide a compact second-object/tool proof. Timing is a rehearsal target, not a measured result. Keep the uploaded video under three minutes.

V2 recording gate passed: organizer, Plan Inspector, contextual commands and undo were verified in `EVIDENCE_V2.md`. Rehearse the exact recording flow; do not substitute staged success or hide a failed action.

## Preparation

Start the app and genuine local MCP server, connect in settings, and show the actual connected indicator. Reset the table and organizer in their separate projects. Sound may stay disabled. Hide personal tabs and credentials. Pause on plan changes. Do not imply an Amazon device, native Alexa voice, cloud AI, camera verification or manufacturer-approved instructions.

| Time | Actual on-screen action | English narration |
| --- | --- | --- |
| 00:00–00:10 | Show original exploded table and rotate it. | “FixPilot X is the manual that adapts to you. This is a simulated Alexa+ experience in our own client, using real assembly tools.” |
| 00:10–00:25 | Confirm table steps 1 and 2 through safety dialogs. | “The model and dependency planner share state. Completion records my confirmation; it does not inspect my physical work.” |
| 00:25–00:40 | Enter `Me falta B7`; show missing brace and actual Plan Inspector changes. | “When I lose brace B7, its operation and dependent work become blocked. The inspector shows what changed in the plan.” |
| 00:40–00:55 | Enter `¿Qué puedo hacer mientras tanto?`; show available steps 3 and 6. | “The planner finds work whose prerequisites still hold: install the supported shelf or prepare the feet separately.” |
| 00:55–01:10 | Confirm one independent available step and show progress. | “This is an actual completed operation in the same state. Every physical action still needs my confirmation.” |
| 01:10–01:22 | Enter `Encontré B7`; show step 4 available while step 5 remains constrained. | “Recovering the brace recalculates the plan. Later work still waits for its prerequisites.” |
| 01:22–01:30 | Show operation log and actual MCP status. | “Real local MCP calls and inspectable state; bounded language commands, with no runtime LLM required.” |
| 01:30–01:40 | Switch to organizer; mark an actually required tool missing, show blockers, restore it. | “A second, six-step organizer uses the same planner. Losing and recovering its required tool changes its real available work.” |

Rehearse the final segment with the organizer's actual required tool and UI labels. If ten seconds is unreadable, allow another 10–20 seconds; keep under three minutes. Cuts may remove waiting, but must not hide a failed operation or manufacture a state transition.

## Optional proof within the remaining time

Show a supported contextual instruction and previous-step undo with the real confirmation boundary. Switch back to the table and reload to demonstrate separate persistence. Narrate only what appears. Keep the interruption story readable.

## Upload and submit

- Record after final tests/build and retain actual evidence separately.
- Include explicit simulation disclosure in the video and project description.
- Upload to YouTube or Vimeo, verify public playback while logged out and copy the actual URL into Devpost.
- Check captions, repository link and legibility on a normal laptop screen.
- Submit by the internal target of October 22, 2026 and retain the actual Devpost confirmation; a draft is not a submitted entry.

## Finished recording

A real UI recording is available as `fixpilot-x-v2-demo.webm` in the delivery outputs. Duration: **78.8 seconds**, 1600 × 1000, 25 fps. It has explanatory English subtitles burned into the frames, with no narrated audio or copied music. It shows real commands, confirmations, missing B7, the Inspector, independent work, missing/recovered Allen key, table completion, a second assembly and retained table progress. A decoded frame was visually checked. The recording scenario passed its assertions.

Reproduce it with the web app running and `npm run demo:record`. Playwright needs its official FFmpeg component (`npx playwright install ffmpeg` if absent). The script adds only an English subtitle layer; it never injects completed assembly state. Recording code is under `demo/`.

## Published video

[Watch the public demo](https://youtu.be/cmGh1VtHgUk). YouTube Studio confirmed publication on 19 October 2026 after its copyright and Community Guidelines checks completed without reported problems. Watch-page playback was tested in the signed-in browser. An independent signed-out playback check remains recommended; the direct no-cookie embed test required a Referer and was not treated as a privacy failure or a successful playback test.
