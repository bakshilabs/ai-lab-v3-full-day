# The full day: one hour per part

## What the user decided (15 November 2026, word for word)
> "they all need to be one hour each."
>
> "the full day is 8 hours. eco town will not take the entire morning. after each module, there will be a break and there needs to be a discussion section at the end of each module, to review what was learned between student and live teacher in the classroom"

This replaces "first versions only: one playable loop of about ten minutes each" in `docs/afternoon-modules-plan.md` and `docs/more-modules-plan.md`, and the morning/afternoon split in `CLAUDE.md`.

## Assumptions to confirm (made by Claude, not yet confirmed by the user)
1. **All five modules are in the day.** Eco Town plus five modules is six hours of parts, which with breaks and lunch fills eight hours. The film studio and power control room stop being "a menu a leader chooses from", and the start page shows six parts in a row (not "four plus More to try").
2. **Each hour is about 45 minutes of play and 10 to 15 minutes of discussion.** The discussion is led by the teacher with screens down; the game shows the questions and waits.
3. **The order** is Eco Town, drone, robots, roads, film studio, power control room.

## A draft timetable (times are a guide; nothing in the game waits for a clock)
| Time | Part |
|---|---|
| 09:00–09:15 | Welcome film and getting started |
| 09:15–10:15 | Part 1: Eco Town (ends with its discussion) |
| 10:15–10:30 | Break |
| 10:30–11:30 | Part 2: Drone delivery |
| 11:30–11:45 | Break |
| 11:45–12:45 | Part 3: Robot training |
| 12:45–13:25 | Lunch |
| 13:25–14:25 | Part 4: Roads for self-driving cars |
| 14:25–14:40 | Break |
| 14:40–15:40 | Part 5: Town film studio |
| 15:40–15:55 | Break |
| 15:55–16:55 | Part 6: Power control room (its discussion closes the day) |
| 16:55–17:00 | Take-home page |

Screen time is about four and a half hours across the day. That is a lot for ages 8–12; the discussions and breaks are where it is broken up.

## What each part needs
- **About 45 minutes of play:** five or six stages that get harder, each a new problem using the same skill, as the morning's six missions do. Progress is saved after every stage, and a child who stops early keeps what they finished.
- **A discussion section at the end,** the same in every part: a "Talk it over" screen with three or four questions for that part (what you did, what the machine needed from you, what you would change), shown large for the teacher to read out. The child presses "We have talked it over" to move on. The take-home page and the leader's page show the same questions.
- **A break screen after the discussion:** "Break time", naming the next part, with the way back to the start page. It does not start the next part by itself.
- **A one-hour section in the leader's run sheet,** like the morning's: the stages, where children get stuck, and the discussion questions.

## Order of work
1. **Shared pieces (main session):** the discussion section and the break screen (one shared component the loader shows at the end of every module, with each module's own questions; Eco Town's session finish uses the same screen), the start page and welcome film with six parts and "about an hour", and a full-day run sheet for leaders. The start page shows "about an hour" for a part only once it really lasts that long.
2. **Each module grown to an hour,** one agent per module, once its current fixes and review are done, using the review findings. Then the same review loop to 8 out of 10, with "fills an hour" added to the checks.
3. **Voices:** record every new line in the same two voices after each module is grown.
4. **Release** each part through a pull request into `main`, as agreed.
