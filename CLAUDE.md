# ai-lab-v3-full-day

A **full-day kids' camp (AI Lab)** of eight hours: Eco Town, then the "Eco Town of the future" modules. **Every part is one hour, each module ends with a discussion section between children and their teacher, and a break follows each module** (decided by the user, 15 Nov 2026). Read `docs/full-day-plan.md` first: it replaces the ten-minute first versions.

- **Part 1, Eco Town:** the existing lab, one hour. Its lesson is "AI can be confidently wrong; check it". That lesson stops with Eco Town.
- **Modules:** drone delivery, robot training, roads for self-driving cars, town film studio, power control room, each grown to one hour (they were built as ten-minute first versions). Florence is a capable partner there, not something to catch out.

Read first:
- `docs/curriculum.md`: what each hour teaches: six real uses of the technology, the real skills and the jobs (approved by the user, 15 Nov 2026; being built).
- `docs/full-day-plan.md`: the eight-hour day, one hour per part, discussion and break after each (supersedes the ten-minute loops below).
- `docs/afternoon-modules-plan.md`: the user's plan for the afternoon modules, word for word.
- **Work queue (15 Nov 2026; `docs/full-day-plan.md` comes first):** (1) the live site at `bakshilabs.github.io/ai-lab-v3-full-day` is live (15 Nov 2026), published from `main` only; (2) reviews of the drone, robots and roads modules, fixed and re-reviewed until every aspect scores 8 out of 10; (3) `docs/more-modules-plan.md`: two more modules, film studio and power control room, then the same review loop to 8; (4) `docs/grid-hero-plan.md`: the user's Grid Hero game as a "Finished early?" break game (report on it first, change nothing until then).
- `docs/MODULES.md`: the shared contract every module is built against. **Do not change it while module work is in progress.**
- `docs/pilot-plan.md`: the plan for the morning hour and the server (sections F and G say what is built). `docs/RELEASES.md`: what is in the current build and its known issues. `docs/LOAD.md`: load results (local runs only).
- `games/ecotown/`: module 1, copied from `bakshilabs/ai-lab-v3` (`games/ecotown/`, commit `a5fd92c`, 14 Nov 2026). Its own notes are in `games/ecotown/CLAUDE.md`; they were written for the original repository.

## Redesign being explored (owner, 18 Nov 2026; proposals only, nothing built into the game yet)
- The owner prefers the clear look of the start page island (`js/home/island.js`: big plain blocks, few colours, hard shadows, stepped roofs) and is exploring a complete redesign in it. Design the outline before coding.
- **One world of six towns**, one per hour, at the island's scale (squares stay the same size): proposal page `games/ecotown/game/tests/visual/worldmap.html`.
- **No free play.** Every level: the child prompts Florence with word buttons, Florence proposes different design or operating solutions, the child looks at their outcomes through lenses and chooses. Flow diagram: `docs/redesign/game-flow.html`.
- **Do not carry over "Florence could be wrong" or how sure she is** (the owner found it confusing), in Eco Town too. This overrides the Eco Town lesson described above once the redesign is built.

## Rules for this repository
- **Never deploy to the original sites.** `ecotown.deltaops.workers.dev` and `bakshilabs.github.io/ai-lab-v3` belong to the original repository and stay unchanged. This repository's own live site is **`https://ecotown-future.deltaops.workers.dev`** (owner, 18 Nov 2026): Worker `ecotown-future`, KV namespace `ecotown-future-voice`, its own Durable Object code store. Deploy with `cd games/ecotown && node build.mjs && NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt CF_ACCOUNT_ID=9c5ee116be85caa02b46ec934ed28bbf node worker/deploy.mjs`, built from `main`. `/admin` is behind the existing Cloudflare Access app "Eco Town admin" (the new domain was added to it).
- The AI Lab as it stands (the town and six missions) is taken to be one hour. Do not cut it to fit.
- The GitHub workflow only runs when started by hand, and GitHub Pages publishes only from `main`. **Release routine (user, 15 Nov 2026):** when fixed or new module versions are ready, commit on the working branch, push, open a pull request into `main`, merge it, then run `ecotown-pages.yml` on `main` and check the site.
- Research and the other lab concepts (`research/`, `games/PLAN.md`, `games/labs/`) stayed in the original repository. Some documents here still refer to them.
- **Player and leader text is written by OpenAI, not Claude (user, 17 Nov 2026).** Claude must not write or reword any sentence that children or leaders read or hear (the game, modules, films, start, leader and trailer pages). Claude builds the pipeline and checks; the words come from the OpenAI API (`api.openai.com`, key added by the network proxy; prompt in `tools/text/prompt.md`). The earlier rewrites in `docs/feedback/2026-11-17-ecotown-text-rewrites.csv` were also written by OpenAI and may be rewritten by it.
- Plain British English for the user. No budget or coins for ages 8–12.
- Unit tests: `cd games/ecotown/game && node --test tests/*.test.mjs` (295 pass on 15 Nov 2026; `model.test.mjs` "predict is fast" is a timing test and can fail on a busy machine).
- **Module rules:** a module adds files under `games/ecotown/game/js/modules/<id>/`. It does not edit `game.js`, `main.js`, `game.css`, `content.js` or anything under `worker/`. Nothing a child types leaves the device; no names; Florence only assembles from built-in choices.
- **Access:** an organisation has groups; a group has a join code; each child becomes a learner with a made-up badge. Leaders have a leader code and a page at `/leader`. The words "passcode" and "batch" in older documents describe the system this replaced.
