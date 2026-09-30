# Result copy library (`library.schema.json`)

**Today.** `research/persona-quiz-v2/final/library.json`. Every player-facing result line, keyed by id, in both voices (top-level field is Make it fun, `h` is Heart to heart; `insights`, `insightFallback` and `crossover` use `{ fun, heart }` pairs).

| Part | Keyed by | Holds |
|---|---|---|
| `axes[6]` | R1 to L3 | pole names (internal), lines, "knows" lines, core-trait keywords per end, character sheet lines per end and band |
| `relationship[8]`, `life[8]` | half code (`We·Soft·Own`) | archetype name, desc, read, sting, heart |
| `tags[50]` | T01A to T25B | name, line, sting, heart, 3 calls, keyword, `echo`, `locked18` (marriage and kids: never shareable), `friendGame` |
| `rooms` | chapter, axis, end | room name and one line per end |
| `insights`, `insightFallback` | axis and believed side; half code | the thing you didn't know |
| `article`, `crossover` | section; `R1+\|L2-` | Evidence Article frames and team or clash lines (round 4, K1) |

Renaming anything here never touches evidence. zh fields are Sally's source, reference only.
