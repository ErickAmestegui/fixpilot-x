# Final competition recording

The new local recording is **2:14.24**, 1600 × 1000, 25 fps, VP9 WebM, with large English captions and no narrated audio. Its actual UI recording test passed on October 19, 2026. It preserves the existing public 78.8-second backup: https://youtu.be/cmGh1VtHgUk. Do not replace that URL in Devpost until the entrant has reviewed and published the new file on YouTube or Vimeo.

## Reproduce

Use two terminals in this repository. Run `npm ci`, install the Playwright browser/FFmpeg if needed, and run `npm run dev` in the first terminal. Run `npm run demo:final` in the second. Keep port 3101 free: the recorder starts and closes the actual MCP server itself. The output is `../fixpilot-x-final-demo.webm`; the sanitized observed exchange log is `../fixpilot-x-final-mcp-evidence.json`.

The recorder adds an English subtitle layer and one clearly labeled observer card summarizing HTTP responses. It does not inject inventory or completion states. Tool results, confirmations and project switches use real UI operations; the first table workflow runs over MCP, and the organizer runs through the same browser engine after switching projects. A fresh test browser context starts with no saved progress. Animations are not physical completion evidence.

## Story and captions

1. **Problem and product.** The manual adapts when a physical procedure is interrupted. State that Alexa+ is simulated.
2. **Real MCP.** Open settings, connect, and show 18 discovered tools. The observer verifies initialization returned `2025-11-25` and a session ID over actual HTTP.
3. **Assembly progress.** Confirm table steps 1 and 2. The model responds to reported progress.
4. **Context.** Select B7 and ask why it is needed. Report “Me falta esa pieza.”
5. **Actual mutation.** Show the red absent-part ghost and captured `mark_part_missing` HTTP result with missing B7 and completed `[1,2]`.
6. **Dependencies.** Open Plan Inspector: actual arguments, before/after and blocked 4/5/7/8.
7. **Alternative work.** Ask to do something else; confirm independent steps 3 and 6.
8. **Recovery.** Recover B7, observe step 4 become available and finish through 8/8 without losing work.
9. **Reuse.** Switch to the original organizer; report missing Allen key in context; complete independent felt preparation, recover the key, finish 6/6.
10. **Memory and disclosure.** Return to table 8/8. Explain browser persistence versus server RAM; show repository URL and repeat simulation/native integration limits.

The final recording shows actual tools rather than a narration-only MCP claim. The original backup remains publicly available and unchanged. No new YouTube upload or final Devpost submission is claimed by this recording step.
