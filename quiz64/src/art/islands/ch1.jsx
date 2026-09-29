// Chapter 1, Your phone: "Notification Isle". A glass phone slab lying on the island, notification-bubble
// clouds drifting over it, and a charging cable that wanders off the edge.
import { Shadow, Star } from "./frame.jsx";

const cloud = (x, y, s) =>
  `M${x - 20 * s},${y + 8 * s} C${x - 30 * s},${y + 8 * s} ${x - 30 * s},${y - 6 * s} ${x - 18 * s},${y - 6 * s} C${x - 17 * s},${y - 18 * s} ${x + 2 * s},${y - 20 * s} ${x + 6 * s},${y - 9 * s} C${x + 12 * s},${y - 17 * s} ${x + 26 * s},${y - 12 * s} ${x + 22 * s},${y - 2 * s} C${x + 32 * s},${y - 1 * s} ${x + 31 * s},${y + 8 * s} ${x + 22 * s},${y + 8 * s} L${x - 4 * s},${y + 8 * s} L${x - 14 * s},${y + 16 * s} L${x - 12 * s},${y + 8 * s} Z`;

function Cloud({ P, x, y, s }) {
  return (
    <g>
      <path d={cloud(x, y + 2 * s, s)} fill={P.t} opacity="0.35" />
      <path d={cloud(x, y, s)} fill={P.w} opacity="0.95" stroke={P.t} strokeWidth="1" />
      <circle cx={x + 22 * s} cy={y - 10 * s} r={5 * s} fill={P.t} stroke={P.w} strokeWidth="1.4" />
      <path d={`M${x - 16 * s},${y - 2 * s} C${x - 12 * s},${y - 7 * s} ${x - 6 * s},${y - 9 * s} ${x},${y - 8 * s}`} fill="none" stroke={P.t} strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

export default {
  box: "100 108 128 128",
  hero: (P) => (
    <g data-part="hero">
      <Shadow P={P} x={164} y={202} rx={60} ry={8} />
      <path d="M106,189 L150,208 L220,191 L220,196 L150,213 L106,194 Z" fill={P.d} opacity="0.4" />
      <path d="M110,184 L172,170 Q177,169 181,171 L218,187 Q223,190 217,192 L155,207 Q150,208 146,206 L108,190 Q103,187 110,184 Z" fill={P.g} stroke={P.w} strokeWidth="1.3" />
      <path d="M120,186 L172,175 L208,189 L156,201 Z" fill={P.o} />
      <path d="M120,186 L172,175 L208,189 L156,201 Z" fill={P.l} opacity="0.7" />
      <path d="M140,186 L166,180.5 Q169,180 171,181 L178,184 Q180,185.5 177,186 L152,191.5 Q149,192 147,191 L140,188 Q138,186.6 140,186 Z" fill={P.w} />
      <ellipse cx="148" cy="187.2" rx="2.4" ry="1.4" fill={P.d} opacity="0.55" />
      <path d="M155,187.5 L170,184.2" stroke={P.t} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M116,185.5 L162,175.2" stroke={P.w} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M156,128 H188 a10,10 0 0 1 10,10 v2 a10,10 0 0 1 -10,10 H170 l-9,8 l1,-8 h-6 a10,10 0 0 1 -10,-10 v-2 a10,10 0 0 1 10,-10 Z" fill={P.w} stroke={P.t} strokeWidth="1.2" />
      <circle cx="161" cy="139" r="2.2" fill={P.d} opacity="0.5" />
      <circle cx="170" cy="139" r="2.2" fill={P.d} opacity="0.5" />
      <circle cx="179" cy="139" r="2.2" fill={P.d} opacity="0.5" />
      <circle cx="196" cy="129" r="6" fill={P.t} stroke={P.w} strokeWidth="1.8" />
      <Star x={206} y={116} r={5} fill={P.w} />
    </g>
  ),
  rest: (P) => (
    <g>
      <Cloud P={P} x={78} y={88} s={1.05} />
      <Cloud P={P} x={236} y={68} s={1.25} />
      <Cloud P={P} x={256} y={134} s={0.72} />
      <path d="M108,191 C92,198 66,204 54,200 C46,197 43,202 44,210 L45,221" fill="none" stroke={P.d} strokeOpacity="0.7" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M40,221 h10 v8 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 Z" fill={P.o} stroke={P.d} strokeOpacity="0.6" />
      <path d="M43,231 v4 M47,231 v4" stroke={P.d} strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
      <Star x={92} y={183} r={3.2} fill={P.w} />
      <Star x={232} y={182} r={2.6} fill={P.w} />
      <Star x={204} y={201} r={2} fill={P.d} o={0.4} />
    </g>
  ),
};
