# Devpost update — real local AI prototype

**Reliability gate not approved. Keep the stable Rescue entry; describe the AI as an experimental local prototype if mentioning it.** Copy only statements consistent with the evidence reports into the entrant's existing submission. Keep the stable Rescue demo scoped to Rescue. Review every field personally; no form has been submitted. The earlier 9/11 checkpoint is historical; read [the repeated reliability results](REAL_AI_RELIABILITY_RESULTS.md) before using any quality figure.

## About the project — add or replace the conversational paragraph

FixPilot X turns an assembly manual into an interactive plan that can adapt when a part or tool is missing. Its original Three.js assemblies and dependency engine distinguish work that is ready, blocked or waiting for prerequisites. Rescue Intelligence lets users explore and compare hypothetical setbacks without changing their saved project.

An experimental local AI branch adds Qwen2.5 7B Instruct through Ollama. We evaluated it with actual model generations and genuine MCP calls across Spanish and English conversations, contextual resource reports, prerequisites, comparisons and human-review boundaries. Its conversational reliability has not passed our release gate, so it is not the primary competition experience. A real model proposes intent and structured arguments; validated read-only tools calculate the effects. Critical assembly findings are rendered directly from verified engine results, separately from generated dialogue. The experimental branch and its failed evaluations are available for inspection.

The model cannot apply scenarios, alter inventory or confirm physical work. A completion report can only open an unchecked human review dialog; a separate explicit approval and engine validation are required to update the record. The viewer labels actual and hypothetical states, missing components remain visibly absent, and tool receipts identify what actually ran.

Real inference and genuine MCP transport require the documented local setup. The free public preview uses the deterministic browser engine and does not host a language model. The app records human reports; it cannot inspect furniture or certify physical safety. Alexa+ is a simulated experience, not a native device integration.

## Built with

TypeScript, React, Vite, Three.js, Node.js, Express, Ollama, Qwen2.5 7B Instruct, Model Context Protocol SDK, Streamable HTTP, Zod, Vitest, Playwright, GitHub Actions, GitHub Pages.

## Try it out links

- Public Rescue preview (deterministic browser engine): https://erickamestegui.github.io/fixpilot-x/?rescue
- Real local AI source: https://github.com/ErickAmestegui/fixpilot-x/tree/real-ai-copilot
- Local AI setup: https://github.com/ErickAmestegui/fixpilot-x/blob/real-ai-copilot/docs/REAL_AI.md
- Current reliability evidence: https://github.com/ErickAmestegui/fixpilot-x/blob/real-ai-copilot/docs/REAL_AI_RELIABILITY_RESULTS.md
- Historical 9/11 checkpoint: https://github.com/ErickAmestegui/fixpilot-x/blob/real-ai-copilot/docs/REAL_AI_EVIDENCE.md
- Additional open source contribution: https://github.com/ErickAmestegui/mcp-scenario-lab

## Video field

Existing published Rescue + real MCP demo: https://youtu.be/-VrmiK0tyqg

This 2:24 video predates the LLM upgrade and must not be described as proof of generative AI. The historical local AI recording also predates this reliability candidate. No new competition demonstration is approved while this release gate fails. Do not replace the stable video with an unqualified experimental recording, paste a localhost address or invent a video URL.

## Alexa+ category disclosure

FixPilot X presents a simulated Alexa+ experience. There is no native Alexa+/Echo connection, private Amazon SDK or Amazon account integration. Its assembly engine, 3D viewer, local Ollama model generation and local Streamable HTTP MCP calls execute real code. The public static preview runs the browser engine; real AI and MCP transport require the documented local setup. The local AI adapter is an ordinary HTTP endpoint, separate from the genuine MCP server. The documented inference path uses no paid API or billing project.

## MCP integration

The existing server exposes 22 tools over genuine MCP Streamable HTTP. In the recorded local sessions, the SDK initialized protocol 2025-11-25 and discovered the catalog. The experimental model proposes structured JSON controller decisions; these must not be represented as native Ollama tool calls. Ten internal controller facades map to existing actions and are not additional MCP tools. The controller can execute only preview_scenario, compare_scenarios and explain_recovery, including a separately identified context read. Every returned result is checked against the original dependency engine; invalid references, stale state and inconsistent results are rejected. Raw model proposals, agreement checks, protocol normalization and genuine MCP receipts remain visible in the evidence. A completion report can at most prepare the existing unchecked human review dialog. Mutations remain outside the model's capability set.

## Product feedback / authentic friction

A successful model download, valid JSON and fluent prose did not establish correct tool use. During development, real model candidates introduced unmentioned shortages, confused waiting work with ready work, or gave inaccurate summaries of otherwise correct tool results. We retained failures and separated model-generated dialogue from engine-authored critical findings. Exact comparison quotes and catalog validation also exposed wrong resource arguments rather than silently trusting them.

A generic Qwen3 4B tag resolved to a thinking-only variant; initially disabling thinking was a configuration mistake. A WebLLM candidate generated real output on WebGPU but failed quality checks and was removed. Gemini was not connected because actual authorized quota and no-billing access were not verified. During the new UI recording, a negated request about recording work was misclassified as undoing a step; the workflow preserved actual progress, and we clarified the model's intent instructions before recording again.

These are authentic development observations, not an Amazon user study or claims of Alexa SDK defects. This project demonstrates why action validation, honest failure states and evidence ownership matter alongside language-model capability. A limited evaluated workflow is not proof of universal intent recognition.

## Open Source Mini Challenge

Our additional contribution remains MCP Scenario Lab, a separate MIT-licensed stateful MCP scenario runner with its own code, examples and tests: https://github.com/ErickAmestegui/mcp-scenario-lab . It makes protocol and state-transition checks reproducible beyond FixPilot X. This AI upgrade does not replace that separate contribution. Use the previously checked Open Source declaration and evidence; neither technical verification nor this description guarantees eligibility or an award.

## Final entrant checks

- Keep the public deterministic preview and local AI experience clearly distinguished.
- Review the current evidence report and exact source revision.
- If replacing the video, verify the new public upload without authentication.
- Preserve the separate Scenario Lab link and required contribution declaration.
- Check mandatory Devpost fields, team information and personal eligibility declarations yourself.
- Submit personally; this document does not submit or accept declarations.
