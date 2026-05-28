import assert from "node:assert/strict";
import test from "node:test";

import { cleanGpx } from "../scripts/clean-gpx.mjs";

test("cleanGpx removes extensions blocks", () => {
  const input = `<?xml version="1.0"?>
<gpx>
  <trk>
    <trkseg>
      <trkpt lat="1" lon="2">
        <ele>100</ele>
        <extensions>
          <gpxtpx:TrackPointExtension>
            <gpxtpx:hr>150</gpxtpx:hr>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

  const output = cleanGpx(input);

  assert.equal(output.includes("<extensions>"), false);
  assert.equal(output.includes("gpxtpx:hr"), false);
  assert.equal(output.includes("<ele>100</ele>"), true);
});

test("cleanGpx removes unused Garmin namespaces and schema entries", () => {
  const input = `<gpx xmlns="http://www.topografix.com/GPX/1/1"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"
 xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
 xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
</gpx>`;

  const output = cleanGpx(input);

  assert.equal(output.includes("xmlns:gpxtpx="), false);
  assert.equal(output.includes("xmlns:gpxx="), false);
  assert.equal(output.includes("GpxExtensions/v3"), false);
  assert.equal(output.includes("TrackPointExtension/v1"), false);
  assert.equal(output.includes("http://www.topografix.com/GPX/1/1/gpx.xsd"), true);
});

test("cleanGpx is idempotent for already-clean GPX content", () => {
  const input = `<gpx xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg><trkpt lat="1" lon="2"><ele>100</ele><time>2026-01-01T00:00:00Z</time></trkpt></trkseg></trk></gpx>`;

  const once = cleanGpx(input);
  const twice = cleanGpx(once);

  assert.equal(once, twice);
});
