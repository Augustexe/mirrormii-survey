// Chapter 2, Friends: "Group Chat Cove". Three cushions round a sparkle campfire, and speech-bubble
// balloons floating up on their strings.
import { Shadow, Star } from "./frame.jsx";

function Cushion({ P, x, y }) {
  return (
    <g>
      <Shadow P={P} x={x} y={y + 9} rx={22} />
      <path d={`M${x - 20},${y} C${x - 22},${y - 10} ${x - 10},${y - 12} ${x},${y - 11} C${x + 10},${y - 12} ${x + 22},${y - 10} ${x + 20},${y} C${x + 22},${y + 9} ${x + 10},${y + 11} ${x},${y + 10} C${x - 10},${y + 11} ${x - 22},${y + 9} ${x - 20},${y} Z`} fill={P.o} stroke={P.d} strokeOpacity="0.35" />
      <path d={`M${x - 9},${y - 3} Q${x},${y + 1} ${x + 9},${y - 3}`} fill="none" stroke={P.d} strokeOpacity="0.3" strokeLinecap="round" />
      <circle cx={x} cy={y - 1.5} r="1.8" fill={P.d} opacity="0.45" />
      <path d={`M${x - 14},${y - 6} Q${x - 8},${y - 9.5} ${x - 1},${y - 9.5}`} fill="none" stroke={P.w} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

function Balloon({ P, x, y, r, fill }) {
  return (
    <g>
      <path d={`M${x - r * 0.45},${y + r * 1.3} C${x - r * 0.1},${y + r * 2.2} ${x - r},${y + r * 2.8} ${x - r * 0.3},${y + r * 3.7}`} fill="none" stroke={P.d} strokeOpacity="0.45" strokeWidth="1" />
      <path d={`M${x - r},${y} a${r},${r} 0 1 1 ${r * 1.2},${r * 0.98} L${x - r * 0.45},${y + r * 1.3} L${x - r * 0.35},${y + r * 0.85} A${r},${r} 0 0 1 ${x - r},${y} Z`} fill={fill} stroke={P.w} strokeWidth="1.2" />
      <circle cx={x - r * 0.4} cy={y} r={r * 0.11} fill={P.d} opacity="0.4" />
      <circle cx={x} cy={y} r={r * 0.11} fill={P.d} opacity="0.4" />
      <circle cx={x + r * 0.4} cy={y} r={r * 0.11} fill={P.d} opacity="0.4" />
      <path d={`M${x - r * 0.62},${y - r * 0.35} A${r * 0.7},${r * 0.7} 0 0 1 ${x - r * 0.1},${y - r * 0.72}`} fill="none" stroke={P.w} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

export default {
  box: "104 104 112 112",
  hero: (P) => (
    <g data-part="hero">
      <Shadow P={P} x={160} y={198} rx={30} />
      <circle cx="160" cy="170" r="42" fill={P.l} />
      <path d="M141,198 L179,187 M141,187 L179,198" stroke={P.d} strokeOpacity="0.75" strokeWidth="7" strokeLinecap="round" />
      <path d="M144,195 L175,186 M146,186.5 L176,195.5" stroke={P.w} strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
      <Star x={160} y={166} r={25} fill={P.t} />
      <Star x={160} y={168} r={15} fill={P.w} />
      <Star x={144} y={140} r={4} fill={P.w} />
      <Star x={177} y={134} r={3} fill={P.t} />
      <Star x={166} y={122} r={2.4} fill={P.w} />
    </g>
  ),
  rest: (P) => (
    <g>
      <Balloon P={P} x={86} y={84} r={17} fill={P.o} />
      <Balloon P={P} x={126} y={52} r={13} fill={P.g} />
      <Balloon P={P} x={238} y={76} r={19} fill={P.o} />
      <Cushion P={P} x={206} y={170} />
      <Cushion P={P} x={104} y={192} />
      <Cushion P={P} x={218} y={198} />
      <Star x={70} y={176} r={2.6} fill={P.w} />
    </g>
  ),
};
