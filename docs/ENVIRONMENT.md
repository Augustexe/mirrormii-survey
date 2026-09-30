> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

> Dated environment snapshot. Use [CODE-MAP.md](CODE-MAP.md) for the actual app and [CURRENT.md](CURRENT.md) for later handoff/deployment receipts. Old sandbox/access failures are not current diagnostics.

# Project environment

## Local source and review

Project ID: `mirrormii-genie-survey`. Canonical source is `/Users/jerryzhang/Workspace-Draft/products/survey`; generated deliverables and validation evidence belong in an allocated project run.

The MVP is a dependency-free browser app with JavaScript ES modules, a small Node development server and a standalone HTML builder. Managed Node 24 is the development route; `package.json` declares Node 22 or newer. No framework or third-party package install is needed. This project's registry and desired manifest now select `node-npm`; company/media context routing is unchanged. This is a local build choice, not a production backend selection.

From the source directory, use the managed toolchain:

```sh
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm run dev
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm run check
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm test
```

The server binds `127.0.0.1:4173`; `PORT` overrides the port. It serves the page, source modules and public assets, not repository documents or credentials. Stop it with Ctrl-C. It is a local review server, not a production deployment.

The standalone builder embeds owned application modules, styles and unchanged PNG assets into one `index.html`. Set `GENII_OUTPUT_DIR` to the allocated run's output subdirectory before building in this workspace:

```sh
GENII_OUTPUT_DIR="/Users/jerryzhang/Workspace-Draft/hall/data/jobs/mirrormii-genie-survey/20260914T214741Z-53aa82ae91a1/output/mvp" /Users/jerryzhang/Workspace-Draft/system/bin/dev npm run build
```

Open the resulting `index.html` directly in a browser when local server binding is unavailable. A normal external checkout can use `npm run build`, whose default output is `dist/index.html`. Source `index.html` uses modules and is intended for the server; the built file is the portable review artifact. Storage and clipboard behavior can differ under file URLs. A file/localhost share URL is not a public campaign link.

`npm test` exercises deterministic contracts with synthetic answers; `npm run check` verifies source syntax. Interactive flow, layout and PNG rendering need browser verification where that surface is available. Consult the current run's evidence for checks actually performed; the existence of a command does not mean it passed. Finalize run output with `system/bin/workspace.py` for its SHA-256 receipt.

## Native access and GitHub

Use `/Users/jerryzhang/Workspace-Draft/system/bin/dev COMMAND` from allocated run scratch for general CLI work. `dev --project mirrormii-genie-survey COMMAND` changes cwd to source and is for intended project work. The wrapper chooses tools, not permissions. Preserve native authentication; [CLI-ACCESS.md](CLI-ACCESS.md) separates PATH, login presence, remote verification and sandbox restrictions.

Fresh checks on 2026-09-14 at 21:49 UTC still found a network-disabled execution process, external DNS failures, loopback EPERM on 4310/33333, and Lark Keychain initialization failure before identity verification. GitHub repository metadata and remote HEAD could not be read. These observations do not establish invalid tokens or stopped native services. No browser route or reauthentication was used in that check.

The existing team repository is [Augustexe/mirrormii-survey](https://github.com/Augustexe/mirrormii-survey); local `origin` points there. Independent local planning history was on `planning/genie-survey` at `ca042bdc91316a2c7e37d896ee484c54caadd16b` when inspected. Remote source, default branch, visibility, collaborators and instructions remain unverified. Local MVP changes are authorized; no push or remote integration is included.

When permitted access is available, inspect a scratch clone's AGENTS instructions, source and team conventions before applying these files to a branch from the appropriate remote base. Preserve unique team work and the local baseline. Never force-push unrelated local history or create a replacement repository. Reconcile any templates and workflows with the existing team project.

## Company and data route

Current company truth comes from the MirrorMii OS Base and canonical MirrorMii Marketing OS Wiki, through the protected service or authorized native Lark reads. Read only the bounded facts needed for the task; preserve source status, scope and revision/time. Do not persist raw company packets, private app state or credentials in source or run evidence.

`context/source-map.json` contains routing references, not verified live company content. Fresh company grounding remains pending. Local legacy Work OS and historical imports cannot substitute for canon. The local app uses the founder's survey brief, not unverified product claims.

The app's localStorage is a prototype record for this browser. No Lark tables, production accounts, backend, payment gateway, outbound messages, campaign analytics collector or active affiliate program are provisioned. [DATA-DESIGN.md](DATA-DESIGN.md) describes the production contracts still to choose and implement.

## Character route

Canon is `/Users/jerryzhang/Workspace-Draft/assets/Genomii AI.library`. The current V2 folder contains existing expressions of one Genii character. Primary selected master: Eagle `MSF9HPVHMCG93`; existing curious and skeptical expressions support the conversation. Selected master metadata confirms owned rights and app-UI usage; pixels remain unchanged in the app.

The run's `output/assets-audit` contains the exact source IDs/paths, SHA-256 checksums, metadata and interpretation limits. The provisional eight result families are not eight established character assets. Generated project reference sheets remain draft files in run output under the user's current scope; they are not promoted into canon or substituted for the originals.
