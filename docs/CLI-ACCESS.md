> Historical access audit, not current authentication status. Recheck native access only when needed; use [CODE-MAP.md](CODE-MAP.md) to select the right app.

# CLI routes and access diagnosis

Checked 2026-09-14. Audit run: `20260914T205815Z-c803359c5bf9`.

## Correct command route

From the allocated run's scratch directory, use:

```sh
/Users/jerryzhang/Workspace-Draft/system/bin/dev COMMAND
```

This preserves cwd and selects the managed tools. `dev --project mirrormii-genie-survey COMMAND` selects the same profile and changes cwd to the project source; use it for intended source work. The wrapper selects tools, not OS permissions.

The inherited shell selected Node 22.22.3, npm/npx 10.9.8, Apple Python 3.9.6 and Apple Git 2.39.2, with pnpm absent from PATH. The managed route verified Node 24.21.0, npm/npx 11.19.0, pnpm 10.34.5, Python 3.12.13 and Git 2.54.0. No global shell or runtime setting was changed.

## Access findings

| Component | Observation | What is still unknown |
| --- | --- | --- |
| Workspace-control / AGNT | launchctl reports running; lsof shows listeners on 4310 / 33333 | HTTP health is inaccessible from this session |
| Execution sandbox | Seatbelt; network-disabled flag is 1; loopback connect and bind return EPERM; external DNS fails | Native Terminal connectivity has not been tested in this audit |
| Lark CLI 1.0.93 | Keychain initialization fails before identity or token verification, also through dev | Actual login validity and server scopes |
| GitHub CLI 2.98.0 | Installed; network calls fail before remote verification | Token validity and repository permissions |
| Codex 0.153.4 | Bundled app route; login status reports ChatGPT login | Live model execution, not exercised |
| Claude 2.1.261 | CLI reports loggedIn=false in this process | Native authentication outside the restricted process |
| Hermes 0.21.2 | Reports OpenAI Codex login; its default Anthropic provider has no configured credential | Live model execution, not exercised |
| Lavish Editor | `npx --offline lavish-axi` can resolve the cached tool | Review server cannot bind a port in this session |
| LibTV 1.1.3 | Documented `~/.libtv/libtv` executable works; absent from PATH | Live account status, not exercised |

Native Keychain list/default metadata succeeded, but this does not establish that Lark's protected master-key item is readable. The Lark error alone cannot distinguish restricted access from missing key material; the execution restrictions make access the leading explanation.

## Next discriminator

Run the same read-only check in a normal macOS Terminal with the user's native Keychain and network access:

```sh
/Users/jerryzhang/Workspace-Draft/system/bin/dev lark-cli auth status --json --verify
```

The audit run also includes `output/native-access-check.py`, a read-only checker for DNS, local HTTP health, Lark authentication status, GitHub authentication, and the team repository's metadata. It allocates a fresh run and emits only selected status fields. It does not log in, reset configuration, switch accounts, change scopes, copy credentials, create repositories, or push commits.

If native verification succeeds, preserve existing authentication and use an execution environment with the required access. If it fails, follow that specific native diagnostic. Do not conclude that tokens are invalid from a network error or that a service is stopped from a blocked connection. Do not change Hermes's default provider merely because another login is present.

The current managed session does not permit elevated execution. Additional skills and correct PATH selection do not themselves change its network or Keychain access.
