#!/usr/bin/env bash
# Plays everything that speaks, for the speech logs collect.mjs reads: the six missions (both ages), the welcome
# film and each afternoon module (both ages). Writes <out>/<name>.json (and <name>.log). Serve games/ecotown/game first.
# Usage: bash games/ecotown/voice/playthroughs.sh http://localhost:8880/ /tmp/said [modules...]
# A module is the name of its browser test in game/tests/playwright (drone roads robots; later film power). Pass the
# list to choose; the default is MODULES below. Runs three at a time: software 3D on a busy machine is slow.
set -u
base=${1:-http://localhost:8880/}; out=${2:-/tmp/said}; shift 2 || true
MODULES=${*:-drone roads robots}
here=$(cd "$(dirname "$0")" && pwd); game=$here/../game; hook=$here/said-hook.mjs
mkdir -p "$out"
run() { local name=$1; shift; echo "start $name"; ( SAID="$out/$name.json" timeout 7200 "$@" > "$out/$name.log" 2>&1; echo "done $name ($?)" ) & }
lim() { while [ "$(jobs -rp | wc -l)" -ge "${PAR:-3}" ]; do sleep 5; done; }
lim; run missions-junior env FAST=1 node --import "$hook" "$game/tests/playwright/run.mjs" "$base" junior "$out/shots-j" 1280 800 cards mixed
lim; run missions-senior env FAST=1 node --import "$hook" "$game/tests/playwright/run.mjs" "$base" senior "$out/shots-s" 1280 800 text mixed
lim; run welcome node --import "$hook" "$here/welcome.mjs" "$base"
for m in $MODULES; do for band in junior senior; do
  # the module tests take the age as BAND=senior (drone, robots) or as the third argument (roads)
  lim; run "$m-$band" env BAND=$band node --import "$hook" "$game/tests/playwright/$m.mjs" "$base" "$out/shots-$m-$band" "$band"
done; done
wait
