# Eco Town redesign: playtest predictions and test plan

*Written on 22 November 2026 by the playtest and user research review. Nothing in the game, the wireframes or the film was changed to write this.*

## 1. What this document is, and how far to trust it

This document predicts where children aged 8 to 12 will struggle with the six redesigned Eco Town levels. It then sets out how to test those predictions, first with the animated film and later with one playable level.

Every prediction here is a prediction and not an observation. No child has yet seen the redesign. The evidence I have used is of four kinds, and I name the kind beside each prediction.

- **Child evidence.** There is one session only: a parent played the earlier game with his eight-year-old daughter (`docs/feedback/2026-11-16-ecotown-parent-and-child-age8.txt`). It is one child, on a different design, so it is a pointer and not proof.
- **Colleague evidence.** This is the feedback from Oliver and Astra on the wireframes, and from Alan on the earlier game.
- **Design evidence.** This is what I found by reading the words in `wireframes-data.js` against the pictures and timings in `animation/film.js` and `animation/eco.js`. Where the words and the picture disagree, that is a fact about the design, even though the child's reaction to it is still a prediction.
- **Age-group evidence.** This is what is generally known about how children of this age read, tap and reason. I have not looked anything up for this report, so treat these as a practitioner's working knowledge.

I give each prediction a confidence of high, medium or low. High means I would be surprised if a test of eight children did not show it.

## 2. The predictions, ranked by the harm they would do if true

The order is by harm to the purpose of the game, and not by how likely each one is.

**1. Children will choose by counting ticks, and will not need to watch the test.** Every level has one plan with a tick on every line, and the sample child always chooses it. A child can ignore the town, wait for the cards and pick the column with no cross. If this happens, the test button is decoration and the level teaches nothing about floods, walking or power. Confidence: high. Evidence: design (the owner's rule that one plan is good on every check), child (the eight-year-old kept asking "is that right, do you think?", which is a child looking for the approved answer) and age group.

**2. The word buttons will feel as if they do nothing, so the lesson about asking an AI well is lost.** In the wireframes Florence offers the same three plans whatever the child puts in the sentence. In Land the child asks for land "high up and far away" and Florence still offers a town right beside the river. In Homes the child chooses the sunny side of the hill and windows facing the sun, and Florence answers with timber, brick and concrete, which is a different subject. The design does not yet say what happens when a child taps a poor word. Confidence: high that older children notice, medium for eight-year-olds. Evidence: design, and Oliver, who called the old Food level "the best example of the intended AI interaction" because adding detail changed the suggestions. That step has since been removed.

**3. Six levels will not fill an hour.** Each level asks for about seven taps. The film plays a level in one minute. I expect a real child to take two to four minutes, which gives 12 to 25 minutes for the town. Confidence: medium. Evidence: child (the eight-year-old had unlocked everything in the old game after about 30 minutes, and that game had free building to absorb time) and design.

**4. Children will find the levels the same by the third or fourth one.** The steps are identical in every level, and the child's one physical act in the test is a single press. A different label on the button is not a different activity. Confidence: high for twelve-year-olds, medium for eight-year-olds. Evidence: child (the eight-year-old lost interest in the challenges because "it's very similar"), colleague (Alan and Astra both raised repetition; Oliver asked for a different activity in each level) and design.

**5. Eight-year-olds will not be able to read the screens at the pace or size the design assumes.** The film has no spoken voice, only blips. The Power level shows nine result sentences, 58 words, for about nine seconds. Word buttons appear for 1.4 seconds before one is chosen. The result text is 16.5 pixels high on a 1280-pixel frame. Confidence: high for the film, medium for the game, where the child sets the pace. Evidence: child (the eight-year-old "didn't understand some of the written instructions" and asked "what do I actually have to do?") and age group.

**6. In Homes, children will not be able to say what the level was about.** The invitation is about cold winters and staying warm. The word buttons are about sun and wind. The plans are about materials. The test is about pollution from making the materials. The "Staying warm" line is a tick for all three plans and is never shown happening. Confidence: high. Evidence: design.

**7. In Homes, children will argue that cutting down trees cannot be the cleanest choice.** The level before it gave a cross to "Most of the trees were cut down." Children of this age hold firmly that felling trees is bad. The town's description also says the sawmill "causes no pollution" while the result says "the least pollution". Confidence: high for twelve-year-olds, medium for eight-year-olds. Evidence: design, age group, and Oliver's warning that the environmental explanations in this level "need to stay accurate and simple".

**8. In Power, a correct child will be told nothing useful, or will tap a different right answer.** The recap asks what kept the lights on after sunset, and the sample answer is the battery. The invitation says the wind still blows, the wind farm plan gets a tick for the same test, and the turbines in the chosen plan are turning. A child who taps a turbine has reasoned well. Confidence: high. Evidence: design, and Oliver's point that a battery stores power and is not a source.

**9. Many children will not see a car journey or a lorry as a bad result.** Getting around, Food and the School all rest on the child reading "took their cars" or "driven a long way" as the worse outcome. Many children are driven everywhere, lorries are exciting, and boxed, chilled food is the only food most of them know. Confidence: medium. Evidence: age group and design (the reason is only given in words after the School level).

**10. The dash will be misread, most of all in Land.** In Land the homes beside the river tilt and sink into the bank, which is the most dramatic picture in the level, and they receive a dash, while the meadow homes that only get wet receive a cross. Confidence: high for Land, medium elsewhere. Evidence: design and age group (young children sort outcomes into good and bad, and a middle mark needs teaching).

**11. Children will conclude that Florence gives bad ideas.** Two plans in three fail in most levels, and the opening line says the child "must check whether they work". The owner has decided not to teach that Florence could be wrong, but the level structure teaches it anyway. Confidence: medium. Evidence: design and the owner's own decision.

**12. "Try another plan" will be used by few children, and will mislead those who use it.** A child who has chosen the plan with every tick has no reason to try another, and Florence's line that the plan "works in some ways" is untrue of that plan. Confidence: medium. Evidence: design. The film does not show this path at all, so the film cannot test it.

**13. The closing discussion question has no answer.** It asks what the child gave up when making the hardest choice. With a plan that is good on every check, the child gave up nothing. Confidence: high. Evidence: design.

**14. The School level will feel like Getting around again, and too easy for a finale.** It has one gap and one check, and its test is the same walk-or-car picture as level 2. Confidence: high for twelve-year-olds. Evidence: design and child.

**15. Children who want to build will feel shut out.** The eight-year-old's happiest time was building her own town. The redesign has no free play. The visible mark each choice leaves on the town may be enough, or it may not. Confidence: low to medium. Evidence: child, against the owner's and Alan's considered decision to put Florence first.

## 3. A walk through each level

For each level I describe an eight-year-old and a twelve-year-old. The eight-year-old reads slowly, taps early and decides from pictures. The twelve-year-old reads everything quickly, looks for the trick and gets bored when there is none.

### Steps that are the same in every level

**The invitation.** The eight-year-old will read the first few words and tap. That is acceptable where the line is short (Land has ten words) and a problem where it is long (Power has 23 words and carries the fact that decides the level). The first-screen job text, which says to ask Florence and then test, is 27 to 45 words long and I expect almost every eight-year-old to skip it. Confidence: high. Evidence: child and age group.

**The sentence.** The fixed part of the sentence is long (20 to 32 words) and the gap comes at the end. The eight-year-old will read only the buttons and tap the first or the longest one. Tapping order matters: where the best option is last (Land, and the second gap of Getting around and of Homes), a first-button tapper gets it wrong and nothing visible follows. The twelve-year-old will see at once that some options are silly ("waste the spare power", "switch the power off at night") and will either feel talked down to or tap the silly one on purpose to see what happens. The design must have an answer for that tap. Confidence: medium.

**Florence's plans.** Three plans appear at once, each with a name and a description. The eight-year-old will look at the pictures and not the descriptions. The twelve-year-old will ask why Florence offered a plan that plainly ignores the sentence. Confidence: medium to high.

**The test button.** I expect this to be the best-liked moment for both ages. It is large, it has a verb, and something happens. The risk is the opposite of skipping: children will want to press it again and again, and may be disappointed that it runs once. With three plans running at the same moment, the eight-year-old will watch one plate, usually the one with the most movement, and miss the other two. Confidence: medium. Evidence: child (she said "yay" when the bees returned, so visible events land) and age group.

**The result sentences.** These arrive after the test, all together. Both ages will look at the marks and not the words. Confidence: high.

**The choice.** The eight-year-old picks the column of ticks or the picture she likes. The twelve-year-old picks the column of ticks in under two seconds.

**The town changes.** I expect this to be liked. The eight-year-old's earlier complaint was that Florence's plan "didn't seem to drastically change her town". A clear build is the answer to that. Florence's sentence that follows is 23 to 30 words and will be skipped by the eight-year-old.

**The recap.** "Point to it" is a good, low-reading task. The difficulty is that the question often refers to the three plans ("Point to a plan where…") when only the built town is on screen. Children will not know whether to tap the town, the remembered plan or Florence.

### Level 1, Land

*Eight-year-old.* She will understand the job. Near water means wet is the rule she already holds, so the meadow flooding while it is "a long way from the river" will surprise her. That surprise is the lesson, and it will only work if the picture makes height obvious. She is likely to tap "far away from the river" because it sounds safe, and she will not learn from it because Florence's plans do not change. She will read the tilting homes as the worst result and be puzzled by the dash. Confidence: medium to high.

*Twelve-year-old.* He will notice that the three word buttons are the three plans, so the question is answered before the test. He will pick the hill and be right, and the test will confirm what he already knew. He may find it too easy, which is acceptable for a first level if later levels are harder. They are not much harder.

*Dull or lively?* Lively. Rain and rising water are easy to enjoy.

### Level 2, Getting around

*Eight-year-old.* Two gaps double the reading. "Long and winding" sounds pleasant and she may choose it. In the test she will enjoy the people and the cars, and may prefer the plate with cars because cars are more interesting to watch. Two plans both have a tick for walking, so the choice depends on the trees line, which she must read. Confidence: medium.

*Twelve-year-old.* He will ask why Florence offered "One winding loop" when he asked for short and direct paths. If the game then asks "Did Florence include everything you asked for?" and expects yes, he will disagree, and he will be right about two of the three plans. Confidence: high.

*Dull or lively?* Fairly lively, because many small figures move.

### Level 3, Homes

*Eight-year-old.* She will be told the level is about staying warm and will then watch clouds come out of chimneys. She will choose correctly, because the timber plate has no cloud, but when asked afterwards what the test was for I expect "smoke" or "I don't know" and not "staying warm". The words "materials" and "pollution" are both hard for a weak reader of eight. Confidence: high.

*Twelve-year-old.* He will challenge the timber result, as in prediction 7. He will also notice that "use little energy" and "last a long time" are in the sentence and are never tested.

*Dull or lively?* The cloud is clear at a glance, which is its strength. Nothing moves in the homes themselves, so it is the stillest test of the six.

### Level 4, Food

*Eight-year-old.* She will care about the bees. In the film the bees leave the meadow plan as soon as the plan appears, before the button is pressed, so the button she presses does not cause the thing she cares about. The cart against the lorry will not read as good against bad without help. The recap is a yes-or-no question with two parts and a "not" in it, which is the hardest sentence in the town for this age. A yes-or-no tap is also right half the time by chance, so it tells an observer nothing. Confidence: high.

*Twelve-year-old.* He will choose the open land near the town quickly. The phrase "Fresh food" as the name of the check will pass him by. He may question why driven food is bad.

*Dull or lively?* Moderately lively. The lorry's journey is long, so that plate finishes last and holds the eye.

### Level 5, Power

*Eight-year-old.* The invitation is the longest in the town and contains the key fact. She will not read it. The night scene is exciting and the lights going dark on the solar plate are clear. She will then face nine sentences. Two plans both keep the lights on, and the only difference is a dash about birds on the wind farm, which she will find only by reading. Confidence: high.

*Twelve-year-old.* He will see that the wind farm passes the test and ask what the battery is for, since the wind is blowing. The older design tested a night with no wind, where the battery mattered. The present one does not. At the recap he may tap the turbines, as in prediction 8.

*Dull or lively?* Lively. Night falling is the most striking picture in the town.

### Level 6, A school for everyone

*Eight-year-old.* This is the easiest level to follow. There is one gap, the bell rings and children walk or are driven. She may still not see the cars as a bad thing. The title promises something about everyone, and the level is about distance.

*Twelve-year-old.* He will recognise level 2 again. The word button "by the farms" has no matching plan. The reason step offers two reasons that belong to plans he did not choose, so it is not a real choice. As the last level it will feel like a step down. Confidence: high.

*Dull or lively?* Pleasant, but familiar.

## 4. The five riskiest assumptions in the design

**Assumption 1: a child who presses one button and watches is learning by doing.** The whole design after Astra's round rests on this. If children are passive during the test, the game is a film with pauses. Test it by asking children to predict before the button and to describe what they saw after it, before any marks appear.

**Assumption 2: the same seven steps can be repeated thirty-six times.** Six towns of six levels use one flow. If the flow tires in Eco Town by level 4, it cannot carry six weeks. Test it by watching for attention at levels 4, 5 and 6, and by showing the levels in different orders to different groups so that tiredness is not confused with a weak level.

**Assumption 3: a plan that is good on every check still leaves a decision.** The owner replaced trade-offs with one clean winner. That is kinder to eight-year-olds, but it may remove thinking altogether, and it leaves the discussion question without an answer. Test it by asking children why they chose, and counting how many give a reason from the town and how many say "it had all the ticks".

**Assumption 4: building a sentence from word buttons teaches something about asking an AI.** At present the sentence has no visible effect. Test it by asking children, after two levels, what would have happened if they had picked a different word.

**Assumption 5: children of eight can read enough, fast enough, without a voice.** If they cannot, every other finding is distorted, because a child who cannot read the screen cannot show whether the idea works. Test this first, and remove it as a cause by having the adult read aloud in half of the sessions.

## 5. Patterns in Oliver's and Astra's feedback, and what is still open

### The patterns

Both colleagues pushed in the same direction: show, do not tell. Oliver's first point was that children should see the river rise and the homes warm up, with ratings underneath. Astra's rounds turned that into one button per level, sentences about what happened, and a recap answered by pointing.

Both asked for variety between levels. Oliver asked for a different activity each time (place, route, build, grow, power and audit). Astra asked for one clear goal and its own activity in each level.

Oliver cared about accuracy in the science and about making the AI lesson visible. Astra cared about lowering the reading and keeping each level to one idea.

### What is still unresolved

1. **Variety of activity.** Oliver's hands-on steps were added and then removed when Astra's test buttons arrived. What remains is one press with a different label. Neither colleague's request for a different activity in each level has really been met.
2. **The AI lesson.** Oliver wanted the recaps to "gradually explain the AI lesson" and praised the step where more detail changed Florence's suggestions. That step was removed as too advanced, and only two levels now ask anything about Florence. The game no longer shows that what you ask changes what you get.
3. **Who Florence is.** Oliver's line that the child "must check whether they work" is in the opening. The owner has also decided not to carry over the idea that Florence could be wrong. These pull against each other, and the level structure sides with Oliver.
4. **Testing from more than one person's point of view.** Oliver wanted Getting around to show that a route is short for one group and long for another. The walk-or-car test replaced it, and that idea is gone.
5. **Warmth in Homes.** Oliver asked for a cold night in which the child sees which homes stay warm and how much energy they use. The test now shows only pollution, while the invitation and the sentence still speak of warmth, energy and lasting a long time.
6. **The battery in Power.** Oliver asked for it to be clear that a battery stores power. The recap now credits the battery with keeping the lights on while the wind is blowing.
7. **The closing question.** Oliver asked to keep the question about what the child gave up. The later rule that one plan is good on everything removes its answer.
8. **Trade-offs.** Oliver called Getting around "one of the strongest trade-off levels" and wanted the School level to end on people deciding what matters most. Both now have a clean winner.
9. **Optional challenges.** Astra proposed them and the owner declined for now. This matters for prediction 3, because quick children will finish early.
10. **What the town shows during a test.** Only Eco Town has its own wording for this. The other five towns use a general caption, so their tests are less well specified than Eco Town's.

## 6. A plan for testing with the film

### Purpose

The film can test whether children understand what they see: the job, the test, the result and the reason for the choice. It cannot test tapping, pace or whether children enjoy playing, because nobody plays. Findings about fun from the film should be treated as weak.

### Who, and how many

- **Children: eight to ten, seen one at a time.** Aim for four or five aged 8 to 9 and four or five aged 11 to 12, with a spread of reading confidence chosen by their teacher or club leader. Eight to ten children is enough to find the large problems. It is not enough to measure small differences, and the report should not quote percentages.
- **Colleagues: three to five adults,** including at least one who teaches this age group. They watch the same film and answer in writing. Their answers are kept apart from the children's, because adults predict children poorly.
- **One small group of three or four children** at the end, to hear how they talk to each other about it. Group answers are led by the most confident child, so use the group for language and energy and not for comprehension.

### How long

Each child session is 20 to 25 minutes. That is long enough for three levels with pauses, and short enough for an eight-year-old. No child should watch all six levels with pauses. One child in each age group should watch all six without pauses, purely to see where attention drops.

### What to show

- Show the opening and then **three levels to each child**. Half the children see Land, Homes and Power. The other half see Getting around, Food and the School. This gives every level four or five viewings.
- **Change the order** for half of each group, so that a weak response to the third level is not simply tiredness.
- In **half of the sessions the adult reads every screen aloud**, exactly as written, and in the other half the child reads alone. The comparison shows how much of the difficulty is reading.
- Use the paused version of the film described in section 9.

### What to ask

Use the neutral questions in section 10. Ask the same questions in the same order, do not explain the game, and do not say whether an answer is right. The adult may say only "Thank you" and "What makes you say that?".

### What to watch for

- Where the child's eyes go during the test: one plate, all three, or Florence.
- Whether the child's prediction before the test matches what they said they would choose.
- Whether the child can say what happened before the marks appear.
- The words the child uses for the plans, the test and the marks. Note them exactly, because they are the best guide to the words the game should use.
- Fidgeting, looking away, or asking how many are left, with the time on the film when it happens.
- Any question the child asks. Write it down and do not answer it until the end.

### How to record without names or personal data

- Give each child a session code made of the date, a letter and the age band, for example "A, 8 to 9". Do not write a name, a school, a class or a date of birth anywhere.
- Record on paper or in one shared spreadsheet, using the observation sheet in section 10. Do not record sound, video or the screen with the child in view.
- Write down quotations as the child says them, but leave out anything that names a person or place.
- The teacher or club leader keeps any list of who took part. The research notes must not be linkable to it.
- Ask the organisation to arrange permission from parents in its usual way, and ask each child at the start whether they are happy to help and tell them they can stop at any time.
- This matches the project's standing rule that nothing a child says or types leaves the room in a form that identifies them.

## 7. A later plan for testing a playable level

### What to build

Build **one level that plays for real, and I recommend two: Land and Power.** Land is the simplest and shows whether the basic flow works. Power has the most text and two plans that both pass the main test, so it shows whether the flow survives a harder case. The build needs working word buttons, the answer to what happens when a child taps a poor word, the test, the choice, "Try another plan" and the recap.

### Who, and how many

Test with ten to twelve children, half aged 8 to 9 and half aged 11 to 12, each alone at a device for 15 minutes, with an adult watching and not helping. Then run one session with a whole group of the size the camp expects, with its usual leader, because the eight-year-old's parent predicted "a lot of hands up" in a classroom and that can only be seen in one.

### What to measure

- The time each child takes for each step, taken from the game itself and stored with no name.
- The first word button tapped in each gap, and whether it was the first one in the row.
- Whether the child presses the test button before reading anything.
- How long passes between the result marks appearing and the choice. Under two seconds suggests tick counting.
- How many children press "Try another plan" or "Ask again", and what they say when they do.
- Where the child taps in the recap.
- How many times the child asks the adult what to do. The earlier session suggests this is the most telling number.
- The total time for the level. Six times this figure is the real length of the hour.

### The comparison worth running

Give half of the children a version in which the tick, dash and cross appear only after the child has chosen, and the other half the version as designed. If the children without marks choose as well and can explain more, the marks are doing the thinking for them.

## 8. What would count as success or failure in each level

For the film test, a level succeeds when at least four of the five children who see it meet its success line, and fails when two or fewer do. Three is unclear and needs another look. These are working thresholds for a small sample, and not statistics.

**Land.** Success: before the marks appear, the child says that the hill stayed dry and gives height as the reason. Failure: the child cannot say why the far meadow flooded, or calls the riverside homes the worst result and is confused by the dash.

**Getting around.** Success: the child can say what was different between the plans in the test, in terms of walking and cars, and names the trees or the park as the reason for the choice between the two plans that both have walking ticks. Failure: the child prefers the plan with the cars, or cannot tell the two walking plans apart.

**Homes.** Success: when asked what the test was finding out, the child says something about pollution from making the homes. Failure: the child says the test was about keeping warm, or cannot say, or rejects the timber result because trees were cut down and nothing in the level answers the objection.

**Food.** Success: the child says that the nearby farms brought food by cart and that the wild meadow kept its bees, and links both to the choice. Failure: the child sees no difference between cart and lorry, or answers the question about Florence by guessing.

**Power.** Success: the child says why the solar roofs went dark and can give one difference between the wind farm and the chosen plan. Failure: the child cannot say why the chosen plan is better than the wind farm, or cannot say what the battery did.

**A school for everyone.** Success: the child says that the school in the middle let every child walk, and can give a reason why walking is better. Failure: the child says it was the same as the shops level, or sees no reason to mind the cars.

**Across the whole town.** Success: after three levels the child can describe the steps of a level in their own words and says what Florence does. Failure: the child describes Florence as wrong or silly, or says the words they chose made no difference.

## 9. Changes that would make the film a better test instrument

These are changes to the film as a research tool. None of them needs new words for children.

1. **Add pauses at five points in each level, with the screen held still.** The points are: after the word buttons appear and before one is chosen; after Florence's three plans appear and before the test button; at the end of the test and before any marks or result sentences appear; after the marks and before the choice; and at the recap before the target ring appears. At present the pointer moves to the answer and the ring shows where to tap, so the film answers every question before the child can.
2. **Hold the word buttons for much longer.** They are on screen for 1.4 seconds before the choice. Nobody can read 12 to 22 words in that time.
3. **Slow the reading.** The result sentences in Power need roughly 390 words a minute and Florence's closing lines need 200 to 260. A confident eight-year-old reads perhaps 100 to 140 words a minute. Until the film has a voice, the adult should read aloud or the film should wait.
4. **Make a second cut in which the result marks are hidden,** leaving only the pictures. Comparing the two cuts shows whether the town alone carries the result, which was Oliver's most important point.
5. **Show the sample child making a poorer choice in at least one level,** followed by "Try another plan" with the small picture of the first result. The film shows only a child who is always right, so the second-try path, which is in every level of the wireframes, is untested. This also needs the owner to decide what Florence does when a poor word is tapped.
6. **Show the first-screen job text and the reason step,** or decide that they are not part of the test. The film leaves both out, and also leaves out the description under each plan's name, so it currently flatters the reading load.
7. **Run the three plans one after another in one cut,** and together in another. This tests whether children can follow three plates at once.
8. **Make the bees in Food leave during the test and not before it,** so that the picture matches the design's claim that the button causes the result.
9. **Enlarge the result text** or zoom in on the cards while they are read. At 16.5 pixels it will not be readable on a shared screen.
10. **Keep the six levels as six separate clips.** The recording script already writes one file for each part, which makes it easy to change the order between children.
11. **Remove the celebration and the "Yes, that is right" line from the paused cut.** They tell the child the sample answer was correct, which shapes what the child says next.
12. **Put a small step number in a corner of the research cut,** so that the observer can note exactly where a child looked away or asked a question.

## 10. The researcher's materials

These are for the adult only. Children do not read them.

### Observation sheet, one for each child and each level

- Session code and age band. No name.
- Level shown, and its position in the session (first, second or third).
- Whether the adult read the screens aloud.
- At the word buttons: which option the child said they would tap, and how long they took.
- At the plans: what the child predicted would happen to each plan.
- At the end of the test: the child's own words for what happened, written exactly.
- Where the child was looking during the test (one plate, all three, elsewhere).
- At the choice: which plan, and the reason in the child's own words.
- At the recap: where the child pointed.
- Questions the child asked, with the step number.
- Moments of looking away or restlessness, with the step number.
- Words on the screen that the child stumbled on or asked about.
- The observer's own note, kept separate from what the child said.

### Neutral questions for the adult to ask

At the start: "I am going to show you part of a game that is not finished. I did not make it, so you can say anything you like about it. There are no right answers. Is that all right?"

At the word buttons: "Which one would you tap?" and then "What makes you choose that one?"

At Florence's plans: "What do you think will happen to each of these?"

At the end of the test, before the marks: "Tell me what you saw." and then "Was anything different between the three?"

At the marks: "What do these marks tell you?" and, pointing to a dash, "What do you think this one means?"

At the choice: "Which one would you choose?" and then "What makes you say that?"

At the recap: "Where would you point?"

After each level: "What was that part about?" and "What was the button for?"

After the last level shown: "Who is Florence, and what does she do?", "If you had picked different words at the start, what do you think would have happened?", "Was any part too easy or too hard?", "Was there any part where you wanted to do something and could not?" and "Would you want to play the next one? What makes you say that?"

The adult should never ask "Did you like it?" or "Did you understand?", because children of this age say yes to both.

## 11. Questions for the owner that the tests cannot answer

1. What should Florence do when a child taps a poor word button? Until this is decided, the sentence step cannot be tested honestly.
2. Should the Power test go back to a night with no wind, so that the battery has a job to do?
3. Should the closing discussion question change, now that the best plan gives nothing up?
4. Is Homes about staying warm or about pollution from materials? The invitation and the test currently point different ways.
