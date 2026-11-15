# Two more afternoon modules: Town film studio and Power control room

*The user's plan, as given on 15 November 2026. Kept word for word. Not started: it waits for the live site and the review of the first three modules (section 2).*

## 1. What the user has decided
- Add two modules to "Eco Town of the future": **Town film studio** (id `film`) and **Power control room** (id `power`).
- Same terms as the first three: first versions only, one playable loop of about ten minutes each, built by one agent each in a separate working copy.
- Same afternoon rules: Florence is a capable partner, no lesson about catching the AI out, nothing a child types leaves the device, no names, Florence assembles only from built-in choices.
- Five afternoon modules is more than one afternoon holds. These are **a menu a leader chooses from**, not a longer day.

## 2. When to start
After the work already in hand is finished and pushed:
1. the welcome film, the start page and the live site;
2. the review of the three existing modules, iterated until each scores 8 out of 10.

Reason: what the reviewers find in the first three should go into the briefs for these two.

## 3. Shared changes the main agent makes first (the builders must not)
The module interface does not change. These are additions, made and committed before any builder starts.

| File | Change |
|---|---|
| `js/modules/contract.js` | Add `film` and `power` to `MODULE_IDS`. |
| `js/modules/loader.js` | Two more lines in the registry. Add `setMusic` to `ctx.engine` (the game's own mood music), which the film module needs. |
| `js/modules/film/index.js`, `js/modules/power/index.js` | Placeholders, as the first three had. |
| `tests/modules.test.mjs` | The list of ids it expects. |
| `js/game/takehome.js` | A question to ask at home for each new module. |
| `js/series.js`, the start page, the welcome film | See the decision in section 8. |
| `docs/MODULES.md`, `docs/RELEASES.md`, root `CLAUDE.md`, `docs/afternoon-modules-plan.md` | Record the two new modules. |

**Keep the placeholders off the start page and the module board until each module is merged,** so the live site never shows "still being built".

## 4. Rules for both builders
Everything in `docs/MODULES.md` and section 4 of `docs/afternoon-modules-plan.md` applies. In addition, from what the first three builders found:
- **Start from the right commit.** The working copies were cut from an old commit last time. Fast-forward to the tip of `claude/jolly-goldberg-e9txp9` before reading anything.
- **Only add files in** `js/modules/<id>/`, `tests/<id>*.test.mjs` and `tests/playwright/<id>.mjs`.
- **Do not import three.js at the top of `index.js`.** Use `ctx.engine.THREE`, or load the file that needs it with `import()` inside `run` and `show`.
- `ctx.town.terrain.tiles` is a Map, not a list.
- `show()` has no frame hook: run your own animation loop and cancel it in the remover.
- Block the game's own keys and pointer while the module is open, and remove the block on leave.
- A child who presses "Back to my town" early keeps nothing from that visit. Save progress with `ctx.save`, and offer a way to finish with what already works.
- Keep rules and wording in pure files with unit tests; keep drawing separate.
- Browser run on its own port: **8814 for `film`, 8815 for `power`**. Run once with reduced motion and once without, in both age routes.
- Commit in the working copy. Do not push, merge or deploy.

## 5. Town film studio (`film`)
- **View and play:** a storyboard screen over the child's own town, which is the film set. The child directs; they do not build or fly.
- **Loop:**
  1. Choose what the film is about from tiles: a place in their town, who is in it (a family, the otters, Florence), a mood.
  2. Florence assembles a first cut of four to six shots from a built-in kit of camera moves.
  3. Watch it.
  4. Give feedback from tiles: "shorter", "start at the school", "show the otters", "end on the whole town", "calmer music", "livelier music".
  5. Watch the new cut. Repeat as often as wanted. The storyboard shows what each piece of feedback changed.
- **Honest limit of the machine:** Florence can only use shots of things that exist in the town. If the child asks for otters and the town has none, she says so and offers what is there.
- **Skill practised:** briefing a creative partner and improving a draft through feedback.
- **Ages 13–17:** one more control (shot length or order by drag), and a title card chosen from built-in words.
- **Back to the town:** a screen in the town square (or by the AI Lab if there is no square) showing the film's opening shot; scenery only.
- **Take-home:** the storyboard as inline SVG, one simple drawn frame per shot, with the feedback given between cuts as the lines.
- **Build notes:** make a small shot player of its own with `ctx.engine.onFrame`. Do not import the game's episode engine: the contract does not allow it. Music comes only from `ctx.engine.setMusic`. With reduced motion, each shot is a still view with a Next button.
- **No typing anywhere,** including the title.

## 6. Power control room (`power`)
- **View and play:** indoors at a control desk with dials and the day's forecast, then the town at night to see whose lights stay on.
- **Loop:**
  1. Run the town's power by hand through one day: when to charge the battery, when to use it.
  2. Write rules from tiles for the system to follow by itself: "if the wind drops, use the battery", "charge at midday", "at night, keep the school lit first".
  3. Watch the rules run three days: a windy day, a still day, a winter night.
  4. See where homes went dark, change the rules, run again.
  5. Compare the hand-run day with the rule-run days, in plain words, with no pass or fail.
- **Honest limit of the machine:** the system does exactly what the rules say and nothing more. A gap in the rules shows as dark windows at a particular hour.
- **Skill practised:** reading a forecast and data, and writing rules for an automated system.
- **Ages 13–17:** units, a chart of supply against demand through the day, and one more rule kind (a threshold, such as "below 30% battery").
- **Back to the town:** the town's lights at night follow the child's rules; scenery only, the town's numbers do not change.
- **Take-home:** the rule set as lines, and an inline SVG chart of the three test days.
- **Build notes:** a small hour-by-hour model of its own, pure, seeded and unit tested. Take the town's wind turbines, solar roofs and batteries from `ctx.town.cells` with `catalog.js`, with a sensible floor when the town has none. Do not change the game's simulation.

## 7. After the two first versions
1. Review each, merge one at a time, run the whole unit suite, both mission play-throughs and all module browser runs after each merge.
2. Add each to the module board and the start page only once merged.
3. Check the take-home page still prints on one A4 page with five modules filled in. If not, shorten what each module shows.
4. Send one reviewer per module and iterate to 8 out of 10, as for the first three.
5. A person plays each. Agents cannot judge whether it is fun.

## 8. Decision needed from the user before step 3
The start page was asked to show "all four" parts. With two more modules there are six. Choose one:
- **(Recommended) Four parts plus "More to try".** The day stays Eco Town plus the first three; the film studio and control room sit in a separate row for leaders who want to swap one in.
- **Six parts in a row.** Simpler, but it reads as a longer day than one afternoon holds.

## 9. What to report back
- For each module: what was built, what is simplified, test results, screenshots, and what a person should try.
- Whether adding `setMusic` to the loader was enough for the film module.
- Whether the take-home page still fits one page.
