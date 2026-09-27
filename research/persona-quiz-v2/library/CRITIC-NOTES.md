# Library critic notes (types.json, tags.json)

Pass date 2026-09-26. Three lenses at once: Theo (31, app-review creator: would people proudly share it?), Riley (16: does it sound like an adult trying to be young?), Jordan (25, male personal trainer, not a gamer: does it read in one pass without gamer or anime knowledge?). Checks on every half-name and tag: shareable, the sting lands because it is true (not cruel, not diagnostic), gender neutral, teen-safe unless locked18, not confusing, not cringe, not a caption cliche.

Edited in place. Ids, codes, pairs, chapters, triggers, flags and structure are unchanged; only `name`, `sting`, `heart`, one or two `calls` and three `origin` cross-references moved. Both files parse; 50 tags, 25 clean pairs, all names unique, no em dashes, no gendered pronouns in any player-facing line. Sally's `zh` is untouched everywhere (a new English name keeps Sally's Chinese).

Downstream: card or friend-game files that copied English tag or half-name text (not ids) need to pick up the new names.

## types.json (half-names)

| Code | Was | Now | Why |
|---|---|---|---|
| Me·Direct·Own | No-Filter Lone Wolf | No-Filter Free Agent | "Lone wolf" is sigma-male meme territory: male-coded and ironic-cringe for Riley, and Theo would not post it straight. "Free agent" keeps autonomy plus own script, is gender neutral, and Jordan gets it at once. |
| Me·Soft·Classic | Cottagecore Hermit | Do-Not-Disturb Homebody | Cottagecore is a feminine-coded aesthetic; Jordan would not share it. "Do Not Disturb" says the need for your own door, "homebody" says the cozy classic home. No new "old" name (Old-School Final Boss already has it). |
| Steady·Easy·Rules | Slice-of-Life Protagonist | Slow-and-Steady Regular | "Slice-of-life" is an anime genre term Jordan may not know, and "protagonist" is the main-character caption cliche. New name maps one word per pole: slow (Easy), steady (Steady), regular (routine, Rules). |
| We·Direct·Own (heart) | "Clingy and honest. You get both." | "I'm clingy and I tell the truth. You get the full set." | Every other heart is a first-person "I love my imperfection" line; this one read as a label. |

Kept after review: Trash-Talking Cuddle Bug (the roast offsets the cute), Family CEO (Sally's own and proud), Open-Book Golden Retriever (the most proudly shared self-label online; "open book" is Sally's 全透明), Human Weighted Blanket, Old-School Final Boss ("final boss" is mainstream now), Soft-Spoken Rebel, Color-Coded Overachiever, Low-Key Tryhard (a reclaimed teen insult, shareable), Chill Personified, Calculated Daredevil, Full-Send Trailblazer, Side-Quest Knight ("side quest" is mainstream), Vibes-Based Wanderer. Stings and descriptions on all 16 read as true, not cruel.

## tags.json

| Id | Was | Now | Why |
|---|---|---|---|
| T01A heart | "Being an open book is how I feel safe." | "Letting you all the way in is how I feel safe." | Reused "open book" from the half-name Open-Book Golden Retriever, which is the exact duplication T01A was renamed to avoid. |
| T02A name | Left on read, still means it | Leaves you on read, still loves you | "Left on read" means *you* got ignored; the tag is the person who does the ignoring. Confusing in one pass. |
| T02A heart, call | "doesn't need to clock in"; "someone you'd take a bullet for" | "doesn't need a daily check-in"; "someone you'd drop everything for" | Clock-in idiom did not land; bullet imagery is needless for teens. |
| T02B sting | "...You're waiting for them to text first." | "...Then you check when they were last online." | The sting repeated the tag name word for word; the new one is a behavior, so it stings because it is true. |
| T03B sting | "...The clumsy part is real." | "You'd rather send the clumsy apology than the good one. Sometimes the clumsy one lands worse." | The old line was a compliment, not a sting. |
| T04A name, sting, call | Small circle, big love | Close Friends list: 4 | "Small circle" is a stock Instagram caption. The new name is a screen everyone recognizes (Riley and Jordan both). Sting and one call rewritten so they do not repeat "four" or the Close Friends list. |
| T04B name | Friends with the whole server | Mayor of every group chat | "Server" is Discord or gamer-only (Jordan). "Mayor" is proud and clear. |
| T05A name | Grumbles, still shows up | Rolls eyes, grabs keys | Flat. The new name is the move itself and matches the call "get in the car". Avoids the half-name's "trash-talking". |
| T06A name, call | Friend VIP pass | Yes first, bank app later | Unclear who holds the pass. The new name is the behavior; the duplicate call was swapped for "the easiest yes in the chat". |
| T07A name, call | Straight shooter | The honest review nobody asked for | Bland, gun idiom, and too close to axis R2's "Direct" and the half-name "No-Filter". The new name is a proud roast of the move. Call swapped so it does not repeat the name. |
| T07B name, sting, call | Sugar-coated assassin; "...There's still a knife in the middle." | Compliment sandwich chef; "You wrap the truth in so much sugar that some people only taste the sugar." | "Assassin" plus "knife" read as passive-aggressive, which the tag's own `never` forbids, and is a violent frame for teens. The new sting is the true cost of soft delivery (the message gets lost). |
| T09A name | Lovebrain, with rules | Head over heels, eyes open | "Lovebrain" is a translation of 戀愛腦, not English; Jordan would not parse it. New name keeps "all in, but I know where the door is". |
| T11B name | Whole without kids | Full life, no kids required | "Whole without" implied parents are the whole ones, a moral grade. (locked18, unchanged.) |
| T12B name | Fair means it hurts the same | Splits by who can afford it | "Hurts" is grim and took two reads. The new name is the behavior on every trigger (income-based split, the broke friend on the trip). |
| T13A name | Rolls the dice | Books it, figures it out later | Gambling read, with a gacha call next to it and a teen audience. The new name is the move (trip, six-month shot). |
| T14A name, sting, call | Treats myself, professionally; "...Looking good still makes your whole day." | Skips the dupe; "You say it's just for you. You still notice exactly who noticed." | "Treat yourself" is a caption cliche. "Dupe" is everyday Gen Z and adult shopping language and fits the triggers (brand, skin, nicer version). The old sting was a compliment. One call now covers skins (game character wardrobe) so non-clothes players see themselves. |
| T15A name | Hustle believer | Earned, not given | "Hustle" is loaded hustle-culture language; Riley rolls their eyes, Theo would not post it. |
| T16A name | Trophy-case energy | Building the trophy shelf | Three tags ended in "energy" (a caption tic). Now one does (Limited-edition energy, which earns it). |
| T18A sting | "...Nobody has asked about your plan A." | "...Your own plan A keeps moving to next month." | Echoed the Family CEO sting ("Nobody has asked if you're tired"); both can show on one result page. |
| T19A name | Moves out, still calls Sunday | Moves out, still calls on Sundays | Grammar. |
| T20B name | Walks the new talk | Writes my own house rules | The pun did not read in one pass. New name is clear and works for teens (house rules, not marriage). |
| T22A name | One-way ticket energy | Always has a flight tab open | "Energy" tic again; the new one is a specific, true, shareable behavior. |
| T23A name | Support main | Team healer, IRL | "Main" is gamer jargon (Jordan). "Healer" is widely understood and matches the role-card trigger. |
| T23B name, sting | Solo leveling | Booked solid, all me | "Solo Leveling" is the title of a manhwa and anime: gamer-only for Jordan, a borrowed title for Theo (possible IP issue on a share card). The sting was rewritten because the old one used the new name's words. |
| T25B name | Rules are more like guidelines | Bends rules for good reasons | A movie-quote caption cliche; the new name says the behavior and stays positive. |
| origin fields | T09A/B, T22A/B | updated | They cited the old half-names No-Filter Lone Wolf and Cottagecore Hermit. |

Kept after review: Here, scroll my phone; My passcode, my dignity; Waiting for you to text first; Tells the AI first; Typos and all, my own words; Writes the birthday paragraph; Limited-edition energy; Redemption arc believer; Keeps the receipts; Dating, not merging; Relationship mechanic; Knows when to log off; Future parent, with terms; Splits it to the cent; Rainy-day fund devotee; Minimalist on purpose; Head-start detector; Clocks out on the dot; Needs a save point ("save point" is mainstream); Still loading, and that's fine; Family's backup battery; Helps, with an end date; Runs it by the family group chat; Modern for you, classic for me; The wedding's for the family; Love without the paperwork; Same order, every time; There's a spreadsheet for that; Eyeballs everything; Actually read the rulebook.

## Open for Jerry (not changed; judgment calls)

- **Chill Personified** is clear but the weakest share of the 16 (Theo). No better neutral name came up that avoids "unbothered" (a caption cliche) and "vibes" (taken by Vibes-Based Wanderer).
- **Trash-Talking Cuddle Bug**: Jordan might hesitate to post "cuddle bug"; kept because the roast half makes it ironic and Sally's 嘴硬黏人精 is exactly this.
