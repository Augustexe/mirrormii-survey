// Chapter 6, Family and home: "Home Harbor". A small house with a lit window, a key floating over it,
// and a table set for two.
import { Shadow, Star } from "./frame.jsx";

export default {
  box: "106 90 112 112",
  hero: (P) => (
    <g data-part="hero">
      <Shadow P={P} x={160} y={198} rx={46} />
      <circle cx="148" cy="170" r="30" fill={P.m} opacity="0.75" />
      <path d="M180,127 V112 a1.5,1.5 0 0 1 1.5,-1.5 H188.5 a1.5,1.5 0 0 1 1.5,1.5 V135 Z" fill={P.od} />
      <circle cx="189" cy="102" r="3.2" fill={P.w} opacity="0.75" />
      <circle cx="195" cy="92" r="4.2" fill={P.w} opacity="0.6" />
      <circle cx="204" cy="84" r="5.2" fill={P.w} opacity="0.45" />
      <path d="M128,150 H192 V197 H128 Z" fill={P.o} stroke={P.d} strokeOpacity="0.35" />
      <path d="M118,153 L160,116 L202,153 a2,2 0 0 1 -1.6,3 H119.6 a2,2 0 0 1 -1.6,-3 Z" fill={P.od} />
      <path d="M126,150 L160,120.5" stroke={P.w} strokeOpacity="0.65" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M137,160 H159 V179 H137 Z" fill={P.warm} stroke={P.d} strokeOpacity="0.45" />
      <path d="M137,160 H159 V179 H137 Z" fill={P.m} />
      <path d="M148,160 V179 M137,169.5 H159" stroke={P.d} strokeOpacity="0.45" strokeWidth="1.3" />
      <path d="M169,197 V175 a8,8 0 0 1 16,0 V197 Z" fill={P.d} opacity="0.55" />
      <circle cx="181" cy="186" r="1.4" fill={P.w} />
      <path d="M131,154 V194" stroke={P.w} strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="177" cy="203" rx="5" ry="1.6" fill={P.w} opacity="0.7" />
      <ellipse cx="170" cy="207" rx="4" ry="1.4" fill={P.w} opacity="0.6" />
    </g>
  ),
  rest: (P) => (
    <g>
      <g transform="rotate(-32 238 74)">
        <path d="M233,71 H262 V76.5 H259 V82 H255 V76.5 H252 V80 H248.5 V76.5 H233 Z" fill={P.o} stroke={P.d} strokeOpacity="0.5" strokeLinejoin="round" />
        <path d="M222,62 a11,11 0 1 0 0.01,0 Z M222,69 a4.5,4.5 0 1 1 -0.01,0 Z" fill={P.o} fillRule="evenodd" stroke={P.d} strokeOpacity="0.5" />
        <path d="M214,70 a8.5,8.5 0 0 1 5,-5.5" fill="none" stroke={P.w} strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <Star x={262} y={50} r={4.5} fill={P.w} />
      <Shadow P={P} x={90} y={198} rx={20} />
      <path d="M86.5,181 H93.5 V196 H86.5 Z" fill={P.d} opacity="0.4" />
      <ellipse cx="90" cy="197" rx="10" ry="2.5" fill={P.d} opacity="0.4" />
      <path d="M64,176 V179 C64,184 116,184 116,179 V176 Z" fill={P.d} opacity="0.28" />
      <ellipse cx="90" cy="176" rx="26" ry="7" fill={P.w} stroke={P.d} strokeOpacity="0.3" />
      <ellipse cx="77" cy="176" rx="7.5" ry="2.6" fill={P.o} stroke={P.d} strokeOpacity="0.35" strokeWidth="0.8" />
      <ellipse cx="103" cy="176" rx="7.5" ry="2.6" fill={P.o} stroke={P.d} strokeOpacity="0.35" strokeWidth="0.8" />
      <path d="M87.5,173 C85.5,169 86.5,165 88.5,163 H91.5 C93.5,165 94.5,169 92.5,173 Z" fill={P.t} stroke={P.d} strokeOpacity="0.35" strokeWidth="0.8" />
      <path d="M90,163 V156" stroke={P.d} strokeOpacity="0.5" />
      <Star x={90} y={152} r={5} fill={P.warm} />
      <Star x={228} y={186} r={2.6} fill={P.w} />
      <Star x={56} y={120} r={3.2} fill={P.w} />
    </g>
  ),
};
