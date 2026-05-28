import assert from "node:assert/strict";
import test from "node:test";

import { filterTracksByName, parseTrackFileName, toTitleCase } from "../gpx-utils.js";

test("parseTrackFileName parses valid GPX names", () => {
  assert.deepEqual(parseTrackFileName("2026-05-28-beskid-wyspowy.gpx"), {
    date: "2026-05-28",
    name: "beskid-wyspowy",
  });
});

test("parseTrackFileName returns null for invalid names", () => {
  assert.equal(parseTrackFileName("beskid-wyspowy.gpx"), null);
  assert.equal(parseTrackFileName("2026-05-28-beskid-wyspowy.txt"), null);
});

test("toTitleCase normalizes separators and capitalizes words", () => {
  assert.equal(toTitleCase("beskid_wyspowy-trasa  dluga"), "Beskid Wyspowy Trasa Dluga");
});

test("filterTracksByName is case-insensitive, trims query, and matches date", () => {
  const tracks = [
    { name: "beskid-wyspowy", date: "2026-05-28" },
    { name: "tatry-zachodnie", date: "2026-04-10" },
    { name: "Bieszczady", date: "2025-12-01" },
  ];

  assert.deepEqual(filterTracksByName(tracks, "  tatry  "), [{ name: "tatry-zachodnie", date: "2026-04-10" }]);
  assert.deepEqual(filterTracksByName(tracks, "BIESZ"), [{ name: "Bieszczady", date: "2025-12-01" }]);
  assert.deepEqual(filterTracksByName(tracks, "2026-05"), [{ name: "beskid-wyspowy", date: "2026-05-28" }]);
  assert.deepEqual(filterTracksByName(tracks, ""), tracks);
});
