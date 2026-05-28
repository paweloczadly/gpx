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

test("filterTracksByName is case-insensitive and trims query", () => {
  const tracks = [
    { name: "beskid-wyspowy" },
    { name: "tatry-zachodnie" },
    { name: "Bieszczady" },
  ];

  assert.deepEqual(filterTracksByName(tracks, "  tatry  "), [{ name: "tatry-zachodnie" }]);
  assert.deepEqual(filterTracksByName(tracks, "BIESZ"), [{ name: "Bieszczady" }]);
  assert.deepEqual(filterTracksByName(tracks, ""), tracks);
});
