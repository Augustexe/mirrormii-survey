// Chapter 3, Love and your person: "Two-Cup Terrace". Two teacups tied with a ribbon, their steam
// curling into a heart, and a heart-shaped kite on a long tail.
import { Shadow, Star } from "./frame.jsx";

function Cup({ P, x, y, flip }) {
  const s = flip ? -1 : 1;
  return (
    <g>
      <Shadow P={P} x={x} y={y + 27} rx={22} />
      <ellipse cx={x} cy={y + 25} rx="22" ry="5.5" fill={P.o} stroke={P.d} strokeOpacity="0.35" />
      <path d={`M${x + 15 * s},${y + 5} C${x + 26 * s},${y + 3} ${x + 27 * s},${y + 16} ${x + 12 * s},${y + 17}`} fill="none" stroke={P.d} strokeOpacity="0.5" strokeWidth="2.6" strokeLinecap="round" />
      <path d={`M${x - 17},${y} C${x - 17},${y + 14} ${x - 10},${y + 23} ${x},${y + 23} C${x + 10},${y + 23} ${x + 17},${y + 14} ${x + 17},${y} Z`} fill={P.o} stroke={P.d} strokeOpacity="0.4" />
      <ellipse cx={x} cy={y} rx="17" ry="4.5" fill={P.w} stroke={P.d} strokeOpacity="0.4" />
      <ellipse cx={x} cy={y + 0.8} rx="13.5" ry="3" fill={P.d} opacity="0.4" />
      <path d={`M${x - 13},${y + 6} C${x - 12},${y + 13} ${x - 8},${y + 18} ${x - 3},${y + 20}`} fill="none" stroke={P.w} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

const bow = (x, y) => `M${x},${y} L${x - 5},${y - 3.5} L${x - 5},${y + 3.5} Z M${x},${y} L${x + 5},${y - 3.5} L${x + 5},${y + 3.5} Z`;

export default {
  box: "102 98 116 116",
  hero: (P) => (
    <g data-part="hero">
      <path d="M160,140 C150,132 141,126 141,117 a9.5,9.5 0 0 1 19,-2.5 a9.5,9.5 0 0 1 19,2.5 C179,126 170,132 160,140 Z" fill={P.w} fillOpacity="0.4" stroke={P.w} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M135,156 C129,149 139,145 135,137 M185,156 C191,149 181,145 185,137" fill="none" stroke={P.w} strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" />
      <Cup P={P} x={135} y={164} flip />
      <Cup P={P} x={185} y={164} />
      <path d="M119,176 C140,184 180,184 201,176" fill="none" stroke={P.v} strokeWidth="3" strokeLinecap="round" />
      <path d="M160,181 C150,170 143,177 150,186 Z M160,181 C170,170 177,177 170,186 Z" fill={P.v3} stroke={P.v} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M160,181 L153,195 M160,181 L167,195" stroke={P.v} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="160" cy="181" r="2.8" fill={P.v} />
    </g>
  ),
  rest: (P) => (
    <g>
      <path d="M239,80 C232,120 214,150 200,170" fill="none" stroke={P.w} strokeOpacity="0.8" strokeWidth="1" />
      <path d="M239,94 C233,108 247,116 239,128 C233,138 245,146 237,156" fill="none" stroke={P.d} strokeOpacity="0.5" strokeWidth="1.2" />
      <path d={`${bow(237, 110)} ${bow(241, 131)} ${bow(238, 150)}`} fill={P.t} />
      <path d="M239,95 C225,85 215,77 215,66 a12,12 0 0 1 24,-3 a12,12 0 0 1 24,3 C263,77 253,85 239,95 Z" fill={P.o} stroke={P.d} strokeOpacity="0.45" strokeWidth="1.2" />
      <path d="M239,60 L239,94 M218,69 L260,69" stroke={P.d} strokeOpacity="0.3" />
      <path d="M221,63 C222,58 227,55 232,57" fill="none" stroke={P.w} strokeWidth="2" strokeLinecap="round" />
      <path d="M72,98 C67,94 64,91 64,88 a3.5,3.5 0 0 1 8,-1 a3.5,3.5 0 0 1 8,1 C80,91 77,94 72,98 Z M98,72 C95,70 93,68 93,66 a2.5,2.5 0 0 1 5,-0.6 a2.5,2.5 0 0 1 5,0.6 C103,68 101,70 98,72 Z" fill={P.t} opacity="0.8" />
      <Star x={98} y={176} r={3} fill={P.w} />
      <Star x={226} y={190} r={2.4} fill={P.w} />
    </g>
  ),
};
