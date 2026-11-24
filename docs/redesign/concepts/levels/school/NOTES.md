# School level: notes for whoever takes over

These notes were last updated on 24 November 2026. Every word on the screen of this level is a placeholder.

## What works

The level plays from the job to "Play again" on both recorded paths. The steps are the kit's steps in the kit's order.

- The place is the whole valley seen from the far river bank on a bright autumn morning (`valley.js`). The town is at the left and the farms are at the right.
- The child's word lights up the part of the valley that was named. If the child asks for a school by the farms, Florence suggests three places at the farm end and the middle; otherwise she suggests the three plans of the approved wireframe. One plan is always good on the check.
- "Ring the school bell" rings the first school. The child rings the second and the third bell by hand, by clicking the bell or its sign. If the child does nothing for a minute the bell rings by itself, so nobody is stuck. Each finished morning stays on the screen as a strip with twelve badges: a shoe in a round badge for a child who walked and a car in a square badge for a child who was driven.
- The play break is the walking bus (`bus.js`). The child chooses the colour of the flag and the vests, clicks each friend at a gate, chooses one of two good ways at a fork (through the orchard, where everyone gets an apple, or over the footbridge, where the ducks follow the bus to school), presses the button at the crossing and waits for the green figure with the teacher, and drags the bell rope. The length of the bus follows the plan. After three minutes Florence offers to walk the rest of the way.
- The town step plays the morning again with the walking bus in the child's colour, and leaves walking bus stops at the gates. "Try another plan" shows the other plan at once and keeps the first result on a sign.
- The recap is a tap on one of the three schools, and any answer goes on.
- Small things answer a tap: the ducks, the clock tower's weathercock, the park trees, the hay bales and the barn in the valley, and the grown-ups, apple trees and ducks beside the walking bus.

## How to record

Run `node play.mjs <out> <width> <height> <word 0-2> <plan 0-2> <try another 0|1> <speed>` from this folder. `TIMING=1` takes no pictures and prints an estimate of the time. The two recorded paths are in `pictures/`.

In a quick check with a speed above 1, the second or third bell may ring by itself before the script reaches it. The script allows for that.

## What is left, and what is weak

- In the wide view of the valley the children and the cars are small. The badges on the strips carry the answer, but the queue of cars is not striking.
- The play break has six clicks on friends in a row when the school is in the middle. Only the fork is a real decision.
- The mark of the fork (apples or ducks) is not shown again in the town step or the closing picture.
- The outline's trodden path to the school and the grey bay for cars outside the gate are not built.
- Sound could not be judged on the recording machine, and neither could the movement of the camera beside the walking bus, because the machine draws about one picture a second. In one recorded picture (`bus-way-a` at 1440 by 810) the camera had not caught up with the bus. This should be looked at on a real computer.

## How long it takes

The time could not be measured properly, because the recording machine was shared and drew about one picture a second. Its estimate was 13 to 16 minutes, but most of that was the machine waiting. Counting the lengths of the animations in the code gives about two minutes of animation, about one minute of clicking and about three minutes of reading for a typical child, so the level probably takes six to eight minutes on a real computer. That is a little short of the ten minutes asked for, and it should be timed with a child.

## What was fixed on 24 November 2026

- The walking bus used to walk on over the road while it stopped for its last friend, so the teacher and the children stood on the road with cars passing. The road is now well beyond the last gate, and the teacher waits a few steps back from the kerb, so the button on the crossing can be seen and nobody is on the road before the green figure shows.
- The tags of the plans and the sign "Through the orchard" no longer sit under the title in a small window.
- The pill in the top left now says level 6.

## What was learned

- The recording machine draws about one picture a second, and under load a picture may be saved several seconds after the moment its name says. The order of the steps is still right.
- The kit was not changed. The level adds its own styles for badges and strips in `index.html`.
