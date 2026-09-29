import "./system/layers.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { Backdrop } from "./art/index.js";
import { setTheme, setThemeForVoice } from "./system/index.js";
import * as Run from "./persona/session.js";
import * as Friend from "./persona/friend.js";
import { readHash, linkFor, LinkError } from "./persona/links.js";
import { loadRun, restoreRun, loadFriendPlays, saveFriendPlay, deleteAllGeniiData, MOTION_KEY } from "./persona/store.js";
import { PersonaHeader, PersonaLanding, SetupView, LobbyView, PersonaInterlude, interludeFor, PersonaHowDialog, PersonaMoreDialog, ConfirmDialog, Toast } from "./persona/screens/index.js";
import { PersonaQuizView, LockView, PersonaChapterMap, FriendGame, FriendResultsView } from "./persona/play/index.js";
import { PersonaResult, resultView } from "./persona/reveal/index.js";


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
  if (step.kind === "lobby") return "lobby";
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
      <main className="mm-screen mm-notice-page">
        <div className="mm-panel mm-glass">
          <span className="mm-kicker">Your answers are untouched</span>
          <h1 className="mm-panel__title">Genii tripped over something.</h1>
          <p className="mm-panel__note">Reloading usually fixes it. Your saved answers stay in this browser.</p>
          <div className="mm-panel__foot"><button type="button" className="mm-btn mm-btn--primary" onClick={() => window.location.reload()}>Reload</button></div>
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
  // Who a friend's "Your turn" should send a link back to. Held in memory until setup succeeds.
  const [pendingReturn, setPendingReturn] = useState(null);
  // The run exactly as this tab last read or wrote it. A write only goes through if storage still holds it,
  // so a stale tab can never overwrite a newer run (a reply imported elsewhere, or a lock made in another tab).
  const lastRaw = useRef(initial.raw);

  useEffect(() => { document.body.dataset.motion = motionOn ? "on" : "off"; }, [motionOn]);
  // The lobby voice sets the light for the whole run and the result (DESIGN-DIRECTION 3.4). The lobby screen
  // previews and commits it itself; everywhere else the stored voice wins, and no run means Day.
  const voice = run && run.lobby ? run.lobby.voice : null;
  useEffect(() => {
    if (screen === "lobby") return;
    if (voice) setThemeForVoice(voice);
    else setTheme("day");
  }, [voice, screen]);
  const changeMotion = (on) => {
    setMotionOn(on);
    try { localStorage.setItem(MOTION_KEY, on ? "on" : "off"); } catch { /* preference only */ }
  };

  const adoptStored = useCallback((raw, message) => {
    lastRaw.current = raw;
    setFriendViewId(null);
    if (raw === null) {
      setRun(null);
      setScreen((prev) => (["friend", "linkError"].includes(prev) ? prev : "landing"));
    } else {
      try {
        const next = restoreRun(raw);
        setRun(next);
        setScreen((prev) => (["friend", "linkError", "landing"].includes(prev) ? prev : next.setup ? screenFor(next) : "landing"));
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
        setFriend({ ch, isOwnLink: Boolean(current && current.challenges.some((c) => c.id === ch.id)), play: saved || { payload: link.payload, stage: "intro", step: 0, guesses: EMPTY_GUESSES, updatedAt: nowISO() } });
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
  const chooseLobby = (lobby) => {
    if (!run) return setScreen("setup");
    try {
      const next = persist(Run.chooseLobby(run, lobby, { now: nowISO() }));
      if (!next) return;
      setError("");
      setScreen(screenFor(next));
    } catch (e) { setError(e.message); }
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
    return Run.chapterProgress(run);
  }, [run]);

  const hasRun = Boolean(run && run.setup);
  // Backdrop scene (A-08): the voice's light on most screens, the chapter island on interludes, night for the lock.
  const lightScene = voice === "heart" ? "dusk" : voice === "cards" ? "clear" : "day";
  const islandScene = step && step.kind === "card" ? (step.phase === "extra" ? "island-8" : typeof step.chapter === "number" ? `island-${step.chapter}` : lightScene) : lightScene;
  const backdrop = { interlude: islandScene, lock: "night" }[screen] || lightScene;
  const animatedBackdrop = motionOn && ["landing", "interlude", "lock", "result"].includes(screen);
  // Every answered card as a shard, in the order it was served (the interlude mirror and the header rail).
  const shards = useMemo(() => {
    if (!run || !run.lobby || !step || step.kind !== "card" || step.phase === "finale") return [];
    return Run.routeFor(run).slice(0, step.resolved).map((c) => ({ chapter: typeof c.chapter === "number" ? c.chapter : "extras" }));
  }, [run, step]);
  // The shard rail belongs in the header center (5.0). Package B's card screen draws it today; PersonaHeader takes it
  // through `rail`, and exposes #mm-header-center for a portal, so integration can move it without touching B.
  const rail = null;
  const clearBroken = () => { const s = storage(); if (s) s.removeItem(Run.STORAGE_KEY); lastRaw.current = null; setBroken(null); };

  return (
    <MotionConfig reducedMotion={motionOn ? "user" : "always"}>
      <div className="app-shell persona-app mm-app" data-screen={screen}>
        <Backdrop scene={backdrop} animated={animatedBackdrop} />
        <PersonaHeader
          hidden={screen === "result" && view && !view.error}
          onHome={goHome}
          onMore={() => setDialog("more")}
          onMap={hasRun && screen !== "friend" && screen !== "landing" ? () => setDialog("map") : null}
          onSave={hasRun && !["landing", "friend", "friendResult", "linkError"].includes(screen) ? goHome : null}
          rail={rail}
        />
        <div className="mm-toasts">
          {!storageOK && <Toast>Saving isn't available in this browser. Keep this tab open to finish.</Toast>}
          {notice && <Toast actions={[{ label: "OK", onClick: () => setNotice("") }]}>{notice}</Toast>}
          {broken && screen === "landing" && (
            <Toast tone="alert" actions={[{ label: "Keep a copy", onClick: () => download(broken.raw || "", "genii-old-save.json") }, { label: "Start fresh", onClick: clearBroken }]}>
              This save is from an older version of the game. Keep a copy, then start fresh.
            </Toast>
          )}
        </div>

        {screen === "landing" && <PersonaLanding progress={!run || !run.setup ? null : step.kind === "result" ? "result" : "run"} onBegin={begin} onHow={() => setDialog("how")} seed={run ? run.runId : undefined} />}
        {screen === "setup" && <SetupView busy={busy} onBack={goHome} onDone={startWithSetup} />}
        {screen === "lobby" && run && run.setup && !run.lobby && <LobbyView busy={busy} error={error} onBack={goHome} onDone={chooseLobby} />}
        {screen === "interlude" && step && step.kind === "card" && (
          <PersonaInterlude chapter={interludeFor(step, Run.voiceFor(run))} count={step.phase === "chapter" ? step.size : 0} onContinue={() => setScreen("card")} onSave={goHome}
            filled={shards} seed={run.runId} voice={Run.voiceFor(run)} />
        )}
        {screen === "card" && step && step.kind === "card" && (
          <PersonaQuizView step={step} setup={run.setup} onAnswer={answer} onMap={() => setDialog("map")} busy={busy} error={error} cardKey={`${step.card.id}-${cardKey}`} rushing={Run.recentlyRushed(run)} voice={Run.voiceFor(run)} progress={progress} seed={run.runId} />
        )}
        {screen === "lock" && run && (step.kind === "lock" || (step.kind === "card" && step.phase === "finale")) && (
          <LockView locked={Boolean(run.frozen)} lockHash={run.lockHash} onLock={lock} onStart={() => setScreen("card")} onSave={goHome} busy={busy} error={error} progress={progress} seed={run.runId} />
        )}
        {screen === "result" && view && !view.error && (
          <PersonaResult view={view} friends={friends} onFriendAction={friendAction} storageOK={storageOK}
            onRestart={() => setDialog("restart")} onDownload={downloadData} onDelete={() => setDialog("delete")} />
        )}
        {screen === "result" && view && view.error && (
          <main className="mm-screen mm-notice-page"><div className="mm-panel mm-glass">
            <span className="mm-kicker">Can't score this run</span>
            <h1 className="mm-panel__title">This run can't be scored.</h1>
            <p className="mm-panel__note">Genii only scores a finale against the guesses it locked. Start a fresh run to play again.</p>
            <div className="mm-panel__foot"><button type="button" className="mm-btn mm-btn--primary" onClick={() => setDialog("restart")}>Start a fresh run</button></div>
          </div></main>
        )}
        {screen === "friendResult" && friendView && (
          <FriendResultsView view={friendView} onBack={() => setScreen("result")} onHideRoast={(hidden) => persist(Friend.setRoastHidden(run, friendViewId, hidden))} />
        )}
        {screen === "friend" && friend && (
          <FriendGame ch={friend.ch} play={friend.play} isOwnLink={friend.isOwnLink} onProgress={friendProgress} onYourTurn={yourTurn} onLeave={goHome} />
        )}
        {screen === "linkError" && (
          <main className="mm-screen mm-notice-page"><div className="mm-panel mm-glass">
            <span className="mm-kicker">That link didn't work</span>
            <h1 className="mm-panel__title">{linkError}</h1>
            <p className="mm-panel__note">Ask for a fresh link, or start your own game.</p>
            <div className="mm-panel__foot"><button type="button" className="mm-btn mm-btn--primary" onClick={() => { setLinkError(null); goHome(); }}>Go to Genii</button></div>
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
