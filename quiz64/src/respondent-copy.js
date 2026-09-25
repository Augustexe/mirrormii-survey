// Wording only. data.js retains the frozen V4 meanings, tags, routing and limits.
export const WORDING_VERSION = "v4-astra-english-1";

// Each entry lists ALL options in the original ID order, including unchanged text.
// scene supplies a grammatical context for result examples, never an inferred motive.
export const ITEM_COPY = {
  "V4-001": {
    title: "What would you like from your result today?",
    setup: "This only sets the style of your result.",
    scene: "the kind of result you want",
    options: ["A funny but fair roast", "A very specific look at my patterns", "Practical guidance on how I work", "A gentle reflection", "Surprise me, as long as my answers back it up"],
  },
  "V4-002": {
    title: "How should Genii talk about the patterns in your answers?",
    setup: "Choose the tone you prefer. This is not a test of how much you can take.",
    scene: "the tone you prefer",
    options: ["Gentle and careful", "Clear and kind", "Playful and pointed", "Ask before discussing anything sensitive", "Show me which answers led to it first"],
  },
  "V4-003": {
    title: "Are there any topics you want to leave out today?",
    setup: "Choose all that apply. You can also skip individual questions.",
    scene: "topics you want to leave out",
    options: ["Dating or romantic situations", "Family situations", "Money or spending situations", "Work or school situations", "Personal appearance", "No particular topics to leave out this time"],
  },
  "V4-004": {
    title: "What would make this result worthwhile for you?",
    setup: "Choose what you hope to get from it.",
    scene: "what you hope to get from the result",
    options: ["It describes a pattern I recognize", "It notices how I act differently in different situations", "It correctly guesses a few of my choices", "It helps me put things about myself into words", "It gives me something fun to compare with others"],
  },
  "V4-005": {
    title: "A teammate gets the applause for something you helped make happen. What would you do first?",
    setup: "Other people are watching. Getting credit matters, but you also have to keep working with this person.",
    scene: "a teammate getting public credit for shared work",
    options: ["Let the moment pass and keep it in mind for later", "Congratulate them, then clarify my part privately", "Briefly mention my part while everyone is there", "Make my contribution easier to see next time", "Put less effort into the next thing we do together"],
  },
  "V4-006": {
    title: "In that credit situation, what would matter most to you?",
    setup: "Think about the same teammate and the response you just chose.",
    scene: "what matters to you when a teammate gets shared credit",
    options: ["Making sure the credit is fair", "Not making the moment awkward for everyone", "Keeping the relationship workable", "Having people see my contribution accurately", "Protecting future opportunities", "I am not sure yet"],
  },
  "V4-007": {
    title: "Someone close to you succeeds at something you care about too. What would you do first?",
    setup: "Their success matters to them. It also gives you something to compare yourself with.",
    scene: "someone close succeeding in an area you care about",
    options: ["Celebrate with them right away", "Ask how they did it", "Take a private moment, then join in warmly", "Get quieter until my feelings settle", "Use it as motivation for my own next step"],
  },
  "V4-008": {
    title: "Someone you know is getting attention for work that looks a lot like yours. What would you do?",
    setup: "Your contribution matters to you. Raising it could also affect how people see you.",
    scene: "someone getting attention for work similar to yours",
    options: ["Point out the overlap directly to them", "Make my next version clearly different", "Make a light comment that points out the connection", "Let it pass unless it keeps happening", "Save examples in case I need them later"],
  },
  "V4-009": {
    title: "In the past 30 days, when someone else got credit for something you helped with, what did you do?",
    setup: "Think of one real example. If none comes to mind, choose “No recent example.”",
    scene: "a real credit situation in the past 30 days",
    options: ["Said nothing at the time", "Clarified my part privately afterward", "Clarified my part where the others could see or hear it", "Made my work more visible afterward", "Contributed less the next time"],
  },
  "V4-010": {
    title: "Back to the teammate getting your share of the credit: what if only one trusted person noticed?",
    setup: "Keep the work, teammate and unfair credit the same. Only who sees it changes.",
    scene: "the same credit situation with only one trusted person noticing",
    options: ["Still correct the record directly", "Talk it through with that trusted person", "Let it go this time", "Use it as private motivation", "Ask that person to back me up later if needed"],
  },
  "V4-011": {
    title: "You say something confidently, and someone corrects you in front of the group. What would you do first?",
    setup: "You know some people in the group better than others. The correction is noticeable.",
    scene: "being corrected in front of a group",
    options: ["Acknowledge the correction and keep the conversation moving", "Ask one clarifying question", "Explain what led me to say it", "Get quieter and join back in later", "Make a small joke to ease the awkwardness"],
  },
  "V4-012": {
    title: "In that correction scene, how would you feel inside, and what would people see?",
    setup: "Stay with that moment. This asks about your feeling and outward response, not how long it takes to pass.",
    scene: "your feelings and outward response to that public correction",
    options: ["I would feel stung but look steady", "I would feel curious and stay engaged", "My mind would go blank while I responded automatically", "I would feel irritated but keep it contained", "I would feel fine, and it would show", "I would not know until later"],
  },
  "V4-013": {
    title: "You make a joke, and a friend or someone in the group goes quiet. What would you do next?",
    setup: "The joke seems to have landed badly. Your response could affect both the relationship and how the group sees you.",
    scene: "a joke landing badly with someone in a group",
    options: ["Check in with them one-on-one", "Briefly explain what I meant without pushing", "Give them space and come back to it later", "Briefly acknowledge it in the group", "Stop joking with them for now"],
  },
  "V4-014": {
    title: "In that joke situation, what would you most want to protect?",
    setup: "Think about the same person and the response you just chose.",
    scene: "what matters to you after that joke lands badly",
    options: ["Their comfort", "Their understanding of what I meant", "Keeping the moment from becoming a bigger issue", "Keeping the relationship workable", "Having time to understand the situation", "I am not sure"],
  },
  "V4-015": {
    title: "You make a mistake that other people can see. What would you do to get back on track?",
    setup: "It could affect how capable people think you are.",
    scene: "getting back on track after a visible mistake",
    options: ["Say how I will fix it, then do that", "Take a short break before coming back", "Explain the mistake plainly", "Ask someone to take over one part or check my work", "Make a joke once the fix is underway"],
  },
  "V4-016": {
    title: "Back to the public correction: what changes if it comes from someone with power over you?",
    setup: "Keep the correction and group the same. Only the authority of the person correcting you changes.",
    scene: "the same public correction coming from someone with power over you",
    options: ["I keep my response shorter", "I ask what standard they are using", "I save any disagreement for later", "I respond about the same", "I make a note of the point before moving on"],
  },
  "V4-017": {
    title: "You find out your friends hung out without you. What would you do first?",
    setup: "These friendships matter to you. You do not yet know why you were not included.",
    scene: "finding out your friends met without you",
    options: ["Ask one person directly what happened", "Bring it up casually and see how they respond", "Say nothing, but adjust what I expect from them", "Step back from the group for a while", "Make separate plans with people who show up for me"],
  },
  "V4-018": {
    title: "Before you know why those friends met without you, what explanation comes to mind first?",
    setup: "This is your first interpretation, not a conclusion about what happened.",
    scene: "your first explanation for not being included",
    options: ["It was probably about timing or practical arrangements", "They may have wanted a different mix of people", "I need more information before deciding", "This fits something I have noticed before", "Maybe it was not about me", "I am not sure"],
  },
  "V4-019": {
    title: "You have sent an important message, but the reply has not arrived. What would you do first?",
    setup: "Keep one person in mind. You will be able to say who they are to you in the next question.",
    scene: "waiting for a reply to an important message",
    options: ["Follow up once and make the question as clear as I can", "Check whether I actually need an answer urgently", "Wait and focus on something else", "Draft what I want to say, but do not send it yet", "Ask someone neutral if they know any relevant context"],
  },
  "V4-020": {
    title: "Who were you picturing when you thought about that unanswered message?",
    setup: "No names needed. Choose the description that best captures the situation.",
    scene: "who you pictured while waiting for a reply",
    options: ["A close friend or someone who feels like chosen family", "Someone I am dating or my partner", "A family member", "Someone from work or school, or someone with authority", "Someone newer in my life or someone I trust less", "Someone whose power over me makes being direct risky"],
  },
  "V4-021": {
    title: "You want to know where you stand with someone. How would you approach it?",
    setup: "First choose the situation below. Asking may leave you feeling exposed, and how safe it is to be direct matters.",
    scene: "asking where you stand with someone",
    options: ["Ask plainly and keep it short", "Ask a smaller, practical question to get a sense of things", "Act as usual and wait for more information", "Get support from someone else before asking", "Decide it is not worth the cost of asking right now"],
  },
  "V4-022": {
    title: "For the same question about where you stand, how would you respond to a newer person rather than a close friend?",
    setup: "Keep the situation, safety and their reliability the same. Compare a close friend with someone newer; only how close you are changes.",
    scene: "asking where you stand with someone newer rather than a close friend",
    options: ["I still ask plainly", "I make the question smaller or less direct", "I wait for a clearer sign", "I turn to someone else for support", "I leave it unless it happens again"],
  },
  "V4-023": {
    title: "Someone gives you useful advice, but says it like an order. What would you do first?",
    setup: "The advice itself is good. The issue is being told what to do.",
    scene: "useful advice being delivered like an order",
    options: ["Ask why they recommend it before deciding", "Use the advice, but adapt it my way", "Tell them the way they are saying it is not working for me", "Go along with it for now and revisit it later", "Pause so I do not push back without meaning to"],
  },
  "V4-024": {
    title: "What would matter most in your reaction to that advice?",
    setup: "Think about the same advice from the same person.",
    scene: "what matters in your response to advice that sounds like an order",
    options: ["Having a real choice", "How good the advice is", "When they give it", "Not being underestimated", "Getting through the conversation efficiently", "Nothing about it would bother me much"],
  },
  "V4-025": {
    title: "A group or collaborator changes your carefully made plan at the last minute. What would you do first?",
    setup: "You put effort into the plan. The change takes some control out of your hands.",
    scene: "a carefully made plan changing at the last minute",
    options: ["Rework the plan around what has changed", "Explain the impact on me before agreeing", "Go along with the change this time", "Push to keep the part of the original plan that matters most", "Focus only on my own part instead of the whole plan"],
  },
  "V4-026": {
    title: "Your group keeps talking, but nobody is making a decision. What would you do?",
    setup: "Everyone is on roughly equal footing. Getting organized matters, and stepping in will be noticed.",
    scene: "a group struggling to make a decision",
    options: ["Take the lead and suggest a way forward", "Ask what people prefer, then propose a decision", "Wait until enough people agree", "Make sure my own part is clear", "Suggest the person best placed to make the decision"],
  },
  "V4-027": {
    title: "Someone with power over you asks for extra effort as if your yes is automatic. What would you do first?",
    setup: "The request takes time or energy. Keep in mind what you can manage and whether it is safe to push back.",
    scene: "someone with power expecting extra effort from you",
    options: ["Do what is required and keep a record", "Negotiate how much I will do, if it is safe", "Explain what I can manage and ask what comes first", "Push back directly if I can accept the risk", "Get advice or backup before responding"],
  },
  "V4-028": {
    title: "What if that same person explains why they are asking and gives you a real choice?",
    setup: "It is the same request, effort and person with the same power over you. Your available time and energy have not changed. Only the explanation and freedom to choose are different.",
    scene: "the same request with a reason and a real choice",
    options: ["I am more willing to do it on the same terms", "I still negotiate how much I will do", "I use the explanation to decide what to prioritize", "What I can manage stays the same, so my answer does too", "The risk of saying no stays the same, so my answer does too"],
  },
  "V4-029": {
    title: "In the past 30 days, when someone asked for a favor that would cost you something, what did you do?",
    setup: "Think of one real request. Use the questions below to describe who asked, what it cost and what you could manage.",
    scene: "a real favor request in the past 30 days",
    options: ["Helped with the whole request", "Helped, but set a clear limit", "Suggested another way to help or a different time", "Said no clearly", "Put off answering until the moment passed"],
  },
  "V4-030": {
    title: "What mattered most in that favor decision?",
    setup: "Stay with the same request from the past 30 days.",
    scene: "what mattered in that recent favor decision",
    options: ["Caring about the person", "Whether the request was fair or reasonable", "What I could manage that day", "What might happen if I said no", "Whether they usually show up for me too", "I am not sure"],
  },
  "V4-031": {
    title: "A close friend needs help just when your own plan matters to you. What would you do?",
    setup: "Keep one request in mind, including how urgent it is, what you can manage, any risk in saying no and how reliable this friend is. Use those same details in the next question.",
    scene: "a close friend needing help during your own important plan",
    options: ["Pause my plan and help now", "Help with part of it and set a clear limit", "Ask how urgent it really is before deciding", "Say no warmly and suggest another way to get help", "Be clear about the timing or what I would need in return"],
  },
  "V4-032": {
    title: "How would you respond if that same request came from an acquaintance instead?",
    setup: "The request, cost, urgency and your ability to help stay the same. So do their reliability and any risk in saying no. Only how close you are changes.",
    scene: "the same help request coming from an acquaintance",
    options: ["I still help now", "I set a clearer limit", "I ask how urgent it is before deciding", "I decline and suggest another way to get help", "I make clear what time I would be giving up"],
  },
  "V4-033": {
    title: "Someone you find difficult asks for help. Helping could also benefit your reputation. What would you do?",
    setup: "Think of a peer or acquaintance you do not fully trust. Helping means dealing with them and deciding how much to take on.",
    scene: "helping a difficult person when there is something to gain",
    options: ["Help, but keep the interaction limited", "Decline without explaining further", "Help through a neutral person or channel", "Agree on the terms before helping", "Stay polite, but keep my distance"],
  },
  "V4-034": {
    title: "If saying yes has felt costly lately, what made it costly?",
    setup: "Think of the past 30 days, or a pattern that fits you now. If no example comes to mind, choose “No recent example.”",
    scene: "what made saying yes costly recently",
    options: ["The request turned out to be bigger than it sounded", "I could manage less than they realized", "The timing was the problem", "It depended on who was asking", "I wanted my effort to be noticed"],
  },
  "V4-035": {
    title: "Something fun is tempting you tonight, but it could make tomorrow’s commitment harder. What would you do?",
    setup: "There is something to enjoy now and a real cost to deal with tomorrow.",
    scene: "something fun competing with tomorrow’s commitment",
    options: ["Take the fun option fully", "Do a smaller version of it", "Save the fun for after the commitment", "Ask someone to help me stick to my plan", "Decide based on who is involved"],
  },
  "V4-036": {
    title: "What makes that tempting option appealing?",
    setup: "Think about the same choice for tonight, even if you would turn it down.",
    scene: "what makes that tempting option appealing",
    options: ["It would make a better story", "It would give me some immediate relief", "It would feel like choosing for myself", "The people involved draw me in", "The chance feels rare", "I am not sure"],
  },
  "V4-037": {
    title: "Sharing information could cause conflict. What would you do first?",
    setup: "Choose who is involved, how safe it is to speak and what you are allowed or required to share. Both conflict and trust are at stake.",
    scene: "sharing information that could cause conflict",
    options: ["Share the relevant information and explain the context", "Say what I can share and what I cannot", "Wait until there is a safer way to talk", "Answer exactly what they asked and let them ask more", "Check with an appropriate person I can safely talk to first"],
  },
  "V4-038": {
    title: "Someone makes a subtle comment that makes you look bad. What would you do?",
    setup: "It is a peer or someone in the group. Responding could start a disagreement.",
    scene: "someone making a subtle comment at your expense",
    options: ["Bring it up directly with them afterward", "Be less warm toward them", "Let my performance speak for itself and move on", "Make a light comment back at the time", "Keep it in mind in case it happens again"],
  },
  "V4-039": {
    title: "You notice a small advantage in how something is scheduled or processed, but the rules are unclear. What would you do?",
    setup: "It is a minor scheduling or paperwork matter, not a sensitive personal issue. No one is watching your choice.",
    scene: "a small scheduling or paperwork advantage with unclear rules and no audience",
    options: ["Use it if a quick check shows it is allowed", "Tell the relevant group about the advantage", "Pass unless the rules clearly allow it", "Use it once and make a note of why", "Ask the person responsible for the rules what to do"],
  },
  "V4-040": {
    title: "What changes if people you respect can see that same choice?",
    setup: "The advantage, unclear rules and stakes are exactly the same. Only the audience changes.",
    scene: "the same scheduling or paperwork choice with people you respect watching",
    options: ["I make the same choice", "I check the rules more carefully", "I tell people about it sooner", "I avoid the advantage even if it is allowed", "I explain my reasoning before acting"],
  },
  "V4-041": {
    title: "When Genii notices something about you, how would you like it to bring it up?",
    setup: "This is a preference about how Genii should respond, not a personality clue.",
    scene: "how you want Genii to bring up a pattern",
    options: ["Say it directly", "Start gently", "Make it playful", "Ask before going deeper", "Show me the answers behind it first", "Do not comment unless I ask"],
  },
  "V4-042": {
    title: "If you ignore a suggestion from Genii, how often should it try again?",
    setup: "This is about not responding. Saying “no” is a separate boundary.",
    scene: "how often Genii should repeat an ignored suggestion",
    options: ["Do not try again", "Try once more later", "Try twice more, then stop", "Try once more only when it clearly fits the situation", "Ask me to choose how many times"],
  },
  "V4-043": {
    title: "When you are stuck, what kind of help would you want from Genii first?",
    setup: "Choose the approach you would prefer. This does not tell us which approach will work best.",
    scene: "the help you want when you are stuck",
    options: ["Describe the pattern I seem to be in", "Give me a few options", "Make one recommendation", "Draft what I could say", "Start with some humor", "Do not step in unless I ask"],
  },
  "V4-044": {
    title: "When should Genii stop or ask permission before continuing?",
    setup: "Choose all that apply. These are your boundaries, not clues about your personality.",
    scene: "when you want Genii to stop or ask first",
    options: ["When I say no once", "Before discussing dating or conflict", "Before discussing family", "When money, work or school is at stake", "When discussing public embarrassment", "Before drawing any sensitive conclusion about me"],
  },
  "V4-H01": {
    title: "In a group chat, someone you do not know well gets credit for your shared idea. What would you do first?",
    setup: "Others can see the conversation. Credit matters, but you are not especially close to this person.",
    scene: "shared credit in a group chat",
    options: ["Let it pass unless it affects what happens next", "Add context about my part in the chat", "Message them privately", "Make my next contribution easy to trace back to me", "Ask someone neutral how they understood it"],
  },
  "V4-H02": {
    title: "You accidentally talk over someone, and everyone notices. What would you do?",
    setup: "The conversation has become awkward. Your response could help put it right.",
    scene: "accidentally interrupting someone in a group",
    options: ["Give them the floor back directly", "Apologize briefly and save my point for later", "Make a light comment to ease the moment, then invite them to speak", "Stay quiet until the topic changes", "Check in with them after the conversation"],
  },
  "V4-H03": {
    title: "Two friends make plans in front of you without including you. What would you do first?",
    setup: "You do not know why you were left out. There is no clear history of how reliably they include you.",
    scene: "two friends making plans without including you",
    options: ["Ask casually whether I can join", "Wait to see if they invite me later", "Make my own plans without commenting", "Ask one of them privately afterward", "Step back from both the plan and the conversation about it"],
  },
  "V4-H04": {
    title: "A friend who knows their stuff gives you good advice like an order. What would you do?",
    setup: "The advice is useful. The way they give it leaves little room for your choice.",
    scene: "a skilled friend giving advice like an order",
    options: ["Ask why so I can decide whether to go along with it", "Use the advice, but do it my way", "Tell them the ordering tone is the problem", "Follow it because the outcome matters", "Pause before responding"],
  },
  "V4-H05": {
    title: "Someone who is usually reliable needs help during time you set aside for yourself. What would you do?",
    setup: "Helping now would take a lot from that time. Think of someone close or someone you know less well, and keep that person in mind.",
    scene: "a reliable person asking for help during time you protected",
    options: ["Help now and accept the cost", "Offer a limited amount of help now", "Ask which part is genuinely urgent", "Offer another time or another way to get help", "Say clearly that I cannot help during this time"],
  },
  "V4-H06": {
    title: "An invitation could make for a great story, but you have a commitment tomorrow. What would you do?",
    setup: "Accepting has a cost tomorrow. Who else is going may also matter to you.",
    scene: "an appealing invitation before tomorrow’s commitment",
    options: ["Go and make the most of it", "Go for a shorter time", "Decline and protect tomorrow’s commitment", "Ask someone to help me leave at a set time", "Decide based on who is going"],
  },
  "V4-H07": {
    title: "Telling a collaborator the full story now could cause conflict. What would you do?",
    setup: "You could be completely clear now or keep things calm for a while. Trust is also at stake.",
    scene: "telling a collaborator something that could cause conflict",
    options: ["Tell them the whole story with context", "Tell them the part that affects their decision", "Wait until I can say it without getting heated", "Answer if they ask me directly", "Talk to someone I feel safer with first"],
  },
  "V4-H08": {
    title: "Genii has an impression of you and a follow-up question. How would you want it to respond right now?",
    setup: "Choose how you would like this conversation to continue.",
    scene: "how you want Genii to continue the conversation",
    options: ["Describe the pattern first, then ask the question", "Show my answers first, then explain the impression", "Ask permission before sharing the impression", "Keep it playful and brief", "Keep the next question to yourself unless I ask"],
  },
};

const EXIT_COPY = {
  other_unscored: "Something else / it depends",
  abstain: "I do not have enough information to choose",
  unsafe_to_answer: "The risk or power imbalance makes this hard to answer",
  capacity_not_comparable: "What I could manage would decide this, not how they ask",
};

export function applyItemCopy(question) {
  const copy = ITEM_COPY[question.id];
  if (!copy || copy.options.length !== question.options.length) {
    throw new Error(`Missing or incomplete respondent wording: ${question.id}`);
  }
  return {
    ...question,
    wordingVersion: WORDING_VERSION,
    title: copy.title,
    setup: copy.setup,
    options: question.options.map((option, index) => ({
      ...option,
      text: copy.options[index],
      why: copy.options[index],
    })),
    exits: question.exits.map((exit) => {
      const text = EXIT_COPY[exit.id] || exit.text;
      return { ...exit, text, why: text };
    }),
  };
}

export const CHAPTER_COPY = [
  ["Before we start", "Choose the tone, topics and result you want."],
  ["Getting credit", "Recognition, comparison and what you do when credit gets complicated."],
  ["Awkward moments", "Corrections, mistakes and what happens next."],
  ["Where you stand", "Friendship, unanswered messages and asking for clarity."],
  ["Having a say", "Advice, changing plans and requests from people with power."],
  ["Helping and saying no", "What you can give, what it costs and where you draw the line."],
  ["Choices with a cost", "Tempting plans, difficult conversations and small advantages."],
  ["What helps you", "Tell Genii how to offer help and when to leave it to you."],
  ["The final checks", "Genii has already made its guesses. Your answers here will not change your portrait."],
];

export const CONTEXT_VALUE_LABELS = {
  close_friend: "A close friend", newer_person: "Someone newer in my life",
  partner_or_date: "A partner or someone I am dating", family: "A family member",
  work_school: "Someone from work or school", other: "Someone else",
  close_person: "Someone close to me", friend: "A friend", acquaintance: "An acquaintance",
  peer: "Someone on roughly equal footing", authority: "Someone with authority here", group: "A group",
  safe_equal: "It is safe to be direct, and we have roughly equal power",
  some_power_gap: "One of us has more power here", unsafe_or_costly: "Being direct could put me at risk or cost me",
  usually_reliable: "Usually reliable", mixed: "It varies", unreliable: "Usually unreliable",
  unknown: "I do not know", recent_example: "I have a recent example",
  familiar_pattern: "I have been in this situation before", hypothetical_only: "I am mostly imagining it",
  time: "Time", energy: "Energy", money: "Money", reputation: "How others see me",
  emotional_labor: "Supporting someone emotionally", had_capacity: "I could manage it",
  stretched: "I could manage it, but it was a stretch", at_capacity: "I already had as much as I could manage",
  urgent: "It needed attention right away", soon: "It was needed soon, but not immediately",
  not_urgent: "It was not urgent", unclear: "I am not sure", free_to_share: "It was mine to share",
  partial_confidential: "Some of it was confidential", explicit_obligation: "I had a clear duty to tell them",
};

export const CONTEXT_FIELD_LABELS = {
  relationship_object: "Who is this person to you?", safety_power_status: "How safe is it to be direct?",
  counterparty_reliability: "How reliable are they usually?", experience_route: "Have you been in this situation?",
  requester_object: "Who asked?", cost_type: "What did helping cost you?", capacity_status: "What could you manage that day?",
  urgency_status: "How urgent was the request?", requester_reliability: "How reliable is this person usually?",
  target_role: "Who would be affected?", disclosure_rules: "What are you allowed or required to share?",
};
