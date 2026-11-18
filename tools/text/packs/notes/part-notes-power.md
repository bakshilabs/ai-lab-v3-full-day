
# Notes: Power control room — mission list and briefs

## Scope of the material I read

This material covers the **Power control room** module’s overall mission structure, the short mission briefs, what progress/results are saved, and the summary text shown after missions and at the end. It does **not** include the detailed play screens for each mission, the mission map UI text, the briefing/debrief card layout, Florence’s dialogue, or teacher-facing running notes.

Files read:

- `games/ecotown/game/js/modules/power/missions.js`
- `games/ecotown/game/js/modules/power/index.js`

## What this module is

Module ID: `power`  
Icon: `⚡`  
Title comes from `T.title` in `words.js` — not included here, so the exact title text is not in this material.

The module is described in `index.js` as:

- Junior blurb: **“Keep the lights on: balance, forecast, store, write rules, and a storm night.”**
- Senior blurb: **“Run a town’s power: balance, forecast, storage, rules, demand, a storm.”**

The code comments call it **“Power control room”** and say it represents **one hour of Eco Town of the future**.

There are **six missions**, played in order. Each mission teaches a different real use of a power control room and a different real skill.

The missions are:

1. **The grid must balance** / `balance` / `⚖️`
2. **Forecasting** / `forecast` / `🌦️`
3. **Storage** / `storage` / `🔋`
4. **Automation rules** / `rules` / `📋`
5. **Smart demand** / `demand` / `🔌`
6. **Storm night** / `storm` / `⛈️`

The module ends only when **all six missions are done**. The finished output is a take-home-style record titled **“My power control room”**.

## Who plays and how a teacher runs it

The files do not directly describe classroom running, grouping, timing, teacher prompts, or facilitation. They do show that this is a child-facing game module with two age/reading versions:

- **Junior** version, likely 8–12, selected by `ctx.junior`
- **Senior** version, likely 13–17

The game is designed so children can leave part-way through a mission and resume at the next saved round. Finished missions can be replayed.

From the code:

- Missions open in order.
- A mission is open if it is the next unfinished mission or an earlier one.
- Later missions are locked until earlier missions are complete.
- A completed mission may be played again.
- Progress is saved after every round.
- If the child exits part-way, they come back to that mission’s next round.

No teacher dashboard, group mode, discussion script, or assessment rubric appears in these files.

## What it teaches

The module teaches power-system control skills through six practical tasks.

### Overall curriculum skills visible here

Children practise:

- Keeping electricity **supply level with demand**
- Reading **forecasts** to predict shortfalls
- Choosing when to **store** energy and when to use it
- Writing and testing **automation rules**
- Moving flexible demand to greener hours while still meeting people’s needs
- Prioritising safety and restoration during an emergency

The end-of-module “You practised…” lines are built from what the child completed. Possible lines include:

- “keeping supply level with demand as it changes”
- “keeping supply level with demand, and reading a forecast to see shortfalls coming”
- “choosing when to store energy and when to use it”
- “choosing when to store energy, then writing and testing rules so a system does it by itself”
- “moving power use to greener hours while meeting what people need”
- “putting people’s safety first in an emergency and restoring a system step by step”
- fallback line: “running a town’s power from a control room”

## Florence / AI helper

Florence is **not mentioned** in these two files. There are no helper lines, personality notes, hints, or AI behaviour rules in the supplied material.

So for this area I should not invent Florence’s exact lines or role. The only safe inference is that, if Florence appears elsewhere in the module, her wording would need to support the mission tasks and the same practical, calm control-room tone used here.

## Lenses, checks, tests, and feedback children use

The files do not mention named “lenses.” They do show several forms of checking and feedback.

### Mission briefs

Each mission has three brief fields:

- `use` — the mission title/use case
- `job` — who does this in the real world
- `how` — what the child will do
- `can` — the skill the child can show afterwards

### Progress checks

The module records small result summaries for each mission. These feed the “done” cards and the final record.

### Done-card feedback

After each mission, a debrief card uses `doneLines()` to show a short result.

Examples:

- Balance, junior: **“X of Y ten-minute steps level.”**
- Balance, senior: **“X of Y steps balanced at 50 Hz.”**
- Forecast, junior: **“Three forecasts read. X short spells found.”**
- Forecast, senior: **“Three forecasts read; X shortfall spells found and sized in kWh.”** if kWh was done
- Storage, junior: **“Day 1: the dark squares added up to X.”**
- Storage, senior: **“Day 1: X home-hours unsupplied.”**
- Rules: reports number of rules and either lit hours or percentage supplied
- Demand: reports jobs moved and, in senior, kWh shifted
- Storm: reports safe restoration, and in senior may mention trips

### Tests inside missions

Only high-level tests are visible here:

- Mission 1 has **three rounds**, each harder.
- Mission 2 has **three forecasts**.
- Mission 3 has **three days**, each harder.
- Mission 4 tests rules on **a windy day, a still day and a winter day**.
- Mission 5 has **four days**.
- Mission 6 has staged emergency restoration.

The detailed screens/checking logic are in the mission play files, not in this material.

## What children do, mission by mission

Only the mission-list briefs and high-level flow are available here. The exact screen-by-screen UI is in other files (`map.js`, `shell.js`, `m1-play.js` through `m6-play.js`) and is not included.

### Before a mission

The child is on a mission map created by `missionMap(d, p)`.

- The map returns either a mission index or `finish`.
- The chosen mission opens a `briefing(d, i, cur?.round || 0)`.
- If the briefing does not return `start`, the child goes back to the mission map.

The exact visible button labels are not in this material, but the internal action names include:

- `start`
- `finish`
- `next`

I should not assume these are the literal UI labels unless confirmed elsewhere.

### Mission 1: The grid must balance

ID: `balance`  
Icon: `⚖️`

Junior title/use:

- **“The grid must balance”**

Senior title/use:

- **“The grid must balance”**

Junior job brief:

- **“Grid control engineers keep the power made level with the power used, every minute of every day.”**

Senior job brief:

- **“Grid control engineers match supply to demand every second; if they drift apart, the grid’s frequency moves away from 50 Hz.”**

Junior how brief:

- **“Each ten minutes, set the town battery so the scale is level. Three rounds, each one harder.”**

Senior how brief:

- **“Every ten minutes, set battery output so supply equals demand. Three rounds of eight steps.”**

Junior can statement:

- **“You can keep supply level with demand as it changes.”**

Senior can statement:

- **“You can balance supply and demand as both change, reading frequency as the sign of imbalance.”**

What children do, as far as this material says:

1. Work in ten-minute steps.
2. Set the town battery.
3. Try to make the scale level / supply equal demand.
4. Complete three rounds.
5. In senior, each round has eight steps and frequency/50 Hz is the sign of balance.

Result saved:

- `level`: number of level/balanced steps
- `of`: total steps

Done-card wording:

- Junior: **“X of Y ten-minute steps level.”**
- Senior: **“X of Y steps balanced at 50 Hz.”**

### Mission 2: Forecasting

ID: `forecast`  
Icon: `🌦️`

Junior title/use:

- **“Forecasting”**

Senior title/use:

- **“Forecasting”**

Junior job brief:

- **“Energy forecasters read the weather forecast to say when wind and sun will not make enough power.”**

Senior job brief:

- **“Energy analysts turn weather forecasts into a forecast of generation, so shortfalls are planned for, not discovered.”**

Junior how brief:

- **“Read the chart. Tap every hour when the town will be short of power.”**

Senior how brief:

- **“Read each forecast chart and mark every hour of shortfall; then size it in kWh.”**

Junior can statement:

- **“You can read a forecast chart and say when power will be short.”**

Senior can statement:

- **“You can read a supply and demand forecast, find the shortfall and turn kW into kWh.”**

What children do:

1. Read forecast charts.
2. Identify hours when the town is short of power.
3. Tap/mark every shortfall hour.
4. Senior version also sizes the shortfall in kWh.
5. The mission involves three forecasts, based on the done-card and final record text.

Result saved:

- `tries`
- `kwh`: whether the kWh part was completed
- `spells`: number of shortfall spells found

Done-card wording:

- Junior: **“Three forecasts read. X short spells found.”**
- Senior: **“Three forecasts read; X shortfall spells found and sized in kWh.”** if `kwh` is true, otherwise without the kWh phrase.

### Mission 3: Storage

ID: `storage`  
Icon: `🔋`

Junior title/use:

- **“Storage”**

Senior title/use:

- **“Storage”**

Junior job brief:

- **“Battery operators store spare wind and sun power, and give it back when the town needs it.”**

Senior job brief:

- **“Storage operators decide when to charge and discharge, moving energy from hours of surplus to hours of shortfall.”**

Junior how brief:

- **“Run the town battery by hand: Charge, Hold or Use, hour by hour. Three days, each harder.”**

Senior how brief:

- **“Set the battery hour by hour (charge, hold, use) through three harder days.”**

Junior can statement:

- **“You can choose when to store power and when to use it.”**

Senior can statement:

- **“You can schedule a store against a forecast so the energy is there when demand peaks.”**

What children do:

1. Run the town battery by hand.
2. Choose one mode per hour: **Charge**, **Hold**, or **Use**.
3. Complete three days, each harder.
4. The hand-run day is kept for mission 4 to work on.

Result saved:

- `dark`: array of up to three numbers, one per day
- `total`: total possible amount used for percentage calculations

The code represents saved hand choices compactly as letters:

- `c` = `charge`
- `h` = `hold`
- `u` = `use`

Comment says no typed data is saved.

Done-card wording:

- Junior: **“Day N: the dark squares added up to X.”**
- Senior: **“Day N: X home-hours unsupplied.”**

### Mission 4: Automation rules

ID: `rules`  
Icon: `📋`  
Marked `built: true` in the mission list.

Junior title/use:

- **“Automation rules”**

Senior title/use:

- **“Automation rules”**

Junior job brief:

- **“Control engineers write rules, so the system can run itself day and night.”**

Senior job brief:

- **“Control engineers write the rules automated systems follow, then test them on many kinds of day.”**

Junior how brief:

- **“Write rules from tiles. Test them on a windy day, a still day and a winter day.”**

Senior how brief:

- **“Build rules from tiles, test them on three days, find the gaps and fix them.”**

Junior can statement:

- **“You can write rules for a machine and test them.”**

Senior can statement:

- **“You can write, test and debug the rules an automated system follows.”**

What children do:

1. Build/write automation rules from tiles.
2. Test the rules on three types of day:
   - windy day
   - still day
   - winter day
3. Senior version explicitly includes finding gaps and fixing/debugging the rules.

Mission 4 is described in `index.js` as “the first version of this module” and it uses `m4-play.js`.

The state used by mission 4 includes:

- `hand`: the hand-run battery day from mission 3
- `rules`: the current rule set
- `tests`
- `changed`
- `improved`
- `test`
- `prev`
- `tested`

The module saves rules as they change.

Result saved:

- `share`: percentage supplied
- `diff`
- `lit`: lit hours
- `total`: total hours/home-hours

Done-card wording:

- Junior: **“N rule/rules. On the test days: X of Y lit hours.”**
- Senior: **“N rule/rules; X% of home-hours supplied across the test days.”**

### Mission 5: Smart demand

ID: `demand`  
Icon: `🔌`

Junior title/use:

- **“Smart demand”**

Senior title/use:

- **“Smart demand”**

Junior job brief:

- **“Energy planners help people run washing and car charging when there is spare clean power.”**

Senior job brief:

- **“Demand-response planners shift flexible demand into hours of surplus renewable power, within what people need.”**

Junior how brief:

- **“Move the jobs to times with spare wind and sun. Keep to the times people need. Four days.”**

Senior how brief:

- **“Move each flexible job into surplus hours, inside its time window. Four days.”**

Junior can statement:

- **“You can move power use to greener times and still meet people’s needs.”**

Senior can statement:

- **“You can shift flexible demand to surplus hours while respecting each user’s constraints.”**

What children do:

1. Move jobs to times with spare wind and sun / surplus renewable power.
2. Keep within people’s needed times / each job’s time window.
3. Work through four days.

The final record mentions examples:

- washing
- car charging
- getting **the nurse to work on time**
- in senior, “gas only for a need that could not move”

Result saved:

- `moved`: number of jobs moved
- `kwh`: kWh shifted

Done-card wording:

- Junior: **“X jobs moved to spare wind and sun.”**
- Senior: **“X jobs moved; Y kWh of flexible demand shifted to surplus renewables.”**

### Mission 6: Storm night

ID: `storm`  
Icon: `⛈️`

Junior title/use:

- **“Storm night”**

Senior title/use:

- **“Storm night”**

Junior job brief:

- **“Emergency planners and engineers decide who gets power first after a storm, and bring it back safely.”**

Senior job brief:

- **“Emergency planners and network engineers isolate faults, restore priority sites first and re-energise safely.”**

Junior how brief:

- **“Get ready for the storm. Then find the broken line, choose who gets power first, and bring everyone back safely.”**

Senior how brief:

- **“Prepare for the storm, isolate the fault, restore by priority within capacity, then repair and restore safely.”**

Junior can statement:

- **“You can put people’s safety first in an emergency and restore a system step by step.”**

Senior can statement:

- **“You can prioritise in an emergency and restore a network safely, one step at a time.”**

What children do:

1. Prepare for the storm.
2. Find/isolate the broken line or fault.
3. Choose who gets power first.
4. Restore priority sites first, within capacity.
5. Repair and restore everyone safely.

Final record names priority places:

- **health centre**
- **shelter**

Result saved:

- `trips`: number of trips on the way

Done-card wording:

- Junior: **“The broken line was cut off, the safe places came first, and everyone is back.”**
- Senior: **“Fault isolated, priority load first, all supply restored with no trips.”** or **“Fault isolated, priority load first, all supply restored (X trip/trips on the way).”**

## How the mission flow works

The play loop in `index.js` is:

1. Clean/load saved progress.
2. Create the desk/shell.
3. Show the mission map.
4. Child chooses a mission or finishes.
5. Show that mission’s briefing.
6. If the child starts, run the mission.
7. Save progress after each round inside the mission.
8. When the mission finishes, save the result and mark it done.
9. Show the debrief/done card.
10. If the debrief returns `finish`, stop.
11. If it returns `next`, go to the next unfinished mission.
12. Otherwise go back to the mission map.
13. When all six missions are done, report **“Finished: all six missions”** and return the final record and town data.

## Progress and saving

The module saves:

- which missions are done
- result summaries for missions
- part-way round progress per mission
- the hand-run battery modes from mission 3
- the automation rules
- flags for whether rules changed/improved

Important privacy/design note from the comment:

- **“never anything typed: there is no typing here”**

That means the saved state contains no typed child input. There is no free-text entry described in these files.

The save is cleaned/clamped:

- numeric fields are rounded and bounded
- invalid hand-run battery strings are rejected
- invalid progress is normalised
- older version saves can be upgraded

Older save compatibility:

- A save from the first version, where `v === 1` and `stage === 'done'`, becomes mission 4 done.
- Its rules and hand-run day are kept.

## End-of-module record

When all six missions are complete, the module returns:

```js
finished: true
record: {
  made: {
    title: 'My power control room',
    lines: ...,
    picture: hourPicture(p, j)
  },
  practised: ...
}
town: {
  kind: 'power-rules',
  data: { v: 1, rules: st.rules }
}
```

The “made” title is always:

- **“My power control room”**

The record has up to six lines, one per mission. Some lines are generic if the mission result is not present, but normally all missions should be done before the final record.

### Junior final record lines

Possible junior lines include:

- **“Balanced the grid: X of Y ten-minute steps level.”**
- **“Read three forecasts and found every hour of short power.”**
- **“Ran the town battery by hand for three days, and met the goal each day.”**
- **“Wrote N rule/rules and tested them on a windy day, a still day and a winter day.”**
- **“Moved X jobs to spare wind and sun, and still got the nurse to work on time.”**
- **“Storm night: cut off the broken line, lit the health centre and shelter first, brought everyone back.”**

### Senior final record lines

Possible senior lines include:

- **“Balancing: X of Y steps held at 50 Hz.”**
- **“Forecasting: found every shortfall hour on three days, and sized it in kWh.”**
- **“Storage: three days by hand, A% / B% / C% of home-hours supplied.”**
- **“Automation: N rule/rules, X% of home-hours supplied on the three test days.”**
- **“Demand response: X jobs (Y kWh) moved to surplus; gas only for a need that could not move.”**
- **“Storm night: isolated the fault, restored priority sites first, re-energised safely.”**

## Junior vs senior wording and concepts

The two versions use the same mission structure but differ in technical language and level of abstraction.

### Junior version style

Junior wording is concrete, simpler, and often visual:

- “power made” and “power used”
- “scale is level”
- “short of power”
- “spare wind and sun”
- “dark squares”
- “safe places”
- “bring everyone back”

Junior focuses on what the child can directly see and do:

- set the battery so the scale is level
- tap every hour when power is short
- choose Charge, Hold or Use
- write rules from tiles
- move jobs to spare wind and sun
- find the broken line

### Senior version style

Senior wording adds power-system vocabulary and quantitative reasoning:

- “supply” and “demand”
- “frequency” and “50 Hz”
- “generation”
- “shortfalls”
- “kWh”
- “charge and discharge”
- “surplus renewable power”
- “time window” and “constraints”
- “faults,” “priority load,” “capacity,” “re-energise”
- “home-hours supplied/unsupplied”

Senior also includes extra conceptual steps:

- reading frequency as a sign of imbalance
- turning kW into kWh
- scheduling storage against a forecast
- debugging automation rules
- respecting user constraints
- restoring by priority within capacity

## Money, names, typing, and privacy

### Money

No money, costs, budgets, prices, bills, or rewards are mentioned in these files.

### Names

No child names are requested or stored. The only human role/example names in these files are generic roles and one role/person reference in the final record:

- grid control engineers
- energy forecasters
- energy analysts
- battery/storage operators
- control engineers
- energy planners
- demand-response planners
- emergency planners and engineers
- network engineers
- **the nurse**

No personal player name is used.

### Typing

The material explicitly says:

- **“never anything typed: there is no typing here”**

Mission 4 rules are built from tiles, not typed. Mission 3 choices are saved as mode letters internally, not typed by the child.

### Privacy

No personal information is collected in these files. Saved progress consists of mission completion flags, scores/results, battery choices, and rule structures. The material does not mention analytics, accounts, logins, or sharing.

## Tone and wording to preserve

The wording is practical, calm, and job-like. It treats children as doing real control-room work, but in safe, simple language.

Important tone features:

- Use real-world roles: “Grid control engineers,” “Energy analysts,” “Storage operators,” “Emergency planners.”
- Keep the task concrete: “set the town battery,” “tap every hour,” “move the jobs,” “find the broken line.”
- Emphasise safety and people’s needs, especially in storm and demand missions.
- Avoid fantasy language. The power system is real-world-inspired.
- Junior text should stay plain and visual.
- Senior text can use technical vocabulary, but still concise and action-focused.
- Do not over-explain in mission cards; existing briefs are short.
- The module’s achievement language says “You can…” rather than “You won…”
- Results are factual and measured, not competitive.

Recurring useful phrases from the design:

- “supply and demand”
- “spare wind and sun”
- “surplus renewables”
- “shortfall” / “short of power”
- “charge, hold, use”
- “windy day, still day and winter day”
- “people’s safety first”
- “restore a system step by step”
- “one step at a time”

## Things not covered by this material

These files do not provide:

- Florence’s lines or behaviour
- the exact mission map screen text
- the exact briefing/debrief layouts
- the literal button labels, except internal actions like `start`, `next`, and `finish`
- detailed screen-by-screen mechanics inside each mission
- scoring thresholds or success/failure rules
- sound, animation, or film scripts
- teacher instructions
- accessibility notes
- money/cost mechanics
- any name-entry or typed-input UI

