# Eco Town: releases

Each build carries a version, the commit it was built from and the date. They show at the foot of the game's menu. Feedback should quote them. The version number is in `games/ecotown/package.json`.

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

### Removed
- The lockout after ten wrong codes (at the user's request).
- The unused admin test key.

### Known issues and things not done
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
