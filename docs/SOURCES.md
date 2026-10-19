# Source verification

Checked **19 October 2026**. These notes guide preparation; the organizer determines eligibility and awards. No entry, prize, account approval, or submission has been confirmed.

## Official competition rules

[Rules](https://amazonappdev2026.devpost.com/rules): deadline **23 October, 12:00 PDT / 15:00 America/La_Paz**; internal delivery target **22 October**. Judging is November 9–20. Alexa+ accepts MCP **2025-11-25** over Streamable HTTP, or a declared simulated experience. Submit functional source on GitHub, setup instructions, English materials, product feedback, and a public YouTube/Vimeo demo under three minutes. Public repositories need an open-source license; private repositories require reviewer access. Maintain free judge access through judging.

Eligibility requires age of majority and compliance with residence/conflict restrictions; Bolivia is not explicitly listed among excluded locations. Individual eligibility is unverified. The four equally weighted criteria are implementation, design, impact, and idea quality. Alexa+ cash prizes: $25,000 / $15,000 / $4,000, with AWS credits and other benefits. Open Source requires an additional qualifying contribution and contribution/repository URLs plus GitHub username. Kiro Crew alone can qualify for AWS Builder, but this project has not used it. Optional genuine friction logs may earn up to 10% bonus. The October 7 update says promotional credit codes are exhausted.

The separate [prizes URL](https://amazonappdev2026.devpost.com/prizes) failed to load during research; prize amounts above come from the rules table.

## Alexa+ access and delivery route

[Official FAQ](https://amazonappdev2026.devpost.com/details/faqs): the private Category SDK, MCP Toolkit, CLI, and Web Simulator are unavailable to entrants. No Echo is needed. A browser performing actual initialization, discovery, and calls over Streamable HTTP is acceptable. A locally runnable public repository and demo suffice; hosting and a continuously running MCP server are unnecessary. GitHub is required. The FAQ's credit-request text is stale relative to the newer dated rules update.

[Amazon add-on documentation](https://developer.amazon.com/docs/alexaplus/add-ons/home) describes the integration ecosystem; it does not grant this project access. FixPilot X has no native Alexa+ connection, Amazon credentials, Shopping integration, AWS deployment, or paid model dependency.

## Protocol implementation

[MCP transport specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports): JSON-RPC over a shared HTTP endpoint, negotiated protocol version, secure session identifiers, and Origin validation. Local binding should use loopback. This project implements those transport mechanisms through the [official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk), with independent state per session. The local development service is not an authenticated public hosting architecture.

Re-check official pages immediately before submitting: requirements and reviewer lists can change.
