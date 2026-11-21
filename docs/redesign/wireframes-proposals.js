// Feedback rounds for the wireframes. Each round is one set of feedback, with the changes proposed from it.
// To add a new round, put a new object at the TOP of this list. Older rounds stay below it as a record.
// Every item id must be different from every other id in the whole file, in every round, because the answer to an
// item is kept in the artifact database (collection "decisions") under the item's id. Never reuse or rename an id.
// A round can have  applied: 'a date'  once its answers have been carried out; the panel then shows it as finished.
// screen is the number of the screen on the whiteboard that the item belongs to, where there is one.
export default [
  { id: '2026-11-21-astra', title: 'Astra’s feedback: a different activity in each level', date: '21 November 2026', applied: '21 November 2026',
    intro: 'Astra asked for each level to have one clear goal and its own activity, so that the idea is learned through play. The owner agreed these six tests in conversation, and they have been carried out in Eco Town. In each level the child presses a button to start the test, and that takes the place of the hands-on step that used to come after the choice.',
    groups: [
      { title: 'One test button in each Eco Town level',
        items: [
          { id: 'a1', what: 'Level 1, Land: the child starts the test.', before: 'The child tapped the name of a check. Later, the child dragged the town onto the land.', after: 'The button is “Make it rain”. The river rises, and each place is wet or dry.' },
          { id: 'a2', what: 'Level 2, Getting around: the child starts the test.', before: 'A child, a grandparent and a parent with a pram each walked to the shops. Later, the child drew a route.', after: 'The button is “Open the shops”. People from every home set off, and they either walk or take their cars.' },
          { id: 'a3', what: 'Level 3, Homes: the child starts the test.', before: 'The pollution was described in words, and then a cold night fell. Later, the child tapped plots to build homes.', after: 'The button is “Make the materials”. The electric sawmill gives off no smoke, the brick oven gives off some, and the cement works gives off a large cloud.', why: 'The owner said that pollution is hard to understand from words alone.' },
          { id: 'a4', what: 'Level 4, Food: the child starts the test.', before: 'The test showed wildlife, the walk to the farms, and fields in heavy rain. Later, the child tapped fields to plant them.', after: 'The button is “Take the food to market”. Fresh food goes by cart from the close farms. Food from the far farms is boxed, kept cold and driven a long way. The Flood check is no longer used in this level.' },
          { id: 'a5', what: 'Level 5, Power: the child starts the test.', before: 'It was a winter night with no wind. Later, the child tapped turbines and roofs to switch them on.', after: 'The button is “Keep the lights on”. It is a dark, cold winter night, every home switches everything on, and the lights stay on or go dark.' },
          { id: 'a6', what: 'Level 6, A school for everyone: the level is about travel distance only.', before: 'The sentence ended “and stays safe when the river rises”, and the level used the Flood check. Later, the child inspected the town.', after: 'The button is “A school for everyone”. Children leave every home at the same moment, and they all arrive together or some are still on the road. The sentence, the checks, the reasons and the recap no longer mention flooding.', why: 'The owner said that rain was already covered in the Land level.' },
        ] },
    ] },
  { id: '2026-11-21-oliver', title: 'Oliver’s feedback on Eco Town', date: '21 November 2026', applied: '21 November 2026',
    intro: 'These changes come from Oliver’s feedback on the Eco Town screens. The answers below have been carried out. Where the answer was Other, the note was followed. The screen numbers in this section are the numbers from before the changes, because new screens have since been added.',
    groups: [
      { title: 'Four decisions to make first',
        intro: 'These four points from Oliver touch things that you have already decided, so they need your answer before anything else.',
        items: [
          { id: 'd1', screen: 2, what: 'Rename the check called “Sharing”.', before: 'Sharing. This check shows whether everyone gets a share.', after: 'Everyone’s walk. This check shows whether everyone walks a similar distance to the places they need to reach.', why: 'You chose “Sharing” today. Oliver points out that in Eco Town this check is only about walking distances. He suggested the name “Similar walking distances”, which is long, so this is a shorter name for the same idea.' },
          { id: 'd2', screen: 2, what: 'Change the heading above the six checks.', before: 'Check this town for six things', after: 'Test the town in six ways', why: 'You asked for the present wording today. Oliver’s wording tells the child that they will test the town themselves.' },
          { id: 'd3', screen: 2, what: 'Add a line that explains Florence.', before: 'There is no line that explains who Florence is.', after: 'Florence is a computer helper. She can suggest ideas, but you must check whether they work.', why: 'You dropped the idea that Florence could be wrong. This line does not say that she makes mistakes. It says that the child tests her plans.' },
          { id: 'd4', what: 'Give each level one short thing that the child does by hand.', before: 'Every level uses the same steps. The child asks, compares and chooses.', after: 'Each level also has one short hands-on step: place the town, draw a route, build the homes, grow the food, switch on the power, and inspect the school sites.', why: 'This is not free play, but it adds a new kind of screen to every level. It is the open question about a hands-on step from the earlier diagram.' },
        ] },
      { title: 'Changes on every level',
        intro: 'These words are shared with the other five towns, so a yes here changes them in all six towns.',
        items: [
          { id: 'g1', what: 'Say “plan” where the game says “solution”.', before: 'solution', after: 'plan', why: 'A child is choosing between possible plans. They are not finding one correct answer.' },
          { id: 'g2', screen: 5, what: 'Change what Florence says when she offers her plans.', before: 'Here are the solutions I can offer. Every one of them would work.', after: 'Here are some possible plans. Let’s test what happens with each one.' },
          { id: 'g3', screen: 6, what: 'Change the instruction on the compare screens.', before: 'Look at how each solution does in each check.', after: 'Test each plan and watch what happens.' },
          { id: 'g4', screen: 6, what: 'Show each check as a test that the child watches in the town.', before: 'Tapping a check colours the town, and the child reads “Good”, “Fair” or “Poor”.', after: 'The child watches the test happen in the town. The ratings “Good”, “Fair” and “Poor” stay, underneath what the child has seen.', why: 'This is Oliver’s most important point. The ratings should support what the child sees. They should not replace it.' },
          { id: 'g5', screen: 7, what: 'Change the instruction on the choose screens.', before: 'Choose the solution that you think is best for the town.', after: 'Choose the plan you think is best for the town.' },
          { id: 'g6', screen: 8, what: 'Let the child go back and try another plan after seeing the result.', before: 'Florence describes the choice, and the only button is “Next level”.', after: 'Florence adds: “Your plan works in some ways. Shall we go back and see what happens with another plan?” There is a second button called “Try another plan”.' },
          { id: 'g7', what: 'Add a short recap screen after every level.', before: 'Each level ends on the result screen.', after: 'A new screen follows the result. It asks one question and then shows the answer. The six questions are listed under each level below.' },
        ] },
      { title: 'Screen 2: the town opens',
        items: [
          { id: 'o1', screen: 2, what: 'Change one word in Florence’s welcome.', before: 'This is a low town of homes, farms and a river.', after: 'This is a small town with homes, farms and a river.' },
          { id: 'o2', screen: 2, what: 'Make the “Staying warm” check about warmth only.', before: 'This check shows whether homes are warm and bright on a cold, dark day.', after: 'This check shows whether homes stay warm on a cold day.' },
        ] },
      { title: 'Level 1, Land: screens 3 to 8',
        items: [
          { id: 'l1a', screen: 3, what: 'Change the job that Florence gives.', before: 'Eco Town needs a place to stand. Ask Florence to find land for the town.', after: 'Choose where to build Eco Town. Ask Florence to suggest two places.' },
          { id: 'l1b', screen: 4, what: 'Change the sentence that the child builds.', before: 'Find land for the town that is safe from floods.', after: 'Choose land for the town that stays safe when the river rises.' },
          { id: 'l1c', screen: 6, what: 'Say what the child watches during the test.', before: 'Tapping a check colours the town to show that result for each solution.', after: 'Rain falls and the river rises. The child watches which streets go under water.' },
          { id: 'l1d', screen: 8, what: 'Add this recap question.', after: 'The question is “What should you check before building near a river?” The answer is “What happens when the river rises.”' },
        ] },
      { title: 'Level 2, Getting around: screens 9 to 14',
        items: [
          { id: 'l2a', screen: 9, what: 'Change the job that Florence gives.', before: 'Ask Florence to plan the paths and streets.', after: 'Ask Florence to suggest paths and streets.' },
          { id: 'l2b', screen: 10, what: 'Change the sentence that the child builds.', before: 'Plan the streets so that everyone can reach the shops on foot.', after: 'Plan the streets so people can reach the shops on foot and leave space for nature.' },
          { id: 'l2c', screen: 12, what: 'Say what the child watches during the test.', before: 'Tapping a check colours the town to show that result for each solution.', after: 'Different people walk each route to the shops, and the space that is left for trees is shown.' },
          { id: 'l2d', screen: 14, what: 'Add this recap question.', after: 'The question is “Why should we test a route with different people?” The answer is “One route can help some people and make things harder for others.”' },
        ] },
      { title: 'Level 3, Homes: screens 15 to 20',
        items: [
          { id: 'l3a', screen: 17, what: 'Simplify the description of the concrete homes.', before: 'The homes are made from poured concrete blocks.', after: 'The homes are made from concrete.' },
          { id: 'l3b', screen: 18, what: 'Say what the child watches during the test.', before: 'Tapping a check colours the town to show that result for each solution.', after: 'A cold night falls. The child watches which homes stay warm and how much energy they use.' },
          { id: 'l3c', screen: 18, what: 'Change the “Clean air” result for timber homes.', before: 'Growing trees clean the air', after: 'Making them causes the least pollution', why: 'Oliver’s wording was longer. This is shortened so that it fits on a card.' },
          { id: 'l3d', screen: 18, what: 'Change the “Clean air” result for brick homes.', before: 'Brick ovens give off some smoke', after: 'Making bricks causes some pollution' },
          { id: 'l3e', screen: 18, what: 'Change the “Clean air” result for concrete homes.', before: 'Cement works give off many fumes', after: 'Making concrete causes more pollution' },
          { id: 'l3f', screen: 20, what: 'Change what Florence says about the timber homes.', before: 'They keep the air the cleanest.', after: 'They cause the least air pollution in this town.' },
          { id: 'l3g', screen: 20, what: 'Add this recap question.', after: 'The question is “What can change how much energy a home needs?” The answer is “Its materials and how well it keeps heat in.”' },
        ] },
      { title: 'Level 4, Food: screens 21 to 29',
        items: [
          { id: 'l4a', screen: 22, what: 'Change the sentence that the child builds.', before: 'Place the farms near the town and protect the wildlife.', after: 'Place farms close enough for people to reach, while protecting wildlife.' },
          { id: 'l4b', screen: 24, what: 'Change the instruction on the compare screen.', before: 'Look at how each solution does in each check.', after: 'Watch the bees, birds, water and walking routes as you test each plan.' },
          { id: 'l4c', screen: 26, what: 'Change what Florence says when she offers again.', before: 'You told me more, so I could fit the job more closely. Here are three new solutions.', after: 'You gave me more details, so I could suggest plans that fit your town better. You still need to test them.' },
          { id: 'l4d', screen: 27, what: 'Change the note for the reader.', before: 'The new results are better overall than the first ones, and there is still a real choice to make.', after: 'The new plans fit the extra details. The child tests them again.' },
          { id: 'l4e', screen: 29, what: 'Add this recap question.', after: 'The question is “What changed when you gave Florence more details?” The answer is “Her suggestions changed, but they still needed to be checked.”' },
        ] },
      { title: 'Level 5, Power: screens 30 to 36',
        items: [
          { id: 'l5a', screen: 31, what: 'Change the sentence that the child builds.', before: 'Power the town with clean energy that keeps going in winter.', after: 'Power the town with clean energy that still works on winter days.' },
          { id: 'l5b', screen: 33, what: 'Change the instruction for choosing checks.', before: 'Choose the three checks that matter most for this job.', after: 'Choose three things to test first.' },
          { id: 'l5c', screen: 34, what: 'Say what the child watches during the test.', before: 'Tapping a check colours the town to show that result for each solution.', after: 'It is a still winter night. The child watches which homes keep their lights and heating.' },
          { id: 'l5d', screen: 34, what: 'Make clear that a battery stores power.', before: 'The battery fills the gaps', after: 'The battery stores power for still days', why: 'Oliver asks us to make clear that a battery stores power and is not itself a source of power.' },
          { id: 'l5e', screen: 34, what: 'Change the “Clean air” result for the battery.', before: 'Making a big battery causes fumes', after: 'Making a big battery causes some pollution' },
          { id: 'l5f', screen: 36, what: 'Change what Florence says about the battery.', before: 'Making the battery caused some fumes.', after: 'Making the battery caused some pollution.' },
          { id: 'l5g', screen: 36, what: 'Add this recap question.', after: 'The question is “Why should we test power on a winter day?” The answer is “There may be less sun or wind, so the plan may need another source or stored power.”' },
        ] },
      { title: 'Level 6, A school for everyone: screens 37 to 44',
        items: [
          { id: 'l6a', screen: 38, what: 'Change the sentence that the child builds.', before: 'Build a school for every family that is easy to walk to and is safe from floods.', after: 'Choose a school site that is easy for everyone to reach and stays safe when the river rises.' },
          { id: 'l6b', screen: 40, what: 'Change the instruction for choosing checks.', before: 'Choose the three checks that matter most for this job.', after: 'Choose three things to test before you decide where to build the school.' },
          { id: 'l6c', screen: 41, what: 'Change the instruction on the compare screen.', before: 'Look at how each solution does in each check.', after: 'Watch children walk to each school and see what happens when the river rises.' },
          { id: 'l6d', screen: 43, what: 'Change the instruction for choosing a reason.', before: 'Choose the reason that is closest to your own.', after: 'Choose the reason that best matches your choice.' },
          { id: 'l6e', screen: 44, what: 'Add this recap question.', after: 'The question is “Who decides what matters most in the town?” The answer is “The people in the town. Florence can help compare the choices.”' },
        ] },
    ] },
];
