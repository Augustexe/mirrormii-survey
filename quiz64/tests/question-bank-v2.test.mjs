import test from "node:test";
import assert from "node:assert/strict";
import { compileResponse } from "../src/evidence-framework.js";
import {
  BANK_VERSION,
  SECTIONS,
  getBank,
} from "../src/question-bank-v2.js";

const ROUTES = ["everyday", "work_study", "social", "close_relationship", "light"];
const VOICES = ["gentle", "playful", "sharp"];

function compileFirst(template, attemptId = "v2-contract") {
  return compileResponse(template, {
    attemptId,
    capturedAt: "2026-09-21T08:00:00Z",
    value: template.options[0].id,
  });
}

test("V2 returns a version-pinned routed bank with frozen heldouts", () => {
  const bank = getBank({ route: "everyday", voice: "playful", personal: true });
  assert.equal(bank.bankVersion, BANK_VERSION);
  assert.equal(bank.heldoutIds.length, 8);
  assert.ok(bank.profileIds.length >= 30);
  assert.equal(bank.templates.length, bank.profileIds.length + bank.heldoutIds.length);
  assert.deepEqual(
    bank.templates.filter((template) => template.event.phase === "heldout").map((template) => template.itemId),
    bank.heldoutIds,
  );
  for (const template of bank.templates) {
    assert.equal(template.bankVersion, BANK_VERSION);
    assert.equal(bank.presentation[template.itemId].prompt, template.prompt);
    assert.deepEqual(bank.presentation[template.itemId].options.map((option) => option.text), template.options.map((option) => option.text));
    assert.deepEqual(bank.presentation[template.itemId].exits.map((exit) => exit.text), template.exits.map((exit) => exit.text));
  }
});

test("every route/voice compiles every authored option and keeps option receipts inspectable", () => {
  for (const route of ROUTES) {
    for (const voice of VOICES) {
      const bank = getBank({ route, voice, personal: route !== "light" });
      assert.ok(bank.templates.length >= 20, `${route}/${voice} should retain a useful bank`);
      for (const template of bank.templates) {
        assert.match(template.itemId, /^GQB2-/);
        for (const item of template.options) {
          assert.match(item.id, /^[a-z][a-z0-9_]*$/);
          assert.ok(item.text.length > 1);
          assert.ok(item.neutralMeaning.length > 1);
          const event = compileResponse(template, {
            attemptId: `${route}-${voice}`,
            capturedAt: "2026-09-21T08:00:00Z",
            value: item.id,
          });
          assert.equal(event.itemId, template.itemId);
          assert.equal(event.answerTextSnapshot, item.text);
          assert.equal(event.literalObservation, item.neutralMeaning);
        }
        compileFirst(template);
      }
    }
  }
});

test("light routing has substantial non-sensitive coverage and no optional intimate modules", () => {
  const bank = getBank({ route: "light", voice: "gentle", personal: false });
  assert.ok(bank.profileIds.length >= 20);
  assert.equal(bank.templates.some((template) => template.sensitivity === "high_optional"), false);
  assert.equal(Object.values(bank.presentation).some((presentation) => presentation.sectionId === "close_connections"), false);
  assert.equal(Object.values(bank.presentation).some((presentation) => presentation.sectionId === "secret_menu"), false);
  assert.ok(Object.values(bank.presentation).some((presentation) => presentation.sectionId === "everyday_life"));
  assert.ok(Object.values(bank.presentation).some((presentation) => presentation.sectionId === "work_study"));
  assert.ok(Object.values(bank.presentation).some((presentation) => presentation.sectionId === "social_theater"));
});

test("personal gate adds close-connection evidence without changing the light route", () => {
  const light = getBank({ route: "everyday", voice: "playful", personal: false });
  const personal = getBank({ route: "everyday", voice: "playful", personal: true });
  assert.equal(light.templates.some((template) => template.itemId.startsWith("GQB2-R")), false);
  assert.ok(personal.templates.some((template) => template.itemId === "GQB2-R03"));
  assert.ok(personal.templates.some((template) => template.itemId === "GQB2-M01"));
  assert.deepEqual(light.heldoutIds, personal.heldoutIds);
});

test("voice variants change presentation wording while preserving semantic option IDs and mappings", () => {
  const gentle = getBank({ route: "social", voice: "gentle", personal: true });
  const sharp = getBank({ route: "social", voice: "sharp", personal: true });
  const gentleById = new Map(gentle.templates.map((template) => [template.itemId, template]));
  assert.notEqual(gentle.templates[0].prompt, sharp.templates[0].prompt);
  for (const template of sharp.templates) {
    const counterpart = gentleById.get(template.itemId);
    assert.deepEqual(template.options.map((option) => option.id), counterpart.options.map((option) => option.id));
    assert.deepEqual(
      template.options.flatMap((option) => option.predicates.map((predicate) => [predicate.optionId, predicate.axisId, predicate.direction, predicate.value])),
      counterpart.options.flatMap((option) => option.predicates.map((predicate) => [predicate.optionId, predicate.axisId, predicate.direction, predicate.value])),
    );
  }
});

test("hypothetical novelty examples remain explicitly bounded and heldouts never enter profile IDs", () => {
  const bank = getBank({ route: "everyday", voice: "playful", personal: true });
  const novelty = bank.templates.find((template) => template.itemId === "GQB2-E01");
  const heldoutNovelty = bank.templates.find((template) => template.itemId === "GQB2-H05");
  assert.equal(novelty.event.sourceStatus, "hypothetical_choice");
  assert.equal(novelty.event.phase, "profile");
  assert.match(novelty.prompt, /hypothetical/i);
  assert.equal(heldoutNovelty.event.sourceStatus, "heldout");
  assert.equal(heldoutNovelty.event.phase, "heldout");
  assert.deepEqual(heldoutNovelty.eligibleAxes, ["novelty_aperture"]);
  assert.ok(heldoutNovelty.options.find(o=>o.id === "try").predicates.some(p=>p.axisId === "novelty_aperture" && p.direction === "right"));
  assert.ok(heldoutNovelty.options.find(o=>o.id === "known").predicates.some(p=>p.axisId === "novelty_aperture" && p.direction === "left"));
  assert.ok(heldoutNovelty.options.find(o=>o.id === "pass").predicates.every(p=>!p.axisId));
  assert.equal(bank.profileIds.includes("GQB2-H05"), false);
  assert.equal(bank.heldoutIds.includes("GQB2-H05"), true);
  assert.ok(SECTIONS.every((section) => bank.sections.some((candidate) => candidate.id === section.id)));
});

test("personal-off routes exclude private-thought and close-connection prompts", () => {
  for (const route of ["everyday", "work_study", "social", "close_relationship", "universal", "light"]) {
    const bank = getBank({ route, voice: "playful", personal: false });
    assert.equal(bank.profileIds.some((itemId) => ["GQB2-M01", "GQB2-M03", "GQB2-M04", "GQB2-R01", "GQB2-R06"].includes(itemId)), false, route);
    for (const presentation of Object.values(bank.presentation)) {
      assert.equal(presentation.requiredAnyPermissions.includes("private_thoughts"), false, `${route}/${presentation.itemId}`);
      assert.equal(presentation.requiredAnyPermissions.includes("close_connection"), false, `${route}/${presentation.itemId}`);
    }
  }
});

test("overlapping latest-event prompts share conservative source units", () => {
  const bank = getBank({ route: "universal", voice: "playful", personal: true });
  const byId = new Map(bank.templates.map((template) => [template.itemId, template]));
  assert.equal(byId.get("GQB2-E02").event.id, byId.get("GQB2-E04").event.id);
  assert.equal(byId.get("GQB2-E04").event.id, byId.get("GQB2-E05").event.id);
  assert.equal(byId.get("GQB2-W01").event.id, byId.get("GQB2-W07").event.id);
  assert.equal(byId.has("GQB2-M02"), false);
  assert.match(byId.get("GQB2-W09").prompt, /different|separate/i);
  assert.match(byId.get("GQB2-S09").prompt, /different|separate/i);
});
