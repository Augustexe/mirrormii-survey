import React from "react";
import {
  Compass,
  Heart,
  MoonStar,
  Flower2,
  Shapes,
  CloudSun,
  Sparkles,
  House,
} from "lucide-react";
import { JewelIcon } from "./JewelIcon.jsx";
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
export function ChapterObject({ chapter = 1, icon }) {
  const Icon = icon || icons[chapter - 1] || Sparkles;
  return (
    <span className="chapter-object" aria-hidden="true">
      <JewelIcon kind={`chapter-${chapter}`} variant="chapter">
        <Icon size={30} strokeWidth={1.3} />
      </JewelIcon>
    </span>
  );
}
