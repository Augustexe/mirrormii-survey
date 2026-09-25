import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGameOutcome, createChallengeCard } from '../src/game-outcome.js';
import { makeDossierFixture, DOSSIER_FIXTURES } from '../src/dossier-fixtures.js';
import { getResult } from '../src/dossier-session.js';
const axes=['activation_tempo','social_signal_style','friction_posture','structure_reliance','novelty_aperture'];
const axis=(i,d)=>({axisId:axes[i],direction:d,supportLevel:'supported',supportingEvidenceIds:[`profile-${i}`]});
test('all 40 pair rules and 10 single rules produce bounded deterministic identities',()=>{
 const rules=new Set();
 const labels=new Set();
 for(let i=0;i<5;i++)for(const d of ['left','right']){
  const a=axis(i,d); const single=buildGameOutcome({axes:[a]});rules.add(single.ruleId);labels.add(single.label);assert.deepEqual(single.evidenceIds,[`profile-${i}`]);
  for(let j=i+1;j<5;j++)for(const e of ['left','right']){
   const projection={axes:[a,axis(j,e)]}; const result=buildGameOutcome(projection);rules.add(result.ruleId);labels.add(result.label);
   assert.deepEqual(result,buildGameOutcome({axes:[...projection.axes].reverse()}));
   assert.deepEqual(result.evidenceIds,[`profile-${i}`,`profile-${j}`]);
   assert.ok(result.label && !result.label.includes('undefined'));
  }
 }
 assert.equal(rules.size,50);
 assert.equal(labels.size,50,'every supported rule needs a distinct game nickname');
});
test('thin signals cannot win titles; stronger support ranks first; voice does not rescore',()=>{
 const a={...axis(0,'right'),supportLevel:'thin'};
 assert.equal(buildGameOutcome({axes:[a]}).ruleId,'plot-still-developing');
 const b={...axis(4,'left'),supportLevel:'strongly_supported'};
 const p={axes:[axis(0,'left'),axis(1,'right'),b,a]};
 const gentle=buildGameOutcome(p,'gentle'),sharp=buildGameOutcome(p,'sharp');
 assert.deepEqual(gentle.axisIds,[axes[0],axes[4]]);assert.equal(gentle.label,sharp.label);assert.notEqual(gentle.hook,sharp.hook);
});
test('real session lifecycle yields varied outcomes and excludes heldout from identity',()=>{
 const labels=new Set();
 for(const route of ['everyday','work_study','social'])for(const fixture of DOSSIER_FIXTURES){
  const result=getResult(makeDossierFixture(fixture,{route}));labels.add(result.gameTitle.label);
  const allowed=new Set(result.receipts.filter(r=>r.phase!=='heldout' && !r.missingness).map(r=>r.evidenceId));
  assert.ok(result.gameTitle.evidenceIds.every(id=>allowed.has(id)));
  assert.deepEqual(result.gameTitle,buildGameOutcome({...result.projection,heldout:[{answer:'changed'}]},result.config.voice));
  if(fixture==='skipped')assert.equal(result.gameTitle.ruleId,'plot-still-developing');
 }
 assert.ok(labels.size>=6,`Only ${labels.size} actual outcomes`);
});
test('public challenge DTO never copies private fields',()=>{
 const card=createChallengeCard({...buildGameOutcome({axes:[axis(0,'right')]}),receipts:['private'],note:'secret',snapshotId:'private-id'});
 assert.deepEqual(Object.keys(card).sort(),['caption','invitation','kind','title']);
 assert.doesNotMatch(JSON.stringify(card),/private|secret/);
});
