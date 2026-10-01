import { createSession, answerQuestion, freezeSession } from "../../quiz64/src/dossier-session.js";
import { getBank } from "../../quiz64/src/question-bank-v2.js";
import { buildGameOutcome } from "../../quiz64/src/game-outcome.js";
function clock(){let t=0;return()=>new Date(Date.UTC(2026,8,21,7,0,0)+1000*t++).toISOString();}
let seed=42; const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
const N=+process.argv[2]||600;
const configs=[["universal",true],["everyday",false],["work_study",false],["social",true]];
const out={};
for(const [route,personal] of configs){
  const bank=getBank({route,voice:"playful",personal});
  for(const mode of ["uniform","skip20","consistentL","consistentR"]){
    const labels={}; const support={}; let developing=0;
    for(let i=0;i<N;i++){
      let s=createSession({route,voice:"playful",personal,clock:clock()});
      for(const id of bank.profileIds){
        const t=bank.templates.find(x=>x.itemId===id);
        let v;
        if(mode==="skip20"&&rnd()<0.2) v="skip";
        else if(mode.startsWith("consistent")){
          const want=mode==="consistentL"?"left":"right";
          const pick=t.options.filter(o=>o.predicates.some(p=>p.direction===want));
          v=(pick.length?pick[Math.floor(rnd()*pick.length)]:t.options[Math.floor(rnd()*t.options.length)]).id;
        } else v=t.options[Math.floor(rnd()*t.options.length)].id;
        s=answerQuestion(s,id,v);
      }
      s=freezeSession(s);
      const g=buildGameOutcome(s.projection,"playful");
      labels[g.label]=(labels[g.label]||0)+1;
      if(g.label==="Plot still developing")developing++;
      for(const a of s.projection.axes){const k=a.axisId+":"+a.supportLevel;support[k]=(support[k]||0)+1;}
      if(mode.startsWith("consistent")&&i>=40)break;
    }
    const n=mode.startsWith("consistent")?41:N;
    out[route+(personal?"+p":"")+"/"+mode]={n,developingPct:+(100*developing/n).toFixed(1),distinctNames:Object.keys(labels).length,top:Object.entries(labels).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k+" "+(100*v/n).toFixed(0)+"%"),support:Object.fromEntries(Object.entries(support).sort().map(([k,v])=>[k,+(100*v/n).toFixed(0)]))};
  }
}
console.log(JSON.stringify(out,null,1));
