# School level: notes for whoever takes over

These notes were last updated on 24 November 2026, after the one round of rework that the owner allowed. Every word on the screen of this level is a placeholder.

## What works

The level plays from the job to "Play again" on both recorded paths. The steps are the kit's steps in the kit's order.

- The place is the whole valley seen from the far river bank on a bright autumn morning (`valley.js`). The town is at the left and the farms are at the right.
- The child's word lights up the part of the valley that was named. If the child asks for a school by the farms, Florence suggests three places at the farm end and the middle; otherwise she suggests the three plans of the approved wireframe. One plan is always good on the check.
- "Ring the school bell" rings the first school. The child rings the second and the third bell by hand, by clicking the bell or its sign. If the child does nothing for a minute the bell rings by itself, so nobody is stuck. Each finished morning stays on the screen as a strip with twelve badges: a shoe in a round badge for a child who walked and a car in a square badge for a child who was driven.
- The play break is the walking bus (`bus.js`). It is described in the next section.
- The town step plays the morning again with the walking bus in the child's colour, and leaves walking bus stops at the gates. "Try another plan" shows the other plan at once and keeps the first result on a sign.
- The recap is a tap on one of the three schools, and any answer goes on.
- Small things answer a tap: the ducks, the clock tower's weathercock, the park trees, the hay bales and the barn in the valley, and the grown-ups, apple trees and ducks beside the walking bus.

## The play break after the rework

The child now makes three choices of their own and does six different things with the mouse.

1. The child chooses the colour of the flag and the vests, and presses "Set off".
2. The bus stops at each gate, and the gates are no longer all the same. At some gates the child clicks the friend. At one gate the friend's school bag is still on the ground, and the child clicks the bag, which flies onto the friend's back. At one gate a puppy wants to come to school too, and the child clicks the puppy, which trots back to its grown-up. Each gate is still one click, and the yellow place is always on the thing to click.
3. After the first gates the teacher needs a helper. The child clicks any child on the bus. That child moves to the front, behind the teacher, and carries a small flag in the child's colour for the rest of the way.
4. At the fork the child chooses one of two good ways, through the orchard (an apple for everyone) or over the footbridge (the ducks follow the bus).
5. At the crossing the child presses the button and waits for the green figure with the teacher.
6. At the school every child hangs a badge, and the child drags the bell rope. The bell can be rung again, as often as the child likes, until "Next" is pressed.

The choices are seen again afterwards. In the town step and in the closing picture the helper still carries the small flag, the children hold apples and a crate of apples stands by the school gate if the bus went through the orchard, and the ducks wait by the gate if it went over the footbridge. The closing words name the apples or the ducks.

If the child does nothing for twenty seconds at any step of the walking bus, the button "Florence, please walk us there" appears at once. It goes away again as soon as the child does the step. Before the rework it appeared only after three minutes.

## The two repairs for the whole game

- The corner chip already showed 6, which is right for School, so it was left alone.
- When the level is held in a frame with `?next=` in its address, as it is inside the whole game, the last picture no longer says that this is the end of the trial level. Standing alone it still says so. This was checked with a small page that holds the level in a frame: Florence said only the sentence about the bell, and the buttons were "Play again" and "Go on".
- The closing picture no longer breaks when the whole game's check jumps to it before a plan has been chosen. It then shows the first plan.

## How to record

Run `node play.mjs <out> <width> <height> <word 0-2> <plan 0-2> <try another 0|1> <speed>` from this folder. `TIMING=1` takes no pictures and prints an estimate of the time. The two recorded paths are in `pictures/`.

In a quick check with a speed above 1, the second or third bell may ring by itself before the script reaches it, and Florence's offer to walk appears after a few seconds. The script allows for both.

## What was run in the rework, and what was not

- The good plan was recorded at 1440 by 810 with the word "between the town and the farms" (`pictures/good-plan-1440/`).
- The town centre plan was recorded at 1024 by 640 with the word "in the town", with "Try another plan" (`pictures/town-centre-try-another-1024/`).
- The third word button, "by the farms", was run for the first time, as a quick check at three times the speed at 1024 by 640, with the plan "By the farm houses" and "Try another plan" (`pictures/by-the-farms-quick-check-1024/`). Florence suggested the place in between, the place beside the orchard and the place by the farm houses. Their results were twelve, nine and six children walking, so one plan is good on the check. The run found that two name signs lay on top of each other, because the orchard is close to the place in between. The sign of the orchard now sits a little lower, on the cards and in the recap. The pictures in that folder were taken before the last two small changes (the lower sign on the cards, and the side of the gate on which the apples or ducks stand).
- In both recordings the machine was so slow that the second and the third bell rang by themselves after their minute, before the script could click them. The pictures therefore show the sign "Ring this bell" but not the bells being rung by hand, and the strips of the second and third plan are not seen filling. The test itself was not changed in this round, and the pictures of the first build, which show it, are in the history of the repository (commit `73f16c8` and before). The names of some pictures are also a step behind what they show, for the same reason.
- Not run: the way over the footbridge with the ducks in the town step and in the closing picture; "Ask again"; "Play again" in the middle of the walking bus; the button "Florence, please walk us there" being pressed; ringing the bell again after the first ring; the plan "Beside the park" and the plan "Beside the orchard" in the walking bus. The whole game's own check was not run, because it belongs to another folder.
- Sound and the smoothness of movement still could not be judged, because the recording machine draws less than one picture a second while six recordings run at once.

## What still stands in the way

- The play break still has only one choice that changes what happens on the way, the fork. The colour and the helper are personal marks. I looked for a second choice with two different results that belongs to walking to school and is safe to copy, and did not find one that I could build and check well in one round. A real candidate is letting the child place the walking bus stops, with fewer signs than gates.
- In the wide view of the valley the children and the cars are small. The helper's small flag and the apples are there, but they are tiny at that distance, and the crate or the ducks carry the mark.
- The level is still a little short. The rework adds about one minute. My estimate is seven to nine minutes on a real computer, against the ten asked for, and it has not been timed with a child.
- The outline's trodden path to the school and the grey bay for cars outside the gate are still not built.
- The camera beside the walking bus should be looked at on a real computer.

## How long it takes

The time could not be measured properly, because the recording machine was shared. Counting the lengths of the animations in the code gives about two and a half minutes of animation, about one and a half minutes of clicking and about three and a half minutes of reading for a typical child.

## What was fixed in the first build, on 24 November 2026

- The walking bus used to walk on over the road while it stopped for its last friend. The road is now well beyond the last gate, and the teacher waits a few steps back from the kerb.
- The tags of the plans and the sign "Through the orchard" no longer sit under the title in a small window.
- The pill in the top left says level 6.

## What was learned

- The recording machine draws about one picture a second or less, and under load a picture may be saved several seconds after the moment its name says. The order of the steps is still right.
- The scratch folder of the machine is shared by all the designers, so a recording folder there needs a name of its own.
- The kit was not changed. The level adds its own styles for badges and strips in `index.html`.
