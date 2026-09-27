/* Genii tag pilot bank v1 (2026-09-26).
 * One source of truth for the app, the tests and docs/questions/PILOT-BANK-V1.md.
 * Levels: -2 strongly A, -1 leaning A, 0 both/depends, +1 leaning B, +2 strongly B.
 * Stance = what they believe (grade "prefer"); scene = what they did (grade "did");
 * sealed = held-out check answered after the profile is frozen. Never scored.
 * Sources: Sally's Profile_12Domains_48Questions_TagMap_v1 (Qnn) and
 * Women_20-30_Debate_Topics_60 (Tnn), research/sally-values-2026-09-26.
 */
(function (root) {
  const DOMAINS = {
    love: "Love and closeness",
    friends: "Friends",
    family: "Family",
    money: "Money",
    work: "Work or school",
    online: "Online life",
    me: "Me and my future",
  };

  const DIMENSIONS = [
    // ---------- Love and closeness ----------
    {
      id: "closeness_style", domain: "love", sally: ["Q05", "Q26"],
      A: "Togetherness", B: "Own orbit",
      never: "an attachment style or how much they love anyone",
      stance: {
        prompt: "With the person you're closest to, the ideal is…",
        a: "Most free time together, sharing the whole day.",
        b: "Close, and each of us keeps real time and space of our own.",
        mask: "looks like relationship goals; measures how much shared time they want", feel: "recognition",
      },
      scene: {
        prompt: "Think of your last free weekend day with nothing planned. How much of it went to your closest person?",
        mask: "looks like a weekend recap; measures togetherness in practice", feel: "recognition",
        options: [
          { t: "Nearly all of it, on purpose.", level: -2 },
          { t: "A good chunk, then some time to myself.", level: -1 },
          { t: "A check-in call or text. The rest was mine.", level: 1 },
          { t: "Mostly mine. We'd catch up another time.", level: 2 },
        ],
      },
    },
    {
      id: "betrayal_line", domain: "love", sally: ["Q06"],
      A: "Emotional closeness is the line", B: "Broken agreements are the line",
      never: "how jealous they are or how serious any betrayal is",
      stance: {
        prompt: "Your person secretly grew close to someone else. Nothing physical, but they shared things that used to be just yours. What hurts most?",
        teenPrompt: "Your best friend secretly grew close to someone else and shared things that used to be just yours. What hurts most?",
        a: "The closeness itself. That was ours.",
        b: "The hiding. We never agreed that was okay.",
        mask: "looks like a cheating debate; measures where they draw the line", feel: "sting",
      },
    },
    {
      id: "commitment_pace", domain: "love", sally: ["Q07"], adultOnly: true,
      A: "Closeness can come first", B: "Commitment comes first",
      never: "their history, experience or orientation",
      stance: {
        prompt: "Mutual attraction, respect, everything talked through, but nothing official yet. Getting physical is…",
        a: "Fine by me. Commitment isn't a precondition.",
        b: "Something I'd rather wait on until it's official.",
        mask: "adult-only; own comfort, not a rule for others", feel: "recognition",
      },
    },
    {
      id: "phone_privacy", domain: "love", sally: ["Q41"],
      A: "Open phones", B: "Private phones",
      never: "trust issues or having something to hide",
      stance: {
        prompt: "Your closest person suggests you both share phone passcodes. No trust issues, just an idea.",
        a: "Sure. Feels natural.",
        b: "I'd rather keep mine. If something's up, just ask me.",
        mask: "looks like a trust test; measures privacy inside closeness", feel: "curiosity",
      },
    },
    {
      id: "who_pays", domain: "love", sally: ["T09", "T11"],
      A: "Whoever asked pays", B: "Split from the start",
      never: "generosity or stinginess",
      stance: {
        prompt: "First date or first hangout, the bill arrives.",
        a: "Whoever did the asking pays. That's the move.",
        b: "Split it. Clean start, no scorekeeping.",
        mask: "looks like dating etiquette; measures their default fairness frame", feel: "delight",
      },
    },
    {
      id: "standards", domain: "love", sally: ["T03", "T04"],
      A: "Trust the ick", B: "Look past small things",
      never: "being picky or being desperate",
      stance: {
        prompt: "Someone great does one small thing that gives you the ick.",
        a: "The ick knows things. I trust it.",
        b: "Small stuff shouldn't outweigh the whole person.",
        mask: "looks like dating banter; measures how fast a small signal ends things", feel: "cringe",
      },
    },
    // ---------- Friends ----------
    {
      id: "support_capacity", domain: "friends", sally: ["Q27"],
      A: "Show up anyway", B: "Say so and reschedule",
      never: "kindness, selfishness or how much they care",
      stance: {
        prompt: "A friend needs you tonight and you're running on empty. Being a good friend means…",
        a: "Showing up anyway.",
        b: "Saying so, and picking another time.",
        mask: "looks like friend loyalty; measures their capacity boundary", feel: "guilt",
      },
      scene: {
        prompt: "Think of the last time someone wanted a long talk or a favor on a night you were running on 4%. What happened?",
        mask: "looks like a friendship story; measures whether they voice their limit", feel: "guilt",
        options: [
          { t: "Showed up, full session. Sleep is a social construct.", level: -2, also: ["need_voice:absorber"] },
          { t: "Showed up, and quietly set a timer in my head.", level: -1 },
          { t: "Let it sit and replied the next day.", level: 1, emotion: "guilt" },
          { t: "Sent \"can't tonight, tomorrow?\"", level: 2, also: ["need_voice:asker"] },
        ],
      },
    },
    {
      id: "contact_needs", domain: "friends", sally: ["Q26", "T45"],
      A: "Low contact is fine", B: "I need people to reach out",
      never: "how good a friend they are",
      stance: {
        prompt: "You and a friend haven't talked in a couple of months. Nobody's upset.",
        a: "Totally fine. We'll pick up right where we left off.",
        b: "It matters to me that someone reaches out.",
        mask: "looks like a friendship debate; measures how much contact they need to feel held", feel: "sting",
      },
      scene: {
        prompt: "Think of the last time a friend went quiet for a few weeks. What actually went on in your head?",
        mask: "looks like a friendship recap; measures the sting of silence", feel: "sting",
        options: [
          { t: "Didn't notice until they popped back up.", level: -2 },
          { t: "Noticed, figured they were busy, moved on.", level: -1 },
          { t: "Checked their stories to see if they were alive.", level: 1, emotion: "worry" },
          { t: "Felt it. A little \"do they still like me?\"", level: 2, emotion: "sting" },
        ],
      },
    },
    {
      id: "friend_did_harm", domain: "friends", sally: ["Q25", "T41"],
      A: "Steady them first", B: "Call it first",
      never: "loyalty or moral character",
      stance: {
        prompt: "A close friend clearly hurt someone else. The facts are pretty settled. First move?",
        a: "Be there for them first, then talk about owning it.",
        b: "Tell them it wasn't okay, even if they feel I'm not on their side.",
        mask: "looks like friend drama; measures support versus accountability order", feel: "tension",
      },
      scene: {
        prompt: "Think of the last time a friend was pretty clearly in the wrong in some group drama. What did you do?",
        mask: "looks like gossip; measures whether they name it", feel: "tension",
        options: [
          { t: "Stayed on their side in public. Talked to them privately later.", level: -2, also: ["signal:private"] },
          { t: "Stayed neutral and let it blow over.", level: -1, also: ["friction:let_it_breathe"] },
          { t: "Told them privately they'd messed up.", level: 1, also: ["friction:name_it"] },
          { t: "Said it in the group chat, kindly but clearly.", level: 2, also: ["signal:out_loud", "friction:name_it"] },
        ],
      },
    },
    {
      id: "celebration_budget", domain: "friends", sally: ["Q28", "T23"],
      A: "Stretch for the moment", B: "Say the budget",
      never: "cheapness or showing off",
      stance: {
        prompt: "Friends plan a birthday trip that's over your comfortable budget, but doable.",
        a: "Go. You cut back somewhere else. Some moments are worth it.",
        b: "Say the budget out loud and celebrate a cheaper way.",
        mask: "looks like money etiquette; measures voicing a limit in a group", feel: "guilt",
      },
      scene: {
        prompt: "Think of the last time friends planned something above your budget. What did you do?",
        mask: "looks like a money story; measures silent stretching versus saying it", feel: "guilt",
        options: [
          { t: "Went, paid, and quietly ate rice for a week.", level: -2, also: ["need_voice:absorber"] },
          { t: "Went, and skipped the pricier parts without saying why.", level: -1 },
          { t: "Said my budget and suggested a cheaper version.", level: 2, also: ["need_voice:asker"] },
          { t: "Sat this one out and made it up to them later.", level: 1 },
        ],
      },
    },
    {
      id: "feedback_style", domain: "friends", sally: ["Q37"],
      A: "Straight to the fix", B: "Warm first, fix later",
      never: "honesty or kindness",
      stance: {
        prompt: "A friend asks what you think of their practice run for something big. It isn't there yet, and they're already rattled.",
        a: "Name the main problem now, with a way to fix it.",
        b: "Build them up first. The hard part can wait until they're steadier.",
        mask: "looks like a friendship dilemma; measures feedback order", feel: "tension",
      },
      scene: {
        prompt: "Think of the last time a friend asked what you honestly thought of something they made or planned. What did you actually say?",
        mask: "looks like a story about a friend; measures directness", feel: "cringe",
        options: [
          { t: "The truth, first sentence.", level: -2, also: ["friction:name_it"] },
          { t: "One nice thing, then the truth.", level: -1 },
          { t: "Mostly the nice things. The truth got a small cameo.", level: 1 },
          { t: "\"I love it!\" and moved on.", level: 2, also: ["friction:let_it_breathe"] },
        ],
      },
    },
    {
      id: "second_chances", domain: "friends", sally: ["Q39"],
      A: "They can earn their way back", B: "The hurt person decides",
      never: "forgiveness as a virtue score",
      stance: {
        prompt: "Someone in your group hurt a person, owned it, made it right and actually changed. They want back in.",
        a: "Let them back in gradually, with some boundaries.",
        b: "Whatever the person they hurt wants comes first.",
        mask: "looks like group politics; measures repair versus protection", feel: "tension",
      },
    },
    // ---------- Family ----------
    {
      id: "strings_attached", domain: "family", sally: ["Q21"],
      A: "Help comes with family terms", B: "Only on my terms",
      never: "gratitude or how close they are to family",
      stance: {
        prompt: "Your parents offer to help with rent, as long as you live closer to them.",
        teenPrompt: "Your parents offer a later curfew, as long as you share your location.",
        a: "Fair deal. Family help comes with family expectations.",
        b: "Only if it fits my own plans. Otherwise I'll wait.",
        mask: "looks like money; measures duty against autonomy", feel: "guilt",
      },
    },
    {
      id: "family_vs_own_call", domain: "family", sally: ["Q24"],
      A: "Bring family along first", B: "My call after listening",
      never: "respect or rebellion",
      stance: {
        prompt: "You want to make a big move (new city, new school, new job). Your family isn't on board, but nothing actually needs you home.",
        a: "Keep talking until they're on board, even if it means waiting.",
        b: "Hear them out, then decide on my own timeline.",
        mask: "looks like a life choice; measures family consensus versus own call", feel: "guilt",
      },
      scene: {
        prompt: "Think of the last time your family pushed back on a decision of yours, big or small. What happened next?",
        mask: "looks like a family story; measures who has the final say in practice", feel: "guilt",
        options: [
          { t: "Changed the plan. Peace at home won.", level: -2 },
          { t: "Found a compromise so everyone could live with it.", level: -1 },
          { t: "Did it anyway, and explained a lot.", level: 1, also: ["friction:name_it"] },
          { t: "Did it anyway. Told them after.", level: 2 },
        ],
      },
    },
    {
      id: "family_safety_net", domain: "family", sally: ["Q23"],
      A: "Family carries each other", B: "Help with an end date",
      never: "love or loyalty",
      stance: {
        prompt: "Your parents want you to keep supporting a grown sibling who isn't in a crisis, just not standing on their own yet.",
        teenPrompt: "Your parents want you to keep covering for a sibling who keeps skipping their chores.",
        a: "Family carries each other. We'll sort out the fairness later.",
        b: "Help, with an end date. They need to stand on their own.",
        mask: "looks like family money; measures open-ended duty", feel: "guilt",
      },
    },
    {
      id: "caregiving", domain: "family", sally: ["Q22"],
      A: "Be there in person", B: "Organize the help",
      never: "how devoted they are to family",
      stance: {
        prompt: "A family member needs long-term care. You could chip in money, siblings could help, but moving home would hurt your work or school.",
        a: "Be there in person. Everything else adjusts.",
        b: "Organize family and professional help, and keep my life going.",
        mask: "looks like a family dilemma; measures in-person duty versus coordinated care", feel: "guilt",
      },
    },
    // ---------- Money ----------
    {
      id: "fairness_rule", domain: "money", sally: ["Q14", "T10"],
      A: "Fair means equal", B: "Fair means proportional",
      never: "stinginess, generosity or wealth",
      stance: {
        prompt: "Two people share costs. One earns about twice as much. Fair is…",
        a: "Split it evenly.",
        b: "The higher earner pays more.",
        mask: "looks like a 50/50 debate; measures their fairness rule", feel: "tension",
      },
      scene: {
        prompt: "Think of the last shared bill: dinner, a trip, a group gift. How did the split actually go?",
        mask: "looks like a money story; measures fairness in practice, and resentment", feel: "tension",
        options: [
          { t: "Down the middle. Clean math, no feelings.", level: -2 },
          { t: "Even split, and I did the math on it later.", level: -1, emotion: "resentment" },
          { t: "Whoever had more that month covered more.", level: 2 },
          { t: "I covered it and didn't bring it up.", level: null, also: ["need_voice:absorber"] },
        ],
      },
    },
    {
      id: "lending", domain: "money", sally: ["Q15"],
      A: "Help first", B: "Terms first",
      never: "kindness or trust",
      stance: {
        prompt: "A close friend urgently needs money you could spare, but losing it would sting. They're not sure when they can pay you back.",
        a: "Give what I can afford to lose. Don't lead with the payback date.",
        b: "Get the payback plan clear first, then decide.",
        mask: "looks like a money dilemma; measures boundaries around help", feel: "guilt",
      },
      scene: {
        prompt: "Think of the last time someone asked you to lend or cover money. What did you do?",
        mask: "looks like a money story; measures whether they set terms", feel: "guilt",
        options: [
          { t: "Sent it. Didn't mention paying back.", level: -2, also: ["need_voice:absorber"] },
          { t: "Sent it, with a vague \"whenever\".", level: -1 },
          { t: "Sent it with a clear \"by the 15th?\"", level: 1, also: ["need_voice:asker"] },
          { t: "Said not this time.", level: 2, also: ["need_voice:asker"] },
        ],
      },
    },
    {
      id: "effort_vs_start", domain: "money", sally: ["Q13"],
      A: "Credit the effort", B: "Name the head start",
      never: "politics or class",
      stance: {
        prompt: "A friend bought a home with help from their parents. They say they worked hard for it too.",
        a: "They did. Help doesn't erase effort.",
        b: "Sure, but the head start should be said out loud.",
        mask: "looks like a class debate; measures how they explain success", feel: "envy",
      },
    },
    {
      id: "time_horizon", domain: "money", sally: ["Q33", "T55"],
      A: "Now", B: "Later",
      never: "responsibility or impulsiveness",
      stance: {
        prompt: "An unexpected $300 lands. The best use is…",
        a: "Something I'll remember this month.",
        b: "Savings, or something I'll need later.",
        mask: "looks like a money quiz; measures now versus later", feel: "delight",
      },
      scene: {
        prompt: "Think of the last bit of surprise money: a refund, birthday cash, a bonus. Where did most of it go?",
        mask: "looks like a money recap; measures time horizon in practice", feel: "delight",
        options: [
          { t: "Straight into a plan or a treat. Gone within a week.", level: -2 },
          { t: "Some fun, the rest set aside.", level: -1 },
          { t: "Mostly saved, one small treat.", level: 1 },
          { t: "Saved or went to bills. Didn't really feel it.", level: 2, flag: "can reflect tight money, not personality" },
        ],
      },
    },
    {
      id: "favorite_premium", domain: "money", sally: ["Q34", "Q36"],
      A: "Pay for the one I love", B: "Keep the difference",
      never: "vanity or thrift",
      stance: {
        prompt: "Two versions do the same job. You love one, and it costs a lot more but still fits your budget.",
        a: "The one I love. The feeling is part of the value.",
        b: "The cheaper one. The difference goes somewhere else.",
        mask: "looks like shopping; measures what they pay for", feel: "delight",
      },
      scene: {
        prompt: "Think of the last time you chose between a pricier favorite and a cheaper equivalent. What did you get?",
        mask: "looks like a shopping recap; measures the premium they actually pay", feel: "delight",
        options: [
          { t: "The favorite. No regrets.", level: -2 },
          { t: "The favorite, after a week of deliberating.", level: -1 },
          { t: "The cheaper one, and I still think about the other.", level: 1, emotion: "longing" },
          { t: "The cheaper one. Didn't think twice.", level: 2 },
        ],
      },
    },
    // ---------- Work or school ----------
    {
      id: "pay_or_passion", domain: "work", sally: ["Q17"],
      A: "Pay first", B: "Interest first",
      never: "ambition or laziness",
      stance: {
        prompt: "Two options both cover your needs. One pays more but bores you; the other pays less and you'd actually enjoy it.",
        teenPrompt: "Two part-time jobs. One pays more but bores you; the other pays less and you'd actually enjoy it.",
        a: "Take the money. Enjoy life outside it.",
        b: "Take the one I'd enjoy. I'll live a bit leaner.",
        mask: "looks like career advice; measures what work is for", feel: "recognition",
      },
    },
    {
      id: "risk_style", domain: "work", sally: ["Q19"],
      A: "Test it on the side", B: "Go all in",
      never: "bravery or caution as a virtue",
      stance: {
        prompt: "You have a cushion for six months. A risky thing you really want to try shows up next to your steady option.",
        a: "Keep the steady thing and test the new one on the side.",
        b: "Give it six real months. Accept the cushion might shrink.",
        mask: "looks like a career choice; measures how they take risks", feel: "hope",
      },
      scene: {
        prompt: "Think of the last new thing you really wanted to start: a project, a club, a side hustle, a move. How did you start?",
        mask: "looks like a story about a new thing; measures ramp-up style", feel: "hope",
        options: [
          { t: "Dipped a toe in while keeping everything else the same.", level: -2 },
          { t: "Started small, then went bigger once it worked.", level: -1 },
          { t: "Jumped in and figured it out as I went.", level: 2, also: ["tempo:starter"] },
          { t: "Still planning it, honestly.", level: null, also: ["tempo:watcher"] },
        ],
      },
    },
    {
      id: "success_meaning", domain: "work", sally: ["Q20", "Q45"],
      A: "Something to point at", B: "A life that feels right",
      never: "ambition, laziness or success",
      stance: {
        prompt: "Five years from now, you'd rather hear…",
        a: "\"You built something people know about.\"",
        b: "\"Your life looks exactly how you wanted.\"",
        mask: "looks like a daydream; measures what success means to their", feel: "hope",
      },
      scene: {
        prompt: "Think of the last time you were offered more responsibility: a lead role, an extra project, captain, organizer. What did you do?",
        mask: "looks like a work or school story; measures ambition versus pace in practice", feel: "pride",
        options: [
          { t: "Took it before they finished asking.", level: -2 },
          { t: "Took it, and negotiated what came off my plate.", level: -1, also: ["need_voice:asker"] },
          { t: "Asked for time, then said no.", level: 1 },
          { t: "Said no right away. I like my life at this size.", level: 2 },
        ],
      },
    },
    {
      id: "stay_late", domain: "work", sally: ["Q18"],
      A: "Cover for the team", B: "Protect my evening",
      never: "work ethic",
      stance: {
        prompt: "Your part is done. Someone asks you to stay late for something that could wait until tomorrow.",
        a: "Stay. Covering for each other matters.",
        b: "Say I have plans and offer to help tomorrow.",
        mask: "looks like work etiquette; measures their default boundary", feel: "guilt",
      },
    },
    // ---------- Online life ----------
    {
      id: "ai_apology", domain: "online", sally: ["Q43"],
      A: "Meaning counts", B: "Own words count",
      never: "honesty",
      stance: {
        prompt: "Someone uses AI to help word an apology to you. They meant every bit of it and followed through.",
        a: "Still sincere. What matters is meaning it and changing.",
        b: "For something important, I want their own words.",
        mask: "looks like a tech take; measures what makes words sincere to their", feel: "curiosity",
      },
    },
    {
      id: "ai_companion", domain: "online", sally: ["Q44", "T49"],
      A: "Can be real comfort", B: "Useful, not intimate",
      never: "loneliness",
      stance: {
        prompt: "An AI companion makes someone feel understood, and they still have real friends and a life.",
        a: "That comfort can be real, even if it isn't a person.",
        b: "Useful, sure. But not part of anyone's intimate life.",
        mask: "looks like a tech take; measures where they place closeness", feel: "curiosity",
      },
    },
    {
      id: "posting_person", domain: "online", sally: ["T02"],
      A: "Post them", B: "Keep it offline",
      never: "how serious the relationship is",
      stance: {
        prompt: "You're happy with someone new (a partner, or a new best friend). Posting them is…",
        a: "Obvious. I'm proud of them.",
        b: "Not my thing. My feed isn't where that lives.",
        mask: "looks like social media etiquette; measures private versus public signal", feel: "delight",
      },
    },
    // ---------- Me and my future ----------
    {
      id: "explore_or_root", domain: "me", sally: ["Q46"],
      A: "Go see", B: "Deepen where I am",
      never: "courage or fear",
      stance: {
        prompt: "You could live somewhere new for a year. Your current life is good and the risks are manageable.",
        a: "Go. The unknown is the point.",
        b: "Stay and go deeper with what I have.",
        mask: "looks like a daydream; measures appetite for the unfamiliar", feel: "hope",
      },
      scene: {
        prompt: "Think of the last time you could try something unfamiliar that took real effort: a trip, a class, a new group. What happened?",
        mask: "looks like a story; measures exploration in practice", feel: "hope",
        options: [
          { t: "Went for it, no research.", level: -2, also: ["novelty:side_quester"] },
          { t: "Went for it after a lot of research.", level: -1 },
          { t: "Thought about it, then stuck with what I know.", level: 1 },
          { t: "Passed. I like my usual.", level: 2, also: ["novelty:usual_order"] },
        ],
      },
    },
    {
      id: "life_timeline", domain: "me", sally: ["Q48", "T17"],
      A: "Lock in a direction", B: "My own pace",
      never: "anxiety or maturity",
      stance: {
        prompt: "People your age are starting to lock things in: careers, partners, cities.",
        teenPrompt: "People your age are starting to lock things in: majors, paths, friend groups.",
        a: "I'd like a few long-term directions set. Milestones calm me down.",
        b: "I'd rather keep exploring. Their timeline isn't mine.",
        mask: "looks like a life-stage take; measures the pull of the peer timeline", feel: "envy",
      },
    },
    {
      id: "self_or_others", domain: "me", sally: ["Q47"],
      A: "Invest in me", B: "Invest in others",
      never: "selfishness or selflessness",
      stance: {
        prompt: "Free time for one big thing: your own hobby and growth, or a volunteer project that helps people.",
        a: "My own thing, first.",
        b: "The project that helps people.",
        mask: "looks like a time choice; measures where their discretionary energy goes", feel: "recognition",
      },
    },
    {
      id: "looking_put_together", domain: "me", sally: ["Q29", "T25"],
      A: "Worth the time", B: "Keep it simple",
      never: "vanity or self-worth",
      stance: {
        prompt: "Your look-good routine takes an hour a day. It makes you happy; nobody requires it.",
        a: "Worth it. Looking good feels good.",
        b: "I'd simplify and spend the hour on something else.",
        mask: "looks like a beauty debate; measures what they spend time on for herself", feel: "recognition",
      },
    },
  ];

  // Held-out checks: answered after the profile is frozen. Never profile evidence.
  const SEALED = [
    { id: "H01", dim: "support_capacity", prompt: "Your group chat asks who can help someone move on Saturday, your only free day. First reply?",
      options: [ { t: "\"I'm in.\"", level: -2 }, { t: "\"I can do the morning.\"", level: -1 }, { t: "\"I can lend my car instead.\"", level: 1 }, { t: "\"Can't this time, good luck!\"", level: 2 } ] },
    { id: "H02", dim: "fairness_rule", prompt: "A group trip house costs $1,200. One person's room is much bigger than the rest. What do you propose?",
      options: [ { t: "Split it evenly. Simple.", level: -2 }, { t: "Even, and whoever gets the big room buys dinner.", level: -1 }, { t: "The big room pays a bit more.", level: 1 }, { t: "Price each room by size.", level: 2 } ] },
    { id: "H03", dim: "closeness_style", prompt: "Your closest person suggests spending all of Sunday together. You'd planned a solo day.",
      options: [ { t: "Move the solo plan. Sunday's theirs.", level: -2 }, { t: "Half the day together, half mine.", level: -1 }, { t: "Keep my plan, offer the evening.", level: 1 }, { t: "Keep my plan. Another Sunday.", level: 2 } ] },
    { id: "H04", dim: "time_horizon", prompt: "A favorite artist announces a surprise show this week. Tickets are $180. Your budget is fine but not loose.",
      options: [ { t: "Bought before finishing the announcement.", level: -2 }, { t: "Bought after checking my budget twice.", level: -1 }, { t: "Waiting for resale prices.", level: 1 }, { t: "Passing. Next tour.", level: 2 } ] },
    { id: "H05", dim: "feedback_style", prompt: "A friend shows you a haircut they got an hour ago. It isn't great.",
      options: [ { t: "\"Honestly? Not your best. Here's a fix.\"", level: -2 }, { t: "\"The color's great, the cut needs a week.\"", level: -1 }, { t: "\"It'll grow on me!\"", level: 1 }, { t: "\"Obsessed.\"", level: 2 } ] },
    { id: "H06", dim: "success_meaning", prompt: "You're offered the lead on a group project: more credit, more work, and it overlaps with a trip.",
      options: [ { t: "Take the lead. The trip can move.", level: -2 }, { t: "Take it and shrink the trip.", level: -1 }, { t: "Take a smaller role.", level: 1 }, { t: "Pass. Going on the trip.", level: 2 } ] },
    { id: "H07", dim: "friend_did_harm", prompt: "A friend brags about ghosting someone who was really kind to them.",
      options: [ { t: "Laugh along, bring it up gently later.", level: -2 }, { t: "Change the subject.", level: -1 }, { t: "\"That's kind of harsh, no?\"", level: 1 }, { t: "\"Not cool. You should message them.\"", level: 2 } ] },
    { id: "H08", dim: "explore_or_root", prompt: "You get a free weekend and a free train ticket anywhere you've never been.",
      options: [ { t: "Pick a random city and go.", level: -2 }, { t: "Go, after a night of planning.", level: -1 }, { t: "Save it for somewhere familiar.", level: 1 }, { t: "Give the ticket away and enjoy home.", level: 2 } ] },
  ];

  const BANK = { version: "genii-tag-pilot-v1", DOMAINS, DIMENSIONS, SEALED };
  root.GENII_PILOT_BANK = BANK;
  if (typeof module !== "undefined" && module.exports) module.exports = BANK;
})(typeof window !== "undefined" ? window : globalThis);
