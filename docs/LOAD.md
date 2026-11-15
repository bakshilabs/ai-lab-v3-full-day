# Eco Town: load test

**15 November 2026. These are local runs of the server's logic on one machine. They are not measurements of Cloudflare.** The site has not been deployed, so nothing below says how the live site will behave. What still has to be measured there is listed at the end.

## What was run

- **The script:** `games/ecotown/game/tests/load/run.mjs <baseUrl> <joinCode> <learners> [minutes]`. Each pretend learner joins with the group's code, loads the page and its files, checks in every 60 seconds with a status, and saves about 8 KB every 30 seconds. It refuses to run against the original site.
- **The server:** `games/ecotown/game/tests/load/local.mjs`, which runs the real `worker/router.js`, `store.js` and `codes.js` in Cloudflare's local runtime (miniflare 4.20260730.0, workerd 1.20260730.1) with SQLite-backed Durable Objects. One organisation, one group, all learners on one join code.
- **Stand-in game files:** the real game was not built for this. The page and five files of random text were used, about 0.7 MB in all for each learner. The real first load is about a hundred requests and about 5 MB, and its pictures, voices and films come from a separate store (Workers KV) that the local run did not include.
- **Machine:** 4 processor cores (Intel Xeon, 2.1 GHz), 15 GB memory, Node 22. The script, the server and another engineer's work all shared this machine, so the times include that.

## Results

"No answer" means the connection was dropped or timed out. Times are in milliseconds, measured by the script.

| Run | Learners joined | Requests | Success | Join p50 / p95 / p99 | File p50 / p95 / p99 | Check-in p50 / p95 / p99 | Save p50 / p95 / p99 | Errors |
|---|---|---|---|---|---|---|---|---|
| 20 learners, 2 min, arriving over 10 s | 20 of 20 | 251 | 100 % | 29 / 376 / 413 | 82 / 359 / 410 | 8 / 84 / 232 | 9 / 107 / 254 | none |
| 100 learners, 2 min, arriving over 10 s | 100 of 100 | 1,272 | 100 % | 6 / 50 / 63 | 38 / 63 / 85 | 5 / 16 / 40 | 5 / 14 / 27 | none |
| 1,000 learners, 3 min, arriving over 10 s | **636 of 1,000** | 9,573 | **90.7 %** | 3,781 / 6,347 / 6,988 | 2,280 / 5,997 / 6,883 | 4 / 136 / 3,371 | 4 / 93 / 3,304 | no answer: 889 (join 364, page 124, file 384, check-in 9, save 8) |
| 1,000 learners, 3 min, arriving over 10 s, **one small file each** | 1,000 of 1,000 | 11,747 | 100 % | 4 / 27 / 51 | 3 / 18 / 30 | 3 / 7 / 18 | 3 / 7 / 20 | none |
| 1,000 learners, 4 min, **arriving over 2 min**, all files | 1,000 of 1,000 | 15,911 | 100 % | 6 / 50 / 76 | 38 / 81 / 116 | 3 / 35 / 67 | 3 / 36 / 63 | none |

The 20-learner run was the first after the server started, which is why its slowest requests are slower than the 100-learner run's.

Other things seen:

- **Seats held.** On a 1,000-seat organisation the 1,001st join was refused with "This group is full". In an earlier run a 3,000-seat organisation refused 603 joins once its seats were used up by the runs before it (HTTP 401, reason `full`). That run is not in the table.
- **Leader and admin lists** with 3,000 learners in one group: the leader's group list took 0.02 s, the learner list 0.16 s (600 KB), the admin's organisation list 0.01 s. One measurement each.

## What this does and does not show

- **Shown, locally:** the join, session, check-in and save logic handled 1,000 learners on one join code with no errors, including all 1,000 arriving within 10 seconds, when the file traffic was small.
- **The failed run** was 1,000 learners each pulling 0.7 MB of files within the same 10 seconds: about 70 MB a second through one local server process on a shared 4-core machine. A repeat of that run for one minute recorded the cause of each dropped request: connection reset (1,219) and socket closed (16). The same 1,000 learners arriving over two minutes had no errors. Whether the server process or the test script was the first to give way was not separated. This is a limit of the local set-up; it says nothing either way about Cloudflare.
- **No claim is made about 1,000 learners on the live site.** These runs support only this: the code has no fault that shows at 1,000 learners in one group on this machine.

## Still to measure on the deployed site

1. The same three runs (20, 100, 1,000) against the new address, from outside Cloudflare, with the real built game.
2. First load of the real game: about a hundred files, with pictures, voices and films read from Workers KV. The local run had none of this.
3. A whole class arriving together (the 10-second case) at 1,000, which failed locally for file traffic.
4. The organisation store under real conditions: one Durable Object per organisation takes every check-in and save of that organisation. Response times and any errors from it need to be read from Cloudflare's own figures.
5. The directory store: every join passes through the single directory object once.
6. Cost, from Cloudflare's figures for requests, Durable Object time and storage. Nothing about cost was measured here.
7. Learners spread over many organisations at once. Every run here used one organisation.
8. Runs longer than four minutes.

## How to repeat the local run

```bash
mkdir /tmp/load && cd /tmp/load && npm init -y && npm i miniflare
node <repo>/games/ecotown/game/tests/load/local.mjs /tmp/load 8799 1000     # prints URL= and JOIN=
node <repo>/games/ecotown/game/tests/load/run.mjs http://127.0.0.1:8799 <JOIN code> 100 2
```

Options for `run.mjs` (environment): `RAMP_S` seconds over which the learners arrive (default 10), `SAVE_KB` size of a save (default 8), `ASSETS` a comma-separated list of files to load instead of those named in the page.
