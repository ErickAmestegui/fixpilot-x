# Real AI evidence — October 20, 2026

**Decision: EXPERIMENTAL LOCAL PROTOTYPE. NOT APPROVED to replace the stable competition demo.** Real generation, tools and state boundaries work, but the final natural-language quality gate failed. Rescue Intelligence and its public video remain the stable delivery. Do not describe the public static preview as an LLM service.

## Actual selected runtime

Qwen2.5 7B Instruct (`qwen2.5:7b`), 7.6B Q4_K_M, through local Ollama 0.40.6. Evaluated on Windows with 16 GB RAM and RTX 3050 Laptop 6 GB VRAM. [Recorded digest and settings](ai-evidence/model-qwen25.json). No paid API, account, key or billing project was used. API charges were zero; hardware, storage, electricity and connectivity are still required.

## Final observed results

| Check | Actual result and scope |
| --- | --- |
| Unit/integration | 236/236 passed, including 32 additional controller/adapter tests using explicit doubles |
| Full browser suite | 15/15 passed before the final prompt wording and chat framing refinements; covers original assembly 8/8, B7 recovery, second project, MCP, persistence, camera, mobile and keyboard |
| Affected AI UI checks | 2/2 passed after chat framing changes; adapter is explicitly mocked, so this is boundary evidence only |
| Production build | Passed; existing large-bundle warning remains |
| Final genuine model + MCP evaluation | **FAIL: 9/11 automatic workflow expectations passed**, all 11 actual-state invariance checks passed. Raw transcript: [ollama-real.json](ai-evidence/ollama-real.json) |
| Genuine browser recording | 1/1 passed, four new prompts, actual Ollama + actual MCP, no model/HTTP mocks or state injection. Video 54.84 seconds, 1600×1000; [observed exchanges](ai-evidence/ui-recording.json) and [screenshots](screenshots/ai/) |

The final evaluation's generic greeting expectation was too permissive: it passed despite a catalog-style acknowledgement instead of useful emotional support. Manual review rejects that conversational behavior. The evaluator now requires no technical findings for this greeting on future runs. The transcript's original automatic result is retained, not retroactively rewritten. Therefore **9/11 is not a claim of nine fully satisfactory conversations**.

The final run failed the requested dependency explanation and independent comparison. One response asked an unnecessary clarification, and another combined alternatives into a single preview. No physical work or actual inventory was changed. Clarifying questions are sometimes generic, replies may switch language, and short acknowledgements remain stilted. These failures block an unrestricted conversational-quality claim.

An earlier full development run passed all 11 workflow expectations, but later prompt changes regressed intent selection. That earlier result does not approve this revision. Repeated prompt tuning was stopped rather than selecting only a favorable run.

## What the genuine recording demonstrates

Four fixed, newly written prompts were typed by browser automation; this is a scripted demonstration with actual model inference, not an unscripted user study. Setup confirms steps 1 and 2 through the real human UI as illustrative user reports, not inspected physical work.

1. A new Spanish B7 loss question invokes a real preview. B7 is a red missing ghost in the hypothetical viewer. Actual confirmations stay 1 and 2.
2. A contextual Allen-key loss retains B7; only step 6 is immediately ready in the hypothetical plan.
3. Canceling only that last possibility restores the B7-only draft; steps 3 and 6 are ready. Actual progress remains unchanged.
4. An English completion report opens the original step-3 review. Its checkbox remains unchecked, the confirm button disabled, and canceling preserves actual confirmations 1 and 2.

The recording observes MCP initialization `2025-11-25`, discovery of 22 tools, actual tool responses and actual model replies. Captions are explanatory overlays only. They do not substitute for model output. The file is delivered locally as `fixpilot-ai-demo.webm` outside the repository, with SHA256 recorded in the evidence metadata. It is not yet a public YouTube upload and is not represented as the definitive competition video.

## Why facts are separate

The LLM selects intents and structured parameters and generates dialogue. Critical assembly findings are **engine-authored presentation**, not model prose: verified resource IDs, readiness, blockers, requirements and actual confirmations. Returned MCP data must exactly match the existing engine; inconsistent data is rejected. This protects factual findings but cannot make an incorrectly selected intent correct.

The controller can call only preview_scenario, compare_scenarios and explain_recovery. A separately labeled initial context read is not attributed to a model choice. Raw native calls, model JSON, bounded syntax repairs, grounded reference repairs and validator recovery remain distinguishable in transcripts. The model cannot invoke any actual mutation. Preparing a dialog cannot check the approval box.

## Genuine failures retained

- [Over-broad routing priority](ai-evidence/rejected-route-priority.json): loss priority regressed comparisons and dependencies.
- [Cancellation scope regression](ai-evidence/rejected-cancel-scope.json): canceling the last draft was interpreted as clearing all drafts; actual state remained unchanged.
- [Earlier focused comparison](ai-evidence/ollama-compare.json): automatic argument checks passed, but manual review rejected inaccurate free-form factual prose. It predates engine-owned findings and is not an accepted quality pass.
- [Earlier smoke run](ai-evidence/ollama-smoke.json) and [candidate samples](ai-evidence/rejected-candidates.json) retain their original scope/results.

Qwen3 and WebLLM candidates generated actual outputs but also failed quality checks. The initial generic 4B tag resolved to a thinking-only variant; disabling thinking was a configuration mistake. WebLLM was removed from the UI/dependencies. Gemini was not connected because authorized project quota and no-billing status were not verified. Prompts and orchestration changed, so this is not a controlled model benchmark.

## Preserved delivery and remaining blocker

- Stable public deterministic workbench: https://erickamestegui.github.io/fixpilot-x/?rescue
- Existing public Rescue + genuine MCP video: https://youtu.be/-VrmiK0tyqg (2:24; predates the AI upgrade)
- Stable tag: `rescue-ready-2026-10-19`, commit `ea8be24c0c77525b8bed09f8641a4f93ebb6cce6`
- Experimental source: https://github.com/ErickAmestegui/fixpilot-x/tree/real-ai-copilot

No main/Rescue/Sites deployment was replaced. No Devpost submission or personal declaration was made. Alexa+ remains simulated; there is no native device or private SDK integration. No public model service, arbitrary-manual support, physical verification or cloud memory is claimed.

The remaining blocker is **reliable conversational intent and response quality on unseen requests**, not an API payment requirement. The local recording is evidence of a working bounded workflow, not clearance to market a dependable unrestricted copilot. Keep the stable submission unless this gate is resolved and a genuinely representative public demo is verified.
