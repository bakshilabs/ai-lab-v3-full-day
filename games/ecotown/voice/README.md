# Eco Town voices

The game's read-aloud uses recorded neural voices, not the browser's built-in voice.

| Who | Kokoro voice | Accent |
|---|---|---|
| Narrator (cards, captions, films, residents) | `bf_isabella` | British |
| Florence, the AI helper | `af_bella` | American |

Model: **Kokoro-82M** (Apache-2.0), ONNX build from Hugging Face `onnx-community/Kokoro-82M-v1.0-ONNX`.

## Re-record after changing game text

The exact commands, from the repository root. The model, the voices and the clip cache live outside the repository
(here `$V`, any scratch folder). Use ports 8880–8889. On a busy machine the play-throughs take an hour or more.

1. Kokoro, once per machine (about 330 MB). `render.py` wants `model.onnx` and `voices.bin`, an `.npz` of the two
   voice arrays (each Hugging Face voice file is raw float32, shape 510 × 1 × 256):

   ```bash
   V=/tmp/voice; mkdir -p $V/kokoro $V/cache && pip install kokoro-onnx soundfile
   H=https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main
   curl -sSL -o $V/kokoro/model.onnx $H/onnx/model.onnx
   for v in bf_isabella af_bella; do curl -sSL -o $V/$v.bin $H/voices/$v.bin; done
   (cd $V && python3 -I -c "import numpy as np; np.savez('kokoro/voices.npz', **{v: np.fromfile(v + '.bin', dtype=np.float32).reshape(-1, 1, 256) for v in ['bf_isabella', 'af_bella']})" && mv kokoro/voices.npz kokoro/voices.bin)
   ```

2. Seed the clip cache from the packs in the repository, so only new sentences are recorded:

   ```bash
   python3 -c "
   import json, os, sys
   c = sys.argv[1]
   for b in ['junior', 'senior']:
     P = json.load(open(f'games/ecotown/game/voice/pack-{b}.json')); bufs = {}
     for k, ci, off, ln in P['clips']:
       bufs.setdefault(ci, open('games/ecotown/game/voice/' + P['chunks'][ci], 'rb').read())
       f = f'{c}/{k}.mp3'
       if not os.path.exists(f): open(f, 'wb').write(bufs[ci][off:off + ln])" $V/cache
   ```

3. Serve the game and play everything that speaks: the six missions (both ages), the welcome film and every afternoon
   module (both ages). `said-hook.mjs` records each run's speech log without changing the tests (it also skips their
   screenshots and lengthens their waits). Give the module tests to play as extra arguments; the default is
   `drone roads robots`. A new module needs a browser test in `game/tests/playwright/<id>.mjs` that takes
   `<baseUrl> <outDir>` and the age as `BAND=senior` or as the third argument.

   ```bash
   (cd games/ecotown/game && python3 -m http.server 8880 &)
   bash games/ecotown/voice/playthroughs.sh http://localhost:8880/ $V/said drone roads robots
   node --no-warnings games/ecotown/voice/coverage.mjs $V/said/*.json            # before: the share with a recording
   ```

4. Collect every sentence: fixed text from the game's content, the welcome film (`series.js`), the recaps, pause
   cards and careful replies, every built-in sentence in the modules' `words.js` files (and `drone/route.js`), and
   everything the play-throughs said. New sentences are added at the end of `lines-<band>.json`; the old ones keep
   their place, so only the last chunk or two of each pack change.

   ```bash
   node games/ecotown/voice/collect.mjs http://localhost:8880/ $V/said/*.json
   ```

5. Record and pack (clips are cached by sentence, so only new lines are recorded; about two seconds a line):

   ```bash
   python3 games/ecotown/voice/render.py $V/kokoro $V/cache
   ```

6. Check: play again (or reuse the logs) and measure; `--missing` lists what still has no recording. Sentences with
   live numbers in them ("Score: 7 of 9") stay with the device voice by design.

   ```bash
   bash games/ecotown/voice/playthroughs.sh http://localhost:8880/ $V/said-after
   node --no-warnings games/ecotown/voice/coverage.mjs $V/said-after/*.json --missing
   ```

7. Commit `game/voice/pack-*.json`, the changed `pack-*.bin` chunks and `voice/lines-*.json`.

Who speaks: Florence's lines use `voice: 'helper'` (`af_bella`), everything else `narrator` (`bf_isabella`). A module's
`ctx.say(text)` is Florence unless it passes `'narrator'`. The key of a clip includes the voice, so a line spoken in
the other voice than it was recorded in falls back to the device voice.
