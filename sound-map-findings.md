# Places sound-map findings

- `soundsoflagos.com` uses a direct “Tap to listen” interaction and strong place-name presence. Only the direct playback cue is carried forward; olayinka.xyz keeps its existing restrained monospace layout.
- As checked on 2026-08-22, `https://olayinka.xyz/things/places` still serves the previously published homepage HTML rather than the current local sound-map build. The new checkpoint must be published before the requested production-domain curl can pass.
- The current local production build prerenders all nine approved capital names into `/things/places/index.html` before JavaScript runs.
