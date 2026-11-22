# The interface of an Eco Town level

This document describes the interface that sits over the 3D town in the redesigned game. It is written for the film of the six Eco Town levels first, and for the real game afterwards. The mock-ups are in `screens.html`, and the styles are in `tokens.css`. Nothing here changes the storyboard. The order of the screens and every sentence a child reads come from `docs/redesign/wireframes.html` and `docs/redesign/wireframes-data.js`.

The pictures behind the mock-ups are real screenshots of the world map as it is today. The town in them already has its buildings, and the rain is only sketched, because the map cannot yet show an empty town or a test.

## The principles

1. **The town is where things happen, and the interface stays underneath it.** Everything the child reads or presses is in one band along the bottom of the screen, which I call the dock. The dock grows and shrinks with the step. It is lowest when the town has something to show, and tallest when the child is reading and comparing.
2. **The main button is always in the same place.** It sits at the right end of Florence's line, just above the tray. A child who has pressed "Start" once knows where "Ask Florence", the test button and "Next" will be.
3. **A hard dark shadow means "you can press this".** Buttons, word buttons and plan cards that can be chosen stand on a solid dark shadow and sink when pressed. Surfaces that only hold words, such as Florence's bubble and the top bar, have a soft shadow. A button that is not ready is flat with a dashed outline.
4. **Yellow means "this is yours".** A word the child picked, the plan the child chose, the place the child tapped, the level the child is on and the button that starts the test are yellow. Nothing else is yellow. The colour of the town (terracotta for Eco Town) is used only for the town's badge and the level sign, so it never competes with a button.
5. **A result is a shape as well as a colour.** Good is a round green tick, the middle result is a square grey dash, and poor is an eight-sided red cross. The same mark appears first in the town and then beside the sentence.
6. **One decision at a time.** Only the word buttons for the gap that is waiting are on the screen. A plan is chosen with a tap and then confirmed with the main button.

## Where each part sits, and why

The screen has three zones. The top bar is 48 pixels high and sits 16 pixels from the top edge. The dock sits 16 pixels from the bottom edge. Everything between them belongs to the town.

**The top bar** answers two questions. On the left, a pill shows the town's number and name, the words "Level 1 of 6", and the name of the level. On the right, six small squares show progress. A finished level is green with a tick, the level being played is larger, yellow and numbered, and a level to come is pale and numbered. The bar cannot be pressed, so it has the soft shadow. On a screen narrower than 1100 pixels the words "Level 1 of 6" are left out, because the squares already say it.

**Florence** stands at the bottom left, in front of the map and not on a panel. The dock leaves 116 pixels for her. She is about 200 pixels tall, which is large enough to read her face and small enough not to hide the town.

**Florence's line** is the top row of the dock. Her speech bubble starts beside her head and is never wider than 780 pixels. The main button, and a second button when there is one, sit at the right end of the same row. The map shows through between the bubble and the buttons.

**The tray** is the bottom row of the dock. It holds what the child is working on at that step: the sentence and word buttons, or the three plan cards. The three plan cards are separate surfaces, so that each one can be lifted and coloured on its own.

**The town** carries three kinds of marker. A flag with a letter stands on the place of each plan. A dashed ring marks a place that can be tapped in the recap. A yellow tag names the place the child tapped. These are the only parts of the interface that are allowed above the dock.

## How Florence appears and speaks

Florence uses the sprite sheet `florence-sprite.webp`, which has six columns and five rows. One cell is drawn at 193 by 250 pixels, and Florence herself fills about 95 by 200 pixels of it. She keeps this size through the whole level. In the first film she shrank to half size during the test, and that made her look like a decoration.

She has four poses. She waves when the town opens and on the jobs screen (frames 4 to 19). She breathes when she speaks or waits (frames 0 to 3, three frames each second). She turns and looks at the town while a test runs, while a plan is built and during the recap question (frames 20 to 29, mirrored so that she faces the town). She smiles with her eyes closed after "Yes, that is right" and when a level is finished (frame 13).

Her bubble has a tight bottom-left corner and a small pointer towards her. The bubble opens at its final size, and the words are typed into it at 32 characters each second, so the bubble never changes size while a child is reading. In the game, a tap on the bubble shows the whole line at once. In the film, a line stays for at least one and a half seconds after the typing ends, plus a third of a second for each word. When Florence has two lines in a row, the second replaces the first in the same bubble, and the buttons do not move. While she thinks, the bubble holds three square blocks that bounce one after another.

Florence never speaks while a test is running. The town has the child's whole attention then.

## Each step: what is on the screen, the camera, the motion and the sound

The camera rule is the same for every step. The **safe window** is the part of the screen from 80 pixels below the top edge down to 24 pixels above the dock. The camera puts the centre of the action in the centre of the safe window, and keeps every flag inside it. The dock heights below are measured from the mock-ups at 1280 by 720.

For the mock-ups I turned the map to look at Eco Town from the south (the angle `th` is −0.1, and `phi` is 0.9). From the map's usual angle, Studio Bay stands in front of Eco Town. From the south, the open sky at the end of the river falls behind the dock, which is the best place for it.

**The town opens.** The whole world is in view (target 4, 0, 19 at a distance of 92). A pin drops onto Eco Town in 220 milliseconds with a small bounce, and a soft "pop" sounds as it lands. Florence waves, and her bubble slides up over 380 milliseconds. I split the storyboard's opening screen into two beats, so that the welcome and the five checks do not hide the world together. On the second beat the tray rises with the five checks, each tile arriving 80 milliseconds after the one before with a light tick, and the camera begins a slow move towards Eco Town.

**The invitation.** The camera flies to the town over 1,200 milliseconds and settles on the view of the whole of Eco Town (target 0, 1.5, 9.5 at a distance of 40). The level sign arrives large in the middle of the screen with a bounce (220 milliseconds, with a low drum), stays for 900 milliseconds, and then shrinks and moves to its place under the top bar over 320 milliseconds. Only then does Florence give the job. The dock starts 575 pixels down, so the town has four fifths of the screen.

**The sentence.** The sign leaves, the tray slides up over 380 milliseconds, and the camera does not move. The gap that is waiting has a slow yellow pulse. When the child taps a word button, the button sinks over 90 milliseconds with a click, a yellow copy of the word flies to the gap along a short arc over 320 milliseconds, and the gap turns yellow with a small bounce and a higher click. The instruction line fades away after the first tap. If there is another gap, its word buttons replace the first set over 200 milliseconds. When the last gap is filled, "Ask Florence" rises from flat to raised over 220 milliseconds with a bright note. The dock starts 411 pixels down before the first tap and 444 pixels down after it.

**Florence thinks.** The child presses "Ask Florence". The tray folds down over 320 milliseconds into one flat strip that keeps the child's sentence in view, and the three blocks bounce in the bubble for about one and a half seconds with a soft ticking sound.

**Three plans are offered.** The camera moves closer over 1,200 milliseconds until the three places fill the safe window (target 0.6, 1.5, 6.6 at a distance of 31). The flags drop onto the town one after another, 250 milliseconds apart, and the card with the same letter rises in the tray at the same moment as its flag, with the same "pop". This pairing teaches that card A and flag A are the same thing. Florence then speaks her line.

**The test button.** Florence's bubble changes to the instruction, and the big yellow button arrives at the right end of her line with a bounce and a rising note. It bobs gently every 1,400 milliseconds until it is pressed.

**The test runs.** The button sinks and stays down, and a deep "thunk" sounds. Its face turns pale, and three small blocks bounce inside it for as long as the test lasts. I do not use a bar that fills, because a bar reads as a timer. At the same moment the cards fold down to their names over 320 milliseconds, the bubble leaves, and Florence turns to the town. The dock now starts 533 pixels down. When the outcome of a plan is clear in the town, its mark is stamped onto its flag over 220 milliseconds: it starts at twice its size, lands slightly small and settles. A good mark has a bright note, the middle mark a flat one and a poor mark a low one. The sounds differ in pitch, not in mood, so that no plan sounds like a mistake.

**The results.** The cards open again over 380 milliseconds. The sentences arrive one card at a time from left to right, 400 milliseconds apart, and each mark is stamped beside its sentence with the same sound as before. The dock starts 492 pixels down for one check.

**Choosing.** Florence gives the instruction. The cards turn white and gain the hard shadow over 220 milliseconds. A tap lifts a card by 4 pixels, turns it yellow and turns its flag yellow, with a click. The child can also tap a flag. "Choose this one" is flat until a card is yellow, and "Ask again" sits beside it as the white second button. With three checks the dock starts 350 pixels down, which is the tallest it ever is at this size, so the camera for levels with three checks must be set a little higher or further back.

**The reason, in level 6 only.** The tray shows the chosen plan and three wide buttons, each holding one whole sentence.

**The plan is built.** The cards that were not chosen drop away over 200 milliseconds, and the chosen card folds into a flat yellow strip. The camera moves in on the place over 1,200 milliseconds (target 3.6, 1.5, 4.6 at a distance of 24). The other two flags leave. Building sounds come from the town. There is nothing to read.

**The result.** Florence speaks. "Next" is the dark main button and "Try another plan" is the white button beside it.

**Trying another plan.** The camera returns to the view of the three places. The cards return with their results. The first plan is flat with a dashed outline and a small dark label, and the other two can be tapped. After the child confirms, the dock folds down to the two cards for these two plans, and the same test runs again in the town for the new plan only. The first plan stays as a small picture of the town at the end of its test, with its letter and its mark, so the child does not have to remember it. When the test ends, Florence asks "What changed?" and waits for two seconds. Then her next line appears, and one button rises inside each card. Each button keeps the plan it sits in, and the two look the same because neither answer is the better one.

**The recap.** The dock holds only Florence's question, and starts 609 pixels down. A dashed ring appears on every place that can be tapped, and the rings grow and shrink slowly. No ring is marked as the right one. A tap turns the ring solid and yellow with a bright note, the other rings fade, and a yellow tag names the place. If the child taps another place, Florence looks at the right place, its ring pulses faster, and nothing is marked as wrong. The question about Florence shows two large matching buttons where the main button usually is.

**The level is finished.** The camera pulls back to the whole town over 1,200 milliseconds. The square for this level receives its tick with the same stamp as a result mark and a short three-note rise, and the next square grows and turns yellow. The plan that was built keeps its yellow flag for a second, as the mark the child has left. There are no stars, points or confetti.

**The jobs screen.** This is the one screen that is read together with the teacher, so it has a full panel on the right, 560 pixels wide. The town stays in view on the left. The question for the talk sits on yellow, because it is the part the group acts on.

## The states of each part

A **main button** at rest is dark with pale words and stands 6 pixels above its shadow. Pressed, it sinks 5 pixels in 90 milliseconds. When it is not ready, it is flat and pale with a dashed outline. A **second button** is the same shape in white. The **test button** is yellow and larger than every other button. Pressed, it turns a deeper yellow, and while the test runs it stays down with a pale face.

A **word button** at rest is a white pill, 56 pixels high. Pressed, it sinks. Chosen, it stays down and is yellow. A **gap** is pale with a dashed outline when it is empty, white with a yellow pulse when it is waiting, and yellow with a solid outline when it is filled. A filled gap can be tapped to change the word.

A **plan card** has four states. When it is offered it is cream with a soft shadow and cannot be pressed. When it can be chosen it is white with the hard shadow. When it is chosen it is yellow and lifted. The plan that was tried first is flat, pale and dashed, with a dark label. A **flag** is dark with a pale letter, yellow when its plan is chosen, and it carries the result mark on its top right corner. A **tap ring** is dashed and breathing when it waits, and solid yellow when it has been tapped.

These states are shown together at the end of `screens.html`.

## Accessibility

Every button and word button is at least 56 pixels high, the main button is 64, and the test button is 88. Flags are 56 pixels and tap rings are 104. The smallest words are 16 pixels and are used only for small labels. Sentences that a child must read are 20 pixels or larger, and Florence speaks at 24.

The dark ink on cream paper has a contrast of about 13 to 1, and the ink on yellow about 10 to 1. The white signs on the three result colours are all above 5 to 1. The one weaker pair is the white number on Eco Town's terracotta badge, at about 4 to 1. It is large and bold, and it is never the only way to tell which town or level is open. Every surface is solid and has a dark outline, because the map behind it is busy and brightly coloured.

No meaning depends on colour alone. Results differ in shape and sign. A chosen card is lifted as well as yellow. The level being played is larger as well as yellow. A button that is not ready is dashed as well as pale.

When a device asks for reduced motion, the loops and bounces stop, and every part appears in its final place. Every sound has something on the screen that says the same thing. The marks carry the names "Good", "Fair" and "Poor" from the storyboard for a screen reader, and keyboard focus is shown by a white and dark double ring.

## What I checked

I rendered all thirty mock-ups with Playwright and looked at each one. A script confirmed that no part of the dock, the top bar or the panel leaves the frame, that no text is clipped, and that no button is less than 56 pixels high. I then fixed four things I saw: Florence was too small because the sprite cell has wide margins, the sentence tray was too tall, the result mark covered the letter on its flag, and the rain sketch covered the top bar.

Two limits remain. With three checks, the choosing screen fills about half of the height at 1280 by 720, and a little more on a tablet 1024 pixels wide. This happens only after the test has ended. The second limit is that the mock-ups cannot show the town empty, because the map does not have that state yet.

## What I recommend dropping from the first film

- The separate island and the three floating pieces of land for the plans. The tests should happen in Eco Town on the world map, with flags on the real places.
- The coloured wipe that covers the whole screen between steps. It hides the town at the moment the child should see it change.
- Florence shrinking to half size during the test.
- The bar that fills while the test runs, because it reads as a timer.
- The confetti at the end of the recap, because it reads as a score.
- The title card that stays in the middle of the screen, on top of the town.
- The small sizes: result sentences at about 16 pixels, word buttons about 36 pixels high and progress dots 36 pixels wide.
- "Ask Florence" in the top corner of the sentence panel, where it changes place from the other main buttons.
- The line "Florence is a computer helper. She can suggest ideas, but you must check whether they work." It is still in the data file as `helper`, and the first film shows it. It conflicts with your rule not to carry over the idea that Florence could be wrong, so I left it out of every mock-up.

## Open decisions for the owner

1. **The helper line.** Should `helper` be removed from the data file, as I have assumed?
2. **Plans that cannot stand side by side.** In the Land level the three plans are three places, so all three can be tested at once. In "Getting around" the three plans are three street layouts for the same ground. I propose that the town plays these one after another on the same ground, for about four seconds each, while the card of the plan being played is lifted and the other two are pale. The styles for this are in `tokens.css` (`is-testing` and `is-waiting`). The other choice is three small copies of the town, which is what the first film did.
3. **Two taps to choose.** I ask the child to tap a card and then press "Choose this one". This protects against a slip and lets the child see the flag light up first. The storyboard has one button on each card. Is the extra tap acceptable?
4. **The opening in two beats.** Is it acceptable to show the welcome first and the five checks second, with no change to the words?
5. **Check names on results.** Each result is a sentence and a mark, as you asked. In levels with two or three checks the rows have no check name, and the same check is always on the same row. Should each row also carry the small picture of its check from the opening screen?
6. **The neighbouring towns.** Drone City, Studio Bay and the power lines are bright and close behind Eco Town. I recommend that the map makes the other towns paler while a level is played. This is a change to the map, not to the interface.
7. **Pictures still to be drawn.** The test button needs one small picture for each level (six for Eco Town), and each of the five checks needs one. I drew the rain cloud and five simple check pictures as placeholders.
8. **Two of Florence's lines.** "Your plan works in some ways. Shall we go back and see what happens with another plan?" appears even when the child chose the plan that is good on every check. The talk question on the jobs screen asks what the child gave up. I have not changed any words. You may want to look at both.
