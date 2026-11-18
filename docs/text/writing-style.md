# AI Lab writing style (taken from OpenAI's own rewrites)

**What this is.** A description of how OpenAI has been writing the AI Lab's text, built from what it has produced so far:
- the 70 rewrites in `docs/feedback/2026-11-17-ecotown-text-rewrites.csv`;
- the 91 changed lines in `docs/text/openai-returned-2026-11-18-eco-town.csv`;
- the purpose notes from the first pilot.

Every example below is OpenAI's own wording. It is written so that a writer (Claude, if the owner allows it, or OpenAI) can match that voice. It also works as a checklist when reviewing.

**Limits.** About 160 examples, almost all Eco Town and almost all for ages 8–12. There is nothing yet from the five modules, and very little for ages 13–17. The sections on those are thinner, and say so.

**The rule in force.** `CLAUDE.md` says Claude does not write player or leader text. That rule stands until the owner changes it. Until then this guide is used to brief OpenAI and to check its work.

---

## 1. The job of every message

A child should finish reading and know two things: **what is going on** and **what to do now**. Write from the purpose of the message, not from the old wording.

## 2. The shape of an instruction (ages 8–12)

**Situation in the child's terms → the reason, in one clause → the exact steps, naming the buttons as they appear.**

| Before | OpenAI |
|---|---|
| Homes are unlocked! Families are waiting. Try 🏡 Homes on your town land. | Homes are ready! Tap 🏡 Homes, choose a house, then tap a Town land tile to build it. |
| The town needs its own school. Try 🏫 Town heart. | Your town needs a school. Tap 🏫 Town heart, choose Town school, then place it near the homes. |
| On a still winter night, the lights would go out. Add a battery store or a wind turbine. | On a winter night with no sun or wind, the lights could go out. Build a Battery store to save electricity for later. Wind turbines help when the wind blows. |
| Town land is full ({n} tiles). Remove a tile first. | Your town already has {n} Town land tiles, which is the limit. To add a new tile, use Remove on an old one first. |

- Give the **whole chain of taps**: "Tap X, choose Y, then tap Z". Don't use "Try X", which leaves the child to work out the rest.
- **Name builds and buttons exactly as on screen**, with capitals and emoji: Town land, Mixed farm, Battery store, Footpath & crossing, Remove, 🌼.
- Being clear matters more than being short. OpenAI often made instructions **longer** so that every step is there. It cut asides, not steps.
- Ending with the next step is a habit: "…Pick 🏫 Town heart to start."

## 3. Words

| Instead of | OpenAI writes |
|---|---|
| carbon, t, embodied carbon (ages 8–12) | carbon pollution, tonnes of carbon pollution |
| power (when it means the supply) | electricity |
| a still winter night | a winter night with no wind or sunshine |
| town land | Town land (it is a button) |
| food baskets / {a} of {b} baskets | baskets of food; "You have {a} baskets of food, but your town needs {b}. One basket feeds three families." |
| the farthest home is a {n}-minute walk | the home furthest from school is {n} minutes away on foot |
| confidently wrong | sounds very sure even when she's wrong |
| 82% sure | very sure (in words, for every age, in the films too) |
| credits, 💰 (ages 8–12) | stars, ⭐ |
| children (on pages the child reads) | you; "Your teacher" |
| pesticide | pesticides (sprays that kill insects): a hard word gets a short meaning in brackets |

- Everyday words. Cut cosy filler like "Brrr!".
- Turn a figure of speech into a plain question: "Every tile has to work hard" became "Can you fit everything the families need into those 8 squares?"
- Capitals for the one word that carries the logic, used rarely: "within an 8-minute walk of school AND a Market square…", "Tell me what you DO want."
- British spelling. Curly ’ and “ ”.

## 4. Florence

- She speaks as "I", warmly and simply: "This is my AI Lab. Here you can test my plans. Sometimes I sound very sure even when I'm wrong. Can you find my mistakes?"
- She owns her mistakes plainly, with the reason: "You wrote “{w}”. My plan passed the check, but I missed “not” and did the opposite of what you asked. Tell me what you DO want."
- When she was biased, she says what she missed: "I sounded sure before, but I had only asked drivers."
- How sure she is, always in words: "very sure", "not completely sure, but let's test it".
- She is never mocked and claims no real feelings.

## 5. Feedback and results

- Say what the check found, what it **didn't** check, and what to do next: "This lens found no problem, but it checks only one part of the plan. Try another lens to check something else, or use the plan if you're happy with it."
- Partial success names both halves: "Partly right: Florence followed the town rules, but missed one of your own goals."
- A result label says what happened in plain words: "Read the words too exactly" became "Followed your words, not what you meant".

## 6. Labels, buttons and fragments

- Labels stay labels: no full stop, about the same length. "Food baskets" became "Baskets of food".
- A fragment the game joins into a sentence keeps its start (lower case) and its ending.
- A goal written as a heading becomes an instruction: "Lights on through a still winter night" became "Keep the lights on at night, even when there's no sun or wind."

## 7. Ages 13–17 (thin evidence)

- Clear and direct, with real numbers and units kept: t, kWh, %, minutes.
- The few examples show the same habit as ages 8–12: technical phrasing becomes plain cause and effect. "Florence's summary model was trained only on comments from the car-park box (drivers)" became "Florence only learnt from comments left by drivers at the car park. She didn't hear from people who walk or cycle."
- Florence's confidence is in words here too.

## 8. Mistakes OpenAI made (do not copy)

- **Dropping a fact or number the screen needs.** It dropped the 6 families and carbon 30 on the Concrete flats card, and the town's carbon limit in the flower chart help.
- **Changing what something is.** "the market" became "the community hall". "No home floods" became "Keep the bees and the deer".
- **Renaming things across the game without being asked.** It renamed Florence's town "the practice town" (the owner kept "Florence's town").
- **Breaking a line the game joins to a number.** "{n} carbon pollution" and "{n} power on a dark winter night" don't read.
- **Removing formatting tags or emoji.**
- **Copying the old line instead of writing from its purpose.** This happened in 3,241 of 3,332 rows on the bulk return.

## 9. Check before handing in

1. After reading it, does the child know what is going on and what to tap next?
2. Is every button and build named exactly as on screen?
3. Are all facts, numbers, `{placeholders}`, tags and emoji still there? (No percentages, money or power units for ages 8–12.)
4. If the game joins this line to something else, does the joined sentence still read?
5. Is a label still a label?
6. British spelling and curly quotes?
