# Real local AI copilot

The upgrade is isolated on `real-ai-copilot`. Rescue Intelligence remains tagged `rescue-ready-2026-10-19`; V1, V2, the original 22 MCP tools and renderer are preserved.

## Run the actual local LLM

Requires Node.js 22+, npm, Ollama and a compatible machine. Our evaluation machine has 16 GB system RAM and an NVIDIA RTX 3050 Laptop with 6 GB VRAM. Model downloads require internet, disk space and time; inference uses local hardware, not a paid API.

```sh
git clone --branch real-ai-copilot https://github.com/ErickAmestegui/fixpilot-x.git
cd fixpilot-x
npm ci
ollama pull qwen3:8b
npm run dev:copilot
```

Open `http://127.0.0.1:5173/?ai`. Choose **Connect Ollama · Qwen3 8B**. If Ollama was installed as a portable CLI, start `ollama serve` separately first. The one-command launcher starts only the browser UI, MCP and the local AI adapter; it does not install software, download weights or enable billing. The equivalent separate commands are `npm run dev`, `npm run mcp` and `npm run ai`.

The selected candidate is **qwen3:8b**, with thinking explicitly disabled, a 4096-token context and bounded structured output. Consult the current evidence report for its actual release decision, digest and measured behavior. In this environment the generic `qwen3:4b` resolved to **Qwen3-4B-Thinking-2507**, a thinking-only variant. Disabling thinking for that variant was a configuration mistake. The separate `qwen3:4b-instruct` candidate also failed real conversational quality checks. These attempts are not hidden or counted as passes. No silent model fallback is used.

In the workbench, **Connect local MCP** initializes the genuine 22-tool Streamable HTTP session and transfers the current validated browser snapshot. The AI then queries through that session. Without MCP connected, the same tools execute directly in the browser; each receipt identifies its transport. The AI adapter's `/chat` endpoint is an ordinary local HTTP adapter, **not MCP**. The actual MCP endpoint remains `/mcp` on port 3101.

## Rejected browser inference candidate

WebLLM with `Qwen3-1.7B-q4f16_1-MLC` loaded and generated actual responses on this machine's normal WebGPU adapter. It added unmentioned shortages and confused pending work with ready work in our real conversation. It was rejected and removed from the release UI and dependencies. Downloaded weights or a successful initialization are not conversational quality evidence. The public static Rescue preview does not run a language model. Use localhost for real local inference; no public inference endpoint is exposed.

## Architecture and approval boundary

1. A bounded session reads the current assembly through the real `preview_scenario` dispatcher/MCP path, which returns the exact unchanged state.
2. A genuine local model generates a structured routing decision. The decoder's schema uses the current catalog's valid part IDs, tool IDs and step numbers; parts and tools have separate enums.
3. The controller validates parameters, hypothetical state and actual base token. A proposed resource must be grounded in a catalog ID/name/alias in the current request, recent user context, current shortage or explicit viewer selection. Unusual resource paraphrases may need clarification rather than guessing. This is argument validation, not the deterministic command interpreter. The controller can invoke only `preview_scenario`, `compare_scenarios` and `explain_recovery`. It cannot call any inventory, progress, restore, load or apply mutator.
4. Validated hypothetical effects update the existing Three.js viewer and scenario controls. Comparisons and recovery use the existing planner. A request to record/undo work can only open the existing human dialog.
5. Actual returned facts feed the model's natural-language answer. Reference/progress validation and one bounded model repair attempt reject malformed or unsupported claims. This does not make arbitrary natural language provably correct; the exact engine result and human review remain authoritative.
6. Applying a scenario or confirming a physical report is still a separate explicit user action, validated by the original engine. Text, model output and imported document instructions cannot check the approval box.

Conversation memory is in browser-session memory, separate per project: at most 12 displayed turns, two compact prior-user/tool summaries in the routing prompt, and six draft hypotheses. Context includes the selected viewer part/step. Canceling the last hypothetical pops only that draft; it cannot erase actual progress. Reloading clears conversational memory; original per-project assembly persistence remains unchanged. No cross-device/cloud memory is claimed.

All catalog, tool and document strings are untrusted data in prompts. A malicious instruction in those strings cannot expand the controller's read-only capability set. Replies are displayed as text. The local adapter accepts only loopback hosts/origins, fixes the upstream to Ollama on loopback, constrains request sizes and runs one generation at a time. There are no arbitrary provider URLs or frontend credentials.

## Honest failure modes

No model is enabled by default. A failed initialization/generation is displayed as a failure, not as a canned AI reply. The deterministic command fallback is explicitly labeled. The UI displays the selected provider/model, actual tool receipts and whether requests used MCP. AI output may still be mistaken; catalog controls, engine validation and human review remain the authority. Software cannot inspect physical work or certify strength/safety. Only two original educational assemblies are supported.

## Verification

```sh
npm test
npm run build
# Leave the dev app running, then:
npm run test:e2e
# Opt-in actual Ollama + actual MCP (both services must be running):
npm run test:ai:live
```

The 20 enforcement/adapter tests use explicitly scripted provider doubles, and the two AI UI boundary tests mock the local adapter. They are not real-model evidence. `test:ai:live` never substitutes a mock: it records actual model outputs, actual MCP receipts, state invariance and exact scenario expectations. Its initial confirmations belong to a documented synthetic fixture; they are not model-approved or verified physical work. Real transcripts, performance, failures and release status belong in a separate current evidence report. Automated scenario checks alone cannot approve natural-language factual accuracy; replies must also be reviewed against the engine.

## Provider choice and cost

Ollama runs downloaded open weights on local hardware. Its inference path uses no paid API or hosting; hardware, electricity, storage and connectivity are not magically free. No cloud account or billing project was enabled.

Gemini was researched but is not connected: a real project-specific free quota, authorized key and no-billing status were not verified. We do not assume a free-tier promise guarantees access or US$0. Google documents that active limits vary by project and are not guaranteed: https://ai.google.dev/gemini-api/docs/rate-limits . No Gemini key is requested or embedded.

Primary references: https://ollama.com/library/qwen3/tags , https://docs.ollama.com/api/chat , https://huggingface.co/Qwen/Qwen3-4B , https://webllm.mlc.ai/docs/ . Qwen advises against greedy decoding for its reasoning model and recommends temperature/top-p/top-k sampling for non-thinking use. Model runtimes/weights retain their own licenses; the app's MIT license is unchanged.

Alexa+ remains a simulated experience. Genuine local LLM generation and genuine MCP transport do not imply native Alexa/Echo access, a private Amazon SDK, arbitrary manual conversion or physical verification.
