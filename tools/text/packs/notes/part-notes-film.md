
## Area notes: Module — Town film studio: mission list and briefs

### What this area is

This is the **Town film studio** module, a one-hour sequence of **six missions**, each based on a real job in film and TV. It runs inside the child’s existing EcoTown: the camera looks around the town, and the child completes film-making tasks through panels over the 3D view.

The module’s map opens the missions **in order**. A child can replay a finished mission, but locked missions show: **“Finish mission [number] first. The missions open in order.”**

The overall map line changes with progress:

- At the start:
  - Junior: **“Welcome to the film studio. Six jobs, one at a time. Start with the first.”**
  - Senior: **“Six missions, six real jobs in film and TV. Start with the first.”**
- During progress: **“[One/two/three…] of six done. Next: [mission use].”**
- When complete: **“All six missions done. Replay any of them, or see what you made.”**

The module title and blurb are:

- Title: **Town film studio** for both versions.
- Junior blurb: **“Six film jobs: shots, stories, directing, editing, captions, checking.”**
- Senior blurb: **“Six jobs in film and TV, from storyboards to captions and checking.”**

If there is nothing in the town to film, the module cannot run. It reports **“Nothing to film yet”** and says: **“There is nothing here to film yet. Go back to your town and try again.”**

### Who plays and how a teacher runs it

The material only shows the in-game module behaviour, not a separate teacher guide. It is clearly designed for children in two age bands:

- **Junior: ages 8–12**
- **Senior: ages 13–17**

The teacher/club leader role is not described in these files beyond the fact that this is an educational game module. The code suggests it is played by the child in the game, with progress saved after each mission. A leader could presumably let children work through the six missions in order, but the material does not give teacher scripts, timings, classroom setup, grouping, facilitation notes, assessment rubrics, or discussion questions.

### What it teaches

The six missions teach practical media literacy and production skills:

1. **The film crew’s language** — shot sizes and camera moves.
2. **Storyboarding** — planning a story as ordered shots with beginning, middle, end.
3. **Directing an AI helper** — briefing an AI helper and improving a first draft with feedback.
4. **Editing** — choosing takes, setting pace, choosing music, and changing music at a story turn.
5. **Making it for everyone** — captions and audio description/described versions.
6. **True or made up?** — checking whether pictures are real/changed/machine-made, and asking before filming people.

The completion record turns these into practised skills:

- Using a film crew’s words for shots and camera moves.
- Planning a story shot by shot.
- Briefing an AI helper and improving its first cut with feedback.
- Editing for pace and mood.
- Adding captions and a described version.
- Checking pictures for changes and asking before filming people.

### Florence, the AI helper

Florence appears in **Mission 3: Directing an AI helper**. In this area’s material, Florence is the AI helper the child briefs. The mission says directors and producers brief helpers, including AI helpers, and then improve the first draft with clear feedback.

What the child does with Florence:

- Pick or provide a **place**.
- Pick or provide **who is in it**.
- Pick or provide a **mood**.
- Watch **Florence’s first cut**.
- Tell Florence what to change / give feedback.

The junior and senior instructions differ slightly:

- Junior: **“Pick a place, who is in it and a mood. Watch Florence’s first cut, then tell her what to change.”**
- Senior: **“Brief Florence: a place, who is in it and a mood. Watch her first cut and give her feedback.”**

The material here does not give Florence’s full dialogue, personality, limitations, or detailed behaviour; those are likely in the mission 3 source files not included here. What is clear is that Florence produces a **first cut**, and the child improves it through **clear feedback**. Mission 3 progress is saved separately as `m3`; the notes say it never stores anything typed.

### Lenses, checks, or tests children use

This area defines several checks/lenses at a high level:

- **Film language lens**: identify shot sizes and camera moves:
  - Wide shot
  - Medium shot
  - Close-up
  - Pan
  - Tilt
  - Track

- **Story structure check**:
  - Beginning
  - Middle
  - End
  - Senior version also asks the child to leave out cards the story does not need.

- **Directing/AI feedback check**:
  - Give a clear brief: place, who is in it, mood.
  - Watch the first draft/cut.
  - Improve it with feedback.

- **Editing choices**:
  - Choose best takes.
  - Set shot length/pace.
  - Choose music.
  - Senior version also chooses where the music changes.

- **Access checks**:
  - Captions should identify speakers and sounds.
  - Senior captions should be clear and quick to read.
  - Descriptions should fit the gaps.

- **Truth/checking lens**:
  - Look closely at pictures.
  - Check for changes.
  - Look for machine-made clues.
  - Consider where pictures came from.
  - Judge whether a change misleads, in the senior version.
  - Decide when to ask permission before filming people.

The exact UI tools, test names, and step-by-step prompts for these checks are not in these two files; they are in the mission play/rules files that are referenced but not included here.

### Mission-by-mission notes

#### Mission 1: The film crew’s language

- ID: `crew`
- Number: 1
- Icon: 🎥
- Use/name shown on map: **The film crew’s language**
- Job brief: **“Film crews use the same words for every shot, so everyone knows what the camera will do.”**

How it plays:

- Junior: **“Watch the camera in your town. Tap the name of the shot or the move.”**
- Senior: **“Watch the camera in your town and name each shot size and camera move.”**

Learning outcome:

- **“You can name wide, medium and close-up shots, and pan, tilt and track moves.”**

Record line after completion:

- **“Crew words: named [number] shots and moves…”**
- If the result includes sequences: **“…and planned [number] two-shot sequences.”**

What the material does not cover here:

- The exact screens, answer choices, number of questions, feedback lines, or how two-shot sequences are planned are not shown in this area.

#### Mission 2: Storyboarding

- ID: `story`
- Number: 2
- Icon: 🗂️
- Use/name shown on map: **Storyboarding**
- Job brief: **“Before anyone films, the director draws a storyboard: every shot in order, like a comic. Then the crew knows the plan.”**

How it plays:

- Junior: **“Tap the cards to put them in order. Every story needs a beginning, a middle and an end.”**
- Senior: **“Put the shot cards in order: a beginning, a middle and an end. Leave out any card the story does not need.”**

Learning outcome:

- **“You can plan a story in shots, with a beginning, a middle and an end.”**

Record line after completion:

- **“Storyboards: put [number] stories in order…”**
- If spare/unneeded cards were left out: **“…and left out the cards that did not belong.”**

What the child does:

- Orders shot cards into a story.
- Uses beginning, middle, end.
- In the senior version, leaves out unnecessary cards.

What is not covered here:

- Exact card texts, number of stories, and feedback are not included.

#### Mission 3: Directing an AI helper

- ID: `direct`
- Number: 3
- Icon: 🤖
- Use/name shown on map: **Directing an AI helper**
- Job brief: **“Directors and producers brief their helpers, and now AI helpers too. Then they improve the first draft with clear feedback.”**

How it plays:

- Junior: **“Pick a place, who is in it and a mood. Watch Florence’s first cut, then tell her what to change.”**
- Senior: **“Brief Florence: a place, who is in it and a mood. Watch her first cut and give her feedback.”**

Learning outcome:

- **“You can brief a helper clearly and make a draft better with feedback.”**

What the child does:

- Briefs Florence with:
  - Place
  - Who is in it
  - Mood
- Watches Florence’s first cut.
- Gives feedback to change/improve it.

Record line:

- The record line for this mission is supplied by `summary()` from mission 3, not written directly in `hour.js`. The final module can also use the mission 3 film’s opening frame as the record picture and place a film screen in the town.

What is not covered here:

- Florence’s exact first-cut behaviour, feedback options, and wording are not in these files.

#### Mission 4: Editing

- ID: `edit`
- Number: 4
- Icon: ✂️
- Use/name shown on map: **Editing**
- Job brief: **“Video editors choose the best takes, set the pace and pick the music. The same shots can feel calm or exciting.”**

How it plays:

- Junior: **“Pick the best takes, choose how long each shot lasts, then choose the music.”**
- Senior: **“Choose the best takes, set the shot lengths for the pace you want, then choose the music and where it changes.”**

Learning outcome:

- **“You can pick good takes, set the pace of a film and use music to set the mood.”**

Known steps/parts from saved progress:

Mission 4 has named finished parts:

- `takes`
- `trim`
- `pace`
- `music`

The module notes that mission 4 is long, so these finished parts are saved. If the child leaves part way, completed parts are kept. When the mission finishes, `m4` is cleared.

Record line after completion:

- **“Editing: picked [number] best takes, cut a quick film and a calm one, and changed the music at the turn.”**

What the child does:

- Picks best takes.
- Cuts a quick film and a calm one.
- Changes music at the turn.

What is not covered here:

- Exact take options, trimming UI, music options, and what counts as “the turn” are not shown here.

#### Mission 5: Making it for everyone

- ID: `access`
- Number: 5
- Icon: 💬
- Use/name shown on map: **Making it for everyone**
- Job brief: **“Access producers add captions for people who cannot hear the sound, and a described version for people who cannot see the screen.”**

How it plays:

- Junior: **“Choose the best caption for each sound, then the best words to describe each shot.”**
- Senior: **“Choose captions that are clear and quick to read, then descriptions that fit the gaps.”**

Learning outcome:

- **“You can write captions with speakers and sounds, and describe a shot for someone who cannot see it.”**

Record line after completion:

- **“For everyone: chose [number] captions, built [one more / number more] from tiles, and chose [number] spoken descriptions.”**

What the child does:

- Chooses best captions for sounds.
- Builds at least one caption from tiles.
- Chooses spoken descriptions for shots.
- Senior version focuses on captions being clear and quick to read, and descriptions fitting gaps.

What is not covered here:

- Exact caption choices, tile words, sounds, and description options are not included.

#### Mission 6: True or made up?

- ID: `truth`
- Number: 6
- Icon: 🔍
- Use/name shown on map: **True or made up?**
- Job brief: **“News teams check whether a picture is real or changed before they use it, and they ask people before filming them.”**

How it plays:

- Junior: **“Look closely at each picture. Decide if it was changed or made by a machine. Then decide what to do about filming people.”**
- Senior: **“Check each picture for changes and machine-made clues, judge whether a change misleads, and decide when to ask permission.”**

Learning outcome:

- **“You can check pictures for changes and clues, and ask before you film people.”**

Record line after completion:

- **“Checking: looked at [number] pictures for clues and where they came from, and chose to ask before filming people.”**

What the child does:

- Looks at pictures for clues.
- Checks whether pictures were changed or machine-made.
- Checks where pictures came from.
- In the senior version, judges whether a change misleads.
- Decides when to ask permission before filming people.

What is not covered here:

- Exact pictures, clue types, permission scenarios, and feedback are not shown.

### Step-by-step flow of the whole module

From `index.js`, the module flow is:

1. Start the **Town film studio** module.
2. Check there are places in the town to film. If not, stop with the “nothing here to film” message.
3. Create the player/camera view of the town.
4. Restore saved progress.
5. Show the **mission map**.
6. The player chooses an open mission or exits to finish if all are done.
7. Show that mission’s intro.
8. If the child chooses to return to the map from the intro, go back to the map.
9. Play the mission.
10. Save progress after the mission.
11. Show the mission outro with the mission’s result lines.
12. Return to the map.
13. Repeat until all six missions are done and the child chooses finish.
14. Create the final record:
    - A title, usually from the mission 3 film summary if available, otherwise **“My hour in the film studio.”**
    - Up to six record lines, one per completed mission.
    - A picture from mission 3 if available.
    - Practised-skills lines.
15. Add a town item if mission 3 made a film summary: a **film screen** with the film’s opening frame, placed by the hall or market, otherwise by the AI Lab.

### Junior vs senior differences

The same six missions exist for both age groups. Differences in this material are mostly in the **how-to wording** and task framing:

- Junior wording is simpler and more action-led: “Tap,” “Pick,” “Watch,” “Choose.”
- Senior wording uses more professional terms: “shot size,” “camera move,” “Brief Florence,” “feedback,” “set the shot lengths,” “captions that are clear and quick to read,” “judge whether a change misleads.”

Specific differences:

1. **Crew language**
   - Junior taps the name of the shot or move.
   - Senior names each shot size and camera move.

2. **Storyboarding**
   - Junior taps cards into beginning, middle, end.
   - Senior also leaves out any card the story does not need.

3. **Directing AI**
   - Junior picks place, who, mood and tells Florence what to change.
   - Senior briefs Florence and gives feedback.

4. **Editing**
   - Junior picks takes, shot duration, music.
   - Senior sets shot lengths for a desired pace and chooses where music changes.

5. **Access**
   - Junior chooses best caption and best descriptive words.
   - Senior evaluates captions for clarity/speed and descriptions for fitting gaps.

6. **Truth/checking**
   - Junior decides if pictures were changed or machine-made, then what to do about filming people.
   - Senior checks picture changes and machine-made clues, judges whether changes mislead, and decides when to ask permission.

### Saving and progress

Progress is saved after each mission. It stores:

- `done`: one flag per mission.
- `res`: a few numbers/facts from each finished mission for the record.
- `m3`: mission 3’s own progress.
- `m4`: finished parts of mission 4 if the child leaves part way.

Important constraints from comments/code:

- Mission 3 saved progress: **“Never anything typed.”**
- Saved data is kept under the contract’s **8 KB**.
- Restored saved results are cleaned: only finite numbers, safe short strings matching a limited pattern, and booleans are kept.
- Missions open only in order. If an earlier mission is not done, later missions do not count as done on restore.

### Money, names, typing, and privacy

The material in this area does **not** mention money at all. There are no costs, rewards, budgets, payments, or monetisation mechanics shown.

Names:

- The only named character in these files is **Florence**, the AI helper in mission 3.
- No child names or other personal names are requested in this material.

Typing:

- Mission 3’s saved progress comment explicitly says: **“Never anything typed.”**
- The mission instructions all describe choosing, tapping, picking, ordering cards, or giving feedback; these files do not show free typing.
- However, the exact mission UIs are not in this area, so I should not claim there is no typing anywhere unless confirmed by the mission files. What is confirmed here is that mission 3 saved data never stores typed content.

Privacy:

- The module teaches asking before filming people in Mission 6.
- It also avoids saving typed material for mission 3.
- No broader privacy policy, data-sharing explanation, or consent UI is included in this area.

### Tone and wording guidance implied by the material

The writing style is:

- Plain, concrete, and child-friendly.
- Professional but not technical-heavy.
- Short sentences.
- Active verbs: **watch, tap, pick, choose, put, brief, give feedback, check, ask**.
- Uses real film/TV job language but explains it simply.
- Encouraging and capability-focused: every mission has a **“You can…”** outcome.
- Avoids hype about AI. Florence is a helper that makes a first cut, not a magic creator. The child directs and improves the work.
- Emphasises care and responsibility:
  - making media accessible to people who cannot hear/see it;
  - checking pictures before using them;
  - asking before filming people.

The module names jobs as real work:

- Film crew
- Director
- Producer
- Video editor
- Access producer
- News team

Wording should preserve this grounded, real-world feel. It should not make film-making sound like only fun effects; it is about shared language, planning, feedback, editing choices, access, and truth-checking.

