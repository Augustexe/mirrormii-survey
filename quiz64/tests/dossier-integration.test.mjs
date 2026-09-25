import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { makeDossierFixture } from '../src/dossier-fixtures.js';
import * as Session from '../src/dossier-session.js';
import { getBank } from '../src/question-bank-v2.js';

test('every shipped route and voice completes, restores and preserves sealed evidence', () => {
  for (const route of ['everyday','work_study','social']) for (const voice of ['gentle','playful','sharp']) for (const personal of [false,true]) {
    const state = makeDossierFixture('complete', {route,voice,personal});
    const label = `${route}/${voice}/${personal}`;
    assert.equal(state.phase,'complete',label);
    const restored = Session.restoreSession(Session.serializeSession(state));
    assert.equal(restored.phase,'complete',label);
    assert.deepEqual(restored.snapshot,state.snapshot,label);
    assert.ok(state.snapshot.evidenceEvents.every((event) => event.phase === 'profile'),label);
    assert.ok(state.evaluation.heldoutEvents.every((event) => event.phase === 'heldout'),label);
    const bank = getBank({route,voice,personal});
    for (const event of state.snapshot.evidenceEvents) {
      const template = bank.templates.find((item) => item.itemId === event.itemId);
      assert.equal(event.answerTextSnapshot,template.options[0].text,label);
    }
  }
});

test('all skipped is complete without invented profile claims or directional certainty', () => {
  const state = makeDossierFixture('skipped');
  assert.equal(state.snapshot.evidenceEvents.length,0);
  assert.equal(state.snapshot.claims.length,0);
  assert.ok(state.projection.axes.every((axis) => axis.supportLevel === 'unknown'));
  assert.equal(state.snapshot.missingnessEvents.length,state.profileIds.length);
});

test('result React surface renders actual complete, mixed, sparse and skipped runtime records', async () => {
  const server = await createServer({root:fileURLToPath(new URL('../',import.meta.url)),server:{middlewareMode:true},appType:'custom'});
  globalThis.document = {hidden:false};
  try {
    const {PersonalityDossier} = await server.ssrLoadModule('/src/components/PersonalityDossier.jsx');
    for (const fixture of ['complete','mixed','sparse','skipped']) {
      const state = makeDossierFixture(fixture);
      let corrected = state;
      const firstClaim = state.snapshot.claims[0];
      if (firstClaim) corrected = Session.addCorrection(state, firstClaim.id, "partly_accurate");
      const result = Session.getResult(Session.restoreSession(Session.serializeSession(corrected)));
      const html = renderToStaticMarkup(React.createElement(PersonalityDossier,{result,storageStatus:'preview'}));
      assert.match(html,/<h1[^>]*>/,fixture);
      assert.match(html,/Synthetic preview|SYNTHETIC PREVIEW/,fixture);
      assert.doesNotMatch(html,/NaN|\[object Object\]|undefined|Infinity/,fixture);
      assert.match(html,/Review answers/,fixture);
      assert.match(html,/Download private copy|Keep a private copy/,fixture);
      assert.match(html, /answered guesses/, fixture);
      assert.ok(html.includes(String(result.heldoutStats.hits)), fixture);
      assert.ok(result.receipts.every((row) => row.questionText && !row.questionText.startsWith("GQB2-")), fixture);
      if (firstClaim && fixture === "complete") assert.match(html, /aria-pressed="true"[^>]*>Partly accurate/, fixture);
      assert.match(html, /Open \d+ answer receipts/, fixture);
      if(fixture === 'skipped') { assert.match(html,/developing|enough|unknown|Unknown/i); assert.doesNotMatch(html,/first impression from supported signals/i); }
    }
  } finally { delete globalThis.document; await server.close(); }
});

test('distinct novelty wild card has a committed guess only when profile support permits it', () => {
  const complete = makeDossierFixture('complete');
  const trial = Session.getResult(complete).heldoutStats.trials.find(row => row.itemId === 'GQB2-H05');
  assert.equal(trial.guessOptionId, 'try');
  assert.ok(!complete.snapshot.evidenceEvents.some(row => row.itemId === trial.itemId));
  const skipped = Session.getResult(makeDossierFixture('skipped')).heldoutStats.trials.find(row => row.itemId === 'GQB2-H05');
  assert.equal(skipped.guessOptionId, null);
});
