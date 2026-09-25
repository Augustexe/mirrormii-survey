import React, { useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Gateway, Header, Interlude, Landing, QuizView } from "./App.jsx";
import { AmbientWorld } from "./components/AmbientWorld.jsx";
import { ChapterMap, HowDialog, MoreDialog, ReviewDialog } from "./components/ChapterMap.jsx";
import { PersonalityDossier } from "./components/PersonalityDossier.jsx";
import * as Survey from "./survey.js";
import * as Session from "./dossier-session.js";
import { getBank } from "./question-bank-v2.js";
import "./dossier-adapter.css";

const SAVE_KEY = Session.DOSSIER_STORAGE_KEY;
const SEEN_KEY = "genii.dossier.checks-seen.v2";
const MOTION_KEY = "genii.motion.v1";
const SECTION_CHAPTERS = Object.freeze({ everyday_life: 2, work_study: 3, social_theater: 4, close_connections: 6, secret_menu: 7, prediction_booth: 9 });
const ROUTES = [
  { id: "everyday", title: "Everyday me", line: "Small decisions. Surprisingly big tells.", label: "The everyday edition" },
  { id: "work_study", title: "Work & study me", line: "Deadlines, group projects, and the reply-all urge.", label: "The work & study edition" },
  { id: "social", title: "Me around people", line: "Plans, group chats, and things left on read.", label: "The social edition" },
];
const VOICES = [
  { id: "gentle", title: "Be kind", line: "Warm, clear, no roasting." },
  { id: "playful", title: "Make it fun", line: "A knowing look. A little mischief." },
  { id: "sharp", title: "Call me out", line: "Sharper jokes. Same respect." },
];

function download(value, filename) {
  const href = URL.createObjectURL(new Blob([typeof value === "string" ? value : JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = href; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
function PrivateCopyDialog({ value, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="df-export-dialog" aria-labelledby="df-export-title" onCancel={onClose}>
    <button className="button button--secondary" onClick={onClose}>Close</button>
    <h2 id="df-export-title">Your private copy</h2><p>This includes your exact answers and reading. Save it somewhere private.</p>
    <button className="button button--primary" onClick={() => download(value, "genii-private-reading.json")}>Download JSON file</button>
    <details><summary>If your browser blocks the download</summary><p>Select and copy the file contents below into a text file.</p><label>Private reading data<textarea readOnly value={value} onFocus={(event) => event.target.select()} /></label></details>
  </dialog>;
}
function loadSaved() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); return { session: raw ? Session.restoreSession(raw) : null, storage: true, error: "", recoveryRaw: null }; }
  catch { return { session: null, storage: raw !== null, recoveryRaw: raw, error: raw ? "This saved reading belongs to a different draft or could not be verified. Keep a private copy below before starting a new conversation." : "Saving is unavailable in this browser. You can still play in this tab." }; }
}
function chapterIdFor(template) { return SECTION_CHAPTERS[template?.sectionId] || 2; }
function legacyQuestion(template, presentation) {
  const sourceStatus = template.event.sourceStatus;
  const heldout = template.event.phase === "heldout";
  const actual = sourceStatus === "retrospective_self_report";
  const hypothetical = sourceStatus === "hypothetical_choice";
  return {
    id: template.itemId,
    chapter: chapterIdFor(presentation),
    title: presentation?.prompt || template.prompt,
    setup: "",
    role: heldout ? "test" : actual ? "actual" : hypothetical ? "hypothetical" : "preference",
    kind: template.event.kind,
    test: heldout,
    responseFormat: template.responseFormat === "multi_choice" ? "multi_select" : template.responseFormat,
    sourceLabel: heldout ? "A final check" : actual ? "From your life" : hypothetical ? "Picture this" : "Your preference",
    meta: { evidence: heldout ? "heldout" : actual ? "actual_event" : sourceStatus },
    options: template.options.map((option) => ({ id: option.id, text: option.text, reaction: option.reaction })),
    exits: template.exits.map((exit) => ({ ...exit, exit: true })),
  };
}
function legacyState(session, route) {
  const answers = Object.fromEntries(Object.entries(session?.answers || {}).map(([id, answer]) => [id, answer?.value ?? answer]));
  const notes = Object.fromEntries(Object.entries(session?.answers || {}).filter(([, answer]) => answer?.note).map(([id, answer]) => [id, answer.note]));
  const other = Object.fromEntries(Object.entries(session?.answers || {}).filter(([, answer]) => answer?.otherText).map(([id, answer]) => [id, answer.otherText]));
  const cursor = route.findIndex((question) => !Object.hasOwn(answers, question.id));
  return { answers, notes, other, bindings: {}, started: Boolean(session), cursor: cursor < 0 ? route.length : cursor, locked: session && [Session.SESSION_PHASES.HELDOUT, Session.SESSION_PHASES.COMPLETE].includes(session.phase) ? session.freeze : null, testSeen: Boolean(session?.priorExposure) };
}
function chapterForId(id) { return (Survey.CHAPTERS || []).find((chapter) => chapter.id === id) || Survey.CHAPTERS?.[0]; }
function chapterCount(route, state, id) {
  const questions = route.filter((question) => question.chapter === id);
  const resolved = questions.filter((question) => Object.hasOwn(state.answers || {}, question.id)).length;
  return { total: questions.length, resolved, answered: resolved };
}
class ReadingBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main className="app-shell"><p className="eyebrow">Your saved answers are untouched</p><h1>This reading needs a refresh.</h1><p>The survey may have changed while this tab was open.</p><button className="button button--primary" onClick={() => window.location.reload()}>Reload safely</button></main> : this.props.children; }
}
export default function DossierApp() { return <ReadingBoundary><DossierAppInner /></ReadingBoundary>; }

function DossierAppInner() {
  const [initial] = useState(loadSaved);
  const [session, setSession] = useState(initial.session);
  const [storageOK, setStorageOK] = useState(initial.storage);
  const [error, setError] = useState(initial.error);
  const [recoveryRaw, setRecoveryRaw] = useState(initial.recoveryRaw);
  const [screen, setScreen] = useState("landing");
  const [route, setRoute] = useState(initial.session?.config.route || "everyday");
  const [voice, setVoice] = useState(initial.session?.config.voice || "playful");
  const [personal, setPersonal] = useState(initial.session?.config.personal || false);
  const [setupStep, setSetupStep] = useState(0);
  const [setupDraft, setSetupDraft] = useState(null);
  const [introChapter, setIntroChapter] = useState(2);
  const [motionOn, setMotionOn] = useState(() => { try { return localStorage.getItem(MOTION_KEY) !== "off"; } catch { return true; } });
  const [draft, setDraft] = useState(null);
  const [note, setNote] = useState("");
  const [otherText, setOtherText] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [privateCopy, setPrivateCopy] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const heading = useRef(null);
  const bank = useMemo(() => getBank(session?.config || { route, voice, personal }), [session?.config?.route, session?.config?.voice, session?.config?.personal, route, voice, personal]);
  const selectedBank = useMemo(() => getBank({ route, voice, personal }), [route, voice, personal]);
  const legacyRoute = useMemo(() => bank.templates.map((template) => legacyQuestion(template, bank.presentation[template.itemId])), [bank]);
  const questions = useMemo(() => new Map(legacyRoute.map((question) => [question.id, question])), [legacyRoute]);
  const current = session ? Session.currentQuestion(session) : null;
  const currentQuestion = editing ? questions.get(editing) : current ? questions.get(current.itemId) : null;
  const state = legacyState(session, legacyRoute);
  const chapters = bank.sections.filter(section => legacyRoute.some(q => q.chapter === SECTION_CHAPTERS[section.id])).map(section => ({...chapterForId(SECTION_CHAPTERS[section.id]), id:SECTION_CHAPTERS[section.id], title:section.title, kicker:"Your next chapter", subtitle:({everyday_life:"Small decisions, last-minute changes, and the version of you that shows up in ordinary life.",work_study:"A foggy brief. A visible mistake. The moments when work gets interesting.",social_theater:"Group chats, half-made plans, and the tiny politics of being around people.",close_connections:"A few closer scenes. Skip anything you would rather keep to yourself.",secret_menu:"A little imagination. These scenes are make-believe, and stay that way in your reading.",prediction_booth:"Eight fresh choices. Genii has already put its guesses down."})[section.id]}));
  const currentChapter = chapters.find(c=>c.id === (currentQuestion?.chapter || introChapter)) || chapterForId(introChapter);
  const result = session?.phase === Session.SESSION_PHASES.COMPLETE ? Session.getResult(session) : null;
  const profileDone = Boolean(session && session.profileIds.every((id) => Object.hasOwn(session.answers || {}, id)));

  useEffect(() => { document.body.dataset.motion = motionOn ? "on" : "off"; try { localStorage.setItem(MOTION_KEY, motionOn ? "on" : "off"); } catch {} }, [motionOn]);
  useEffect(() => {
    if (!currentQuestion) return;
    setDraft(session?.answers?.[currentQuestion.id]?.value ?? null); setNote(session?.answers?.[currentQuestion.id]?.note || ""); setOtherText(session?.answers?.[currentQuestion.id]?.otherText || "");
    heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentQuestion?.id, session?.attemptId, session?.phase]);
  useEffect(() => { if (["complete", "interlude", "gateway", "setup", "landing"].includes(screen)) window.scrollTo({ top: 0, behavior: "instant" }); }, [screen]);
  const save = (next) => { setSession(next); setRecoveryRaw(null); try { localStorage.setItem(SAVE_KEY, Session.serializeSession(next)); setStorageOK(true); } catch { setStorageOK(false); } return next; };
  const act = (action) => { setError(""); try { action(); } catch (failure) { setError("That step could not be completed. Your last saved answers are still available. Please try again."); console.error(failure); } };
  const start = (personalChoice = personal) => act(() => { let priorExposure = false; try { priorExposure = localStorage.getItem(SEEN_KEY) === "yes"; } catch {} const next = Session.createSession({ route, voice, personal:personalChoice, priorExposure }); save(next); setEditing(null); setConfirmRestart(false); setIntroChapter(chapterIdFor(next.presentation[next.profileIds[0]])); setScreen("interlude"); });
  const resume = () => { setEditing(null); setConfirmRestart(false); if (!session) return setScreen("setup"); if (session.phase === Session.SESSION_PHASES.COMPLETE) return setScreen("complete"); if (session.phase === Session.SESSION_PHASES.READY_TO_FREEZE) return setScreen("gateway"); const question = Session.currentQuestion(session); if (question) { setIntroChapter(questions.get(question.itemId)?.chapter || 2); setScreen("survey"); } };
  const commit = (value, meta = {}) => act(() => {
    if (!currentQuestion || !session) return;
    const options = { otherText: meta.otherText, note: meta.note };
    if (editing) { const previous = session.answers[editing]; if (JSON.stringify(previous?.value) === JSON.stringify(value) && (previous?.note || "") === (options.note || "") && (previous?.otherText || "") === (options.otherText || "")) { setEditing(null); setScreen("review"); return; } const editable = session.phase === Session.SESSION_PHASES.COMPLETE ? Session.beginRevision(session) : session; save(Session.editProfileAnswer(editable, editing, value, options)); setEditing(null); setScreen("review"); return; }
    const next = save(Session.answerQuestion(session, currentQuestion.id, value, options));
    if (next.phase === Session.SESSION_PHASES.READY_TO_FREEZE) return setScreen("gateway");
    if (next.phase === Session.SESSION_PHASES.COMPLETE) return setScreen("complete");
    const upcoming = Session.currentQuestion(next); const nextQuestion = upcoming ? questions.get(upcoming.itemId) : null;
    if (nextQuestion && nextQuestion.chapter !== currentQuestion.chapter) { setIntroChapter(nextQuestion.chapter); setScreen("interlude"); } else setScreen("survey");
  });
  const seal = () => act(() => { const next = save(Session.freezeSession(session)); try { localStorage.setItem(SEEN_KEY, "yes"); } catch {} const question = Session.currentQuestion(next); setIntroChapter(question ? questions.get(question.itemId)?.chapter || 9 : 9); setScreen("survey"); });
  const openReview = () => { if(session) setScreen("review"); else setScreen("landing"); };
  const exportPrivate = () => act(() => setPrivateCopy(Session.serializeSession(session)));
  const goHome = () => { setEditing(null); setScreen("landing"); window.scrollTo({ top: 0, behavior: "instant" }); };
  const visit = (question) => act(() => {
    setMapOpen(false);
    if (!question || !session || !Object.hasOwn(session.answers || {}, question.id)) return;
    setEditing(question.id); setScreen("survey");
  });
  const closeReview = () => setScreen(current => current !== "review" ? current : session?.phase === "complete" ? "complete" : session?.phase === "ready_to_freeze" ? "gateway" : "survey");
  const setupQuestions = [
    {id:"setup-route",title:"Which version of you are we meeting?",options:ROUTES.map(item=>({id:item.id,text:`${item.title} — ${item.line}`}))},
    {id:"setup-voice",title:"How should Genii talk to you?",options:VOICES.map(item=>({id:item.id,text:`${item.title} — ${item.line}`}))},
    {id:"setup-personal",title:"How close should this conversation get?",options:[{id:"light",text:"Keep it light. Everyday scenes, work, and social moments."},{id:"personal",text:"Include closer connections and a few private-thought scenes. I can still skip anything."}]},
  ].map(q=>({...q,setupPreference:true,chapter:1,sourceLabel:"Your preferences",exits:[],meta:{evidence:"stated_preference"}}));
  const setupState = {answers: Object.fromEntries(setupQuestions.slice(0,setupStep).map((q,i)=>[q.id,i===0?route:voice])),notes:{},other:{},bindings:{}};
  const setupContinue = value => {
    if(setupStep === 0) setRoute(value);
    if(setupStep === 1) setVoice(value);
    if(setupStep < 2) {setSetupStep(setupStep+1);setSetupDraft(null);return;}
    setPersonal(value === "personal");
    if(session && Object.keys(session.answers || {}).length && !confirmRestart) {setConfirmRestart(true);return;}
    start(value === "personal");setSetupStep(0);setSetupDraft(null);
  };


  return <MotionConfig reducedMotion={motionOn ? "user" : "always"}>
    <div className="app-shell" data-screen={screen}>
      <AmbientWorld scene={screen === "survey" ? "quiz" : screen} chapter={currentChapter?.id || 2} pulseKey={`${screen}-${currentQuestion?.id || ""}-${draft || ""}`} />
      <Header state={state} storageOK={storageOK} onHome={goHome} onMap={() => setMapOpen(true)} onMore={() => setMoreOpen(true)} motionOn={motionOn} setMotionOn={setMotionOn} />
      {error && !["survey", "setup", "gateway"].includes(screen) && <p className="storage-banner" role="alert">{error}</p>}
      {recoveryRaw && <div className="storage-banner"><button className="button button--secondary" onClick={() => setPrivateCopy(recoveryRaw)}>Keep the previous saved file</button><p>A new conversation will replace this device’s saved draft.</p></div>}
      {!storageOK && <div className="storage-banner" role="status">Saving unavailable. Keep this tab open or export your answers.</div>}
      {screen === "landing" && <Landing state={state} onBegin={() => session && Object.keys(session.answers || {}).length ? resume() : setScreen("setup")} onHow={() => setHowOpen(true)} journey={{ maxQuestions: selectedBank.profileIds.length + selectedBank.heldoutIds.length, profileQuestions: selectedBank.profileIds.length, chapterCount: chapters.length }} />}
      {screen === "setup" && <><QuizView q={setupQuestions[setupStep]} chapter={{id:1,title:"Before we get oddly specific"}} state={setupState} route={setupQuestions} chapters={[{id:1,title:"Your preferences"}]} draft={setupDraft} setDraft={setSetupDraft} note="" setNote={()=>{}} otherText="" setOtherText={()=>{}} onContinue={setupContinue} onBack={setupStep ? ()=>{setSetupStep(setupStep-1);setSetupDraft(null);} : goHome} onSkip={()=>{}} onMap={()=>setHowOpen(true)} storageOK={storageOK} error={error}/>{confirmRestart && session && <div className="storage-banner" role="status">Continuing replaces the current saved reading. <button onClick={exportPrivate}>Keep a private copy first</button>, or press Continue again to start.</div>}</>}
      {screen === "interlude" && currentChapter && <Interlude chapter={currentChapter} state={state} route={legacyRoute} countOverride={chapterCount(legacyRoute, state, currentChapter.id)} onContinue={() => setScreen("survey")} onSave={goHome} />}
      {screen === "gateway" && <Gateway state={state} trainingDone={profileDone} onSeal={seal} onSave={goHome} onReview={openReview} error={error} />}
      {screen === "survey" && currentQuestion && <QuizView q={currentQuestion} chapter={currentChapter} state={state} route={legacyRoute} chapters={chapters} draft={draft} setDraft={setDraft} note={note} setNote={setNote} otherText={otherText} setOtherText={setOtherText} onContinue={editing && (currentQuestion.test || session.phase === "heldout") ? ()=>{setEditing(null);setScreen("review");} : commit} onBack={editing ? () => { setEditing(null); setScreen("review"); } : session.phase === "profile" && legacyRoute.findIndex(q=>q.id===currentQuestion.id)>0 ? ()=>visit(legacyRoute[legacyRoute.findIndex(q=>q.id===currentQuestion.id)-1]) : null} onSkip={commit} onMap={() => setMapOpen(true)} readOnly={Boolean(editing && (currentQuestion.test || session.phase === "heldout"))} storageOK={storageOK} error={error} />}
      <ReviewDialog open={screen === "review"} onClose={closeReview} state={state} route={legacyRoute} onVisit={visit}/>
      {screen === "complete" && result && <div><PersonalityDossier result={result} storageStatus={storageOK ? "saved" : "unavailable"} onExport={exportPrivate} onRestart={() => { setScreen("setup"); setConfirmRestart(false); }} onEdit={openReview} onCorrection={(claimId, answer) => act(() => save(Session.addCorrection(session, claimId, answer)))} /></div>}
      <ChapterMap chapters={chapters} open={mapOpen} onClose={() => setMapOpen(false)} state={state} route={legacyRoute} onVisit={visit} onHow={() => setHowOpen(true)} />
      <MoreDialog open={moreOpen} onClose={() => setMoreOpen(false)} onHow={() => setHowOpen(true)} onReview={openReview} onExport={()=>session ? exportPrivate() : recoveryRaw ? setPrivateCopy(recoveryRaw) : setHowOpen(true)} onMap={() => setMapOpen(true)} onSave={goHome} onReset={() => { setMoreOpen(false); setScreen("setup"); setConfirmRestart(true); }} motionOn={motionOn} setMotionOn={setMotionOn} />
      <HowDialog profileCount={selectedBank.profileIds.length} open={howOpen} onClose={() => setHowOpen(false)} />
      {privateCopy && <PrivateCopyDialog value={privateCopy} onClose={() => setPrivateCopy(null)} />}
    </div>
  </MotionConfig>;
}
