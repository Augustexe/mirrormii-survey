# Rules for agents working in this repository

## Read first

1. `docs/LAUNCH-SPEC.md`: the one locked spec. It wins over every other doc, README and code comment.
2. `quiz64/README.md`: the web app (run, test, build, QA, source map, content flow).
3. `docs/HANDOFF-DESMOND.md` for backend, friend game server, contracts, question pack or deployment work.

`README.md` is the repository entry and folder map; `docs/STATE.md` is the one-page status.

## Rules

- **One build, one spec.** Never start a parallel build, a second spec or a "round" section. The spec changes only by a
  dated ruling from Jerry (the product owner): edit the rule in place and add one line to its Changes log (section 11).
- **Plan or audit requests build nothing.** Answer with straight numbers.
- **Pushing deploys.** Every push to `main` publishes the live site through `.github/workflows/deploy-pages.yml`.
  Push, deploy or publish only on Jerry's go.
- **Content belongs to Jerry.** Card text, tags, names, result copy, scoring rules and visual design change only on
  his ruling. Cards follow `docs/VOICE.md` and spec sections 2, 4 and 5; result labels follow `docs/NAMING-RULES.md`.
- **No em dashes** anywhere: copy, code comments, docs. `node scripts/check-docs.mjs` guards the docs.
- **Never commit** respondent data, secrets, tokens, `.env` files, personal paths or private business material.
- **No iteration files.** Results go into the doc that owns the topic (the spec for numbers, with their date).
  Screenshots, contact sheets and QA reports go to the ignored folders under `quiz64/qa/`, never into `docs/`.

## Before you finish

Run every gate in `README.md` ("Quality gates"); all must pass. After a card change, follow the change flow in spec
section 5 (merge, check, re-lock, snapshot, sim, contract examples, question pack). Update the spec's numbers in place
with the date measured and add one Changes line.
