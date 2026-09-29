// Chapter 5, Work, school and ambition: "Ambition Ridge". A ladder of stacked books climbing to a trophy
// cup, a paper plane looping overhead, and a small crystal ridge with a flag.
import { Shadow, Star } from "./frame.jsx";

// [left, right, top] of each book, bottom to top; each is 10 tall.
const BOOKS = [[116, 204, 184], [130, 202, 174], [144, 200, 164], [158, 198, 154]];

function Book({ P, l, r, y, fill }) {
  return (
    <g>
      <path d={`M${l + 3},${y} H${r} V${y + 10} H${l + 3} a3,5 0 0 1 0,-10 Z`} fill={fill} stroke={P.d} strokeOpacity="0.4" strokeWidth="0.9" />
      <path d={`M${r - 6},${y + 2.5} H${r - 1} M${r - 6},${y + 5} H${r - 1} M${r - 6},${y + 7.5} H${r - 1}`} stroke={P.w} strokeWidth="0.8" />
      <path d={`M${l + 10},${y} V${y + 10} M${l + 14},${y} V${y + 10}`} stroke={P.d} strokeOpacity="0.3" strokeWidth="1.2" />
      <path d={`M${l + 18},${y + 2.2} H${r - 12}`} stroke={P.w} strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

export default {
  box: "108 100 108 108",
  hero: (P) => {
    const fills = [P.o, P.v3, P.g, P.od];
    return (
      <g data-part="hero">
        <Shadow P={P} x={160} y={196} rx={50} />
        <circle cx="178" cy="132" r="30" fill={P.m} opacity="0.7" />
        {BOOKS.map(([l, r, y], i) => <Book key={i} P={P} l={l} r={r} y={y} fill={fills[i]} />)}
        <path d="M171,151 H185 V154 H171 Z M175.5,145 H180.5 V151 H175.5 Z" fill={P.wd} opacity="0.8" />
        <path d="M168,131 C161,131 161,140 169,141 M188,131 C195,131 195,140 187,141" fill="none" stroke={P.wd} strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />
        <path d="M167,127 H189 C189,139 185,146 178,146 C171,146 167,139 167,127 Z" fill={P.warm} stroke={P.wd} strokeOpacity="0.6" />
        <path d="M171,130 C171,136 173,140 176,142" fill="none" stroke={P.w} strokeWidth="1.8" strokeLinecap="round" />
        <Star x={178} y={134} r={4} fill={P.w} />
        <Star x={196} y={116} r={4.5} fill={P.w} />
      </g>
    );
  },
  rest: (P) => (
    <g>
      <path d="M60,184 L84,138 L110,180 Z" fill={P.od} opacity="0.75" />
      <path d="M84,138 L96,160 L84,184 Z" fill={P.w} opacity="0.25" />
      <path d="M76,153 L84,138 L92,152 L87,149 L84,153 L80,149 Z" fill={P.w} />
      <path d="M84,138 V118" stroke={P.d} strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M84,118 L98,123 L84,128 Z" fill={P.v3} />
      <path d="M56,98 C40,104 30,124 44,132 C58,140 66,120 52,114 C40,109 26,118 18,130" fill="none" stroke={P.d} strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="3 5" strokeLinecap="round" />
      <path d="M58,96 L112,74 L96,104 L86,92 Z" fill={P.w} stroke={P.d} strokeOpacity="0.4" strokeLinejoin="round" />
      <path d="M86,92 L112,74 L96,104 Z" fill={P.t} opacity="0.75" />
      <path d="M86,92 L112,74" stroke={P.d} strokeOpacity="0.4" />
      <Star x={244} y={150} r={3} fill={P.w} />
      <Star x={232} y={190} r={2.4} fill={P.w} />
    </g>
  ),
};
