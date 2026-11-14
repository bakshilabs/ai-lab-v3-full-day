# ai-lab-v3-full-day

A **full-day kids' club (AI Lab)** built around the Eco Town game. Eco Town is **module 1** and fills one to two hours. Five new modules, each a new game environment in the Eco Town world, fill the rest of the day.

- `docs/pilot-plan.md`: the current plan (draft, 14 Nov 2026): make Eco Town ready for a one-hour pilot with several organisations. **Read this first.** It answers the user's implementation brief; the user will revise it. Modules 2 to 6 are not to be built yet. The first full-day plan (six modules, 9:00 to 16:00) was deleted; do not assume its modules or timetable.
- `games/ecotown/`: module 1, copied from `bakshilabs/ai-lab-v3` (`games/ecotown/`, commit `a5fd92c`, 14 Nov 2026). Its own notes are in `games/ecotown/CLAUDE.md`; they were written for the original repository.

## Rules for this repository
- **Never deploy to the original sites.** `ecotown.deltaops.workers.dev` and `bakshilabs.github.io/ai-lab-v3` belong to the original repository. This repository is a **new live build**, deployed from here to a **new Cloudflare address that the user will provide** (decided 14 Nov 2026). `games/ecotown/worker/deploy.mjs` stays switched off until that address exists and the script names a new worker, voice store and passcode store.
- The AI Lab as it stands (the town and six missions) is taken to be one hour. Do not cut it to fit.
- The GitHub workflow only runs when started by hand. There is no public test site for this repository yet.
- Research and the other lab concepts (`research/`, `games/PLAN.md`, `games/labs/`) stayed in the original repository. Some documents here still refer to them.
- Plain British English for the user. No budget or coins for ages 8–12.
- Module 1 unit tests: `cd games/ecotown/game && node --test tests/*.test.mjs` (250 pass).
