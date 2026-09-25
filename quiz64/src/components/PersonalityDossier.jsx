import React, { useEffect, useMemo, useRef, useState } from "react";
import { DossierGameWorld } from "./DossierGameWorld.jsx";
import { GuessReveal } from "./GuessReveal.jsx";
import { AppInvitation } from "./AppInvitation.jsx";
import { buildGameOutcome, createChallengeCard } from "../game-outcome.js";
import { downloadChallengeImage } from "../share-card.js";
import { DossierStory } from "./DossierStory.jsx";
import "../dossier.css";

const sectionLabels = {
  axis: "A direction",
  action: "Response",
  emotion: "Outward signal",
  pattern: "Possible pattern",
  value: "What mattered",
  desire: "What you wanted noticed",
  support: "Stated preference",
  context: "Stated preference",
  dark_side: "Playful line",
};

const preferenceLabels = {
  practical_first: "Practical help first",
  hands_off: "Space unless requested",
  only_if_asked: "Help when asked",
  gentle: "Gentle delivery",
  direct: "Direct delivery",
  retry_once: "One follow-up is okay",
  retry_twice: "A second follow-up is okay",
};

const cleanText = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

function sourceShape(section) {
  if (!section) return { label: "Open question", tone: "unknown" };
  if (section.sourceLabel) return section.sourceLabel;
  if (section.key === "dark_side") return { label: "A joke about one answer", tone: "playful" };
  if (section.key === "pattern") return { label: "More than one situation", tone: "mixed" };
  if (["support", "context"].includes(section.key)) return { label: "You said this directly", tone: "literal" };
  if (section.observations?.length || section.evidenceIds?.length) return { label: "One situation in view", tone: "situational" };
  return { label: "Open question", tone: "unknown" };
}

function receiptForSection(section, receipts) {
  const ids = new Set(section?.evidenceIds || []);
  return (receipts || []).find((row) => ids.has(row.evidenceId));
}

function evidenceCount(result) {
  return new Set(
    (result?.receipts || [])
      .filter((row) => !row?.missingness)
      .map((row) => row.questionId || row.itemId || row.evidenceId)
      .filter(Boolean),
  ).size;
}

function storageCopy(storageStatus) {
  if (storageStatus && typeof storageStatus === "object") {
    if (storageStatus.error || storageStatus.ok === false) return "This tab only";
    if (storageStatus.label) return storageStatus.label;
  }
  if (storageStatus === false || storageStatus === "unavailable") return "This tab only";
  if (storageStatus === "preview") return "Synthetic preview · not saved";
  if (storageStatus === "saved") return "Saved on this device";
  if (typeof storageStatus === "string" && storageStatus.trim()) return storageStatus;
  return "Saved on this device";
}

function axisMap(axes) {
  return Object.fromEntries((axes || []).map((axis) => [axis.axisId, axis]));
}

function designationFromAxes(axes) { return buildGameOutcome({axes}).label; }

function resultAdapter(input) {
  if (!input || input.portrait || input.sections || input.publicName || input.title) return input;
  const axes = Array.isArray(input.projection?.axes) ? input.projection.axes : Array.isArray(input.axes) ? input.axes : [];
  const claims = Array.isArray(input.claims) ? input.claims : [];
  const axisById = axisMap(axes);
  const snapshotClaims = new Map((input.snapshot?.claims || []).map((claim) => [claim.id, claim]));
  const rawReceipts = (input.receipts?.length ? input.receipts : null) || input.snapshot?.evidenceEvents || [];
  const seenAxes = new Set();
  const sections = claims.map((claim) => {
    const axis = axisById[claim.axisId] || axes.find((item) => claim.id?.includes(item.axisId));
    if (axis && seenAxes.has(axis.axisId)) return null;
    if (axis) seenAxes.add(axis.axisId);
    const sourceClaim = snapshotClaims.get(claim.id) || {};
    return {
      ...sourceClaim,
      ...claim,
      id: claim.id,
      key: "axis",
      title: {activation_tempo:"Your opening move",social_signal_style:"How you enter the room",friction_posture:"When things get awkward",structure_reliance:"When the plan changes",novelty_aperture:"Your side-quest energy"}[axis?.axisId] || "A moment you described",
      text: claim.text || claim.shortStatement || sourceClaim.shortStatement || sourceClaim.canonicalStatement,
      limit: claim.scope ? `${claim.scope}. ${claim.uncertainty ? `Uncertainty remains ${claim.uncertainty}.` : ""}`.trim() : sourceClaim.scope ? `${sourceClaim.scope}.` : axis?.claimLimit,
      evidenceIds: claim.evidenceIds?.length ? claim.evidenceIds : sourceClaim.evidenceIds || [],
      observations: sourceClaim.evidenceIds || [],
      feedback: (input.corrections || []).filter((record) => record.claimId === claim.id),
      sourceLabel: axis?.supportLevel === "strongly_supported" || axis?.supportLevel === "supported"
        ? { label: "Keeps showing up", tone: "mixed" }
        : axis?.supportLevel === "mixed"
          ? { label: "Depends on context", tone: "mixed" }
          : axis?.supportLevel === "thin"
            ? { label: "Early signal", tone: "situational" }
            : { label: "Still open", tone: "unknown" },
    };
  }).filter(Boolean);
  const receipts = rawReceipts.map((row) => ({
    ...row,
    optionText: row.missingness ? ({skip:"Skipped",no_recent_example:"No recent example",not_applicable:"Not applicable",other_unscored:"Your own words · unscored"}[row.missingness.reason] || "No scored answer") : row.optionText || row.answerTextSnapshot,
    literalObservation: row.literalObservation,
    claimLimit: row.missingness ? "No personality claim is drawn from this response. Written Other remains unscored." : Array.isArray(row.claimLimits) ? row.claimLimits[0] : row.claimLimit,
    questionText: row.questionText || row.itemId,
    timeframe: row.timeframe,
  }));
  const identity = input.identity || {};
  const safeIdentity = identity.publicSafe === true ? identity : null;
  const title = cleanText(input.gameTitle?.label, cleanText(safeIdentity?.label, designationFromAxes(axes)));
  const supportedLabels = axes.filter((axis) => input.gameTitle?.axisIds?.includes(axis.axisId)).map((axis) => axis.label).filter(Boolean);
  return {
    ...input,
    id: input.cardId || input.snapshotId,
    designation: title,
    designationReason: supportedLabels.length ? `A game nickname inspired by the way you approach ${supportedLabels.map(label => ({"Novelty aperture":"new experiences","Activation tempo":"the first move","Social signal style":"other people","Friction posture":"awkward moments","Structure reliance":"a change of plan"})[label] || label.toLowerCase()).join(" and ")}.` : "Your character is still taking shape. A nickname needs more to go on.",
    publicName: title,
    spicyHook: cleanText(safeIdentity?.hook, receipts.find((row) => !row.missingness)?.answerTextSnapshot || "A little mystery looks good on you. There is not enough evidence for a reading yet."),
    summary: "A provisional product reading from the situations you answered.",
    thesis: receipts.find((row) => row.sourceStatus === "retrospective_self_report" && !row.missingness)?.answerTextSnapshot || sections[0]?.text || "There is not enough supported evidence to write a larger claim yet.",
    sections,
    axes,
    receipts,
    unknowns: input.unknowns || axes.filter((axis) => axis.supportLevel === "unknown").map((axis) => `${axis.label} remains unknown until there are two independent examples.`),
    shareCards: safeIdentity ? [{ title: "Share-safe line", line: safeIdentity.hook }] : [],
    literalSupportFields: receipts.filter((row) => row.sourceStatus === "stated_preference" && !row.missingness).map((row) => ({questionId: row.itemId, optionId: row.optionIds?.[0], construct: row.questionText, text: row.answerTextSnapshot})),
    heldoutStats: input.heldoutStats || null,
    runtimeResult: true,
  };
}

function designationFor(result) {
  const explicit = cleanText(result?.designation || result?.publicName);
  if (explicit) return explicit;
  if (result?.strength === "Unknown") return "Still under review";
  return "A first impression";
}

function statusFor(result) {
  if (result?.strength === "Unknown") return "Not enough to go on";
  if (result?.auditPassed === false) return "Needs a closer look";
  if (result?.runtimeResult) return evidenceCount(result) ? "Ready for your rebuttal" : "Still a mystery";
  return "Provisional and bounded";
}

function filedLabel(result) {
  const value = result?.snapshot?.createdAt || result?.createdAt;
  if (!value || !Number.isFinite(Date.parse(value))) return "This attempt";
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function iconFor(tone) {
  return {
    literal: "L",
    mixed: "M",
    playful: "P",
    situational: "S",
    unknown: "?",
  }[tone] || "S";
}

function formatContext(context) {
  if (!context || typeof context !== "object") return "";
  return Object.entries(context)
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${String(value).replaceAll("_", " ")}`)
    .join("; ");
}

function Callout({ section, receipts, resultId, onCorrection, runtimeResult = false }) {
  const claimId = section.id || section.claimId;
  const existing = (section.feedback || []).at(-1);
  const [vote, setVote] = useState(existing?.value ?? null);
  const source = sourceShape(section);
  const receipt = receiptForSection(section, receipts);
  const readerLine = cleanText(receipt?.optionText || receipt?.literalObservation, cleanText(section.text, "There is not enough evidence to write this line yet."));
  const choose = (value) => {
    setVote(runtimeResult ? value : value === "accurate");
    if (typeof onCorrection === "function") {
      onCorrection(runtimeResult ? claimId : { ...section, id: claimId, resultId }, runtimeResult ? value : value === "accurate");
    }
  };

  return (
    <article className={`dossier-callout dossier-callout--${source.tone}`}>
      <div className="dossier-callout__topline">
        <span className="dossier-index-mark" aria-hidden="true">{iconFor(source.tone)}</span>
        <span className="dossier-kicker">{sectionLabels[section.key] || "Reading"}</span>
        <span className="dossier-source-tag">{source.label}</span>
      </div>
      <h3>{cleanText(section.title, "A thing that stood out")}</h3>
      <p className="dossier-callout__reading">{cleanText(section.text, readerLine)}</p><blockquote className="dossier-callout__text"><small>You chose</small>“{readerLine}”</blockquote>
      <details className="dossier-callout__details">
        <summary>Show the scene behind it <span aria-hidden="true">+</span></summary>
        <div>{receipt?.questionText && <p><b>The scene: </b>{receipt.questionText}</p>}<p>{cleanText(section.text, "This line stays close to the answer you selected.")}</p>{section.limit && <p>{section.limit}</p>}</div>
      </details>
      <div className="dossier-correction" aria-label="Correct this reading">
        <span>Did Genii read that right?</span>
        <div className="dossier-correction__controls">
          <button type="button" className={(runtimeResult ? vote === "accurate" : vote === true) ? "is-selected" : ""} onClick={() => choose("accurate")} aria-pressed={runtimeResult ? vote === "accurate" : vote === true}>
            Accurate
          </button>
          <button type="button" className={runtimeResult ? vote === "partly_accurate" ? "is-selected" : "" : vote === false ? "is-selected" : ""} onClick={() => choose("partly_accurate")} aria-pressed={runtimeResult ? vote === "partly_accurate" : false}>
            Partly accurate
          </button>
          <button type="button" className={runtimeResult ? vote === "inaccurate" ? "is-selected" : "" : ""} onClick={() => choose("inaccurate")} aria-pressed={runtimeResult ? vote === "inaccurate" : false}>
            Not accurate
          </button>
          <button type="button" aria-pressed={vote === "prefer_not_to_say"} onClick={() => choose("prefer_not_to_say")}>Pass</button>
        </div>
      </div>
    </article>
  );
}

function Spectrum({ result }) {
  const axes = Array.isArray(result?.axes) ? result.axes : [];
  const sections = result?.sections || [];
  const receipts = result?.receipts || [];
  const unknowns = result?.unknowns || [];
  const questions = evidenceCount(result);
  const hasPattern = sections.some((section) => section.key === "pattern");
  const hasLiteral = sections.some((section) => ["support", "context"].includes(section.key)) || (result?.literalSupportFields || []).length > 0;
  const axisReaderLabels = {
    activation_tempo: "Getting started",
    social_signal_style: "Being heard",
    friction_posture: "Handling friction",
    structure_reliance: "Making a plan",
    novelty_aperture: "Trying something new",
  };
  const rows = axes.length ? axes.slice(0, 5).map((axis) => ({
    label: axisReaderLabels[axis.axisId] || axis.label,
    left: axis.endpoints?.left?.label || "One end",
    middle: axis.supportLevel === "unknown" ? "Still open" : axis.supportLevel === "thin" ? "Early signal" : axis.supportLevel === "mixed" ? "Depends on context" : "Keeps showing up",
    right: axis.endpoints?.right?.label || "Other end",
    state: axis.supportLevel === "unknown" ? "unknown" : axis.supportLevel === "mixed" ? "middle" : axis.direction === "right" ? "right" : axis.direction === "left" ? "left" : "middle",
    note: axis.supportLevel === "unknown" ? "We need another example before this moves." : axis.supportLevel === "thin" ? "An early signal. Treat it lightly." : axis.supportLevel === "mixed" ? "The situation changes the answer." : "This direction keeps showing up in the answers.",
  })) : [
    {
      label: "Evidence shape",
      left: "One situation",
      middle: "Mixed contexts",
      right: "Repeated signal",
      state: hasPattern ? "right" : questions > 1 ? "middle" : questions ? "left" : "unknown",
      note: hasPattern ? "A possible pattern is supported across situations." : questions ? "The read stays close to the examples you gave." : "No usable example was available.",
    },
    {
      label: "What is known",
      left: "Open",
      middle: "Building",
      right: "Stated",
      state: hasLiteral ? "right" : unknowns.length ? "middle" : receipts.length ? "middle" : "unknown",
      note: hasLiteral ? "Preferences are shown as preferences, not personality scores." : unknowns.length ? "Some useful context is still missing." : "There is no extra certainty hiding below this line.",
    },
  ];

  return (
    <section className="dossier-spectrum dossier-section" aria-labelledby="dossier-spectrum-title">
      <div className="dossier-section-heading">
        <span className="dossier-kicker">Readout</span>
        <h2 id="dossier-spectrum-title">Where the plot bends</h2>
        <p>These are the directions that showed up in your answers. They leave room for the situation to matter.</p>
      </div>
      <div className="dossier-spectrum__rows">
        {rows.map((row) => (
          <div className="dossier-spectrum__row" key={row.label}>
            <div className="dossier-spectrum__label"><strong>{row.label}</strong><span>{row.note}</span></div>
            <div className={`dossier-spectrum__rail dossier-spectrum__rail--${row.state}`} role="img" aria-label={`${row.label}: ${row.state === "unknown" ? "open" : row.state}`}>
              <i />
              <span className="dossier-spectrum__tick dossier-spectrum__tick--one" />
              <span className="dossier-spectrum__tick dossier-spectrum__tick--two" />
              <span className="dossier-spectrum__tick dossier-spectrum__tick--three" />
            </div>
            <div className="dossier-spectrum__ends"><span>{row.left}</span><span>{row.middle}</span><span>{row.right}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreferenceList({ result }) {
  const fields = result?.literalSupportFields || [];
  const facts = result?.facts || {};
  const fallback = Array.isArray(facts.supportPreferences) ? facts.supportPreferences : [];
  const preferences = fields.length
    ? fields.map((field) => ({
        title: ({"GQB2-E06":"Making a small decision","GQB2-W05":"A plan that feels right","GQB2-S04":"Finding your place","GQB2-S08":"After a social moment","GQB2-R01":"The attention that lands","GQB2-R06":"The request in your drafts","GQB2-M04":"What people should know"})[field.questionId] || "A preference you shared",
        context: field.construct,
        text: cleanText(field.text, "You selected this directly."),
        id: `${field.questionId}-${field.optionId}`,
      }))
    : fallback.map((value) => ({ title: preferenceLabels[value] || "A preference you shared", text: "You selected this directly.", id: value }));

  return (
    <section className="dossier-preferences dossier-section" aria-labelledby="dossier-preferences-title">
      <div className="dossier-section-heading">
        <span className="dossier-kicker">How to meet me</span>
        <h2 id="dossier-preferences-title">A small guide to getting you.</h2>
        <p>No mind-reading needed here. You told Genii what lands—and what people tend to miss.</p>
      </div>
      {preferences.length ? (
        <div className="dossier-preferences__grid">
          {preferences.slice(0, 6).map((item) => (
            <article className="dossier-preference" key={item.id}>
              <span className="dossier-preference__rule" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p><details><summary>The question</summary><p>{item.context}</p></details>
            </article>
          ))}
        </div>
      ) : (
        <div className="dossier-empty dossier-empty--inline"><strong>No preference was recorded.</strong><span>We will leave this part open instead of guessing.</span></div>
      )}
    </section>
  );
}

function ReceiptVault({ receipts }) {
  const usable = (receipts || []).filter(Boolean);
  return (
    <section className="dossier-vault dossier-section" id="dossier-evidence" aria-labelledby="dossier-vault-title">
      <div className="dossier-section-heading dossier-section-heading--compact">
        <span className="dossier-kicker">Receipts</span>
        <h2 id="dossier-vault-title">The receipts, if you insist.</h2>
        <p>Caught a line that sounds nothing like you? Go straight to the answer behind it.</p>
      </div>
      {usable.length ? (
        <details className="dossier-vault-door"><summary>Open {usable.length} answer receipts <span aria-hidden="true">+</span></summary><div className="dossier-receipts">
          {usable.map((row, index) => (
            <details className="dossier-receipt" key={row.evidenceId || `${row.questionId}-${index}`}>
              <summary>
                <span className="dossier-receipt__number">{String(index + 1).padStart(2, "0")}</span>
                <span className="dossier-receipt__summary"><strong>{cleanText(row.optionText || row.literalObservation, "Answer recorded")}</strong><small>{cleanText(row.questionText, "Question wording unavailable")}</small></span>
                <span className="dossier-receipt__toggle" aria-hidden="true">+</span>
              </summary>
              <div className="dossier-receipt__body">
                {row.privateFreeText && <p><b>Your written answer · unscored</b>{row.privateFreeText}</p>}
                {row.literalObservation && row.literalObservation !== row.optionText && <p><b>Literal observation</b>{row.literalObservation}</p>}
                {(row.context || row.target || row.window || row.timeframe) && <p><b>Situation</b>{formatContext(row.context) || [row.target, row.window || row.timeframe].filter(Boolean).join("; ")}</p>}
                <p><b>Claim limit</b>{cleanText(row.claimLimit, "This answer does not justify a fixed type or an unspoken motive.")}</p>
              </div>
            </details>
          ))}
        </div></details>
      ) : (
        <div className="dossier-empty"><strong>No receipts were available.</strong><span>The result has nothing to cite yet, so it stays provisional.</span></div>
      )}
    </section>
  );
}

function GuessBooth({ stats }) {
  if (!stats) return null;
  const trials = Array.isArray(stats.trials) ? stats.trials : [];
  return (
    <section className="dossier-guess dossier-section" aria-labelledby="dossier-guess-title">
      <div className="dossier-guess__copy">
        <span className="dossier-kicker">The reveal</span>
        <h2 id="dossier-guess-title">Did Genii call it?</h2>
        <p>Eight choices. Guesses already sealed. Time to find out where Genii read the room—and where you changed the plot.</p>
        <div className="dossier-guess__counts">
          <div><strong>{stats.hits ?? 0}</strong><span>matched</span></div>
          <div><strong>{stats.predicted ?? 0}</strong><span>answered guesses</span></div>
          <div><strong>{stats.abstentions ?? 0}</strong><span>Genii passed</span></div>
        </div>
      </div>
      <GuessReveal trials={trials} />
      <details className="dossier-guess__details">
        <summary>How this round was scored <span aria-hidden="true">+</span></summary>
        <p>Genii sealed its guesses before you answered. These final choices test those guesses; they do not rewrite your personality reading.</p>
        <p>{stats.skipped || 0} checks skipped. The fixed comparison matched {stats.baselineHits || 0} of the same {stats.baselineDenominator || 0} answered guesses. One playthrough cannot establish predictive accuracy.</p>
      </details>
    </section>
  );
}

function ShareKeepsake({ result, onExport }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const card = createChallengeCard({label:designationFor(result)});
  const captions = [card.caption, `Apparently I’m “${card.title}”. Please submit evidence for or against. Screenshots will be considered.`, `Guess my Genii title before I tell you. Then take your own turn.`];
  const copy = async () => {try {await navigator.clipboard.writeText(captions[captionIndex]);setStatus("Caption copied. You choose where it goes.");}catch {setStatus("Copy is unavailable here. Select the caption below to copy it.");}};
  const saveImage = async () => {try {await downloadChallengeImage(card);setStatus("Image prepared. Check your browser’s downloads; you can also capture the card preview.");}catch{setStatus("Image download is unavailable here. You can capture the card preview instead.");}};
  return <section className="dossier-keepsake dossier-section" id="dossier-keepsake" aria-labelledby="dossier-keepsake-title">
    <div className="dossier-keepsake__header"><div className="dossier-section-heading dossier-section-heading--compact"><span className="dossier-kicker">Forward this to your character witnesses</span><h2 id="dossier-keepsake-title">Who would recognize you first?</h2><p>Send this to the person who has watched you turn one small decision into a whole episode. Let them defend you. Or make it worse.</p></div><button className="dossier-button dossier-button--primary" onClick={()=>setPreviewOpen(!previewOpen)} aria-expanded={previewOpen}>{previewOpen?"Close my card":"Make my character card"}</button></div>
    {previewOpen && <div className="dossier-share-kit"><aside className="dossier-share-preview" aria-label="Share-safe preview"><div className="dossier-share-preview__stamp">CHARACTER UNLOCKED</div><p className="dossier-share-preview__brand">GENII / MY UNOFFICIAL ALTER EGO</p><h3>{card.title}</h3><p>What would Genii call you?</p><small>A game nickname. Your answers stay in your private file.</small></aside><div className="dossier-share-tools"><label htmlFor="share-caption-style">Set the group-chat tone</label><select id="share-caption-style" value={captionIndex} onChange={e=>setCaptionIndex(Number(e.target.value))}><option value={0}>Your turn</option><option value={1}>Friends, explain yourselves</option><option value={2}>Guess before I reveal</option></select><p className="dossier-share-caption">{captions[captionIndex]}</p><div className="dossier-keepsake__actions"><button className="dossier-button dossier-button--primary" onClick={saveImage}>Save character image</button><button className="dossier-button dossier-button--quiet" onClick={copy}>Copy challenge caption</button></div><p className="dossier-share-status" role="status">{status || "Your card is ready to preview. You choose who gets to see it."}</p></div></div>}
    <button type="button" className="dossier-button dossier-button--quiet" onClick={onExport}>Download private copy</button>
  </section>;
}

function EmptyDossier({ error }) {
  return (
    <main className="dossier-shell dossier-shell--empty" aria-labelledby="dossier-empty-title">
      <div className="dossier-empty dossier-empty--large" role={error ? "alert" : "status"}>
        <span className="dossier-kicker">Personality dossier</span>
        <h1 id="dossier-empty-title">{error ? "The dossier could not load." : "No dossier yet."}</h1>
        <p>{error || "Finish a conversation with Genii and there will be something real to read here."}</p>
      </div>
    </main>
  );
}

export function PersonalityDossier({ result, onCorrection, onExport, onRestart, onEdit, storageStatus = true }) {
  const portrait = resultAdapter(result?.portrait || result);
  const resultHeading = useRef(null);
  useEffect(() => { resultHeading.current?.focus({preventScroll:true}); }, [portrait?.snapshotId]);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const designation = designationFor(portrait);
  const sections = Array.isArray(portrait?.sections) ? portrait.sections : [];
  const usableSections = sections.filter((section) => section && (section.text || section.title));
  const receipts = Array.isArray(portrait?.receipts) ? portrait.receipts : [];
  const count = evidenceCount(portrait);
  const storage = storageCopy(storageStatus);
  const meta = useMemo(() => [
    ["Record", (portrait?.snapshotId || "Local personality file").slice(-12).toUpperCase()],
    ["Filed", filedLabel(portrait)],
    ["Evidence", count ? `${count} answer${count === 1 ? "" : "s"} cited` : "Open"],
    ["Status", statusFor(portrait)],
    ["Storage", storage],
  ], [count, portrait, storage]);

  if (result?.loading) return <main className="dossier-shell dossier-shell--loading" aria-busy="true"><div className="dossier-skeleton" /><div className="dossier-skeleton dossier-skeleton--wide" /><div className="dossier-skeleton dossier-skeleton--short" /></main>;
  if (!portrait || result?.error) return <EmptyDossier error={result?.error} />;

  const copySummary = async () => {
    const line = `${designation} — my unofficial Genii game nickname. What would yours be?`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(line);
      setCopied(true); setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false); setCopyFailed(true);
    }
  };

  return (
    <main className="dossier-shell" aria-labelledby="dossier-title">
      <header className="dossier-masthead">
        <div><span className="dossier-mark" aria-hidden="true">G</span><span>Genii / personality dossier</span></div>
        <div className="dossier-masthead__right"><span>Local reading</span><span className="dossier-masthead__status" aria-label={storage}>{storage}</span></div>
      </header>

      <div ref={resultHeading} tabIndex={-1} id="dossier-title" aria-label={designation}>
        <DossierGameWorld key={portrait.snapshotId} title={designation} hook={portrait.gameTitle?.hook} clueCount={count} discoveries={[
          {copy: receipts.find(row => !row.missingness)?.optionText ? `One of your clues: “${receipts.find(row => !row.missingness).optionText}” Open the scenes below to see what Genii made of it.` : "No clue collected here yet. You can still explore the room; Genii leaves your character open."},
          {copy: `Your title this time: ${designation}. It belongs to this playthrough. The character menu below shows the different sides that earned it—or the mysteries still left open.`},
          {copy: `${portrait.heldoutStats?.hits || 0} guesses matched your answer. ${portrait.heldoutStats?.abstentions || 0} times, Genii passed. Open the reveal below to see where you surprised Genii.`}
        ]} onExplore={() => document.getElementById("dossier-reading")?.scrollIntoView({behavior: document.body.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"})}/>
      </div>
      <p className="dossier-game-caption">{cleanText(portrait.designationReason, "Your playful designation for this conversation.")}</p>

      <dl className="dossier-meta" aria-label="Dossier metadata">
        {meta.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>

      <DossierStory result={result} receipts={receipts} />

      <Spectrum result={portrait} />

      <section className="dossier-callouts dossier-section" aria-labelledby="dossier-callouts-title">
        <div className="dossier-section-heading">
          <span className="dossier-kicker">Plot twists</span>
          <h2 id="dossier-callouts-title">Your answers. Your right of reply.</h2>
          <p>Genii has made its case. You get the last word.</p>
        </div>
        {usableSections.length ? (
          <div className="dossier-callouts__grid">{usableSections.slice(0, 6).map((section) => <Callout key={section.id || section.title} section={section} receipts={receipts} resultId={portrait.id} runtimeResult={portrait.runtimeResult} onCorrection={onCorrection} />)}</div>
        ) : (
          <div className="dossier-empty dossier-empty--inline"><strong>Nothing is ready to call out yet.</strong><span>Unknown is a valid result.</span></div>
        )}
      </section>

      <PreferenceList result={portrait} />
      {portrait.priorExposure && <p className="dossier-repeat-note">You have seen these checks before. This is a repeat game, not a fresh prediction test.</p>}
      <GuessBooth key={portrait.snapshotId} stats={portrait.heldoutStats} />
      <ReceiptVault receipts={receipts} />
      <ShareKeepsake key={portrait.snapshotId} result={portrait} onExport={onExport} />
      <AppInvitation />

      <footer className="dossier-footer">
        <div><span className="dossier-kicker">Filed for this attempt</span><p>{copied ? "Nickname copied." : copyFailed ? "Clipboard unavailable. You can select the nickname in the preview and copy it manually." : "You can revisit, correct, or start again whenever you want."}</p></div>
        <div className="dossier-footer__actions">
          <button type="button" className="dossier-button dossier-button--quiet" onClick={copySummary}>{copied ? "Copied" : "Copy game nickname"}</button>
          <button type="button" className="dossier-button dossier-button--quiet" onClick={onEdit}>Review answers</button>
          <button type="button" className="dossier-button dossier-button--primary" onClick={onRestart}>Start again</button>
        </div>
      </footer>
    </main>
  );
}

export default PersonalityDossier;
