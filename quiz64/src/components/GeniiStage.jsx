import React, { useContext, useEffect, useRef, useState } from "react";
import {
  motion,
  MotionConfigContext,
  useReducedMotion,
  useSpring,
  useTransform,
  useInView,
} from "motion/react";
import { Sparkles } from "lucide-react";
import { asset } from "../assets.js";
import { IdeaSpark } from "./IdeaSpark.jsx";

const moods = {
  attentive: asset("genii-opal-alert.webp"),
  curious: asset("genii-opal-alert.webp"),
  skeptical: asset("genii-opal-thinking.webp"),
};

/** Decorative character performance. It does not represent live sensing or inference. */
export function GeniiStage({
  mood = "curious",
  compact = false,
  bubble = "Be yourself. I’ll make it weird.",
  chapter,
  progress,
  reactionKey,
  scene = "companion",
}) {
  const stageRef = useRef(null);
  const inView = useInView(stageRef, { margin: "60px" });
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const prefersReducedMotion = useReducedMotion();
  const config = useContext(MotionConfigContext);
  const reduced = prefersReducedMotion || config.reducedMotion === "always";
  const imageSource = moods[mood] || moods.curious;
  const imageSourceSmall = asset(
    mood === "skeptical"
      ? "genii-opal-thinking-480.webp"
      : "genii-opal-alert-480.webp",
  );
  const pointerX = useSpring(0, { stiffness: 110, damping: 22 });
  const pointerY = useSpring(0, { stiffness: 110, damping: 22 });
  const rotate = useTransform(pointerX, [-1, 1], [-5, 5]);
  const x = useTransform(pointerX, [-1, 1], [-9, 9]);
  const y = useTransform(pointerY, [-1, 1], [-7, 7]);
  const settle = () => {
    pointerX.set(0);
    pointerY.set(0);
  };
  useEffect(() => {
    if (reduced) {
      pointerX.jump(0);
      pointerY.jump(0);
    }
  }, [reduced, pointerX, pointerY]);
  const follow = (event) => {
    if (reduced || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 2);
    pointerY.set(((event.clientY - box.top) / box.height - 0.5) * 2);
  };
  return (
    <div
      ref={stageRef}
      className={`genii-stage ${compact ? "genii-stage--compact" : ""}`}
      data-mood={mood}
      data-scene={scene}
      data-stage-motion={reduced ? "off" : "on"}
      data-stage-active={inView && pageVisible ? "true" : "false"}
      onPointerMove={follow}
      onPointerLeave={settle}
    >
      <div className="stage-artwork" aria-hidden="true">
        <img
          className="stage-environment"
          fetchpriority={compact ? "auto" : "high"}
          src={asset("genii-ribbon-stage.webp")}
          srcSet={`${asset("genii-ribbon-stage-800.webp")} 800w, ${asset("genii-ribbon-stage.webp")} 1536w`}
          sizes={compact ? "340px" : "(max-width: 760px) 110vw, 700px"}
          width="1536"
          height="1024"
          alt=""
        />
        <div className="stage-contact-shadow" />
      </div>
      <div className="thought-field" aria-hidden="true">
        <i className="thought-orbit thought-orbit--one" />
        <i className="thought-orbit thought-orbit--two" />
        <i className="thought-orbit thought-orbit--three" />
        <i className="thought-pearl thought-pearl--one" />
        <i className="thought-pearl thought-pearl--two" />
        <i className="thought-pearl thought-pearl--three" />
        <div className="thought-wave">
          {Array.from({ length: 17 }, (_, i) => (
            <i
              key={i}
              style={{
                "--bar": i,
                "--height": `${8 + Math.sin((i / 16) * Math.PI) * 23}px`,
              }}
            />
          ))}
        </div>
      </div>
      <motion.div className="genii-pose" style={{ rotate, x, y }}>
        <motion.div
          key={reactionKey || "resting"}
          className="genii-reaction"
          initial={!reduced && reactionKey ? { y: 0, rotate: 0 } : false}
          animate={
            !reduced && reactionKey
              ? { y: [0, -13, 0], rotate: [0, 3, -2, 0] }
              : { y: 0, rotate: 0 }
          }
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="genii-breathe">
            <img
              className="genii-sprite"
              src={imageSource}
              srcSet={`${imageSourceSmall} 480w, ${imageSource} 800w`}
              sizes={
                compact
                  ? "(max-width: 760px) 74px, 240px"
                  : "(max-width: 760px) 65vw, 340px"
              }
              width="800"
              height="800"
              fetchpriority={compact ? "auto" : "high"}
              alt="Genii"
            />
          </div>
        </motion.div>
      </motion.div>
      <IdeaSpark trigger={reactionKey} reduced={reduced} />
      {bubble && (
        <motion.div
          key={bubble}
          className="genii-bubble"
          initial={reduced ? false : { opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <Sparkles size={14} strokeWidth={1.7} aria-hidden="true" />
          <span>{bubble}</span>
        </motion.div>
      )}
      {chapter && (
        <div className="stage-caption">
          <span>Genii studio</span>
          <strong>Chapter {chapter}</strong>
          {progress != null && <i style={{ "--progress": `${progress}%` }} />}
        </div>
      )}
    </div>
  );
}
