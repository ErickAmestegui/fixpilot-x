# Judge reproduction guide

**Primary track: simulated Alexa+ experience.** All planner, 3D, inventory and tool operations execute real code. Commands use bounded deterministic routing; no runtime LLM, native Alexa connection, private Amazon SDK, Echo, AWS account or paid API is required.

Public source: https://github.com/ErickAmestegui/fixpilot-x

Public backup video: https://youtu.be/cmGh1VtHgUk

The Sites URL is an owner-private supplemental preview. Use this public source/video route rather than another person's account. The [official FAQ](https://amazonappdev2026.devpost.com/details/faqs) permits a locally runnable public repository and demonstration video.

## Start

Install Node.js 22 LTS or newer. Use an ordinary browser with WebGL, and internet for package installation.

```sh
git clone https://github.com/ErickAmestegui/fixpilot-x.git
cd fixpilot-x
npm ci
npm test
npm run dev
```

Open `http://127.0.0.1:5173`. In a second terminal within the repository, run `npm run mcp`. In the app choose **Configuración → Integración MCP opcional → Conectar servidor local**. The status must show **MCP conectado · 18 herramientas**. Future actions use the SDK transport at localhost port 3101. Do not attempt this loopback integration from the hosted Site: remote origins are intentionally rejected.

## A two-minute functional check

1. Select step 1; choose **Ya completé este paso** (“I completed this step”). The checkbox is a software demonstration confirmation of a user report, not evidence of real physical work. Confirm. Repeat step 2.
2. Send **Me falta B7** (“I am missing B7”). Check the red **ausente** (“absent”) label and blocked steps 4/5/7/8. It must not appear installed.
3. Open **How FixPilot Thinks**. Inspect `mark_part_missing`, arguments, before/after state and alternatives 3/6. Close the dialog.
4. Send **¿Qué puedo hacer mientras tanto?** (“What can I do meanwhile?”). Complete step 3 or 6 through its confirmation dialog. Ask **Encontré B7** (“I found B7”). Confirm the recovered inventory retains completed work.
5. Complete remaining steps in prerequisite order to 8/8. Reload: browser progress remains.
6. Choose **Mi proyecto → Abrir Organizador de escritorio**. Complete step 1, select step 2 and send **No tengo la llave necesaria para este paso** (“I do not have the tool for this step”). Step 5 remains available; confirm it, send **Encontré la llave Allen** (“I found the Allen key”), and complete 2/3/4/6 to reach 6/6.
7. Switch back to the table: it retains its own 8/8 progress. Switching projects disconnects the previous MCP session; reconnect to test the second schema over MCP if desired.

Use **Mi proyecto** for validated export/import and reset. **Vista final** is a reference preview; animation never confirms a physical installation. Sound is off initially; text works without microphone access.

## Verify deeper

`npm run build` performs type checking and production compilation. For browser tests, keep Vite running, leave port 3101 free and run `npm run test:e2e`. Windows detects installed Chrome/Edge; other systems can install Chromium with `npx playwright install chromium`.

`npm run demo:final` starts its own temporary MCP server, asserts the real workflow and produces the improved English-captioned recording. See [recording notes](DEMO_FINAL.md). It should not run alongside another service on port 3101.

The MCP server keeps session state in RAM, with explicit caller export/restore. Browser localStorage persists each project independently. No cloud synchronization or persistence across an unsaved server restart is claimed.

The separate open source contribution is [MCP Scenario Lab](https://github.com/ErickAmestegui/mcp-scenario-lab). Its independent inventory fixture demonstrates generic stateful testing without FixPilot code; its optional B7 scenario can run against this server. See its README for commands and limits.
