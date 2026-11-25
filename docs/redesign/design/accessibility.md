# Accessibility review of the Eco Town levels

This report reviews the six Eco Town levels for children aged 8 to 12 who play on tablets and laptops in a camp or a classroom. The main subject is the new interface in `docs/redesign/ui/` (`screens.html`, `tokens.css` and `DESIGN.md`), because it will replace the interface of the first film. The first film in `docs/redesign/animation/` is the background: I measured it because its 3D tests, its timing and its sound are still the only versions that exist.

I changed no existing file, and I wrote no sentence for children. Where a fix needs new words, I say what the words must do and leave the writing to the owner's process.

## How I measured

I served the film with a small server and opened `index.html?rec=1` in Chromium at 1280 by 720. I moved the film to 19 moments in each of the six levels, saved 118 screenshots, and read the size, colour and position of every visible element from the page. I rendered all 30 mock-ups in `ui/screens.html` in the same way. Contrast figures use the WCAG formula. Colour blindness was simulated by applying the Machado matrices at full strength to the screenshots. Colour differences are given as a distance called ΔE: below about 10 two colours are hard to tell apart, and above about 30 they are clearly different. Flicker was measured by reading the 3D picture at 30 frames each second through every test and counting how often each pixel changed its brightness by a tenth or more.

Reading speeds are a planning assumption of mine and not a measurement. I plan for 60 words a minute for the slowest readers in this age group, who are reading on a screen while something moves, and 100 words a minute for a typical eight-year-old.

The pictures are in `docs/redesign/design/img/`, and their names all start with `a11y-`.

## The short answer

The new interface is a large step forward, and most of the barriers in the first film's interface are already solved by it. Its text is large enough, its contrast is strong, its buttons are large, its results have shapes as well as colours, and the recap offers a few marked places instead of asking for a precise tap on the town.

The barriers that remain are mostly outside the interface. The 3D tests still tell their story by colour alone in four of the six levels. The film gives far too little time to read. Nothing is spoken, so a child who reads slowly depends entirely on text. The reduced-motion setting covers the interface but not the camera or the 3D town. The game has no plan yet for keyboards, switches or screen readers.

## 1. Reading

### Text size

The new interface, measured at 1280 by 720:

| What the child reads | New interface | First film |
|---|---|---|
| Florence's speech | 24 pixels | 25 pixels |
| The child's sentence | 26 pixels | 23 pixels |
| Word buttons | 22 pixels | 20 pixels |
| Result sentences | 20 pixels | 16.5 pixels |
| Plan names | 22 pixels | 19 pixels |
| Buttons | 24 pixels, test button 34 | 22 pixels, test button 38 |
| Small labels and progress numbers | 16 pixels | 14 to 16 pixels |

At 1024 pixels wide the new interface reduces result sentences to 18 pixels, word buttons to 20 and Florence's speech to 22. These are acceptable on a tablet that is held close.

One risk remains. The design is drawn for a stage of 1280 by 720, and `DESIGN.md` says the game should scale the whole layer. A common school laptop has a screen of 1366 by 768, and the browser's own bars leave about 650 pixels of height. If the stage is scaled down to fit, everything shrinks by about a tenth, so result sentences become 18 pixels and labels become 14. The first film's own page already does this: at 1024 pixels wide it scales the stage to 0.78, which turns its 16.5 pixel result sentences into 13 pixels. **The game should set a floor: no sentence a child must read is ever drawn smaller than 18 real pixels, and the layout should reflow before it shrinks.**

### Line length

Florence's bubble is at most 780 pixels wide, which gives about 60 characters on a line. That is comfortable. The child's sentence is 1,094 pixels wide at 26 pixels, which gives about 80 characters on a line, and the longest sentences run to three lines. Lines of that length make it easy for a weak reader to lose the place when the eye returns to the left. I recommend limiting the sentence to about 60 characters a line, which is about 800 pixels at this size. The reason buttons in level 6 are 1,094 pixels wide for the same reason, but each holds one line, so they are acceptable.

### Contrast

Every word in the new interface sits on a solid surface with a dark outline, so no text is read directly over the 3D town. This is the right decision, and it removes the largest contrast risk. The measured pairs:

| Pair | Contrast | Verdict |
|---|---|---|
| Ink on paper | 13.7 to 1 | Excellent |
| Quiet ink on paper | 7.2 to 1 | Good |
| Ink on yellow | 9.9 to 1 | Good |
| White sign on good, fair and poor marks | 5.4, 5.8 and 6.5 to 1 | Good |
| White number on the terracotta town badge | 3.9 to 1 | Passes only because it is large and bold |
| Yellow surface against paper or white | 1.4 to 1 | Too weak to carry meaning alone |
| Pale inset against paper (empty gap, button not ready) | 1.2 to 1 | Too weak to carry meaning alone |

The last two rows matter. The difference between a chosen card and one that is not chosen, and between a ready button and one that is not ready, is almost invisible as brightness. The design already adds a second signal in each case (a lifted card, a dashed outline), and those second signals must never be dropped. I would add a tick or a filled dot to the chosen card and the chosen word button as well, because "lifted by 4 pixels" is a small difference for a child with low vision.

A flag that is waiting is drawn at 55 per cent opacity over the town. Over a busy map that can fall below 3 to 1. It should stay solid and change its outline instead.

For the record, the first film's interface had three weak pairs that the new one fixes: white on the green progress dot at 3.5 to 1, white on the grey middle mark at 4.2 to 1, and the dashed line of an empty gap at 2.5 to 1.

### Florence's typing speed and the time allowed to read

The new interface types Florence's words at 32 characters a second, into a bubble that opens at its final size, and a tap shows the whole line. All three choices are right. The first film typed at 48 characters a second.

`DESIGN.md` gives the film a rule: a line stays for one and a half seconds after typing ends, plus a third of a second for each word. For Florence's longest line in Eco Town (30 words, 169 characters) that gives about 17 seconds, which is about 107 words a minute. That suits a typical reader and is too fast for a slow one. **I recommend half a second for each word, with a minimum of three seconds,** which gives about 80 words a minute. In the game there must be no timer at all on any text: a line stays until the child presses the main button.

The first film, as it is now, does not give enough time to read anything except the shortest lines. These are the speeds a viewer would need:

| Text in the first film | Words | Time on screen | Reading speed needed |
|---|---|---|---|
| The welcome | 31 | 4.8 seconds | 413 words a minute |
| Invitation, level 5 | 23 | 5.7 seconds | 256 words a minute |
| The three word buttons for one gap | 10 to 20 | 1.4 seconds before the tap | 430 to 860 words a minute |
| The whole sentence panel, two gaps | 47 to 53 | 8.2 seconds | 340 to 390 words a minute |
| Results, level 5 (nine sentences) | 58 | 8.3 seconds | 419 words a minute |
| Results, levels 2, 3 and 4 (six sentences) | 38 to 51 | 8.3 seconds | 275 to 369 words a minute |
| Florence's line after the build | 23 to 30 | 7 seconds | 206 to 269 words a minute |
| The recap question, level 4 | 16 | 3.9 seconds | 267 words a minute |

Only the three-sentence results in levels 1 and 6 (130 words a minute) and the shortest invitations come close. The film is 6 minutes 35 seconds long. At 80 words a minute it needs to be roughly twice as long, or it needs a narrator and fewer words on screen at once. I recommend the narrator: see the section on hearing.

### Choices that help children with dyslexia

The new interface already does several helpful things: a clear sans-serif face (Inter) for everything that is read, a weight of 600, left-aligned text, cream paper instead of white, a line height of 1.5 for the sentence, and no italics or capitals for running text. I recommend four more.

1. Keep Bricolage, the display face, for titles and buttons only. Plan names and the yellow place tag are set in it at 22 pixels; they are short, so this is acceptable, but nothing longer than four words should use it.
2. Raise the line height of result sentences from 1.25 to at least 1.4. They are the densest reading in the level.
3. The first film's label "YOUR SENTENCE" was in capitals with wide spacing at 14 pixels. The new interface has dropped capitals, and they should not return.
4. Speak every line aloud and light each word as it is spoken. This is the most useful single aid for a child with dyslexia, and the typing effect could become that highlight.

## 2. Colour

About one boy in twelve has red-green colour blindness, so a group of twenty-four children will usually include one.

### The result marks

The new interface gives each result a different outline: a round tick, a square dash and an eight-sided cross. This is correct and necessary, because the three colours cannot do the job alone. Green and red have almost the same brightness (a contrast of 1.2 to 1 between them), and under red-green colour blindness the distance between them falls from ΔE 96 to ΔE 11. The first film's marks were three identical circles that differed only in a 16 pixel sign; the picture `a11y-cvd-level2-results-marks.jpg` shows how alike they become.

Two details to keep. The marks are 34 pixels in the cards, 38 on the flags and 28 on a tablet; 28 is the smallest size at which the eight-sided outline still reads as different from the circle, so they should not go smaller. For a screen reader the marks carry the names Good, Fair and Poor; those names must be read before the sentence, not after it.

### The progress squares

A finished level is green with a tick, the current level is larger and yellow, and a level to come is pale. Size and tick carry the meaning, so this is safe.

### The 3D tests

This is where colour alone still carries the lesson. I measured the first film's scenes, because they are the only tests that exist. The same care will be needed when the tests move into the town on the map.

**Level 1, flood water.** The water that covers the meadow has exactly the same brightness as the dry grass beside it: the contrast is 1.01 to 1. A child tells wet from dry only by blue against green. Red-green colour blindness leaves that difference intact (ΔE 48), but blue-yellow colour blindness cuts it to ΔE 20, and the difference also fades on a dim or sunlit screen. The flood water is also almost the same colour as the river itself (ΔE 12), so it is not obvious that the water has left the river. *Fix:* make the flood read by shape and movement as well: a clear bright edge to the water that travels across the land, ripples on the surface, homes that visibly stand in water up to the windows, and a darker tone on wet ground. See `a11y-cvd-level1-flood.jpg`.

**Level 2, paths.** The sand-coloured paths on green grass keep a contrast of only 1.26 to 1, and under red-green colour blindness the distance falls from ΔE 40 to ΔE 11. In the picture `a11y-cvd-level2-walk-or-drive.jpg` the grid of paths almost disappears, and the paths are the subject of this level. *Fix:* give paths a darker kerb line on both sides or a paler, lighter surface, so that they differ from grass in brightness by at least 3 to 1.

**Levels 2 and 6, walking or driving.** People and cars are told apart by shape, which is right, and I confirmed that they share the same set of colours, so colour is not doing the work. The problem is size. All the moving figures together cover about one per cent of the screen. A walking figure is about 13 by 29 pixels and a car is about 43 by 16. On a tablet that is a difference of a few millimetres. *Fix:* draw every journey as a trail that stays on the ground after the figure has passed, dotted footprints for a walk and a solid double line for a car, and show a count beside each plan in pictures (for example seven small figures, of which two sit in cars). The answer then remains on the screen after the movement has ended.

**Level 3, pollution.** The cloud is grey against a pale sky at 3.7 to 1, and it stays the same under every kind of colour blindness (ΔE 44). The amount of pollution is shown by the size of the cloud, not by its colour. This is the best of the six tests. One weakness: the cloud is almost the same brightness as the brick oven (1.1 to 1), so it should rise clear of the building before it spreads. The cloud also drifts up behind the progress squares in the first film, and the new safe window should prevent that.

**Level 4, food and wildlife.** The meadow flowers are pink, yellow, white and purple dots about 6 pixels wide, and the bees are yellow dots about 4 pixels wide. Losing them is the result the child must notice, and it is very hard to see for anyone. *Fix:* make the wildlife large enough to count (a few big bees and birds, not many dots), and when it leaves, leave something visible behind, such as bare soil.

**Level 5, lights.** Lit and dark windows are the strongest signal in the film: 9.9 to 1, and unchanged by colour blindness (ΔE 100). The battery's lamp is a different matter. It blinks between two greens with a contrast of 2.8 to 1, and its meaning (the battery is working) exists only as a green light. The recap in this level asks the child to find what kept the lights on, so the battery must be recognisable. *Fix:* show the battery filling and emptying as a bar of blocks on its side.

**The tap ring.** The ring is a pale dashed circle with a dark line inside and outside, so it stays visible over any part of the town. It needs no change.

### A rule for the 3D artist

Every state that a child must compare (wet or dry, lit or dark, walked or driven, much or little pollution, wildlife present or gone) should differ in at least two of these: brightness by 3 to 1 or more, shape, size, pattern or movement. Colour may be the third signal, never the only one. A quick test is to look at each test in greyscale.

## 3. Motion

### Flashes

No part of the film breaks the general rule of three flashes a second over a large area, but two tests come close enough to change.

**Level 5, the failing lights.** When the solar homes lose power, their windows flicker for about two seconds. I counted up to 22 reversals at one pixel in that time, which is about five flashes a second, and the flashes are bright yellow on a dark scene (9.9 to 1). They pass only because they are small: 1.7 per cent of the screen. A child who sits close to a tablet sees them larger. *Fix:* let the lights dim and go out once or twice, at no more than two changes a second.

**Level 1, the rain.** The white rain streaks made about 6 per cent of the picture change brightness repeatedly, at up to 15 times a second, across all three pieces of land. Each streak is thin, so the brightness change is local and it is under the area limit. It is still tiring to watch for ten seconds, and it hides the water it is meant to explain. *Fix:* fewer, longer, slower drops, and stop the rain when the water has finished rising.

**The coloured wipe.** In the first film a wipe in yellow, terracotta and cream crosses the whole screen four times in each level. The average brightness of the screen goes from 0.36 to 0.96 and back to 0.72 in about one second, and four fifths of the screen changes between two frames. That is one large flash each time. `DESIGN.md` already recommends dropping the wipe, and I agree strongly.

**Night in level 5.** The whole screen darkens from a brightness of 0.72 to 0.05 over about three seconds. That is slow enough. In the first film the return to daylight happens behind the wipe in under half a second; in the new film it should also take at least one second.

**The shock wave and the confetti.** The rings that spread from the test button change about a tenth of the screen for one second, and the confetti changes very little. Neither is a flash risk. The new design drops the confetti for a different and good reason.

### Camera moves

The new design moves the camera for 1.2 seconds between steps and holds it still while the child reads or chooses. That is a good rule. The first film also let the camera drift and sway all the time behind the text, which is uncomfortable for some children and makes any tap target move. In the game the camera must be completely still whenever something can be tapped.

### A reduced-motion version

`tokens.css` already answers the device setting for reduced motion: loops and bounces stop and every part appears in its final place. This covers the interface only. The camera, the 3D tests and the film are driven by code and ignore the setting. The game needs one switch, taken from the device setting and also offered to the leader, that does all of the following.

1. Camera moves become cuts or a half-second fade.
2. The test does not animate. It shows two still pictures of each plan, before and after, with the result mark.
3. Rain, flicker, swaying, bobbing and spinning stop. Wind turbines turn slowly or stand still.
4. The word that flies to its gap appears in the gap directly.

For the film, I recommend a second cut made the same way: stills with fades, no flicker and no rain animation. It can be made from the same timeline, because every frame is drawn from a time.

## 4. Hearing

The film's sound is music, sound effects and soft blips while Florence's words appear. There is no speech, so nothing is lost by a deaf child as far as words go. I checked each sound against the picture.

| Sound | Is the same thing shown? |
|---|---|
| Taps, pops and whooshes | Yes. Each has a movement on screen. |
| Good and poor result sounds | Yes. Each lands with its mark. |
| Rain, hammering, the sawmill, the lorry | Yes, in the picture. |
| The school bell in level 6 | Only as a 12 pixel block that shakes on the roof. The bell starts the whole test, so it needs a clear picture, such as rings spreading from the bell. |
| Music that becomes quieter during a test | It carries no information. |

The new design's rule, "every sound has something on the screen that says the same thing", is correct. Its plan to give the three result sounds different pitches and the same mood is also good for children who find error sounds upsetting.

The larger issue is the opposite one. Because nothing is spoken, every child depends on reading. The original game has recorded speech, and the redesign should keep it: Florence's lines, the word buttons, the plan names and the result sentences should all be heard as well as seen. A child should be able to tap a small speaker button beside any text to hear it again. Sound must also have a volume control and an off switch that the child can reach, because classrooms are noisy and some children are sensitive to sound.

## 5. Motor

### Target sizes and spacing in the new interface

| Target | Size | Gap to its neighbour |
|---|---|---|
| Word button | 56 pixels high, 267 to 403 wide | 12 pixels |
| Main and second button | 64 pixels high, at least 150 wide | 12 pixels |
| Test button | 88 pixels high, about 320 wide | Alone |
| Yes and No | 64 pixels high, 120 wide | 12 pixels |
| Plan card | The whole card, at least 335 wide | 10 to 12 pixels |
| Flag on the town | 56 by 81 pixels | Free on the map |
| Tap ring in the recap | 104 pixels across | 90 pixels between the two closest rings in the mock-up |

All of these exceed the 44 pixel minimum, and the word buttons are a clear improvement on the first film's 45 pixels with a 10 pixel gap. No step needs a drag, a double tap, a long press or a pinch. That is exactly right, and it should be written down as a rule for all six towns.

Four things to settle.

1. **A filled gap can be tapped to change the word, and it is only 34 pixels high.** It needs an invisible tap area of at least 48 pixels, or the row of word buttons should return whenever the gap is tapped anywhere on its line.
2. **"Ask again" sits 12 pixels from "Choose this one".** A slip on "Ask again" discards the test the child has just watched. It should move away from the main button, or ask for confirmation in pictures.
3. **Two taps to choose a plan.** `DESIGN.md` asks whether tapping a card and then pressing "Choose this one" is acceptable. From an accessibility view it is better than one tap: it forgives a slip, and it gives switch and keyboard users a clear moment of confirmation. I recommend keeping it.
4. **Flags that overlap.** When plans stand close together, as the three school sites do, flags of 56 pixels can cover each other. The plan cards must always remain a second way to choose.

### Tapping a place on the 3D town

In the first film the recap asked for a tap on one spot of a moving 3D scene, and its target ring gave the answer away. The new design is much better: it puts a dashed ring of 104 pixels on each place that can be chosen, marks none of them as right, and never blocks progress. This turns a precise tap on a 3D model into a choice between a few large buttons, which is what a child with a tremor or weak fine control needs. To make it work in the game:

- The rings must be real buttons that stay still. The camera does not move while they are shown.
- Their centres must be at least 120 pixels apart. If two places are closer, the camera should pull back or turn until they separate.
- A tap anywhere inside a ring counts, and a tap outside every ring does nothing at all: no sound of failure and no hint.
- Each ring needs a name for a screen reader (the same name the yellow tag shows after the tap).

## 6. Keyboard, switch and screen reader access in the game

The mock-ups already use real button elements for buttons and word buttons, and `tokens.css` has a strong focus ring (a white ring inside a dark one, visible on any background). The remaining work is in the game.

**Keyboard.** The focus order should follow the reading order of the dock: Florence's line, then the tray from left to right, then the main button. Tab or the arrow keys move, and Enter or Space press. When a step changes, focus should move to the first thing the child can do. The top bar is not focusable. Nothing should be reachable only by pointing at the 3D canvas.

**Switch access.** A child who uses one or two switches steps through the same targets in the same order. Each screen has at most seven targets, which is a workable number. No step may have a time limit, and the game must not move on by itself while a child is scanning.

**The tap-on-the-town recap.** This was the hardest part, and the ring design solves most of it. The rings should be buttons in the focus order, taken from left to right across the screen, each with its place name as its label. When a ring has focus, the camera may centre gently on that place, and the yellow tag with the name should appear so that a sighted keyboard user knows where they are. Flags during the test and the choice work the same way, and each flag should be tied to its card so that focusing one highlights the other.

**Screen readers.** The 3D canvas says nothing to a screen reader, so the game must describe what it shows. Three things are needed.

1. Florence's bubble should be a live region, so that each new line is read once. The typing effect must not be read letter by letter: the full line should be present for the screen reader from the start.
2. When a test ends, the outcome of each plan should be announced as plan name, mark name and sentence, in that order. The storyboard already holds a description of each test in the `watch` field of the data file, which is the right source for a description of the animation.
3. Marks, flags, rings, progress squares and the gap in the sentence need names. A gap should be announced as empty or with its word.

I recommend one early trial with a real screen reader on a tablet before the first level is finished, because problems of this kind are cheap to fix early and expensive later.

## 7. Attention and memory

**One decision at a time.** The new interface shows only the word buttons for the gap that is waiting, and keeps the child's sentence in view as a flat strip while Florence thinks. Both reduce what a child must hold in mind. The first film showed everything at once.

**Three tests at once.** In the first film all three plans are tested side by side for 10.5 seconds, and nothing remains afterwards except the final picture. A child cannot watch three places at once, so two of the three stories are missed. The new design proposes to play the plans one after another on the same ground for about four seconds each, and to stamp each mark on its flag as its outcome becomes clear. I support this for attention, with two conditions. Four seconds is short: I recommend six to eight seconds each, with the plan's card lifted so that the child knows which one is playing. And the end state of each plan must stay visible, as a small picture on its card, so that the child compares three pictures instead of three memories. The design already keeps such a picture for the second try; the same device should be used for the first test.

**The longest screen.** Level 5 has three checks, so the choosing screen holds nine sentences and nine marks, and the dock covers about half the screen. This is the heaviest reading in Eco Town. The design keeps each check on the same row in every card, which helps. I also recommend that each row carries the small picture of its check, which is open decision 5 in `DESIGN.md`: without it a child must remember that the second row means nature. A child should be able to compare one row across the three cards at a time, for example by tapping a check picture to light that row.

**Knowing where you are.** The top bar gives the town, the level and progress at all times, and the main button is always in the same place. Both are valuable for children with attention difficulties, and both should be treated as fixed rules.

**Leaving and returning.** A camp session is interrupted often. The game should hold its place on every screen with no timer, and should return a child to the same step after a break.

**Praise and error.** The recap never blocks progress and marks nothing as wrong, and the new design removes confetti and scores. This is kind to anxious children and should stay.

## 8. Captions and pause controls for the film

The film's page has a Play and Pause button, a list for jumping to a part and a slider, and they are real controls with labels. Four things are missing.

1. **Keyboard control of the picture.** Space should play and pause, and the arrow keys should step back and forward by one step of the level. The slider moves through 395 seconds in a thousand parts, which is too fine for a child and too coarse for a reviewer.
2. **Captions.** All words are already on the screen, so the film needs captions only for meaningful sounds, such as the bell, the rain and the test starting. If a narrator is added, which I recommend, full captions become necessary, and a text transcript of the whole film should be published beside it. The `watch` descriptions in the data file are a good base for the transcript and for an audio description.
3. **A slower version.** The page should offer playback at half and three-quarter speed, and the film should pause by itself at the end of each level.
4. **The recorded video files.** The video files made by `record.mjs` have none of these controls. Whoever publishes them should use a player with captions, speed control and keyboard access.

The film page's note says that it "plays the pictures only". A viewer who expects sound should be told how to hear it.

## 9. The most serious barriers, in order, with the fix for each

1. **The film gives a fraction of the time needed to read.** Most text needs 200 to 860 words a minute. *Fix:* add a spoken voice for every line, hold each line for half a second a word after it is complete, show word buttons for at least four seconds before the tap, and accept a longer film.
2. **Nothing is spoken, in the film or in the design.** A slow reader, a child with dyslexia and a child who is new to English all depend on text alone. *Fix:* speech for every line and button, word highlighting, and a button to hear any text again.
3. **Four of the six tests depend on colour or on very small details.** Flood water has the same brightness as grass (1.01 to 1), paths vanish under red-green colour blindness (ΔE 11), walkers and cars cover one per cent of the screen, and bees are 4 pixel dots. *Fix:* the two-signal rule in section 2, trails that stay on the ground, and counts shown in pictures.
4. **The game has no route for keyboards, switches or screen readers through the 3D town.** *Fix:* rings and flags as named buttons in a fixed order, a live region for Florence, and spoken outcomes after each test, using the `watch` descriptions.
5. **Reduced motion covers only the interface.** The camera, rain, flicker and tests ignore the setting. *Fix:* one switch that turns camera moves into cuts and tests into before-and-after stills, and a second cut of the film.
6. **Three tests run at once and leave nothing behind.** *Fix:* play the plans in turn for six to eight seconds each and keep a small picture of each end state on its card.
7. **The failing lights flicker about five times a second, and the rain flickers over 6 per cent of the screen.** *Fix:* dim the lights once or twice at no more than two changes a second, and use fewer, slower drops.
8. **Meaning carried by yellow or by a pale tone alone is nearly invisible as brightness (1.4 and 1.2 to 1).** *Fix:* keep the lift and the dashed outline in every state, add a tick to chosen cards and chosen word buttons, and keep waiting flags solid.
9. **The level 5 choosing screen holds nine sentences with no check names.** *Fix:* put the picture of each check on its row, and let the child light one row at a time.
10. **Small or risky targets remain:** the 34 pixel filled gap, "Ask again" beside the main button, tap rings 90 pixels apart, and flags that may overlap. *Fix:* a 48 pixel tap area for the gap, move or confirm "Ask again", keep ring centres 120 pixels apart, and always allow the choice on the cards.
11. **Text may shrink on school laptops.** A screen of 1366 by 768 leaves less than 720 pixels of height. *Fix:* a floor of 18 real pixels for every sentence, and reflow before scaling down.
12. **The film has no captions for sounds, no speed control and no keyboard control of playback.** *Fix:* the four additions in section 8.

## 10. What is already right and should be protected

- Every word sits on a solid, outlined surface, never directly on the town.
- The main button is always in the same place, and there is one decision on screen at a time.
- Result marks differ in outline as well as in colour.
- No step needs a drag, a long press or a precise tap.
- The recap offers a few large rings, marks none as right, and never blocks progress.
- Florence's bubble opens at its final size, and a tap shows the whole line.
- There is no score, no timer in the game, and no sound of failure.
- Florence does not speak while a test runs.

## One note outside my aspect

The first film still shows the line stored as `helper` in the data file. `DESIGN.md` points out that it conflicts with the owner's rule about Florence, and leaves it out. I mention it only so that it is not carried into a narrated version by accident.

## Pictures

All are in `docs/redesign/design/img/`. Each shows the same frame four times: as most children see it, with two kinds of red-green colour blindness, and with blue-yellow colour blindness.

- `a11y-cvd-level1-flood.jpg`: the flood test and its results.
- `a11y-cvd-level2-walk-or-drive.jpg`: people and cars going to the shops, and the paths that fade.
- `a11y-cvd-level2-results-marks.jpg`: the first film's result marks, enlarged.
- `a11y-cvd-level3-pollution.jpg`: the pollution clouds.
- `a11y-cvd-level4-food.jpg`: the farms, the cart, the lorry and the wildlife.
- `a11y-cvd-level5-lights.jpg`: lit and dark windows at night.
- `a11y-cvd-level5-results.jpg`: the nine result sentences of level 5 in the first film.
- `a11y-cvd-level6-school.jpg`: children walking and being driven to school.
