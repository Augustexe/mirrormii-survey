# Result page and share card (persona quiz v2)

How the result page reads, section by section, and where every line comes from. All data is in `result.json` (written by `node score.mjs profile answers.json`) plus `sealed-results.json` (written by `node score.mjs check`). Nothing on this page is written by hand or by a model: every line is a library line or the player's own answer.

Owner-only parts are marked **(only you)**. They never reach the share card or the friend game (the one exception is the bestie Level 4 sting pick, which the owner must switch on).

## Page order

1. **Type name**: `type.name` as the headline (relationship half × life half), `type.code` under it in small caps, then any badges from `type.badges`:
   - Flex: the badge name and its line ("You live on both sides of this one...") on the axis it belongs to.
   - Unfinished: "This side isn't finished yet. Two more cards and Genii can call it." In the flow the extras (`result.unfinished[].extras`) are offered before the finale, so this is rare on the final page. If it still shows, print that half's code part as "?".
2. **The two halves**: for each of `halves[]`, the half name as a subheading, its `desc`, then three small chips (one per axis) with the pole name. Tapping a chip shows its `line`. A flex chip carries the Flex badge.
3. **What stings (only you)**: the two `stings`, relationship half first.
4. **What you love about it**: the two `hearts`.
5. **Your tags**: up to 5 from `tags[]`, in the order given. Strong tags come first, ordered by support. The rest follow by how much of their chance they took: net support divided by the most support the cards this player actually answered could have given that tag (skips, exits, circumstance and "depends" answers do not count toward that most). So a tag whose few cards the player answered all one way can outrank a tag with more support spread over many cards. The list is then swapped, where possible, so the tags come from at least 3 chapters. For each:
   - the tag `name`, with a small label: `strong`, `showing`, or `leaning` (leaning only appears when nothing else fired);
   - "You told Genii:" and up to 3 of the player's own answers from `youToldGenii` (real moments first, then scenarios, then quick picks), each in double quotes (quotes inside an answer become single quotes);
   - the `sting` **(only you)**;
   - the `heart`.
6. **Genii's calls**: the three `calls[].line`, each on its own line starting with an arrow.
7. **Plot twist** (only when `plotTwist` is not null) **(only you)**: `plotTwist.line`, which reads "You'd say: '...' Last time, you did: '...'" (or "Put on the spot, you'd go with" when the acted side is a scenario). It comes from a split: quick-pick (believe) answers point one way, real or scenario answers the other, on the same axis or tag pair. An axis split can always be the twist. A tag-pair split can be the twist only when its two quoted cards share a Sally question or a chapter, so the twist never joins two unrelated situations (other tag-pair splits stay in the research record). Among the splits that qualify, one with a real card on the acted side wins, then an axis split before a tag-pair split, then the stronger split.
8. **Genii's guesses** (the sealed checks; the page heading is "Genii's guesses"): `sealed-results.json` `line`, e.g. "Genii called 5 of 7 exactly (chance about 25%)." Under it, each sealed card: Genii's guess, the player's answer, hit or miss. A pass reads "Genii passed: you're flex here" (or "not enough evidence yet").
9. **Share card** (see below) and the friend invite button.

Never shown anywhere: axis scores, tag ids, support numbers, card ids, the words "sealed", "evidence" or "axis", masks, or anything from `profile.json` `research`. The word "tags" appears only as the section heading "Your tags".

## Share card

Only three things, from `share`:

- the type name (`share.typeName`);
- the tag names, each with its heart line (`share.tags[]`); no stings, no answers;
- the invite, `share.invite`: "Do you really know me?", on the button that creates the friend game link.

No code, no badges, no plot twist, no sealed score.

## Worked example (synthetic)

Respondent from `node sim.mjs` (`sim-example/`): a consistent adult with a hidden profile of R1 +0.94, R2 -0.28, R3 -0.23, L1 +0.89, L2 -0.32, L3 +0.91 and 20% answer noise. The page below is `sim-example/result.json` and `sim-example/sealed-results.json`, laid out as specified. All six sides match the hidden profile and none is Flex, so there is no badge line under the code. The noise shows in the finale instead: both sealed misses are answers that go against the hidden profile (a Steady player pulling on the banner, an Easy player working at the gate), which Genii could not have called. The plot twist is an axis split (L3), so it qualifies without a shared chapter. The five tags come from chapters 1, 2, 4, 5 and 7.

---

> **Open-Book Golden Retriever × Slow-and-Steady Regular**
> WE·SOFT·OWN | STEADY·EASY·RULES
>
> **Open-Book Golden Retriever**
> You love out loud: warm, gentle, all in, and mostly by your own rulebook.
> `We` `Soft` `Own`
>
> **Slow-and-Steady Regular**
> Your days run on routine and order, and you're in no rush to prove anything to anyone.
> `Steady` `Easy` `Rules`
>
> **What stings** (only you)
> - You'll break any rule for your people, except the one where you tell them what hurt.
> - Your life is so steady that some nights you wonder if it's too steady.
>
> **What you love about it**
> - I'd rather love too much than too carefully.
> - I chose my ordinary days. I didn't settle for them.
>
> **Your tags**
>
> **Limited-edition energy** · strong
> You told Genii: "Paid my share. Home by 9. Completely peopled out." · "'Got a thing tonight.' The thing: my couch." · "Pretend I'm asleep. Text them first thing at 7am."
> Sting (only you): Your kindness has a daily cap. When it's gone, it's gone.
> *I charge myself first, so I have more to give.*
>
> **Minimalist on purpose** · strong
> You told Genii: "Cleared out a few old ones first, then bought it." · "The other pair. The 11 videos were the fun part." · "Ready in six minutes. Hoodie, keys, done."
> Sting (only you): You saved the money and the time. What exactly are you saving them for?
> *Less stuff, more room to breathe.*
>
> **Actually read the rulebook** · strong
> You told Genii: "Asked whoever's in charge, then went with their answer." · "Pull up the official rules. Read them out loud." · "First to ask gets it. That was the deal."
> Sting (only you): You trust the process, because you don't trust people to wing it.
> *Fair isn't cold to me. It's safe.*
>
> **Here, scroll my phone** · strong
> You told Genii: "Handed my best friend my phone: 'Write the follow-up. Make it chill.'" · "Type mine into their phone before they finish the sentence." · "Always. Come find me. I'm the dot at 4%."
> Sting (only you): You say you have nothing to hide. You're quietly hoping they have nothing to hide either.
> *Letting you all the way in is how I feel safe.*
>
> **Still loading, and that's fine** · showing
> You told Genii: "Double-tapped. Forgot it by the next video." · "Don't you dare. Finding out is the fun part." · "Changed plans four times. Happier every time."
> Sting (only you): You're not against settling down. You just hate being rushed.
> *My timeline is mine to write.*
>
> **Genii's calls**
> → You've let a call ring out, then texted 'what's up?' ten seconds later.
> → You've unsubscribed from every store newsletter.
> → You've actually read the terms and conditions on something.
>
> **Plot twist** (only you)
> You'd say: ‘Eat. Save them a plate and send a photo.’ Last time, you did: ‘Asked whoever's in charge, then went with their answer.’
>
> **Genii called 6 of 8 exactly (chance about 25%).**
> - The cilantro plate: "'Perfect, thanks!' Then pick out every leaf for twenty minutes." Hit.
> - The limited banner: Genii guessed "Skip it. That $30 already has a job." You: "Pull. All of it. Tonight." Miss.
> - The family holiday: "Yes! Karaoke room, takeout, everyone in pajamas." Hit.
> - The delayed flight: Genii guessed "Neck pillow on. Asleep at the gate." You: "Laptop out. Ahead on everything by boarding." Miss.
> - Slides or video: "Make the 10 slides. Done by Tuesday, font size 32." Hit.
> - Your person's three-month program: "Ask if there's anything like it closer to home." Hit.
> - The couch at 8am: "Show up at noon, once the heavy stuff is done. Bring pizza." Hit.
> - Your coffee spot closes: "Go to the closest one and order the exact same thing." Hit.

**Share card**

> **Open-Book Golden Retriever × Slow-and-Steady Regular**
> Limited-edition energy: *I charge myself first, so I have more to give.*
> Minimalist on purpose: *Less stuff, more room to breathe.*
> Actually read the rulebook: *Fair isn't cold to me. It's safe.*
> Here, scroll my phone: *Letting you all the way in is how I feel safe.*
> Still loading, and that's fine: *My timeline is mine to write.*
>
> [ Do you really know me? ]

---

## The friend game from the same result

`node score.mjs friend --rel bestie --stings on` builds `friend-deck.json` for this respondent: Level 1 is six either-or calls with the truth per axis (no side is Flex here; a Flex or unfinished side would accept either answer), worded from the set that fits the relationship (a friend or coworker gets the everyday set, with no love or family wording); Level 2 is 12 of their own cards rewritten in third person, with the side their answer maps to (skipped, rushed, circumstance, "depends", locked18 and intimate cards never appear); Level 3 is 12 tag cards (their 5 tags, the 5 opposites, 2 decoys), name and heart only; Level 4 is 4 sting lines (1 true) and 6 of the 13 preset roasts. The friend never sees stings except in that opt-in bestie round.
