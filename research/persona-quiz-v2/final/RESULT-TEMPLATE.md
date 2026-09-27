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
5. **Your tags**: up to 5 from `tags[]`, strongest first. For each:
   - the tag `name`, with a small label: `strong`, `showing`, or `leaning` (leaning only appears when nothing else fired);
   - "You told Genii:" and up to 3 of the player's own answers from `youToldGenii` (real moments first, then scenarios, then quick picks), each in double quotes (quotes inside an answer become single quotes);
   - the `sting` **(only you)**;
   - the `heart`.
6. **Genii's calls**: the three `calls[].line`, each on its own line starting with an arrow.
7. **Plot twist** (only when `plotTwist` is not null) **(only you)**: `plotTwist.line`, which reads "You'd say: '...' Last time, you did: '...'" (or "Put on the spot, you'd go with" when the acted side is a scenario). It comes from a split: quick-pick (believe) answers point one way, real or scenario answers the other, on the same axis or tag pair.
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

Respondent from `node sim.mjs` (`sim-example/`): a consistent adult with a hidden profile of R1 +0.41, R2 +0.53, R3 -0.20, L1 -0.28, L2 +0.35, L3 -0.58 and 20% answer noise. The page below is `sim-example/result.json` and `sim-example/sealed-results.json`, laid out as specified. Note the two misses against the hidden profile (L1 came out Steady, L2 came out Easy with a Flex badge): that is what 20% noise does, and it is why the Flex badge exists.

---

> **Trash-Talking Cuddle Bug × Chill Personified**
> WE·DIRECT·OWN | STEADY·EASY·CONTEXT
> Flex on Easy: *You live on both sides of this one. Genii couldn't call it, and honestly, neither could you.*
>
> **Trash-Talking Cuddle Bug**
> You want your people close, always. You show it by roasting them, saying it straight and writing your own rules for love.
> `We` `Direct` `Own`
>
> **Chill Personified**
> You don't race anyone's timeline. You go with the flow, but you never blow the budget doing it.
> `Steady` `Easy (Flex)` `Context`
>
> **What stings** (only you)
> - You call them annoying. Your real fear is the day they stop annoying you.
> - You're not unambitious. Nothing has been worth the grind yet.
>
> **What you love about it**
> - I'm clingy and I tell the truth. You get the full set.
> - My life doesn't need a progress bar.
>
> **Your tags**
>
> **Limited-edition energy** · strong
> You told Genii: "Admitted it was over my budget in the chat. Took three drafts." · "'Got a thing tonight.' The thing: my couch. Offered the morning." · "Pretend I'm asleep. Text them first thing at 7am."
> Sting (only you): Your kindness has a daily cap. When it's gone, it's gone.
> *I charge myself first, so I have more to give.*
>
> **Bends rules for good reasons** · strong
> You told Genii: "Worked around it quietly. Nobody got hurt." · "The friend having the awful month. They need tonight." · "Draw six. Stacking is the best part of Uno."
> Sting (only you): You think people made the rules, so the rules should bend for people.
> *I look at the person, not the form.*
>
> **The honest review nobody asked for** · strong
> You told Genii: "Told them straight it was wrong. Left on read for two days." · "'The chorus needs work. Want notes before midnight?'" · "Critic: 'Honestly? Not your best. Grow it out.'"
> Sting (only you): You think the truth is respect. Some people just feel poked.
> *I'd rather annoy you than lie to you.*
>
> **Head over heels, eyes open** · strong
> You told Genii: "Stuck together all night. Basically one person with two phones." · "Envy. Someone else got the good version of them." · "We can do nothing together for hours and it's perfect."
> Sting (only you): You say you're independent. You still want to be in every part of their day.
> *I love all the way, and I know where the door is.*
>
> **Team healer, IRL** · showing
> You told Genii: "Got roped into a friend's bake sale. Honestly? Loved it." · "The neighbor's. My plant has a backstory now." · "Someone says 'I need hands' and I'm already putting on shoes."
> Sting (only you): You want to make the world better. On your own to-do list, you're always last.
> *I love the world, and I'm practicing loving me too.*
>
> **Genii's calls**
> → You've said 'can we do this tomorrow?' and meant it as an act of love.
> → You've let someone ahead of you in line because they looked stressed.
> → You've told someone about the spinach in their teeth, mid-conversation.
>
> **Plot twist** (only you)
> You'd say: 'Let AI fix it. Add one typo so it sounds like me.' Last time, you did: 'Voice-noted my closest person. Four minutes, no summary.'
>
> **Genii called 5 of 7 exactly (chance about 25%).**
> - Crush with the ex on the lock screen: Genii guessed "Honestly? We need to talk about the lock screen." You: "They seem sweet! You look so happy." Miss.
> - The limited banner: "Wait for the rerun." Hit.
> - The family holiday: "Karaoke room, takeout, everyone in pajamas." Hit.
> - The delayed flight: Genii passed, you're flex here.
> - Slides or video: "Make the video." Hit.
> - Your person's three-month program: "Ask if there's anything like it closer to home." Hit.
> - The couch at 8am: Genii guessed "Show up, complain the whole way, take the heavy end." You: "Come for an hour, then head back to bed." Miss.
> - Your coffee spot closes: "Try a different place every day until one clicks." Hit.

**Share card**

> **Trash-Talking Cuddle Bug × Chill Personified**
> Limited-edition energy: *I charge myself first, so I have more to give.*
> Bends rules for good reasons: *I look at the person, not the form.*
> The honest review nobody asked for: *I'd rather annoy you than lie to you.*
> Head over heels, eyes open: *I love all the way, and I know where the door is.*
> Team healer, IRL: *I love the world, and I'm practicing loving me too.*
>
> [ Do you really know me? ]

---

## The friend game from the same result

`node score.mjs friend --rel bestie --stings on` builds `friend-deck.json` for this respondent: Level 1 is six either-or calls with the truth per axis (Flex on L2, so either answer counts there); Level 2 is 12 of their own cards rewritten in third person, with the side their answer maps to (skipped, rushed, circumstance, "depends", locked18 and intimate cards never appear); Level 3 is 12 tag cards (their 5 tags, the 5 opposites, 2 decoys), name and heart only; Level 4 is 4 sting lines (1 true) and 6 preset roasts. The friend never sees stings except in that opt-in bestie round.
