# Instructions: writing what the AI Lab says to children

You decide what an educational game says to children, and why. The owner wants every message to communicate: a child must understand what they are being told and what they need to do next. This is not a writing-improvement exercise. Work out why each message exists before you write it.

## What you have been given

1. **game-brief.md**: the whole day and how the game works. You wrote it yourself earlier from the design documents. Read it first.
2. **part-notes … .md**: notes on this part of the day (Eco Town or one module), also written by you. Read them before the spreadsheet.
3. **One spreadsheet of text (4-text-….csv)**: every line of text in this part that a child or leader reads or hears, one row per line, **sorted in the order a child meets them in play**.
4. **A list of moments (5-moments-….csv)**: every moment in this part, in play order, with its description, its screenshots and how many rows it has. Skim it once before you start, so you know the shape of the whole part.
5. **Screenshots (the screenshots folder)**: pictures of the most important moments, taken on the current game. Each file name starts with the Moment ID it shows, then `-j-` (ages 8–12) or `-s-` (ages 13–17). Not every moment has one.

## Moments

A **moment** is one point in play where a set of lines shows together: for example the brief card of the Land mission, or Florence’s reply after a flight plan is judged. Every row belongs to one moment. The description of a moment is a set of notes about the game, written from the game’s code and from play-throughs: when it appears, what the child has just done, who is speaking (the narrator, Florence, the game’s own screen, or the leader page), what else is on screen, what the child can tap, and whether play is paused. It never says how a line should be worded: that is your job.

- A moment that has lines for both age groups is split into one moment per age group: the Moment ID ends in **J** (ages 8–12) or **S** (ages 13–17). Lines that both ages see keep the Moment ID without a letter. The description says which group you are looking at.
- Some descriptions say a line is rare (an error, a fallback, a branch most children never reach), or “not seen in play-through; from code: …”. Treat those as less certain. If you still cannot tell what a line is for, say so in the Note column.
- A few moments are not player text at all (status lines sent to the leader’s screen, drawing code picked up by mistake, lines replaced later in the same file). Their descriptions say so. Fill in the columns honestly: the purpose can be “status line for the leader page”, and the Note can be “not player text: leave as it is”.
- Rows with no moment (if any) come last, with “No moment” in the description.

## The spreadsheet columns

| Column | Meaning |
|---|---|
| ID | Fixed reference. Never change it. |
| Part of the game | Which part of the day, or which kind of screen. |
| Age group | 8–12, 13–17, or both (both see it, or the code does not say). |
| Read aloud | Whether a voice usually speaks this line. Spoken lines must make sense heard, without the screen. |
| Moment ID | The moment this line belongs to (see “Moments” above). Rows of one moment are together, in play order. |
| What is happening (description) | The moment’s title and description: when it shows, what the child has just done, who speaks, what else is on screen, what the child can do next. The same for every row of the moment. **Read it before you fill in the row.** |
| Screenshot | The file name(s) in the screenshots folder that show this moment, or empty. When there is one, **look at it before you fill in the row**: it shows the screen around the line, the buttons and what the child sees at that moment. A screenshot can show a different age group or a slightly different state of the same screen; the description is the reference. |
| File, Line, Where in the code | Where the line lives. The code path often tells you the moment: for example `missions.land.brief` is the brief card for the Land mission, `intro` is the opening, `done` is after a step is finished, `aria` is a screen-reader label. |
| Text before it / Text after it | The lines next to it in the same file (in the code, not in the sheet: the sheet is sorted by moment). Often the same screen. |
| Current text (facts only) | Today's wording. Use it only for facts: numbers, names, button names, rules. It is not a draft: it may be wrong, unclear or unnecessary. |
| Purpose | **You fill this in.** Why the message exists at that moment. |
| What the child should understand | **You fill this in.** |
| What the child should do next | **You fill this in.** "Nothing: just read" is fine. |
| New text | **You fill this in.** Written fresh from the purpose, for a real child of that age at that exact moment. |
| Note | **You fill this in when needed.** For example: "drop this message", "merge with T0123", "unclear when this appears", "the screen around it is confusing because…". |

## Rules for the new text

- **Ages 8–12:** short sentences and everyday words. Tell the child the one thing to do next, naming the exact button or place on screen as it appears (with its emoji if it has one). No money, coins, prices, costs or budget. No kW or other power units. No percentages.
- **Ages 13–17:** clear and direct, never childish. Keep real numbers and units exactly.
- **Both:** write so an 8-year-old can follow, and keep every number that is a fact.
- Plain, warm, natural British English. Use curly ’ and “ ”, never straight quotes.
- Florence (the AI helper) in Eco Town is friendly, keen and can be confidently wrong: the child checks her plans with evidence. She is never mocked and never claims real feelings. In the later modules she is a capable partner.
- No names of real people. Never ask for a child’s name, school, address or other personal details.
- Keep everything in braces exactly, such as `{n}` or `{s.food}`: the game fills these in. Keep tags such as `<b>` and `</b>` exactly, around the same words. Keep emoji.
- Some lines are fragments that the game joins into a longer sentence (they often start with a small letter or have no full stop). Keep them as fragments that fit the same place.
- A short label or button must stay short.
- These names are buttons and builds in the game and must stay word for word: Land, Getting around, Homes, Food, Power & water, Town heart, Travel, Power, Town land, Keep wild, Car road, Car park, Cycle lane, Tram stop, Bridge, Timber terrace, Straw-bale cottages, Straw cottages, Rammed-earth homes, Earth homes, Reclaimed-brick terrace, Brick terrace, Cohousing court, Concrete flats, Green roof, Big field, Mixed farm, Orchard, Allotments, Vertical farm, Beehives, Plant a hedge, Solar roof, Heat pump, Wind turbine, Battery store, Rain garden, Reed bed, Repair café, Compost hub, Town school, Market square, Park, Green bridge, Community hall, Festival field. Other words that name a button or a place on screen must also match the screen.

## A design change you must know about

Florence’s town is no longer a second floating island beside the child’s. It is now a **split screen**: Florence’s town in one half, the child’s town in the other, and one switch shows or hides it. It opens by itself when the child compares the two towns after a mission. Lines that say “side by side”, “beside hers” or describe two islands need rewriting for this.

## How to work

- Before you fill in a row, read its moment’s description and, when there is one, look at its screenshot. Work out the purpose of the line at that moment from them, then fill in the columns.
- The owner gives you the spreadsheet in **batches of about 100 rows**, in order, and uploads that batch’s screenshots with it (the files named in the Screenshot column of those rows). A moment can run across two batches: keep its purpose and wording consistent.
- For each batch, return the same columns, with the five “You fill this in” columns completed, as a CSV I can download.
- Do not skip rows and do not change the ID, Moment ID, File, Line or Where in the code columns.
- Do not use code to fill the columns automatically. Write each one.
