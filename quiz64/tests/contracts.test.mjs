// Backend contracts (docs/contracts, docs/HANDOFF-DESMOND.md): the kit files, real runs, the result record, the friend
// links and the proposed server shapes validate against the JSON Schemas, and the question pack export is current.
// A change in the app or the kit that breaks a contract fails here: update the schema (and api.md or events.md when the
// meaning changes) in the same commit, or fix the change.
import test from "node:test";
import assert from "node:assert/strict";
import { runChecks, loadSchemas, check, validate } from "../../scripts/validate-contracts.mjs";

const results = await runChecks();

test("every contract check passes (node scripts/validate-contracts.mjs)", () => {
  const failed = results.filter((r) => !r.ok);
  assert.deepEqual(failed.map((r) => `${r.name}: ${r.errors.map((e) => `${e.at} ${e.error}`).join("; ")}`), []);
  assert.ok(results.length >= 30, `expected at least 30 checks, got ${results.length}`);
});

test("the validator catches drift: a broken result record, run and link body fail", async () => {
  const reg = loadSchemas();
  const { PLAYERS, playRun } = await import("../../scripts/validate-contracts.mjs");
  const Session = await import("../src/persona/session.js");
  const Records = await import("../../docs/contracts/records.mjs");
  const Friend = await import("../src/persona/friend.js");
  const state = playRun(Session, { ...PLAYERS[0], runId: "contractneg1" });
  const record = Records.buildResultRecord(state);
  assert.deepEqual(check(reg, "result.schema.json", record), []);

  const noAxes = { ...record };
  delete noAxes.axes;
  assert.ok(check(reg, "result.schema.json", noAxes).some((e) => e.error.includes("\"axes\"")));
  const badPips = structuredClone(record);
  badPips.axes[0].pips = 9;
  assert.ok(check(reg, "result.schema.json", badPips).length > 0);
  const leak = structuredClone(record);
  leak.share.stings = ["a sting on the share card"];
  assert.ok(check(reg, "result.schema.json", leak).some((e) => e.error.includes("unexpected property")));

  const run = JSON.parse(Session.serialize(state));
  assert.ok(check(reg, "run.schema.json", { ...run, answers: { ...run.answers, "C1-140": "maybe" } }).length > 0);
  assert.ok(check(reg, "run.schema.json", { ...run, extra: 1 }).length > 0);

  const { challenge, state: owner } = Friend.createChallenge(state, { rel: "bestie", stings: true }, { id: "contractneg", seed: 7 });
  const body = Friend.challengeBody(owner, challenge);
  assert.deepEqual(check(reg, "friend-challenge.schema.json#/$defs/challengeLinkBody", body), []);
  assert.ok(check(reg, "friend-challenge.schema.json#/$defs/challengeLinkBody", { ...body, sig: "x" }).length > 0);
});

test("the validator implements the subset it claims", () => {
  const s = { type: "object", required: ["a"], properties: { a: { oneOf: [{ type: "integer" }, { const: "x" }] } }, additionalProperties: false };
  assert.deepEqual(validate(s, { a: 1 }), []);
  assert.deepEqual(validate(s, { a: "x" }), []);
  assert.equal(validate(s, { a: 1.5 }).length, 1);
  assert.equal(validate(s, { a: 1, b: 2 }).length, 1);
  assert.throws(() => validate({ unknownKeyword: true }, 1), /outside the supported subset/);
});
