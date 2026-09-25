import React from "react";
import {
  Compass,
  Shapes,
  Heart,
  House,
  CloudSun,
  Flower2,
  MoonStar,
  Sparkles,
} from "lucide-react";
import { CHAPTERS } from "../survey.js";
const icons = [
  Compass,
  Shapes,
  Heart,
  House,
  CloudSun,
  Flower2,
  MoonStar,
  Sparkles,
];

export function ChapterRibbon({ current, onOpen, chapters = CHAPTERS }) {
  return (
    <button
      type="button"
      className="chapter-ribbon"
      onClick={onOpen}
      aria-label={`Chapter map. ${chapters.find((c) => c.id === current)?.title || "Your conversation"}`}
    >
      {chapters.map((chapter, index) => {
        const Icon = icons[index] || Sparkles;
        return (
          <span
            key={chapter.id}
            className={`ribbon-stop ${chapter.id === current ? "ribbon-stop--current" : ""} ${chapter.id < current ? "ribbon-stop--past" : ""}`}
            aria-hidden="true"
          >
            <span className="ribbon-icon">
              <Icon size={17} strokeWidth={1.7} />
            </span>
            <span className="ribbon-label">{chapter.title}</span>
          </span>
        );
      })}
    </button>
  );
}
