# Actual clean-install procedure

- Windows, Node v24.16.0 and npm already installed. Existing Playwright browser used only for QA.
- Created an ignored source copy at .clean-podium using tracked and new source files, without .git or node_modules. The preparation command reported nodeModulesExists: false.
- In that folder ran npm run local -- --no-open. The launcher ran npm ci: 218 packages installed in 31 seconds; then the full production build and self-contained card build.
- Ready output exposed only 127.0.0.1:3101 and 127.0.0.1:5175. Browser verification used the production preview from this copy, not Vite dev in the original checkout.
- A prior launch attempt during browser testing correctly refused occupied port 3101. No unrelated process was stopped.
- Actual Apps handshake and 22-tool discovery succeeded. Declining the host approval preserved the record; subsequent explicit approval and recovery preserved two reports. Nonlocal Origin received 403.
- Ctrl+C closed both owned ports; see launcher-shutdown.json.
- Follow-up guide fixes (second assembly selection and fresh-run receipt boundary) were copied into this same installed folder for the final rebuild and verification. No engine or server changes. The original installation isolation remains documented; this is not a claim of a fresh operating system, empty npm cache, or tested macOS/Linux UI.
