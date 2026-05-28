import assert from "node:assert/strict";
import test from "node:test";

import { filterTracksByName, parseTrackFileName, toTitleCase } from "../gpx-utils.js";

test("parseTrackFileName parses valid GPX names", () => {
  assert.deepEqual(parseTrackFileName("2026-05-28-bike-beskid-wyspowy.gpx"), {
    date: "2026-05-28",
    activityType: "bike",
    name: "beskid-wyspowy",
  });
});

test("parseTrackFileName supports legacy GPX names without activity type", () => {
  assert.deepEqual(parseTrackFileName("2026-05-28-beskid-wyspowy.gpx"), {
    date: "2026-05-28",
    activityType: null,
    name: "beskid-wyspowy",
  });
});

test("parseTrackFileName returns null for invalid names", () => {
  assert.equal(parseTrackFileName("beskid-wyspowy.gpx"), null);
  assert.equal(parseTrackFileName("2026-05-28-beskid-wyspowy.txt"), null);
});

test("parseTrackFileName falls back to legacy parsing for unknown activity type", () => {
  assert.deepEqual(parseTrackFileName("2026-05-28-snowboard-kasprowy.gpx"), {
    date: "2026-05-28",
    activityType: null,
    name: "snowboard-kasprowy",
  });
});

test("parseTrackFileName keeps multi-hyphen route name after activity type", () => {
  assert.deepEqual(parseTrackFileName("2026-05-28-bike-beskid-wyspowy-dluga.gpx"), {
    date: "2026-05-28",
    activityType: "bike",
    name: "beskid-wyspowy-dluga",
  });
});

test("toTitleCase normalizes separators and capitalizes words", () => {
  assert.equal(toTitleCase("beskid_wyspowy-trasa  dluga"), "Beskid Wyspowy Trasa Dluga");
});

test("filterTracksByName is case-insensitive, trims query, and matches date", () => {
  const tracks = [
    { name: "beskid-wyspowy", date: "2026-05-28", activityType: "bike", activitySearch: "bike rower" },
    { name: "tatry-zachodnie", date: "2026-04-10", activityType: "trekking" },
    { name: "Bieszczady", date: "2025-12-01", activityType: "run" },
  ];

  assert.deepEqual(filterTracksByName(tracks, "  tatry  "), [{ name: "tatry-zachodnie", date: "2026-04-10", activityType: "trekking" }]);
  assert.deepEqual(filterTracksByName(tracks, "BIESZ"), [{ name: "Bieszczady", date: "2025-12-01", activityType: "run" }]);
  assert.deepEqual(filterTracksByName(tracks, "2026-05"), [{ name: "beskid-wyspowy", date: "2026-05-28", activityType: "bike", activitySearch: "bike rower" }]);
  assert.deepEqual(filterTracksByName(tracks, "trek"), [{ name: "tatry-zachodnie", date: "2026-04-10", activityType: "trekking" }]);
  assert.deepEqual(filterTracksByName(tracks, "rower"), [{ name: "beskid-wyspowy", date: "2026-05-28", activityType: "bike", activitySearch: "bike rower" }]);
  assert.deepEqual(filterTracksByName(tracks, ""), tracks);
});
