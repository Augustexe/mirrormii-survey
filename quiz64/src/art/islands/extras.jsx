// Extras: "Genii's Notebook". An open notebook on the island with sparkles drifting up from its pages.
import { Shadow, Star } from "./frame.jsx";

const DRIFT = [[150, 160, 6, "w"], [172, 140, 8.5, "v3"], [137, 132, 4, "w"], [186, 114, 5, "w"], [158, 102, 3.6, "v3"], [128, 104, 2.6, "w"], [196, 150, 2.8, "w"]];

export default {
  box: "102 90 116 116",
  hero: (P) => (
    <g data-part="hero">
      <ellipse cx="160" cy="150" rx="44" ry="58" fill={P.l} opacity="0.5" />
      <Shadow P={P} x={160} y={200} rx={60} />
      <path d="M100,196 L100,199.5 C120,195.5 144,197.5 160,205.5 C176,197.5 200,195.5 220,199.5 L220,196 C200,192 176,194 160,202 C144,194 120,192 100,196 Z" fill={P.t} stroke={P.d} strokeOpacity="0.3" strokeWidth="0.8" />
      <path d="M160,186 C146,178 124,176 104,180 L100,196 C120,192 144,194 160,202 Z" fill={P.w} stroke={P.d} strokeOpacity="0.35" />
      <path d="M160,186 C174,178 196,176 216,180 L220,196 C200,192 176,194 160,202 Z" fill={P.w} stroke={P.d} strokeOpacity="0.35" />
      <path d="M111,184 C127,181 143,182 155,187.5 M109.5,189 C125.5,186 141.5,187 155,192.5 M165,187.5 C177,182 193,181 209,184 M165,192.5 C178.5,187 194.5,186 210.5,189" fill="none" stroke={P.t} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M160,186 V202" stroke={P.d} strokeOpacity="0.3" />
      <path d="M167,188.5 L168.5,212 L171.5,207.5 L174.5,211 L173,187" fill={P.v} />
      {DRIFT.map(([x, y, r, c], i) => <Star key={i} x={x} y={y} r={r} fill={P[c]} />)}
    </g>
  ),
  rest: (P) => (
    <g>
      <Star x={80} y={96} r={6} fill={P.w} />
      <Star x={98} y={130} r={3} fill={P.v3} />
      <Star x={236} y={92} r={7} fill={P.v3} o={0.8} />
      <Star x={254} y={132} r={3.5} fill={P.w} />
      <Star x={216} y={60} r={3} fill={P.w} />
      <circle cx="70" cy="140" r="1.6" fill={P.w} />
      <circle cx="248" cy="112" r="1.4" fill={P.d} opacity="0.4" />
      <Shadow P={P} x={232} y={197} rx={22} />
      <path d="M210,199 L244,188 L247.5,191.5 L213.5,202.5 Z" fill={P.warm} stroke={P.d} strokeOpacity="0.4" strokeLinejoin="round" />
      <path d="M244,188 L252,187.5 L247.5,191.5 Z" fill={P.o} stroke={P.d} strokeOpacity="0.4" strokeLinejoin="round" />
      <path d="M210,199 L206,201.5 L213.5,202.5 Z" fill={P.v3} />
      <Shadow P={P} x={86} y={196} rx={18} />
      <path d="M72,188 L100,184 L102,193 L74,197 Z" fill={P.o} stroke={P.d} strokeOpacity="0.35" strokeLinejoin="round" />
      <path d="M74,184.5 L98,181 L100,188.5 L76,192 Z" fill={P.w} stroke={P.d} strokeOpacity="0.3" strokeLinejoin="round" />
    </g>
  ),
};
