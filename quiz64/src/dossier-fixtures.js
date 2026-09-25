import * as Session from './dossier-session.js';

export const DOSSIER_FIXTURES = ['complete', 'mixed', 'sparse', 'skipped', 'quiet-planner', 'quick-improviser', 'direct-explorer'];

/** Synthetic fixtures use the same public session lifecycle as the respondent UI.
 * They never read/write storage, publish data or claim real-person validation. */
export function makeDossierFixture(fixture = 'complete', config = {}) {
  if (!DOSSIER_FIXTURES.includes(fixture)) throw new Error('Unknown fixture');
  let state = Session.createSession({ route: 'everyday', voice: 'playful', personal: false, ...config });
  const targets = {
    'quiet-planner': ['left','left','left','right','left'],
    'quick-improviser': ['right','right','left','left','right'],
    'direct-explorer': ['left','right','right','right','right'],
  }[fixture];
  const axes = ['activation_tempo','social_signal_style','friction_posture','structure_reliance','novelty_aperture'];
  let index = 0;
  while (state.phase !== 'complete' && index < 100) {
    if (state.phase === 'ready_to_freeze') {
      state = Session.freezeSession(state);
      continue;
    }
    const current = Session.currentQuestion(state);
    const question = current?.template || current;
    if (!question) throw new Error(`Fixture stopped in ${state.phase}`);
    const skip = question.exits.find((exit) => exit.reason === 'skip');
    const preferred = targets && [...question.options].sort((a,b) => {
      const score = option => option.predicates.reduce((sum,p) => sum + (axes.includes(p.axisId) ? (targets[axes.indexOf(p.axisId)] === p.direction ? 1 : -1) * (p.strength || 1) : 0),0);
      return score(b)-score(a);
    })[0];
    const selected = fixture === 'skipped' || (fixture === 'sparse' && index % 7 !== 0)
      ? skip.id
      : preferred?.id || question.options[fixture === 'mixed' ? index % Math.min(2, question.options.length) : 0].id;
    state = Session.answerQuestion(state, question.itemId, selected);
    index += 1;
  }
  if (state.phase !== 'complete') throw new Error('Fixture did not complete');
  return state;
}
