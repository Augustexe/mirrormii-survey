// Demo reading for the three result-page wireframes (2026-09-28).
// Every line below is a real library line or a real answer option from persona quiz V2
// (research/persona-quiz-v2/final), produced by a synthetic adult run. Only the type name is new:
// it uses the proposed "The [life word] [relationship noun]" rule from index.html.
window.DEMO = {
  name: "The Unhurried Golden Retriever",
  oldName: "Open-Book Golden Retriever × Slow-and-Steady Regular",
  nameParts: { life: "Unhurried", rel: "Golden Retriever" },
  answered: 69,
  friendName: "Maya",
  halves: [
    {
      side: "With your people", word: "Golden Retriever",
      desc: "You love out loud: warm, gentle, all in, and mostly by your own rulebook.",
      axes: [
        { id: "R1", left: "Me", right: "We", pos: 0.646, pole: "We", line: "Your people are your happy place. Close means shared." },
        { id: "R2", left: "Soft", right: "Direct", pos: 1.0, pole: "Soft", line: "You hold the person first. The hard part can wait for a gentler moment." },
        { id: "R3", left: "Own", right: "Classic", pos: 0.207, pole: "Own", line: "You write your own script for love, home and holidays." },
      ],
    },
    {
      side: "How you run your days", word: "Unhurried",
      desc: "Your days run on routine and order, and you're in no rush to prove anything to anyone.",
      axes: [
        { id: "L1", left: "Venture", right: "Steady", pos: 0.912, pole: "Steady", line: "Security first. Your leaps come with a safety net." },
        { id: "L2", left: "Easy", right: "Push", pos: 0.316, pole: "Easy", line: "You run on your own clock. Other people's timelines are optional." },
        { id: "L3", left: "Context", right: "Rules", pos: 0.761, pole: "Rules", line: "A fair process keeps everyone safe. A rule is a rule." },
      ],
    },
  ],
  stings: [
    "You'll break any rule for your people, except the one where you tell them what hurt.",
    "Your life is so steady that some nights you wonder if it's too steady.",
  ],
  hearts: [
    "I'd rather love too much than too carefully.",
    "I chose my ordinary days. I didn't settle for them.",
  ],
  tags: [
    { name: "Yes first, bank app later", strength: "strong", chapter: "Friends",
      heart: "Breaking my own rules for my people? No regrets.",
      sting: "One ask from a friend and your budget rules vanish. They only ever apply to you.",
      told: [
        { said: "Went, paid, and ate instant noodles for a week.", grade: "did", ch: "Friends" },
        { said: "Said 'ten minutes.' Left three hours later.", grade: "did", ch: "Work, school and ambition" },
        { said: "Sit straight up and call. Sleep is canceled.", grade: "would", ch: "Friends" },
      ] },
    { name: "Actually read the rulebook", strength: "strong", chapter: "Play, rules and you",
      heart: "Fair isn't cold to me. It's safe.",
      sting: "You trust the process, because you don't trust people to wing it.",
      told: [
        { said: "Asked whoever's in charge, then went with their answer.", grade: "did", ch: "Play, rules and you" },
        { said: "Pull up the official rules. Read them out loud.", grade: "would", ch: "Play, rules and you" },
        { said: "Wait. Rule's a rule, even for cold dumplings.", grade: "believe", ch: "Family and home" },
      ] },
    { name: "Head over heels, eyes open", strength: "strong", chapter: "Love and your person",
      heart: "I love all the way, and I know where the door is.",
      sting: "You say you're independent. You still want to be in every part of their day.",
      told: [
        { said: "Stuck together all night. Basically one person with two phones.", grade: "did", ch: "Love and your person" },
        { said: "Envy. Someone else got the good version of them.", grade: "would", ch: "Love and your person" },
        { said: "If they're free, I'm suddenly free too.", grade: "believe", ch: "Love and your person" },
      ] },
    { name: "Future parent, with terms", strength: "showing", chapter: "Love and your person",
      heart: "I want it, and I want to be held up while I do it.",
      sting: "You want kids. You've also already worked out who'll give up the most, and it's you.",
      told: [
        { said: "Turn it down. The mood board stays on schedule.", grade: "would", ch: "Love and your person" },
        { said: "I already have names picked out.", grade: "believe", ch: "Love and your person" },
        { said: "I want one. My parents would be unbearable grandparents.", grade: "believe", ch: "Love and your person" },
      ] },
    { name: "Rainy-day fund devotee", strength: "showing", chapter: "Money and treats",
      heart: "Being ready is how I relax.",
      sting: "You've saved for a rainy day so long, you forgot sunny days are allowed.",
      told: [
        { said: "Straight into savings. Future me says thanks.", grade: "would", ch: "Money and treats" },
        { said: "Grow it with what it earns. Savings stay put.", grade: "would", ch: "Work, school and ambition" },
        { said: "I have a savings goal with a name.", grade: "believe", ch: "Money and treats" },
      ] },
  ],
  calls: [
    "You've given up your charger, your seat or your last slice this week.",
    "You've actually read the terms and conditions on something.",
    "Your person's name is the first one your phone suggests.",
  ],
  twist: {
    say: "Soon. Vows out loud, and Grandma crying in row one.",
    did: "'Do we need a label? I like what this is.'",
  },
  guesses: {
    exact: 7, of: 8,
    rows: [
      { topic: "The cilantro plate", guess: "\"Perfect, thanks!\" Then pick out every leaf for twenty minutes.", hit: true },
      { topic: "The limited banner", guess: "Skip it. That $30 already has a job.", hit: true },
      { topic: "The family holiday", guess: "Yes! Karaoke room, takeout, everyone in pajamas.", hit: true },
      { topic: "The delayed flight", guess: "Neck pillow on. Asleep at the gate.", hit: true },
      { topic: "Slides or video", guess: "Make the 10 slides. Done by Tuesday, font size 32.", hit: true },
      { topic: "Your person's three-month program", guess: "Ask if there's anything like it closer to home.", hit: false, answer: "Already set up a nightly FaceTime. Same time, every night." },
      { topic: "The couch at 8am", guess: "Show up, complain the whole way, take the heavy end.", hit: true },
      { topic: "Your coffee spot closes", guess: "Go to the closest one and order the exact same thing.", hit: true },
    ],
  },
  chapters: ["Your phone", "Friends", "Love and your person", "Money and treats", "Work, school and ambition", "Family and home", "Play, rules and you"],
  // App bridge copy is a DRAFT for Jerry: it only describes what the app does today (cozy game, Genii, Miia as the digital twin).
  app: {
    head: "Genii has only met you on paper.",
    body: "In MirrorMii, Genii keeps learning you from your real days, and Miia, your digital twin, lives them. Snap it, and Miia lives it.",
    button: "Get MirrorMii",
  },
  invite: "Do you really know me?",
};
