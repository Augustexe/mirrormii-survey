// Generated from genii-personality-game-v4-authoring-packet (v4-authoring-packet-2026-09-19).
// V4 first-session personality game: no wellness/routine/clinical collection.

import { applyItemCopy, CHAPTER_COPY } from "./respondent-copy.js";

export const VERSION = "genii-personality-game-v4";
export const BANK_VERSION = "v4-authoring-packet-2026-09-19";
export const PACKET_ID = "genii-personality-game-v4-authoring-packet";
export const DIMS = {
  "desire": "Context and boundaries",
  "support_preference": "Support preferences",
  "reported_action": "Actions",
  "value": "Values",
  "decision_pattern": "Actions",
  "emotion_expression": "Emotions",
  "interpersonal_response": "Actions",
  "visible mistake recovery": "Patterns",
  "not invited response": "Actions",
  "emotion_trigger": "Emotions",
  "important delayed reply response": "Actions",
  "reply target context": "Patterns",
  "reassurance request strategy": "Patterns",
  "instruction-framed advice response": "Actions",
  "last-minute plan change": "Patterns",
  "group drift response": "Actions",
  "entitled authority request": "Patterns",
  "recent help under cost": "Actions",
  "close-friend inconvenient help": "Patterns",
  "acquaintance help contrast": "Actions",
  "favor for difficult person": "Patterns",
  "yes-with-friction condition": "Desires",
  "fun versus tomorrow cost": "Desires",
  "information-management strategy under conflict": "Patterns",
  "subtle embarrassment response": "Actions",
  "private advantage decision": "Actions",
  "private advantage audience contrast": "Actions",
  "ignored-nudge retry frequency": "Support preferences",
  "least-annoying support type": "Support preferences",
  "explicit-no and topic pause boundaries": "Support preferences",
  "heldout": "Sealed checks"
};
const AUTHORED_CHAPTERS = [
  {
    "id": 1,
    "title": "Frame and literal preferences",
    "subtitle": "Personality-game scenes with literal receipts and visible exits.",
    "kicker": "FRAME AND LITERAL PREFERENCES"
  },
  {
    "id": 2,
    "title": "Status / recognition / jealousy",
    "subtitle": "Personality-game scenes with literal receipts and visible exits.",
    "kicker": "STATUS / RECOGNITION / JEALOUSY"
  },
  {
    "id": 3,
    "title": "Embarrassment / criticism / repair",
    "subtitle": "Personality-game scenes with literal receipts and visible exits.",
    "kicker": "EMBARRASSMENT / CRITICISM / REPAIR"
  },
  {
    "id": 4,
    "title": "Exclusion / neglect / closeness",
    "subtitle": "Personality-game scenes with literal receipts and visible exits.",
    "kicker": "EXCLUSION / NEGLECT / CLOSENESS"
  },
  {
    "id": 5,
    "title": "Power / autonomy / control",
    "subtitle": "Personality-game scenes with literal receipts and visible exits.",
    "kicker": "POWER / AUTONOMY / CONTROL"
  },
  {
    "id": 6,
    "title": "Generosity / boundary / resentment",
    "subtitle": "Personality-game scenes with literal receipts and visible exits.",
    "kicker": "GENEROSITY / BOUNDARY / RESENTMENT"
  },
  {
    "id": 7,
    "title": "Desire / risk / self-protection",
    "subtitle": "Personality-game scenes with literal receipts and visible exits.",
    "kicker": "DESIRE / RISK / SELF-PROTECTION"
  },
  {
    "id": 8,
    "title": "Support preference module",
    "subtitle": "Personality-game scenes with literal receipts and visible exits.",
    "kicker": "SUPPORT PREFERENCE MODULE"
  },
  {
    "id": 9,
    "title": "Sealed checks",
    "subtitle": "Frozen prediction checks shown only after the portrait is sealed.",
    "kicker": "SEALED CHECKS"
  }
];
export const CHAPTERS = AUTHORED_CHAPTERS.map((chapter, index) => ({
  ...chapter,
  title: CHAPTER_COPY[index][0],
  subtitle: CHAPTER_COPY[index][1],
  kicker: CHAPTER_COPY[index][0].toUpperCase(),
}));
export const MEASURES = {};
const AUTHORED_QUESTIONS = [
  {
    "id": "V4-001",
    "chapter": 1,
    "title": "What kind of read should Genii try to earn for you today?",
    "setup": "low social cost; sets expectation only",
    "role": "context",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "A funny but fair roast",
        "why": "A funny but fair roast",
        "neutralMeaning": "Prefers playful pointed result framing",
        "claimLimit": "Literal result-style preference only.",
        "tags": [
          {
            "d": "desire",
            "v": "playful_roast",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "A very specific pattern read",
        "why": "A very specific pattern read",
        "neutralMeaning": "Prefers specificity over softness",
        "claimLimit": "Literal result-style preference only.",
        "tags": [
          {
            "d": "desire",
            "v": "specific_pattern",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "A useful operating manual",
        "why": "A useful operating manual",
        "neutralMeaning": "Prefers practical interpretation",
        "claimLimit": "Literal result-style preference only.",
        "tags": [
          {
            "d": "desire",
            "v": "operating_manual",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "A softer reflection",
        "why": "A softer reflection",
        "neutralMeaning": "Prefers lower-intensity wording",
        "claimLimit": "Literal result-style preference only.",
        "tags": [
          {
            "d": "desire",
            "v": "soft_reflection",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Surprise me if the evidence is clear",
        "why": "Surprise me if the evidence is clear",
        "neutralMeaning": "Permits evidence-led result framing",
        "claimLimit": "Literal result-style preference only.",
        "tags": [
          {
            "d": "desire",
            "v": "surprise_if_supported",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "skip",
        "text": "Skip this preference",
        "why": "Skip this preference",
        "exit": true,
        "meaning": "No result-style preference recorded.",
        "tags": [],
        "facts": {
          "missingness": "skip"
        }
      }
    ],
    "meta": {
      "itemId": "V4-001",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Frame and literal preferences",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "direct preference",
      "evidence": "self_report",
      "target": "self",
      "timeframe": "current preference",
      "window": "current",
      "cost": "low social cost; sets expectation only",
      "construct": "desired result style",
      "linkedEventId": "not_applicable",
      "claimLimit": "Locks preferred result style; not evidence for personality, confidence, or emotional tolerance.",
      "notEvidenceFor": [
        "toughness",
        "sensitivity",
        "social pressure response",
        "personality type",
        "future behavior"
      ],
      "sensitivityFlags": [
        "literal_preference"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-002",
    "chapter": 1,
    "title": "If Genii notices a pattern, how should it say it?",
    "setup": "low social cost; protects result tone",
    "role": "context",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Gentle and careful",
        "why": "Gentle and careful",
        "neutralMeaning": "Prefers low-intensity wording",
        "claimLimit": "Literal tone boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "gentle",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Clear and kind",
        "why": "Clear and kind",
        "neutralMeaning": "Prefers direct but warm wording",
        "claimLimit": "Literal tone boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "clear_kind",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Playful and pointed",
        "why": "Playful and pointed",
        "neutralMeaning": "Prefers humorous pointed wording",
        "claimLimit": "Literal tone boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "playful_pointed",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Ask before sensitive reads",
        "why": "Ask before sensitive reads",
        "neutralMeaning": "Requires permission before sensitive interpretation",
        "claimLimit": "Literal tone boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "permission_first",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Show receipts before commentary",
        "why": "Show receipts before commentary",
        "neutralMeaning": "Prefers evidence-first wording",
        "claimLimit": "Literal tone boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "receipts_first",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "skip",
        "text": "Skip this preference",
        "why": "Skip this preference",
        "exit": true,
        "meaning": "No tone boundary recorded.",
        "tags": [],
        "facts": {
          "missingness": "skip"
        }
      }
    ],
    "meta": {
      "itemId": "V4-002",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Frame and literal preferences",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "direct preference",
      "evidence": "self_report",
      "target": "self",
      "timeframe": "current preference",
      "window": "current",
      "cost": "low social cost; protects result tone",
      "construct": "tone boundary",
      "linkedEventId": "not_applicable",
      "claimLimit": "Locks tone boundary for rendering; not evidence for resilience, openness, or emotional stability.",
      "notEvidenceFor": [
        "resilience",
        "openness",
        "emotional stability",
        "attachment",
        "personality type"
      ],
      "sensitivityFlags": [
        "literal_preference",
        "tone_boundary"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-003",
    "chapter": 1,
    "title": "Any zones Genii should route around today?",
    "setup": "privacy cost; routing only",
    "role": "context",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "multi_select",
    "options": [
      {
        "id": "A",
        "text": "Dating or romantic situations",
        "why": "Dating or romantic situations",
        "neutralMeaning": "Avoid dating or romantic content this round",
        "claimLimit": "Routing and privacy boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "dating",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Family situations",
        "why": "Family situations",
        "neutralMeaning": "Avoid family content this round",
        "claimLimit": "Routing and privacy boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "family",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Money or spending situations",
        "why": "Money or spending situations",
        "neutralMeaning": "Avoid money or spending content this round",
        "claimLimit": "Routing and privacy boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "money",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Work or school situations",
        "why": "Work or school situations",
        "neutralMeaning": "Avoid work or school content this round",
        "claimLimit": "Routing and privacy boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "work_school",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Personal appearance topics",
        "why": "Personal appearance topics",
        "neutralMeaning": "Avoid appearance-related content this round",
        "claimLimit": "Routing and privacy boundary only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "appearance",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "No special boundary for this round",
        "why": "No special boundary for this round",
        "neutralMeaning": "No selected topic boundary",
        "claimLimit": "Absence of a boundary is not evidence for comfort in every context.",
        "tags": [
          {
            "d": "support_preference",
            "v": "none",
            "target": "self",
            "facet": "support_preference",
            "section": "context"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to set a topic boundary",
        "why": "Prefer not to set a topic boundary",
        "exit": true,
        "meaning": "No boundary recorded; still may use item-level exits.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "meta": {
      "itemId": "V4-003",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Frame and literal preferences",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "direct preference",
      "evidence": "self_report",
      "target": "self",
      "timeframe": "current boundary",
      "window": "current",
      "cost": "privacy cost; routing only",
      "construct": "off-limit topics",
      "linkedEventId": "not_applicable",
      "claimLimit": "Controls routing and privacy only; never supports a character or avoidance claim.",
      "notEvidenceFor": [
        "avoidance",
        "fear",
        "comfort",
        "disclosure style",
        "personality type"
      ],
      "sensitivityFlags": [
        "topic_boundary",
        "router"
      ],
      "followupRouting": "Select-all. Any selected boundary skips, swaps, or invalidates affected items. Never score a boundary as avoidance.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-004",
    "chapter": 1,
    "title": "What payoff are you hoping the read earns?",
    "setup": "low social cost; expectation only",
    "role": "context",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "It names a pattern I recognize",
        "why": "It names a pattern I recognize",
        "neutralMeaning": "Wants recognition of a pattern",
        "claimLimit": "Literal desired payoff only.",
        "tags": [
          {
            "d": "desire",
            "v": "recognized_pattern",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "It catches a context switch",
        "why": "It catches a context switch",
        "neutralMeaning": "Wants nuance across situations",
        "claimLimit": "Literal desired payoff only.",
        "tags": [
          {
            "d": "desire",
            "v": "context_switch",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "It predicts a few choices cleanly",
        "why": "It predicts a few choices cleanly",
        "neutralMeaning": "Wants heldout-style prediction",
        "claimLimit": "Literal desired payoff only.",
        "tags": [
          {
            "d": "desire",
            "v": "prediction_game",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "It gives me language for myself",
        "why": "It gives me language for myself",
        "neutralMeaning": "Wants usable self-description",
        "claimLimit": "Literal desired payoff only.",
        "tags": [
          {
            "d": "desire",
            "v": "self_language",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "It gives me something fun to compare",
        "why": "It gives me something fun to compare",
        "neutralMeaning": "Wants socially shareable comparison",
        "claimLimit": "Literal desired payoff only.",
        "tags": [
          {
            "d": "desire",
            "v": "compare_fun",
            "target": "self",
            "facet": "desire",
            "section": "context"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "skip",
        "text": "Skip this preference",
        "why": "Skip this preference",
        "exit": true,
        "meaning": "No finish-value preference recorded.",
        "tags": [],
        "facts": {
          "missingness": "skip"
        }
      }
    ],
    "meta": {
      "itemId": "V4-004",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Frame and literal preferences",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "direct preference",
      "evidence": "self_report",
      "target": "self",
      "timeframe": "current preference",
      "window": "current",
      "cost": "low social cost; expectation only",
      "construct": "finish value",
      "linkedEventId": "not_applicable",
      "claimLimit": "Locks preferred result payoff; not evidence that the payoff is achieved.",
      "notEvidenceFor": [
        "trait",
        "social comparison need",
        "validation need",
        "prediction performance"
      ],
      "sensitivityFlags": [
        "literal_preference"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-005",
    "chapter": 2,
    "title": "Someone gets applause for something you helped make happen. What do you do first?",
    "setup": "status cost high; relationship cost medium; visibility public",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Let the moment pass and note it for later",
        "why": "Let the moment pass and note it for later",
        "neutralMeaning": "Avoids immediate correction while retaining information",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "defer_credit_correction",
            "target": "peer or teammate",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Congratulate them, then clarify privately",
        "why": "Congratulate them, then clarify privately",
        "neutralMeaning": "Separates public goodwill from private correction",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "private_credit_correction",
            "target": "peer or teammate",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Add context in the room without making a speech",
        "why": "Add context in the room without making a speech",
        "neutralMeaning": "Publicly clarifies contribution in a contained way",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "contained_public_context",
            "target": "peer or teammate",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Make the next contribution visibly traceable",
        "why": "Make the next contribution visibly traceable",
        "neutralMeaning": "Shifts future process toward visibility",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "future_visibility",
            "target": "peer or teammate",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Put less effort into the next shared thing",
        "why": "Put less effort into the next shared thing",
        "neutralMeaning": "Reduces future investment after unfair credit",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "reduce_future_investment",
            "target": "peer or teammate",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-005",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Status / recognition / jealousy",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "peer or teammate",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "status cost high; relationship cost medium; visibility public",
      "construct": "credit response",
      "linkedEventId": "EV4-STATUS-CREDIT",
      "claimLimit": "Supports first intended action in a public credit scenario only; no humility, pettiness, or competitiveness claim without more evidence.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "social_status"
      ],
      "followupRouting": "Show V4-006 unless exit selected. Parent plus motive remain one evidence unit.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-006",
    "chapter": 2,
    "title": "What was the main thing you were protecting there?",
    "setup": "same event as V4-005; motive cost private",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Fairness of the record",
        "why": "Fairness of the record",
        "neutralMeaning": "Directly reports fairness motive",
        "claimLimit": "Motive for V4-005 only.",
        "tags": [
          {
            "d": "value",
            "v": "fair_record",
            "target": "same peer or teammate as V4-005",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Not making the room weird",
        "why": "Not making the room weird",
        "neutralMeaning": "Directly reports social-smoothness motive",
        "claimLimit": "Motive for V4-005 only.",
        "tags": [
          {
            "d": "value",
            "v": "social_smoothness",
            "target": "same peer or teammate as V4-005",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Keeping the relationship workable",
        "why": "Keeping the relationship workable",
        "neutralMeaning": "Directly reports relationship-preservation motive",
        "claimLimit": "Motive for V4-005 only.",
        "tags": [
          {
            "d": "value",
            "v": "relationship_workable",
            "target": "same peer or teammate as V4-005",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Being seen accurately",
        "why": "Being seen accurately",
        "neutralMeaning": "Directly reports recognition motive",
        "claimLimit": "Motive for V4-005 only.",
        "tags": [
          {
            "d": "value",
            "v": "accurate_visibility",
            "target": "same peer or teammate as V4-005",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Protecting future opportunity",
        "why": "Protecting future opportunity",
        "neutralMeaning": "Directly reports future-opportunity motive",
        "claimLimit": "Motive for V4-005 only.",
        "tags": [
          {
            "d": "value",
            "v": "future_opportunity",
            "target": "same peer or teammate as V4-005",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "I am not sure yet",
        "why": "I am not sure yet",
        "neutralMeaning": "Motive not specified",
        "claimLimit": "Unknown motive; no inference.",
        "tags": [
          {
            "d": "value",
            "v": "unknown",
            "target": "same peer or teammate as V4-005",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-005",
      "authored": true
    },
    "meta": {
      "itemId": "V4-006",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Status / recognition / jealousy",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "parent-bound motive",
      "evidence": "hypothetical",
      "target": "same peer or teammate as V4-005",
      "timeframe": "same scenario",
      "window": "scenario",
      "cost": "same event as V4-005; motive cost private",
      "construct": "credit motive",
      "linkedEventId": "EV4-STATUS-CREDIT",
      "claimLimit": "Direct motive for the V4-005 event only; cannot be counted as a second evidence unit.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "motive_followup"
      ],
      "followupRouting": "Hidden if V4-005 is skipped, prefer_not, or other_unscored. Same linked event as V4-005; not independent corroboration.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-007",
    "chapter": 2,
    "title": "A close person gets a win in a lane you care about. First move?",
    "setup": "status cost medium; envy risk medium; closeness cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Celebrate them in the moment",
        "why": "Celebrate them in the moment",
        "neutralMeaning": "Prioritizes outward celebration first",
        "claimLimit": "Action only; inner feeling unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "celebrate_peer_win",
            "target": "close peer in a shared arena",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Ask how they pulled it off",
        "why": "Ask how they pulled it off",
        "neutralMeaning": "Moves toward learning from their win",
        "claimLimit": "Action only; inner feeling unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "ask_method",
            "target": "close peer in a shared arena",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Take a private minute, then rejoin warmly",
        "why": "Take a private minute, then rejoin warmly",
        "neutralMeaning": "Creates private processing space before engaging",
        "claimLimit": "Action only; inner feeling unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "private_reset_then_warmth",
            "target": "close peer in a shared arena",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Get quieter until the feeling settles",
        "why": "Get quieter until the feeling settles",
        "neutralMeaning": "Reduces outward engagement while processing",
        "claimLimit": "Action only; inner feeling unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "quiet_processing",
            "target": "close peer in a shared arena",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Use it as fuel for your own next move",
        "why": "Use it as fuel for your own next move",
        "neutralMeaning": "Channels comparison into future effort",
        "claimLimit": "Action only; inner feeling unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "turn_to_fuel",
            "target": "close peer in a shared arena",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-007",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Status / recognition / jealousy",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "close peer in a shared arena",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "status cost medium; envy risk medium; closeness cost medium",
      "construct": "response to close peer win",
      "linkedEventId": "EV4-STATUS-PEER-WIN",
      "claimLimit": "Supports reported first action around a close peer win; no jealousy, envy, admiration, or generosity claim unless separately asked.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "social_status",
        "emotion_possible"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-008",
    "chapter": 2,
    "title": "Your thing shows up under someone else’s spotlight. What is your move?",
    "setup": "ownership cost high; reputation cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Name the overlap directly to them",
        "why": "Name the overlap directly to them",
        "neutralMeaning": "Addresses similarity with the person privately or directly",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "direct_overlap_callin",
            "target": "peer or acquaintance",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Differentiate your next version clearly",
        "why": "Differentiate your next version clearly",
        "neutralMeaning": "Responds by making own version more distinct",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "differentiate_next_version",
            "target": "peer or acquaintance",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Make a light comment that marks the connection",
        "why": "Make a light comment that marks the connection",
        "neutralMeaning": "Uses humor to signal prior connection",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "light_public_marker",
            "target": "peer or acquaintance",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Let it pass unless it keeps happening",
        "why": "Let it pass unless it keeps happening",
        "neutralMeaning": "Uses threshold before acting",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "threshold_before_action",
            "target": "peer or acquaintance",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Save examples in case it matters later",
        "why": "Save examples in case it matters later",
        "neutralMeaning": "Preserves evidence without immediate action",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "reported_action",
            "v": "save_examples",
            "target": "peer or acquaintance",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-008",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Status / recognition / jealousy",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "peer or acquaintance",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "ownership cost high; reputation cost medium",
      "construct": "copied idea response",
      "linkedEventId": "EV4-STATUS-COPIED",
      "claimLimit": "Supports ownership/visibility response in one scenario; not evidence of possessiveness or insecurity.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "social_status"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-009",
    "chapter": 2,
    "title": "Recent credit moment, if one comes to mind: what did you do?",
    "setup": "actual-event status cost; memory optional",
    "role": "actual",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Said nothing in the moment",
        "why": "Said nothing in the moment",
        "neutralMeaning": "Reports no immediate outward correction",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "said_nothing",
            "target": "peer, group, authority, or unspecified",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Clarified privately afterward",
        "why": "Clarified privately afterward",
        "neutralMeaning": "Reports private clarification",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "private_clarification",
            "target": "peer, group, authority, or unspecified",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Clarified in the shared space",
        "why": "Clarified in the shared space",
        "neutralMeaning": "Reports shared-space clarification",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "shared_clarification",
            "target": "peer, group, authority, or unspecified",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Changed how visible my work was after that",
        "why": "Changed how visible my work was after that",
        "neutralMeaning": "Reports future visibility adjustment",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "visibility_adjustment",
            "target": "peer, group, authority, or unspecified",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Reduced what I contributed next time",
        "why": "Reduced what I contributed next time",
        "neutralMeaning": "Reports reduced future contribution",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "reduced_contribution",
            "target": "peer, group, authority, or unspecified",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "no_recent_example",
        "text": "No recent example",
        "why": "No recent example",
        "exit": true,
        "meaning": "No recalled event; unknown, not negative evidence.",
        "tags": [],
        "facts": {
          "missingness": "no_recent_example"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / it was complicated",
        "why": "Other / it was complicated",
        "exit": true,
        "meaning": "Literal context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-009",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Status / recognition / jealousy",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "retrospective self-report",
      "evidence": "actual_event",
      "target": "peer, group, authority, or unspecified",
      "timeframe": "past 30 days",
      "window": "latest_instance_past_month",
      "cost": "actual-event status cost; memory optional",
      "construct": "recent recognition response",
      "linkedEventId": "EV4-STATUS-RECENT-CREDIT",
      "claimLimit": "One recalled event only; cannot prove usual pattern or lack of recognition need.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "actual_event",
        "optional_memory"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-010",
    "chapter": 2,
    "title": "If only one trusted person caught it, what would you do?",
    "setup": "same unfair credit; only audience visibility changes",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Still correct the record directly",
        "why": "Still correct the record directly",
        "neutralMeaning": "Maintains direct correction despite lower visibility",
        "claimLimit": "Context-shift action only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "still_direct",
            "target": "same peer or teammate as V4-005",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Talk it through with the trusted person",
        "why": "Talk it through with the trusted person",
        "neutralMeaning": "Uses trusted witness as processing channel",
        "claimLimit": "Context-shift action only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "trusted_processing",
            "target": "same peer or teammate as V4-005",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Let it go for this round",
        "why": "Let it go for this round",
        "neutralMeaning": "Drops action when visibility is lower",
        "claimLimit": "Context-shift action only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "drop_low_visibility",
            "target": "same peer or teammate as V4-005",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Use it as private motivation",
        "why": "Use it as private motivation",
        "neutralMeaning": "Turns low-visibility unfairness into future effort",
        "claimLimit": "Context-shift action only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "private_motivation",
            "target": "same peer or teammate as V4-005",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Ask that person to back me up later if needed",
        "why": "Ask that person to back me up later if needed",
        "neutralMeaning": "Uses witness for contingent support",
        "claimLimit": "Context-shift action only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "contingent_backup",
            "target": "same peer or teammate as V4-005",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-010",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Status / recognition / jealousy",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled matched contrast",
      "evidence": "hypothetical",
      "target": "same peer or teammate as V4-005",
      "timeframe": "scenario contrast",
      "window": "scenario",
      "cost": "same unfair credit; only audience visibility changes",
      "construct": "credit visibility shift",
      "linkedEventId": "EV4-STATUS-CREDIT",
      "claimLimit": "Tests visibility/audience shift against V4-005; only one field changes. Not independent of parent if interpreted as same dilemma.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "matched_contrast"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-011",
    "chapter": 3,
    "title": "You are corrected out loud after saying the thing with confidence. First move?",
    "setup": "embarrassment cost high; reputation cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Acknowledge it and keep the conversation moving",
        "why": "Acknowledge it and keep the conversation moving",
        "neutralMeaning": "Accepts correction with forward motion",
        "claimLimit": "Outward action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "acknowledge_move_on",
            "target": "group with mixed familiarity",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Ask one clarifying question",
        "why": "Ask one clarifying question",
        "neutralMeaning": "Seeks information before accepting or contesting",
        "claimLimit": "Outward action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "clarify_correction",
            "target": "group with mixed familiarity",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Explain what led you there",
        "why": "Explain what led you there",
        "neutralMeaning": "Provides context for original statement",
        "claimLimit": "Outward action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "explain_reasoning",
            "target": "group with mixed familiarity",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Go quieter and re-enter later",
        "why": "Go quieter and re-enter later",
        "neutralMeaning": "Temporarily reduces participation",
        "claimLimit": "Outward action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "quiet_reenter",
            "target": "group with mixed familiarity",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Use a small joke to reset the room",
        "why": "Use a small joke to reset the room",
        "neutralMeaning": "Uses humor to regulate public moment",
        "claimLimit": "Outward action only.",
        "tags": [
          {
            "d": "reported_action",
            "v": "joke_reset",
            "target": "group with mixed familiarity",
            "facet": "reported_action",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-011",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Embarrassment / criticism / repair",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "group with mixed familiarity",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "embarrassment cost high; reputation cost medium",
      "construct": "public correction first action",
      "linkedEventId": "EV4-EMB-CORRECTION",
      "claimLimit": "Supports outward first action only; does not prove embarrassment intensity, calmness, shame, or defensiveness.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "emotion_possible",
        "social_status"
      ],
      "followupRouting": "Show V4-012 if emotion evidence is desired and no exit selected.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-012",
    "chapter": 3,
    "title": "What was the inside/outside pairing in that moment?",
    "setup": "inside/outside display pairing only; recovery and settling condition not captured; privacy cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Inside stung; outside steady",
        "why": "Inside stung; outside steady",
        "neutralMeaning": "Reports a stung internal state with steady outward display",
        "claimLimit": "Direct inside/outside pairing for this event only; recovery unknown.",
        "tags": [
          {
            "d": "emotion_expression",
            "v": "stung_steady",
            "target": "same group as V4-011",
            "facet": "emotion_expression",
            "section": "emotion"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Inside curious; outside engaged",
        "why": "Inside curious; outside engaged",
        "neutralMeaning": "Reports curiosity with engaged outward display",
        "claimLimit": "Direct inside/outside pairing for this event only; recovery unknown.",
        "tags": [
          {
            "d": "emotion_expression",
            "v": "curious_engaged",
            "target": "same group as V4-011",
            "facet": "emotion_expression",
            "section": "emotion"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Inside blank; outside automatic",
        "why": "Inside blank; outside automatic",
        "neutralMeaning": "Reports momentary blankness with automatic outward display",
        "claimLimit": "Direct inside/outside pairing for this event only; recovery unknown.",
        "tags": [
          {
            "d": "emotion_expression",
            "v": "blank_automatic",
            "target": "same group as V4-011",
            "facet": "emotion_expression",
            "section": "emotion"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Inside irritated; outside contained",
        "why": "Inside irritated; outside contained",
        "neutralMeaning": "Reports irritation with contained outward display",
        "claimLimit": "Direct inside/outside pairing for this event only; recovery unknown.",
        "tags": [
          {
            "d": "emotion_expression",
            "v": "irritated_contained",
            "target": "same group as V4-011",
            "facet": "emotion_expression",
            "section": "emotion"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Inside fine; outside visibly fine",
        "why": "Inside fine; outside visibly fine",
        "neutralMeaning": "Reports low internal load and matching outward display",
        "claimLimit": "Direct inside/outside pairing for this event only; recovery unknown.",
        "tags": [
          {
            "d": "emotion_expression",
            "v": "fine_matching",
            "target": "same group as V4-011",
            "facet": "emotion_expression",
            "section": "emotion"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "I would not know until later",
        "why": "I would not know until later",
        "neutralMeaning": "Reports unknown immediate inside/outside pairing",
        "claimLimit": "Unknown immediate pairing; recovery unknown.",
        "tags": [
          {
            "d": "emotion_expression",
            "v": "unknown_until_later",
            "target": "same group as V4-011",
            "facet": "emotion_expression",
            "section": "emotion"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-011",
      "authored": true
    },
    "meta": {
      "itemId": "V4-012",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Embarrassment / criticism / repair",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "emotion micro-format",
      "evidence": "hypothetical",
      "target": "same group as V4-011",
      "timeframe": "same scenario",
      "window": "scenario",
      "cost": "inside/outside display pairing only; recovery and settling condition not captured; privacy cost medium",
      "construct": "inside/outside correction pairing",
      "linkedEventId": "EV4-EMB-CORRECTION",
      "claimLimit": "Directly supports only the selected same-event inside/outside pairing; recovery, settling time, and unselected feelings are unknown.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "emotion_direct",
        "motive_followup"
      ],
      "followupRouting": "Only shown after V4-011. Same event; not a second independent source. No recovery/settling inference is available from this item.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-013",
    "chapter": 3,
    "title": "A joke lands weird and someone gets quieter. Next move?",
    "setup": "closeness cost medium; reputation cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Check in with them one-on-one",
        "why": "Check in with them one-on-one",
        "neutralMeaning": "Uses private repair channel",
        "claimLimit": "Repair action only; motive unknown.",
        "tags": [
          {
            "d": "interpersonal_response",
            "v": "private_checkin",
            "target": "friend or group member",
            "facet": "interpersonal_response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Clarify intent briefly without pushing",
        "why": "Clarify intent briefly without pushing",
        "neutralMeaning": "Offers contained clarification",
        "claimLimit": "Repair action only; motive unknown.",
        "tags": [
          {
            "d": "interpersonal_response",
            "v": "brief_clarify",
            "target": "friend or group member",
            "facet": "interpersonal_response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Give space and return later",
        "why": "Give space and return later",
        "neutralMeaning": "Uses time delay before repair",
        "claimLimit": "Repair action only; motive unknown.",
        "tags": [
          {
            "d": "interpersonal_response",
            "v": "space_then_return",
            "target": "friend or group member",
            "facet": "interpersonal_response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Name it lightly in the group",
        "why": "Name it lightly in the group",
        "neutralMeaning": "Uses shared-space acknowledgement",
        "claimLimit": "Repair action only; motive unknown.",
        "tags": [
          {
            "d": "interpersonal_response",
            "v": "light_group_ack",
            "target": "friend or group member",
            "facet": "interpersonal_response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Stop joking with them for now",
        "why": "Stop joking with them for now",
        "neutralMeaning": "Changes future behavior with that person",
        "claimLimit": "Repair action only; motive unknown.",
        "tags": [
          {
            "d": "interpersonal_response",
            "v": "reduce_joking",
            "target": "friend or group member",
            "facet": "interpersonal_response",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-013",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Embarrassment / criticism / repair",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "friend or group member",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "closeness cost medium; reputation cost medium",
      "construct": "joke impact repair",
      "linkedEventId": "EV4-EMB-JOKE-IMPACT",
      "claimLimit": "Supports repair strategy for one social-impact scene; does not prove guilt, shame, kindness, or social skill.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "social_impact"
      ],
      "followupRouting": "Show V4-014 unless exit selected.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-014",
    "chapter": 3,
    "title": "What were you mainly trying to protect?",
    "setup": "same event; motive private",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Their comfort",
        "why": "Their comfort",
        "neutralMeaning": "Directly reports concern for other person comfort",
        "claimLimit": "Motive for V4-013 only.",
        "tags": [
          {
            "d": "value",
            "v": "their_comfort",
            "target": "same person as V4-013",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "My intent being understood",
        "why": "My intent being understood",
        "neutralMeaning": "Directly reports intent-clarity motive",
        "claimLimit": "Motive for V4-013 only.",
        "tags": [
          {
            "d": "value",
            "v": "intent_understood",
            "target": "same person as V4-013",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Not making it bigger",
        "why": "Not making it bigger",
        "neutralMeaning": "Directly reports containment motive",
        "claimLimit": "Motive for V4-013 only.",
        "tags": [
          {
            "d": "value",
            "v": "contain_situation",
            "target": "same person as V4-013",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "The relationship staying workable",
        "why": "The relationship staying workable",
        "neutralMeaning": "Directly reports relationship-continuity motive",
        "claimLimit": "Motive for V4-013 only.",
        "tags": [
          {
            "d": "value",
            "v": "relationship_continuity",
            "target": "same person as V4-013",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Getting time to read the room",
        "why": "Getting time to read the room",
        "neutralMeaning": "Directly reports information/time motive",
        "claimLimit": "Motive for V4-013 only.",
        "tags": [
          {
            "d": "value",
            "v": "read_room_time",
            "target": "same person as V4-013",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "I am not sure",
        "why": "I am not sure",
        "neutralMeaning": "Motive not specified",
        "claimLimit": "Unknown motive; no inference.",
        "tags": [
          {
            "d": "value",
            "v": "unknown",
            "target": "same person as V4-013",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-013",
      "authored": true
    },
    "meta": {
      "itemId": "V4-014",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Embarrassment / criticism / repair",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "parent-bound motive",
      "evidence": "hypothetical",
      "target": "same person as V4-013",
      "timeframe": "same scenario",
      "window": "scenario",
      "cost": "same event; motive private",
      "construct": "repair motive",
      "linkedEventId": "EV4-EMB-JOKE-IMPACT",
      "claimLimit": "Direct motive for V4-013 only; not independent corroboration.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "motive_followup"
      ],
      "followupRouting": "Hidden if V4-013 is skipped, prefer_not, or other_unscored. Same evidence unit as V4-013.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-015",
    "chapter": 3,
    "title": "The mistake is visible. How do you recover?",
    "setup": "reputation cost high; competence cost high",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "State the fix and execute it",
        "why": "State the fix and execute it",
        "neutralMeaning": "Moves to concrete repair",
        "claimLimit": "Recovery action only.",
        "tags": [
          {
            "d": "visible mistake recovery",
            "v": "state_fix_execute",
            "target": "group or public setting",
            "facet": "visible mistake recovery",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Take a short reset before returning",
        "why": "Take a short reset before returning",
        "neutralMeaning": "Uses brief withdrawal before re-engagement",
        "claimLimit": "Recovery action only.",
        "tags": [
          {
            "d": "visible mistake recovery",
            "v": "short_reset",
            "target": "group or public setting",
            "facet": "visible mistake recovery",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Narrate the miss plainly",
        "why": "Narrate the miss plainly",
        "neutralMeaning": "Uses transparency about the mistake",
        "claimLimit": "Recovery action only.",
        "tags": [
          {
            "d": "visible mistake recovery",
            "v": "plain_narration",
            "target": "group or public setting",
            "facet": "visible mistake recovery",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Ask for one useful handoff or check",
        "why": "Ask for one useful handoff or check",
        "neutralMeaning": "Uses help/check to recover",
        "claimLimit": "Recovery action only.",
        "tags": [
          {
            "d": "visible mistake recovery",
            "v": "ask_useful_help",
            "target": "group or public setting",
            "facet": "visible mistake recovery",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Use humor after the fix is underway",
        "why": "Use humor after the fix is underway",
        "neutralMeaning": "Uses humor only after repair starts",
        "claimLimit": "Recovery action only.",
        "tags": [
          {
            "d": "visible mistake recovery",
            "v": "humor_after_fix",
            "target": "group or public setting",
            "facet": "visible mistake recovery",
            "section": "pattern"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-015",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Embarrassment / criticism / repair",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "group or public setting",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "reputation cost high; competence cost high",
      "construct": "visible mistake recovery",
      "linkedEventId": "EV4-EMB-MISTAKE",
      "claimLimit": "Supports recovery strategy after a visible mistake; not evidence for competence, shame level, or responsibility as a global trait.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "emotion_possible",
        "social_status"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-016",
    "chapter": 3,
    "title": "If the correction comes from the person with power in the room, what shifts?",
    "setup": "same correction; only source status changes",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "I become more concise",
        "why": "I become more concise",
        "neutralMeaning": "Authority source narrows outward response",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "more_concise",
            "target": "authority versus peer",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "I ask for the standard they are using",
        "why": "I ask for the standard they are using",
        "neutralMeaning": "Authority source triggers criteria-seeking",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "ask_standard",
            "target": "authority versus peer",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "I save disagreement for later",
        "why": "I save disagreement for later",
        "neutralMeaning": "Authority source delays disagreement",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "delay_disagreement",
            "target": "authority versus peer",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "I respond about the same",
        "why": "I respond about the same",
        "neutralMeaning": "Authority source does not change selected strategy",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "no_change_authority",
            "target": "authority versus peer",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "I document the point before moving on",
        "why": "I document the point before moving on",
        "neutralMeaning": "Authority source triggers record-keeping",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "document_point",
            "target": "authority versus peer",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-016",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Embarrassment / criticism / repair",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled matched contrast",
      "evidence": "hypothetical",
      "target": "authority versus peer",
      "timeframe": "scenario contrast",
      "window": "scenario",
      "cost": "same correction; only source status changes",
      "construct": "correction source contrast",
      "linkedEventId": "EV4-EMB-CORRECTION",
      "claimLimit": "Tests source-status shift only; does not support age, status, submission, rebellion, or attachment claims.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "matched_contrast",
        "power_context"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-017",
    "chapter": 4,
    "title": "You find out they hung out without you. First move?",
    "setup": "closeness cost high; rejection ambiguity medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Ask one person directly what happened",
        "why": "Ask one person directly what happened",
        "neutralMeaning": "Uses direct information-seeking",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "not invited response",
            "v": "direct_ask",
            "target": "friend group",
            "facet": "not invited response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Make a light probe and watch the response",
        "why": "Make a light probe and watch the response",
        "neutralMeaning": "Uses indirect information-seeking",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "not invited response",
            "v": "light_probe",
            "target": "friend group",
            "facet": "not invited response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Say nothing and update my expectations",
        "why": "Say nothing and update my expectations",
        "neutralMeaning": "Internally recalibrates without asking",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "not invited response",
            "v": "recalibrate_silently",
            "target": "friend group",
            "facet": "not invited response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Step back from the group for a while",
        "why": "Step back from the group for a while",
        "neutralMeaning": "Reduces access after exclusion cue",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "not invited response",
            "v": "step_back",
            "target": "friend group",
            "facet": "not invited response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Plan something separate with people who show up",
        "why": "Plan something separate with people who show up",
        "neutralMeaning": "Redirects effort toward available ties",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "not invited response",
            "v": "redirect_to_available_ties",
            "target": "friend group",
            "facet": "not invited response",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-017",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Exclusion / neglect / closeness",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "friend group",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "closeness cost high; rejection ambiguity medium",
      "construct": "not invited response",
      "linkedEventId": "EV4-EXCL-NOT-INVITED",
      "claimLimit": "Supports first action after an ambiguous exclusion cue; no attachment, insecurity, anger, or social value claim without context fields.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "relationship_context",
        "emotion_possible"
      ],
      "followupRouting": "Show V4-018 unless exit selected. If V4-003 boundary conflicts, swap to non-sensitive group version.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-018",
    "chapter": 4,
    "title": "Before you have facts, which explanation shows up first?",
    "setup": "interpretation ambiguity; privacy cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "It was probably logistics",
        "why": "It was probably logistics",
        "neutralMeaning": "Initial interpretation is logistical",
        "claimLimit": "Direct interpretation only; not truth.",
        "tags": [
          {
            "d": "interpretation_appraisal",
            "v": "logistics",
            "target": "same friend group as V4-017",
            "facet": "interpretation_appraisal",
            "section": "appraisal"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "They may have chosen a different mix",
        "why": "They may have chosen a different mix",
        "neutralMeaning": "Initial interpretation is social composition",
        "claimLimit": "Direct interpretation only; not truth.",
        "tags": [
          {
            "d": "interpretation_appraisal",
            "v": "different_mix",
            "target": "same friend group as V4-017",
            "facet": "interpretation_appraisal",
            "section": "appraisal"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "I need more data before deciding",
        "why": "I need more data before deciding",
        "neutralMeaning": "Initial stance is uncertainty/data-seeking",
        "claimLimit": "Direct interpretation only; not truth.",
        "tags": [
          {
            "d": "interpretation_appraisal",
            "v": "need_more_data",
            "target": "same friend group as V4-017",
            "facet": "interpretation_appraisal",
            "section": "appraisal"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "This fits a pattern I have noticed",
        "why": "This fits a pattern I have noticed",
        "neutralMeaning": "Initial interpretation references prior pattern",
        "claimLimit": "Direct interpretation only; not truth.",
        "tags": [
          {
            "d": "interpretation_appraisal",
            "v": "prior_pattern",
            "target": "same friend group as V4-017",
            "facet": "interpretation_appraisal",
            "section": "appraisal"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Maybe it was not about me",
        "why": "Maybe it was not about me",
        "neutralMeaning": "Initial interpretation de-centers the self without deciding cause",
        "claimLimit": "Direct interpretation only; not truth and not felt emotion.",
        "tags": [
          {
            "d": "interpretation_appraisal",
            "v": "not_about_me",
            "target": "same friend group as V4-017",
            "facet": "interpretation_appraisal",
            "section": "appraisal"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "I am not sure",
        "why": "I am not sure",
        "neutralMeaning": "No clear interpretation reported",
        "claimLimit": "Unknown interpretation.",
        "tags": [
          {
            "d": "interpretation_appraisal",
            "v": "unknown",
            "target": "same friend group as V4-017",
            "facet": "interpretation_appraisal",
            "section": "appraisal"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-017",
      "authored": true
    },
    "meta": {
      "itemId": "V4-018",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Exclusion / neglect / closeness",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "interpretation/appraisal follow-up",
      "evidence": "hypothetical",
      "target": "same friend group as V4-017",
      "timeframe": "same scenario",
      "window": "scenario",
      "cost": "interpretation ambiguity; privacy cost medium",
      "construct": "first interpretation",
      "linkedEventId": "EV4-EXCL-NOT-INVITED",
      "claimLimit": "Directly supports reported first interpretation/appraisal only; does not establish what happened or prove fear, jealousy, relief, or other felt emotion.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "relationship_context",
        "interpretation_direct"
      ],
      "followupRouting": "Same event as V4-017; not independent corroboration.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-019",
    "chapter": 4,
    "title": "The message matters, and the reply is not coming. First move?",
    "setup": "uncertainty cost medium; closeness/status cost variable",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Follow up once with the clearest ask",
        "why": "Follow up once with the clearest ask",
        "neutralMeaning": "Uses one direct follow-up",
        "claimLimit": "Action only; target context required.",
        "tags": [
          {
            "d": "important delayed reply response",
            "v": "one_clear_followup",
            "target": "selected relationship object",
            "facet": "important delayed reply response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Check whether there is practical urgency",
        "why": "Check whether there is practical urgency",
        "neutralMeaning": "Separates urgency from meaning",
        "claimLimit": "Action only; target context required.",
        "tags": [
          {
            "d": "important delayed reply response",
            "v": "check_urgency",
            "target": "selected relationship object",
            "facet": "important delayed reply response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Wait and put attention elsewhere",
        "why": "Wait and put attention elsewhere",
        "neutralMeaning": "Delays action and redirects attention",
        "claimLimit": "Action only; target context required.",
        "tags": [
          {
            "d": "important delayed reply response",
            "v": "wait_redirect",
            "target": "selected relationship object",
            "facet": "important delayed reply response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Draft what I want to say but hold it",
        "why": "Draft what I want to say but hold it",
        "neutralMeaning": "Prepares message without sending",
        "claimLimit": "Action only; target context required.",
        "tags": [
          {
            "d": "important delayed reply response",
            "v": "draft_hold",
            "target": "selected relationship object",
            "facet": "important delayed reply response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Ask a neutral third party for context",
        "why": "Ask a neutral third party for context",
        "neutralMeaning": "Seeks context through another source",
        "claimLimit": "Action only; target context required.",
        "tags": [
          {
            "d": "important delayed reply response",
            "v": "third_party_context",
            "target": "selected relationship object",
            "facet": "important delayed reply response",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-019",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Exclusion / neglect / closeness",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "selected relationship object",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "uncertainty cost medium; closeness/status cost variable",
      "construct": "important delayed reply response",
      "linkedEventId": "EV4-EXCL-DELAYED-REPLY",
      "claimLimit": "Supports delayed-reply action only with recorded target/safety context; no attachment or neglect claim by itself.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "relationship_context",
        "safety_context"
      ],
      "followupRouting": "Requires V4-020 target/safety context before closeness claims. No attachment claim from this item alone.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-020",
    "chapter": 4,
    "title": "Who is this, broadly, without naming them?",
    "setup": "context capture; privacy cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Close friend or chosen-family person",
        "why": "Close friend or chosen-family person",
        "neutralMeaning": "Target is close non-romantic tie",
        "claimLimit": "Target scope only.",
        "tags": [
          {
            "d": "reply target context",
            "v": "close_friend",
            "target": "person from V4-019",
            "facet": "reply target context",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Dating or partner context",
        "why": "Dating or partner context",
        "neutralMeaning": "Target is romantic or dating tie",
        "claimLimit": "Target scope only; skipped if boundary selected.",
        "tags": [
          {
            "d": "reply target context",
            "v": "dating_partner",
            "target": "person from V4-019",
            "facet": "reply target context",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Family context",
        "why": "Family context",
        "neutralMeaning": "Target is family tie",
        "claimLimit": "Target scope only; skipped if boundary selected.",
        "tags": [
          {
            "d": "reply target context",
            "v": "family",
            "target": "person from V4-019",
            "facet": "reply target context",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Work, school, or authority context",
        "why": "Work, school, or authority context",
        "neutralMeaning": "Target involves authority or institutional stakes",
        "claimLimit": "Target scope only.",
        "tags": [
          {
            "d": "reply target context",
            "v": "work_school_authority",
            "target": "person from V4-019",
            "facet": "reply target context",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Newer or lower-trust person",
        "why": "Newer or lower-trust person",
        "neutralMeaning": "Target is newer or lower-trust tie",
        "claimLimit": "Target scope only.",
        "tags": [
          {
            "d": "reply target context",
            "v": "newer_low_trust",
            "target": "person from V4-019",
            "facet": "reply target context",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "Power or safety makes directness costly",
        "why": "Power or safety makes directness costly",
        "neutralMeaning": "Direct action is constrained by power/safety",
        "claimLimit": "Constraint only; no trait evidence.",
        "tags": [
          {
            "d": "reply target context",
            "v": "power_safety_constrained",
            "target": "person from V4-019",
            "facet": "reply target context",
            "section": "pattern"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to specify",
        "why": "Prefer not to specify",
        "exit": true,
        "meaning": "No target scope; restrict claims.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "not_enough_experience",
        "text": "Not enough experience with this situation",
        "why": "Not enough experience with this situation",
        "exit": true,
        "meaning": "No target evidence; unknown.",
        "tags": [],
        "facts": {
          "missingness": "not_enough_experience"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-019",
      "authored": true
    },
    "meta": {
      "itemId": "V4-020",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Exclusion / neglect / closeness",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "context field",
      "evidence": "hypothetical",
      "target": "person from V4-019",
      "timeframe": "same scenario",
      "window": "scenario",
      "cost": "context capture; privacy cost medium",
      "construct": "reply target context",
      "linkedEventId": "EV4-EXCL-DELAYED-REPLY",
      "claimLimit": "Captures target/safety context only; cannot support relationship style, fear, or avoidance.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "relationship_context",
        "safety_context"
      ],
      "followupRouting": "Shown before or immediately after V4-019. Boundary selections from V4-003 skip dating/family variants.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-021",
    "chapter": 4,
    "title": "After the context is clear, you want to check where you stand. Move?",
    "setup": "closeness/vulnerability cost plus recorded safety, power, reliability, and experience context",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Ask plainly and keep it short",
        "why": "Ask plainly and keep it short",
        "neutralMeaning": "Uses direct reassurance request",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "reassurance request strategy",
            "v": "plain_short_ask",
            "target": "recorded relationship object from context_capture before action choice",
            "facet": "reassurance request strategy",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Ask through a smaller practical question",
        "why": "Ask through a smaller practical question",
        "neutralMeaning": "Uses indirect but content-related signal",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "reassurance request strategy",
            "v": "small_practical_question",
            "target": "recorded relationship object from context_capture before action choice",
            "facet": "reassurance request strategy",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Act normal and wait for more evidence",
        "why": "Act normal and wait for more evidence",
        "neutralMeaning": "Delays reassurance-seeking",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "reassurance request strategy",
            "v": "wait_for_evidence",
            "target": "recorded relationship object from context_capture before action choice",
            "facet": "reassurance request strategy",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Get steadied by someone else first",
        "why": "Get steadied by someone else first",
        "neutralMeaning": "Seeks support from another person before asking",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "reassurance request strategy",
            "v": "external_steadying",
            "target": "recorded relationship object from context_capture before action choice",
            "facet": "reassurance request strategy",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Decide the cost is not worth it right now",
        "why": "Decide the cost is not worth it right now",
        "neutralMeaning": "Chooses not to seek reassurance in this moment",
        "claimLimit": "Action only; motive/feeling unknown.",
        "tags": [
          {
            "d": "reassurance request strategy",
            "v": "not_worth_cost_now",
            "target": "recorded relationship object from context_capture before action choice",
            "facet": "reassurance request strategy",
            "section": "pattern"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "not_enough_experience",
        "text": "Not enough experience with this situation",
        "why": "Not enough experience with this situation",
        "exit": true,
        "meaning": "No reassurance-strategy evidence; unknown.",
        "tags": [],
        "facts": {
          "missingness": "not_enough_experience"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-021",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Exclusion / neglect / closeness",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "recorded relationship object from context_capture before action choice",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "closeness/vulnerability cost plus recorded safety, power, reliability, and experience context",
      "construct": "reassurance request strategy",
      "linkedEventId": "EV4-EXCL-REASSURANCE",
      "claimLimit": "Supports reassurance strategy only within the recorded target/safety/reliability/experience context; no attachment, dependence, or avoidance claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "relationship_context",
        "emotion_possible"
      ],
      "followupRouting": "Before showing/scoring action options, record context_capture.relationship_object, safety_power_status, counterparty_reliability, and experience_route. If safety/power constrained or not_enough_experience is selected, restrict to literal action preference and block attachment/closeness claims. V4-022 may show only when a scored action and sufficient context exist.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-022",
    "chapter": 4,
    "title": "If this is a newer person instead of a close one, what shifts?",
    "setup": "same reassurance need; only relationship closeness changes",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "I still ask plainly",
        "why": "I still ask plainly",
        "neutralMeaning": "Maintains direct ask with newer person",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "still_plain_ask",
            "target": "close friend versus newer person",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "I make the ask smaller",
        "why": "I make the ask smaller",
        "neutralMeaning": "Reduces size/directness of ask",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "smaller_ask",
            "target": "close friend versus newer person",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "I wait for a clearer signal",
        "why": "I wait for a clearer signal",
        "neutralMeaning": "Delays action with lower trust",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "wait_clearer_signal",
            "target": "close friend versus newer person",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "I choose a different support source",
        "why": "I choose a different support source",
        "neutralMeaning": "Moves support-seeking elsewhere",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "different_support_source",
            "target": "close friend versus newer person",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "I drop it unless the pattern repeats",
        "why": "I drop it unless the pattern repeats",
        "neutralMeaning": "Uses repetition threshold before action",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "drop_until_repeat",
            "target": "close friend versus newer person",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "not_enough_experience",
        "text": "Not enough experience with this contrast",
        "why": "Not enough experience with this contrast",
        "exit": true,
        "meaning": "Unknown; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "not_enough_experience"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "meta": {
      "itemId": "V4-022",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Exclusion / neglect / closeness",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled matched contrast",
      "evidence": "hypothetical",
      "target": "close friend versus newer person",
      "timeframe": "scenario contrast",
      "window": "scenario",
      "cost": "same reassurance need; only relationship closeness changes",
      "construct": "reassurance closeness contrast",
      "linkedEventId": "EV4-EXCL-REASSURANCE",
      "claimLimit": "Tests closeness/trust shift only; no global attachment, neediness, or independence claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "matched_contrast",
        "relationship_context"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-023",
    "chapter": 5,
    "title": "The advice is useful, but the tone is “do this.” What happens first?",
    "setup": "autonomy cost medium; usefulness high",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Ask for the reasoning before deciding",
        "why": "Ask for the reasoning before deciding",
        "neutralMeaning": "Seeks rationale while preserving choice",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "instruction-framed advice response",
            "v": "ask_reasoning",
            "target": "peer, authority, or helper",
            "facet": "instruction-framed advice response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Use the advice but adjust it my way",
        "why": "Use the advice but adjust it my way",
        "neutralMeaning": "Accepts substance while retaining agency",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "instruction-framed advice response",
            "v": "adapt_advice",
            "target": "peer, authority, or helper",
            "facet": "instruction-framed advice response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Name that the framing is not working for me",
        "why": "Name that the framing is not working for me",
        "neutralMeaning": "Addresses tone/framing directly",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "instruction-framed advice response",
            "v": "name_framing",
            "target": "peer, authority, or helper",
            "facet": "instruction-framed advice response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Comply for now and revisit later",
        "why": "Comply for now and revisit later",
        "neutralMeaning": "Delays autonomy issue for later",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "instruction-framed advice response",
            "v": "comply_revisit",
            "target": "peer, authority, or helper",
            "facet": "instruction-framed advice response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Pause before I accidentally push back",
        "why": "Pause before I accidentally push back",
        "neutralMeaning": "Recognizes pushback impulse and delays action",
        "claimLimit": "Action only; feeling unknown.",
        "tags": [
          {
            "d": "instruction-framed advice response",
            "v": "pause_pushback",
            "target": "peer, authority, or helper",
            "facet": "instruction-framed advice response",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-023",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Power / autonomy / control",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "peer, authority, or helper",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "autonomy cost medium; usefulness high",
      "construct": "instruction-framed advice response",
      "linkedEventId": "EV4-POWER-INSTRUCTION",
      "claimLimit": "Supports response to instruction-framed advice; no maturity, stubbornness, or obedience claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "power_context"
      ],
      "followupRouting": "Show V4-024 unless exit selected.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-024",
    "chapter": 5,
    "title": "What part changed your reaction most?",
    "setup": "same event; motive privacy low",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Having a real choice",
        "why": "Having a real choice",
        "neutralMeaning": "Directly reports choice/autonomy motive",
        "claimLimit": "Motive for V4-023 only.",
        "tags": [
          {
            "d": "value",
            "v": "real_choice",
            "target": "same person as V4-023",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "The quality of the advice",
        "why": "The quality of the advice",
        "neutralMeaning": "Directly reports advice-quality motive",
        "claimLimit": "Motive for V4-023 only.",
        "tags": [
          {
            "d": "value",
            "v": "advice_quality",
            "target": "same person as V4-023",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "The timing",
        "why": "The timing",
        "neutralMeaning": "Directly reports timing motive",
        "claimLimit": "Motive for V4-023 only.",
        "tags": [
          {
            "d": "value",
            "v": "timing",
            "target": "same person as V4-023",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Not being underestimated",
        "why": "Not being underestimated",
        "neutralMeaning": "Directly reports competence/status motive",
        "claimLimit": "Motive for V4-023 only.",
        "tags": [
          {
            "d": "value",
            "v": "not_underestimated",
            "target": "same person as V4-023",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Keeping the interaction efficient",
        "why": "Keeping the interaction efficient",
        "neutralMeaning": "Directly reports efficiency motive",
        "claimLimit": "Motive for V4-023 only.",
        "tags": [
          {
            "d": "value",
            "v": "efficiency",
            "target": "same person as V4-023",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "Nothing about it bothered me much",
        "why": "Nothing about it bothered me much",
        "neutralMeaning": "Reports low friction",
        "claimLimit": "Motive for V4-023 only.",
        "tags": [
          {
            "d": "value",
            "v": "low_friction",
            "target": "same person as V4-023",
            "facet": "value",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-023",
      "authored": true
    },
    "meta": {
      "itemId": "V4-024",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Power / autonomy / control",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "parent-bound motive",
      "evidence": "hypothetical",
      "target": "same person as V4-023",
      "timeframe": "same scenario",
      "window": "scenario",
      "cost": "same event; motive privacy low",
      "construct": "instruction response motive",
      "linkedEventId": "EV4-POWER-INSTRUCTION",
      "claimLimit": "Direct motive for V4-023 only; not independent evidence.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "motive_followup"
      ],
      "followupRouting": "Hidden if V4-023 exit selected. Same evidence unit as V4-023.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-025",
    "chapter": 5,
    "title": "Your carefully built plan gets rerouted at the last minute. First move?",
    "setup": "control cost high; effort cost medium; fairness variable",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Rebuild the plan around the new facts",
        "why": "Rebuild the plan around the new facts",
        "neutralMeaning": "Moves into adaptive replanning",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "last-minute plan change",
            "v": "adaptive_replan",
            "target": "group or collaborator",
            "facet": "last-minute plan change",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "State the impact before agreeing",
        "why": "State the impact before agreeing",
        "neutralMeaning": "Makes cost visible before consent",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "last-minute plan change",
            "v": "state_impact",
            "target": "group or collaborator",
            "facet": "last-minute plan change",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Go flexible for this round",
        "why": "Go flexible for this round",
        "neutralMeaning": "Accepts change this time",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "last-minute plan change",
            "v": "flex_this_round",
            "target": "group or collaborator",
            "facet": "last-minute plan change",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Push for the original constraint that matters most",
        "why": "Push for the original constraint that matters most",
        "neutralMeaning": "Defends the key original requirement",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "last-minute plan change",
            "v": "defend_key_constraint",
            "target": "group or collaborator",
            "facet": "last-minute plan change",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Reduce my investment to my own part",
        "why": "Reduce my investment to my own part",
        "neutralMeaning": "Narrows ownership after override",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "last-minute plan change",
            "v": "narrow_ownership",
            "target": "group or collaborator",
            "facet": "last-minute plan change",
            "section": "pattern"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-025",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Power / autonomy / control",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "group or collaborator",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "control cost high; effort cost medium; fairness variable",
      "construct": "last-minute plan change",
      "linkedEventId": "EV4-POWER-PLAN-CHANGE",
      "claimLimit": "Supports response to plan override; no control-freak, flexibility, or work-ethic claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "power_context"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-026",
    "chapter": 5,
    "title": "The group is doing the group thing where nothing becomes a decision. Your move?",
    "setup": "coordination cost medium; status cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Take the lead and name a path",
        "why": "Take the lead and name a path",
        "neutralMeaning": "Moves into decisive leadership",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "group drift response",
            "v": "take_lead",
            "target": "group of peers",
            "facet": "group drift response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Ask preferences, then propose a decision",
        "why": "Ask preferences, then propose a decision",
        "neutralMeaning": "Uses consult-then-decide strategy",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "group drift response",
            "v": "consult_then_decide",
            "target": "group of peers",
            "facet": "group drift response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Wait for enough consensus",
        "why": "Wait for enough consensus",
        "neutralMeaning": "Uses consensus threshold",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "group drift response",
            "v": "wait_consensus",
            "target": "group of peers",
            "facet": "group drift response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Handle my own part clearly",
        "why": "Handle my own part clearly",
        "neutralMeaning": "Narrows responsibility to own part",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "group drift response",
            "v": "own_part",
            "target": "group of peers",
            "facet": "group drift response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Nominate the best-fit person to decide",
        "why": "Nominate the best-fit person to decide",
        "neutralMeaning": "Delegates leadership intentionally",
        "claimLimit": "Action only.",
        "tags": [
          {
            "d": "group drift response",
            "v": "nominate_decider",
            "target": "group of peers",
            "facet": "group drift response",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-026",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Power / autonomy / control",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "group of peers",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "coordination cost medium; status cost medium",
      "construct": "group drift response",
      "linkedEventId": "EV4-POWER-GROUP-DRIFT",
      "claimLimit": "Supports group decision strategy; waiting or delegating is not low leadership without context.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "group_context"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-027",
    "chapter": 5,
    "title": "Someone with power asks for extra effort like it is automatic. First move?",
    "setup": "same extra-effort request; record safety/power and capacity constraints; resource cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Do the required part and keep the record",
        "why": "Do the required part and keep the record",
        "neutralMeaning": "Power-risk branch: complies with documentation",
        "claimLimit": "Action only; may reflect power/safety constraint.",
        "tags": [
          {
            "d": "entitled authority request",
            "v": "required_part_record",
            "target": "authority figure",
            "facet": "entitled authority request",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Negotiate the scope if it is safe",
        "why": "Negotiate the scope if it is safe",
        "neutralMeaning": "Boundary branch: negotiates scope when directness is viable",
        "claimLimit": "Action only; safety/capacity may constrain.",
        "tags": [
          {
            "d": "entitled authority request",
            "v": "negotiate_scope_if_safe",
            "target": "authority figure",
            "facet": "entitled authority request",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Name my capacity and ask for priority",
        "why": "Name my capacity and ask for priority",
        "neutralMeaning": "Capacity branch: makes resource limit explicit",
        "claimLimit": "Action only; no work-ethic inference.",
        "tags": [
          {
            "d": "entitled authority request",
            "v": "name_capacity_priority",
            "target": "authority figure",
            "facet": "entitled authority request",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Push back directly if the risk is acceptable",
        "why": "Push back directly if the risk is acceptable",
        "neutralMeaning": "Direct branch: challenges request when safe enough",
        "claimLimit": "Action only; no courage/rebellion inference.",
        "tags": [
          {
            "d": "entitled authority request",
            "v": "direct_pushback_if_safe",
            "target": "authority figure",
            "facet": "entitled authority request",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Get advice or coverage before responding",
        "why": "Get advice or coverage before responding",
        "neutralMeaning": "Safety/power branch: seeks backup before action",
        "claimLimit": "Action only; feeling unknown.",
        "tags": [
          {
            "d": "entitled authority request",
            "v": "seek_coverage_first",
            "target": "authority figure",
            "facet": "entitled authority request",
            "section": "pattern"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "unsafe_to_answer",
        "text": "Too safety- or power-loaded to answer as written",
        "why": "Too safety- or power-loaded to answer as written",
        "exit": true,
        "meaning": "Safety/power constraint; no trait evidence.",
        "tags": [],
        "facts": {
          "missingness": "unsafe_to_answer"
        }
      },
      {
        "id": "capacity_not_comparable",
        "text": "My capacity would decide this, not the request style",
        "why": "My capacity would decide this, not the request style",
        "exit": true,
        "meaning": "Capacity constraint; restrict claims.",
        "tags": [],
        "facts": {
          "missingness": "capacity_not_comparable"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-027",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Power / autonomy / control",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "authority figure",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "same extra-effort request; record safety/power and capacity constraints; resource cost medium",
      "construct": "entitled authority request",
      "linkedEventId": "EV4-POWER-AUTHORITY-ASK",
      "claimLimit": "Supports first response under entitled authority request within recorded safety/power/capacity constraints; no laziness, courage, compliance, or rebellion claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "power_context",
        "safety_context"
      ],
      "followupRouting": "Show V4-028 only if the same request/cost can be held constant. Preserve any safety_power/capacity branch selected here in the contrast receipt.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-028",
    "chapter": 5,
    "title": "Same ask, same cost; only rationale and real choice are different. What shifts?",
    "setup": "exact same authority/request/cost/capacity as V4-027; only rationale and real-choice framing changes",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "I am more willing on the same terms",
        "why": "I am more willing on the same terms",
        "neutralMeaning": "Autonomy framing increases willingness while request/cost stays fixed",
        "claimLimit": "Context shift only; same request/cost.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "more_willing_same_terms",
            "target": "same authority figure as V4-027",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "I still negotiate the same scope",
        "why": "I still negotiate the same scope",
        "neutralMeaning": "Maintains scope boundary despite better framing",
        "claimLimit": "Context shift only; same request/cost.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "still_negotiate_same_scope",
            "target": "same authority figure as V4-027",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "I use the reason to prioritize capacity",
        "why": "I use the reason to prioritize capacity",
        "neutralMeaning": "Uses rationale to allocate fixed capacity",
        "claimLimit": "Context shift only; same request/cost.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "rationale_prioritize_capacity",
            "target": "same authority figure as V4-027",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "My capacity answer stays the same",
        "why": "My capacity answer stays the same",
        "neutralMeaning": "Capacity branch unchanged by better framing",
        "claimLimit": "Context shift only; same request/cost.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "capacity_answer_same",
            "target": "same authority figure as V4-027",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "My safety/power answer stays the same",
        "why": "My safety/power answer stays the same",
        "neutralMeaning": "Safety/power branch unchanged by better framing",
        "claimLimit": "Context shift only; same request/cost.",
        "tags": [
          {
            "d": "decision_pattern",
            "v": "safety_power_same",
            "target": "same authority figure as V4-027",
            "facet": "decision_pattern",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-027",
      "authored": true
    },
    "meta": {
      "itemId": "V4-028",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Power / autonomy / control",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled matched contrast",
      "evidence": "hypothetical",
      "target": "same authority figure as V4-027",
      "timeframe": "scenario contrast",
      "window": "scenario",
      "cost": "exact same authority/request/cost/capacity as V4-027; only rationale and real-choice framing changes",
      "construct": "choice-rationale contrast",
      "linkedEventId": "EV4-POWER-AUTHORITY-ASK",
      "claimLimit": "Tests autonomy-support framing only under exact matched authority/request/cost/capacity/safety conditions; not independent proof of generosity or resistance.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "capacity_context",
        "matched_contrast",
        "power_context",
        "safety_context"
      ],
      "followupRouting": "Matched contrast is valid only when authority, request, cost, capacity, and safety/power constraints are the same as V4-027; the only changed field is rationale plus real choice. Otherwise mark other_unscored.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-029",
    "chapter": 6,
    "title": "Recent favor request, if one comes to mind: what was your move?",
    "setup": "recorded cost type, capacity, urgency, safety/power, and requester reliability for one actual event",
    "role": "actual",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Helped fully",
        "why": "Helped fully",
        "neutralMeaning": "Reports full help despite cost",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "recent help under cost",
            "v": "full_help",
            "target": "recorded requester object from context_capture",
            "facet": "recent help under cost",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Helped with a clear limit",
        "why": "Helped with a clear limit",
        "neutralMeaning": "Reports bounded help",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "recent help under cost",
            "v": "bounded_help",
            "target": "recorded requester object from context_capture",
            "facet": "recent help under cost",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Redirected or rescheduled",
        "why": "Redirected or rescheduled",
        "neutralMeaning": "Reports alternate support route",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "recent help under cost",
            "v": "redirect_reschedule",
            "target": "recorded requester object from context_capture",
            "facet": "recent help under cost",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Said no clearly",
        "why": "Said no clearly",
        "neutralMeaning": "Reports direct refusal",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "recent help under cost",
            "v": "clear_no",
            "target": "recorded requester object from context_capture",
            "facet": "recent help under cost",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Avoided answering until the moment passed",
        "why": "Avoided answering until the moment passed",
        "neutralMeaning": "Reports non-response to costly ask",
        "claimLimit": "One-event action only.",
        "tags": [
          {
            "d": "recent help under cost",
            "v": "nonresponse",
            "target": "recorded requester object from context_capture",
            "facet": "recent help under cost",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "no_recent_example",
        "text": "No recent example",
        "why": "No recent example",
        "exit": true,
        "meaning": "No recalled event; unknown, not negative evidence.",
        "tags": [],
        "facts": {
          "missingness": "no_recent_example"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / it was complicated",
        "why": "Other / it was complicated",
        "exit": true,
        "meaning": "Literal context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-029",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Generosity / boundary / resentment",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "retrospective self-report",
      "evidence": "actual_event",
      "target": "recorded requester object from context_capture",
      "timeframe": "past 30 days",
      "window": "latest_instance_past_month",
      "cost": "recorded cost type, capacity, urgency, safety/power, and requester reliability for one actual event",
      "construct": "recent help under cost",
      "linkedEventId": "EV4-BOUNDARY-RECENT-HELP",
      "claimLimit": "One actual event with recorded requester/capacity/cost/safety context only; no generosity, selfishness, attachment, or reliability claim by itself.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "actual_event",
        "relationship_context",
        "capacity_context"
      ],
      "followupRouting": "Before V4-030 or any relationship/support claim, record context_capture.requester_object, cost_type, capacity_status, urgency_status, safety_power_status, and requester_reliability. If no_recent_example/prefer_not/other_unscored, suppress V4-030 and mark event unknown.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-030",
    "chapter": 6,
    "title": "What was the main factor in that favor decision?",
    "setup": "same event; motive cost private",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Care for the person",
        "why": "Care for the person",
        "neutralMeaning": "Directly reports care motive",
        "claimLimit": "Motive for V4-029 only.",
        "tags": [
          {
            "d": "value",
            "v": "care_for_person",
            "target": "same requester as V4-029",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "The principle of the ask",
        "why": "The principle of the ask",
        "neutralMeaning": "Directly reports principle/fairness motive",
        "claimLimit": "Motive for V4-029 only.",
        "tags": [
          {
            "d": "value",
            "v": "principle",
            "target": "same requester as V4-029",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "My capacity that day",
        "why": "My capacity that day",
        "neutralMeaning": "Directly reports capacity motive",
        "claimLimit": "Motive for V4-029 only.",
        "tags": [
          {
            "d": "value",
            "v": "capacity",
            "target": "same requester as V4-029",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Possible fallout if I refused",
        "why": "Possible fallout if I refused",
        "neutralMeaning": "Directly reports consequence/fallout motive",
        "claimLimit": "Motive for V4-029 only.",
        "tags": [
          {
            "d": "value",
            "v": "fear_fallout",
            "target": "same requester as V4-029",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Whether they usually show up too",
        "why": "Whether they usually show up too",
        "neutralMeaning": "Directly reports reciprocity context",
        "claimLimit": "Motive for V4-029 only.",
        "tags": [
          {
            "d": "value",
            "v": "reciprocity",
            "target": "same requester as V4-029",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "I am not sure",
        "why": "I am not sure",
        "neutralMeaning": "Motive not specified",
        "claimLimit": "Unknown motive; no inference.",
        "tags": [
          {
            "d": "value",
            "v": "unknown",
            "target": "same requester as V4-029",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-029",
      "authored": true
    },
    "meta": {
      "itemId": "V4-030",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Generosity / boundary / resentment",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "parent-bound motive",
      "evidence": "hypothetical",
      "target": "same requester as V4-029",
      "timeframe": "same past-30-day event",
      "window": "scenario",
      "cost": "same event; motive cost private",
      "construct": "help motive",
      "linkedEventId": "EV4-BOUNDARY-RECENT-HELP",
      "claimLimit": "Direct motive for V4-029 only; not independent corroboration.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "motive_followup",
        "capacity_context"
      ],
      "followupRouting": "Hidden if V4-029 is no_recent_example, prefer_not, other_unscored, or skipped. Same evidence unit.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-031",
    "chapter": 6,
    "title": "A close person needs help right when your own plan matters. Your move?",
    "setup": "same ask/cost later contrasted in V4-032; urgency, capacity, safety/power, and requester reliability are recorded or held fixed",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Pause my plan and help now",
        "why": "Pause my plan and help now",
        "neutralMeaning": "Prioritizes immediate close-person help",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "close-friend inconvenient help",
            "v": "help_now",
            "target": "close friend",
            "facet": "close-friend inconvenient help",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Split the difference with a clear limit",
        "why": "Split the difference with a clear limit",
        "neutralMeaning": "Balances help and own plan",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "close-friend inconvenient help",
            "v": "split_limit",
            "target": "close friend",
            "facet": "close-friend inconvenient help",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Ask how urgent it really is first",
        "why": "Ask how urgent it really is first",
        "neutralMeaning": "Clarifies urgency before committing",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "close-friend inconvenient help",
            "v": "ask_urgency",
            "target": "close friend",
            "facet": "close-friend inconvenient help",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Say no warmly and offer another route",
        "why": "Say no warmly and offer another route",
        "neutralMeaning": "Declines with care and alternative",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "close-friend inconvenient help",
            "v": "warm_no_route",
            "target": "close friend",
            "facet": "close-friend inconvenient help",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Make the timing or exchange explicit",
        "why": "Make the timing or exchange explicit",
        "neutralMeaning": "Makes timing/resource trade explicit",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "close-friend inconvenient help",
            "v": "explicit_time_trade",
            "target": "close friend",
            "facet": "close-friend inconvenient help",
            "section": "pattern"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-031",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Generosity / boundary / resentment",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "close friend",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "same ask/cost later contrasted in V4-032; urgency, capacity, safety/power, and requester reliability are recorded or held fixed",
      "construct": "close-friend inconvenient help",
      "linkedEventId": "EV4-BOUNDARY-CLOSE-HELP",
      "claimLimit": "Supports action in one close-friend costly-help scenario; no global loyalty or generosity claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "capacity_context",
        "relationship_context",
        "safety_context"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-032",
    "chapter": 6,
    "title": "If the same ask comes from someone less close, what shifts?",
    "setup": "exact same ask, cost, urgency, capacity, safety/power, and reliability as V4-031; only requester closeness changes",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "I still help now",
        "why": "I still help now",
        "neutralMeaning": "Maintains immediate help across lower closeness",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "acquaintance help contrast",
            "v": "help_now",
            "target": "acquaintance",
            "facet": "acquaintance help contrast",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "I set a clearer limit",
        "why": "I set a clearer limit",
        "neutralMeaning": "Increases boundary clarity with acquaintance",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "acquaintance help contrast",
            "v": "clearer_limit",
            "target": "acquaintance",
            "facet": "acquaintance help contrast",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "I ask urgency before deciding",
        "why": "I ask urgency before deciding",
        "neutralMeaning": "Maintains urgency-check strategy",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "acquaintance help contrast",
            "v": "ask_urgency",
            "target": "acquaintance",
            "facet": "acquaintance help contrast",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "I decline and offer a route",
        "why": "I decline and offer a route",
        "neutralMeaning": "Declines with alternative route",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "acquaintance help contrast",
            "v": "decline_route",
            "target": "acquaintance",
            "facet": "acquaintance help contrast",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Make the time trade explicit",
        "why": "Make the time trade explicit",
        "neutralMeaning": "Makes timing/resource trade explicit with acquaintance",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "acquaintance help contrast",
            "v": "explicit_time_trade",
            "target": "acquaintance",
            "facet": "acquaintance help contrast",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-031",
      "authored": true
    },
    "meta": {
      "itemId": "V4-032",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Generosity / boundary / resentment",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled matched contrast",
      "evidence": "hypothetical",
      "target": "acquaintance",
      "timeframe": "scenario contrast",
      "window": "scenario",
      "cost": "exact same ask, cost, urgency, capacity, safety/power, and reliability as V4-031; only requester closeness changes",
      "construct": "acquaintance help contrast",
      "linkedEventId": "EV4-BOUNDARY-CLOSE-HELP",
      "claimLimit": "Tests requester-closeness shift only under exact matched ask/cost/urgency/capacity/safety/reliability conditions; not a second independent help event.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "capacity_context",
        "matched_contrast",
        "relationship_context",
        "safety_context"
      ],
      "followupRouting": "Valid matched contrast only when V4-031 ask/cost/urgency/capacity/safety/reliability are held fixed and requester closeness changes from close friend to acquaintance.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-033",
    "chapter": 6,
    "title": "A difficult person needs help, and saying yes has upside. Move?",
    "setup": "reputation opportunity medium; dislike/friction medium; boundary cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Help, but keep the interaction contained",
        "why": "Help, but keep the interaction contained",
        "neutralMeaning": "Provides help with limits",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "favor for difficult person",
            "v": "contained_help",
            "target": "low-trust peer or difficult acquaintance",
            "facet": "favor for difficult person",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Decline without extra explanation",
        "why": "Decline without extra explanation",
        "neutralMeaning": "Refuses cleanly",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "favor for difficult person",
            "v": "clean_decline",
            "target": "low-trust peer or difficult acquaintance",
            "facet": "favor for difficult person",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Help through a neutral channel",
        "why": "Help through a neutral channel",
        "neutralMeaning": "Helps while reducing direct contact",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "favor for difficult person",
            "v": "neutral_channel_help",
            "target": "low-trust peer or difficult acquaintance",
            "facet": "favor for difficult person",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Make the terms explicit first",
        "why": "Make the terms explicit first",
        "neutralMeaning": "Conditions help on clarity/terms",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "favor for difficult person",
            "v": "explicit_terms",
            "target": "low-trust peer or difficult acquaintance",
            "facet": "favor for difficult person",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Stay cordial and keep distance",
        "why": "Stay cordial and keep distance",
        "neutralMeaning": "Maintains civility without taking favor",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "favor for difficult person",
            "v": "civil_distance",
            "target": "low-trust peer or difficult acquaintance",
            "facet": "favor for difficult person",
            "section": "pattern"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-033",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Generosity / boundary / resentment",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "low-trust peer or difficult acquaintance",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "reputation opportunity medium; dislike/friction medium; boundary cost medium",
      "construct": "favor for difficult person",
      "linkedEventId": "EV4-BOUNDARY-DIFFICULT-FAVOR",
      "claimLimit": "Supports strategy with a low-trust requester; no manipulation, generosity, or dislike intensity claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "social_status",
        "relationship_context"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-034",
    "chapter": 6,
    "title": "If a yes felt costly lately, what made it costly?",
    "setup": "privacy cost medium; conflict/capacity cost variable",
    "role": "actual",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "The ask was bigger than it sounded",
        "why": "The ask was bigger than it sounded",
        "neutralMeaning": "Cost came from unclear ask size",
        "claimLimit": "Direct friction report only.",
        "tags": [
          {
            "d": "yes-with-friction condition",
            "v": "ask_bigger_than_sounded",
            "target": "self with recent or usual pattern",
            "facet": "yes-with-friction condition",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "I had less capacity than they knew",
        "why": "I had less capacity than they knew",
        "neutralMeaning": "Cost came from capacity mismatch",
        "claimLimit": "Direct friction report only.",
        "tags": [
          {
            "d": "yes-with-friction condition",
            "v": "capacity_mismatch",
            "target": "self with recent or usual pattern",
            "facet": "yes-with-friction condition",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "The timing was the problem",
        "why": "The timing was the problem",
        "neutralMeaning": "Cost came from timing",
        "claimLimit": "Direct friction report only.",
        "tags": [
          {
            "d": "yes-with-friction condition",
            "v": "timing_problem",
            "target": "self with recent or usual pattern",
            "facet": "yes-with-friction condition",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "The requester mattered",
        "why": "The requester mattered",
        "neutralMeaning": "Cost depended on requester relationship/history",
        "claimLimit": "Direct friction report only.",
        "tags": [
          {
            "d": "yes-with-friction condition",
            "v": "requester_mattered",
            "target": "self with recent or usual pattern",
            "facet": "yes-with-friction condition",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "I wanted the effort noticed",
        "why": "I wanted the effort noticed",
        "neutralMeaning": "Cost included recognition/acknowledgment",
        "claimLimit": "Direct friction report only.",
        "tags": [
          {
            "d": "yes-with-friction condition",
            "v": "wanted_noticed",
            "target": "self with recent or usual pattern",
            "facet": "yes-with-friction condition",
            "section": "desire"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "no_recent_example",
        "text": "No recent example",
        "why": "No recent example",
        "exit": true,
        "meaning": "No recent yes-with-friction event; unknown, not negative evidence.",
        "tags": [],
        "facts": {
          "missingness": "no_recent_example"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / complicated",
        "why": "Other / complicated",
        "exit": true,
        "meaning": "Literal context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-034",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Generosity / boundary / resentment",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "retrospective self-report",
      "evidence": "actual_event",
      "target": "self with recent or usual pattern",
      "timeframe": "past 30 days or current self-report",
      "window": "latest_instance_past_month",
      "cost": "privacy cost medium; conflict/capacity cost variable",
      "construct": "yes-with-friction condition",
      "linkedEventId": "EV4-BOUNDARY-YES-FRICTION",
      "claimLimit": "Directly reports possible friction source; does not prove resentment, martyrdom, or relationship style.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "actual_event",
        "capacity_context"
      ],
      "followupRouting": "If no_recent_example is selected, record unknown/no event and do not score friction options.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-035",
    "chapter": 7,
    "title": "Tonight has a tempting option; tomorrow still has receipts. Move?",
    "setup": "future obligation cost medium; pleasure/social pull medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Take the fun option fully",
        "why": "Take the fun option fully",
        "neutralMeaning": "Chooses immediate reward despite future cost",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "fun versus tomorrow cost",
            "v": "take_fun_fully",
            "target": "self, optional social context",
            "facet": "fun versus tomorrow cost",
            "section": "desire"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Choose a smaller version",
        "why": "Choose a smaller version",
        "neutralMeaning": "Modifies reward to reduce future cost",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "fun versus tomorrow cost",
            "v": "smaller_version",
            "target": "self, optional social context",
            "facet": "fun versus tomorrow cost",
            "section": "desire"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Delay the reward until after the obligation",
        "why": "Delay the reward until after the obligation",
        "neutralMeaning": "Prioritizes future obligation first",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "fun versus tomorrow cost",
            "v": "delay_reward",
            "target": "self, optional social context",
            "facet": "fun versus tomorrow cost",
            "section": "desire"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Ask someone to help me stick to the plan",
        "why": "Ask someone to help me stick to the plan",
        "neutralMeaning": "Uses external accountability",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "fun versus tomorrow cost",
            "v": "ask_accountability",
            "target": "self, optional social context",
            "facet": "fun versus tomorrow cost",
            "section": "desire"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Decide based on who is involved",
        "why": "Decide based on who is involved",
        "neutralMeaning": "Social context determines choice",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "fun versus tomorrow cost",
            "v": "depends_people",
            "target": "self, optional social context",
            "facet": "fun versus tomorrow cost",
            "section": "desire"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-035",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Desire / risk / self-protection",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "self, optional social context",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "future obligation cost medium; pleasure/social pull medium",
      "construct": "fun versus tomorrow cost",
      "linkedEventId": "EV4-DESIRE-FUTURE-COST",
      "claimLimit": "Supports action in one non-health future-cost scenario; no discipline, impulsivity, or self-control trait claim alone.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "future_cost",
        "non_health_cost"
      ],
      "followupRouting": "Show V4-036 unless exit selected.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-036",
    "chapter": 7,
    "title": "What is the hook in the tempting option?",
    "setup": "same event; motive private",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "It makes a better story",
        "why": "It makes a better story",
        "neutralMeaning": "Directly reports story value motive",
        "claimLimit": "Motive for V4-035 only.",
        "tags": [
          {
            "d": "value",
            "v": "story_value",
            "target": "same context as V4-035",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "It gives immediate relief",
        "why": "It gives immediate relief",
        "neutralMeaning": "Directly reports relief motive",
        "claimLimit": "Motive for V4-035 only.",
        "tags": [
          {
            "d": "value",
            "v": "relief",
            "target": "same context as V4-035",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "It feels like choosing for myself",
        "why": "It feels like choosing for myself",
        "neutralMeaning": "Directly reports autonomy/rebellion motive",
        "claimLimit": "Motive for V4-035 only.",
        "tags": [
          {
            "d": "value",
            "v": "choosing_for_self",
            "target": "same context as V4-035",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "The people involved pull me in",
        "why": "The people involved pull me in",
        "neutralMeaning": "Directly reports social pull motive",
        "claimLimit": "Motive for V4-035 only.",
        "tags": [
          {
            "d": "value",
            "v": "social_pull",
            "target": "same context as V4-035",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "The chance feels rare",
        "why": "The chance feels rare",
        "neutralMeaning": "Directly reports scarcity motive",
        "claimLimit": "Motive for V4-035 only.",
        "tags": [
          {
            "d": "value",
            "v": "scarcity",
            "target": "same context as V4-035",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "I am not sure",
        "why": "I am not sure",
        "neutralMeaning": "Motive not specified",
        "claimLimit": "Unknown motive; no inference.",
        "tags": [
          {
            "d": "value",
            "v": "unknown",
            "target": "same context as V4-035",
            "facet": "value",
            "section": "value"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-035",
      "authored": true
    },
    "meta": {
      "itemId": "V4-036",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Desire / risk / self-protection",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "parent-bound motive",
      "evidence": "hypothetical",
      "target": "same context as V4-035",
      "timeframe": "same scenario",
      "window": "scenario",
      "cost": "same event; motive private",
      "construct": "temptation motive",
      "linkedEventId": "EV4-DESIRE-FUTURE-COST",
      "claimLimit": "Direct motive for V4-035 only; not enough for sensation-seeking or positive-urgency trait.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "motive_followup"
      ],
      "followupRouting": "Hidden if V4-035 exit selected. Same evidence unit.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-037",
    "chapter": 7,
    "title": "There is a conflict cost around what to share. First move?",
    "setup": "conflict/trust cost plus recorded target, safety, power, and disclosure obligation context",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Share the relevant part with context",
        "why": "Share the relevant part with context",
        "neutralMeaning": "Information-management strategy: relevant disclosure plus context",
        "claimLimit": "Action only; safety/target context required.",
        "tags": [
          {
            "d": "information-management strategy under conflict",
            "v": "relevant_with_context",
            "target": "recorded target context: peer, close person, authority, or safety/power constrained",
            "facet": "information-management strategy under conflict",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "State what I can share and what I cannot",
        "why": "State what I can share and what I cannot",
        "neutralMeaning": "Information-management strategy: explicit disclosure boundary",
        "claimLimit": "Action only; safety/target context required.",
        "tags": [
          {
            "d": "information-management strategy under conflict",
            "v": "share_boundary",
            "target": "recorded target context: peer, close person, authority, or safety/power constrained",
            "facet": "information-management strategy under conflict",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Delay until there is a safer channel",
        "why": "Delay until there is a safer channel",
        "neutralMeaning": "Information-management strategy: timing/channel management",
        "claimLimit": "Action only; safety/target context required.",
        "tags": [
          {
            "d": "information-management strategy under conflict",
            "v": "delay_safer_channel",
            "target": "recorded target context: peer, close person, authority, or safety/power constrained",
            "facet": "information-management strategy under conflict",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Answer the exact question and invite follow-up",
        "why": "Answer the exact question and invite follow-up",
        "neutralMeaning": "Information-management strategy: narrow answer with follow-up path",
        "claimLimit": "Action only; safety/target context required.",
        "tags": [
          {
            "d": "information-management strategy under conflict",
            "v": "exact_question_followup",
            "target": "recorded target context: peer, close person, authority, or safety/power constrained",
            "facet": "information-management strategy under conflict",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Check with an appropriate safer person first",
        "why": "Check with an appropriate safer person first",
        "neutralMeaning": "Information-management strategy: consult before disclosure",
        "claimLimit": "Action only; safety/target context required.",
        "tags": [
          {
            "d": "information-management strategy under conflict",
            "v": "consult_safer_person",
            "target": "recorded target context: peer, close person, authority, or safety/power constrained",
            "facet": "information-management strategy under conflict",
            "section": "pattern"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-037",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Desire / risk / self-protection",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "recorded target context: peer, close person, authority, or safety/power constrained",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "conflict/trust cost plus recorded target, safety, power, and disclosure obligation context",
      "construct": "information-management strategy under conflict",
      "linkedEventId": "EV4-DESIRE-TRUTH",
      "claimLimit": "Supports information-management strategy in one recorded conflict context; no global honesty, deception, courage, avoidance, or moral claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "truth_context",
        "safety_context"
      ],
      "followupRouting": "Record context_capture.target_role, safety_power_status, and disclosure_rules before scoring. If safety/power constrained, restrict to literal information-management strategy and block honesty/deception/courage claims.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-038",
    "chapter": 7,
    "title": "They make you look a little bad without fully saying it. Move?",
    "setup": "reputation cost medium; conflict cost medium",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Name it directly after the moment",
        "why": "Name it directly after the moment",
        "neutralMeaning": "Addresses it directly but not mid-moment",
        "claimLimit": "Action only; emotion unknown.",
        "tags": [
          {
            "d": "subtle embarrassment response",
            "v": "direct_after",
            "target": "peer or group member",
            "facet": "subtle embarrassment response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Reduce warmth toward them",
        "why": "Reduce warmth toward them",
        "neutralMeaning": "Changes access/affect toward person",
        "claimLimit": "Action only; emotion unknown.",
        "tags": [
          {
            "d": "subtle embarrassment response",
            "v": "reduce_warmth",
            "target": "peer or group member",
            "facet": "subtle embarrassment response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Perform better and move on",
        "why": "Perform better and move on",
        "neutralMeaning": "Responds through competence/status",
        "claimLimit": "Action only; emotion unknown.",
        "tags": [
          {
            "d": "subtle embarrassment response",
            "v": "outperform_move_on",
            "target": "peer or group member",
            "facet": "subtle embarrassment response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Return a light comment in the moment",
        "why": "Return a light comment in the moment",
        "neutralMeaning": "Uses contained public counter-comment",
        "claimLimit": "Action only; emotion unknown.",
        "tags": [
          {
            "d": "subtle embarrassment response",
            "v": "light_counter",
            "target": "peer or group member",
            "facet": "subtle embarrassment response",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Save the pattern in case it repeats",
        "why": "Save the pattern in case it repeats",
        "neutralMeaning": "Tracks pattern without immediate response",
        "claimLimit": "Action only; emotion unknown.",
        "tags": [
          {
            "d": "subtle embarrassment response",
            "v": "track_pattern",
            "target": "peer or group member",
            "facet": "subtle embarrassment response",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-038",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Desire / risk / self-protection",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "peer or group member",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "reputation cost medium; conflict cost medium",
      "construct": "subtle embarrassment response",
      "linkedEventId": "EV4-DESIRE-SUBTLE-EMBARRASSMENT",
      "claimLimit": "Supports self-protection response to subtle embarrassment; no revengefulness, forgiveness, anger, or cruelty claim.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "emotion_possible",
        "social_status"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-039",
    "chapter": 7,
    "title": "Tiny scheduling/admin edge, rules not fully clear, no audience. Move?",
    "setup": "low-stakes scheduling/admin advantage; rules are stated as ambiguous-but-non-sensitive; no money/body/sex/health domain",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Use it if a quick rule check says it is allowed",
        "why": "Use it if a quick rule check says it is allowed",
        "neutralMeaning": "Uses advantage after confirming permissibility",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "private advantage decision",
            "v": "use_after_rule_check",
            "target": "self versus absent group in a non-sensitive scheduling/admin domain",
            "facet": "private advantage decision",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Share the edge with the relevant group",
        "why": "Share the edge with the relevant group",
        "neutralMeaning": "Makes the advantage visible to affected people",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "private advantage decision",
            "v": "share_with_group",
            "target": "self versus absent group in a non-sensitive scheduling/admin domain",
            "facet": "private advantage decision",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Pass on it unless the rule is clearly allowed",
        "why": "Pass on it unless the rule is clearly allowed",
        "neutralMeaning": "Declines when rules remain ambiguous",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "private advantage decision",
            "v": "pass_if_ambiguous",
            "target": "self versus absent group in a non-sensitive scheduling/admin domain",
            "facet": "private advantage decision",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Use it once and record why",
        "why": "Use it once and record why",
        "neutralMeaning": "Uses advantage with traceable rationale and later review",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "private advantage decision",
            "v": "use_once_record_why",
            "target": "self versus absent group in a non-sensitive scheduling/admin domain",
            "facet": "private advantage decision",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Ask the responsible person how to handle it",
        "why": "Ask the responsible person how to handle it",
        "neutralMeaning": "Escalates ambiguous rule to responsible person",
        "claimLimit": "Action only; motive unknown.",
        "tags": [
          {
            "d": "private advantage decision",
            "v": "ask_responsible_person",
            "target": "self versus absent group in a non-sensitive scheduling/admin domain",
            "facet": "private advantage decision",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-039",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Desire / risk / self-protection",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled scenario",
      "evidence": "hypothetical",
      "target": "self versus absent group in a non-sensitive scheduling/admin domain",
      "timeframe": "scenario",
      "window": "scenario",
      "cost": "low-stakes scheduling/admin advantage; rules are stated as ambiguous-but-non-sensitive; no money/body/sex/health domain",
      "construct": "private advantage decision",
      "linkedEventId": "EV4-DESIRE-PRIVATE-ADVANTAGE",
      "claimLimit": "Supports bounded non-sensitive private-advantage strategy only; no greed, honesty, shame, spending, sex, appearance, law-breaking, or moral inference.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "private_advantage",
        "non_sensitive"
      ],
      "followupRouting": "Domain is fixed to non-sensitive scheduling/admin advantage. If the example drifts into money spending, body, health, sex, shame, or illegal/rule-breaking content, use other_unscored and do not score.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-040",
    "chapter": 7,
    "title": "Same tiny admin edge, same rules; only respected people can see the move. What shifts?",
    "setup": "exact same domain, advantage, rule ambiguity, and stakes as V4-039; only trusted audience visibility changes",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "I make the same choice",
        "why": "I make the same choice",
        "neutralMeaning": "Audience does not change stated action",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "private advantage audience contrast",
            "v": "same_choice",
            "target": "same non-sensitive scheduling/admin advantage as V4-039",
            "facet": "private advantage audience contrast",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "I become more careful about the rule",
        "why": "I become more careful about the rule",
        "neutralMeaning": "Audience increases rule-checking",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "private advantage audience contrast",
            "v": "more_rule_care",
            "target": "same non-sensitive scheduling/admin advantage as V4-039",
            "facet": "private advantage audience contrast",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "I disclose it sooner",
        "why": "I disclose it sooner",
        "neutralMeaning": "Audience increases disclosure",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "private advantage audience contrast",
            "v": "disclose_sooner",
            "target": "same non-sensitive scheduling/admin advantage as V4-039",
            "facet": "private advantage audience contrast",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "I avoid it even if allowed",
        "why": "I avoid it even if allowed",
        "neutralMeaning": "Audience changes action toward avoidance",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "private advantage audience contrast",
            "v": "avoid_if_seen",
            "target": "same non-sensitive scheduling/admin advantage as V4-039",
            "facet": "private advantage audience contrast",
            "section": "action"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "I explain my reasoning before acting",
        "why": "I explain my reasoning before acting",
        "neutralMeaning": "Audience adds explanation step",
        "claimLimit": "Context shift only.",
        "tags": [
          {
            "d": "private advantage audience contrast",
            "v": "explain_reasoning",
            "target": "same non-sensitive scheduling/admin advantage as V4-039",
            "facet": "private advantage audience contrast",
            "section": "action"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "dependsOn": {
      "questionId": "V4-039",
      "authored": true
    },
    "meta": {
      "itemId": "V4-040",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Desire / risk / self-protection",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "controlled matched contrast",
      "evidence": "hypothetical",
      "target": "same non-sensitive scheduling/admin advantage as V4-039",
      "timeframe": "scenario contrast",
      "window": "scenario",
      "cost": "exact same domain, advantage, rule ambiguity, and stakes as V4-039; only trusted audience visibility changes",
      "construct": "private advantage audience contrast",
      "linkedEventId": "EV4-DESIRE-PRIVATE-ADVANTAGE",
      "claimLimit": "Tests trusted-audience visibility shift only under exact matched V4-039 domain/rules/stakes; not independent proof of integrity or image management.",
      "notEvidenceFor": [
        "formal personality type",
        "clinical or diagnostic state",
        "moral worth",
        "hidden motive",
        "hidden emotion",
        "future certainty"
      ],
      "sensitivityFlags": [
        "matched_contrast",
        "audience_effect"
      ],
      "followupRouting": "Matched contrast is valid only if domain, rule ambiguity, advantage size, and stakes exactly match V4-039; only trusted/respected audience visibility changes.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-041",
    "chapter": 8,
    "title": "When Genii has a read, what delivery style is least annoying?",
    "setup": "low cost; operating instruction only",
    "role": "context",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Say it directly",
        "why": "Say it directly",
        "neutralMeaning": "Prefers direct pattern statement",
        "claimLimit": "Literal operating preference only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "direct",
            "target": "Genii-to-user",
            "facet": "support_preference",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Soften it first",
        "why": "Soften it first",
        "neutralMeaning": "Prefers gentler entry",
        "claimLimit": "Literal operating preference only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "gentle_entry",
            "target": "Genii-to-user",
            "facet": "support_preference",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Make it playful",
        "why": "Make it playful",
        "neutralMeaning": "Prefers playful framing",
        "claimLimit": "Literal operating preference only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "playful",
            "target": "Genii-to-user",
            "facet": "support_preference",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Ask before going deep",
        "why": "Ask before going deep",
        "neutralMeaning": "Prefers permission before depth",
        "claimLimit": "Literal operating preference only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "permission_first",
            "target": "Genii-to-user",
            "facet": "support_preference",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Show receipts first",
        "why": "Show receipts first",
        "neutralMeaning": "Prefers evidence before commentary",
        "claimLimit": "Literal operating preference only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "receipts_first",
            "target": "Genii-to-user",
            "facet": "support_preference",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "Do not comment unless I ask",
        "why": "Do not comment unless I ask",
        "neutralMeaning": "Prefers no unsolicited commentary",
        "claimLimit": "Literal operating preference only.",
        "tags": [
          {
            "d": "support_preference",
            "v": "only_if_asked",
            "target": "Genii-to-user",
            "facet": "support_preference",
            "section": "support"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-041",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Support preference module",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "direct preference",
      "evidence": "self_report",
      "target": "Genii-to-user",
      "timeframe": "current preference",
      "window": "current",
      "cost": "low cost; operating instruction only",
      "construct": "pattern commentary style",
      "linkedEventId": "not_applicable",
      "claimLimit": "Literal support preference only; cannot imply dependence, avoidance, resilience, or personality type.",
      "notEvidenceFor": [
        "personality trait",
        "dependence",
        "avoidance",
        "emotional stability",
        "discipline"
      ],
      "sensitivityFlags": [
        "literal_preference",
        "support_literal"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-042",
    "chapter": 8,
    "title": "If Genii nudges and you do not bite, what retry count is right?",
    "setup": "low cost; operating instruction only",
    "role": "context",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Do not retry",
        "why": "Do not retry",
        "neutralMeaning": "Prefers zero retries after ignore",
        "claimLimit": "Literal ignored-nudge retry frequency only.",
        "tags": [
          {
            "d": "ignored-nudge retry frequency",
            "v": "zero",
            "target": "Genii-to-user",
            "facet": "ignored-nudge retry frequency",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Retry once later",
        "why": "Retry once later",
        "neutralMeaning": "Prefers one later retry",
        "claimLimit": "Literal ignored-nudge retry frequency only.",
        "tags": [
          {
            "d": "ignored-nudge retry frequency",
            "v": "one_later",
            "target": "Genii-to-user",
            "facet": "ignored-nudge retry frequency",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Retry twice, then stop",
        "why": "Retry twice, then stop",
        "neutralMeaning": "Prefers two retries before stopping",
        "claimLimit": "Literal ignored-nudge retry frequency only.",
        "tags": [
          {
            "d": "ignored-nudge retry frequency",
            "v": "two_then_stop",
            "target": "Genii-to-user",
            "facet": "ignored-nudge retry frequency",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Retry at the next clearly relevant moment only",
        "why": "Retry at the next clearly relevant moment only",
        "neutralMeaning": "Prefers one context-triggered retry",
        "claimLimit": "Literal ignored-nudge retry frequency only.",
        "tags": [
          {
            "d": "ignored-nudge retry frequency",
            "v": "next_relevant_only",
            "target": "Genii-to-user",
            "facet": "ignored-nudge retry frequency",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Ask me to set the retry count",
        "why": "Ask me to set the retry count",
        "neutralMeaning": "Prefers explicit user-set frequency",
        "claimLimit": "Literal ignored-nudge retry frequency only.",
        "tags": [
          {
            "d": "ignored-nudge retry frequency",
            "v": "user_sets_count",
            "target": "Genii-to-user",
            "facet": "ignored-nudge retry frequency",
            "section": "support"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-042",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Support preference module",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "direct preference",
      "evidence": "self_report",
      "target": "Genii-to-user",
      "timeframe": "current preference",
      "window": "current",
      "cost": "low cost; operating instruction only",
      "construct": "ignored-nudge retry frequency",
      "linkedEventId": "not_applicable",
      "claimLimit": "Literal ignored-nudge retry frequency only; no inference about conscientiousness, motivation, avoidance, or support need.",
      "notEvidenceFor": [
        "conscientiousness",
        "motivation level",
        "avoidance",
        "support need",
        "personality type"
      ],
      "sensitivityFlags": [
        "literal_preference",
        "support_literal"
      ],
      "followupRouting": "This item records ignored-nudge retry frequency only. Explicit no and topic boundaries in V4-044 override any retry count.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-043",
    "chapter": 8,
    "title": "If you are stuck, what kind of help should Genii try first?",
    "setup": "low cost; operating instruction only",
    "role": "context",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Name the pattern",
        "why": "Name the pattern",
        "neutralMeaning": "Prefers pattern labeling",
        "claimLimit": "Literal support preference only.",
        "tags": [
          {
            "d": "least-annoying support type",
            "v": "name_pattern",
            "target": "Genii-to-user",
            "facet": "least-annoying support type",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Give me options",
        "why": "Give me options",
        "neutralMeaning": "Prefers option set",
        "claimLimit": "Literal support preference only.",
        "tags": [
          {
            "d": "least-annoying support type",
            "v": "options",
            "target": "Genii-to-user",
            "facet": "least-annoying support type",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Make one recommendation",
        "why": "Make one recommendation",
        "neutralMeaning": "Prefers single recommendation",
        "claimLimit": "Literal support preference only.",
        "tags": [
          {
            "d": "least-annoying support type",
            "v": "recommendation",
            "target": "Genii-to-user",
            "facet": "least-annoying support type",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Draft the message or script",
        "why": "Draft the message or script",
        "neutralMeaning": "Prefers script assistance",
        "claimLimit": "Literal support preference only.",
        "tags": [
          {
            "d": "least-annoying support type",
            "v": "script",
            "target": "Genii-to-user",
            "facet": "least-annoying support type",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Make it funny first",
        "why": "Make it funny first",
        "neutralMeaning": "Prefers humor entry",
        "claimLimit": "Literal support preference only.",
        "tags": [
          {
            "d": "least-annoying support type",
            "v": "humor_entry",
            "target": "Genii-to-user",
            "facet": "least-annoying support type",
            "section": "support"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "Hands off unless I ask",
        "why": "Hands off unless I ask",
        "neutralMeaning": "Prefers user-initiated support",
        "claimLimit": "Literal support preference only.",
        "tags": [
          {
            "d": "least-annoying support type",
            "v": "hands_off",
            "target": "Genii-to-user",
            "facet": "least-annoying support type",
            "section": "support"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary or privacy choice; no profile evidence.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other / depends",
        "why": "Other / depends",
        "exit": true,
        "meaning": "Literal custom context only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-043",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Support preference module",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "direct preference",
      "evidence": "self_report",
      "target": "Genii-to-user",
      "timeframe": "current preference",
      "window": "current",
      "cost": "low cost; operating instruction only",
      "construct": "least-annoying support type",
      "linkedEventId": "not_applicable",
      "claimLimit": "Literal support type preference only; not evidence for capability, avoidance, or personality.",
      "notEvidenceFor": [
        "capability",
        "avoidance",
        "independence",
        "dependence",
        "personality type"
      ],
      "sensitivityFlags": [
        "literal_preference",
        "support_literal"
      ],
      "followupRouting": "none",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-044",
    "chapter": 8,
    "title": "Where is the literal stop-or-ask-first line?",
    "setup": "privacy and autonomy cost; operating instruction only",
    "role": "hypothetical",
    "kind": "profile_support",
    "test": false,
    "responseFormat": "multi_select",
    "options": [
      {
        "id": "A",
        "text": "When I say no once",
        "why": "When I say no once",
        "neutralMeaning": "Explicit no stops persistence",
        "claimLimit": "Literal explicit-no boundary only.",
        "tags": [
          {
            "d": "explicit-no and topic pause boundaries",
            "v": "explicit_no_once",
            "target": "Genii-to-user",
            "facet": "explicit-no and topic pause boundaries",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Dating or conflict topics",
        "why": "Dating or conflict topics",
        "neutralMeaning": "Pause/ask-first around dating or conflict topics",
        "claimLimit": "Literal topic boundary only.",
        "tags": [
          {
            "d": "explicit-no and topic pause boundaries",
            "v": "dating_conflict",
            "target": "Genii-to-user",
            "facet": "explicit-no and topic pause boundaries",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Family topics",
        "why": "Family topics",
        "neutralMeaning": "Pause/ask-first around family topics",
        "claimLimit": "Literal topic boundary only.",
        "tags": [
          {
            "d": "explicit-no and topic pause boundaries",
            "v": "family",
            "target": "Genii-to-user",
            "facet": "explicit-no and topic pause boundaries",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Money, work, or school stakes",
        "why": "Money, work, or school stakes",
        "neutralMeaning": "Pause/ask-first around money/work/school stakes",
        "claimLimit": "Literal topic boundary only.",
        "tags": [
          {
            "d": "explicit-no and topic pause boundaries",
            "v": "money_work_school",
            "target": "Genii-to-user",
            "facet": "explicit-no and topic pause boundaries",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Public embarrassment moments",
        "why": "Public embarrassment moments",
        "neutralMeaning": "Pause/ask-first around public embarrassment topics",
        "claimLimit": "Literal topic boundary only.",
        "tags": [
          {
            "d": "explicit-no and topic pause boundaries",
            "v": "public_embarrassment",
            "target": "Genii-to-user",
            "facet": "explicit-no and topic pause boundaries",
            "section": "pattern"
          }
        ],
        "reaction": null
      },
      {
        "id": "F",
        "text": "Before any sensitive inference",
        "why": "Before any sensitive inference",
        "neutralMeaning": "Ask permission before sensitive interpretation",
        "claimLimit": "Literal inference-permission boundary only.",
        "tags": [
          {
            "d": "explicit-no and topic pause boundaries",
            "v": "sensitive_inference_permission",
            "target": "Genii-to-user",
            "facet": "explicit-no and topic pause boundaries",
            "section": "support"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "prefer_not",
        "text": "Prefer not to set this boundary",
        "why": "Prefer not to set this boundary",
        "exit": true,
        "meaning": "No extra pause boundary recorded; item-level exits still apply.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      },
      {
        "id": "other_unscored",
        "text": "Other boundary / custom wording",
        "why": "Other boundary / custom wording",
        "exit": true,
        "meaning": "Literal boundary text only; unscored by default.",
        "tags": [],
        "facts": {
          "missingness": "other_unscored"
        }
      }
    ],
    "meta": {
      "itemId": "V4-044",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Support preference module",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "direct boundary",
      "evidence": "hypothetical",
      "target": "Genii-to-user",
      "timeframe": "current boundary",
      "window": "current",
      "cost": "privacy and autonomy cost; operating instruction only",
      "construct": "explicit-no and topic pause boundaries",
      "linkedEventId": "not_applicable",
      "claimLimit": "Literal explicit-no/topic/inference boundary only; overrides support persistence when stricter and carries no trait meaning.",
      "notEvidenceFor": [
        "fragility",
        "openness",
        "avoidance",
        "emotional stability",
        "personality type"
      ],
      "sensitivityFlags": [
        "literal_preference",
        "support_literal",
        "boundary"
      ],
      "followupRouting": "Multi-select literal operating boundary. V4-044 overrides V4-042 when explicit_no_once or a selected topic/inference boundary applies. Meanings are literal only and never personality evidence.",
      "heldoutMetadata": null
    }
  },
  {
    "id": "V4-H01",
    "chapter": 9,
    "title": "A not-that-close person gets credit for the shared idea in chat. First move?",
    "setup": "status cost medium; relationship cost lower than V4-005",
    "role": "holdout",
    "kind": "heldout",
    "test": true,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Let it pass unless it affects the next step",
        "why": "Let it pass unless it affects the next step",
        "neutralMeaning": "Uses threshold before action",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "credit_threshold",
            "target": "acquaintance in a public group",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Reply with added context in the thread",
        "why": "Reply with added context in the thread",
        "neutralMeaning": "Publicly clarifies in channel",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "credit_thread_context",
            "target": "acquaintance in a public group",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Message them privately",
        "why": "Message them privately",
        "neutralMeaning": "Uses direct private correction",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "credit_private_message",
            "target": "acquaintance in a public group",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Make my next contribution traceable",
        "why": "Make my next contribution traceable",
        "neutralMeaning": "Changes future visibility process",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "credit_future_trace",
            "target": "acquaintance in a public group",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Ask someone neutral how they read it",
        "why": "Ask someone neutral how they read it",
        "neutralMeaning": "Seeks external read before acting",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "credit_neutral_read",
            "target": "acquaintance in a public group",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "abstain",
        "text": "Abstain / not enough to choose",
        "why": "Abstain / not enough to choose",
        "exit": true,
        "meaning": "Answered as abstention; excluded from exact-match denominator and preserved in denominator report.",
        "tags": [],
        "facts": {
          "missingness": "abstain"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; excluded from profile and exact-match denominator.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "baseline": "C",
    "meta": {
      "itemId": "V4-H01",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Held-out P checks",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "holdout check",
      "evidence": "heldout",
      "target": "acquaintance in a public group",
      "timeframe": "post-freeze scenario",
      "window": "post_freeze_scenario",
      "cost": "status cost medium; relationship cost lower than V4-005",
      "construct": "credit response transfer",
      "linkedEventId": "HEV4-H01",
      "claimLimit": "P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.",
      "notEvidenceFor": [
        "profile evidence",
        "archetype selection",
        "result correction",
        "trait proof",
        "validation of whole person"
      ],
      "sensitivityFlags": [
        "heldout",
        "p_only"
      ],
      "followupRouting": "Shown only after profile freeze. Never updates profile evidence, archetype, thesis, support preferences, or receipts for the frozen result.",
      "heldoutMetadata": {
        "tested_claim": "Transfer of credit/visibility strategy from training credit items.",
        "changed_condition": "Target shifts from teammate/close peer to loose acquaintance and channel shifts to group chat.",
        "fixed_baseline": {
          "type": "fixed_authored_default",
          "option_id": "C",
          "rationale": "Private correction is preregistered neutral baseline for ambiguous shared-credit conflict."
        },
        "abstain_rules": "Abstain if respondent says the premise is too context-dependent or impossible to choose.",
        "leakage_rules": "Must not reuse V4-005 option wording as prediction rationale; prediction can cite V4-005/V4-010 only before this item is shown.",
        "scoring": "Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.",
        "freeze_requirement": "Prediction, rationale, profile hash, eligible evidence list, and baseline must be recorded before this prompt is shown."
      }
    }
  },
  {
    "id": "V4-H02",
    "chapter": 9,
    "title": "You talked over someone, everyone clocked it, and now the room is weird. Move?",
    "setup": "reputation cost medium; repair cost medium",
    "role": "holdout",
    "kind": "heldout",
    "test": true,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Hand the floor back to them directly",
        "why": "Hand the floor back to them directly",
        "neutralMeaning": "Repairs by restoring turn",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "emb_hand_floor",
            "target": "group member after accidental interruption",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Make a brief apology and continue later",
        "why": "Make a brief apology and continue later",
        "neutralMeaning": "Repairs briefly then delays own point",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "emb_brief_apology",
            "target": "group member after accidental interruption",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Use a light line to reset, then invite them in",
        "why": "Use a light line to reset, then invite them in",
        "neutralMeaning": "Uses humor plus repair",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "emb_light_reset_invite",
            "target": "group member after accidental interruption",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Go quiet until the topic changes",
        "why": "Go quiet until the topic changes",
        "neutralMeaning": "Withdraws from immediate repair",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "emb_go_quiet",
            "target": "group member after accidental interruption",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Check in after the conversation",
        "why": "Check in after the conversation",
        "neutralMeaning": "Uses delayed private repair",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "emb_after_checkin",
            "target": "group member after accidental interruption",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "abstain",
        "text": "Abstain / not enough to choose",
        "why": "Abstain / not enough to choose",
        "exit": true,
        "meaning": "Answered as abstention; excluded from exact-match denominator and preserved in denominator report.",
        "tags": [],
        "facts": {
          "missingness": "abstain"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; excluded from profile and exact-match denominator.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "baseline": "A",
    "meta": {
      "itemId": "V4-H02",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Held-out P checks",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "holdout check",
      "evidence": "heldout",
      "target": "group member after accidental interruption",
      "timeframe": "post-freeze scenario",
      "window": "post_freeze_scenario",
      "cost": "reputation cost medium; repair cost medium",
      "construct": "awkward repair transfer",
      "linkedEventId": "HEV4-H02",
      "claimLimit": "P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.",
      "notEvidenceFor": [
        "profile evidence",
        "archetype selection",
        "result correction",
        "trait proof",
        "validation of whole person"
      ],
      "sensitivityFlags": [
        "heldout",
        "p_only"
      ],
      "followupRouting": "Shown only after profile freeze. Never updates profile evidence, archetype, thesis, support preferences, or receipts for the frozen result.",
      "heldoutMetadata": {
        "tested_claim": "Transfer of public awkwardness and repair strategy, with inside/outside prediction if attempted.",
        "changed_condition": "Scenario changes from being corrected or joke impact to accidental interruption; target is affected speaker.",
        "fixed_baseline": {
          "type": "fixed_authored_default",
          "option_id": "A",
          "rationale": "Restoring the floor is preregistered baseline for interruption repair."
        },
        "abstain_rules": "Abstain if prediction lacks repair evidence or only has action without comparable social-impact context.",
        "leakage_rules": "Prediction may not cite heldout wording or infer feeling unless V4-012 answered before freeze.",
        "scoring": "Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.",
        "freeze_requirement": "Prediction, rationale, profile hash, eligible evidence list, and baseline must be recorded before this prompt is shown."
      }
    }
  },
  {
    "id": "V4-H03",
    "chapter": 9,
    "title": "They plan something right there and somehow you are not included. First move?",
    "setup": "closeness cost medium; ambiguity high",
    "role": "holdout",
    "kind": "heldout",
    "test": true,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Ask lightly if it is open",
        "why": "Ask lightly if it is open",
        "neutralMeaning": "Uses direct but low-pressure ask",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "excl_light_ask",
            "target": "two friends with prior reliability unknown",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Wait to see if they include me later",
        "why": "Wait to see if they include me later",
        "neutralMeaning": "Delays action for more evidence",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "excl_wait_later",
            "target": "two friends with prior reliability unknown",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Make separate plans without commenting",
        "why": "Make separate plans without commenting",
        "neutralMeaning": "Redirects effort without asking",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "excl_separate_plans",
            "target": "two friends with prior reliability unknown",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Ask one of them privately afterward",
        "why": "Ask one of them privately afterward",
        "neutralMeaning": "Uses private clarification",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "excl_private_ask",
            "target": "two friends with prior reliability unknown",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Step back from the plan and the topic",
        "why": "Step back from the plan and the topic",
        "neutralMeaning": "Reduces engagement immediately",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "excl_step_back",
            "target": "two friends with prior reliability unknown",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "abstain",
        "text": "Abstain / not enough to choose",
        "why": "Abstain / not enough to choose",
        "exit": true,
        "meaning": "Answered as abstention; excluded from exact-match denominator and preserved in denominator report.",
        "tags": [],
        "facts": {
          "missingness": "abstain"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; excluded from profile and exact-match denominator.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "baseline": "A",
    "meta": {
      "itemId": "V4-H03",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Held-out P checks",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "holdout check",
      "evidence": "heldout",
      "target": "two friends with prior reliability unknown",
      "timeframe": "post-freeze scenario",
      "window": "post_freeze_scenario",
      "cost": "closeness cost medium; ambiguity high",
      "construct": "ambiguous exclusion transfer",
      "linkedEventId": "HEV4-H03",
      "claimLimit": "P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.",
      "notEvidenceFor": [
        "profile evidence",
        "archetype selection",
        "result correction",
        "trait proof",
        "validation of whole person"
      ],
      "sensitivityFlags": [
        "heldout",
        "p_only"
      ],
      "followupRouting": "Shown only after profile freeze. Never updates profile evidence, archetype, thesis, support preferences, or receipts for the frozen result.",
      "heldoutMetadata": {
        "tested_claim": "Transfer of exclusion interpretation/action strategy without attachment labeling.",
        "changed_condition": "Condition changes from discovering prior event to live in-front planning; reliability is unspecified.",
        "fixed_baseline": {
          "type": "fixed_authored_default",
          "option_id": "A",
          "rationale": "Light direct ask is preregistered baseline for live ambiguous exclusion."
        },
        "abstain_rules": "Abstain if target/safety context is missing or profile only has support preferences.",
        "leakage_rules": "No attachment-style, abandonment, jealousy, or insecurity terms in prediction or scoring.",
        "scoring": "Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.",
        "freeze_requirement": "Prediction, rationale, profile hash, eligible evidence list, and baseline must be recorded before this prompt is shown."
      }
    }
  },
  {
    "id": "V4-H04",
    "chapter": 9,
    "title": "The advice is good; the delivery is “do this.” What do you do?",
    "setup": "autonomy cost medium; advice quality high",
    "role": "holdout",
    "kind": "heldout",
    "test": true,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Ask for the reason so I can buy in",
        "why": "Ask for the reason so I can buy in",
        "neutralMeaning": "Seeks rationale for agency",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "auto_ask_reason",
            "target": "skilled friend giving directive help",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Use it but modify the execution",
        "why": "Use it but modify the execution",
        "neutralMeaning": "Accepts substance with agency",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "auto_modify",
            "target": "skilled friend giving directive help",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Tell them the instruction tone is the issue",
        "why": "Tell them the instruction tone is the issue",
        "neutralMeaning": "Names framing problem",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "auto_name_tone",
            "target": "skilled friend giving directive help",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Follow it because the outcome matters",
        "why": "Follow it because the outcome matters",
        "neutralMeaning": "Prioritizes outcome over tone",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "auto_follow_outcome",
            "target": "skilled friend giving directive help",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Pause before responding",
        "why": "Pause before responding",
        "neutralMeaning": "Delays response to avoid unhelpful pushback",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "auto_pause",
            "target": "skilled friend giving directive help",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "abstain",
        "text": "Abstain / not enough to choose",
        "why": "Abstain / not enough to choose",
        "exit": true,
        "meaning": "Answered as abstention; excluded from exact-match denominator and preserved in denominator report.",
        "tags": [],
        "facts": {
          "missingness": "abstain"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; excluded from profile and exact-match denominator.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "baseline": "A",
    "meta": {
      "itemId": "V4-H04",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Held-out P checks",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "holdout check",
      "evidence": "heldout",
      "target": "skilled friend giving directive help",
      "timeframe": "post-freeze scenario",
      "window": "post_freeze_scenario",
      "cost": "autonomy cost medium; advice quality high",
      "construct": "instruction response transfer",
      "linkedEventId": "HEV4-H04",
      "claimLimit": "P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.",
      "notEvidenceFor": [
        "profile evidence",
        "archetype selection",
        "result correction",
        "trait proof",
        "validation of whole person"
      ],
      "sensitivityFlags": [
        "heldout",
        "p_only"
      ],
      "followupRouting": "Shown only after profile freeze. Never updates profile evidence, archetype, thesis, support preferences, or receipts for the frozen result.",
      "heldoutMetadata": {
        "tested_claim": "Transfer of autonomy-support/reactance pattern from instruction and authority items.",
        "changed_condition": "Target changes from generic advisor/authority to skilled friend; advice quality explicitly high.",
        "fixed_baseline": {
          "type": "fixed_authored_default",
          "option_id": "A",
          "rationale": "Asking for reason is preregistered baseline for useful directive advice."
        },
        "abstain_rules": "Abstain if profile lacks V4-023/V4-024/V4-028 or contains contradictory unsupported rationale.",
        "leakage_rules": "Prediction must distinguish tone response from advice-quality response.",
        "scoring": "Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.",
        "freeze_requirement": "Prediction, rationale, profile hash, eligible evidence list, and baseline must be recorded before this prompt is shown."
      }
    }
  },
  {
    "id": "V4-H05",
    "chapter": 9,
    "title": "A usually-solid person needs help right in your protected time. Move?",
    "setup": "capacity cost high; relationship cost medium",
    "role": "holdout",
    "kind": "heldout",
    "test": true,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Help now and absorb the cost",
        "why": "Help now and absorb the cost",
        "neutralMeaning": "Prioritizes immediate help",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "help_absorb",
            "target": "reliable close person or lower-closeness requester per prediction",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Offer a bounded version now",
        "why": "Offer a bounded version now",
        "neutralMeaning": "Gives limited immediate help",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "help_bounded_now",
            "target": "reliable close person or lower-closeness requester per prediction",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Ask what part is truly urgent",
        "why": "Ask what part is truly urgent",
        "neutralMeaning": "Clarifies urgency before committing",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "help_ask_urgent",
            "target": "reliable close person or lower-closeness requester per prediction",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Offer a later time or alternate route",
        "why": "Offer a later time or alternate route",
        "neutralMeaning": "Defers or redirects help",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "help_later_route",
            "target": "reliable close person or lower-closeness requester per prediction",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Say no clearly for this block",
        "why": "Say no clearly for this block",
        "neutralMeaning": "Protects time block with refusal",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "help_no_block",
            "target": "reliable close person or lower-closeness requester per prediction",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "abstain",
        "text": "Abstain / not enough to choose",
        "why": "Abstain / not enough to choose",
        "exit": true,
        "meaning": "Answered as abstention; excluded from exact-match denominator and preserved in denominator report.",
        "tags": [],
        "facts": {
          "missingness": "abstain"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; excluded from profile and exact-match denominator.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "baseline": "C",
    "meta": {
      "itemId": "V4-H05",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Held-out P checks",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "holdout check",
      "evidence": "heldout",
      "target": "reliable close person or lower-closeness requester per prediction",
      "timeframe": "post-freeze scenario",
      "window": "post_freeze_scenario",
      "cost": "capacity cost high; relationship cost medium",
      "construct": "costly help transfer",
      "linkedEventId": "HEV4-H05",
      "claimLimit": "P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.",
      "notEvidenceFor": [
        "profile evidence",
        "archetype selection",
        "result correction",
        "trait proof",
        "validation of whole person"
      ],
      "sensitivityFlags": [
        "heldout",
        "p_only"
      ],
      "followupRouting": "Shown only after profile freeze. Never updates profile evidence, archetype, thesis, support preferences, or receipts for the frozen result.",
      "heldoutMetadata": {
        "tested_claim": "Transfer of help-boundary strategy while holding requester reliability positive.",
        "changed_condition": "Cost changes to protected time block; requester reliability is explicitly good to avoid counterparty-confound.",
        "fixed_baseline": {
          "type": "fixed_authored_default",
          "option_id": "C",
          "rationale": "Urgency clarification is preregistered baseline for reliable requester with high capacity cost."
        },
        "abstain_rules": "Abstain if no boundary/help evidence or if V4-003 boundary makes this target off-limits.",
        "leakage_rules": "Prediction cannot use support-preference answers as help-boundary evidence.",
        "scoring": "Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.",
        "freeze_requirement": "Prediction, rationale, profile hash, eligible evidence list, and baseline must be recorded before this prompt is shown."
      }
    }
  },
  {
    "id": "V4-H06",
    "chapter": 9,
    "title": "The invite has story potential; tomorrow still exists. Move?",
    "setup": "future obligation cost medium; social pull variable",
    "role": "holdout",
    "kind": "heldout",
    "test": true,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Go all in",
        "why": "Go all in",
        "neutralMeaning": "Chooses memorable option fully",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "desire_all_in",
            "target": "self with optional group invite",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Go for a shorter version",
        "why": "Go for a shorter version",
        "neutralMeaning": "Chooses modified reward",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "desire_shorter",
            "target": "self with optional group invite",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Decline and keep the commitment clean",
        "why": "Decline and keep the commitment clean",
        "neutralMeaning": "Prioritizes next-day commitment",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "desire_decline_commitment",
            "target": "self with optional group invite",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Ask someone to hold me to an exit time",
        "why": "Ask someone to hold me to an exit time",
        "neutralMeaning": "Uses accountability boundary",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "desire_exit_accountability",
            "target": "self with optional group invite",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Decide based on who is going",
        "why": "Decide based on who is going",
        "neutralMeaning": "Social composition determines choice",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "desire_who_going",
            "target": "self with optional group invite",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "abstain",
        "text": "Abstain / not enough to choose",
        "why": "Abstain / not enough to choose",
        "exit": true,
        "meaning": "Answered as abstention; excluded from exact-match denominator and preserved in denominator report.",
        "tags": [],
        "facts": {
          "missingness": "abstain"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; excluded from profile and exact-match denominator.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "baseline": "B",
    "meta": {
      "itemId": "V4-H06",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Held-out P checks",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "holdout check",
      "evidence": "heldout",
      "target": "self with optional group invite",
      "timeframe": "post-freeze scenario",
      "window": "post_freeze_scenario",
      "cost": "future obligation cost medium; social pull variable",
      "construct": "temptation transfer",
      "linkedEventId": "HEV4-H06",
      "claimLimit": "P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.",
      "notEvidenceFor": [
        "profile evidence",
        "archetype selection",
        "result correction",
        "trait proof",
        "validation of whole person"
      ],
      "sensitivityFlags": [
        "heldout",
        "p_only"
      ],
      "followupRouting": "Shown only after profile freeze. Never updates profile evidence, archetype, thesis, support preferences, or receipts for the frozen result.",
      "heldoutMetadata": {
        "tested_claim": "Transfer of non-health future-cost temptation strategy.",
        "changed_condition": "Scenario changes from generic fun option to last-minute memorable invite with explicit commitment cost.",
        "fixed_baseline": {
          "type": "fixed_authored_default",
          "option_id": "B",
          "rationale": "Shorter version is preregistered baseline for fun versus future-cost tradeoff."
        },
        "abstain_rules": "Abstain if profile lacks V4-035 or answer was other/prefer_not only.",
        "leakage_rules": "Prediction must not use health, discipline, or routine language.",
        "scoring": "Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.",
        "freeze_requirement": "Prediction, rationale, profile hash, eligible evidence list, and baseline must be recorded before this prompt is shown."
      }
    }
  },
  {
    "id": "V4-H07",
    "chapter": 9,
    "title": "You can be fully clear now, or keep the surface calm for a bit. Move?",
    "setup": "conflict cost high; trust cost medium",
    "role": "holdout",
    "kind": "heldout",
    "test": true,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Tell them the whole thing with context",
        "why": "Tell them the whole thing with context",
        "neutralMeaning": "Full disclosure with context",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "truth_full_context",
            "target": "close collaborator or peer",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Tell the part that affects their decision",
        "why": "Tell the part that affects their decision",
        "neutralMeaning": "Decision-relevant disclosure",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "truth_relevant_part",
            "target": "close collaborator or peer",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Wait until I can say it without heat",
        "why": "Wait until I can say it without heat",
        "neutralMeaning": "Delay for delivery quality",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "truth_wait_no_heat",
            "target": "close collaborator or peer",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Answer if they ask directly",
        "why": "Answer if they ask directly",
        "neutralMeaning": "Conditional disclosure",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "truth_if_asked",
            "target": "close collaborator or peer",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Talk to a safer person first",
        "why": "Talk to a safer person first",
        "neutralMeaning": "Third-party processing before disclosure",
        "claimLimit": "P-only selected action.",
        "tags": [
          {
            "d": "heldout",
            "v": "truth_safe_person_first",
            "target": "close collaborator or peer",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "abstain",
        "text": "Abstain / not enough to choose",
        "why": "Abstain / not enough to choose",
        "exit": true,
        "meaning": "Answered as abstention; excluded from exact-match denominator and preserved in denominator report.",
        "tags": [],
        "facts": {
          "missingness": "abstain"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; excluded from profile and exact-match denominator.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "baseline": "B",
    "meta": {
      "itemId": "V4-H07",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Held-out P checks",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "holdout check",
      "evidence": "heldout",
      "target": "close collaborator or peer",
      "timeframe": "post-freeze scenario",
      "window": "post_freeze_scenario",
      "cost": "conflict cost high; trust cost medium",
      "construct": "truth management transfer",
      "linkedEventId": "HEV4-H07",
      "claimLimit": "P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.",
      "notEvidenceFor": [
        "profile evidence",
        "archetype selection",
        "result correction",
        "trait proof",
        "validation of whole person"
      ],
      "sensitivityFlags": [
        "heldout",
        "p_only"
      ],
      "followupRouting": "Shown only after profile freeze. Never updates profile evidence, archetype, thesis, support preferences, or receipts for the frozen result.",
      "heldoutMetadata": {
        "tested_claim": "Transfer of truth/withholding self-protection strategy.",
        "changed_condition": "Scenario changes from abstract costly truth to own choice affecting someone; retaliation content excluded.",
        "fixed_baseline": {
          "type": "fixed_authored_default",
          "option_id": "B",
          "rationale": "Decision-relevant disclosure is preregistered baseline for conflict-cost truth."
        },
        "abstain_rules": "Abstain if safety/power context makes direct truth unrealistic or profile lacks V4-037.",
        "leakage_rules": "Prediction must not call any option honest, dishonest, manipulative, brave, or cowardly.",
        "scoring": "Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.",
        "freeze_requirement": "Prediction, rationale, profile hash, eligible evidence list, and baseline must be recorded before this prompt is shown."
      }
    }
  },
  {
    "id": "V4-H08",
    "chapter": 9,
    "title": "Genii has a read and a next question. What delivery would you choose right now?",
    "setup": "autonomy cost low; support relevance medium",
    "role": "holdout",
    "kind": "heldout",
    "test": true,
    "responseFormat": "single_choice",
    "options": [
      {
        "id": "A",
        "text": "Pattern first, then the question",
        "why": "Pattern first, then the question",
        "neutralMeaning": "Prefers direct sequence",
        "claimLimit": "P-only support choice.",
        "tags": [
          {
            "d": "heldout",
            "v": "support_pattern_first",
            "target": "Genii-to-user",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "B",
        "text": "Receipts first, then the read",
        "why": "Receipts first, then the read",
        "neutralMeaning": "Prefers evidence-first sequence",
        "claimLimit": "P-only support choice.",
        "tags": [
          {
            "d": "heldout",
            "v": "support_receipts_first",
            "target": "Genii-to-user",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "C",
        "text": "Ask permission before the read",
        "why": "Ask permission before the read",
        "neutralMeaning": "Prefers permission before depth",
        "claimLimit": "P-only support choice.",
        "tags": [
          {
            "d": "heldout",
            "v": "support_permission",
            "target": "Genii-to-user",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "D",
        "text": "Make it playful and brief",
        "why": "Make it playful and brief",
        "neutralMeaning": "Prefers playful concise delivery",
        "claimLimit": "P-only support choice.",
        "tags": [
          {
            "d": "heldout",
            "v": "support_playful_brief",
            "target": "Genii-to-user",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      },
      {
        "id": "E",
        "text": "Save the next question unless I ask",
        "why": "Save the next question unless I ask",
        "neutralMeaning": "Prefers no unsolicited follow-up",
        "claimLimit": "P-only support choice.",
        "tags": [
          {
            "d": "heldout",
            "v": "support_save_question",
            "target": "Genii-to-user",
            "facet": "heldout",
            "section": "heldout"
          }
        ],
        "reaction": null
      }
    ],
    "exits": [
      {
        "id": "abstain",
        "text": "Abstain / not enough to choose",
        "why": "Abstain / not enough to choose",
        "exit": true,
        "meaning": "Answered as abstention; excluded from exact-match denominator and preserved in denominator report.",
        "tags": [],
        "facts": {
          "missingness": "abstain"
        }
      },
      {
        "id": "prefer_not",
        "text": "Prefer not to answer",
        "why": "Prefer not to answer",
        "exit": true,
        "meaning": "Boundary; excluded from profile and exact-match denominator.",
        "tags": [],
        "facts": {
          "missingness": "prefer_not"
        }
      }
    ],
    "baseline": "B",
    "meta": {
      "itemId": "V4-H08",
      "packetVersion": "v4-authoring-packet-2026-09-19",
      "section": "Held-out P checks",
      "source": "genii-personality-game-v4-authoring-packet",
      "sourceType": "holdout check",
      "evidence": "heldout",
      "target": "Genii-to-user",
      "timeframe": "post-freeze scenario",
      "window": "post_freeze_scenario",
      "cost": "autonomy cost low; support relevance medium",
      "construct": "applied support preference consistency",
      "linkedEventId": "HEV4-H08",
      "claimLimit": "P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.",
      "notEvidenceFor": [
        "profile evidence",
        "archetype selection",
        "result correction",
        "trait proof",
        "validation of whole person"
      ],
      "sensitivityFlags": [
        "heldout",
        "p_only"
      ],
      "followupRouting": "Shown only after profile freeze. Never updates profile evidence, archetype, thesis, support preferences, or receipts for the frozen result.",
      "heldoutMetadata": {
        "tested_claim": "Consistency of literal support preference under applied result context.",
        "changed_condition": "Changed from abstract preference to applied result moment after survey fatigue and profile freeze.",
        "fixed_baseline": {
          "type": "literal_preference_projection",
          "option_id": "B",
          "rationale": "Receipts-first is baseline only if no literal support preference is available; otherwise report literal-preference projection separately from fixed fallback."
        },
        "abstain_rules": "Abstain if support answers are missing, contradictory, or stricter pause boundary blocks follow-up.",
        "leakage_rules": "Support heldout is P-only; it may compare to literal fields but cannot update support preferences for the frozen result.",
        "scoring": "Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.",
        "freeze_requirement": "Prediction, rationale, profile hash, eligible evidence list, and baseline must be recorded before this prompt is shown."
      }
    }
  }
];
export const QUESTIONS = AUTHORED_QUESTIONS.map(applyItemCopy);
export const ROUTE_SLOTS = [
  {
    "id": "slot:V4-001",
    "candidates": [
      "V4-001"
    ]
  },
  {
    "id": "slot:V4-002",
    "candidates": [
      "V4-002"
    ]
  },
  {
    "id": "slot:V4-003",
    "candidates": [
      "V4-003"
    ]
  },
  {
    "id": "slot:V4-004",
    "candidates": [
      "V4-004"
    ]
  },
  {
    "id": "slot:V4-005",
    "candidates": [
      "V4-005"
    ]
  },
  {
    "id": "slot:V4-006",
    "candidates": [
      "V4-006"
    ]
  },
  {
    "id": "slot:V4-007",
    "candidates": [
      "V4-007"
    ]
  },
  {
    "id": "slot:V4-008",
    "candidates": [
      "V4-008"
    ]
  },
  {
    "id": "slot:V4-009",
    "candidates": [
      "V4-009"
    ]
  },
  {
    "id": "slot:V4-010",
    "candidates": [
      "V4-010"
    ]
  },
  {
    "id": "slot:V4-011",
    "candidates": [
      "V4-011"
    ]
  },
  {
    "id": "slot:V4-012",
    "candidates": [
      "V4-012"
    ]
  },
  {
    "id": "slot:V4-013",
    "candidates": [
      "V4-013"
    ]
  },
  {
    "id": "slot:V4-014",
    "candidates": [
      "V4-014"
    ]
  },
  {
    "id": "slot:V4-015",
    "candidates": [
      "V4-015"
    ]
  },
  {
    "id": "slot:V4-016",
    "candidates": [
      "V4-016"
    ]
  },
  {
    "id": "slot:V4-017",
    "candidates": [
      "V4-017"
    ]
  },
  {
    "id": "slot:V4-018",
    "candidates": [
      "V4-018"
    ]
  },
  {
    "id": "slot:V4-019",
    "candidates": [
      "V4-019"
    ]
  },
  {
    "id": "slot:V4-020",
    "candidates": [
      "V4-020"
    ]
  },
  {
    "id": "slot:V4-021",
    "candidates": [
      "V4-021"
    ]
  },
  {
    "id": "slot:V4-022",
    "candidates": [
      "V4-022"
    ]
  },
  {
    "id": "slot:V4-023",
    "candidates": [
      "V4-023"
    ]
  },
  {
    "id": "slot:V4-024",
    "candidates": [
      "V4-024"
    ]
  },
  {
    "id": "slot:V4-025",
    "candidates": [
      "V4-025"
    ]
  },
  {
    "id": "slot:V4-026",
    "candidates": [
      "V4-026"
    ]
  },
  {
    "id": "slot:V4-027",
    "candidates": [
      "V4-027"
    ]
  },
  {
    "id": "slot:V4-028",
    "candidates": [
      "V4-028"
    ]
  },
  {
    "id": "slot:V4-029",
    "candidates": [
      "V4-029"
    ]
  },
  {
    "id": "slot:V4-030",
    "candidates": [
      "V4-030"
    ]
  },
  {
    "id": "slot:V4-031",
    "candidates": [
      "V4-031"
    ]
  },
  {
    "id": "slot:V4-032",
    "candidates": [
      "V4-032"
    ]
  },
  {
    "id": "slot:V4-033",
    "candidates": [
      "V4-033"
    ]
  },
  {
    "id": "slot:V4-034",
    "candidates": [
      "V4-034"
    ]
  },
  {
    "id": "slot:V4-035",
    "candidates": [
      "V4-035"
    ]
  },
  {
    "id": "slot:V4-036",
    "candidates": [
      "V4-036"
    ]
  },
  {
    "id": "slot:V4-037",
    "candidates": [
      "V4-037"
    ]
  },
  {
    "id": "slot:V4-038",
    "candidates": [
      "V4-038"
    ]
  },
  {
    "id": "slot:V4-039",
    "candidates": [
      "V4-039"
    ]
  },
  {
    "id": "slot:V4-040",
    "candidates": [
      "V4-040"
    ]
  },
  {
    "id": "slot:V4-041",
    "candidates": [
      "V4-041"
    ]
  },
  {
    "id": "slot:V4-042",
    "candidates": [
      "V4-042"
    ]
  },
  {
    "id": "slot:V4-043",
    "candidates": [
      "V4-043"
    ]
  },
  {
    "id": "slot:V4-044",
    "candidates": [
      "V4-044"
    ]
  },
  {
    "id": "slot:V4-H01",
    "candidates": [
      "V4-H01"
    ]
  },
  {
    "id": "slot:V4-H02",
    "candidates": [
      "V4-H02"
    ]
  },
  {
    "id": "slot:V4-H03",
    "candidates": [
      "V4-H03"
    ]
  },
  {
    "id": "slot:V4-H04",
    "candidates": [
      "V4-H04"
    ]
  },
  {
    "id": "slot:V4-H05",
    "candidates": [
      "V4-H05"
    ]
  },
  {
    "id": "slot:V4-H06",
    "candidates": [
      "V4-H06"
    ]
  },
  {
    "id": "slot:V4-H07",
    "candidates": [
      "V4-H07"
    ]
  },
  {
    "id": "slot:V4-H08",
    "candidates": [
      "V4-H08"
    ]
  }
];
