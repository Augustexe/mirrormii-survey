/** Display-only game identity. No scoring, random rolls, clocks or held-out answers. */
export const GAME_OUTCOME_VERSION = 'genii-character-pairs-v2';
const ORDER = ['activation_tempo','social_signal_style','friction_posture','structure_reliance','novelty_aperture'];
const PAIRS = {
  '0:1': ['Chief Lurking Officer','Director of Before We Begin','The Silent Launch Button','The Human Reply-All Button'],
  '0:2': ['Minister of Let’s Sleep on It','Head of Carefully Worded Emails','The Diplomatic Escape Hatch','Chief Can We Fix This'],
  '0:3': ['The Unscheduled Think Tank','Chair of the Pre-Flight Checklist','Acting Head of We’ll Figure It Out','Chief Already Made a Checklist'],
  '0:4': ['Chair of Same Again, Please','The Cautious Plot Twist','Express Lane to the Usual','Chief Ooh What’s That'],
  '1:2': ['The Private Peace Treaty','Director of Quietly Handling It','Chief Let’s Keep This Civil','The Elephant’s Press Secretary'],
  '1:3': ['The Unpublished Rough Draft','Head of Invisible Logistics','Live Commentary, No Script','The Group Chat’s Unpaid Manager'],
  '1:4': ['Loyal Customer, Quiet Table','Incognito at the Weird Thing','Mayor of the Usual Spot','Publicist for the Side Quest'],
  '2:3': ['Department of We’ll Let It Slide','Chief Scheduled Peace Officer','The Unscripted Intervention','Head of Terms and Conditions'],
  '2:4': ['The Comfort Zone’s Legal Team','Curiosity With a Peace Treaty','The Usual, With Boundaries','The Detour’s Negotiating Team'],
  '3:4': ['Same Order, No Itinerary','Head of Unscheduled Nonsense','Keeper of the Sacred Routine','Chaos, With a Booking Reference'],
};
const SINGLE = [
  ['Chair of Let Me Think','Chief Already Started Officer'],
  ['Director of the Private Debrief','Head of Making It Known'],
  ['Minister of Lowering the Temperature','Chief We Need to Talk'],
  ['Head of Improvised Operations','Minister of the Checklist'],
  ['Same Again Ambassador','Chief Just One More Detour'],
];
const LINES = {
  activation_tempo: {
    left: {gentle:'You give the scene a moment before stepping in.',playful:'You let the scene finish its opening statement before volunteering for the sequel.',sharp:'Everyone else can press buttons. You would first like to know what the buttons do.'},
    right:{gentle:'A small first move helps you find your way in.',playful:'You would rather give the idea a test drive than another meeting.',sharp:'The situation can finish its presentation after you try something.'}
  },
  social_signal_style:{
    left:{gentle:'The quieter channel often suits the message.',playful:'Some messages work better without a press conference.',sharp:'The message arrives without a launch event, a guest list, or a follow-up press release.'},
    right:{gentle:'You tend to make the message clear to the room.',playful:'The room usually gets an actual message, not a decoding assignment.',sharp:'You put the message where people can see it. The group has been spared another decoding exercise.'}
  },
  friction_posture:{
    left:{gentle:'You often give tension a little space first.',playful:'Not every awkward moment gets promoted to a summit.',sharp:'An awkward moment has to earn its formal hearing.'},
    right:{gentle:'You look for a way to name or repair the mismatch.',playful:'The awkward thing is already here; you might as well give it a name.',sharp:'You are willing to address the elephant before it signs a lease.'}
  },
  structure_reliance:{
    left:{gentle:'The plan can take shape as you go.',playful:'The plan is a working draft with shoes on. It can learn on the way.',sharp:'Your first draft does not need a constitution.'},
    right:{gentle:'A few clear coordinates help you move forward.',playful:'A little structure keeps the plot from eating the afternoon.',sharp:'“We’ll work it out” is lovely. You would also like a time, a place, and possibly a booking reference.'}
  },
  novelty_aperture:{
    left:{gentle:'A reliable favorite has earned its place.',playful:'The familiar option has a good reference from you.',sharp:'Being new is not, by itself, a qualification.'},
    right:{gentle:'An unfamiliar option can be worth a small try.',playful:'You leave a little room in the day for a side quest.',sharp:'The unfamiliar gets an audition, not automatic rejection.'}
  }
};
export function buildGameOutcome(projection = {}, voice = 'playful') {
  const axes = (projection.axes || []).filter(a=>ORDER.includes(a.axisId) && ['supported','strongly_supported'].includes(a.supportLevel) && ['left','right'].includes(a.direction));
  const ranked = [...axes].sort((a,b)=> (b.supportLevel==='strongly_supported')-(a.supportLevel==='strongly_supported') || (b.supportingEvidenceIds?.length || 0)-(a.supportingEvidenceIds?.length || 0) || ORDER.indexOf(a.axisId)-ORDER.indexOf(b.axisId));
  const selected = ranked.slice(0,2).sort((a,b)=>ORDER.indexOf(a.axisId)-ORDER.indexOf(b.axisId));
  let label='Plot still developing', ruleId='plot-still-developing';
  if(selected.length===2){const [a,b]=selected;const pair=`${ORDER.indexOf(a.axisId)}:${ORDER.indexOf(b.axisId)}`; const variant=(a.direction==='right'?2:0)+(b.direction==='right'?1:0);label=PAIRS[pair][variant];ruleId=`pair-${pair.replace(':','-')}-${variant}`;}
  else if(selected.length===1){const a=selected[0];label=SINGLE[ORDER.indexOf(a.axisId)][a.direction==='right'?1:0];ruleId=`single-${a.axisId}-${a.direction}`;}
  const axisIds=selected.map(a=>a.axisId);
  const evidenceIds=[...new Set(selected.flatMap(a=>a.supportingEvidenceIds || []))];
  const hook=selected.length ? selected.map(a=>LINES[a.axisId][a.direction][voice] || LINES[a.axisId][a.direction].playful).join(' ') : 'A few pages are still blank. Genii is leaving room for your version.';
  return {kind:'playful_nickname',version:GAME_OUTCOME_VERSION,label,ruleId,axisIds,evidenceIds,hook,provisional:true};
}
/** Deliberately tiny public DTO. Never accept free text, receipts or snapshot IDs. */
export function createChallengeCard(outcome) {
  return { title:outcome.label, caption:`Genii has appointed me “${outcome.label}”. I would like to hear my friends’ defence. What title would you get?`, invitation:'Take your own turn. Compare titles, then debate the receipts.', kind:'game_nickname_only' };
}
