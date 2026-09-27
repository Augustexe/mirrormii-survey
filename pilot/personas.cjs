// Scripted answers for two SYNTH-30 personas (synthetic, research/synth-30). Stance levels -2..2; scene and sealed values are option indexes.
const BANK = require("./bank.js");
function build(stance, scene, sealed, setup) {
  const ids = BANK.DIMENSIONS.map((d) => d.id);
  const answers = { setup, stance: {}, scene: {}, sealed: {} };
  ids.forEach((id, i) => { answers.stance[id] = { level: stance[i], ms: 3000 + (i % 5) * 400 }; });
  for (const [id, opt] of Object.entries(scene)) answers.scene[id] = { option: opt, ms: 6000 };
  BANK.SEALED.forEach((h, i) => { answers.sealed[h.id] = { option: sealed[i], ms: 5000 }; });
  return answers;
}
// Stance order follows bank.js DIMENSIONS order.
module.exports = [
  {
    name: "Jasmine, 27, partnered cozy gamer (SYN-23)",
    answers: build(
      [-1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1, -1, 1, -1, -1, -1, -2, 1, -2, 2, -1, -1, -1, 1, 1, -1, -1, 0],
      { closeness_style: 1, support_capacity: 0, contact_needs: 3, friend_did_harm: 1, celebration_budget: 0, feedback_style: 2, family_vs_own_call: 1, fairness_rule: 1, lending: 1, time_horizon: 1, favorite_premium: 0, risk_style: 1, success_meaning: 2, explore_or_root: 2 },
      [1, 1, 1, 1, 2, 3, 1, 2],
      { age: "adult", closest: "partner" }
    ),
  },
  {
    name: "Jordan, 25, single personal trainer (SYN-17)",
    answers: build(
      [1, 1, -1, 1, -1, -1, -1, -1, 1, -1, -2, -1, 1, 1, 1, 1, -1, 1, -2, -1, -1, 1, 2, -2, -1, 1, 2, -1, -1, -1, -2, -2],
      { closeness_style: 2, support_capacity: 1, contact_needs: 1, friend_did_harm: 2, celebration_budget: 0, feedback_style: 0, family_vs_own_call: 2, fairness_rule: 0, lending: 2, time_horizon: 0, favorite_premium: 1, risk_style: 2, success_meaning: 0, explore_or_root: 1 },
      [0, 0, 2, 0, 0, 0, 3, 1],
      { age: "adult", closest: "best_friend" }
    ),
  },
];
