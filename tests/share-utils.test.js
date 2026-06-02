import assert from "node:assert/strict";
import { describe, it } from "mocha";

import { buildShareTargets, createShareData, shouldUseNativeShare } from "../share-utils.js";

const track = {
  date: "2026-05-29",
  name: "beskid_wyspowy-petla",
  publicDownloadUrl: "https://gpx.oczadly.io/2026-05-29-bike-beskid-wyspowy.gpx",
};

describe("share-utils", () => {
  it("createShareData returns normalized title/text/url", () => {
    assert.deepEqual(createShareData(track), {
      title: "GPX: Beskid Wyspowy Petla",
      text: "2026-05-29 • Beskid Wyspowy Petla",
      url: "https://gpx.oczadly.io/2026-05-29-bike-beskid-wyspowy.gpx",
    });
  });

  it("buildShareTargets returns expected providers and encoded URLs", () => {
    const targets = buildShareTargets(track);

    assert.deepEqual(targets.map((target) => target.label), ["WhatsApp", "Messenger", "Facebook", "Kopiuj link"]);
    assert.equal(targets[0].href.startsWith("https://wa.me/?text="), true);
    assert.equal(targets[1].href.startsWith("fb-messenger://share/?link="), true);
    assert.equal(targets[2].href.startsWith("https://www.facebook.com/sharer/sharer.php?u="), true);
    assert.equal(targets[3].action, "copy");
    assert.equal(targets[3].href, undefined);
  });

  it("shouldUseNativeShare checks for navigator.share function", () => {
    assert.equal(shouldUseNativeShare({ share: async () => {} }), true);
    assert.equal(shouldUseNativeShare({}), false);
    assert.equal(shouldUseNativeShare(undefined), false);
  });
});
