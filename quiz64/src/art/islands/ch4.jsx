// Chapter 4, Money and treats: "Treat Market". A glass coin jar, a paper shopping bag with a treat
// peeking out, and a tiny fountain of coins.
import { Shadow, Star } from "./frame.jsx";

function Coin({ P, x, y, r = 9, tilt = 0 }) {
  return (
    <g transform={tilt ? `rotate(${tilt} ${x} ${y})` : undefined}>
      <ellipse cx={x} cy={y + r * 0.2} rx={r} ry={r * 0.38} fill={P.wd} opacity="0.55" />
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.38} fill={P.warm} stroke={P.wd} strokeOpacity="0.6" strokeWidth="0.8" />
      <ellipse cx={x} cy={y} rx={r * 0.55} ry={r * 0.2} fill="none" stroke={P.w} strokeOpacity="0.7" strokeWidth="0.8" />
    </g>
  );
}

const PILE = [[146, 190], [164, 191.5], [178, 188.5], [154, 184], [172, 182.5], [162, 176.5], [146, 177.5], [180, 176]];
const SPRAY = [[96, 176, 5, 20], [92, 160, 5, -30], [99, 146, 5, 50], [84, 136, 4.5, -10], [109, 134, 4.5, 30], [74, 148, 4.5, -45], [118, 150, 4.5, 60], [70, 166, 4, 10], [122, 168, 4, -20]];

export default {
  box: "106 104 108 108",
  hero: (P) => (
    <g data-part="hero">
      <Shadow P={P} x={160} y={199} rx={34} />
      <circle cx="160" cy="166" r="40" fill={P.m} opacity="0.5" />
      <path d="M138,151 C132,155 130,161 130,169 V186 C130,194 136,198 144,198 H176 C184,198 190,194 190,186 V169 C190,161 188,155 182,151 Z" fill={P.g} />
      {PILE.map(([x, y], i) => <Coin key={i} P={P} x={x} y={y} tilt={(i % 3) * 8 - 8} />)}
      <path d="M138,151 C132,155 130,161 130,169 V186 C130,194 136,198 144,198 H176 C184,198 190,194 190,186 V169 C190,161 188,155 182,151 Z" fill={P.w} fillOpacity="0.16" stroke={P.w} strokeWidth="1.4" />
      <path d="M136.5,165 V187" stroke={P.w} strokeWidth="3" strokeLinecap="round" />
      <path d="M184,170 V180" stroke={P.w} strokeOpacity="0.8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M140,142 H180 a3,3 0 0 1 3,3 v4 a2,2 0 0 1 -2,2 H139 a2,2 0 0 1 -2,-2 v-4 a3,3 0 0 1 3,-3 Z" fill={P.od} />
      <path d="M152,145.5 H168" stroke={P.d} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="160" cy="132" rx="3.6" ry="9" fill={P.warm} stroke={P.wd} strokeOpacity="0.6" />
      <Star x={174} y={124} r={5} fill={P.w} />
    </g>
  ),
  rest: (P) => (
    <g>
      <Shadow P={P} x={222} y={197} rx={26} />
      <path d="M208,160 C208,147 220,147 220,160 M220,160 C220,147 232,147 232,160" fill="none" stroke={P.d} strokeOpacity="0.6" strokeWidth="1.8" />
      <circle cx="229" cy="154" r="8" fill={P.v3} stroke={P.w} strokeWidth="1.2" />
      <path d="M225,151 a4.5,4.5 0 0 1 7.5,4" fill="none" stroke={P.w} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M200,160 H240 L244,197 H196 Z" fill={P.o} stroke={P.d} strokeOpacity="0.4" />
      <path d="M240,160 L248,164 L250,193 L244,197 Z" fill={P.d} opacity="0.3" />
      <path d="M200,160 H240 L240.7,167 H199.3 Z" fill={P.w} opacity="0.6" />
      <path d="M207,178 L211,172 L215,178 Z" fill={P.w} opacity="0.8" />
      <path d="M74,192 C76,202 86,206 96,206 C106,206 116,202 118,192 Z" fill={P.g} stroke={P.w} strokeWidth="1" />
      <ellipse cx="96" cy="192" rx="22" ry="6" fill={P.t} stroke={P.w} strokeWidth="1.2" />
      <path d="M96,190 C96,168 92,150 84,138 M96,190 C98,168 104,150 110,136" fill="none" stroke={P.w} strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="1 4" strokeLinecap="round" />
      {SPRAY.map(([x, y, r, t], i) => <Coin key={i} P={P} x={x} y={y} r={r} tilt={t} />)}
      <Star x={88} y={120} r={4} fill={P.w} />
      <Star x={124} y={186} r={2.6} fill={P.w} />
    </g>
  ),
};
