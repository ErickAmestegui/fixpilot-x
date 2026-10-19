# FixPilot X

**The manual that adapts to you.**

Submission draft; final project links and personal declarations remain to be completed. V2 software verification is recorded in `EVIDENCE_V2.md`; V1 evidence remains preserved.

## Inspiration

A paper manual assumes every part is present and every step goes to plan. Real assembly is less predictable. We wanted a companion that understands the procedure well enough to answer a more useful question: “What can I safely do next?”

## What it does

FixPilot X combines a conversational interface, an original interactive 3D furniture model, and an adaptive dependency planner. When the user reports “I'm missing B7,” the structural brace is marked unavailable, affected operations are blocked, and independent work remains available. Recovering the part recalculates the plan without skipping prerequisites.

The conversation, inventory, procedure, 3D selection, and progress share actual state. Users confirm completed work, inspect parts, undo recorded operations, save progress, and export a portable backup. Optional original interface tones and browser speech improve hands-free use; text and visual feedback remain sufficient. Reduced motion, keyboard controls, and explicit physical confirmations support a comfortable experience.

## How we built it

The same planner powers two original assemblies: an eight-step table and a six-step desk organizer. Switching assemblies preserves each project's progress. Missing tools and parts recalculate the actual plan. Bounded contextual commands support selected references and prior-step undo, while a Plan Inspector exposes the available steps and blockers that changed before and after an operation.

TypeScript and React provide the interface, Three.js renders original geometry, and a renderer-independent engine validates both assembly dependency graphs. A deterministic command router maps supported instructions to real tools. No paid LLM or cloud API is required.

The optional local MCP service uses the official TypeScript SDK and Streamable HTTP. The browser performs protocol initialization, tool discovery, and tool calls. Each session owns an independent assembly state. The same engine runs directly in the browser when MCP is disconnected. Automated integration tests exercise the actual transport, not a mock HTTP wrapper.

## Alexa+ integration disclosure

This is a **simulated Alexa+ experience**, demonstrated through our own web client. The MCP server and assembly tools are real. We do not use Amazon's private SDK, CLI, simulator, a native Alexa voice, or an Echo connection. This project does not connect to Amazon Shopping or AWS services.

## Challenges and learning

The central challenge is preserving valid physical prerequisites when the user's situation changes. We separated presentation from assembly truth, made completion require explicit user confirmation, and treated animation as a preview rather than evidence of physical work. Missing parts, missing tools, invalid imports, and undo operations all pass through the same validation boundary.

Another challenge is honest multimodal feedback: a microphone indicator must follow actual browser recognition events, and sound must be optional. The experience must stay usable when recognition, speech output, or audio is unavailable.

## What we are proud of

The key demonstration is reproducible: report missing B7, inspect real blockers, complete independent work, recover B7, and inspect the resulting audit trail. The product explains its constraints and never claims that clicking a button proves a physical installation is safe.

## What is next

Extend the library with additional validated original assemblies, improve multilingual command coverage, and test the workflow with real users and manufacturers. Importing arbitrary manuals, camera verification, and production structural assessment require further work and are not current features.

## Submission fields to complete before sending

- Primary track: Alexa+.
- Repository URL: https://github.com/ErickAmestegui/fixpilot-x
- Demo video URL: https://youtu.be/cmGh1VtHgUk — published publicly, 78.8 seconds, English subtitles, silent recording.
- Product feedback: adapt `FRICTION_LOG.md` to the form using only verified experiences.
- Additional mini-challenges: none claimed by this delivery. An MIT license alone does not establish an additional Open Source contribution; no AWS/Kiro usage is claimed.
- Team identity and eligibility: the entrant must supply accurate personal information.
- Submission confirmation: not yet obtained.
- Final evidence: V2 passed 164 unit/integration tests and nine browser scenarios; see `EVIDENCE_V2.md` for limits. A captioned screen recording does not imply narrated audio.
- Comparative positioning: `COMPETITION_POSITION.md` is a narrow public-source review, without competitor rankings or inferred win odds.
