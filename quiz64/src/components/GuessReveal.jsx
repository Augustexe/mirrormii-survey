import React, { useState } from 'react';

export function GuessReveal({ trials = [] }) {
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const trial = trials[round];
  if (!trial) return null;
  const isOpen = revealed.includes(round);
  const reveal = () => setRevealed(previous=>previous.includes(round)?previous:[...previous,round]);
  const verdict = {hit:'Genii called it.',miss:'You surprised your narrator.',abstained:'Genii sat this one out.',skipped:'You kept this one to yourself.'}[trial.status];
  return <div className="guess-reveal">
    <div className="guess-reveal__top"><span>THE REVEAL / {String(round+1).padStart(2,'0')}</span><span aria-live="polite">{revealed.length} / {trials.length} opened</span></div>
    <h3>{trial.prompt}</h3>
    <div className={`guess-reveal__cards ${isOpen?'is-revealed':''}`}>
      <div><span>Genii locked in</span><p>{trial.guess || 'A pass. There was not enough to make this call.'}</p><small>Sealed before your answer</small></div>
      <div key={`${round}-${isOpen}`} className="guess-reveal__answer" aria-live="polite">{isOpen ? <><span>{verdict}</span><p>{trial.answer || 'No scored answer for this round.'}</p><details><summary>Behind this guess</summary><p>The fixed comparison chose: {trial.baseline || "No comparison available."}</p><small>This answer checks the guess; it does not change your reading.</small></details></> : <button onClick={reveal}><span aria-hidden="true">✦</span>Turn over my answer</button>}</div>
    </div>
    <div className="guess-reveal__controls"><button disabled={round===0} onClick={()=>setRound(round-1)}>← Previous</button><div className="guess-reveal__dots" aria-label="Rounds opened">{trials.map((_,i)=><i key={i} className={revealed.includes(i)?'is-open':''}/>)}</div><button disabled={round===trials.length-1} onClick={()=>setRound(round+1)}>Next round →</button></div>
    {revealed.length === trials.length && <p className="guess-reveal__complete" role="status">All cards on the table. Which one would your friends have called?</p>}
  </div>;
}
