# Real AI reliability results — October 20, 2026

**Release decision: NO-SHIP. Experiment frozen at the user's explicit request on October 20, 2026. Preserve the stable Rescue experience.** This is a failed reliability candidate, not a finished conversational release. No further evaluations, model downloads or functional corrections are authorized in this stage. No new competition demonstration, public deployment replacement or Devpost change is made.

## Scope and provenance

Work continued on `real-ai-copilot` from `afc848f`, preserving the checkpoint `4c651d2`. The final candidate replaces the forced initial intent lock and Boolean feasibility critic with structured operation/argument proposals, agreement between model interpretations, strict catalog grounding and independent comparison quotes. It also rejects passive completion claims and unsupported promises to record physical work. No renderer, original dependency engine, assembly or MCP capability was rebuilt.

The real evaluator uses Qwen2.5 7B Instruct, Q4_K_M, Ollama 0.40.6, digest `845dbda0ea48ed749caafd9e6037047aa19acfcfd82e704d7ca97d631a0b697e`. Structured interpretation uses temperature 0; dialogue uses 0.2. Actual local MCP Streamable HTTP, protocol 2025-11-25, exposes the existing 22 tools. The model controller has only three read capabilities; ten model-facing facades are internal decisions, not new MCP tools or proof of native Ollama tool calling.

The final frozen-source invocation is `2026-10-20T18-28-28-120Z`. Raw artifacts record source-file SHA256 hashes and the corpus hash. Their `head` field is the starting checkpoint `4c651d2`; working-source hashes identify the actual evaluated candidate. No runtime source was edited during these repetitions. Documentation edits during evaluation do not change inference behavior.

## Repeated genuine evaluation

The invocation scheduled three repetitions of the same 43 questions: 32 additional prompts and the 11 exact original regressions. Two repetitions completed; the third was stopped at the user's request after 36 recorded turns. No new evaluation was started after that request. Group order rotates; within-conversation order remains causal. The corpus was used during development and is not a pristine held-out benchmark. Synthetic fixture confirmations prepare steps 1 and 2 before each conversation; these are explicit setup reports, not physical work verified by the model.

| Repetition | Automatic expectations | Result | Actual state unchanged | Median / p95 / maximum latency |
| --- | --- | --- | --- | --- |
| [1](ai-evidence/reliability/2026-10-20T18-28-28-120Z-run1.json) | 29/43 (67.4%) | FAIL | 43/43 | 4.947 / 17.396 / 41.047 seconds |
| [2](ai-evidence/reliability/2026-10-20T18-28-28-120Z-run2.json) | 29/43 (67.4%) | FAIL | 43/43 | 4.794 / 15.409 / 16.673 seconds |
| [3, interrupted](ai-evidence/reliability/2026-10-20T18-28-28-120Z-run3.json) | 25/36 recorded | IN_PROGRESS with explicit interruption note; not a complete evaluation | 36/36 recorded | 5.030 / 16.619 / 18.647 seconds |

Neither complete run is discarded or replaced by a favorable subset. Each contains 63 genuine MCP receipts, including context reads, and no recorded runtime exception. The partial third run contains 51 receipts. Semantic failures still count as failures even when inference and MCP return successfully. No unauthorized actual-state mutation was observed in these recorded turns. This does not prove universal safety or honest interpretation.

The same 14 automatic failures occurred in both completed runs: `new-07`, `new-08`, `new-11`, `new-12`, `new-13`, `new-17`, `new-18`, `new-24`, `new-26`, `new-32`, `reg-04`, `reg-08`, `reg-09`, `reg-11`. The original dependency regression `reg-05` passed in both; the original independent-comparison regression `reg-08` failed in both. The fixed release rule required at least 95% in each of three complete runs, both original critical regressions passing, state invariance, conversational checks and manual review. It is not met.

Before freezing, all 267 automated unit/integration tests and the production build passed. These include explicit doubles and are not counted as LLM evaluations. Earlier browser verification reported 15/15, but it predates the final adapter changes; the final candidate did not receive another complete browser run. No new tests or evaluations were launched to close this experiment.

## Observed remaining failures

- The original dependency question now selects `explain_recovery` for the top panel and reads the actual engine prerequisites. The independent-comparison regression still fails: Qwen supplies paraphrases, added quotation marks, catalog text or other nonliteral evidence instead of separate exact spans. Validation requests clarification before executing an invalid comparison.
- Agreement is not semantic truth. Two interpretations can agree to clear every hypothesis when the user asked to withdraw only the latest one. Actual saved progress remains unchanged, but the hypothetical conversation becomes wrong. This is a release-blocking usefulness failure.
- Contextual recovery of “the tool from just now” can ask an unnecessary clarification despite known recent references. A subsequent cancellation then acts on the wrong draft history. These are counted as failures, not successful conservative handling.
- Catalog questions can be misrouted to recovery reads. A valid engine result does not answer a question about which step uses B7 or the organizer's step count. One physical completion report also incorrectly becomes a requirements query instead of preparing human review.
- An ordinary prerequisite question about fitting the shelf while the brace is pending can be misclassified as a comparison. The controller rejects its invented comparison quotes.

## Manual review and scoring limits

Automatic checks were left fixed throughout the invocation. They do not prove naturalness or complete factual coverage. For example, `new-32` correctly selects refusal and generates a refusal in the first two runs, but the wording “I must adhere…” does not match the evaluator's narrow refusal-word pattern. Its automatic failure remains recorded; this is a scoring limitation, not evidence that the model bypassed the workflow. Conversely, `new-19` meets the mechanical requirements-query check while its findings omit the specifically requested parts and tools. Manual review therefore finds an additional answer-coverage gap and does not promote the candidate.

Social turns are actual Qwen prose, not canned replies. The reviewed greetings stay conversational without catalog findings, though some support/refusal language remains stiff or formulaic. Spanish “una workflow” in one refusal is an observed language-quality defect. No automatic boilerplate flag is a guarantee of natural conversation.

During earlier development, a generated reply falsely stated “Operation marked as finished: Installed Top Panel (A1).” State invariance did not make that claim honest. The new deterministic boundary explicitly rejects passive completion assertions and unapproved recording promises. This protection is covered by negative automated tests; those tests are not counted as genuine model evaluations.

## Failed development evidence retained

Earlier candidates and partial runs remain in the evidence directory with their source hashes. Complete failed runs include 19/43 at `17-03-58-742Z`, then 12/43 and 11/43 at `17-50-43-833Z`. Interrupted runs retain `IN_PROGRESS` plus an interruption reason; subset evaluations retain their group scope. They are not counted as three full repetitions or as release passes. Different orchestration, diagnostics and scoring fixes mean these records are not a controlled model ranking. No favorable subset substitutes for the final full corpus.

## Release and Devpost recommendation

Keep the public [Rescue preview](https://erickamestegui.github.io/fixpilot-x/?rescue) and its existing Rescue/MCP video unchanged. The stable `rescue-intelligence` branch and `rescue-ready-2026-10-19` tag remain at `ea8be24c0c77525b8bed09f8641a4f93ebb6cce6`. No merge to `main` or `rescue-intelligence` is performed. The active local evaluation, experimental service launcher and Ollama process were stopped during closure.

This local experiment is not hosted inference and is not native Alexa+ integration. No paid provider, API key, cloud account or billing project was enabled. API charges were zero; existing hardware, electricity and storage remain required.

If mentioning this work, use the experimental disclosure in [DEVPOST_REAL_AI_UPDATE.md](DEVPOST_REAL_AI_UPDATE.md). Do not claim reliable general conversation, a passed LLM gate, real physical inspection, native Alexa+ connectivity or a new approved AI demonstration. The entrant retains control over submission and personal declarations.
