# Real AI evaluation — October 20, 2026

**Release gate: IN PROGRESS / NOT APPROVED as the competition demo.** This branch is a recoverable integration checkpoint. The stable public Rescue workbench and its published video remain unchanged. Do not describe the static preview as a hosted LLM.

## What has actually run

Actual local Ollama inference generated Spanish and English responses and invoked the original engine through genuine MCP sessions. The browser WebLLM candidate also generated actual responses. Successful loading or valid JSON was not treated as proof of conversational correctness: the evaluated 1.7B, 4B and non-thinking 8B configurations produced factual or routing errors and were rejected as release candidates. See [genuine rejected samples](ai-evidence/rejected-candidates.json). Other development transcripts are retained locally; this is not a controlled ranking of model families, because prompts and orchestration changed while debugging.

The current experiment uses native Ollama controller functions, a strictly bounded decoder for explicit model JSON, natural model text for ordinary chat, deterministic hypothesis merging, and exact source quotes for comparison alternatives. No dialogue is supplied from a canned response table. Native calls and recovered model JSON remain distinguishable in provider evidence. The three callable assembly operations are read-only; a report of work only prepares a human review dialog. The actual 22-tool MCP server and original renderer are preserved.

## Verification scope

- The original 204 unit/integration tests remain in the suite. The additional capability/protocol tests use explicit scripted providers or a mock upstream; they do not establish model quality.
- The full browser run passed 15 scenarios before the latest protocol refinements. The two AI boundary scenarios were rerun after the earlier model/argument changes. Final affected checks and a real-model recording remain required for release approval.
- `docs/ai-evidence/ollama-real.json` records the most recent full real-model run, including failures. `ollama-smoke.json`, when present, is only the explicitly labeled five-case smoke run. `IN_PROGRESS` or `FAIL` is not a pass. Review both the automatic expectations and the actual prose against engine results.
- Initial completion reports in the evaluation belong to an isolated synthetic fixture. They are not model approvals or evidence of physical assembly.

## Preserved stable delivery

- Public deterministic workbench: https://erickamestegui.github.io/fixpilot-x/?rescue
- Published Rescue video (does not show this later LLM): https://youtu.be/-VrmiK0tyqg
- Stable source tag: `rescue-ready-2026-10-19` (`ea8be24`). Historical V2 is preserved.
- No change to Sites hosting, no Devpost submission, no personal declaration accepted for the entrant.

## Current limitations

Real inference requires the documented local setup and downloaded open weights. No public model service, cloud memory, Alexa/Echo connection, private Amazon SDK, arbitrary-manual ingestion or physical safety verification is claimed. API inference charges are zero; existing hardware, electricity, storage and connectivity are still needed. Gemini is not connected because actual authorized quota/no-billing access was not verified.

The controller enforces state/parameter/capability boundaries; it does not prove arbitrary natural-language statements correct. Failed model outputs must not replace engine facts. The release gate remains closed until the selected configuration and a genuine UI conversation meet the documented checks.
