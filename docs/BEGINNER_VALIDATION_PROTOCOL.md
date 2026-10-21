# Beginner usability study — protocol, not results

Status: **NOT EXECUTED WITH PEOPLE**. No participants, interviews, measured human completion times, or impact outcomes are claimed. Automated browser runs are engineering evidence only.

## Purpose and recruitment

Test whether a first-time user can distinguish a hypothetical shortage from an applied record, compare independent alternatives, and recover without inventing completed work. Recruit at least five adults unfamiliar with FixPilot X. Include different levels of computer confidence; record prior assembly and MCP experience. Do not collect names, emails, or sensitive information in the shared log. Assign anonymous IDs only after a real participant agrees to take part. Explain that this tests the product, not the person; participation is voluntary, stopping is allowed, and recording requires separate permission.

Use the same release/commit, browser, screen size and starting fixture for each participant. Begin with a fresh browser profile and no saved projects. Do not perform physical assembly. A facilitator records observations using `beginner-validation-template.csv`; keep recordings private unless separately authorized. Read task prompts verbatim, do not demonstrate controls first, and ask the participant to think aloud. A neutral repeat of the prompt is allowed; record every hint. Stop a task after three minutes or on request; record timeout/abandonment rather than success.

## Three tasks

1. **Unexpected shortage — public Judge Mode.** “This digital assembly starts with steps 1 and 2 reported. The B7 brace is now missing. Show what that blocks, then update the challenge record only after reviewing the consequences. Tell me whether the preview itself changed the record.” Start timing when the prompt ends. Success: missing B7 is applied with explicit review, participant identifies a blocked step from the calculated result, and correctly distinguishes preview from record. The starting fixture is simulated; the resulting calculations are real.
2. **Compare and recover — same session.** “B7 has been found. Compare leaving it missing with recovering it. Explain which next steps become available, then record its recovery. Tell me whether recovering the brace means later assembly steps have already been performed.” Success: independent comparison inspected, approved recovery, no later steps reported automatically, and participant understands that digital recovery is not physical verification. Ask them to find/export the tool receipts. Record help separately. The approximately 60-second guided experience is a design target for tasks 1–2 together, **not a measured human outcome**.
3. **Local MCP App — clean downloaded source.** Prerequisite: Node.js 22+ installed, internet available for first dependency installation. Provide the repository ZIP or clean checkout and the local-start README section. “Start the local rescue app, connect it, and explore a new missing part of your choice. Try applying it, decline the separate host approval once, and then approve it deliberately.” Success: real 22-tool discovery and official Apps handshake, chosen shortage calculated, host decline leaves record unchanged, approved change succeeds, participant closes the launcher cleanly. Track extraction, installation/build, launch and interaction times separately; do not count dependency download time as UI interaction time. Do not expose the server through a tunnel or public interface.

## Recording rules

For each task log timestamp, anonymous ID, release SHA, device, start/end, elapsed seconds, completion (independent / assisted / failed / abandoned), hints, recoverable errors, critical errors, participant explanation, and verbatim observations only when actually heard. A recoverable error is a mistaken interaction the participant notices and corrects. A critical error is believing a preview is applied, believing recovery completes physical work, or applying an unintended change. Count repeated attempts consistently; describe uncertain cases rather than forcing a number. Use blank fields for unmeasured values, not zero.

After each task ask ease from 1 (very difficult) to 7 (very easy), then “What was most confusing?” After all tasks ask “When would this have helped you?” Record answers without prompting a positive response. No comparison with paper manuals or time-saving claim is supported by this study alone.

## Predeclared review gate

Report sample size and every attempted session, including failures. Before promoting a novice-usability claim, require at least 4/5 participants to complete tasks 1–2 without facilitator hints, zero critical misunderstandings left unresolved, and at least 4/5 to complete task 3 with the documented prerequisites. Report actual median/range, hint counts and error types. If fewer than five participate, label the result a preliminary observation. These are internal usability gates, not statistical proof of broad impact. Preserve unsuccessful recordings/logs where consent permits. Fix critical misunderstandings before claiming readiness for novices.

External impact validation remains pending until this protocol is run with real people. Do not replace the blank template with automated or synthetic “participant” data.
