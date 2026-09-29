// Chapter 7, Play, rules and you: "Rulebook Arcade". Two dice, a board-game path along the shore,
// a whistle on its lanyard and a rulebook drifting overhead.
import { Shadow, Star } from "./frame.jsx";

// An isometric die: top-face center (x, y), edge s; pips: top 1, left 2, right 3.
function Die({ P, x, y, s }) {
  const a = s * 0.87;
  const b = s * 0.5;
  const L = (u, w) => [x - a + u * a, y + u * b + w * s];
  const R = (u, w) => [x + u * a, y + b - u * b + w * s];
  const pip = ([px, py], i) => <ellipse key={i} cx={px} cy={py} rx={s * 0.075} ry={s * 0.095} fill={P.d} opacity="0.6" />;
  return (
    <g strokeLinejoin="round">
      <Shadow P={P} x={x} y={y + b + s} rx={a * 1.05} />
      <path d={`M${x},${y - b} L${x + a},${y} L${x},${y + b} L${x - a},${y} Z`} fill={P.w} stroke={P.d} strokeOpacity="0.3" />
      <path d={`M${x - a},${y} L${x},${y + b} L${x},${y + b + s} L${x - a},${y + s} Z`} fill={P.o} stroke={P.d} strokeOpacity="0.3" />
      <path d={`M${x},${y + b} L${x + a},${y} L${x + a},${y + s} L${x},${y + b + s} Z`} fill={P.od} stroke={P.d} strokeOpacity="0.3" />
      <ellipse cx={x} cy={y} rx={s * 0.12} ry={s * 0.07} fill={P.d} opacity="0.6" />
      {[L(0.3, 0.28), L(0.7, 0.72)].map(pip)}
      {[R(0.25, 0.22), R(0.5, 0.5), R(0.75, 0.78)].map((p, i) => pip(p, i + 2))}
      <path d={`M${x - a + 3},${y + 1} L${x - 2},${y + b - 1.5}`} stroke={P.w} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

export default {
  box: "106 110 112 112",
  hero: (P) => (
    <g data-part="hero">
      <Die P={P} x={146} y={152} s={30} />
      <Die P={P} x={194} y={172} s={21} />
      <Star x={124} y={128} r={4.5} fill={P.w} />
      <Star x={206} y={140} r={3} fill={P.t} />
    </g>
  ),
  rest: (P) => (
    <g>
      <path d="M58,193 C84,206 116,210 156,209 C196,208 228,206 258,193" fill="none" stroke={P.w} strokeWidth="8" strokeDasharray="8 3" />
      <path d="M58,193 C84,206 116,210 156,209 C196,208 228,206 258,193" fill="none" stroke={P.t} strokeWidth="8" strokeDasharray="8 14" />
      <circle cx="58" cy="193" r="5.5" fill={P.v3} stroke={P.w} strokeWidth="1.4" />
      <Star x={258} y={192} r={8} fill={P.warm} />
      <Shadow P={P} x={236} y={181} rx={20} />
      <path d="M253,161 C270,152 271,190 250,194" fill="none" stroke={P.v} strokeOpacity="0.7" strokeWidth="1.3" />
      <path d="M214,164 H240 V176 H214 a2,2 0 0 1 -2,-2 V166 a2,2 0 0 1 2,-2 Z" fill={P.o} stroke={P.d} strokeOpacity="0.5" />
      <circle cx="244" cy="172" r="9" fill={P.o} stroke={P.d} strokeOpacity="0.5" />
      <path d="M228,164 H234 V167 H228 Z" fill={P.d} opacity="0.5" />
      <circle cx="251" cy="162" r="3.2" fill="none" stroke={P.d} strokeOpacity="0.6" strokeWidth="1.3" />
      <path d="M217,167 H236 M240,166.5 a6,6 0 0 1 6,-1" stroke={P.w} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M205,170 C201,168 201,163 205,161 M200,174 C194,171 194,162 200,158" fill="none" stroke={P.w} strokeOpacity="0.9" strokeWidth="1.4" strokeLinecap="round" />
      <g transform="rotate(-18 72 96)">
        <path d="M50,84 H90 a3,3 0 0 1 3,3 V108 H53 a3,3 0 0 1 -3,-3 Z" fill={P.w} stroke={P.d} strokeOpacity="0.4" />
        <path d="M50,82 H88 a3,3 0 0 1 3,3 V104 H53 a3,3 0 0 1 -3,-3 Z" fill={P.o} stroke={P.d} strokeOpacity="0.45" />
        <path d="M56,82 V104" stroke={P.d} strokeOpacity="0.35" strokeWidth="1.5" />
        <path d={"M73,87 L74.6,91.4 L79,93 L74.6,94.6 L73,99 L71.4,94.6 L67,93 L71.4,91.4 Z"} fill={P.w} />
      </g>
      <Star x={100} y={60} r={3.4} fill={P.w} />
    </g>
  ),
};
