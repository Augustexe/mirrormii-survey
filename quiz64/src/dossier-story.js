/**
 * Editorial layer for the evidence dossier.
 *
 * This module reads a frozen result and writes prose around the receipts that
 * already exist. It never scores, re-projects, or invents evidence. Every
 * paragraph that makes a claim is attached to the source IDs used to write it.
 */

const AXIS_ORDER = [
  "activation_tempo",
  "social_signal_style",
  "friction_posture",
  "structure_reliance",
  "novelty_aperture",
];

const AXIS_EDITORIAL = {
  activation_tempo: {
    title: "The first move",
    kicker: "Momentum has a tell",
    right: "You seem to find the entrance by trying the door. In these scenes, a small first move gets you further than waiting for the whole situation to explain itself: something to test, a draft to react to, a question that finally leaves your head.",
    left: "You give a situation a moment to show its hand. In these scenes, you would rather gather a little context before your first move than commit just because everybody else has started making noise. The pause is part of the move.",
    bridge: "This is about how you began in the situations represented here, not energy, confidence, or a fixed personality type.",
  },
  social_signal_style: {
    title: "How your signal travels",
    kicker: "Public room, private channel",
    right: "You tend to give the room something it can actually read. A visible response, a named issue, a clear piece of coordination: in these scenes, the signal leaves your head and becomes available to other people. Nobody has to hire a detective to find the message.",
    left: "Your signal often takes the quieter route. In these scenes, the one-to-one message or private moment gets the job before the public announcement does. A smaller audience can still get a very clear message; it simply does not come with a press release.",
    bridge: "This describes how support or friction travelled in selected scenes, not sociability, attachment, or social skill.",
  },
  friction_posture: {
    title: "When the room gets awkward",
    kicker: "The repair protocol",
    right: "When something feels off in these scenes, you lean toward giving it a name and a next step. That might be a repair, a boundary, or a direct question. The awkward thing is already in the room; your move is to stop making everyone walk around it.",
    left: "You often turn the temperature down before giving the issue a microphone. In these scenes, adjusting, waiting, or letting something pass comes before a direct confrontation. The interesting question is what makes an issue worth bringing back into the room.",
    bridge: "This stays with selected responses to friction, not a verdict about kindness, aggression, or moral worth.",
  },
  structure_reliance: {
    title: "The shape of a plan",
    kicker: "Improvisation meets the spreadsheet",
    right: "A few clear coordinates seem to make the next move easier for you. Across these scenes, a sequence, some criteria, or a couple of anchors help turn a shapeless situation into something you can work with. The plan does not need a forty-page appendix; it does need a job.",
    left: "You seem comfortable letting the plan grow legs while you are using it. Across these scenes, starting and adapting can come before working out the whole sequence. The first version is allowed to be useful without pretending it has already met every possible future problem.",
    bridge: "This is about how structure was used in the situations captured here, not discipline, competence, or executive function.",
  },
  novelty_aperture: {
    title: "Where the side quest starts",
    kicker: "Familiar route, unfamiliar door",
    right: "The unfamiliar gets a chance with you when there is a sensible way in. A small experiment, a new room, a reversible try: these scenes suggest curiosity is quite capable of making an appointment. The side quest still has to fit through the door.",
    left: "The familiar option has earned some credit with you. In these scenes, reliable, simpler, or already-liked choices can beat the appeal of something new. A novelty sticker alone does not get to evict a perfectly good favorite.",
    bridge: "This describes selected choices around novelty, not intelligence, creativity, culture, or a formal openness score.",
  },
};

const AXIS_DIRECTION_ALTERNATES = {
  activation_tempo: {
    right: {
      gentle: "You often make the first move small enough to be kind to yourself: one question, one draft, one door opened before the whole hallway is mapped.",
      playful: "You do not wait for the fog to publish a user manual. You poke the situation once and see what it does back.",
      sharp: "You reduce ambiguity by moving. Not recklessly; just enough to produce information the situation was withholding.",
    },
    left: {
      gentle: "You let uncertainty settle before spending effort. Watching first is not absence of movement; it is how you choose the ground.",
      playful: "You give the situation a chance to reveal the missing page before volunteering to write the entire sequel.",
      sharp: "You do not confuse speed with progress. The pause is a deliberate request for better information.",
    },
  },
  social_signal_style: {
    right: {
      gentle: "When something matters, you make the message findable. People in the room can tell where you stand without having to decode a weather system.",
      playful: "Your support prefers a visible entrance: applause in the chat, a named issue, a small public flag planted before the moment expires.",
      sharp: "You put the signal where the relevant people can use it. Clear communication beats hoping everyone inferred the same subtext.",
    },
    left: {
      gentle: "You often protect the nuance by choosing a smaller audience. A private message gives the conversation room to be more exact.",
      playful: "You do not need a stadium for every feeling. Sometimes the real broadcast is one well-aimed message after the room has moved on.",
      sharp: "You route the message privately when the public channel would flatten it. Quiet is a channel, not a lack of signal.",
    },
  },
  friction_posture: {
    right: {
      gentle: "You give an awkward moment a handle: a check-in, a boundary, an apology, or one honest sentence that lets everyone stop guessing.",
      playful: "When the room starts producing weather, you are willing to name the forecast and ask what should happen next.",
      sharp: "You address the mismatch while it is still actionable. Directness here is a tool, not a moral performance.",
    },
    left: {
      gentle: "You first look for a way to lower the temperature or keep the day moving. Sometimes that is care; sometimes it is simply the least costly next step.",
      playful: "You do not give every awkward moment a microphone. Some get a quiet adjustment and a chance to prove they deserve a sequel.",
      sharp: "You absorb or defer before escalating. That can preserve a workable scene, though it can also leave the issue waiting in the wings.",
    },
  },
  structure_reliance: {
    right: {
      gentle: "A few coordinates help you offer your attention to the actual task. The plan is there to make room, not to win an award for detail.",
      playful: "You like a little scaffolding before the project starts free-climbing the building. A short sequence can save future-you a dramatic rescue.",
      sharp: "You create enough order to make the next action obvious. The structure is a tool, not evidence of virtue.",
    },
    left: {
      gentle: "You trust a useful beginning to teach you what the plan needs next. Flexibility is doing practical work here.",
      playful: "You let the plan grow in public instead of making it audition for a perfect first draft.",
      sharp: "You start with what is knowable and revise from there. A complete sequence is optional until the situation earns one.",
    },
  },
  novelty_aperture: {
    right: {
      gentle: "You can make room for the unfamiliar when the invitation is manageable. Curiosity gets a trial, not a blank cheque.",
      playful: "You will open the side quest if it has an undo button, a sensible entrance, or at least a snack-sized commitment.",
      sharp: "You test novelty when the downside is bounded. Exploration here is selective, not a claim that every new thing deserves access.",
    },
    left: {
      gentle: "You give trusted options their due. Familiarity can be a thoughtful choice when the new option has not made a strong case.",
      playful: "The known route has references. A novelty sticker alone is not getting past the bouncer.",
      sharp: "You conserve attention for changes that matter. The familiar option remains available until the alternative earns a reason.",
    },
  },
};

const OPENING_VARIANTS = {
  gentle: [
    "The little decisions are easy to overlook while you are making them. Put a few together, though, and a more interesting version of the story begins to appear.",
    "No single answer has to explain you. The useful part is the way several ordinary moments begin to rhyme without becoming the same story.",
  ],
  playful: [
    "You came in with a collection of ordinary decisions. Somehow there is now a character, a subplot, and a small pile of receipts. Let’s see which parts feel embarrassingly familiar.",
    "A few harmless choices have gathered in the hallway and started comparing notes. The result is specific enough to be fun and still polite enough to be wrong sometimes.",
  ],
  sharp: [
    "The small decisions have formed a committee and would like to make a statement. Here is the character they nominated, pending your right of reply.",
    "The answers point in a direction, but they do not get to write your biography. This is the useful version: specific scenes, limited reach, room for rebuttal.",
  ],
};

const ITEM_FRAMING = {
  "GQB2-E01": "A free, low-stakes activity put novelty on the table with an easy exit.",
  "GQB2-E02": "A recent low-stakes plan reached the moment when intention had to become attendance.",
  "GQB2-E03": "A small unplanned purchase created a tiny decision with a receipt attached.",
  "GQB2-E04": "An ordinary plan changed shape, which is where a plan's philosophy becomes visible.",
  "GQB2-E05": "An invitation with very few familiar faces turned the front door into the first question.",
  "GQB2-E06": "A small decision had no emergency attached, so the chosen decision aid tells us more than the object itself.",
  "GQB2-W01": "A work or study brief arrived with enough fog to make the first move meaningful.",
  "GQB2-W02": "A visible mistake put the response in front of an audience before the story was polished.",
  "GQB2-W03": "Useful criticism arrived with enough substance to require a response, not just a nod.",
  "GQB2-W04": "A shared effort made the credit line blurry, and the answer records what happened next.",
  "GQB2-W05": "A plan with moving parts became a direct question about how much structure feels useful.",
  "GQB2-W06": "An opportunity with upside and no user manual was kept safely in the hypothetical room.",
  "GQB2-W07": "A work or study plan changed after it had already started, which is a different test from planning it once.",
  "GQB2-W08": "A help request arrived while capacity was already low, making the size of the answer part of the evidence.",
  "GQB2-W09": "A separate work or study task reached its actual first step, with no need to borrow evidence from the earlier brief.",
  "GQB2-S01": "A meaningful reply took longer than hoped, leaving a small social gap to navigate.",
  "GQB2-S02": "A plan or conversation moved on without the respondent, and the first feeling was named directly.",
  "GQB2-S03": "A joke landed badly in a public room, making the first repair move visible.",
  "GQB2-S04": "A newer group made adaptation itself the subject, without requiring a grand theory of belonging.",
  "GQB2-S05": "Good news arrived inside a busy group chat, where public and private support can diverge.",
  "GQB2-S06": "A dinner decision ran long enough to become a miniature parliament.",
  "GQB2-S07": "An idea received applause under someone else's name in a clearly hypothetical scene.",
  "GQB2-S08": "A social moment stayed active in memory, and the selected reset shows what helps before interpretation.",
  "GQB2-S09": "A separate group plan was actually arranged, giving structure a concrete social job.",
  "GQB2-R01": "A direct preference described what attention should communicate this week.",
  "GQB2-R02": "Interest in another person was recorded as a response choice, without turning it into a prediction about what happens next.",
  "GQB2-R03": "A wanted thing had to travel through a request, a hint, self-handling, or deliberate silence.",
  "GQB2-R04": "A moment that landed badly was followed by a repair choice or an honest absence of one.",
  "GQB2-R05": "An offer of practical help made receiving, declining, or reshaping support explicit.",
  "GQB2-R06": "A stated preference named the request most likely to remain unsent, and nothing more is inferred from it.",
  "GQB2-M01": "A consequence-free draft was explicitly a thought experiment, not a report of action.",
  "GQB2-M03": "A familiar favorite sat beside an unfamiliar option in a projective prompt, with no claim that the choice predicts behavior.",
  "GQB2-M04": "A direct wish about being understood is kept in the literal-report lane.",
};

const CASE_TITLES = {
  "GQB2-E01": "An audition for the side quest",
  "GQB2-E02": "The leaving-hour negotiation",
  "GQB2-E03": "A very small shopping scandal",
  "GQB2-E04": "The plan gets a rewrite",
  "GQB2-E05": "Almost nobody at the door",
  "GQB2-E06": "The tiny decision committee",
  "GQB2-W01": "The brief arrives wearing fog",
  "GQB2-W02": "The mistake is already in public",
  "GQB2-W03": "Useful criticism enters the room",
  "GQB2-W04": "The credits have gone missing",
  "GQB2-W05": "How much spreadsheet is enough?",
  "GQB2-W06": "The opportunity has no manual",
  "GQB2-W07": "The plan changes mid-flight",
  "GQB2-W08": "The low-battery help request",
  "GQB2-W09": "The first small step",
  "GQB2-S01": "The reply that took its time",
  "GQB2-S02": "The conversation moved on",
  "GQB2-S03": "The joke lands sideways",
  "GQB2-S04": "The newer-room adjustment",
  "GQB2-S05": "The group chat has entered evidence",
  "GQB2-S06": "Dinner becomes a parliament",
  "GQB2-S07": "The applause wears the wrong name tag",
  "GQB2-S08": "The social replay button",
  "GQB2-S09": "The group plan gets a skeleton",
  "GQB2-R01": "What attention should say",
  "GQB2-R02": "Interest, carefully filed",
  "GQB2-R03": "The request that almost left the drafts",
  "GQB2-R04": "The repair after the landing",
  "GQB2-R05": "Letting practical help in",
  "GQB2-R06": "The request still in drafts",
  "GQB2-M01": "The consequence-free message",
  "GQB2-M03": "The reliable favorite versus the new thing",
  "GQB2-M04": "The thing you wish people knew",
};

const CASE_READINGS = {
  "GQB2-E01": "A free activity with an easy exit is a particularly sneaky invitation: almost nothing is being demanded, which leaves the choice itself in the spotlight. Trying, watching, keeping your plan, and passing are four very different ways to spend the same available afternoon.",
  "GQB2-E02": "There is a small negotiation that happens between making a plan and actually leaving the house. Earlier-you made a commitment; current-you now has to decide what to do with it. This scene catches the moment the calendar stops being theoretical.",
  "GQB2-E03": "A small unplanned purchase can create a surprisingly elaborate private hearing. The object exists. The payment happened. Now comes the part where it either earns its place or becomes a lesson with packaging. The size of the purchase does not dictate the size of the internal commentary.",
  "GQB2-E04": "A changed plan did not erase the whole day. Your answer shows what you reached for when the original version stopped being available.",
  "GQB2-E05": "Almost nobody familiar can make an invitation feel like an audition. Your answer gives that uncertainty a specific next move instead of pretending the room was neutral.",
  "GQB2-E06": "Even a tiny decision gets a preferred instrument: criteria, a test, one trusted voice, or instinct with a quick check. The object is small; the method is the character detail.",
  "GQB2-W01": "A vague brief has a special talent for making every possible first step feel slightly premature. Do you make something, ask something, inspect what already exists, or prepare a sequence? This is the moment before the work acquires enough shape to talk back.",
  "GQB2-W02": "A visible mistake arrives with an audience you did not book. There is the error itself, and then there is the next thing you do while other people know about it. This scene is interested in that next move, before hindsight gets to write a much smoother version.",
  "GQB2-W03": "Useful criticism can still arrive with an unpleasant little sting. The interesting part is the response you gave it: making the feedback concrete, using it later, explaining your intention, or taking it in without much outward response. The moment contains more than one possible conversation.",
  "GQB2-W04": "Credit went blurry in a shared effort. Your answer records whether that blur deserved a correction, a private note, or a quiet pass in that moment.",
  "GQB2-W05": "This is the part where the plan gets to have a personality without becoming a personality test. You named how much scaffolding helps before the work starts asking for more.",
  "GQB2-W06": "The upside was real and the instructions were not. A reversible trial, criteria, an experienced guide, or the familiar route each gives uncertainty a different price tag.",
  "GQB2-W07": "A plan that changes after launch is a different animal from a plan made at the desk. Your answer tells us how you meet the rewrite once the first version already has momentum.",
  "GQB2-W08": "Someone asked for help while your capacity was already flashing low. The answer is useful because it shows the size of the yes, the no, or the delay—not an imaginary moral score for helping.",
  "GQB2-W09": "This was a separate task, so it earns its own little file. The first step matters here because beginning is often where an otherwise perfect plan starts charging rent.",
  "GQB2-S01": "A slow reply can turn a quiet phone into a very active prop. Your answer shows whether the next move was a direct check, a low-pressure nudge, an unsent draft, or room to breathe.",
  "GQB2-S02": "When the plan moved on, the first feeling got a name—or stayed uncaptioned. That is a small but honest piece of social weather.",
  "GQB2-S03": "A joke can leave the speaker and arrive somewhere else. Your selected repair move says how quickly you wanted to meet the landing rather than litigate the intention.",
  "GQB2-S04": "A newer group asks for small edits before it asks for a grand entrance. Your answer names the first thing you tune, if anything, while the room is still learning you.",
  "GQB2-S05": "The group chat got its public moment, and your answer decided whether support should stay there or move to a quieter channel. Confetti has logistics.",
  "GQB2-S06": "Forty minutes of dinner selection is enough time for a menu to become a constitution. Your answer shows whether you end the session, narrow the choices, ask for priorities, or let the parliament continue.",
  "GQB2-S07": "The applause has the wrong name tag. The response is a hypothetical rehearsal for credit, so it can be playful while still showing which kind of correction feels available.",
  "GQB2-S08": "A social moment can keep replaying after everyone else has gone home. Your answer names the reset that helps you decide whether the scene needs interpretation at all.",
  "GQB2-S09": "This is a separate group plan with an actual job to do. You gave it a sequence, a few anchors, an opening move, or a shared priority—the skeleton the gathering could borrow.",
  "GQB2-R01": "This is a direct wish about what attention should communicate. It is closer to an instruction manual for being with you than a claim about what you are.",
  "GQB2-R02": "Interest can stay a private subplot, become a conversation, or turn into a clear invitation. The answer records the chosen speed without pretending it predicts the ending.",
  "GQB2-R03": "Wanting something and asking for it are adjacent rooms. Your answer shows which door you tend to open first when the other person's opinion matters.",
  "GQB2-R04": "When something lands badly, intention is not the only object in the room. Your answer records whether you repaired, explained, made space, or met the moment without a clear next move.",
  "GQB2-R05": "Practical help is easiest to understand when the offer has a shape. You selected whether to accept, clarify, decline, or ask for a different kind of support.",
  "GQB2-R06": "This is a request you named directly as difficult to send. The useful detail is the request itself; the file does not turn an unsent sentence into a hidden relationship verdict.",
  "GQB2-M01": "The message had no social consequences by design. That makes it a safe little window into a fantasy of expression, not evidence that anyone was confronted, reassured, desired, or betrayed.",
  "GQB2-M03": "The reliable favorite and the unfamiliar option are both imaginary here. Your first pull can be entertaining information without being mistaken for a forecast of your next meal, weekend, or life.",
  "GQB2-M04": "The wish is about being understood without a full director's commentary. It stays exactly that: a direct wish, not a diagnosis hiding in a nice sentence.",
};

const OPTION_RIFFS = {
  "GQB2-E01": { try: "You gave the unfamiliar activity a real try, with an exit still visible.", sample: "You watched long enough to gather a little data before deciding whether to join.", known: "You kept the familiar route close; reliability got the first invitation.", pass: "You passed on the new activity and kept the day free of an extra subplot." },
  "GQB2-E02": { went: "You followed through on the plan.", brief: "You made an appearance, with the visit kept deliberately short.", delayed: "You left the decision open until it resolved itself or time resolved it for you.", stayed: "You stayed home; the plan lost the final vote." },
  "GQB2-E03": { keep: "You kept the unplanned purchase.", return: "You returned the unplanned purchase before it became a larger story.", pause: "You kept the receipt and left the decision open.", gift: "You changed the purchase's destination and made it a gift." },
  "GQB2-E04": { pivot: "You adapted to the changed plan without rebuilding the whole machine.", details: "You asked for the new coordinates before committing to the revised plan.", rebuild: "You rebuilt the structure around the new version.", exit: "You stopped participating when the original plan was no longer the offer." },
  "GQB2-E05": { go: "You attended without requiring a full reconnaissance report first.", ally: "You attended with one familiar person as a human handrail.", research: "You researched the people and exits before deciding.", decline: "You declined an invitation whose uncertainty cost more than it offered." },
  "GQB2-E06": { criteria: "You reach for explicit criteria when a small choice needs a clean frame.", try: "You let a quick test give the decision something real to respond to.", ask: "You borrow one trusted perspective, then keep the final call.", feel: "You start with instinct and give it a short review before signing." },
  "GQB2-W01": { prototype: "You made a rough version so the ambiguity had something concrete to argue with.", questions: "You turned the fog into questions and asked for coordinates.", model: "You found an example and worked backward from it.", wait: "You waited for the instructions to become clear before committing effort." },
  "GQB2-W02": { own: "You named the mistake and put a next step beside it.", fix: "You tried to repair the visible problem before making a public announcement.", explain: "You led with the context around the mistake.", quiet: "You paused and collected yourself before speaking." },
  "GQB2-W03": { ask: "You asked for meaning or an example before deciding what to do with the criticism.", explain: "You gave your context first, then considered the other person's point.", pause: "You took time before responding.", use: "You looked for one usable part and kept moving." },
  "GQB2-W04": { let_pass: "You let the unclear credit pass in that moment.", casual: "You restored your contribution casually while the work was still in view.", private: "You raised the credit question privately.", visible: "You clarified your contribution where the work could be seen." },
  "GQB2-W05": { start: "You prefer to begin and let the next need reveal itself.", anchors: "You prefer a few anchors with room around them.", sequence: "You prefer a short ordered sequence before the moving parts get loud.", depends: "You make planning conditional on the resources and people in the scene." },
  "GQB2-W06": { trial: "You would enter through a small reversible trial.", criteria: "You would give the opportunity criteria and a deadline before deciding.", reference: "You would ask someone experienced to show you the terrain.", known: "You would choose the familiar alternative and let this mystery wait." },
  "GQB2-W07": { adapt: "You changed the next step and kept the plan moving.", rebuild: "You rebuilt the sequence before continuing.", ask: "You clarified what had changed before touching the plan.", pause: "You paused until the revised version stopped moving." },
  "GQB2-W08": { no: "You said you could not take the request on.", smaller: "You offered the smaller amount of help you could genuinely manage.", yes: "You agreed without naming the low capacity behind the answer.", delay: "You delayed answering until the circumstances made the decision." },
  "GQB2-W09": { start: "You began with a concrete first step.", clarify: "You asked one focused question and then began.", schedule: "You put a start time on the calendar and waited for it.", wait: "You waited for clearer direction before starting." },
  "GQB2-S01": { ask: "You asked whether everything was okay.", followup: "You sent a second, low-pressure message.", draft: "You wrote the follow-up and kept it in drafts.", wait: "You gave the other person room and continued with your day." },
  "GQB2-S02": { sting: "The first feeling was hurt.", curiosity: "The first feeling was curiosity about what you had missed.", relief: "The first feeling was relief.", irritation: "The first feeling was irritation.", nothing: "You could not identify a clear first feeling." },
  "GQB2-S03": { name: "You acknowledged the impact and apologized in the room.", private: "You moved the check-in into a private conversation.", ask: "You asked how it landed before writing the verdict.", lighten: "You tried to lower the tension first and watched what remained.", pause: "You paused without addressing it in the room." },
  "GQB2-S04": { pace: "You adjust how quickly you speak.", humor: "You adjust your humor as the room gives you information.", opinions: "You adjust how directly you state your opinions.", nothing: "You change very little and let the fit become clear.", useful: "You try to be useful before sharing more of yourself." },
  "GQB2-S05": { public: "You celebrated in the group chat while the moment was public.", private: "You moved the fuller response into a private message.", react: "You gave a quick visible signal and planned a fuller follow-up.", call: "You moved the support out of the chat and into a one-to-one call." },
  "GQB2-S06": { book: "You would book somewhere and end the parliament.", vote: "You would reduce the menu to two acceptable options and call a vote.", criteria: "You would ask which priorities matter before choosing.", observe: "You would let the discussion continue a little longer." },
  "GQB2-S07": { public: "You would correct the credit while the applause was still warm.", joke: "You would use humor to put your name back in the credits.", private: "You would congratulate them and raise the correction privately.", later: "You would leave it for now and decide later whether to raise it." },
  "GQB2-S08": { trusted: "You reach for one trusted outside perspective.", alone: "You give yourself quiet time before interpreting the scene.", concrete: "You do something concrete before deciding what the moment meant.", facts: "You check facts or ask one simple question.", humor: "You use humor or a light reset to break the replay." },
  "GQB2-S09": { improvise: "You started and let the next need introduce itself.", anchors: "You chose a few anchors and left the rest flexible.", sequence: "You made a short order of operations.", ask: "You asked everyone for the priority that mattered most." },
  "GQB2-R01": { specific: "You want attention to notice the specific things about you.", time: "You want attention to make more time for the connection.", steady: "You want attention to communicate steadiness.", story: "You want attention to stay for the full story.", space: "You want attention to know when to give you space." },
  "GQB2-R02": { talk: "You found a small reason to keep talking.", updates: "You paid closer attention to the person's updates.", friend: "You told a friend and took no further action.", pace: "You kept your usual pace without making a move.", invite: "You made a clear invitation or flirted.", private: "You kept the interest to yourself." },
  "GQB2-R03": { plain: "You said what you wanted directly.", hint: "You hinted or waited to see if the other person noticed.", self: "You tried to handle the want yourself.", drop: "You decided not to bring it up." },
  "GQB2-R04": { repair: "You checked in and tried to repair the impact.", explain: "You explained what you meant.", space: "You gave the other person space and returned later.", unsure: "You were unsure what to do next." },
  "GQB2-R05": { accepted: "You accepted the practical help.", details: "You discussed the details and then accepted.", declined: "You declined and handled it yourself.", different: "You declined that offer and asked for another kind of support." },
  "GQB2-R06": { plan: "The request left unsent is a concrete plan.", meaning: "The request left unsent is clarity about the connection.", time: "The request left unsent is more one-on-one time.", honesty: "The request left unsent is directness about the awkward part.", light: "There is no unsent ask; keeping it light is the point." },
  "GQB2-M01": { desire: "The imaginary message expresses desire.", callout: "The imaginary message confronts the other person.", reassurance: "The imaginary message asks for reassurance.", envy: "The imaginary message admits mixed envy." },
  "GQB2-M03": { new: "The imaginary choice tries the unfamiliar option.", sample: "The imaginary choice samples the unfamiliar option first.", known: "The imaginary choice keeps the reliable favorite.", both: "The imaginary choice tries a little of each if possible." },
  "GQB2-M04": { space: "The wish is for space to be understood as distinct from caring less.", invite: "The wish is to remain included even when attendance is uncertain.", quiet: "The wish is for quieter excitement to count as real excitement.", time: "The wish is for processing time to be understood." },
};

const SECTION_LABELS = {
  everyday_life: "ordinary life",
  work_study: "work or study",
  social_theater: "a social scene",
  close_connections: "a close connection",
  secret_menu: "the secret menu",
  permission_lobby: "the setup",
  prediction_booth: "the separate check",
};

const SOURCE_LABELS = {
  retrospective_self_report: "recent event",
  hypothetical_choice: "thought experiment",
  stated_preference: "direct preference",
  context_fact: "context note",
  reported_action: "reported action",
  reported_preference: "reported preference",
};

const VOICE = {
  gentle: {
    eyebrow: "A careful read of what you gave us",
    opening: "The little decisions are easy to overlook while you are making them. Put a few together, though, and a more interesting version of the story begins to appear.",
    sparse: "The file is still light. We will leave the blank spaces blank rather than make you carry a story you did not give us.",
    closing: "Keep what feels recognizably yours, and let the rest stay a question you can answer differently next time.",
  },
  playful: {
    eyebrow: "A lovingly over-filed read of your answers",
    opening: "You came in with a collection of ordinary decisions. Somehow there is now a character, a subplot, and a small pile of receipts. Let’s see which parts feel embarrassingly familiar.",
    sparse: "The folder is still mostly tabs and one suspiciously interesting receipt. Genii will keep the dramatic music low until there is more.",
    closing: "Keep the bits that made you laugh or wince. The narrator can survive a plot twist.",
  },
  sharp: {
    eyebrow: "Your choices would like a word",
    opening: "The small decisions have formed a committee and would like to make a statement. Here is the character they nominated, pending your right of reply.",
    sparse: "The record is thin. Any confident portrait would be theatre, so this one stays short.",
    closing: "Use the read where it fits. Dispute it where it does not. A useful portrait leaves room for the next scene.",
  },
};

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

// Only authored profile answers contribute to narrative variation. Attempt IDs,
// timestamps, heldouts, and storage metadata deliberately never enter this seed.
function answerSeed(receipts) {
  const answerKey = receipts
    .filter(usableReceipt)
    .map((receipt) => `${receipt.itemId}:${(receipt.optionIds || []).join(",")}`)
    .sort()
    .join("|");
  let hash = 2166136261;
  for (const character of answerKey) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function variant(seed, key, choices) {
  if (!choices.length) return "";
  let hash = seed ^ 2166136261;
  for (const character of String(key)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return choices[(hash >>> 0) % choices.length];
}

function voiceFor(result) {
  const voice = result?.config?.voice || result?.voice || "playful";
  return VOICE[voice] ? voice : "playful";
}

function snapshotFor(result) {
  return result?.snapshot || result?.profileSnapshot || {};
}

function projectionFor(result) {
  return result?.projection || { axes: result?.axes || [] };
}

function axisList(result) {
  const projection = projectionFor(result);
  const direct = Array.isArray(projection.axes) ? projection.axes : [];
  const fallback = Array.isArray(result?.axes) ? result.axes : [];
  const byId = new Map([...fallback, ...direct].map((axis) => [axis.axisId, axis]));
  return AXIS_ORDER.map((id) => byId.get(id) || { axisId: id, supportLevel: "unknown", direction: null, coverage: "no_interpretable_answer", supportingEvidenceIds: [], counterevidenceIds: [] });
}

function sourceStatus(receipt) {
  return receipt?.missingness ? "missingness" : receipt?.sourceStatus || receipt?.plannedSourceStatus || "unknown";
}

function usableReceipt(receipt) {
  return !!receipt && !receipt.missingness && sourceStatus(receipt) !== "missingness" && receipt.phase !== "heldout";
}

function sourceUnit(receipt) {
  return receipt?.sourceUnitId || receipt?.eventInstanceId || receipt?.eventId || receipt?.evidenceId;
}

function human(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function contextLine(receipt) {
  const context = receipt?.context || receipt?.projectionContext || {};
  const parts = [
    context.setting && SECTION_LABELS[context.setting] ? SECTION_LABELS[context.setting] : context.setting,
    context.audience,
    context.stakes && `${context.stakes} stakes`,
  ].filter(Boolean).map(human);
  const timeframe = text(receipt?.timeframe);
  if (timeframe && parts.length) return `${parts.join(" · ")} · ${timeframe}`;
  return parts.join(" · ") || timeframe || "the selected situation";
}

function sourceLabel(receipt) {
  return SOURCE_LABELS[sourceStatus(receipt)] || human(sourceStatus(receipt));
}

function framing(receipt) {
  return ITEM_FRAMING[receipt?.itemId] || `A response was recorded in ${SECTION_LABELS[receipt?.sectionId] || "one of the survey scenes"}.`;
}

function answerText(receipt) {
  return text(receipt?.answerTextSnapshot, text(receipt?.literalObservation, "The selected response was recorded."));
}

function observation(receipt) {
  return text(receipt?.literalObservation, "The framework keeps this as a literal selected response.");
}

function axisEvidenceIds(axis, snapshot) {
  const fromAxis = [...(axis.supportingEvidenceIds || []), ...(axis.counterevidenceIds || [])];
  if (fromAxis.length) return unique(fromAxis);
  return unique((snapshot.claims || [])
    .filter((claim) => claim.claimTemplateId?.includes(axis.axisId) || claim.construct === axis.axisId)
    .flatMap((claim) => claim.evidenceIds || []));
}

function axisSourceReceipts(axis, receipts, snapshot) {
  const ids = new Set(axisEvidenceIds(axis, snapshot));
  return receipts.filter((receipt) => ids.has(receipt.evidenceId) && usableReceipt(receipt));
}

function statusSentenceBase(axis, sources, voice) {
  const count = unique(sources.map(sourceUnit)).length;
  const level = axis.supportLevel;
  if (level === "strongly_supported") {
    return voice === "gentle"
      ? `This move keeps appearing in ${count || "several"} separate scenes, which makes it the clearest thread here. The scenes still get to keep their own context.`
      : voice === "sharp"
        ? `The move repeats across ${count || "several"} separate scenes. Useful signal; no personality percentage.`
        : `It keeps turning up in ${count || "several"} separate scenes. Recurring role, not a permanent character card.`;
  }
  if (level === "supported") {
    return voice === "gentle"
      ? "Enough scenes rhyme to make this a useful read, while the circumstances still get their say."
      : voice === "sharp"
        ? "The scenes point this way. Useful signal, still a situational read."
        : "The scenes keep pointing this way. Enough signal for a subplot, not enough to crown a final boss.";
  }
  if (level === "mixed") {
    return voice === "gentle"
      ? "The answer changes with the situation. That variation belongs in the portrait; it is not a wrinkle to smooth away."
      : voice === "sharp"
        ? "The answer moves with the context. Flattening it into one average would be lazy analysis."
        : "The answer changes outfits when the setting changes. We are keeping the wardrobe change.";
  }
  if (level === "thin" || level === "limited_evidence") {
    return voice === "gentle"
      ? "There is an early signal here, but not enough separate scenes to make it carry a larger story."
      : voice === "sharp"
        ? "One early signal is not a verdict. It gets a pencil mark, not a brass plaque."
        : "This is a promising clue, not a five-season arc. Keep it light.";
  }
  return voice === "gentle"
    ? "This part stays open because there is not yet a clear answer from more than one situation."
    : voice === "sharp"
      ? "No directional claim is earned here yet. The blank is doing its job."
      : "No clean read yet. The mystery is allowed to remain a mystery.";
}

function naturalJoin(values) {
  const items = values.filter(Boolean);
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function sceneActions(sources) {
  return sources.slice(0, 3).map((receipt, index) => {
    const choice = OPTION_RIFFS[receipt.itemId]?.[receipt.optionIds?.[0]];
    let line = (choice || answerText(receipt)).replace(/[.!?]+$/, "");
    if (sourceStatus(receipt) === "hypothetical_choice") line = `In the imagined scene, your choice was “${answerText(receipt).replace(/[.!?]+$/, "")}”`;
    return index ? line.replace(/^You /, "you ").replace(/^In /, "in ") : line;
  });
}

function selectedSceneLine(sources, voice) {
  const actions = sceneActions(sources);
  if (!actions.length) {
    return voice === "gentle"
      ? "There is not a concrete scene here yet, so this chapter can stay quiet."
      : voice === "sharp"
        ? "No concrete scene is attached yet. The chapter declines to improvise one."
        : "No scene has wandered in yet. The chapter is keeping the lights on anyway.";
  }
  const lead = voice === "gentle"
    ? "The moments you gave us are concrete"
    : voice === "sharp"
      ? "The useful details are concrete"
      : "The scenes are gloriously ordinary and concrete";
  return `${lead}: ${naturalJoin(actions)}.`;
}

const AXIS_FORMATS = {
  activation_tempo: {
    label: "Action replay",
    open: "Action replay is waiting for a first move.",
    detail: (actions, context) => actions.length ? `The tape catches this: ${naturalJoin(actions)}. ${context}` : context,
    labels: ["the replay", "what keeps happening", "the tape", "the next beat"],
  },
  social_signal_style: {
    label: "Outgoing message",
    open: "Outgoing message: the channel is still undecided.",
    detail: (actions, context) => actions.length ? `Channel log: ${naturalJoin(actions)}. ${context}` : `Channel log: no usable message yet. ${context}`,
    labels: ["the message", "signal strength", "channel log", "the next send"],
  },
  friction_posture: {
    label: "Tiny hearing",
    open: "The tiny hearing is still waiting for an exhibit.",
    detail: (actions, context) => actions.length ? `Exhibit A: ${naturalJoin(actions)}. ${context}` : `Exhibit A is still missing. ${context}`,
    labels: ["the opening statement", "the finding", "exhibit A", "the next hearing"],
  },
  structure_reliance: {
    label: "Plan versus plot twist",
    open: "Plan versus plot twist is still an open case.",
    detail: (actions, context) => actions.length ? `Plot twist notes: ${naturalJoin(actions)}. ${context}` : `The plot has not supplied a usable revision yet. ${context}`,
    labels: ["the plan", "the tension", "plot twist notes", "the stress test"],
  },
  novelty_aperture: {
    label: "The curiosity menu",
    open: "The menu is open. There is not enough here yet to guess your order.",
    detail: (actions, context) => actions.length ? `On your tray: ${naturalJoin(actions)}. ${context}` : `No order to read yet. ${context}`,
    labels: ["first pick", "tasting notes", "what you chose", "off-menu question"],
  },
};

function chapterContextLine(axis, level, voice) {
  if (level === "mixed" && axis.contextSplits?.length) {
    return `The answer changes between ${axis.contextSplits.length} different settings, which is useful information in its own right.`;
  }
  const lines = {
    activation_tempo: {
      gentle: "This chapter watches the first move, not your energy level.",
      playful: "This chapter is watching the opening move, not trying to diagnose your battery percentage.",
      sharp: "This is about the opening move, not a claim about your energy or confidence.",
    },
    social_signal_style: {
      gentle: "It follows where the message travelled in these moments, not whether you are a public person.",
      playful: "It tracks the channel your message used, not whether you secretly enjoy a stage and a spotlight.",
      sharp: "It describes the channel, not your sociability or social skill.",
    },
    friction_posture: {
      gentle: "It catches your next move in these scenes, not your kindness or courage as a whole.",
      playful: "It is interested in the next move, not handing out medals for being the nicest person in the room.",
      sharp: "It describes a response to friction, not your moral character.",
    },
    structure_reliance: {
      gentle: "This is the support the task received, not a verdict on your discipline.",
      playful: "This is about how many rails the task wanted, not whether your inner office is a spreadsheet.",
      sharp: "It describes useful structure in these scenes, not competence or executive function.",
    },
    novelty_aperture: {
      gentle: "It describes these invitations, not a universal appetite for change.",
      playful: "It is about these particular doors, not a lifetime membership in the New Things Club.",
      sharp: "It describes selected invitations, not creativity, intelligence, or a formal openness score.",
    },
  };
  return lines[axis.axisId]?.[voice] || "The read stays close to the moments you actually gave us.";
}

function nextSceneLine(axis, level, voice) {
  if (level === "unknown" || level === "thin" || level === "limited_evidence") {
    return voice === "gentle"
      ? "Another kind of moment would help this chapter find its shape."
      : voice === "sharp"
        ? "Give it another scene before giving it a title."
        : "One more scene would tell us whether this clue has legs or just excellent timing.";
  }
  const next = {
    activation_tempo: {
      base: "One to picture: the table goes quiet and someone has to make the first call. Do you step in, or give the silence a little longer?",
      playful: "Bonus scene: everyone is staring at the same unopened email. Do you become the opening act, or let someone else touch the cursed object?",
    },
    social_signal_style: {
      base: "One to picture: a friend gets good news. Does your best response happen in the group chat or in a message just for them?",
      playful: "Bonus scene: your friend wins something. Are you the group-chat confetti cannon or the really good private message?",
    },
    friction_posture: {
      base: "One to picture: an awkward comment lands and nobody responds. Would you name it now or come back to it privately?",
      playful: "Bonus scene: someone says the awkward thing and the table discovers its drinks. Are you opening the conversation or letting it breathe?",
    },
    structure_reliance: {
      base: "One to picture: half the plan changes halfway through. What do you need to know before you take the next step?",
      playful: "Bonus scene: the deadline moves and your spreadsheet makes a small noise. New checklist, or start moving and sort it out on the way?",
    },
    novelty_aperture: {
      base: "One to picture: your reliable favorite and something completely new cost the same. Which gets your attention first?",
      playful: "Bonus scene: your usual order has a mysterious new rival. Same price, no commitment. Is dinner getting a plot twist?",
    },
  }[axis.axisId] || { base: "A different setting would be a useful next scene if you ever want to test the read.", playful: "A different setting would make a decent sequel." };
  return voice === "playful" ? next.playful : next.base;
}

const STATUS_ALTERNATES = {
  strongly_supported: {
    gentle: "The same kind of move keeps returning in separate scenes. It is the clearest thread here, while still belonging to the scenes rather than to a permanent label.",
    playful: "Several scenes keep handing us the same little clue. It has a recurring role now, but it is still a clue with a day job.",
    sharp: "The signal repeats across separate scenes. Use it as a read; do not mistake repetition for a personality percentage.",
  },
  supported: {
    gentle: "The direction has enough company to be useful, while the situations still get to matter.",
    playful: "The subplot has enough witnesses to stay in the episode, with context still allowed to steal a scene.",
    sharp: "The direction has support. The context still gets veto power.",
  },
  mixed: {
    gentle: "Different settings bring out different answers, and that is a meaningful part of your read.",
    playful: "This chapter changes outfits when the setting changes. We are keeping the wardrobe change.",
    sharp: "Context changes the answer. The honest read keeps the split instead of averaging it away.",
  },
  thin: {
    gentle: "There is a small beginning here. It deserves curiosity, not a heavy label.",
    playful: "A clue has entered the chat. It has not yet earned its own franchise.",
    sharp: "One early signal. Mark it, then wait for a second scene.",
  },
  unknown: {
    gentle: "This part is still quiet because the current answers do not give it a clear shape.",
    playful: "This drawer is still empty. The mystery gets to keep its coat on.",
    sharp: "No clean direction yet. Leaving it blank is the accurate move.",
  },
};

function statusSentence(axis, sources, voice, seed) {
  const base = statusSentenceBase(axis, sources, voice);
  const level = axis.supportLevel === "limited_evidence" ? "thin" : axis.supportLevel || "unknown";
  return variant(seed, `${axis.axisId}:status`, [base, STATUS_ALTERNATES[level]?.[voice] || base]);
}

function axisChapter(axis, receipts, snapshot, voice, seed) {
  const editorial = AXIS_EDITORIAL[axis.axisId];
  const sources = axisSourceReceipts(axis, receipts, snapshot);
  const evidenceIds = axisEvidenceIds(axis, snapshot);
  const direction = ["supported","strongly_supported"].includes(axis.supportLevel) && (axis.direction === "left" || axis.direction === "right") ? axis.direction : null;
  const level = axis.supportLevel || "unknown";
  const format = AXIS_FORMATS[axis.axisId] || AXIS_FORMATS.activation_tempo;
  const directionLine = direction
    ? variant(seed, `${axis.axisId}:direction`, [editorial[direction], AXIS_DIRECTION_ALTERNATES[axis.axisId]?.[direction]?.[voice] || editorial[direction]])
    : level === "mixed" ? "Different situations got different versions of you. The interesting part is the switch; there is no single direction to stamp on this page."
      : ["thin", "limited_evidence"].includes(level) ? (voice === "gentle" ? "This is an early clue from the scenes you shared. Another example would help before calling it a pattern." : "One early clue has arrived. It gets a place on the board, but it has not earned the right to introduce you at parties.")
        : format.open;
  const contextLineText = chapterContextLine(axis, level, voice);
  const actions = sceneActions(sources);
  return {
    id: axis.axisId,
    title: editorial.title,
    kicker: format.label,
    paragraphs: [
      directionLine,
      statusSentence(axis, sources, voice, seed),
      format.detail(actions, contextLineText),
      nextSceneLine(axis, level, voice),
    ],
    paragraphLabels: format.labels,
    evidenceIds,
  };
}

function caseSourceSentence(receipt, voice) {
  const status = sourceStatus(receipt);
  const context = contextLine(receipt);
  if (status === "retrospective_self_report") {
    return voice === "gentle"
      ? `You described a recent event in ${context}. It belongs to the record because something happened, while still staying limited to that situation.`
      : voice === "sharp"
        ? `You described a recent event in ${context}. Useful scene, limited conclusion.`
        : `You described a recent event in ${context}. Actual scene, actual receipt, no magical promotion to permanent identity.`;
  }
  if (status === "hypothetical_choice") {
    return voice === "gentle"
      ? `This one was clearly framed as a thought experiment in ${context}. It can add a small, playful signal, but it is not a report that the event happened.`
      : voice === "sharp"
        ? `This was hypothetical, in ${context}. Useful as a thin projective clue; useless as proof that you acted this way.`
        : `This was a thought experiment in ${context}. It gets a little confetti, not a sworn statement.`;
  }
  if (status === "stated_preference" || status === "reported_preference") {
    return voice === "gentle"
      ? `This is something you selected directly in ${context}. It is a useful instruction or preference, not a disguised score.`
      : voice === "sharp"
        ? `Direct preference, recorded in ${context}. Helpful context; no personality conversion.`
        : `You said this directly in ${context}. Genii files it under “useful instructions,” not “secret diagnosis.”`;
  }
  return `This receipt is kept literal and bounded to ${context}.`;
}

function predicateAxis(receipt) {
  return (receipt?.predicates || []).find((predicate) => predicate.axisId) || null;
}

function caseFile(receipt, axisById, voice) {
  const status = sourceStatus(receipt);
  const riff = OPTION_RIFFS[receipt.itemId]?.[receipt.optionIds?.[0]];
  const chosen = riff && status === "hypothetical_choice" ? `In this thought experiment, ${riff.replace(/^You /, "you ")}` : riff;
  const scene = CASE_READINGS[receipt.itemId] || framing(receipt);
  const intro = status === "hypothetical_choice" ? "In this imaginary version of the scene" : status === "stated_preference" ? "When you described what suits you" : "In the moment you told us about";
  const codas = {
    "GQB2-E01":"An easy exit changes the invitation. Trying something once does not have to mean adopting it as your new personality, and passing does not have to become a manifesto either.",
    "GQB2-E02":"This is where the social calendar meets the actual human who has to put on shoes. Your answer is the ending that really happened, which is much more interesting than the one a motivational poster would recommend.",
    "GQB2-E03":"An object can survive checkout and still fail the audition at home. The part after the purchase is its own little story, and this one has a very specific ending.",
    "GQB2-E04":"The original plan has left the building. What matters in this scene is the move that followed it: the rewrite, the pause, the objection, or the change of direction you actually described.",
    "GQB2-E05":"The invitation and the entrance are two different scenes. It is easy to have a theory about how you would handle an unfamiliar room; here, you gave us an actual next move.",
    "GQB2-E06":"The tiny decision committee has a preferred way of reaching a verdict. It does not need to be the same method for a sandwich and a life change; this is the small-decision version you asked us to keep.",
    "GQB2-W01":"A first move does not have to solve the whole brief. Sometimes its job is simply to make the next question better. Your answer shows which tool got invited to that very first meeting.",
    "GQB2-W02":"The first minute is rarely the polished version people tell later. That makes it useful: a real next move, with the awkwardness still attached, before the story gets a public-relations department.",
    "GQB2-W03":"Feedback and the response to feedback are separate things. The useful detail here is what you did with the information while it was still fresh, before time could turn it into a neat lesson.",
    "GQB2-W04":"A credit line is a very small piece of text with a surprising amount of social weight. This scene catches how you handled that weight in one shared effort, with those particular people.",
    "GQB2-W05":"The ideal amount of planning is apparently not a universal unit of measurement. You gave us your preferred starting conditions; the plan can now stop pretending everyone wants the same number of tabs open.",
    "GQB2-W08":"A yes, a smaller yes, a later yes, and a no do different jobs. The request alone cannot tell the story; the room you actually had matters too.",
    "GQB2-W09":"Starting is an event, not just a mood. This separate task gives us another glimpse of what happens when something moves from the list into the day.",
    "GQB2-S01":"A quiet phone leaves plenty of room for an imaginary screenplay. Your answer is useful because it tells us what actually left the drafts—or what stayed there.",
    "GQB2-S05":"Public celebration and private attention are different channels, and neither comes with an automatic sincerity bonus. This scene is about where your support actually went.",
    "GQB2-S09":"Somebody eventually has to turn ‘we should do something’ into a plan that exists. The interesting part is which piece of the arrangement you made real first."
  };
  const codaAlternates = {
    "GQB2-E02": "The answer is not a lesson about willpower. It is a small, very human record of what happened when the plan met the leaving hour.",
    "GQB2-W01": "The first move does not need to solve the brief. It only needs to make the next move less imaginary.",
    "GQB2-S05": "The channel is the detail: room-wide confetti, private follow-up, a quick signal, or a call after the noise.",
    "GQB2-E03": "Small purchases are excellent at pretending to be simple. Your selected ending gives this one its actual shape.",
    "GQB2-W09": "A separate starting scene keeps this answer from borrowing someone else's momentum. That is the whole point of the extra receipt.",
    "GQB2-S09": "A gathering becomes real through its first piece of structure, even when that structure is intentionally light."
  };
  const defaultCoda = voice === "gentle"
    ? "Keep the part that feels familiar; leave room for another setting to bring out something different."
    : voice === "sharp"
      ? "A specific scene gets a specific reading. You retain full rights to surprise the narrator next time."
      : "A specific scene gets a specific reading. The narrator is taking notes and pretending not to be impressed.";
  const primaryCoda = codas[receipt.itemId] || defaultCoda;
  const delivery = variant(answerSeed([receipt]), `${receipt.itemId}:coda`, [primaryCoda, codaAlternates[receipt.itemId] || defaultCoda]);
  return {
    id: receipt.evidenceId,
    title: CASE_TITLES[receipt.itemId] || "A moment worth keeping",
    paragraphs: [`${chosen || "That is the version of this scene you chose to share."} ${scene}`, `${intro}, your answer was: “${answerText(receipt)}”`, delivery],
    evidenceIds: [receipt.evidenceId],
  };
}

function pickCaseReceipts(receipts) {
  const candidates = receipts.filter(usableReceipt);
  const ranked = candidates.map((receipt, index) => {
    const status = sourceStatus(receipt);
    const sourceScore = status === "retrospective_self_report" ? 8 : status === "stated_preference" ? 5 : status === "hypothetical_choice" ? 3 : 2;
    const axisScore = (receipt.predicates || []).some((predicate) => predicate.axisId) ? 3 : 0;
    const lengthScore = answerText(receipt).length > 28 ? 1 : 0;
    return { receipt, index, score: sourceScore + axisScore + lengthScore };
  }).sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = [];
  const usedUnits = new Set();
  const usedSections = new Set();
  const take = (entry) => {
    const unit = sourceUnit(entry.receipt);
    if (!unit || usedUnits.has(unit)) return false;
    usedUnits.add(unit);
    usedSections.add(entry.receipt.sectionId || "unknown");
    selected.push(entry.receipt);
    return true;
  };
  for (const entry of ranked) {
    if (selected.length >= 12) break;
    if (!usedSections.has(entry.receipt.sectionId || "unknown")) take(entry);
  }
  for (const wantedStatus of ["stated_preference", "hypothetical_choice"]) {
    const entry = ranked.find((candidate) => sourceStatus(candidate.receipt) === wantedStatus && !usedUnits.has(sourceUnit(candidate.receipt)));
    if (!entry) continue;
    if (selected.length >= 12) {
      const removed = selected.pop();
      usedUnits.delete(sourceUnit(removed));
    }
    take(entry);
  }
  for (const entry of ranked) {
    if (selected.length >= 12) break;
    take(entry);
  }
  return selected;
}

function counts(receipts) {
  const usable = receipts.filter(usableReceipt);
  return {
    sourceUnits: unique(usable.map(sourceUnit)).length,
    actual: usable.filter((receipt) => sourceStatus(receipt) === "retrospective_self_report").length,
    preferences: usable.filter((receipt) => ["stated_preference", "reported_preference"].includes(sourceStatus(receipt))).length,
    hypothetical: usable.filter((receipt) => sourceStatus(receipt) === "hypothetical_choice").length,
  };
}

function opening(result, receipts, axes, snapshot, voice) {
  const title = text(result?.designation, text(result?.gameTitle?.label, "Plot still developing"));
  const stats = counts(receipts);
  const supported = axes.filter((axis) => ["supported", "strongly_supported"].includes(axis.supportLevel) && axis.direction);
  const seed = answerSeed(receipts);
  const firstScenes = pickCaseReceipts(receipts).slice(0, 2);
  const sceneLine = firstScenes.length
    ? `${voice === "gentle" ? "The first scenes are wonderfully specific" : voice === "sharp" ? "The first scenes are usefully specific" : "The first scenes are specific in the way real life insists on being"}: ${naturalJoin(sceneActions(firstScenes))}.`
    : "There is not yet a scene with enough detail to make the opening personal.";
  const evidenceIds = unique([...(result?.gameTitle?.evidenceIds || []), ...supported.slice(0,2).flatMap(axis=>axisEvidenceIds(axis,snapshot)), ...firstScenes.map((receipt) => receipt.evidenceId)]);
  const paragraph = stats.sourceUnits
    ? `${stats.sourceUnits} separate moments are doing the heavy lifting here. Recent events anchor the read; direct preferences and thought experiments stay in their own lanes so the fun does not outrun what you actually gave us.`
    : voice === "gentle" ? "There is not yet a usable moment to build a portrait from." : voice === "sharp" ? "There is no usable moment yet. The file declines to cosplay certainty." : "The evidence drawer is empty. Genii is resisting the urge to interview the stapler.";
  return {
    eyebrow: VOICE[voice].eyebrow,
    title: voice === "gentle" ? "Here’s what stood out." : voice === "sharp" ? "Here’s what gave you away." : "A few clues with your name on them.",
    paragraphs: [variant(seed, "opening:voice", OPENING_VARIANTS[voice] || [VOICE[voice].opening]), sceneLine],
    sourceNote: paragraph + " This title belongs to this playthrough; it is not a permanent type.",
    evidenceIds,
  };
}

function closing(result, receipts, voice) {
  return {
    title: voice === "sharp" ? "Your turn to cross-examine." : voice === "gentle" ? "Which parts feel like you?" : "Recognize yourself—or have notes?",
    paragraphs: [receipts.length ? ({gentle:"A line can be close without being quite right. Below, you can tell Genii what fits, what partly fits, and what it missed.",playful:"You are allowed to say, ‘annoyingly accurate,’ ‘almost,’ or ‘absolutely not, explain yourself.’ The little verdict buttons below are yours.",sharp:"Genii has put its interpretation in writing. You now have the floor—and a ‘Not accurate’ button if the prosecution got carried away."})[voice] : VOICE[voice].sparse],
  };
}

/**
 * Build an editorial evidence packet from a runtime result. This function is
 * deterministic and side-effect free; it only cites source IDs already on the
 * result and leaves unsupported axes explicitly open.
 */
export function buildDossierStory(result = {}) {
  const voice = voiceFor(result);
  const snapshot = snapshotFor(result);
  const projection = projectionFor(result);
  const receipts = Array.isArray(result.receipts)
    ? result.receipts
    : [...(snapshot.evidenceEvents || []), ...(snapshot.missingnessEvents || [])];
  const axes = axisList({ ...result, projection });
  const seed = answerSeed(receipts);
  const axisById = new Map(axes.map((axis) => [axis.axisId, axis]));
  const chapters = axes.map((axis) => axisChapter(axis, receipts, snapshot, voice, seed));
  const selectedCases = pickCaseReceipts(receipts);
  return {
    opening: opening(result, receipts, axes, snapshot, voice),
    chapters,
    caseFiles: selectedCases.map((receipt) => caseFile(receipt, axisById, voice)),
    closing: closing(result, receipts, voice),
  };
}

export default buildDossierStory;
