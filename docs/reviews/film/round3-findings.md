# Town film studio (`film`), one-hour version: review 3

Branch `claude/jolly-goldberg-e9txp9`, commit `8dd0dcf`, exported with `git archive` to a fresh folder and served from there (`python3 -m http.server 8932`; restarted from the same export after the container restart). Reviewed 16 Nov 2026. No code edited.

Shots folder: `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/film/hour3/` (paths below are relative to it).

## What was played (Chromium, one browser at a time)
| Run | Settings | Result |
|---|---|---|
| `run-junior/` (the builder's driver, plus a step that opens the take-home page) | **8–12, whole hour, with motion**, 1280×800, small town; leaves at the map and after mission 2, replays mission 1 | ok: 59 questions, no wrong tap showed the answer, 7 set-asides all came back, no errors, no layout faults, no outside requests, saved state 933 bytes. Record, jobs, talk, break, screen in the town and the take-home page all present. (The run's JSON was lost in the container restart; the figures here were read from it before the restart. The screenshots are intact.) |
| `shots/senior-m1-*`, `probe-m1.txt` (my `explore3.mjs`) | 13–17, mission 1, set-asides forced on the first and last question of every part | no errors, no layout faults |
| `shots/senior-m4-*`, `probe-m4.txt` | 13–17, mission 4: other pace mixes, **leave at the start of the pace part and come back** | resumes at the pace part; no errors |
| `films/`, `films-ball-montage.png` | 13–17, every shot of the mission 2 films | no errors |
| `shots/junior-m6-phone-large-*`, `probe-m6.txt` | 8–12, mission 6, **phone 390×844, touch, large text**, set-asides forced | no errors; nothing off screen; 23 screens scroll a little inside their panel |

Unit tests: `node --test tests/film*.test.mjs` 47 pass.

## Round 2 must-fixes, checked in the browser
| # | Round 2 | Now |
|---|---|---|
| 1 | Take-home storyboard: Florence spills out of her frame | **Fixed.** Each cell is its own clipped 160×90 `<svg>`. Record card `run-junior/junior-motion-1280x800-067-record-card.png`; the printed take-home page `run-junior/junior-motion-1280x800-takehome-film.png` and `-takehome-page.png`. The "as filmed / as shown" pair is clipped the same way (`run-junior/…-060-truth-set-aside.png`). |
| 2 | Set-aside still lets a child tap through | **Fixed for single-answer questions; two gaps remain** (should-fixes 1 and 2). Every set-aside left **two** tiles open (3 choices after 1 miss, 4 after 2, 5 after 3, 6 after 4). **Every** returning question had its tiles in a new order (moved round by one; for example `pan,tilt,track` came back as `tilt,track,pan`). The answer was never shown on a set-aside. "What went wrong", "What changed?" and the six sequence questions are now one list each. |
| 3 | "Close-up: The ball rolls into the river" | **Fixed.** The card is a big ball on ripples (`run-junior/…-016-story-ball-dealt.png`). The film is a close view of the water, a few metres across (`films-ball-montage.png`, top right); there is no ball in the town, and the story's own line says the town differs from the drawings. The seagull spare card is a big gull on a post. A new unit test checks frame heights. |
| 4 | "No of the five shots are quick." | **Fixed:** "None of the five shots is quick." (both ages). |

Other round-2 items: the record now says "named twenty shots and moves"; mission 4 keeps finished parts when a child leaves (left at the pace part, came back to the pace part); Take 1 / Take 2 labels under the pair; shadows and six legs are now "a strong clue"; the credit is "Directed by you"; 13–17 Talk it over has four questions; 8–12 no longer promises "no wrong answers". All fixed.

### The harder 13–17 parts
- **Sequences** now need a judgement part 3 did not ask for, and two of the three put the shots in a non-default order:
  - "the audience must see who it is first, and only then where she is" (close-up, then wide);
  - "the surprise is the size: show how tall first, then where it stands" (tilt, then wide);
  - "hurries down the river… then my hand and my face as I point" (track, then medium; the hint explains why a close-up shows only the face).

  Good film grammar, and the wrong-tile lines still say whether the shot is about size or movement (`shots/senior-m1-050-crew-ask-24.png`, `-061-crew-setaside-29.png`). Small point: there is no boat in the town to chase.
- **Running times:** the trailer is "10.5 seconds or less" (accepts 5 Quick = 7.5 s, 4 Quick + Medium = 9 s, 3 Quick + 2 Medium = 10.5 s). The calm film is "21 to 24 seconds" (accepts 3 Long + 2 Medium = 21 s, 4 Long + Quick = 21.5 s, 4 Long + Medium = 23 s). Each now has three answers. I played the edge mixes, 10.5 s and 21 s; both passed with the right numbers ("about 29 cuts a minute", "about 14 cuts a minute").

## Scores
| Aspect | Score | Why, briefly |
|---|---|---|
| First minute | 8 | Unchanged: the map, one "Carry on", the job card, Florence's face as the first close-up. |
| Visual quality | 8 | Take-home and record storyboards clipped and tidy; the new close-up drawings read at a glance. On a phone the litter in "as it was filmed" is a few specks (nice-to-have). |
| Controls and feel | 8 | Unchanged; tap, keyboard and large text all fine. |
| Engagement and pacing | 8 | Varied tasks; the 13–17 sequences now make you think about order; mission 4 no longer punishes a child who leaves. |
| The skill is real (and accurate) | 8 | All labels now match their pictures; sequence notes teach real reasons for shot order (reveal who first, reveal size first); clue claims are measured. |
| Feedback and honesty | 8 | The answer is never shown on a set-aside, two tiles are always left, and the tiles move on return. Two narrow gaps: should-fixes 1 and 2. |
| Wording | 8 | "None of the five shots is quick"; numbers in words up to twenty-four; first person throughout. |
| Age fit (both routes) | 8 | 8–12: no money, kW or percentages anywhere. 13–17: real targets, judgement-based sequences, two built captions, two "can't tell yet" pictures. |
| Access | 8 | Phone + touch + large text with no overlap or off-screen panels; keyboard was checked in round 2 and the controls are unchanged. |
| Robustness | 8 | No errors in any run; leaving mid-mission 4 keeps finished parts; leave and come back at the map, replay. |
| Record and town | 8 | Six true lines, four practised lines, a clean storyboard on the record card and on the printed take-home page, the screen in the town. |
| **Fills the hour** | 8 | About 51 min of play for 8–12 and 48 for 13–17 (unchanged from round 2); the plan asks for about 45. |
| **Module score (lowest)** | **8** | |

### Minutes per mission (a typical child)
| Mission | 8–12 | 13–17 |
|---|---|---|
| 1 Crew words | 8 | 9 |
| 2 Storyboarding | 7 | 8 |
| 3 Directing Florence | 8 | 7 |
| 4 Editing | 10 | 9 |
| 5 For everyone | 8 | 7 |
| 6 True or made up? | 10 | 8 |
| **Total** | **≈51** | **≈48** |

## Must-fix
None.

## Should fix (small; worth doing before release)
1. **Questions with two right answers still give themselves away after a set-aside.** Three questions have two right tiles out of four: mission 4 "Music for the beginning" (day or night), "Music for the end" (day or party), and mission 6's jumbled-sign picture (clue or can't tell yet). After two misses the two tiles left open are both right answers: `probe-m4.txt` (`left=["☀️Bright daytime music…","🎉Party music…"]`) and `probe-m6.txt` (`left=["🤖Made by a machine: the letters…","❓Can't tell yet…"]`). When the question comes back, the child just avoids the two they already tried.
   - Cause: in `mui.js` `ask()`, `lim = max(1, opts − 2)` ignores `item.answers`.
   - Fix: `lim = max(1, opts − (item.answers?.length || 1) − 1)`, so one wrong tile is always left open. That means one miss on these three questions.
2. **The last question of a list still comes straight back.** When the missed question is the last in its list and nothing else is set aside, Florence says "Let's come back to this one in a moment, with fresh eyes", and the next screen is the same question with its tiles moved round. In the 8–12 run this happened four times in one hour: shot sizes 4 of 4, the third "What went wrong", the fourth "What was changed?", and the credits question. The wording is honest, and with two tiles left and a new order it is no longer a give-away. But it does not meet "a question never comes straight back".
   - Fix: hold a last-in-list set-aside until after the next part's first question, or ask a different question from the same part first (for example, re-ask the earliest question answered right first time).

## Nice to have
- Revealed answers still count as "named" in the record (mission 1 `if (!res.missed) r.of++`; a revealed answer is not missed). Count only answers the child found.
- Mission 6 on a phone: the litter in "as it was filmed" is a few specks (`shots/junior-m6-phone-large-007-truth-ask-3.png`). Draw the cans larger so the change can be spotted at 390 px.
- Sequence 3 "hurries down the river after a boat": there is no boat in the town; "as if on a boat" (part 3's wording) avoids the promise.
- Mission 2 "Medium: Florence fishes it out with a net" is filmed with Florence holding her magnifying glass. The story's own line covers it, but "Florence with her tools" would be honest.

## Checked and correct
- **Set-aside behaviour** (single-answer questions): two tiles always left open; never the answer alone; answer never shown on a set-aside; tiles rotated on every return (8 returns logged in mission 1, 6 in mission 6); the answer is shown with its reason if missed again.
- **No money, kW or percentages for 8–12;** nothing typed; no names; Florence only assembles built-in words; no outside requests; saved state under 1 KB.
- **Film-making, captions, audio description and the "is this picture real" lessons** are as accurate as in round 2, with the over-claims softened.
