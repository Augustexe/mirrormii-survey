// Finale: "The Mirror". The arch mirror on the island with eight small frosted panes in orbit.
import { Shadow, Star } from "./frame.jsx";

const PANES = Array.from({ length: 8 }, (_, i) => {
  const a = ((i * 45 + 22.5) * Math.PI) / 180;
  return [Math.round((160 + 96 * Math.cos(a)) * 10) / 10, Math.round((146 + 26 * Math.sin(a)) * 10) / 10, Math.sin(a) < 0];
});

function Pane({ P, x, y, back }) {
  const k = back ? 0.82 : 1;
  const w = 13 * k;
  const h = 17 * k;
  return (
    <g opacity={back ? 0.7 : 1}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3 * k} fill={P.g} stroke={P.w} strokeWidth="1" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3 * k} fill={P.t} opacity="0.45" />
      <path d={`M${x - w / 2 + 2},${y - h / 2 + 5} L${x - w / 2 + 5},${y - h / 2 + 2}`} stroke={P.w} strokeWidth="1.2" strokeLinecap="round" />
      <Star x={x} y={y + 1} r={3.2 * k} fill={P.v} o={0.75} />
    </g>
  );
}

export default {
  box: "96 84 128 128",
  hero: (P) => {
    const sv = `${P.rid}-sv`;
    return (
      <g data-part="hero">
        <defs>
          <linearGradient id={sv} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={P.s2} />
            <stop offset="0.3" stopColor={P.w} />
            <stop offset="0.55" stopColor={P.s1} />
            <stop offset="0.8" stopColor={P.s2} />
            <stop offset="1" stopColor={P.s1} />
          </linearGradient>
          <linearGradient id={`${P.rid}-gl`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.v3} />
            <stop offset="0.55" stopColor={P.v1} />
            <stop offset="1" stopColor={P.s1} />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="140" rx="64" ry="70" fill={P.l} opacity="0.45" />
        <ellipse cx="160" cy="146" rx="96" ry="26" fill="none" stroke={P.v3} strokeOpacity="0.7" strokeDasharray="2 5" />
        {PANES.filter((p) => p[2]).map(([x, y], i) => <Pane key={i} P={P} x={x} y={y} back />)}
        <Shadow P={P} x={160} y={199} rx={38} />
        <path d="M130,197 V136 a30,30 0 0 1 60,0 V197 Z" fill={`url(#${sv})`} stroke={P.s2} />
        <path d="M136,195 V137 a24,24 0 0 1 48,0 V195 Z" fill={`url(#${P.rid}-gl)`} />
        <circle cx="160" cy="142" r="15" fill={P.l} />
        <path d="M136,150 L184,128 V160 L136,182 Z" fill={P.w} opacity="0.18" />
        <path d="M152,150 L136,132 M152,150 L170,118 M152,150 L184,160 M152,150 L140,176 M152,150 L166,195 M146,139 L162,136 L170,154 L158,166 L144,160 Z" fill="none" stroke={P.w} strokeOpacity="0.75" strokeWidth="0.9" />
        <path d="M136,166 H184" stroke={P.s2} strokeWidth="2.4" />
        <path d="M136,165 H184" stroke={P.w} strokeWidth="0.8" />
        <path d="M140,138 a20,20 0 0 1 12,-17" fill="none" stroke={P.w} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M124,195 H196 a3,3 0 0 1 3,3 v1.5 a2,2 0 0 1 -2,2 H123 a2,2 0 0 1 -2,-2 V198 a3,3 0 0 1 3,-3 Z" fill={`url(#${sv})`} stroke={P.s2} />
        <Star x={160} y={102} r={6} fill={P.w} />
        {PANES.filter((p) => !p[2]).map(([x, y], i) => <Pane key={i} P={P} x={x} y={y} />)}
      </g>
    );
  },
  rest: (P) => (
    <g>
      <path d="M138,205 H182 L187,211 H133 Z" fill={P.g} stroke={P.w} strokeWidth="0.8" />
      <Star x={74} y={100} r={4} fill={P.w} />
      <Star x={250} y={98} r={5} fill={P.v3} />
      <Star x={228} y={196} r={2.4} fill={P.w} />
    </g>
  ),
};
