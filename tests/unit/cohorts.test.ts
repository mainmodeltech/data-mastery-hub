import { test } from "node:test";
import assert from "node:assert/strict";

import {
  cohortPrice, fillRate, isOpenCohort, isScarce, nextOpenByFormation, openCohorts, pluralSpots, spotsLeft, type CohortLike,
} from "../../src/lib/cohorts.ts";

const TODAY = "2026-11-03";

const cohort = (over: Partial<CohortLike> = {}): CohortLike => ({
  id: "s", formationId: "f1", startDate: "2026-11-10", registrationDeadline: null, maxParticipants: 15, currentParticipants: 4,
  isFull: false, spotsRemaining: 11, status: "OPEN", price: "150 000 FCFA", earlyBirdPrice: null, earlyBirdDeadline: null, ...over,
});

test("une cohorte ouverte accepte des candidatures ; démarrée, complète ou échue, non", () => {
  assert.equal(isOpenCohort(cohort(), TODAY), true);
  assert.equal(isOpenCohort(cohort({ status: "UPCOMING" }), TODAY), true);
  assert.equal(isOpenCohort(cohort({ status: "IN_PROGRESS" }), TODAY), false);
  assert.equal(isOpenCohort(cohort({ status: "CLOSED" }), TODAY), false);
  assert.equal(isOpenCohort(cohort({ isFull: true }), TODAY), false);
  assert.equal(isOpenCohort(cohort({ spotsRemaining: 0 }), TODAY), false);
  assert.equal(isOpenCohort(cohort({ registrationDeadline: "2026-11-02" }), TODAY), false);
  assert.equal(isOpenCohort(cohort({ registrationDeadline: "2026-11-03" }), TODAY), true);
  assert.equal(isOpenCohort(cohort({ startDate: "2026-10-01" }), TODAY), false);
  assert.equal(isOpenCohort(cohort({ startDate: null }), TODAY), true);
});

test("les cohortes ouvertes sont triées par date, celles sans date à la fin", () => {
  const list = [
    cohort({ id: "c", startDate: null }),
    cohort({ id: "b", startDate: "2027-01-04", status: "UPCOMING" }),
    cohort({ id: "x", startDate: "2026-10-08", status: "IN_PROGRESS" }),
    cohort({ id: "a", startDate: "2026-11-10" }),
  ];
  assert.deepEqual(openCohorts(list, TODAY).map((s) => s.id), ["a", "b", "c"]);
});

test("la prochaine cohorte ouverte de chaque formation ignore celle qui a déjà démarré", () => {
  const map = nextOpenByFormation(
    [
      cohort({ id: "old", formationId: "f1", startDate: "2026-10-08", status: "IN_PROGRESS" }),
      cohort({ id: "new", formationId: "f1", startDate: "2027-01-04", status: "UPCOMING" }),
      cohort({ id: "other", formationId: "f2", startDate: "2026-11-10" }),
    ],
    TODAY,
  );
  assert.equal(map.get("f1")?.id, "new");
  assert.equal(map.get("f2")?.id, "other");
  assert.equal(map.size, 2);
});

test("places restantes et rareté : seulement quand c'est peu, jamais quand c'est complet", () => {
  assert.equal(spotsLeft(cohort({ spotsRemaining: null, maxParticipants: 15, currentParticipants: 9 })), 6);
  assert.equal(spotsLeft(cohort({ spotsRemaining: null, maxParticipants: 5, currentParticipants: 9 })), 0);
  assert.equal(isScarce(cohort({ spotsRemaining: 5 })), true);
  assert.equal(isScarce(cohort({ spotsRemaining: 6 })), false);
  assert.equal(isScarce(cohort({ spotsRemaining: 0 })), false);
  assert.equal(pluralSpots(1), "1 place restante");
  assert.equal(pluralSpots(6), "6 places restantes");
});

test("le taux de remplissage reste entre 0 et 1", () => {
  assert.equal(fillRate({ maxParticipants: 15, currentParticipants: 9 }), 0.6);
  assert.equal(fillRate({ maxParticipants: 0, currentParticipants: 3 }), 0);
  assert.equal(fillRate({ maxParticipants: 10, currentParticipants: 14 }), 1);
});

test("le tarif early-bird ne s'applique que jusqu'à sa date limite", () => {
  const eb = { price: "200 000 FCFA", earlyBirdPrice: "170 000 FCFA", earlyBirdDeadline: "2026-11-20" };
  assert.deepEqual(cohortPrice(eb, TODAY), { price: "170 000 FCFA", regular: "200 000 FCFA", until: "2026-11-20" });
  assert.deepEqual(cohortPrice({ ...eb, earlyBirdDeadline: "2026-11-02" }, TODAY), { price: "200 000 FCFA", regular: null, until: null });
  assert.deepEqual(cohortPrice({ price: null, earlyBirdPrice: null, earlyBirdDeadline: null }, TODAY, "300 000 FCFA"), {
    price: "300 000 FCFA", regular: null, until: null,
  });
});
