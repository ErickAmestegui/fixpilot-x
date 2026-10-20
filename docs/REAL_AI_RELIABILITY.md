# Real AI reliability gate

This work continues `real-ai-copilot` from `afc848f`. Rescue Intelligence, stable tags, Sites and GitHub Pages are not replaced. No new product capability is added.

## Diagnosed failures

The original dependency regression was rejected as clarification by the initial router; extraction and the engine never had a chance to answer it. The original independent comparison was routed to a single preview; extraction was restricted to that wrong function and merged the losses into one scenario. Syntax/schema validation accepted this semantically incorrect operation. For a greeting, the extractor selected ordinary chat but the router's catalog flag overrode it, producing findings and a generic acknowledgement.

The previous action/replyIntent pair admitted contradictory combinations. Catalogs were not consistently bilingual. An over-broad loss priority fixed one example but regressed comparisons and dependencies. A later cancellation prompt confused latest versus all hypotheses. Historical transcripts remain intact.

## Revised boundary

A real local model selects a semantic function with a quote and paraphrase of the current message. Purpose maps to the existing controller operation. Ordinary chat is not forced into the catalog. Hypothesis cancellation receives a separate semantic review. For operational requests, native model calls extract only operation-specific arguments from the bilingual catalog and bounded context. Comparisons first split verbatim alternatives, then parse each alternative independently; each option must include exactly the catalog resources named in its own quote and receives no historical draft. A separate real-model review checks meaning, negation, target/prerequisite, resource conditions and independent alternatives. Disagreement or ambiguity requests clarification before selecting an operation.

Deterministic validation still checks exact source quotes, independent alternative membership, catalog references, read capabilities and unchanged actual state. Model self-review is fallible and is not considered proof. The existing engine verifies results; physical changes remain separate human approvals. Critical facts remain engine-authored, separately labeled from generated dialogue. No response lookup table or input-phrase command router is introduced.

## Corpus and repeat policy

`scripts/ai-reliability-corpus.ts` defines **32 new questions plus all 11 original regressions**, grouped into causal conversations across the table and organizer. New cases cover social conversation, negation, independent alternatives, an intact baseline, prerequisites, ambiguous/unknown references, contextual loss and recovery, cancellation scope, physical review and untrusted instructions.

`npx tsx scripts/evaluate-ai-reliability.ts --repeat 3` runs the actual local Qwen and actual MCP. It never substitutes mocks. Group order rotates between repetitions while within-conversation order stays causal. Each group starts an isolated synthetic fixture with two recorded reports, and a fresh project conversation. These fixtures do not verify physical work.

Each repetition writes a new timestamped artifact, including failures, source hashes, corpus hash, observed model digest/runtime, raw model outputs and native calls, semantic reviews, MCP receipts, latency, errors and actual-state invariance. Partial runs remain labeled IN_PROGRESS until finalized. Development subset runs are labeled with their group and are not counted as full evaluations. Original evidence is not overwritten by the new runner.

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

Two observed syntax repairs are explicit in raw evidence: a flattened singleton resource report may be wrapped into its required array without changing IDs, condition or source; an audit that omits language retains the language actually supplied by the initial interpretation. No resource or condition is guessed. Initial missing language remains invalid. Raw native calls remain available alongside every normalization.

The runner additionally verifies the interpreted language and does not count a user-supplied unknown code as an invented component merely because a clarification quotes it. These checks were corrected before the final complete repetitions; earlier partial runs remain unaltered and are not promoted.
