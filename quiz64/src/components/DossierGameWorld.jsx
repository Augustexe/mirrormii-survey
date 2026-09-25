import React, { useContext, useEffect, useState } from "react";
import { MotionConfigContext } from "motion/react";
import { GeniiStage } from "./GeniiStage.jsx";
import "../dossier-game-world.css";

const OBJECTS = [
  {
    id: "signal",
    index: "01",
    eyebrow: "field note",
    title: "The signal",
    copy: "A small choice left a clean trace. Turn it over when you want the literal scene.",
    mark: "◎",
  },
  {
    id: "route",
    index: "02",
    eyebrow: "route map",
    title: "The side route",
    copy: "Your pattern is a direction, not a score. It can change when the scene changes.",
    mark: "↗",
  },
  {
    id: "wildcard",
    index: "03",
    eyebrow: "wild card",
    title: "The sealed guess",
    copy: "Genii made a bounded guess before seeing the next answer. Open the booth below to inspect it.",
    mark: "✦",
  },
];

function useMotionSetting() {
  const motionConfig = useContext(MotionConfigContext);
  const [motion, setMotion] = useState(() => {
    if (motionConfig?.reducedMotion === "always") return "off";
    if (typeof document !== "undefined" && document.body?.dataset.motion === "off") return "off";
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "off";
    return "on";
  });

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const update = () => {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      setMotion(motionConfig?.reducedMotion === "always" || document.body?.dataset.motion === "off" || reduced ? "off" : "on");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-motion"] });
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    media?.addEventListener?.("change", update);
    return () => {
      observer.disconnect();
      media?.removeEventListener?.("change", update);
    };
  }, [motionConfig?.reducedMotion]);

  return motion;
}

function Cube({ className = "", label, face }) {
  return (
    <div className={`dgw-cube ${className}`} aria-hidden="true">
      <span className="dgw-cube__face dgw-cube__face--front">{face}</span>
      <span className="dgw-cube__face dgw-cube__face--back" />
      <span className="dgw-cube__face dgw-cube__face--right" />
      <span className="dgw-cube__face dgw-cube__face--left" />
      <span className="dgw-cube__face dgw-cube__face--top" />
      <span className="dgw-cube__face dgw-cube__face--bottom" />
      <span className="dgw-sr-only">{label}</span>
    </div>
  );
}

export function DossierGameWorld({ title = "Your unofficial designation", clueCount = 0, onExplore, discoveries = [], hook }) {
  const motion = useMotionSetting();
  const [active, setActive] = useState(null);
  const [opened, setOpened] = useState([]);
  const inspect = id => {setActive(active === id ? null : id);setOpened(previous=>previous.includes(id)?previous:[...previous,id]);};
  const objects = OBJECTS.map((item, index) => ({...item, ...(discoveries[index] || {})}));
  const current = objects.find((item) => item.id === active);
  const clues = Number.isFinite(Number(clueCount)) ? Number(clueCount) : 0;
  const explore = () => {
    if (typeof onExplore === "function") onExplore();
  };

  return (
    <section className="dgw-world" data-motion={motion} aria-labelledby="dgw-title">
      <div className="dgw-world__topline">
        <span className="dgw-world__serial">GENII / CHARACTER UNLOCKED</span>
        <span className="dgw-world__status"><i aria-hidden="true" /> {clues} clues logged</span>
      </div>

      <div className="dgw-world__stage">
        <div className="dgw-world__grid" aria-hidden="true" />
        <div className="dgw-orbit dgw-orbit--outer" aria-hidden="true" />
        <div className="dgw-orbit dgw-orbit--inner" aria-hidden="true" />
        <div className="dgw-world__halo" aria-hidden="true" />
        <Cube className="dgw-cube--one" label="A purple signal cube" face="01" />
        <Cube className="dgw-cube--two" label="A small route cube" face="↗" />
        <Cube className="dgw-cube--three" label="A sealed guess cube" face="?" />
        <div className="dgw-world__genii">
          <GeniiStage compact={false} mood="curious" bubble={null} scene="dossier-world" />
        </div>
        <div className="dgw-world__stamp" aria-hidden="true">PLAY<br /><b>THE<br />READ</b></div>
        <div className="dgw-world__floor" aria-hidden="true" />
      </div>

      <div className="dgw-world__copy">
        <p className="dgw-kicker">Meet your unofficial alter ego</p>
        <h1 id="dgw-title">{title}</h1>
        <p className="dgw-world__lede">{hook || "You supplied the plot. Genii brought the red string. Pick up a clue and see which guesses survived contact with you."}</p>
      </div>

      <div className="dgw-discovery-progress" aria-live="polite"><span>{opened.length === 3 ? "Full set. Your character room is open." : "Three clues. Which one gives you away?"}</span><b>{opened.length} / 3 explored</b></div>
      <div className="dgw-object-row" aria-label="Inspectable dossier objects">
        {objects.map((item) => (
          <button
            className={`dgw-object ${active === item.id ? "is-active" : ""}`}
            type="button"
            key={item.id}
            aria-pressed={active === item.id}
            aria-label={`Inspect ${item.title}`}
            onClick={() => inspect(item.id)}
          >
            <span className="dgw-object__mark" aria-hidden="true">{item.mark}</span>
            <span className="dgw-object__index">{item.index}</span>
            <span className="dgw-object__eyebrow">{item.eyebrow}</span>
            <strong>{item.title}</strong>
            <span className="dgw-object__action">{active === item.id ? "Close" : opened.includes(item.id) ? "Open again ✓" : "Reveal clue"}</span>
          </button>
        ))}
      </div>

      {opened.length === 3 && <div className="dgw-discovery-reward"><span className="dgw-reward-spark" aria-hidden="true">✦</span><p>The title is yours. Your friends can file their objections.</p><a href="#dossier-keepsake">Make my character card ↗</a></div>}
      <div className={`dgw-inspection ${current ? "is-open" : ""}`} aria-live="polite">
        {current && (
          <div className="dgw-inspection__inner">
            <span className="dgw-inspection__mark" aria-hidden="true">{current.mark}</span>
            <div><p className="dgw-kicker">{current.eyebrow} / {current.index}</p><p>{current.copy}</p></div>
            <button className="dgw-inspection__close" type="button" onClick={() => setActive(null)}>Close<span aria-hidden="true">×</span></button>
          </div>
        )}
      </div>

      <div className="dgw-world__footer">
        <p><span className="dgw-world__footer-dot" aria-hidden="true" /> Your character room · saved for this attempt</p>
        <button className="dgw-explore" type="button" onClick={explore}>Explore the dossier <span aria-hidden="true">↗</span></button>
      </div>
    </section>
  );
}

export default DossierGameWorld;
