# ai-lab-v3-full-day

A **full-day kids' club (AI Lab)** built around the Eco Town game. Eco Town is **module 1** and fills one to two hours. Five new modules, each a new game environment in the Eco Town world, fill the rest of the day.

- There is no plan for the day at present. The first one-page plan (six modules, 9:00 to 16:00) was deleted on 14 Nov 2026 and a new plan will replace it. Do not assume its modules or timetable.
- `games/ecotown/`: module 1, copied from `bakshilabs/ai-lab-v3` (`games/ecotown/`, commit `a5fd92c`, 14 Nov 2026). Its own notes are in `games/ecotown/CLAUDE.md`; they were written for the original repository.

## Rules for this repository
- **Never deploy to the original sites.** `ecotown.deltaops.workers.dev` and `bakshilabs.github.io/ai-lab-v3` belong to the original repository. `games/ecotown/worker/deploy.mjs` is switched off here until the camp has its own worker, voice store and passcode store.
- The GitHub workflow only runs when started by hand. There is no public test site for this repository yet.
- Research and the other lab concepts (`research/`, `games/PLAN.md`, `games/labs/`) stayed in the original repository. Some documents here still refer to them.
- Plain British English for the user. No budget or coins for ages 8–12.
- Module 1 unit tests: `cd games/ecotown/game && node --test tests/*.test.mjs` (250 pass).
