import { createSession, answerQuestion, freezeSession } from "../../quiz64/src/dossier-session.js";
import { getBank } from "../../quiz64/src/question-bank-v2.js";
import { buildGameOutcome } from "../../quiz64/src/game-outcome.js";
function clock(){let t=0;return()=>new Date(Date.UTC(2026,8,21,7,0,0)+1000*t++).toISOString();}
const A={E01:"sample",E02:"brief",E03:"keep",E04:"details",E05:"ally",E06:"ask",W01:"model",W02:"fix",W03:"pause",W04:"let_pass",W05:"anchors",W06:"reference",W07:"ask",W08:"yes",W09:"start",S01:"draft",S02:"sting",S03:"private",S04:"useful",S05:"react",S06:"vote",S07:"later",S08:"trusted",S09:"anchors",R01:"specific",R02:"pace",R03:"hint",R04:"space",R05:"details",R06:"time",M01:"reassurance",M03:"both",M04:"invite"};
const bank=getBank({route:"universal",voice:"playful",personal:true});
let s=createSession({route:"universal",voice:"playful",personal:true,clock:clock()});
let scored=0;
for(const id of bank.profileIds){ s=answerQuestion(s,id,A[id.replace("GQB2-","")]); }
s=freezeSession(s);
for(const e of s.events){ if(e.predicates?.some(p=>p.axisId)) scored++; }
console.log("items feeding an axis:",scored,"/",bank.profileIds.length);
for(const a of s.projection.axes) console.log(a.axisId, a.supportLevel, a.direction, "units", a.supportingEvidenceIds?.length, "counter", a.counterEvidenceIds?.length);
const g=buildGameOutcome(s.projection,"playful"); console.log(JSON.stringify({label:g.label,hook:g.hook,axes:g.axisIds}));
