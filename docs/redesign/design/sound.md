# The sound of the Eco Town levels

This report is from the sound designer. It covers the six Eco Town levels of the redesigned game, first for the animated film and later for the game itself. It proposes a sound for every moment of a level, says which music plays when, sets loudness and pitch ranges, lists what the screen must show because the sound may be off, and ranks the weak points of the present sound track.

Everything proposed here is made with the game's own synthesiser (`games/ecotown/game/js/engine/chip.js` and `audio.js`). There are no recordings and no voices. The new cues are written as code in `docs/redesign/design/sound-cues.js`, which the lead can import. Nothing in the game or the film has been changed.

I cannot hear sound in this session. Every judgement below rests on numbers that I measured from rendered sound, and on experience of what those numbers mean. A person must listen before any of it is called finished. The first thing to listen for is given at the end.

## 1. The ideas behind the design

**The sound should tell the same story as the picture, one moment ahead of the words.** A child should be able to hear that the river is rising, or that a car has set off, before the tick or the cross appears. The test scenes are therefore built from the ratings of the plan being tested, and they change from plan to plan.

**Every pitched sound uses the same five notes (C, D, E, G and A).** Twenty devices that play different cues at different times then make something like wind chimes and never a clash. The same five notes fit over every piece of music proposed here.

**Each kind of sound has its own place.** Florence alone has the soft, round voice between 1,000 and 2,000 Hz. Results use a brighter voice, and each of tick, dash and cross has its own pitch range and its own direction. Low thumps belong to things that land in the town.

**Quiet is part of the design.** The music stops for the test and for the results, because those are the moments when the child must look and judge. The loudest sound in a level is the one at its end.

**Nothing ever sounds like a punishment.** The cross is two soft falling notes. A wrong tap in the recap gets two notes that rise like a question. There is no buzzer anywhere.

## 2. A sound for every moment

Each cue below is a function in `sound-cues.js` with the name shown. The loudness given is the loudest 0.4 seconds of the cue, measured at the output of the game's engine in LUFS (a standard measure of loudness in which a smaller negative number is louder).

### Building the sentence

- **Any ordinary button (`press`).** This is one tiny blip at −48 LUFS. It should be felt more than heard.
- **A word button is picked (`wordPick`).** This is a very short high blip at −49 LUFS as the word lifts off.
- **The word lands in its gap (`wordLand`).** This is a soft wooden knock with one note on top, at −36 LUFS. The first gap plays C, the second plays D and the third plays E, so the sentence climbs as it fills. The present film uses a note that rises with a counter across the whole film, which means nothing to the child.
- **The sentence is complete (`sentenceReady`).** The notes of the gaps are repeated quickly and end on an open pair of notes that sounds unfinished, at −34 LUFS. The unfinished sound points the child to the Ask button.
- **The Ask button (`ask`).** This is a knock and a note that slides upwards, at −34 LUFS. It is the sentence going to Florence.

### Florence

- **Florence says hello (`hello`).** These are three rising notes in her own voice at −32 LUFS.
- **Florence thinks (`think`).** These are three soft rising dots that repeat, at −36 LUFS. They match the three dots in her bubble. The music drops to under a third while she thinks.
- **Florence speaks (`speak`).** This is one soft blip for each word, at about three and a half words a second, for at most 1.6 seconds, and the line falls at its end like a sentence. It measures −38 LUFS. The present film plays eleven blips a second for as long as the letters appear, which is the busiest and most tiring sound in the film (see section 7).

### The plans

- **A plan arrives (`planArrive`).** This is a knock and one note, at −32 LUFS. Plan A always plays C, plan B plays E and plan C plays G. Each plan keeps its note for the rest of the level, so the child hears which plan is being tested and which plan was chosen.

### The test

- **The test button (`testPress`).** This is the one big button of the level, so it has the one big press: a low clunk and three rising notes, at −28 LUFS. The music fades to silence in the same moment.
- **The test itself (`tests[0]` to `tests[5]`).** The coordinator has told me that the plans are now tested in the town one after another. Each test function therefore takes the ratings of the plan being tested, and plays a scene of three to four seconds for that plan. I recommend this order for each plan: the plan's own note, then its scene, then its ticks, dashes and crosses straight away, and then the next plan. The six scenes are described in section 3.

### The results

- **Tick (`tick`).** This is a short grace note and a bright ringing note that rises, around 800 to 1,050 Hz, at −34 LUFS. The tick for the second check is one note higher than the first, and the third is higher again.
- **Dash (`dash`).** These are two soft notes on the same pitch at 440 Hz, at −34 LUFS. The pitch stays level because the result is neither good nor bad.
- **Cross (`cross`).** These are two hollow notes that fall, between 330 and 390 Hz, at −34 LUFS. It is the lowest and softest of the three.
- **A plan that is good on every check (`allGood`).** This is a small shimmer after its last tick, at −40 LUFS. The owner's rule is that every level has such a plan, and this sound helps the child find it.

In the present film the dash and the cross are the same sound as a button tap, and that sound measures −46 LUFS, which is close to silent under the music. A child cannot hear the difference between a dash and a cross at all.

### The choice

- **Choosing a plan (`choose`).** This is a knock, the plan's own note, and two answering notes above it, at −27 LUFS. It is as loud as the test button because it is the child's decision.
- **Going back (`goBack`).** "Try another plan" and "Ask again" play three quiet notes going down, at −33 LUFS. The sound is calm because going back is allowed and is not a mistake. On a second try, when Florence asks what changed, I recommend that no extra sound is added. The second test scene will itself sound different, and that difference is the answer.

### The town changes

- **Building the plan into the town (`build`).** Pieces land one after another, slowly at first and then faster, each with a knock and a note, and the last piece lands on a held pair of notes. Each level has its own small tune and its own tone. It measures −28 LUFS. In the present film this is fifteen identical pairs of notes at −19 LUFS, which makes it the loudest part of a level.

### The recap

- **The right place is tapped (`recapRight`).** These are three rising notes and a sparkle, at −32 LUFS.
- **Another place is tapped (`recapTry`).** These are two soft notes that rise like a question, at −31 LUFS. The present sound track has no sound for this.

### The ends

- **Level complete (`levelComplete`).** This is a short rising phrase with a bass note under it, at −23 LUFS, which makes it the loudest sound in a level. Level 1 ends on C, level 2 on D, level 3 on E, level 4 on G, level 5 on A and level 6 on the C above. The six levels climb a staircase across the hour.
- **The end of the hour (`hourComplete`).** The whole staircase is played once, one step for each finished level, and ends on a full chord, at −22 LUFS. The game's celebration tune then plays once.

### Between the parts

- **The level's title card (`title`).** This is a soft rush of air and two notes, at −35 LUFS.
- **A panel or the camera moving (`wipe`).** This is a very quiet rush of air at −50 LUFS. The striped wipes have been dropped from the film, so this cue is optional. I would use it at most once in a level.

## 3. The six tests as short scenes

Each scene has a beginning that names the event, a middle that shows what happens to this plan, and an end that closes it. Loud, long hiss is avoided everywhere, because twenty devices playing hiss fill a room with noise.

1. **Make it rain.** Far thunder comes first, then single drops that thicken into rain and thin out again, and three last drips close the scene. Each drop is a short high note from the five-note family. When the plan is good, the river stays quiet. When it is fair or poor, a low tone rises slowly with a rush of water under it, and it rises further for a poor plan.
2. **Open the shops.** The shop bell rings twice, doors knock open, and many feet set off. When everyone can walk, only feet are heard. When the walk is too long, a small car toots and putters away, and there are fewer feet. When the trees were kept, birds chirp. When they were not, there are no birds. The bell rings once more at the end.
3. **Make the materials.** A good plan for clean air is the electric sawmill, which is a clean rising whirr and bright saw strokes. A fair plan is the brick oven, which is a low roar with puffs. A poor plan is the cement works, which is heavy thumps, a rough chug and long puffs. The pollution itself must be seen, because a cloud has no sound.
4. **Take the food to market.** Close farms send a trotting cart, which is two wooden clicks in a trot, and the market bell rings when it arrives. Far farms send a lorry, which is a low engine that goes on for most of the scene before it toots and arrives. The length of the journey is the lesson, so the lorry must sound long. Where the wild land is left alone, bees hum and birds chirp.
5. **Keep the lights on.** A falling tone brings the dusk, the wind blows, and ten lights click on one by one, each with a note. When the plan keeps the homes warm, the scene settles on a steady, warm pair of notes and two small twinkles. When it does not, one note droops and the scene ends in quiet wind.
6. **Ring the school bell.** A hand bell rings, and many light, quick feet follow. When every child can walk, there are only feet and a bird. When the walk is fair, one car is heard as well. When it is poor, there are fewer feet and the car drives for longer. The bell rings once at the end.

## 4. The music

### Which music plays when

The music is a quiet bed. Its normal level is about half of what the game uses today. Within a level it moves like this:

- It is at its full bed level for the title card and while the plan is being built into the town.
- It drops to half whenever Florence speaks, while the plans arrive, while the child chooses, and during the recap.
- It is at four fifths while the child builds the sentence, because nothing else is sounding then.
- It drops to under a third while Florence thinks and for one second under the level-complete sound.
- It is silent from the press of the test button until the results have been shown. This is the most important rule. The test scene and the ticks are heard on their own.

The function `bedPlan` in `sound-cues.js` turns the film's own timings into these levels, and `PART` holds the numbers. In the game, the existing `duck()` function gives a similar drop while a voice line plays.

### How it changes across six levels

The present film plays one tune (`day`, at 132 beats a minute) from start to finish. Over an hour that tune would be heard more than a hundred times. I propose six beds, one for each level, made from the game's existing tunes without changing them. The function `registerSongs` adds them under the names `eco1` to `eco6`.

1. **Land** uses the daytime tune in F major at 104 beats a minute, with the bass, soft chords and a light tick only. There is no melody yet, because the town is empty.
2. **Getting around** uses the same key at 110, and the melody and a kick drum arrive.
3. **Homes** moves up one step to G major at 108, which sounds a little brighter.
4. **Food** moves down to C major at 116 with the full band, which sounds warmer.
5. **Power** uses the game's night tune at 92, because the level happens on a winter evening.
6. **A school for everyone** comes home to F major at 122 with the full band.

The music grows as the town grows, which the earlier plan for the game also asked for. All six beds are slower than the present 132, because a child is reading and deciding. The celebration tune is kept for the end of the hour only. The engine's existing rest (24 seconds of bass and tick after three minutes) still applies.

For the other five towns I suggest the same plan with a different home key or tune for each town, so that each week sounds like its own place.

## 5. Loudness and pitch ranges

### Loudness, in four steps

Loudness is measured at the output of the game's engine, as the loudest 0.4 seconds of a cue.

- **Step 1, the two endings:** level complete and the end of the hour are at −22 to −24 LUFS.
- **Step 2, the child's big actions:** the test button, choosing and building are at −26 to −29 LUFS.
- **Step 3, information:** tick, dash, cross, a word landing, a plan arriving and the recap sounds are at −31 to −36 LUFS.
- **Step 4, touch and Florence's talking:** button blips, thinking and speaking are at −36 LUFS or quieter.
- **The test scenes** average −33 to −39 LUFS, and their loudest moment is about −28 to −33 LUFS.
- **The music bed** is at about −35 LUFS at its normal level and about −41 LUFS under Florence. Today the game's music is at −29 LUFS, which is as loud as most of its effects.

Each step is at least 4 LUFS apart from the next, so a child can hear which sounds matter. The cues in `sound-cues.js` are already set to these levels.

In the film, the whole proposed track measures −26.5 LUFS, with its loudest sample at −2 dB below full scale and nothing cut off. If the film is to be shown online, its level can be raised afterwards as a whole.

### Pitch ranges

- **Below 250 Hz** holds the bass of the music and the body of thumps. Tablet speakers play almost nothing here, so no cue may depend on it.
- **From 250 to 700 Hz** holds the knocks, the dash (440 Hz), the cross (330 to 390 Hz), the wrong-tap question, and the music's chords.
- **From 700 to 1,050 Hz** holds the tick, the gap notes and the plan notes. The music's melody also lives here, which is why the music is silent or halved when these cues play.
- **From 1,050 to 2,000 Hz** in a soft, round tone belongs to Florence alone.
- **Above 2,000 Hz** holds only sparkles, birds and raindrops, all short and quiet.

I checked every cue through a filter that behaves roughly like a small tablet speaker. No short cue loses more than 4 LUFS. Among the test scenes, the cement works and the quiet-river rain lose the most, at about 6 LUFS each, and both remain audible. In the present film the sound of the materials test loses 9 LUFS on such a speaker and nearly vanishes.

### Twenty devices in one room

I added twenty copies of each sound at random moments within six seconds. The present rain test then reaches −15 LUFS, and almost two thirds of it is hiss above 5,000 Hz. The proposed rain test reaches −21 LUFS, and only 7 per cent is above 5,000 Hz. Florence's talking falls from −23 to −32 LUFS. I recommend these rules for a room:

- In class mode the music is off, as it already is in the game today.
- In class mode all cues are turned down a little. `makeCues` takes a `trim` number for this, and 0.7 is a sensible start.
- Florence's talking blips play only for the first line of each level in class mode.
- Because every pitch comes from the same five notes, sounds from many devices agree with each other.

## 6. What the screen must show, because the sound may be off

The game must work in silence. Each sound that carries meaning needs a picture that carries the same meaning.

- **A word lands in its gap.** The word flies in and the gap gives a small bounce and changes colour.
- **The sentence is complete.** The Ask button starts to pulse.
- **Florence is thinking.** Her bubble shows three moving dots.
- **Florence is speaking.** Her words appear in the bubble and her face moves.
- **Which plan is being tested.** The plan's card or letter is lit, and the camera is on that plan in the town.
- **What happened in the test.** Everything the scene says in sound must be visible in the town: the water rising, cars beside the walkers, the cloud of pollution, the lorry still on the road after the cart has arrived, windows going dark, children walking or riding. The test button should also show that the test is running.
- **Tick, dash and cross.** The three marks differ in shape as well as colour, and each appears with a small bounce beside its sentence.
- **The plan that is good on every check.** Its card gets a short glow after its last tick.
- **The choice.** The chosen card lifts and stays lit.
- **A wrong tap in the recap.** The tapped place gives a small shake of the head, and Florence's hint appears as words.
- **Level complete.** The level's dot in the row of six turns into a tick. Since the confetti has been dropped, this dot is the main picture of success, so it should move clearly.
- **The staircase across the hour.** The row of six dots already shows it.

No information is given by sound alone anywhere in this design.

## 7. What is weakest in the present sound track, in order

These are the weak points of `docs/redesign/animation/sound.js` as it is now, with the fix for each. The fixes are all in `sound-cues.js`.

1. **A dash and a cross sound the same, and both are nearly silent.** Both use the button tap, which measures −46 LUFS under music at about −29. The fix is the three separate result sounds: the tick rises, the dash stays level and the cross falls.
2. **The music never stops.** One fast tune plays at one level through reading, deciding and results, and only dips for the test. Its melody sits in the same range as the ticks. The fix is the level plan in section 4, with silence for the test and the results.
3. **The rain test is mostly hiss.** More than half of its energy is above 5,000 Hz for eight seconds, and twenty devices raise it to −15 LUFS. The fix is rain made of single pitched drops with only a trace of hiss.
4. **Florence's talking is too busy.** It plays eleven blips a second for as long as her words appear. The fix is one blip for each word, for at most 1.6 seconds, and 7 LUFS quieter.
5. **The tick sounds like Florence.** The present tick (`tip`) uses her soft tone in her pitch range, so results and her talking blur together. The fix keeps that tone for her alone.
6. **One sound has three meanings.** The same two notes (`pop`) play for a word landing, a plan arriving and a piece being built. The fix gives each its own sound, and gives each plan its own note.
7. **Finishing a level is not the biggest moment.** Building measures −19 LUFS and the end of the level measures −20, and levels 1 to 5 end on a phrase that is barely louder than a tick. The fix makes building quieter and makes level complete the loudest sound, with the staircase across the six levels.
8. **The test scenes do not say what happened.** They are the same whichever plan is tested. The fix is scenes that follow the plan's ratings, which now suits the tests happening one plan after another in the town.
9. **Low sounds are lost on tablets.** The materials test loses 9 LUFS on a small speaker. The fix moves the body of each sound above 250 Hz.
10. **Nothing changes across the hour.** Every level has the same tune and the same cues. The fix is the six beds, a build tune for each level, and the staircase.
11. **The building sound has a small fault.** It asks the game for build families called `nature` and `energy`, which the game does not have, so those levels fall back to the homes sound. The new `build` cue does not use the families.
12. **There are no sounds for the sentence being complete, for Florence thinking, for a wrong tap in the recap or for going back.** All four are added.

One thing is fine as it is. I expected the film's final gain of 1.6 to cut off the loudest moments, but I measured no sample at full scale.

## 8. How to use the code

`docs/redesign/design/sound-cues.js` has no imports. The engine's `note` function is passed in, so the same file works from the film folder and from the game.

- `makeCues({ note }, engine, { trim })` returns all the cues. Each cue takes the time to play at as its first argument, and plays now when the time is left out.
- `cues.tests[level](time, length, ratings)` plays a test scene. The ratings are the plan's results on the level's checks, in the order of the data file, for example `['p', 'g']`.
- `registerSongs(SONGS)` adds the six beds to the game's song list. `BED`, `BED_LEVEL`, `PART` and `bedPlan` hold the music levels.
- `filmEvents(part)` and `renderFilmAudio(deps, parts, duration, lead)` make the film's whole track in this design. `renderFilmAudio` does the job of `renderAudio` in the film's `sound.js`. The film must pass it the full parts, with `pick`, `rows` and, when plans are tested one after another, `tests` (a start and end time for each plan). The comment above `filmEvents` lists the fields. The timings for the new one-after-another tests are the lead's to set, since the film is being changed.

I tested it in Chromium. Every cue renders. Every test scene renders for every plan of every level and at lengths of 3, 6 and 11 seconds. The whole film track of 402 seconds rendered with the earlier single test, and a short film with the plans tested one after another also rendered. The words that Florence speaks are only counted, never changed, and this file writes no words that a child reads or hears.

## 9. What a person must check by ear

1. Listen to the six test scenes first, one plan at a time. They are the part most likely to need changes, because the difference between a sawmill and a brick oven made from a chip synthesiser cannot be judged from numbers.
2. Check that tick, dash and cross can be told apart with eyes closed.
3. Check that Florence's talking is pleasant after ten minutes.
4. Play three or four devices at once in one room and listen for anything harsh.
5. Check that the music's silence during the test feels calm and not empty.
