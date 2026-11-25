# Eco Town: releases

Each build carries a version, the commit it was built from and the date. They show at the foot of the game's menu. Feedback should quote them. The version number is in `games/ecotown/package.json`.

## Codes with a limit on how many play at the same time (25 November 2026)

The owner asked for two codes of their own choosing, each allowing 40 children to play at the same time.
- **The limit.** A group (one join code) may now have a limit "at the same time" (`atOnce` in `worker/codes.js`; 0 means no limit). When that many learners on the code are playing, a new learner is refused, and so is a learner coming back after a break. A learner counts as playing if the server has heard from them in the last three minutes (`ACTIVE_FOR`). A learner who is playing keeps their place, also when they move to a new device with their badge. Logging out frees a place at once; closing the page frees it after three minutes. The organisation's seats (all learners ever) still apply, so an organisation for such codes needs plenty of seats.
- **Who sets it.** Only the admin, on `/admin`: a field "At the same time" when adding a group, a "Change limit" button, and the column "Active now / limit". A leader's new group has no limit and cannot set one.
- **Chosen codes** may now also look like `40-WORD` (a number first). Children may type them in any case, with a space or a dash.
- **The new game checks in.** `docs/redesign/concepts/game/game.js` tells the server once a minute that the child is still playing (on the live site only).
- **The message** a child sees when a code is at its limit is, for now, the existing "This group is full. Tell your leader." OpenAI was asked for a line of its own but the account has no credits (25 Nov 2026).
- **Not stored in this repository:** the codes themselves. The repository is public, so the owner creates them on `/admin`.

## Background music on the start page (25 November 2026)

The owner asked for background music on the landing page and left the choice to Claude: Flowerbed Fields, one of the owner's four pieces and the music of Land, the first level. It starts at the visitor's first click or key (a browser allows no sound before that), fades in quietly and loops. A "Music on / Music off" button sits in the top right corner (shorter words on narrow phones) and shares its remembered choice with the game's own music button. The file is `home-music/flowerbed-fields.mp3`, open to everyone like the start page (`js/home/music.js`).

## Background music for each level (25 November 2026)

The owner chose four pieces: Flowerbed Fields (Zane Little Music), Summer Sunday (celestialghost8) and Summer Park (Scribe), all public domain from OpenGameArt, and "8 bit music on medium" by moodmode (Pixabay, free to use), which the owner uploaded. The owner asked for different music in each level and to reuse two pieces for now: Land and Power play Flowerbed Fields, Getting around and School play Summer Park, Homes plays Summer Sunday and Food plays the 8-bit piece. The music loops quietly while a level is open, fades in and out, and stops in the town. A "Music on / Music off" button in the game's top bar turns it off; the choice is remembered on the device. The music files are served from KV with a join code (`docs/redesign/concepts/game/music.js`, `music/`).

## Real sounds in the new Eco Town game (25 November 2026)

The owner uploaded four of Kenney's free sound packs (public domain, CC0). The shared level kit (`docs/redesign/concepts/level-kit/sound.js`) now plays recordings from them instead of plain computer tones: a recorded note for taps and parts going in (played at each level's own pitches, so the levels' little tunes stay tunes), a ding for the end of a step, and a short steel-drum tune the first time a level ends. Long hums and buzzes that a level chose stay as they were. The sounds were chosen by measuring them (length, pitch, whether a tune rises), because nobody in the session can hear them. Land's own rain, river and thunder are unchanged. There is no background music yet.

## The start page shows the newer 3D island (25 November 2026, later)

The owner prefers the newer island: stepped roofs like the main game's homes, hard-edged shadows and solar tiles (made on 18 November). `js/home/island.js` is that version again. The fourteen still pictures shown while the live island loads (`img/home/<shot>-wide.webp` and `-tall.webp`) were rendered again from the newer island by `game/tools/stills.mjs` (page `tests/visual/stills.html`); before that, the first picture on loading still showed the old roofs.

## The start page's 3D island put back as it was (25 November 2026)

The owner asked to keep the start page's 3D island unchanged. The release of the new game had also taken live some island changes from 18 November that were only on the working branch (stepped roofs, hard-edged shadows, solar tiles). `js/home/island.js` is back to the version that was live before 25 November. Only two hooks for the test page `tests/visual/walk.html` were kept, and they change nothing that the start page shows.

## The start page for the new Eco Town game (25 November 2026, later the same day)

Asked by the owner: the Eco Town card's words, a way back from the game to the start page, a new welcome film, the ribbon of pictures from the new game, and parts 2 to 6 shown as coming soon.
- **Eco Town card.** New words describing the new game (placeholders; no OpenAI for this build). They no longer say Florence is sometimes wrong.
- **Way back.** The new game's town page has an "AI Lab start page" button when it runs on the site.
- **Welcome film.** `welcome.html` plays `videos/welcome/eco-town-welcome.mp4` (82 seconds, 1920 x 1080, with captions), made by `voice/welcome-film.py` from the levels' own recordings and Florence's recorded voice (Kokoro, `af_bella`). Its words are placeholders. The welcome card opens it, and starting the film marks the welcome as watched. The old welcome in `play.html?welcome=1` is no longer linked.
- **Ribbon.** Twelve still pictures from the six levels (`img/home/tiles/`) replace the old game's eight build films.
- **Coming soon.** Drones, robots, self-driving cars, the film studio and the power control room show "Coming soon" and cannot be opened from the start page. They are still in the site.

## The new Eco Town game on the live site (25 November 2026)

The owner asked for the new Eco Town game (the six levels of the redesign, `docs/redesign/concepts/`) to replace the old Eco Town part on `ecotown-future.deltaops.workers.dev`. Owner's decisions (25 Nov 2026): keep the live start page with its latest updates; archive the old Eco Town game; keep the old join codes; no OpenAI words for this build.
- `build.mjs` copies the game and its six levels into `dist/eco-town/`, keeping their folders. Its start page is `eco-town/concepts/game/index.html`. Its words are the design agents' labelled placeholders, and each screen says so.
- The start page's Eco Town card and the welcome's start button open the new game (`partHref` in `js/series.js`). The card's tick follows the new game's levels on this device.
- The old Eco Town game is archived: it is still in `play.html?part=town`, because the other five parts run in `play.html`, but nothing links to it.
- The new game needs a join code like every other page. Its files may be framed by the site itself (`X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`), because it opens each level in a frame; every other page still refuses every frame.
- `main` now also holds the branch the live site was built from (`claude/jolly-goldberg-e9txp9`: the landing page open to everyone, the sharper town).
- Checked: 625 unit tests, including a new server test; the built start page is the same as the live one; on this machine the Eco Town card opens the new game and Start opens Land with no errors. Not checked: the whole game played through by hand on the live site.

## 3.1.0 (in progress, not deployed)

Started 15 November 2026 from the copy of Eco Town v3.0. **This build has not been deployed anywhere and has not been played by children.** Checked by 295 unit tests, a full play-through of all six missions in both age routes in a headless browser, and a joint browser test of the game with the new server run on this machine.

### Fixed
- **Pass and fail.** One module (`js/game/criteria.js`) decides whether a target is met.
  - A target the player wrote counts. Asking for a 10-minute walk and getting 15 is now "partly right", with no first-time star and a choice to write the instruction again. It used to pass as "no problem".
  - A town-meeting choice that breaks a limit can be changed. Keeping it ends the mission as "one limit is broken", with the limit named and the third star withheld.
  - Carbon is compared to one decimal: 160.4 t no longer passes a 160 t limit. "Below 50" no longer accepts 50.
  - The homes mission counts only families in homes that do not flood. The school mission needs homes to measure.
  - A challenge passed below the bronze score has no medal. The report agrees with the goals.
  - A town that was complete and slips says so.
- **Wording.** "No problem shows up here" is now "This check found nothing wrong. It only tests one thing".

### New
- **Groups and learners.** An organisation has groups; a group has one join code; each child who types it becomes a separate learner with a made-up badge ("Heron 47"). No names or emails. Seats are counted per organisation.
- **A leader's page** behind a leader code: the organisation's groups and join codes, and for each learner the step they are on, missions done, and flags for "needs help", "a limit is missed" and "finished".
- **Saving.** The town is saved when the page is hidden or closed. A refresh during a mission offers to go back into it. Each learner on a shared browser has their own saved things. A copy of the progress goes to the server; it never holds anything the child typed. A new device gets the town back with the join code and badge.
- **Next step.** The bar under the next step says what its numbers are ("12 of 40 families", "180 t · 160 or less"). The stars chip shows stars earned. The mission reward card says where the missions and the town each stand.
- **Recaps.** "You practised…" after each mission and on a new **Finish session** card (Menu), built from what the child did.
- **Pause and talk.** Two skippable cards for led sessions, after the second and the fourth mission.
- **Careful replies.** Text that suggests a child needs help, holds personal details or asks for something unsuitable gets a fixed reply and, where it fits, points to a trusted adult. The words are never repeated back.
- **Leader's run sheet** for one hour (`game/leader.html`).
- **Version label** in the menu.

### New: Eco Town of the future (first versions)
Three afternoon modules, each one playable loop, opened from Menu → Town of the future or by `?module=<id>`. Built against `docs/MODULES.md`. **None has been played by a person.**
- **Drone delivery** (`drone`): fly one delivery by hand through the child's own town; write the drone's steps from tiles on a map; watch it fly them; compare the two flights. Ages 13–17 deliver two parcels. Leaves a drone flying its route in the town.
- **Robot training** (`robots`): show a recycling robot examples; test it on a tray kept apart; see what it "had not been shown yet"; add examples; test again; watch it sort in the town. The sorting is real: it depends on which examples were shown.
- **Roads for self-driving cars** (`roads`): redesign a close-up street with drop-off points, waiting bays and crossings; run the morning for real numbers; choose what the freed car-park land becomes; ride along it. Leaves a small model of the street in the town.
- **Take-home page** (Menu → Take-home page, and on the Finish session card): a map of the town, what was made in each module, "I practised" lines, one question to ask at home, a line for a handwritten name. One A4 page. Nothing on it is sent anywhere.

### Removed
- The lockout after ten wrong codes (at the user's request).
- The unused admin test key.

### Known issues and things not done
- **Modules:** no sound in any of them. Touch was not tried on a real tablet. Large text and resuming a half-played module were not run in a browser. What each leaves in the town is small at the usual zoom. The roads module's figures for freed land (4 homes, 250 m² of play space, vegetables for 3 families, 10 spaces a plot) are plausible estimates, not sourced. A child who presses "Back to my town" before the end keeps nothing from that visit beyond the module's own saved progress.
- **Modules do not change the town's numbers.** What they leave in the town is scenery.
- **Not deployed.** The deploy script is switched off and still names the original worker and stores.
- **Load:** only local runs of the server logic (`docs/LOAD.md`). Nothing is known about the live site.
- **A refresh during a mission** returns to the start of that mission, not to the same step.
- **The 70 t limit on homes' materials** is the homes mission's limit, not a town goal. As a town goal it made four challenge towns impossible.
- **Badge take-over:** a child who knows another child's badge and the group's code can open that child's town on another device. The first device is then told it has been replaced.
- **Leader codes and join codes** have no limit on wrong guesses.
- **Voices:** the new lines (partly right, recaps, pause cards, careful replies) have no recordings; the device's own voice reads them.
- **Buttons that reload the page** (challenge towns, another island) still do not say where they lead.
- **Not checked:** the admin page in a browser; large text, read-aloud, reduced motion and keyboard play through a whole mission; phones; a screen reader.
- **The run sheet's timings** have not been tried with a group.
- **Instructions the game misreads** ("parser issues" in the review): the cases are in a document not yet received.
