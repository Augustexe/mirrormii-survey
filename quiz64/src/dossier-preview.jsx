import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { PersonalityDossier } from './components/PersonalityDossier.jsx';
import { getResult, addCorrection, serializeSession } from './dossier-session.js';
import { DOSSIER_FIXTURES, makeDossierFixture } from './dossier-fixtures.js';
import './styles.css';
import './launch.css';
import './world.css';
import './jewels.css';
import './living-world.css';
import './dossier-flow.css';
import './dossier-preview.css';

function Preview() {
  const [fixture, setFixture] = useState('complete');
  const [route, setRoute] = useState('everyday');
  const [voice, setVoice] = useState('playful');
  const [motionOn, setMotionOn] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const state = useMemo(() => makeDossierFixture(fixture, { route, voice }), [fixture, route, voice]);
  let corrected = state;
  for (const [id, value] of feedback) {
    try { corrected = addCorrection(corrected, id, value); } catch { /* Prior-fixture IDs do not cross into another snapshot. */ }
  }
  const result = getResult(corrected);
  const exportData = () => {
    const href = URL.createObjectURL(new Blob([serializeSession(corrected)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = href; link.download = 'genii-synthetic-dossier.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };
  return <MotionConfig reducedMotion={motionOn ? 'user' : 'always'}><div className="dossier-app">
    <header className="dp-toolbar"><a href="./">← Open the survey</a><strong>Dossier preview <small>Synthetic data only</small></strong>
      <label>Fixture<select value={fixture} onChange={(event) => { setFixture(event.target.value); setFeedback([]); }}>{DOSSIER_FIXTURES.map((id) => <option key={id}>{id}</option>)}</select></label>
      <label>Edition<select value={route} onChange={(event) => { setRoute(event.target.value); setFeedback([]); }}><option value="everyday">Everyday</option><option value="work_study">Work & study</option><option value="social">Social</option></select></label>
      <label>Voice<select value={voice} onChange={(event) => { setVoice(event.target.value); setFeedback([]); }}><option value="gentle">Gentle</option><option value="playful">Playful</option><option value="sharp">Sharp</option></select></label>
      <button className="df-secondary" aria-pressed={motionOn} onClick={() => { setMotionOn(!motionOn); document.body.dataset.motion = !motionOn ? 'on' : 'off'; }}>Motion {motionOn ? 'on' : 'off'}</button>
    </header><p className="dp-notice">Generated answers for design review. Nothing here is saved to survey storage. These examples do not validate the profile or its predictions.</p>
    <PersonalityDossier result={result} storageStatus="preview" onCorrection={(id, value) => setFeedback([...feedback, [id, value]])} onExport={exportData} onRestart={() => { window.location.href = './'; }} onEdit={() => { window.location.href = './'; }} />
  </div></MotionConfig>;
}
createRoot(document.getElementById('root')).render(<Preview />);
