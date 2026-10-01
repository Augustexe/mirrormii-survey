# Frontend dependency notices

The shipped app uses the following open source packages. Versions are locked in `package-lock.json`.

| Package | Use | License |
| --- | --- | --- |
| React, ReactDOM, Scheduler | UI runtime | MIT |
| Motion | Page and state transitions | MIT |
| lucide-react | Interface icons | ISC |
| three | Genii's 3D evolution scene (lazy chunk) | MIT |
| @paper-design/shaders-react, @paper-design/shaders | Backdrop shader | Apache-2.0 |
| Satoshi | Self-hosted, unmodified variable font from Fontshare (`src/system/fonts/`) | ITF Free Font License; notice in `public/fonts/FFL.txt` |

Build and test only (not shipped): Vite and `@vitejs/plugin-react` (MIT), `@axe-core/playwright` (MPL-2.0),
`@resvg/resvg-js` (MPL-2.0), svgo (MIT).

The app calls no remote font, analytics, account, survey or model service at runtime.

License texts ship with the static app in `public/THIRD-PARTY-NOTICES.txt` (copied into `dist/` by the build). Gap
(2026-09-30): that file covers React, Motion, lucide-react and Satoshi; the three.js (MIT) and Paper Design shaders
(Apache-2.0) notices still need to be added before a public launch.
