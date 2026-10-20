# Real AI upgrade — entrant copy update

Use these additions only with the evaluated `real-ai-copilot` revision and its current evidence report. Keep the public Rescue video and historical deterministic claims scoped to their own version. The public static preview is not an LLM service. The entrant must review and submit Devpost personally.

## About the project — conversational layer

FixPilot X explores how an assembly manual could respond when reality stops matching the instructions. Its original Three.js assemblies, dependency engine and Rescue Intelligence workbench calculate the consequences of missing parts, unavailable tools and changes of plan.

The local AI upgrade adds a genuine Qwen3 language model through Ollama. It interprets Spanish and English questions, queries validated assembly tools, and explains returned results. Conversation context and hypothetical changes stay separate from the actual project. Comparing alternatives, canceling a recent hypothesis or preparing a completion review cannot record physical work. A separate human review and engine validation are required to change the saved record.

We deliberately expose the distinction between actual and hypothetical views, the selected model, and the tools used. When a model is unavailable or its output fails validation, the interface reports that failure and preserves explicitly labeled deterministic controls. The software records user reports; it cannot inspect furniture, certify structural strength or verify that a physical step was performed.

## Built with — add to the existing field

Ollama; Qwen3; local structured model generation; Zod validation. Existing stack: TypeScript, React, Vite, Three.js, Node.js, Express, Model Context Protocol SDK, Streamable HTTP, Vitest and Playwright.

## Try it out — distinguish the two experiences

- Stable public Rescue workbench: https://erickamestegui.github.io/fixpilot-x/?rescue — deterministic browser engine; no hosted LLM or MCP server.
- Real local AI source and setup: https://github.com/ErickAmestegui/fixpilot-x/tree/real-ai-copilot — follow `docs/REAL_AI.md` and open `http://127.0.0.1:5173/?ai` on your own machine.
- Separate open source contribution: https://github.com/ErickAmestegui/mcp-scenario-lab

Do not replace the video field with an unverified upload. The previously published Rescue demo at https://youtu.be/-VrmiK0tyqg demonstrates Rescue and real MCP; it does not demonstrate this later LLM upgrade.

## Alexa+ disclosure

This is a simulated Alexa+ experience, not a native Alexa+/Echo integration. We have no private Amazon SDK or device connection. The assembly engine, Three.js viewer, local LLM generation and local Streamable HTTP MCP calls execute real code. The static public preview runs the deterministic browser engine; real model inference and MCP transport require the documented local setup. The separate local AI adapter is an ordinary HTTP endpoint, not an MCP server. No paid API, AWS account or billing project is required for the documented local inference path.

## MCP integration

FixPilot X preserves its genuine 22-tool MCP server. After the user connects locally, the SDK initializes a Streamable HTTP session, discovers tools and transfers the validated current assembly snapshot. The copilot can invoke only three read operations: `preview_scenario`, `compare_scenarios` and `explain_recovery`. These return state, consequences, dependencies and recovery requirements from the existing engine. The model has no capability to apply scenarios, change inventory, load a different assembly or confirm work. Reports of physical completion can only prepare the original review dialog. The human interface invokes actual mutations separately after explicit approval; the engine rejects invalid and stale changes.

## Product feedback / authentic development friction

Model initialization and valid JSON were insufficient measures of success. In actual local evaluations, smaller model candidates generated unmentioned shortages, selected a single preview instead of a requested comparison, or described ready work as blocked. We retained the failed transcripts rather than counting them as passes. An initial generic 4B model tag resolved to a Thinking variant; using a non-thinking configuration for that variant was a configuration mistake, not evidence that a real copilot worked. A WebLLM candidate ran on WebGPU but failed conversational quality checks and was removed from the release UI. Gemini was not connected because project-specific free quota and no-billing status were not verified.

These are our own development observations, not user-study findings or fabricated feedback from Amazon. The current release decision, exact selected model, real transcripts and remaining limitations belong in `docs/REAL_AI_EVIDENCE.md`. Automated capability-boundary tests use explicit doubles and are reported separately from real model/MCP evaluation.

## Open Source Mini Challenge

The additional contribution remains MCP Scenario Lab, a separate MIT-licensed stateful MCP scenario runner with its own code, tests and examples. This AI upgrade does not turn FixPilot X's main product into the separate contribution, and does not imply an award or eligibility guarantee. Keep the existing checked Open Source submission text and link it to the Scenario Lab repository.
