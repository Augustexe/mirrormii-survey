import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { AmbientWorld } from "./components/AmbientWorld.jsx";
import * as Run from "./persona/session.js";
import { KIT, CHAPTERS } from "./persona/kit.js";
import * as Friend from "./persona/friend.js";
import { readHash, linkFor, LinkError } from "./persona/links.js";
import { loadRun, restoreRun, loadFriendPlays, saveFriendPlay, deleteAllGeniiData, MOTION_KEY } from "./persona/store.js";
import { resultView } from "./persona/views.js";
import { PersonaHeader, PersonaLanding, SetupView, BlockedView, PersonaInterlude, interludeFor, PersonaQuizView, LockView } from "./persona/PersonaScreens.jsx";
import { PersonaResult } from "./persona/PersonaResult.jsx";
import { FriendGame } from "./persona/FriendGame.jsx";
import { FriendResultsView } from "./persona/FriendResultsView.jsx";
import { PersonaChapterMap, PersonaHowDialog, PersonaMoreDialog, ConfirmDialog } from "./persona/PersonaDialogs.jsx";
import "./styles.css";
import "./voice-polish.css";
import "./launch.css";
import "./result-visuals.css";
import "./world.css";
import "./jewels.css";
import "./living-world.css";
import "./question-surfaces.css";
import "./result-details.css";
import "./micro-details.css";
import "./domain-surfaces.css";
import "./result-final.css";
import "./persona/persona.css";

const storage = () => { try { return window.localStorage; } catch { return null; } };
const nowISO = () => new Date().toISOString();
const EMPTY_GUESSES = { level1: {}, level2: {}, why: {}, level3: [], level4: null };

function download(text, filename) {
  const href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

// Where a run should open: chapter starts get their title card, the finale opens on the lock screen.
function screenFor(run) {
  const step = Run.currentStep(run);
  if (step.kind === "setup") return "setup";
  if (step.kind === "lock") return "lock";
  if (step.kind === "result") return "result";
  if (step.phase === "finale" && step.index === 1) return "lock";
  if (step.phase !== "finale" && step.index === 1) return "interlude";
  return "card";
}

function clearHash() {
  if (typeof window !== "undefined" && window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

class Boundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="interlude-page persona-blocked">
        <div className="interlude-copy">
          <span className="chapter-kicker">Your answers are untouched</span>
          <h1>Genii tripped over something.</h1>
          <p>Reloading usually fixes it. Your saved answers stay in this browser.</p>
          <div className="hero-actions"><button type="button" className="button button--primary" onClick={() => window.location.reload()}>Reload</button></div>
        </div>
      </main>
    );
  }
}

export default function PersonaApp() {
  return <Boundary><PersonaAppInner /></Boundary>;
}

function PersonaAppInner() {
  const [initial] = useState(() => { const s = storage(); return s ? loadRun(s) : { state: null, error: "unavailable", raw: null }; });
  const [run, setRun] = useState(initial.state);
  const [broken, setBroken] = useState(initial.error && initial.error !== "unavailable" ? { message: initial.message, raw: initial.raw } : null);
  const [storageOK, setStorageOK] = useState(initial.error !== "unavailable");
  const [screen, setScreen] = useState("landing");
  const [friend, setFriend] = useState(null);
  const [friendViewId, setFriendViewId] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [motionOn, setMotionOn] = useState(() => { try { return localStorage.getItem(MOTION_KEY) !== "off"; } catch { return true; } });
  const [notice, setNotice] = useState("");
  // Who a friend's "Your turn" should send a link back to. Held in memory until setup succeeds, so an under-13
  // stop leaves nothing saved.
  const [pendingReturn, setPendingReturn] = useState(null);
  // The run exactly as this tab last read or wrote it. A write only goes through if storage still holds it,
  // so a stale tab can never overwrite a newer run (a reply imported elsewhere, or a lock made in another tab).
  const lastRaw = useRef(initial.raw);

  useEffect(() => { document.body.dataset.motion = motionOn ? "on" : "off"; }, [motionOn]);
  const changeMotion = (on) => {
    setMotionOn(on);
    try { localStorage.setItem(MOTION_KEY, on ? "on" : "off"); } catch { /* preference only */ }
  };

  const adoptStored = useCallback((raw, message) => {
    lastRaw.current = raw;
    setFriendViewId(null);
    if (raw === null) {
      setRun(null);
      setScreen((prev) => (["friend", "linkError", "blocked"].includes(prev) ? prev : "landing"));
    } else {
      try {
        const next = restoreRun(raw);
        setRun(next);
        setScreen((prev) => (["friend", "linkError", "blocked", "landing"].includes(prev) ? prev : next.setup ? screenFor(next) : "landing"));
      } catch (e) {
        setRun(null);
        setBroken({ message: e.message, raw });
        setScreen("landing");
      }
    }
    if (message) setNotice(message);
  }, []);

  // Saves the run (or removes it for null). Returns the saved run, or null when another tab changed it first.
  const persist = useCallback((next) => {
    const s = storage();
    if (!s) { setRun(next); setStorageOK(false); return next; }
    let current = null;
    try { current = s.getItem(Run.STORAGE_KEY); } catch { /* unreadable storage is handled by the write below */ }
    if (current !== lastRaw.current) {
      adoptStored(current, "This game changed in another tab, so Genii loaded the newest version. Nothing was lost.");
      return null;
    }
    const raw = next ? Run.serialize(next) : null;
    try {
      if (raw === null) s.removeItem(Run.STORAGE_KEY); else s.setItem(Run.STORAGE_KEY, raw);
      lastRaw.current = raw;
      setStorageOK(true);
    } catch { setStorageOK(false); }
    setRun(next);
    return next ?? true;
  }, [adoptStored]);

  // Another tab saved: follow it.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== null && e.key !== Run.STORAGE_KEY) return;
      let now = null;
      try { now = localStorage.getItem(Run.STORAGE_KEY); } catch { return; }
      if (now === lastRaw.current) return;
      adoptStored(now, "This game changed in another tab, so Genii loaded the newest version.");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [adoptStored]);

  // Links: #play=... opens the friend game, #reply=... brings a friend's answers home.
  const openHash = useCallback((hash, current) => {
    const link = readHash(hash);
    if (!link) return false;
    setError("");
    if (link.kind === "play") {
      try {
        const ch = Friend.parseChallenge(link.payload);
        const saved = storage() ? loadFriendPlays(storage())[ch.id] : null;
        setFriend({ ch, isOwnLink: Boolean(current && current.challenges.some((c) => c.id === ch.id)), play: saved || { payload: link.payload, under18: ch.mk ? null : false, stage: "intro", step: 0, guesses: EMPTY_GUESSES, updatedAt: nowISO() } });
        setScreen("friend");
      } catch (e) {
        clearHash();
        setLinkError(e instanceof LinkError ? e.message : "This link couldn't be opened.");
        setScreen("linkError");
      }
      return true;
    }
    try {
      Friend.parseReply(link.payload);
      if (!current) throw new LinkError("unknown_challenge", "This reply is for a friend challenge made in another browser. Open it where you took the quiz.");
      const { state, challengeId } = Friend.importReply(current, link.payload, { now: nowISO() });
      clearHash();
      if (!persist(state)) return true;
      setFriendViewId(challengeId);
      setScreen("friendResult");
    } catch (e) {
      clearHash();
      setLinkError(e instanceof LinkError || e instanceof Run.PersonaError ? e.message : "This reply couldn't be opened.");
      setScreen("linkError");
    }
    return true;
  }, [persist]);

  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    openHash(window.location.hash, runRef.current);
    const onHash = () => openHash(window.location.hash, runRef.current);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [openHash]);

  const step = useMemo(() => (run ? Run.currentStep(run) : null), [run]);
  const view = useMemo(() => {
    if (!run || !step || step.kind !== "result") return null;
    try { return resultView(run); } catch (e) { return { error: e.message }; }
  }, [run, step]);

  const goHome = () => { setDialog(null); setScreen("landing"); setError(""); setFriend(null); clearHash(); window.scrollTo({ top: 0, behavior: "instant" }); };
  const begin = () => {
    setError("");
    if (!run || !run.setup) return setScreen("setup");
    setScreen(screenFor(run));
  };
  const startWithSetup = (setup) => {
    try {
      const started = Run.startRun(Run.newRun({ now: nowISO() }), setup, { now: nowISO() });
      const next = persist(pendingReturn ? { ...started, returnTo: pendingReturn } : started);
      if (!next) return;
      setPendingReturn(null);
      setScreen(screenFor(next));
    } catch (e) { setError(e.message); }
  };
  const under13 = () => {
    setPendingReturn(null);
    if (run && !run.setup) persist(null);
    setScreen("blocked");
  };
  const answer = (value, meta) => {
    if (!run || busy) return;
    const before = Run.currentStep(run);
    try {
      setBusy(true);
      const next = persist(Run.answerCard(run, before.card.id, value, { ...meta, now: nowISO() }));
      if (!next) return;
      const after = Run.currentStep(next);
      setError("");
      if (after.kind === "lock") setScreen("lock");
      else if (after.kind === "result") setScreen("result");
      else if (after.phase !== before.phase || after.chapter !== before.chapter) setScreen(after.phase === "finale" ? "card" : "interlude");
      else setScreen("card");
    } catch (e) {
      setError(e instanceof Run.PersonaError ? e.message : "That answer couldn't be saved. Try again.");
      setCardKey((k) => k + 1);
    } finally { setBusy(false); }
  };
  const lock = () => {
    try { persist(Run.lockGuesses(run, { now: nowISO() })); setError(""); } catch (e) { setError(e.message); }
  };
  const restart = () => {
    const keep = run ? run.returnTo : null;
    if (!persist(null)) return;
    setPendingReturn(keep);
    setFriendViewId(null);
    setScreen("setup");
  };
  const deleteAll = () => {
    const s = storage();
    if (s) deleteAllGeniiData(s);
    lastRaw.current = null;
    setPendingReturn(null);
    setRun(null); setBroken(null); setFriend(null); setFriendViewId(null); clearHash(); setScreen("landing");
    setMotionOn(true);
  };
  const downloadData = () => {
    const plays = storage() ? loadFriendPlays(storage()) : {};
    download(JSON.stringify({ about: "Your Genii data from this browser. It includes your private answers.", run, friendGames: plays }, null, 2), "genii-my-data.json");
  };
  const friendAction = (type, payload) => {
    if (type === "create") {
      try {
        const { state, challenge } = Friend.createChallenge(run, payload, { now: nowISO() });
        if (!persist(state)) return { error: "This game changed in another tab. Genii loaded the newest version; try again." };
        return {
          label: Friend.friendLabel(challenge.rel, challenge.emoji),
          link: linkFor("play", Friend.challengePayload(state, challenge)),
          invite: Friend.inviteText(challenge.rel, challenge.invite, { stings: challenge.stings, sentBefore: challenge.sentBefore }),
        };
      } catch (e) { return { error: e.message }; }
    }
    if (type === "open") { setFriendViewId(payload); setScreen("friendResult"); return null; }
    if (type === "import") {
      const link = readHash(String(payload || "").trim());
      if (!link || link.kind !== "reply") return { error: "That isn't a reply link. It should contain #reply=." };
      try {
        const { state, challengeId } = Friend.importReply(run, link.payload, { now: nowISO() });
        if (!persist(state)) return { error: "This game changed in another tab. Genii loaded the newest version; try again." };
        setFriendViewId(challengeId);
        setScreen("friendResult");
        return null;
      } catch (e) { return { error: e.message }; }
    }
    return null;
  };
  const friends = useMemo(() => {
    if (!run || !view || view.error) return null;
    const played = new Set(run.friendResults.map((r) => r.challengeId));
    return {
      setup: run.setup,
      returnTo: run.returnTo,
      defaults: { rel: run.returnTo ? run.returnTo.rel : null, name: run.challenges.length ? run.challenges[run.challenges.length - 1].name : "" },
      challenges: [...run.challenges].reverse().map((ch) => ({ id: ch.id, label: Friend.friendLabel(ch.rel, ch.emoji), played: played.has(ch.id), link: linkFor("play", Friend.challengePayload(run, ch)) })),
      ranking: run.friendResults.length ? Friend.ranking(run) : null,
    };
  }, [run, view]);
  const friendView = useMemo(() => (run && friendViewId && screen === "friendResult" ? Friend.ownerFriendView(run, friendViewId) : null), [run, friendViewId, screen]);
  const friendProgress = (play) => {
    const entry = { ...play, updatedAt: nowISO() };
    setFriend((f) => ({ ...f, play: entry }));
    const s = storage();
    if (s) saveFriendPlay(s, friend.ch.id, entry);
  };
  const yourTurn = () => {
    const back = { name: friend.ch.name, rel: friend.ch.rel };
    setFriend(null);
    clearHash();
    if (run && run.setup) {
      const next = run.returnTo ? run : persist({ ...run, returnTo: back });
      if (next) setScreen(screenFor(next));
      return;
    }
    setPendingReturn(back);
    setScreen("setup");
  };
  const progress = useMemo(() => {
    if (!run || !run.setup) return {};
    const route = Run.routeFor(run);
    const out = {};
    for (const ch of CHAPTERS) {
      const cards = route.filter((c) => c.chapter === ch.id);
      out[ch.id] = { total: cards.length, done: cards.filter((c) => Object.prototype.hasOwnProperty.call(run.answers, c.id)).length };
    }
    if (run.frozen) out[8] = { total: KIT.finale.length, done: Object.keys(run.finale).length };
    return out;
  }, [run]);

  const scene = { landing: "landing", interlude: "intro", card: "quiz", setup: "quiz", lock: "gateway", result: "complete", friend: "quiz", friendResult: "complete" }[screen] || "landing";
  const hasRun = Boolean(run && run.setup);

  return (
    <MotionConfig reducedMotion={motionOn ? "user" : "always"}>
      <div className="app-shell persona-app" data-screen={screen}>
        <AmbientWorld scene={scene} chapter={step && typeof step.chapter === "number" ? step.chapter : 2} pulseKey={`${screen}-${step && step.card ? step.card.id : ""}`} />
        <PersonaHeader saved={run && screen !== "friend" ? Run.answeredCount(run) : 0} onHome={goHome} onMap={hasRun && screen !== "friend" ? () => setDialog("map") : null} onMore={() => setDialog("more")} motionOn={motionOn} setMotionOn={changeMotion} />
        {!storageOK && <div className="storage-banner" role="status">Saving isn't available in this browser. Keep this tab open to finish.</div>}
        {notice && (
          <div className="storage-banner persona-broken" role="status">
            <p>{notice}</p>
            <button type="button" className="button button--quiet" onClick={() => setNotice("")}>OK</button>
          </div>
        )}
        {broken && screen === "landing" && (
          <div className="storage-banner persona-broken" role="alert">
            <p>{broken.message} You can keep a copy of the old save, then start fresh.</p>
            <button type="button" className="button button--secondary" onClick={() => download(broken.raw || "", "genii-old-save.json")}>Download the old save</button>
            <button type="button" className="button button--quiet" onClick={() => { const s = storage(); if (s) s.removeItem(Run.STORAGE_KEY); lastRaw.current = null; setBroken(null); }}>Clear it</button>
          </div>
        )}

        {screen === "landing" && <PersonaLanding progress={!run || !run.setup ? null : step.kind === "result" ? "result" : "run"} onBegin={begin} onHow={() => setDialog("how")} />}
        {screen === "setup" && <SetupView busy={busy} onBack={goHome} onUnder13={under13} onDone={startWithSetup} />}
        {screen === "blocked" && <BlockedView onHome={goHome} />}
        {screen === "interlude" && step && step.kind === "card" && (
          <PersonaInterlude chapter={interludeFor(step)} count={step.phase === "chapter" ? step.size : 0} onContinue={() => setScreen("card")} onSave={goHome} />
        )}
        {screen === "card" && step && step.kind === "card" && (
          <PersonaQuizView step={step} setup={run.setup} onAnswer={answer} onMap={() => setDialog("map")} busy={busy} error={error} cardKey={`${step.card.id}-${cardKey}`} rushing={Run.recentlyRushed(run)} />
        )}
        {screen === "lock" && run && (step.kind === "lock" || (step.kind === "card" && step.phase === "finale")) && (
          <LockView locked={Boolean(run.frozen)} lockHash={run.lockHash} onLock={lock} onStart={() => setScreen("card")} onSave={goHome} busy={busy} error={error} />
        )}
        {screen === "result" && view && !view.error && (
          <PersonaResult view={view} friends={friends} onFriendAction={friendAction} storageOK={storageOK}
            onRestart={() => setDialog("restart")} onDownload={downloadData} onDelete={() => setDialog("delete")} />
        )}
        {screen === "result" && view && view.error && (
          <main className="interlude-page persona-blocked"><div className="interlude-copy">
            <span className="chapter-kicker">Can't score this run</span>
            <h1>{view.error}</h1>
            <p>Genii only scores a finale against the guesses it locked. Start a fresh run to play again.</p>
            <div className="hero-actions"><button type="button" className="button button--primary" onClick={() => setDialog("restart")}>Start a fresh run</button></div>
          </div></main>
        )}
        {screen === "friendResult" && friendView && (
          <FriendResultsView view={friendView} onBack={() => setScreen("result")} onHideRoast={(hidden) => persist(Friend.setRoastHidden(run, friendViewId, hidden))} />
        )}
        {screen === "friend" && friend && (
          <FriendGame ch={friend.ch} play={friend.play} isOwnLink={friend.isOwnLink} onProgress={friendProgress} onYourTurn={yourTurn} onLeave={goHome} />
        )}
        {screen === "linkError" && (
          <main className="interlude-page persona-blocked"><div className="interlude-copy">
            <span className="chapter-kicker">That link didn't work</span>
            <h1>{linkError}</h1>
            <p>Ask for a fresh link, or start your own game.</p>
            <div className="hero-actions"><button type="button" className="button button--primary" onClick={() => { setLinkError(null); goHome(); }}>Go to Genii</button></div>
          </div></main>
        )}

        <PersonaChapterMap open={dialog === "map"} onClose={() => setDialog(null)} progress={progress} />
        <PersonaHowDialog open={dialog === "how"} onClose={() => setDialog(null)} />
        <PersonaMoreDialog open={dialog === "more"} onClose={() => setDialog(null)} hasRun={hasRun} motionOn={motionOn} setMotionOn={changeMotion}
          onMap={() => setDialog("map")} onHow={() => setDialog("how")} onHome={goHome} onDownload={downloadData}
          onRestart={() => setDialog("restart")} onDelete={() => setDialog("delete")} />
        <ConfirmDialog open={dialog === "restart"} onClose={() => setDialog(null)} onConfirm={restart} title="Play again from the start?"
          body="This clears this run from this browser, including your result and your friend links. Download your data first if you want to keep it." confirmLabel="Start again" keepLabel="Keep my run" />
        <ConfirmDialog open={dialog === "delete"} onClose={() => setDialog(null)} onConfirm={deleteAll} title="Delete everything Genii saved here?" danger
          body="Your answers, result, friend links, friends' replies and any friend game you were playing in this browser will be removed. This can't be undone." confirmLabel="Delete my data" keepLabel="Keep it" />
      </div>
    </MotionConfig>
  );
}
