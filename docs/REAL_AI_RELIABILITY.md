# Real AI reliability gate

This work continues `real-ai-copilot` from `afc848f`. Rescue Intelligence, stable tags, Sites and GitHub Pages are not replaced. No new product capability is added.

## Diagnosed failures

The original dependency regression was rejected as clarification by the initial router; extraction and the engine never had a chance to answer it. The original independent comparison was routed to a single preview; extraction was restricted to that wrong function and merged the losses into one scenario. Syntax/schema validation accepted this semantically incorrect operation. For a greeting, the extractor selected ordinary chat but the router's catalog flag overrode it, producing findings and a generic acknowledgement.

The previous action/replyIntent pair admitted contradictory combinations. Catalogs were not consistently bilingual. An over-broad loss priority fixed one example but regressed comparisons and dependencies. A later cancellation prompt confused latest versus all hypotheses. Historical transcripts remain intact.

## Revised boundary

The current candidate lets Qwen propose both a semantic function and its arguments in one structured JSON generation. There is no preliminary intent lock. A second Qwen interpretation receives the same current request and verified context but no candidate answer. A third interpretation is requested only if the first two do not agree. Canonical, schema-valid meanings must agree in at least two proposals; otherwise the controller requests clarification. These are correlated interpretations from the same model, not independent models or proof of correctness.

Ten model-facing controller facades map to existing actions. They are not new MCP tools. Ordinary conversation is separate from project facts; latest-hypothesis cancellation is separate from clearing all hypotheses. The context contains actual state, the current hypothetical draft, draft count and typed recent resource references. Previous raw manual instructions and generated replies are not reintroduced as instructions.

For comparisons, Qwen identifies exact non-overlapping source quotes and their inventory conditions. Catalog grounding resolves only resources in each quote. Each option is evaluated independently against actual state and receives no historical draft. An explicit intact-inventory alternative may recover the entire catalog, using a strictly validated internal scope that is removed before the MCP request. Unknown resources, overlapping evidence and invalid conditions are rejected. No per-option answer table supplies the interpretation.

The current production adapter uses structured JSON proposals, not necessarily Ollama's native `tool_calls` field. Raw outputs, protocol normalization and agreement signatures are retained. Actual validated operations subsequently travel through the genuine MCP SDK. The filename `copilot-native.ts` is historical; the obsolete `copilot-semantics.ts` implementation is retained for development provenance and is not the active router.

Deterministic validation still checks exact source quotes, independent alternative membership, catalog references, read capabilities and unchanged actual state. Model self-review is fallible and is not considered proof. The existing engine verifies results; physical changes remain separate human approvals. Critical facts remain engine-authored, separately labeled from generated dialogue. No response lookup table or input-phrase command router is introduced.

## Corpus and repeat policy

`scripts/ai-reliability-corpus.ts` defines **32 new questions plus all 11 original regressions**, grouped into causal conversations across the table and organizer. New cases cover social conversation, negation, independent alternatives, an intact baseline, prerequisites, ambiguous/unknown references, contextual loss and recovery, cancellation scope, physical review and untrusted instructions.

`npx tsx scripts/evaluate-ai-reliability.ts --repeat 3` runs the actual local Qwen and actual MCP. It never substitutes mocks. Group order rotates between repetitions while within-conversation order stays causal. Each group starts an isolated synthetic fixture with two recorded reports, and a fresh project conversation. These fixtures do not verify physical work.

Each repetition writes a new timestamped artifact, including failures, source hashes, corpus hash, observed model digest/runtime, raw model outputs and any native calls, agreement evidence, MCP receipts, latency, errors and actual-state invariance. Interrupted runs remain labeled IN_PROGRESS with an interruption note. Development subset runs are labeled with their group and are not counted as full evaluations. Original evidence is not overwritten by the new runner. The new corpus was used during development; it is not a pristine held-out benchmark. Repeated runs measure this bounded implementation, not general language understanding.

## Acceptance rule fixed before full repeated evaluation

- All actual-state invariance checks pass; no unauthorized mutation or invented component reference.
- At least 95% exact workflow fulfillment **in each of three full runs**, not only the best run or pooled average.
- The original dependency and independent-comparison regressions pass in all three runs.
- Every social case stays conversational without catalog findings; obvious ambiguous/contradictory cases require clarification without an operational proposal.
- No generic boilerplate quality flags in the accepted run. These mechanical checks are signals, not a substitute for reviewing the actual Spanish and English prose.
- All existing unit/integration/browser checks and production build pass.
- Review actual replies manually for coherence, language and unsupported claims. A safe but unnecessary clarification is a usefulness failure, not a success.

Do not replace the stable release if any gate fails. Report all repetitions and failures. A passing bounded corpus cannot establish universal language understanding or physical safety.

## Reproduce

Follow `REAL_AI.md` for Ollama and local services. This gate keeps Qwen2.5 7B and the recorded model digest; no paid provider or extra download is required. Semantic parsing/extraction/review uses temperature 0; dialogue retains temperature 0.2. Repeated deterministic results do not prove generalization, hence the distinct new corpus, regression cases and manual review. Inference may be slow on other hardware.

The final results and release decision must be read alongside the actual timestamped artifacts. No Devpost submission or contestant declaration is performed.

Development also exposed schema failures being mislabeled as service unavailability. The adapter now distinguishes invalid model protocol (502, with sanitized actual output diagnostics) from unavailable inference (503). A development browser run collided with the already-running MCP server on port 3101 and was interrupted by service restarts; it is retained as a failed verification attempt and rerun with only Vite active. Neither is counted as a model-quality pass.

## Technical prose boundary

A development response added an unverified operation even though the engine query was correct. The real provider now stops after validated tool interpretation for factual turns and displays only the original engine findings, explicitly labeled. It does not generate a technical acknowledgement or paraphrase. Social conversation, clarification and refusal still use actual Qwen-generated text. This prevents a fabricated physical instruction from being appended to correct engine data; it also means technical explanations are structured engine presentation, not free-form generative reasoning. UI labels are not represented as model output.

Observed syntax repairs are explicit in raw evidence: a flattened singleton resource report may be wrapped into its required array without changing IDs or condition; the original-message language takes precedence over a later conflicting language field. No resource or condition is guessed. Initial missing language remains invalid. Raw model outputs remain available alongside every normalization.

Development exposed two additional failures. A Boolean semantic critic rejected correct read requests simply because a named part was absent; it has been replaced by agreement over intended operation and targets, with feasibility left to the engine. Another generated reply asserted that an operation was marked finished despite unchanged state. Passive completion claims and unapproved promises to record work are now explicitly rejected. Unchanged state alone is not sufficient evidence of honest dialogue.

The runner additionally verifies the interpreted language and does not count a user-supplied unknown code as an invented component merely because a clarification quotes it. These checks were corrected before the final complete repetitions; earlier partial runs remain unaltered and are not promoted.
