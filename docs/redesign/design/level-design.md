# Eco Town: a level design review of the six levels

This review was written on 22 November 2026 for the lead who is building the animated film and, later, the game. It looks at the six Eco Town levels as they stand in `docs/redesign/wireframes-data.js` (which is identical to `docs/redesign/animation/words.js`), and at how the film draws them in `docs/redesign/animation/eco.js`, `town.js` and `film.js`. I checked the `words` collection of the artifact database before starting, and it holds no edits by the owner, so the file is the current wording.

I have not changed any file, and I have not written or reworded any sentence that a child reads. Where a sentence needs to change, I say what is wrong with it and what the new sentence has to achieve. I have treated the owner's rules in `CLAUDE.md` as fixed. Where a recommendation would touch one of those rules, it is kept out of the main lists and put in the last section, for the owner to decide.

The timings in this review are my own estimates from the amount of reading and tapping on each screen. They have not been measured with children.

## The five findings that affect every level

### 1. The game does not yet say what the child's sentence does

This is the most important gap in the design. In four of the six levels (Land, Food, Power and School), the word buttons in the first gap are the same three things as Florence's three plans. In Land, for example, the buttons are a bank beside the river, far away from the river, and high up and far away, and the plans are the riverside bank, the far meadow and the far hill. The child therefore chooses the plan inside the sentence, and Florence then offers all three plans anyway, including the two that the child did not ask for.

The data holds only one set of plans for each level, so nothing is defined for a child who taps a different word. Three things follow from this. The word buttons have no effect that a child can see, so they are not yet a real decision. The "Ask again" button on the choose screen leads back to a sentence that cannot change anything. And in the levels with two gaps, Florence offers plans that contradict what the child has just asked for. In Food, the sample child asks Florence to keep all of the trees and flowers, and her first plan puts the farms on the wild meadow.

The design needs one rule for what the sentence does, and I recommend this one. The plan that matches the child's words is shown first and is marked as the plan that the child asked for. Florence then adds two different plans to compare it with. The sentence becomes the child's own prediction, and the test shows whether the prediction was right. A child who asks for the riverside bank sees their own idea fail in the rain and can then choose another plan, so there is no dead end and no free play. This rule fits the existing plans in Land, Food, Power and School without new plans. It needs a small table for the two-gap levels, which says which plan each pair of words leads to. It also needs every word button to lead somewhere: in School, the button for a school by the farms has no plan behind it today.

For the film, the sample child's words should appear on the card of the plan that they match, so that a viewer can see the link between the sentence and the plans.

### 2. The best plan is the third plan in four of the six levels

The sample child's choice, which is also the plan that is good on every check, is the third plan in Land, Getting around, Power and School. It is the first plan only in Homes and the second only in Food. A child will learn to tap the right-hand card. The order of the plans should be mixed in the data, or mixed by the game each time, and the film should show the mixed order.

### 3. Three tests at once are hard to watch, and the ticks can be read without watching

The film runs the test on all three models at the same moment for about ten seconds. A child of eight cannot follow three moving scenes at once. Because one plan always has a tick on every row, a child can also choose by finding the card with only ticks, without looking at the town at all.

I recommend that one press of the test button plays the three plans one after another, for about six to eight seconds each, while the other two models are dimmed. Each model then stops on a picture of its outcome, such as the wet homes, the cars on the road or the dark windows. The sentences and the ticks should appear only after all three have played. This keeps the owner's standard of one press, and it makes the answer visible at a glance because the three stopped pictures sit side by side.

In the film, the results stay on screen for under seven seconds. That is enough for the three sentences of Land. It is not enough for the nine sentences of Power. The time should grow with the number of sentences, or the rows should light up one at a time.

### 4. "Try another plan" replays something the child has already seen

The first test already shows all three plans. When the child presses "Try another plan", the same test runs again for a plan whose result is already on the screen, so nothing new is learned. The second try becomes worth doing if it happens in the child's real town, not on the small test model. The chosen plan is built into the town, and a second plan swaps into the town in its place, with the test running there at full size. The small picture of the first result then has a purpose.

There is also a problem with Florence's line on the result screen. It tells every child that their plan works in some ways and invites them to try another. When the child has chosen the plan that is good on every check, the line is untrue and it nudges the child towards a worse plan. That line belongs to the owner, so it is listed in the last section.

### 5. The recap asks about things that may not be in the child's town

The recap is answered by tapping the town, but the town at that moment holds only the plan that the child chose. Getting around and School ask the child to point to a plan, and the other plans are no longer on the screen. Homes asks for the sawmill and Power asks for the battery, and neither exists if the child chose a different plan. In Getting around two plans fit the question, because everyone also walked in the grid of streets.

Each recap should follow one of two patterns. It can be asked on the three stopped test models, brought back for a moment, when the question compares plans. Or it can ask about something that is in the town whichever plan the child chose. The film currently taps the island in every level, so the lead should decide this before animating the recaps.

## Level 1, Land

The word buttons are a fair first decision. The context line tells the child that heavy rain is coming, and a child can reason that high ground is safer than low ground. The option that the sample child picks names both good properties at once, so the answer is easy to see before the test. That is acceptable in the first level, whose real job is to teach the steps.

The three plans are clearly different, and "Make it rain" tests exactly the goal of the level. The far meadow is the best moment of the level, because a child expects distance to be enough and then sees the water reach the homes. The models already show the heights correctly: the bank is raised, the meadow is low and the hill is high.

My recommendations for this level are these, in order of importance.

1. The riverside bank is rated with a dash, but the film tips two of its homes over and sinks them into the river. A child will read homes falling into a river as worse than homes that got wet. Either the picture should show mild damage, with the bank crumbling and the homes still standing, or the rating should become a cross. The picture and the mark must agree.
2. The four first homes that this level leaves on the hill are removed in level 3, when the timber homes replace them. The child's first mark on the town should not disappear. The first homes and the town sign should stay for the whole hour, and level 3 should add homes around them.
3. The low meadow that the child did not build on should stay visible as open land. It can then become the wild meadow of level 4, which gives the child a reason to remember their first choice.
4. Florence says afterwards that people have a longer walk down to the water. That cost is never shown. It should either be shown for a moment in the town or be left out.

This level should leave the town sign, the first homes on the chosen site, and the empty low land beside the river.

## Level 2, Getting around

This is the strongest level of the six. The goal has two parts, walking and space for nature, and both are fixed in the sentence, as the owner's rule asks. The loop with green space in the middle looks attractive before the test and then fails, which is a real discovery. The plan with paths across the park is good on both checks, but a child has to watch the test to be sure of it.

The word buttons are weaker than the plans. One path option, beside the busy road, is plainly bad, and the context line says nothing that helps with the question of where the park goes.

My recommendations for this level are these, in order of importance.

1. In the loop plan, the model shows open grass and scattered trees in the middle. A child will ask why people do not simply walk across the grass to the shops. The middle should be drawn as thick woodland with no way through, so that the missing path is clearly the reason why people drive.
2. "Open the shops" tests the walking. The loss of trees in the grid plan is not part of the test. It is only a difference in how the models are drawn. The trees should be seen to come down as the grid appears, so that the cross for nature matches something the child saw.
3. The question about Florence at the end asks whether she included everything that the child asked for, and the expected answer is yes. Two of her three plans did not include it, so the question is only true of the chosen plan. It should say which plan it is about. This is also listed for the owner, because the question was agreed with the owner.
4. The film's town has no shops. The test, the result sentence and the School level all refer to the shops, so the build for this level should add a shop building.

This level should leave the road around the outside, the park with its trees, the paths across it, the shops, and people strolling on the paths for the rest of the hour.

## Level 3, Homes

This is the weakest level, because its three parts are about three different things. The sentence is about where the homes stand on the hill and which way the windows face. Florence's plans are about timber, brick and concrete. The test is about pollution from making the materials. The goals fixed in the sentence are staying warm, using little energy and lasting a long time, and the test button tests none of them.

The word buttons are a good decision in themselves. The context line says that winters are cold, and a child can reason about the sunny side of a hill and windows that face the sun. The trouble is that the choice has no effect on the plans or on the test, so the child's reasoning is never rewarded. The row for staying warm has a tick for all three plans, so it does not help the child to choose, and nothing on the screen shows warmth. The goal of lasting a long time is never mentioned again. The test itself shows three sizes of cloud, and most children will guess before pressing the button that wood is cleaner than cement, so there is little to discover.

My recommendations for this level are these, in order of importance.

1. The sentence, the plans and the test must be about the same goal. Two ways of doing this are set out in the last section, because both change words that the owner agreed.
2. If the row for staying warm stays, the test needs a second part that shows it. After the materials are made, the homes should be built on the model and a cold night should fall, with the windows glowing where the homes stay warm. The child's own words, the sunny side and the windows facing the sun, should be visible on all three models at that moment.
3. The goal of lasting a long time should be tested or taken out of the sentence.
4. The sawmill is said to run on electricity, but the town has no power until level 5. Children will ask where the electricity comes from. A small detail on the model, such as a water wheel or a solar panel on the sawmill roof, would answer it. The film's sawmill already has a small yellow panel, which should be made large enough to read.

This level should leave homes for the forty families in the colour of the chosen material, and the workshop that made them. If a child chooses brick or concrete, a thin haze should stay above that workshop, so that the choice leaves its mark.

## Level 4, Food

This level is the one where a child is most likely to be bored. It has the same shape as level 2, with one plan that fails on nature, one that fails on the second check and one that is good on both. The names of the plans also give the answer away. The sentence asks for farms that are close to the town and that protect wildlife, and the middle plan is named as open land close to town. A child can choose correctly without pressing the test button.

The second gap is not a real decision either. Keeping all of the trees and flowers is plainly better than the other two options when the goal in the sentence is to protect wildlife.

The note in the wireframes says that level 4 is where a third check first appears, but Eco Town has only two here, so the difficulty does not rise at the point where the routine has become familiar.

My recommendations for this level are these, in order of importance.

1. The plans should be named after places that the child can see on the map, and not after the two properties that decide the result. The child then has to look at the land to judge what is near and what is wild, and the test confirms or corrects that judgement.
2. In the film, the bees leave the meadow as soon as the first plan appears, before the test starts. The loss of the meadow should happen inside the test, so that the child's button press causes it.
3. The test shows distance, but the result sentences are about fresh food. A cart that arrives quickly and a lorry that arrives late show how far the food travelled. They do not show freshness. The market stall should show the difference when the food arrives, for example by filling up early in one model and late in the other.
4. This level has a question about Florence and no question that is answered by pointing. The answer to the question is always yes, so it asks nothing of the child. A question answered by tapping the place where the bees still live would use what the child watched.
5. The second gap needs options that a child can weigh against each other, where each one gives something and costs something.

This level should leave the fields, the farm houses, the market stall, the cart going back and forth, and the bees and flowers on the meadow. If the child chose the meadow, the bees should be gone from the town for the rest of the hour. If the child chose the far land, a lorry should run on a long road.

## Level 5, Power

The idea is right for the fifth level, because the outcome changes over time: day turns to night, and some plans stop working. The picture of a town going dark is the clearest test picture of the six.

The test does not, however, show why the best plan is the best. The context line says that the wind still blows, so the wind farm keeps the lights on as well as the mixed plan does. The only thing that separates the two is a dash for birds, and the test does not show birds. The row for clean air has a tick for all three plans, so three of the nine result sentences give the child nothing to choose with. The recap asks what kept the lights on after sunset and expects the battery, but in that plan the turbines were turning as well, so the turbines are an equally fair answer.

In the word buttons, the second gap offers wasting the spare power and switching the power off at night, and neither is an option that a child would weigh seriously. The first gap is the same three things as the plans.

My recommendations for this level are these, in order of importance.

1. The test should show the weakness of each source in turn within the one press. The sun goes down and the solar roofs stop. Then the wind drops and the wind farm stops. The plan with the battery stays lit. Each part of the best plan would then be seen to do its job, and the recap would have one clear answer. This changes the context line and one result, so it is in the last section.
2. If the wind keeps blowing, the test must show the birds, because they are then the only reason to prefer the mixed plan. Birds should be seen crossing the hill, and the four turbines of the wind farm should be seen to stand in their way.
3. A row on which every plan has a tick should not be shown as three sentences. One line for all three plans would carry the same message, that every plan here is clean, and it would cut the reading by a third.
4. The check is called Staying warm, the result sentences are about lights, and Florence's remark afterwards is about warm homes. Lights are what a child can see, so the level should talk about one thing throughout.

This level should leave the turbines, the solar roofs and the battery. After this level, each later level should end with a short moment of dusk in which the windows light up, so that the child sees their power plan working again.

## Level 6, A school for everyone

The last level is the easiest of the six, and it should be the fullest. It has one gap, one check and three plans that are simply ranked from worst to best. The job text says that some families live in the centre and some live out by the farms, and one plan is named as being between the town and the farms. The answer is clear before the sentence is finished.

The reason step does not ask for a reason. Two of the three reasons describe other plans, one beside the shops and one beside the park, so only one reason can go with the plan that the child chose.

My recommendations for this level are these, in order of importance.

1. The test should run in the child's own town, not on a separate model. The children should leave the homes that the child chose in level 3, walk along the paths that the child chose in level 2, and the farm children should come from the farms that the child placed in level 4. The last level then gathers up the whole hour, and the earlier choices are seen to matter. This is the largest single improvement available to the finale, and it conflicts with no rule.
2. The plans should be named after landmarks in the child's town, and not after the middle position. The child then has to look at where the homes and the farms are.
3. The town children and the farm children should be easy to tell apart, by colour or by where they start. The lesson of the level is that the result depends on which child you are, and the child should be able to see both groups.
4. The three reasons should all be true of the chosen plan, and should differ in what the child cares about most. The teacher then has real differences to talk about afterwards.
5. A second check would restore the difficulty that level 5 reached. That touches a decision by the owner, so it is in the last section.

This level should leave the school with its bell and flag, and children walking to it along the paths. The hour should then end with a slow flight over the town that visits the six marks in order, before the screen about jobs.

## How the levels build on each other

The number of gaps across the six levels is one, two, two, two, two and one. The number of checks is one, two, two, two, three and one. Difficulty therefore rises to level 5 and then falls sharply at the finale. The steps are the same in every level, which is the owner's design, so novelty has to come from what the child is asked to notice. At present it comes only from a change of subject.

I recommend that each level asks the child to notice one new kind of thing, as follows.

1. In Land the child notices a single outcome that shows at once, which is whether the homes are wet or dry.
2. In Getting around the child notices two outcomes together, one that moves and one that does not.
3. In Homes the child compares amounts, not a yes and a no.
4. In Food the child notices something that is lost and something that arrives late.
5. In Power the child notices an outcome that changes as time passes.
6. In School the child notices that the outcome is different for different people, and sees it in the town that they built.

The levels should also hand things on to each other. The low land of level 1 becomes the meadow of level 4. The paths of level 2 carry the children of level 6. The homes of level 3 are the windows that light up in level 5. The film's town already does some of this, and it should be made deliberate.

The game will need the town to look different for every choice, which is eighteen marks across the six levels. The choice in level 1 moves the whole town, so I recommend one town layout that can stand on any of three pads of land. Three separate layouts would cost far more.

## Pacing for the hour

For a child of nine or ten, I estimate the steps of one level as follows. The invitation takes about half a minute. Building the sentence takes about three quarters of a minute with one gap and a little over a minute with two. Reading Florence's three plans takes about three quarters of a minute. The test takes about half a minute if the three plans play in turn. Reading the results takes from half a minute in Land to a full minute in Power. Choosing takes about twenty seconds. Watching the town change and reading Florence's remark takes about forty seconds, and the recap takes about half a minute. That is between four and a half and five and a half minutes for a level, and about a minute and a half more if the child tries another plan.

Six levels therefore take about thirty minutes without second tries and about forty with them. The opening takes about three minutes and the jobs and the talk take about seven. A typical child will fill forty to fifty minutes. A quick reader of eleven or twelve will finish the six levels in about twenty-five minutes and will have a quarter of an hour with nothing to do. A slow reader of eight will be near the hour.

The hour is therefore somewhat underfilled for older children. Playing the tests in turn, running the last test in the child's own town and adding the flight over the town at the end would add about five minutes of time that is worth having. Anything larger is a decision for the owner and is in the last section.

A child is most likely to be lost at four points. The first is the opening screen, which explains five checks before anything has happened. The second is Homes, where the sentence and the plans do not connect. The third is the nine result sentences of Power. The fourth is the two questions about Florence, which do not say which plan they mean. A child is most likely to be bored in Food and in School, in any second try, and on the rows where every plan has a tick. The job text is also long and ends with the same two sentences in every level, so by level 3 children will stop reading it. The new part of the job should stand out from the part that repeats.

## Recommendations that need the owner's decision

Each of these touches a rule or a wording that the owner has already set. I am not arguing against the rules. I am pointing out where two of them pull against each other, or where a test that the owner agreed does not meet the owner's own standard.

1. **What the sentence does.** The rule I recommend marks one of Florence's plans as the plan that the child asked for. The flow chart says that none of the plans is marked as the right one. A mark for what the child asked for is not a mark for the right answer, but the owner should confirm that the two are different in their eyes.
2. **Homes: the test does not test the goal.** The owner's standard says that the test button tests the goal of the level, and the owner agreed "Make the materials". The goals fixed in the sentence are warmth, low energy and a long life. There are two ways through. In the first, the goal in the sentence becomes low pollution from building, the gaps are rewritten to fit, and the test stays as it is. In the second, the sentence stays, and the one press shows the materials being made and then a cold night, with the three plans made different in how warm they stay. Both need new sentences for children.
3. **Power: the wind.** The context line says that the wind still blows. I recommend that the wind drops during the test, so that the battery is seen to be needed. The wind farm would then no longer be good at keeping the lights on, and the context line would have to change.
4. **School: a second check.** The owner decided that this level is about walking and not about flooding. A second check that is not flooding, such as whether the school takes land from the park that the child kept in level 2, would make the finale as demanding as level 5. The owner may prefer to keep the single check and rely on running the test in the child's own town.
5. **The question for the talk at the end of the hour.** It asks what the child gave up. Since the owner's rule that every level has a plan that is good on every check, a child who chooses well gives nothing up, so the question has no answer for that child. Either the question should change, or the best plan in each level should carry a small cost that the child can see.
6. **Florence's line on the result screen.** It tells every child that their plan works in some ways. It should be different when the child has chosen the plan that is good on every check. The line came from Oliver's feedback and the owner approved it.
7. **The riverside bank in Land.** If the picture stays as the film draws it, the rating should become a cross, which changes the result data that the owner has seen.
8. **Rows where every plan has a tick.** Showing one line in place of three in Homes and Power changes the result sentences.
9. **The two questions about Florence.** They were agreed with the owner. They always have the answer yes, and they sit close to the idea of checking whether Florence was wrong, which the owner asked not to carry over. They could name the chosen plan, or they could be replaced by questions that are answered by pointing.
10. **The five checks on the opening screen.** The owner approved the heading and the list. I recommend that each check is introduced in the level where it is first used, so that the opening has less to read.
11. **Filling the hour for older children.** The owner has declined optional extra challenges for now. The other ways to fill the time are moments where the game waits for the teacher so that the class can talk before a test, or accepting that the six levels take about forty minutes and giving the rest of the hour to the talk and to the break game that is already planned.
