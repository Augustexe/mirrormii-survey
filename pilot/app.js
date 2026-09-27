/* Genii tag pilot app. Plain DOM, no build step. State saves to localStorage. */
(function () {
  const BANK = window.GENII_PILOT_BANK;
  const E = window.GENII_PILOT_ENGINE;
  const KEY = "genii.tag-pilot.v1";
  const app = document.getElementById("app");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let S = load() || fresh();
  let shownAt = Date.now();

  function fresh() {
    return { step: "intro", i: 0, answers: { setup: {}, stance: {}, scene: {}, sealed: {} }, predictions: null, rating: null, tagChecks: {}, swap: null, startedAt: new Date().toISOString() };
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function go(step, i = 0) { S.step = step; S.i = i; save(); render(); }

  // Interleave domains so consecutive items change topic.
  function interleave(list) {
    const by = {};
    list.forEach((x) => (by[x.domain] = by[x.domain] || []).push(x));
    const out = [];
    const keys = Object.keys(by);
    while (out.length < list.length) for (const k of keys) if (by[k].length) out.push(by[k].shift());
    return out;
  }
  const dims = () => interleave(E.eligibleDimensions(BANK, S.answers.setup));
  const sceneDims = () => dims().filter((d) => d.scene);
  const progress = (n, total) => `<div class="bar" aria-hidden="true"><i style="width:${Math.round((100 * n) / total)}%"></i></div>`;

  function render() {
    shownAt = Date.now();
    const f = { intro, setup, stance, scene, freeze, sealed, result }[S.step] || intro;
    app.innerHTML = f();
    bind();
    const first = app.querySelector("button.opt, .scale button, .primary");
    if (first) first.focus({ preventScroll: true });
  }

  function intro() {
    const resume = Object.keys(S.answers.stance).length > 0;
    return `<p class="eyebrow">Genii tag pilot · ${esc(BANK.version)}</p>
      <h1>Small choices, big tells.</h1>
      <p class="muted">About 7 minutes. Quick takes first, then a few real moments from your life, then Genii makes some sealed guesses. Everything stays in this browser until you export it.</p>
      <div class="row"><button class="primary" data-act="start">Start</button>${resume ? `<button class="opt" style="width:auto" data-act="reset">Start over</button>` : ""}</div>`;
  }

  function setup() {
    const a = S.answers.setup;
    const choice = (key, val, text) => `<button class="opt ${a[key] === val ? "sel" : ""}" data-setup="${key}" data-val="${val}">${esc(text)}</button>`;
    return `<p class="eyebrow">Before we start</p>
      <div class="card"><h2>How old are you?</h2>${choice("age", "teen", "13 to 17")}${choice("age", "adult", "18 or older")}</div>
      <div class="card"><h2>Who's your closest person right now?</h2>${choice("closest", "partner", "A partner")}${choice("closest", "best_friend", "A best friend")}${choice("closest", "family", "Someone in my family")}${choice("closest", "none", "Nobody in particular right now")}</div>
      <button class="primary" data-act="setup-done" ${a.age && a.closest ? "" : "disabled"}>Continue</button>`;
  }

  function stance() {
    const list = dims();
    const d = list[S.i];
    const labels = ["Totally A", "Leaning A", "Both / depends", "Leaning B", "Totally B"];
    return `<p class="eyebrow">Quick takes · ${S.i + 1} of ${list.length}</p>${progress(S.i, list.length)}
      <div class="card"><h2>${esc(E.stancePrompt(d, S.answers.setup))}</h2>
        <div class="poles"><div class="pole"><b>A</b>${esc(d.stance.a)}</div><div class="pole"><b>B</b>${esc(d.stance.b)}</div></div>
        <div class="scale" role="group" aria-label="Your take">${[-2, -1, 0, 1, 2].map((lv, k) => `<button data-stance="${lv}">${labels[k]}</button>`).join("")}</div>
        <button class="ghost" data-stance="skip">Skip this one</button></div>`;
  }

  function scene() {
    const list = sceneDims();
    const d = list[S.i];
    return `<p class="eyebrow">Real moments · ${S.i + 1} of ${list.length}</p>${progress(S.i, list.length)}
      <div class="card"><h2>${esc(d.scene.prompt)}</h2>
        ${d.scene.options.map((o, k) => `<button class="opt" data-scene="${k}">${esc(o.t)}</button>`).join("")}
        <div class="row"><button class="ghost" data-scene="no_recent">No recent example</button><button class="ghost" data-scene="skip">Skip this one</button></div></div>`;
  }

  function freeze() {
    const profile = E.computeProfile(BANK, S.answers);
    const p = E.predictSealed(BANK, profile);
    const guesses = p.filter((x) => !x.abstain).length;
    return `<p class="eyebrow">Sealed</p><h1>Genii has put its cards down.</h1>
      <p>Genii sealed <b>${guesses}</b> guesses about how you'll answer ${BANK.SEALED.length} brand-new situations${p.length - guesses ? `, and passed on ${p.length - guesses} where it didn't have enough to go on` : ""}. Your answers from here on won't change your tags.</p>
      <button class="primary" data-act="seal">Show me the situations</button>`;
  }

  function sealed() {
    const h = BANK.SEALED[S.i];
    const answered = S.answers.sealed[h.id];
    const pred = S.predictions.find((x) => x.id === h.id);
    let reveal = "";
    if (answered) {
      if (pred.abstain) reveal = `<p class="muted">Genii passed on this one.</p>`;
      else if (answered.option === null) reveal = `<p class="muted">Skipped. Genii had guessed: ${esc(h.options[pred.option].t)}</p>`;
      else reveal = answered.option === pred.option
        ? `<p class="hit">Genii called it: ${esc(h.options[pred.option].t)}</p>`
        : `<p class="miss">Genii guessed: ${esc(h.options[pred.option].t)}</p>`;
    }
    return `<p class="eyebrow">Sealed checks · ${S.i + 1} of ${BANK.SEALED.length}</p>${progress(S.i, BANK.SEALED.length)}
      <div class="card"><p class="muted">${pred.abstain ? "Genii passed on this one." : "Genii sealed a guess before you answer."}</p><h2>${esc(h.prompt)}</h2>
        ${h.options.map((o, k) => `<button class="opt ${answered && answered.option === k ? "sel" : ""}" data-sealed="${k}" ${answered ? "disabled" : ""}>${esc(o.t)}</button>`).join("")}
        ${answered ? reveal + `<button class="primary" data-act="next-sealed">Next</button>` : `<button class="ghost" data-sealed="skip">Skip this one</button>`}</div>`;
  }

  function tagTable(profile, withChecks) {
    const rows = profile.tags.map((t) => {
      const dim = BANK.DIMENSIONS.find((d) => d.id === t.id);
      const lvl = t.level === null ? "unknown" : t.level === 0 ? "depends" : (Math.abs(t.level) === 2 ? "strongly " : "leaning ") + t.label;
      const why = t.contradiction ? `Believes <b>${esc(t.stanceSaid)}</b>, did <b>${esc(t.level < 0 ? dim.A : dim.B)}</b>` : t.source === "none" ? "" : `from ${t.source.replace("+", " + ")}`;
      const chk = withChecks ? `<td class="row">${["yes", "no"].map((v) => `<button class="opt ${S.tagChecks[t.id] === v ? "sel" : ""}" style="width:auto;padding:4px 10px" data-check="${t.id}" data-val="${v}">${v === "yes" ? "That's me" : "Not me"}</button>`).join("")}</td>` : "";
      return `<tr><td><b>${esc(dim.A)} ↔ ${esc(dim.B)}</b><br><span class="muted">${esc(BANK.DOMAINS[dim.domain])}</span></td><td>${esc(lvl)} <span class="pill ${t.strength}">${t.strength}</span>${t.hesitated ? ' <span class="pill">paused</span>' : ""}<br><span class="muted">${why}</span></td>${chk}</tr>`;
    });
    return `<div class="scroll"><table><thead><tr><th>Tag</th><th>You</th>${withChecks ? "<th>Accurate?</th>" : ""}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  }

  function result() {
    const profile = E.computeProfile(BANK, S.answers);
    const sc = E.scoreSealed(BANK, S.predictions, S.answers.sealed);
    const exportJson = JSON.stringify(exportRecord(profile, sc));
    return `<p class="eyebrow">Your tags · test build</p><h1>${profile.coverage.nonNeutral} clear-ish tags out of ${profile.coverage.dimensions}</h1>
      <p class="muted">${profile.coverage.clear} clear, ${profile.coverage.contradictions} where what you believe and what you did point different ways. Sealed guesses: ${sc.exact} exact and ${sc.side} on the right side, out of ${sc.guessed} guessed (${sc.abstained} passed).</p>
      <div class="card"><h2>Overall, how much is this list you?</h2><div class="scale">${[1, 2, 3, 4, 5].map((n) => `<button class="${S.rating === n ? "opt sel" : ""}" data-rate="${n}">${n}</button>`).join("")}</div><p class="muted">1 = not me at all, 5 = uncannily me</p></div>
      <div class="card">${tagTable(profile, true)}</div>
      <div class="card"><h2>Export</h2><p class="muted">Send this to the research team. It holds your answers, timings and tags, no name or email.</p>
        <div class="row"><button class="primary" data-act="copy">Copy JSON</button><button class="opt" style="width:auto" data-act="download">Download file</button></div><textarea readonly id="exp">${esc(exportJson)}</textarea></div>
      <div class="card"><h2>Swap test (for the research team)</h2><p class="muted">Paste another respondent's export. You'll see two unlabeled tag lists. Pick the one that's you.</p>
        <textarea id="swapIn" placeholder="Paste another export here"></textarea><button class="opt" style="width:auto" data-act="swap">Start swap test</button><div id="swapOut">${swapView()}</div></div>
      <button class="ghost" data-act="reset">Start over</button>`;
  }

  function exportRecord(profile, sc) {
    return { version: BANK.version, startedAt: S.startedAt, finishedAt: new Date().toISOString(), setup: S.answers.setup, answers: S.answers, predictions: S.predictions, sealedScore: sc, profile, rating: S.rating, tagChecks: S.tagChecks, swap: S.swap };
  }

  function listHtml(tags) {
    return `<ul>${tags.filter((t) => t.label && t.level !== 0).map((t) => `<li>${esc(Math.abs(t.level) === 2 ? "Strongly " : "Leaning ")}${esc(t.label)}</li>`).join("")}</ul>`;
  }
  function swapView() {
    if (!S.swap) return "";
    const lists = S.swap.order.map((who) => (who === "self" ? E.computeProfile(BANK, S.answers).tags : S.swap.otherTags));
    const pick = S.swap.pick;
    return `<div class="poles" style="margin-top:12px">${lists.map((l, k) => `<div class="pole"><b>LIST ${k ? "2" : "1"}</b>${listHtml(l)}<button class="opt ${pick === k ? "sel" : ""}" data-swap="${k}">This is me</button></div>`).join("")}</div>
      ${pick !== null && pick !== undefined ? `<p class="${S.swap.order[pick] === "self" ? "hit" : "miss"}">${S.swap.order[pick] === "self" ? "You picked your own list." : "That was the other person's list."}</p>` : ""}`;
  }

  function bind() {
    app.querySelectorAll("[data-act]").forEach((b) => (b.onclick = () => act(b.dataset.act)));
    app.querySelectorAll("[data-setup]").forEach((b) => (b.onclick = () => { S.answers.setup[b.dataset.setup] = b.dataset.val; save(); render(); }));
    app.querySelectorAll("[data-stance]").forEach((b) => (b.onclick = () => {
      const d = dims()[S.i];
      S.answers.stance[d.id] = { level: b.dataset.stance === "skip" ? null : Number(b.dataset.stance), ms: Date.now() - shownAt };
      S.i + 1 < dims().length ? go("stance", S.i + 1) : go("scene", 0);
    }));
    app.querySelectorAll("[data-scene]").forEach((b) => (b.onclick = () => {
      const d = sceneDims()[S.i];
      const v = b.dataset.scene;
      S.answers.scene[d.id] = { option: /^\d+$/.test(v) ? Number(v) : null, exit: /^\d+$/.test(v) ? null : v, ms: Date.now() - shownAt };
      S.i + 1 < sceneDims().length ? go("scene", S.i + 1) : go("freeze");
    }));
    app.querySelectorAll("[data-sealed]").forEach((b) => (b.onclick = () => {
      const h = BANK.SEALED[S.i];
      S.answers.sealed[h.id] = { option: b.dataset.sealed === "skip" ? null : Number(b.dataset.sealed), ms: Date.now() - shownAt };
      save(); render();
    }));
    app.querySelectorAll("[data-rate]").forEach((b) => (b.onclick = () => { S.rating = Number(b.dataset.rate); save(); render(); }));
    app.querySelectorAll("[data-check]").forEach((b) => (b.onclick = () => { S.tagChecks[b.dataset.check] = b.dataset.val; save(); render(); }));
    app.querySelectorAll("[data-swap]").forEach((b) => (b.onclick = () => { S.swap.pick = Number(b.dataset.swap); save(); render(); }));
  }

  function act(a) {
    if (a === "start") return go("setup");
    if (a === "reset") { S = fresh(); save(); return render(); }
    if (a === "setup-done") return go("stance", 0);
    if (a === "seal") { S.predictions = E.predictSealed(BANK, E.computeProfile(BANK, S.answers)); S.sealedAt = new Date().toISOString(); return go("sealed", 0); }
    if (a === "next-sealed") return S.i + 1 < BANK.SEALED.length ? go("sealed", S.i + 1) : go("result");
    if (a === "copy") {
      const t = document.getElementById("exp");
      const done = () => { t.select(); };
      if (navigator.clipboard) navigator.clipboard.writeText(t.value).catch(done); else done();
      return;
    }
    if (a === "download") {
      const blob = new Blob([document.getElementById("exp").value], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `genii-tag-pilot-${Date.now()}.json`;
      link.click();
      return;
    }
    if (a === "swap") {
      try {
        const other = JSON.parse(document.getElementById("swapIn").value);
        if (!other.profile || !Array.isArray(other.profile.tags)) throw new Error("no tags");
        S.swap = { otherTags: other.profile.tags, order: Math.random() < 0.5 ? ["self", "other"] : ["other", "self"], pick: null };
        save(); render();
      } catch (e) {
        document.getElementById("swapOut").innerHTML = `<p class="miss">That doesn't look like a pilot export. Paste the full JSON from another person's Export box.</p>`;
      }
    }
  }

  render();
})();
