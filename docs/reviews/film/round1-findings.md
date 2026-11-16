# Town film studio (`film`), one-hour version: review 1

Branch `claude/jolly-goldberg-e9txp9`, module `games/ecotown/game/js/modules/film/`. Reviewed 16 Nov 2026. No code edited.

Shots folder: `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/film/hour1/` (below, paths are relative to it).

## What was played (all in Chromium, served on :8876)
| Run | Settings | Result |
|---|---|---|
| `run-senior-reduce/` (builder's script) | 13–17, **reduced motion**, 1280×800, full town with three wind turbines, whole hour | ok, no errors, no layout faults |
| `run-junior-motion-tablet-empty/` (builder's script) | 8–12, motion, upright tablet 768×1024, **empty town**, whole hour, leave and come back after mission 2 | ok, no errors |
| `shots/kb-large-a-*` (my script, `explore.mjs`) | 8–12, **keyboard only**, **large text**, 1280×800, missions 1–3, wrong answers tried | every control reached by Tab (111 Tab presses for three missions), no errors |
| `shots/films-*` | 13–17, reduced motion, every shot of the mission 2 and 3 films stepped and captured | no errors |
| `shots/phone-*` | 8–12, **touch** (tap), **phone 390×844**, missions 4–6, wrong answers tried | no errors |
| `midleave.mjs` | leave mid-mission 4, come back | map keeps missions 1–3; mission 4 starts again from its start; nothing left in the scene; no errors |

Unit tests: `node --test tests/film*.test.mjs` 38 pass.

## Scores
| Aspect | Score | Why, briefly |
|---|---|---|
| First minute | 8 | Clear map of six jobs, one big "Carry on" button, a job card that says why the job matters, then Florence's face filling the screen for the first close-up. |
| Visual quality | 8 | Warm, consistent panels; the town camera work is lovely; drawn cards are clean. Some drawn and filmed shots do not match their labels (see must-fix 1). |
| Controls and feel | 8 | Big tiles, Next always where the eye is, Tab order sound, taps work. Pace timeline is fiddly on a phone (15 small radio buttons). |
| Engagement and pacing | 7 | Missions 2, 3 and 4 are hands-on and fun. Missions 1, 5 and 6 are long runs of three-choice questions (51 questions in the hour); with wrong tiles greyed out, guessing always wins in three taps. |
| The skill is real (and accurate) | **6** | Good core content (shot sizes, pan/tilt/track, takes, pace, captions, AD gaps, consent, credits). But several things contradict what the hour teaches or are untrue: must-fix 1–4. |
| Feedback and honesty | 7 | Wrong answers explain why and never give the answer away (25 wrong taps checked). "Clues are not enough" is said clearly. Outro counts can be discouraging ("0 of them were right at the first check"). |
| Wording | 7 | Mostly short, plain British English. Florence talks about herself in the third person in her own box in mission 6 and 5; digits and words mixed ("2 of six done", "2 cuts"). |
| Age fit (both routes) | 7 | 8–12 fits well. 13–17 gets the same questions plus numbers, one spare card and shot reordering: too easy and too short for 15–17. No money anywhere on the 8–12 route. |
| Access | 7 | Keyboard, reduced motion, read-aloud hooks all work. Large text at 1280×800 puts the Back button over Florence's name (must-fix 5). On a phone, panels slide under Florence's line. |
| Robustness | 8 | Leave at the map, leave mid-mission, come back, replay a finished mission, play an empty town: all clean. A mission left half-way restarts from its beginning (up to ~10 minutes lost in mission 4). |
| Record and town | 8 | Six true lines, four practised lines, the mission 3 storyboard as the picture, a screen in the town by the hall. |
| **Fills the hour** | **6** | Estimated play: 8–12 about 49 min, 13–17 about 38 min (table below). 8–12 fills the 45 minutes; 13–17 does not, and difficulty barely ramps after mission 1. |
| **Module score (lowest)** | **6** | |

### Minutes per mission (a typical child, ignoring the slow machine)
| Mission | 8–12 | 13–17 | What fills it |
|---|---|---|---|
| 1 Crew words | 8 | 6 | 14 questions, camera moves played in the town |
| 2 Storyboarding | 7 | 5 | 3 stories (4–6 cards), each filmed (~15 s) |
| 3 Directing Florence | 8 | 7 | brief, first cut (~20 s), 1–3 rounds of feedback |
| 4 Editing | 10 | 8 | 6 take questions, trim, two pace films (often re-watched), 5 music questions, final film |
| 5 For everyone | 7 | 5 | 4 captions, 3 descriptions (reading-heavy), 30 s screening |
| 6 True or made up? | 9 | 7 | 19 questions and a note |
| **Total** | **≈49** | **≈38** | |

Variety is good across the six (naming, ordering, directing, editing, choosing words, judging). Difficulty does not ramp much: from mission 4 on it is mostly the same three-choice tile, and missions 5–6 are easier than mission 1 part 3 (six choices).

## Must-fix

### 1. Shot labels in missions 2 and 3 contradict what mission 1 teaches
Mission 1 teaches: close-up = a face or one detail; a full figure with surroundings is wider. Then:
- Mission 3's "Close-up · Florence" shot shows Florence head to feet with the street around her (wider than mission 1's own medium shot). `shots/films-052-2-film-47-2.png`; the board and the take-home picture also call it "Close-up" (`run-senior-reduce/senior-full-1280x800-061-record-card.png`). Cause: `camera.js` `case 'close'` for Florence is d 14, fov 30 (≈7.5 units of height in frame), against `cw-medium` d 10.5, fov 30.
- Mission 2 "The lost ball": the caption "Close-up: A big smile: the ball is back" plays over a high wide view of the hall and houses, no face, no ball (`shots/films-020-1-film-17-4.png`); "Close-up: The ball rolls into the river" is a wide river landscape with no ball (`shots/films-018-1-film-15-2.png`). Drawn cards too: "Medium: A family plays with a ball" and "Medium: The stall keepers set up" are drawn as small full figures (`run-senior-reduce/senior-full-1280x800-015-story-ball-dealt.png`, `-018-story-market-solved.png`).
- Reproduce: `FILMALL=1 BAND=senior FROM=1 TO=2 node explore.mjs`, step through the films.
- Fix: make every label honest. In `m2-story.js` give each card the size its drawing and its filmed shot really are, or change the shot (`b5` → `cw-close` on the family or Florence; `b3` → a `close` on the river at the ball's spot; `b2`/`m2` → `cw-medium`). In `kit.js`/`camera.js` either film mission 3's "Close-up" with the `cw-close` framing or rename it ("Full shot"/"Medium shot"). Add a unit test that checks each labelled size against the frame height a shot gives (`poseFor` distance and fov), using mission 1's thresholds.

### 2. "A real picture could not show that" is untrue for the jumbled sign
Mission 6, picture 2 (sign "MAKRTE"): Florence says "The letters on the sign are jumbled. A real picture could not show that." Real signs are misspelt all the time. `shots/phone-100-5-right-28.png`.
- Fix (`m6-truth.js` `pictureItems`): per-picture `ok` lines. For the sign: "Jumbled letters are a common clue in machine-made pictures. A real sign could be misspelt, so this is a clue, not proof. Check where it came from too." Keep "could not happen" only for the six-legged sheep and the two opposite shadows.

### 3. The "brighter colours, that's fine" picture also adds a cloud and a sun
Mission 6 part 1, picture 1: "As it was filmed" is a grey sky with no sun or cloud; "As it was shown" adds a cloud and a sun (`art.js` `CHANGE_ART.colour` uses `frame('dull', …)` against `HALL()`, which draws `cloud(40, 20)` and the day sun). The answer says only the colours changed and that this does not change what happened. A careful child will see the added cloud and be marked wrong in their head. `run-senior-reduce/senior-full-1280x800-053-truth-ask.png`.
- Fix: draw both from the same scene with a colour filter only (for example the day frame with an `feColorMatrix` saturation/brightness drop for "as filmed"), same sky objects in both.

### 4. The fake-crowd question: the picture shows a crowd, and Florence offers to deceive
Mission 6 part 3, question 4: "Florence offers to make a picture of a big crowd … Only a few people came." The drawing shows seventeen people in front of the hall (`PEOPLE_ART.hall`, `crowd(-70, 9) + crowd(10, 8)`), so the picture says the opposite of the text. Florence then answers "I would not make that picture for the news" after offering it, and earlier said "When I make a picture, I say so". The line appears in Florence's own box in the third person ("Florence offers…"). `shots/phone-120-5-ask-36.png`. The module rules also say Florence is a capable partner, not someone who tempts the child to mislead.
- Fix (`m6-truth.js`, `art.js`): draw three or four people at the hall. Recast the offer so it comes from someone else and Florence stays honest, e.g. "Your film needs a shot of the hall's opening. Only a few people came. Someone says: 'Ask an AI to make a picture of a big crowd.' What do you do?" with Florence's `ok`: "News shows what really happened. If you ever use a made picture, label it." Say it in the first person or as a narrator line, not "Florence offers" in Florence's box.

### 5. Large text: the Back button covers Florence's name at 1280×800
With large text on, "← Back to my town" (wider in large text) sits over the start of Florence's line, cutting "Florence" to "lorence". Seen on every screen. `shots/kb-large-a-016-0-tool-end-5.png`, `shots/kb-large-a-065-board-2-2.png`.
- Fix (`ui.js` CSS): in `.fm-root.fm-large .fm-talk` set `left` from the Back button's real width (e.g. `left: 250px`), or measure `.modback` once and set `--fm-talk-left`. The builder's layout check already tests this overlap but only runs large text at its default size; add `LARGE=1` to the test matrix.

### 6. 13–17 does not fill the hour and does not get harder
About 38 minutes for 13–17 (table above); the questions are the same as for 8–12 with numbers added after the answer. Mission 1's six-choice part is the hardest step in the hour.
- Fix, per mission, 13–17 only: mission 1, add a fourth part where they choose size and move for a two-shot sequence (an establishing wide then a tilt, etc.); mission 2, a fourth story with two spare cards and a "cutaway" beat; mission 4, a pace target to hit in seconds ("a 12-second trailer, average under 2.5 s"); mission 5, write the caption by assembling it from tiles (speaker tag, words, sound in brackets) against the 3-words-a-second limit; mission 6, two pictures with no clue at all where the only right answer is "can't tell yet: check where it came from". Also hide wrong tiles' greying for 13–17 or require one reason before Next, so three taps cannot brute-force every question.

## Should fix (smaller, but a teacher would notice)
- **Mission 5 screening puts "[Laughter, off screen]" on the sunny market shot full of people,** at the same time as a spoken description (`shots/phone-071-show-5.png`). The caption was taught on the family picture, and description goes in gaps without important sound. Give the laughter its own (family) slide, or show the description on a slide with no caption. (`m5-access.js` `screening`.)
- **Description 1 says "Florence waves from the door of the AI Lab";** the drawing has her beside the lab, not at the door (`run-junior-motion-tablet-empty/…-049-access-show.png`). In a lesson about describing exactly what is on screen, move her to the door in `SHOT_ART.lab` or change the words to "beside the AI Lab".
- **Mission 3 uses a second set of move names** (Push in, Circle round, Street pass, Fly over, Rise up) with no link to mission 1's pan, tilt and track. One line on the board for 13–17 ("A street pass is a track"; "Push in" is also called a dolly in) would join them up, or rename `street` to "Track along the street".
- **Outro lines in digits and a discouraging zero:** "You put 3 stories in order. 0 of them were right at the first check." (`run-junior-motion-tablet-empty/…-019-story-outro.png`). Use words (as the record does) and drop the line when the count is zero, or say "You fixed every story after Florence's hint."
- **"lab" music is "Thoughtful" in mission 3 (mood "Curious") and "a bit worried, mysterious" in mission 4.** Pick one description for the same tune.
- **Tilt in an empty town:** "Show how tall the old school is" frames Florence in front of the school at the chosen moment (`run-junior-motion-tablet-empty/…-009-crew-scene-filmed.png`). Keep her out of the tilt's line of sight.

## Nice to have
- Phone 390×844: the question panels slide under Florence's three-line box and the top of the picture is hidden (`shots/phone-097-5-right-27.png`); the fifth pace card spans the full width with a very tall picture (`shots/phone-024-pace-set-fast.png`). Phones are not a target, but `max-height: calc(100% - talk height)` would fix it.
- Mission 5 with motion: the slide button says "Skip ➜" but skips the whole screening. Say "Skip the film".
- Mission 6 for 13–17: "3 of the 4 machine-made pictures had a clue (75%)" may read as a real-world rate. Add "in this set" or drop the percentage.
- Junior "Talk it over" has five questions; `docs/full-day-plan.md` asks for three or four.
- Leaving mid-mission restarts that mission from its start. For mission 4 (about 10 minutes) save the finished parts.
- Caption reading speed (3 words a second, about 180 a minute) matches the upper end of UK subtitle guidance (160–180 wpm); for an 8–12 audience, children's programmes use slower rates. A senior-only note saying so would be more accurate.

## Checked and correct
- Shot sizes and moves as defined in mission 1 (wide, medium from the waist up, close-up a face or detail; pan and tilt turn from one spot; track travels) match standard crew usage, and mission 1's own camera framings match them (`run-senior-reduce/…-004/-005/-006`).
- Lens figures: `lensMm` uses a 24 mm full-frame sensor height, f = 12 / tan(fov/2): the close-up's 56 mm and others are right for the view shown; "a longer lens, or standing closer, makes the shot tighter" is true.
- Captions: speaker ID for an off-screen voice, sounds in square brackets, describe the music's mood, no made-up lyrics, keep it short: all standard practice. Audio description: in the gaps, what is on screen, no opinion, no guessing: standard.
- Consent: ask first and say what the film is for, no means no, a parent or carer for children before anything goes online, honest AI credits. Sensible and safe; no real people, nothing typed, Florence assembles only built-in words.
- "Clues are not enough" is said plainly, with "where did it come from, who made it, is it labelled". Good.
- No money or budgets on the 8–12 route inside the module. Nothing leaves the device (no outside requests in either full run).
