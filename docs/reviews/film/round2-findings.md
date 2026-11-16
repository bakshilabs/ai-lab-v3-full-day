# Town film studio (`film`), one-hour version: review 2

Branch `claude/jolly-goldberg-e9txp9`, commit `9776437`, exported with `git archive` to a scratch folder and served from there (`python3 -m http.server 8931`). Reviewed 16 Nov 2026. No code edited.

Shots folder: `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/film/hour2/` (below, paths are relative to it).

## What was played (Chromium, one browser at a time, on a heavily loaded machine)
| Run | Settings | Result |
|---|---|---|
| `run-senior/` (builder's `tests/playwright/film.mjs`) | **13–17, whole hour**, reduced motion, 1280×800, small town; leave at the map, leave after mission 2 and come back, replay mission 1 | ok: 65 questions, 28 wrong taps (none gave the answer away), 6 set-aside questions came back, both captions built, no errors, no layout faults, no outside requests. Record, jobs, talk, break, screen in the town all present. Saved state 932 bytes. |
| `run-junior/` (builder's driver) | **8–12, whole hour**, **with motion**, **upright tablet 768×1024** | ok: 57 questions, 26 wrong taps, 5 set aside and back, no errors, no layout faults, no outside requests |
| `shots/senior-1280x800-large-kb-*` (my `explore2.mjs`) | 13–17, **keyboard only**, **large text**, mission 1 including the new sequences, wrong answers tried | every control reached by Tab (51 presses for the whole of mission 1), focus ring visible, no layout faults; Back button no longer covers Florence's name |
| `shots/junior-390x844-*` | 8–12, **touch on a phone 390×844**, missions 4–6, wrong answers tried | no errors; panels sit below Florence's line and scroll inside themselves (24 screens scroll a little); nothing off screen |
| `films/` and `films-*-montage.png` | 13–17, every shot of all four mission 2 films | no errors; see must-fix 3 |

Unit tests: `node --test tests/film*.test.mjs` 41 pass.

## Round 1 must-fixes: what happened
| # | Round 1 | Now |
|---|---|---|
| 1 | Shot labels contradict mission 1 | **Mostly fixed.** Mission 3's "Close-up · Florence" is now a real face close-up (`run-senior/…-031-direct-board-2.png`), mission 2's "A big smile" is a face, "Two friends play" is waist-up. **One card is still wrong**: "Close-up: The ball rolls into the river" (must-fix 3). |
| 2 | Jumbled sign "could not show that" | **Fixed.** "…a clue, not proof. Check where it came from too", and "Can't tell yet" is also accepted for that picture. |
| 3 | Colour-only picture adds a cloud and sun | **Fixed.** Same drawing, desaturated and darkened (`run-junior/…-059-truth-ask.png`). |
| 4 | Fake crowd | **Fixed.** Three people at the hall; the idea comes from "someone", Florence stays honest (`shots/junior-390x844-134-truth-ask-50.png`). |
| 5 | Large text, Back over Florence's name | **Fixed** (`shots/senior-1280x800-large-kb-050-crew-setaside-22.png`). |
| 6 | 13–17 short and flat | **Fixed in substance.** Two-shot sequences, a fourth story with two spare cards and an "after" rule, running-time targets, a whispered caption, a second "can't tell yet" picture. Brute-forcing: see must-fix 2. |
Round 1 should-fixes: laughter now on its own slide and no slide has both a caption and a description (fixed); "beside the AI Lab" (fixed); mission 3 moves now linked to crew words on the board (fixed); outro counts in words and no "0 right" line (fixed); the "lab" tune is "thoughtful / curious, a little mysterious" in both missions (fixed); the screening's skip button now says "Skip the film" (fixed).

## Scores
| Aspect | Score | Why, briefly |
|---|---|---|
| First minute | 8 | Unchanged: clear map, one big "Carry on", the job card, then Florence's face as the first close-up. |
| Visual quality | 7 | In-game panels and drawings are clean and the new caption builder looks like a real caption bar. But the **take-home picture is broken**: the "Close-up · Florence" frame spills out of its box over its own label (must-fix 1). |
| Controls and feel | 8 | Big tiles, Tab order sound, tap works on a phone, pace buttons now have a real height. |
| Engagement and pacing | 8 | Much better variety: building a caption, two-shot sequences filmed in the town, running-time targets, a "can't tell yet" answer. Still a lot of three-choice tiles in missions 5–6. |
| The skill is real (and accurate) | 8 | Shot sizes, moves, crew names for Florence's moves, takes, pace, captions (speaker, manner, sound, reading speed with a note that children's programmes go slower), audio description in gaps, consent and honest credits: all right. One shot is still mislabelled (must-fix 3); two small over-claims in mission 6 (nice-to-have). |
| Feedback and honesty | **7** | Wrong answers explain why and never show the answer. But the new "set aside after two misses" does not stop guessing (must-fix 2): on every three-choice question the one tile left ungreyed is the answer, and in five places the question "comes back at the end" on the very next screen. |
| Wording | **7** | Plain, first person, numbers in words in the record. But the pace screen says **"No of the five shots are quick"** to every child who presses Watch with the default lengths (must-fix 4); "named 20 shots and moves" in the 13–17 record. |
| Age fit (both routes) | 8 | 8–12: no money, kW or percentages (checked every screen); 13–17: lens mm, running times, words a second, percentages of a story. 13–17 is now meaningfully harder. |
| Access | 8 | Keyboard, large text, reduced motion, read-aloud hooks, phone and tablet all work; no overlaps found by the layout checks at 1280×800, 768×1024 or 390×844. |
| Robustness | 8 | No errors in any run; leave at the map, leave mid-hour, replay, all clean. Leaving mission 4 part-way still restarts it (nice-to-have). |
| Record and town | **7** | Six true lines, four practised lines, screen in the town. The storyboard picture on the record has Florence drawn outside her frame (must-fix 1). |
| **Fills the hour** | 8 | Estimated play 8–12 about 51 min, 13–17 about 48 min (table below), against the plan's "about 45 minutes of play". |
| **Module score (lowest)** | **7** | |

### Minutes per mission (a typical child, not the loaded machine; the automated runs took 2–4 min a mission at full speed)
| Mission | 8–12 | 13–17 | What fills it |
|---|---|---|---|
| 1 Crew words | 8 | 9 | 14 questions with moves played in the town; 13–17 also 3 two-shot sequences (6 questions, 3 short films) |
| 2 Storyboarding | 7 | 8 | 3 stories (4 for 13–17, the last with two spare cards and an order rule), each filmed (15–20 s) |
| 3 Directing Florence | 8 | 7 | brief, first cut (~20 s), 1–3 rounds of feedback |
| 4 Editing | 10 | 9 | 6 take questions, trim, two pace films (often re-watched; 13–17 must hit a running time), 5 music questions, final film |
| 5 For everyone | 8 | 7 | 4 captions, 1 built caption (2 for 13–17), 3 descriptions, 8–9-slide screening |
| 6 True or made up? | 10 | 8 | 8 change questions, 7 pictures (8 for 13–17), a note, 5 consent questions |
| **Total** | **≈51** | **≈48** | |
The builder's "about 51 minutes for each age" is fair for 8–12 and a little generous for 13–17, but both fill the 45 minutes the plan asks for.

## Must-fix

### 1. The take-home storyboard draws Florence's close-up outside its frame
On the record card (both ages), shot 3 "Close-up · Florence" shows Florence's head and body spilling out of the frame, over the "Close-up / Florence" label and into the empty grid cell below (`run-senior/senior-1280x800-074-record-card.png`, `run-junior/junior-motion-768x1024-068-record-card.png`; the SVG is `run-senior/senior-1280x800-take-home.svg`). This is the picture the child takes home.
- Cause: commit `cf509bb` made `picture.js` draw a close-up of someone at size 3.9 (`CLOSE_WHO`), relying on "the frame cuts the rest". `frameSvg` (the mission 3 board, the town screen) is its own `<svg>` with a 160×90 viewBox, so it is cut. `storyboardSvg` puts each cell's `frameInner` in a plain `<g transform>`, so nothing cuts it.
- Fix: in `storyboardSvg`, wrap each cell's frame in a nested `<svg width="160" height="90" viewBox="0 0 160 90" overflow="hidden">…</svg>` (or a `<clipPath>` per cell with a unique id). Add a unit test that every element of a close-up frame inside `storyboardSvg` is clipped (e.g. assert the cell markup contains the clip), and add the record-card screenshot to the layout check.

### 2. "Set aside after two misses" still lets a child tap through
The builder's fix stops the question after two misses and brings it back later. In play:
- On every **three-choice** question (most of missions 1, 4, 5, 6) two misses grey out two tiles and leave one: the answer. The child sees it, and it returns a few screens later with the same tiles in the same order (`run-senior/senior-1280x800-007-crew-set-aside.png`: only "Close-up" left; log lines `SETASIDE … left-not-grey=["🙂Close-up"]` in `probe-kb-large.txt`, `probe-phone.txt`).
- In five places the list has **one question**, so "It comes back at the end, so look out for it" is followed **immediately** by the same question: mission 4 "What is wrong with take N?" (`askList([takes[i].whatWrong])`), mission 6 "What was changed?" (`askList([c.what])`), and the second shot of each mission 1 sequence (a list of two). `run-junior/junior-motion-768x1024-034-edit-set-aside.png` then the next screen.
- Fix (`mui.js`, `m4-play.js`, `m6-play.js`, `m1-play.js`): (a) for questions with three choices, set aside after the **first** miss (limit = choices − 2), so two plausible tiles remain when it returns; (b) when a question comes back, shuffle its tiles; (c) collect the single-question lists into one list per part (all three "what is wrong" questions after the three "which take" questions; all four "what was changed" questions before the four "fine or misleading" ones; mission 1's six sequence questions as one list, filming each pair once both are answered), so "comes back at the end" is true; or, where that cannot be done, say "Let's look at it again" instead. Keep the browser test's check that a set-aside question never shows the answer, and add one that it does not come back on the very next screen.

### 3. "Close-up: The ball rolls into the river" is neither drawn nor filmed as a close-up
Round 1's must-fix 1 named this card; it is still wrong. The card shows a wide river with a tiny ball (`run-senior/senior-1280x800-019-story-ball-solved.png`); the film shows a river bank from several metres with no ball (`films-ball-montage.png`, top right; `films/senior-1280x800-015-story-film-9.png`). A child who learnt "close-up = a face or one small detail" in mission 1 sees a wide shot called a close-up.
- Cause: `m2-story.js` card `b3` is `size: 'Close-up'`, `shot: ['cw-close', 'river']`; `cw-close` on a **place** (not a person) is `d = 11, fov 28` (`camera.js`), which frames ~20 units of ground. The unit test only checks that a "Close-up" uses the move `cw-close`, not what that move frames for a place.
- Fix: either make it a real detail (draw the ball large on the ripples in `art.js` `b-river`, and film the water at the otters' close distance, d ≈ 4, fov 24), or relabel it "Wide: The ball rolls into the river" (it then fits the drawing and the film). Extend the label test to compute the frame height at the subject (`2·d·tan(fov/2)`) for every card's shot and hold Close-up below mission 1's close-up threshold. The spare card "Close-up: A seagull on the ferry dock" (small gull, no dock) has the same problem in its drawing.

### 4. "No of the five shots are quick."
Mission 4's pace screen starts with all five shots on Medium. A child who presses Watch first (the driver does; many children will) is told "No of the five shots are quick. For an exciting trailer…" (8–12 and 13–17: `run-senior.json` `paceTooSlowLine`, `run-junior.json` the same). The calm film has the same bug ("No of the five shots are long").
- Cause: `m4-edit.js` `paceVerdict` indexes `['No', 'One', …][quick]` and appends " of the five shots are quick".
- Fix: for zero, say "None of the five shots is quick." (or "None of the shots are quick yet."). Add a unit test for 0, 1 and 2.

## Should fix (smaller, but a teacher would notice)
- **13–17 record: "Crew words: named 20 shots and moves"** (`run-senior/…-074-record-card.png`). `num()` in `hour.js` stops at fifteen; extend it to twenty-five or say "every shot and move".
- **The sequences repeat part 3's notes.** Each two-shot note is two of part 3's six notes joined ("how tall… from the ground to the top" = tilt; "down the river as if on a boat" = track). It is the right idea but barely harder. Make at least one pair need a judgement part 3 did not teach, e.g. a note where the size depends on the audience ("the audience must see who is calling, then where she is": close-up, then wide), or a pair where the order matters ("show the turbine is tall, then where it is": tilt then wide).
- **Mission 4 pace targets have one answer.** The trailer needs 8–10 s with an average of 2.2 s or less: only four Quick and one Medium works (9 s). The calm film says "20 to 23 seconds" but an average of 4.2 s already means 21 s or more. Either widen the trailer slot ("8 to 11 seconds") so two or three mixes work, or say "21 to 23". Real editors do cut to a slot, so the idea is good.

## Nice to have
- Mission 6 over-claims slightly: "Sheep have four legs. A real picture could not show six." Lambs are occasionally born with extra legs (and photographed). "Six legs is almost never real: a strong clue" fits the hour's own "a clue, not proof" lesson. Likewise "two opposite shadows could not happen" is true for one sun with no mirror or water to reflect it; "with only the sun lighting it" makes it exact.
- 13–17 "Talk it over" has five questions; `docs/full-day-plan.md` asks for three or four. 8–12 now has four (fixed).
- 8–12 talk screen says "There are no wrong answers" under a question that has one ("wide or close-up?"). "Say what you think, and why" alone is enough.
- Mission 3's film credit is still "Directed by a town planner · Camera by Florence" (`words.js` `CREDIT`), while the rest of the hour calls the child the director. "Directed by you" fits.
- Leaving mid-mission still restarts that mission (mission 4 is about 10 minutes). Saving after each part would match the plan's "progress is saved after every stage".
- Mission 4 "What is wrong with take N?": the two drawings above the question have no "Take 1 / Take 2" labels; on a phone they stack and a child has to remember which is which. Put the label under each.
- Mission 2 "Medium: Florence nets the litter" is filmed with Florence holding her magnifying glass (`films-market-otters-montage.png`); the story disclaimer covers it, but "Florence with her tools" would be honest.
- Phone 390×844: most panels scroll a little (24 screens, at most ~60 px). Not a target size; fine.

## Checked and correct
- **No money, budgets, kW or percentages for ages 8–12** in any screen of the junior run; percentages appear only in 13–17 lines (story split, mission 6 "in this set"). Nothing typed anywhere, no names (a "Mum" voice in a caption is a role, not a name), Florence only assembles built-in words; no outside requests in either full run; saved state under 1 KB.
- **Film-making:** wide/medium/close-up and pan/tilt/track as crews use them; mission 3's moves mapped to crew words ("Push in, Pull back and Street pass are tracks; Circle round is a track in an arc; Rise up is a crane shot"), which is right; lens figures (56 mm for the close-up on a full-frame height) are right; "an editor picks the best take"; pace as average shot length and cuts a minute; music changing where the story turns.
- **Captions:** speaker label for an off-screen voice, sounds in square brackets said once, music described by mood, no invented lyrics, manner in brackets ("(whispering)"), short enough to read at about three words a second, with a 13–17 note that programmes for young children go slower. All standard UK subtitling practice. The screening never shows a caption and a description on the same slide.
- **Audio description:** in the gaps, what is on screen now, no opinion, no guessing what happens next, fits the gap at about 2.5 words a second (150 a minute): standard.
- **"Is this picture real":** a change is fine when it does not change what happened (colour, levelling) and misleading when it does (removed litter, copied otter); clues help but are not proof; check the source and the label; "can't tell yet" is the right answer when there is no clue and no source. Consent: ask first and say what it is for, no means no, a parent or carer for children before anything goes online, honest credits.
