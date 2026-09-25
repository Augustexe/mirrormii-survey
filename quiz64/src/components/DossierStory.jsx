import React, { useState } from "react";
import { ChapterObject } from "./ChapterObject.jsx";
import { buildDossierStory } from "../dossier-story.js";
import "../dossier-story.css";

function Sources({ ids = [], receipts = [], note }) {
  const rows = receipts.filter(row => ids.includes(row.evidenceId));
  if (!rows.length && !note) return null;
  return <details className="ds-sources"><summary>Show the clues behind this reading <span>+</span></summary>{note && <p>{note}</p>}{rows.map(row => <div key={row.evidenceId}><small>{({retrospective_self_report:"A moment you recalled",hypothetical_choice:"An imagined choice",stated_preference:"A preference you stated"})[row.sourceStatus] || "Your answer"}</small><p>{row.questionText}</p><blockquote>{row.answerTextSnapshot || row.optionText}</blockquote></div>)}</details>;
}
function FacetReading({ chapter }) {
  const labels = chapter.paragraphLabels || ["The read", "How strongly it shows up", "The scenes", "Picture this"];
  const blocks = chapter.paragraphs.map((copy, index) => ({copy, label: labels[index] || "One more detail"}));
  if (chapter.id === "activation_tempo") return <ol className="ds-replay" aria-label="Your first-move replay">{blocks.map((b,i)=><li key={i}><span className="ds-format-label">{b.label}</span><p>{b.copy}</p></li>)}</ol>;
  if (chapter.id === "social_signal_style") return <div className="ds-transmission" aria-label="Genii’s commentary on your communication">{blocks.map((b,i)=><section key={i}><span className="ds-format-label">{b.label}</span><p>{b.copy}</p></section>)}</div>;
  if (chapter.id === "friction_posture") return <dl className="ds-hearing">{blocks.map((b,i)=><div key={i}><dt>{b.label}</dt><dd>{b.copy}</dd></div>)}</dl>;
  if (chapter.id === "structure_reliance") return <div className="ds-plan">{blocks.map((b,i)=><section key={i}><span aria-hidden="true" className="ds-plan-number">{String(i+1).padStart(2,"0")}</span><div><span className="ds-format-label">{b.label}</span><p>{b.copy}</p></div></section>)}</div>;
  return <dl className="ds-curiosity-menu">{blocks.map((b,i)=><div key={i}><dt>{b.label}</dt><dd>{b.copy}</dd></div>)}</dl>;
}

export function DossierStory({ result, receipts }) {
  const story = buildDossierStory(result);
  const [active, setActive] = useState(0);
  const chapters = story.chapters || [];
  const chapter = chapters[active];
  return <div className="ds-world" id="dossier-reading">
    <section className="ds-opening"><span className="dossier-kicker">{story.opening.eyebrow}</span><h2>{story.opening.title}</h2>{story.opening.paragraphs.map((p,i)=><p key={i}>{p}</p>)}<Sources ids={story.opening.evidenceIds} receipts={receipts} note={story.opening.sourceNote}/></section>
    {!!chapters.length && <section className="ds-character" aria-labelledby="ds-character-title"><div className="ds-section-top"><span className="dossier-kicker">Your character menu</span><h2 id="ds-character-title">There’s more than one way to be you.</h2><p>Pick a facet. Open the scene behind it.</p></div><div className="ds-character-layout"><div className="ds-tabs" role="tablist" aria-label="Character facets">{chapters.map((item,i)=><button key={item.id} id={`ds-tab-${i}`} role="tab" tabIndex={i===active ? 0 : -1} onKeyDown={(event)=>{ const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? (i+1)%chapters.length : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (i+chapters.length-1)%chapters.length : event.key === "Home" ? 0 : event.key === "End" ? chapters.length-1 : null; if(next !== null) { event.preventDefault(); setActive(next); document.getElementById(`ds-tab-${next}`)?.focus(); } }} aria-selected={i===active} aria-controls="ds-facet" onClick={()=>setActive(i)}><ChapterObject chapter={i+2}/><span><small>0{i+1} / FACET</small><strong>{item.title}</strong></span><b aria-hidden="true">↗</b></button>)}</div>{chapter && <article className="ds-facet" id="ds-facet" role="tabpanel" aria-labelledby={`ds-tab-${active}`} key={chapter.id}><span className="dossier-kicker">{chapter.kicker}</span><h3>{chapter.title}</h3><FacetReading chapter={chapter}/><Sources ids={chapter.evidenceIds} receipts={receipts}/></article>}</div></section>}
    {!!story.caseFiles?.length && <section className="ds-scenes" aria-labelledby="ds-scenes-title"><div className="ds-section-top"><span className="dossier-kicker">Scenes from your universe</span><h2 id="ds-scenes-title">The little things are the plot.</h2><p>A collection of moments, alternate endings, and suspiciously specific observations. Open any scene.</p></div><div className="ds-scene-grid">{story.caseFiles.map((item,i)=><details className="ds-scene" key={item.id} open={i===0 || undefined}><summary><span className="ds-scene-art" aria-hidden="true"><ChapterObject chapter={(i%7)+2}/><i>{String(i+1).padStart(2,"0")}</i></span><span className="ds-scene-title"><small>SCENE {String(i+1).padStart(2,"0")}</small><strong>{item.title}</strong></span><span className="ds-scene-open" aria-hidden="true">+</span></summary><div className="ds-scene-body">{item.paragraphs.map((p,j)=><p key={j}>{p}</p>)}<Sources ids={item.evidenceIds} receipts={receipts}/></div></details>)}</div></section>}
    <section className="ds-closing"><span className="dossier-kicker">Room for your version</span><h2>{story.closing.title}</h2>{story.closing.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</section>
  </div>;
}
