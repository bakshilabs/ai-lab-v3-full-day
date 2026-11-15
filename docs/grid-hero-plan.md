# Add Grid Hero as a "Finished early?" game

*The user's plan, as given on 15 November 2026. Kept word for word. Not started: it comes after the live site, the reviews of the three modules, and the film studio and power control room.*

## What I want
Add my game `github.com/bakshilabs/grid-hero` to the full-day AI Lab as something children can play if they finish a part early or need a break. It is a filler, not a fifth part of the day.

## When to do it
After the work already in hand: the live site, the reviews of the three modules to 8 out of 10, and the film studio and power control room. Do not let it delay those.

## Step 1: read it and report before changing anything
Attach `bakshilabs/grid-hero` (read access is enough) and tell me, in plain words:
1. What kind of game it is, how long a round takes, and what ages it suits.
2. How it is built: does it run as plain files in a browser, or does it need a build step or its own server?
3. Whether it loads anything from outside (scripts, fonts, analytics, adverts) or sends anything anywhere.
4. Whether it works by touch on a tablet and by keyboard, and whether it respects reduced motion.
5. What it stores on the device, and whether it asks a child to type anything, such as a name or a high-score entry.
6. Any art, sound or libraries inside it with their own licence.
7. How big it is, and what it would take to add. If anything in 2 to 6 is a problem, say what you would change and wait for my answer.

## Step 2: add it, if step 1 is clean or I approve the changes
- **Its own page, not a module.** Copy the game's files into a folder of this repository (for example `games/ecotown/game/extras/grid-hero/`) and record which commit they came from. Do not use the module contract: it does not read the child's town and hands back no take-home record.
- **Where it shows:** a "Finished early?" row at the foot of the start page, below the four parts and below "More to try", and one entry in the game's menu. Never numbered, never marked "Next".
- **When it shows:** only after the Eco Town session is finished on that device (the same condition the start page uses to tick part 1). Before that the row is not shown at all.
- **Label it honestly:** "A break game", not part of the learning.
- **One marked way back** to the start page, top left, as in the modules.
- **The lab's rules hold:** nothing loaded from outside, nothing sent anywhere, no names, no typing that leaves the device, no adverts, no accounts. It must work under the site's security rules, which block outside and inline scripts.
- **Saved things:** anything it stores on the device must use a key beginning `ecotown.`, so two children sharing a browser do not share scores.
- **Not on the take-home page.** Not in the welcome film.
- **Build:** include the folder in the built site, and check it works under the `/ai-lab-v3-full-day/` path as well as at the site root.
- **Leader's list:** do not add anything unless I ask. Tell me whether a leader could tell that a child is in the break game rather than stuck.

## Step 3: check it
- One browser run that opens it from the start page, plays a round by keyboard and by touch, returns to the start page, and confirms no page errors and no outside requests.
- The whole unit suite and both mission play-throughs still pass.
- Confirm the row is hidden before the Eco Town session is finished and shown after.

## What to report back
- What step 1 found, and anything you changed in the game to fit the lab's rules.
- Screenshots of the start page row and of the game on a laptop and a tablet.
- Anything not done or not checked.

## Rules
- Do not edit the `grid-hero` repository itself; work on the copy here.
- Do not deploy anywhere new. Publishing follows whatever is already agreed for the live site.
- Plain British English.
