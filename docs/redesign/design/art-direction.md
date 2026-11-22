# Art direction for Eco Town on the Six Towns World Map

This report was written on 22 November 2026 after looking at about sixty pictures of the film's town, its test models and the whole map. Nothing in the repository was changed apart from this file and the pictures in `img/`. The pictures whose names begin with "now" show the film as it is. The pictures whose names begin with "proposed" are a rough mock-up that I drew in a temporary test page to check the coordinates in this report; the mock-up is not in the repository, and its details are a sketch, not finished art.

All positions are map coordinates. The first number is x, which grows towards the east (towards Crossways). The second number is z, which grows towards the south (towards Studio Bay). One square is one unit. Camera values are the ones that `st.look(x, y, z, distance, tilt, turn)` takes in `vox.js`, with the film's lens of 26 degrees.

## 1. The short answer

The grown town does not yet read clearly, and it does not yet look as if it belongs on the map. There are four main reasons.

1. The camera looks north, so the towers of Drone City fill the top third of every picture and the blocks of Crossways stand directly beside the homes (`img/02-now-film-view-finished.jpg`).
2. The hill cannot be seen. Its sides are the same green as its top, and it climbs in two small steps, so the first level's decision ("on the far hill, away from the river") leaves no visible mark.
3. The homes are about two thirds of the size of every other building on the map, the people are as tall as the house walls, and the park trees are shorter than the people.
4. The timber homes are brown on brown, so from the third level onwards the town is a dark brown patch that has lost Eco Town's own colours, which are cream walls and terracotta roofs.

The fixes are a new camera direction, a hill with a stone face, homes at the map's own size, and a strict small palette. The sections below give exact values.

## 2. What is wrong with the layout now

These points come from `img/03-now-plan-from-above.jpg` and from the height of every square, which I printed from the map.

- The hilltop is not a rectangle. The squares that are really at height 2 run from x = 6 to x = 13 only between z = -3 and z = 5. North of z = -4 the hilltop ends at x = 12, and north of z = -6 it ends at x = 11, because Crossways owns that corner. The south-east corner is cut in the same way.
- Because of this, five road squares of the ring float two units above the ground: (12, -7), (13, -7), (13, -4), (12, 6) and (13, 6). The ring also has gaps at (13, -6), (13, -5), (13, 4) and (13, 5). The home at (12.3, -5) hangs over the edge of the hill.
- The school at (6.6, -5.6), the market at (6.6, -2.4), the battery at (6.8, 3.2) and the sign at (7.2, 0.4) all stand in one line on the hill's west edge. Each of them overlaps the road square at x = 7, and the school's roof hangs over the cliff.
- The two farm houses at (-3.2, -6.3) and (-2.7, -2.2) stand on the sand of the river bank. This contradicts the first level, in which the child chose to keep homes away from the river.
- The two wind turbines at (7.4, -8.6) and (9.6, -8.4) stand against the pale paving and the towers of Drone City. White turbines on a pale background cannot be seen (`img/04-now-level5-dusk.jpg`).
- The park is one column of sand squares with six very small trees hidden between the homes. Nobody would call it a park.
- The two cars of the loop between Crossways and Studio Bay drive along x = 12.5, which is the line of the eastern homes, so they drive through the homes.
- The meadow's ninety flowers are in full bloom before the first level begins, so the fourth level's mark is already spent.

## 3. The layout I recommend

The picture is `img/20-proposed-plan-from-above.jpg`, and the finished town is `img/29-proposed-finished-wide.jpg`.

**The hill.** Make the hilltop two squares wider towards the river and give it one clean cliff. In `mkmap.mjs` the rule for Eco Town becomes: height 2 where x is 4 or more, and height 1 where x is 13.6 or more, as now. Remove the half step at x = 5. The lower course of the cliff face should be sandstone, colour `#cdb37c`, which the map already uses under raised land. A warmer stone, `#d4975e`, would read even more strongly. Add one stair of two squares at (3, -1) and (3, 0), one unit high and coloured sand `#ecd29a`, so that the cart and the farm children have a way up.

**The ring road.** Lay the road on the squares x = 4 to 12 along the rows z = -5 and z = 5, and on the rows z = -4 to 4 along the columns x = 4 and x = 12. Every one of these squares is truly on the hilltop, so nothing floats. The east column and the south row are also the lines of the map's own Eco Town ring (x = 12.5 and z = 5.5), so the map's cars will drive on the road and not through homes.

**The park.** Colour the squares x = 5 to 11, z = -2 to 2 in the deep grass `#6fb257`. Lay a sand path along the row z = 0 from x = 5 to 11 and a second one down the column x = 9 from z = -4 to 4, so the two paths make a cross that joins all four sides of the ring. Plant five trees at the map's own size at (6.2, -1.2), (8.2, -1.3), (10.8, -1.2), (7.7, 1.8) and (10.9, 1.9).

**The homes.** Build six homes at the map's size, in two rows that face the park. The north row stands at z = -3 with homes at x = 5.95, 8.0 and 11.05, and their doors face south. The south row stands at z = 4 at the same three x positions, and their doors face north. In the first level only the four corner homes appear. In the third level those four are re-clad in timber and the two middle homes are added. This is better than the present film, in which four finished homes are removed and eight new ones replace them, because knocking down new homes is a strange thing to show in an Eco Town.

**The low land.** Keep the farm where it is, on the squares x = -2 to 3, z = -8 to -3; it now lies directly under the cliff, which makes "close to the town" obvious. Move the two farm houses off the river bank to (0.3, -1.3) and (2.7, -1.3), at the foot of the stair. Put the sawmill at (1.5, 2.6) with its log stack on its south side at about (1.5, 4.5). Keep the meadow on x = 0.3 to 3.8, z = 4.6 to 9.

**The market.** Put the stall at (5.7, 1.6), just inside the west gate where the stair, the cross path and the road meet.

**The school.** Put the school at (6.2, -7.1), on the north-west corner of the hilltop, directly above the farm and outside the ring. It should be 3.2 squares long from west to east and 1.9 squares deep. Farm children climb the stair and walk north along the west road; town children walk along the same road from the other side. The school is then visibly between the two.

**The power corner.** Put the two turbines at (6.6, 7.2) and (9.3, 6.8) and the battery at (4.9, 6.8), on the south end of the hilltop, on a patch of deep grass (x = 5 to 10, z = 6 to 7). From the new camera they stand against green land and no longer against Drone City.

**The east edge.** Plant three map-size trees at (13.5, -2.4), (13.5, 0.4) and (13.5, 3.2). They make a soft border between Eco Town and the Crossways blocks at x = 15.6.

## 4. Scale

The map draws its own homes 1.9 squares wide with walls 1.45 high, a roof of four steps, a door 0.75 high and trees 2.25 high with a crown 1.25 wide. The film draws homes 1.3 to 1.35 wide with walls 0.95 to 1.05 high, a roof of three steps, a door 0.55 high and park trees 1.35 high. The film's people are 0.98 high, which is the same as the walls of their homes.

I recommend these sizes everywhere in Eco Town, in the film and later in the game.

- A home is 1.9 wide and 1.9 deep, its walls are 1.45 high, and its roof has four steps. The simplest way is to build it with the map's own `house` and `stepRoof` code.
- A person is 0.8 high: a body 0.34 wide, 0.28 deep and 0.5 high, and a head 0.3 on each side. A person then comes just above the top of a door.
- A tree is the map's tree: 2.25 high with a crown 1.25 wide.
- A turbine has a mast 0.36 thick and 3.75 high, blades 0.28 wide and 1.6 long, and a navy foot `#2b3a55` 0.6 wide. The present mast of 0.25 and blades of 0.18 are too thin to see from the game camera.
- Six homes of this size read better than eight small ones, and they match the neighbours.

## 5. Palette

The town's code now uses about thirty colours that are not in the shared palette, including four different reds and three different browns. I recommend that Eco Town uses only the colours below.

- **Land:** the four grass greens, deep grass `#6fb257`, sand `#ecd29a`, water `#5cb8e6`, road `#8d8378`, soil `#b98a55` and `#a27443`, and cliff stone `#cdb37c`.
- **Homes:** cream walls `#fff4dc`, `#fbecd0` and `#f6e1bd`; timber walls `#c9925a` with two thin plank bands in `#a9743f`; terracotta roofs `#c8643f`, `#b5553a` and `#d0774a`; doors and trunks `#7a5a33`; glass `#9fd0f5`; solar panels `#2f4f8f`.
- **One special colour for each special building:** the sawmill is the only building with a dark timber roof, `#8a5a34`. The school is the only yellow building, `#ffd76a`, which is the yellow of the school in Crossways. The battery is the only white box, `#fbfbf7`, with a green band `#5aa35a`. The market is the only striped thing, with an awning in white and terracotta.
- **Crops:** `#7cc04a`, `#e2c04a` and `#4f9550`.
- **Meadow:** pink `#f08ab8`, yellow `#ffd257`, white and lilac `#c98be0`. Pink and lilac should appear nowhere else in the town.
- **People:** six clothes colours, `#e0503a`, `#3f78b5`, `#ffd257`, `#8a5fc2`, `#2e9b5a` and `#16a3a3`, and one skin colour for now, `#f1c9a0`.
- **Light:** `#ffd257` for lit windows, the bell and the flag, and `#7dffa8` for the battery lamps.

The timber homes should keep their terracotta roofs. Only the walls change from cream to timber. The roofs are what the camera mostly sees, and the terracotta roofs are what makes this town Eco Town. The dark brown walls `#dcae72` and roofs `#8a5a34` on every home should go.

## 6. How each level's mark is recognised at a glance

1. **Land.** Four cream homes with terracotta roofs stand on top of a stone-faced cliff, and the river is in the same picture, low and far away. The cliff face and the river must both be in the frame, or the mark means nothing (`img/22-proposed-level1.jpg` shows the cliff; the opening frame should be wider, as section 8 says).
2. **Getting around.** A grey ring of road encloses a dark green square with a cream cross of paths, five large trees, and people walking on the cross (`img/23-proposed-level2.jpg`).
3. **Homes.** The walls of the four homes turn from cream to timber with plank bands, two more timber homes rise, and a long timber mill with a dark roof and a stack of logs appears on the low land. The mill is the only dark roof in the town.
4. **Food.** A striped soil field with three crop colours lies under the cliff, a cart goes up the stair to a striped market stall, and the meadow comes into bloom with bees. Before this level the meadow should be plain deep grass with only about ten flowers; the other eighty flowers and the bees should arrive during this level.
5. **Power.** Two thick white turbines turn on the south end of the hill, dark blue panels lie on the roof slopes that face the camera, and a white battery with a green band stands beside the turbines. Blue panels on terracotta are easy to see; the present blue panels on dark brown roofs are not. Night then falls, as section 7 describes.
6. **A school for everyone.** The one yellow building, the largest in the town, stands on the corner above the farm with a flag and a bell, and a line of children in bright clothes walks to it from the farm stair and from the town (`img/27-proposed-level6.jpg`).

## 7. Night for the Power level

The present dusk is a grey wash at 0.8 strength, and the lit windows are small (`img/04-now-level5-dusk.jpg`). The picture I recommend is `img/28-proposed-level5-night.jpg`.

- Go all the way to night and hold it for at least three seconds. A half-dark picture looks dull and does not look like night.
- Use a sky of `#1c2647`. Set the sky light to strength 0.62 with colour `#7f95d6`, and the sun to strength 0.5 with colour `#9fb4ff`, so that it becomes a moon and the hard shadows stay.
- Make the windows 0.5 wide and 0.45 high, put them on at least the two walls that face the camera, and light them in `#ffd257` with a material that ignores the scene's light.
- Lay one flat patch of light, 1.1 by 0.9 squares in `#e8b84a`, on the ground in front of each door and under each side window. These patches are what make the town look warm from above.
- Let the windows come on one home after another, and keep the turbines turning and the battery lamps pulsing in `#7dffa8`.
- Leave every neighbouring town dark. Eco Town should be the only lit place in the picture.

## 8. Camera framings

The present camera turn of 0.34 looks north and a little west, and the tilt of 0.66 lets the far background into the top of the picture. I recommend a turn of -1.2 and a tilt of 0.95 for every Eco Town level. The camera then stands above the river to the west-south-west and looks towards the hill. The river is at the bottom, the low land is in the middle, the cliff faces the camera in full sunlight, and the town stands on top. Drone City is cut to a strip at the left edge and Studio Bay to a strip at the right edge. Keep the slow sway of 0.05 either way.

The framings below were tested on the recommended layout (`img/21` to `img/27`). Each gives the point in the centre of the picture, then the distance.

- **Opening and empty land:** look at (3, 1, -0.5) from a distance of 46.
- **Level 1:** begin at (5.5, 1, 0) from 38, so that the river and the cliff are both in the picture, and then move in to (8, 2, 0.5) from 30.
- **Level 2:** look at (8.5, 2, 0) from 30.
- **Level 3:** look at (5.5, 1, 0.5) from 36, which holds the homes and the sawmill together.
- **Level 4:** look at (3.5, 1, -1.5) from 40, which holds the farm, the stair, the market and the meadow.
- **Level 5:** look at (7, 2, 2) from 34.
- **Level 6:** look at (5, 1, -3.5) from 34.
- **The end:** look at (3.5, 1, -0.5) from 46 and let the turn drift slowly from -1.2 to -0.9.

If the layout stays as it is, the same turn and tilt still help a great deal (`img/10` to `img/16`). The tested values for the present layout are: level 1 at (9, 2, 0) from 30; level 2 at (9.5, 2, -0.5) from 30; level 3 at (6, 1, -1) from 36; level 4 at (4, 1, -1.5) from 40; level 5 at (7.5, 2, -2.5) from 36; level 6 at (5, 1, -3.5) from 34.

Florence stands in the bottom left corner and her speech bubble covers most of the bottom 200 pixels of the picture, so the thing the level is about should sit in the upper two thirds. The film's present shift of the aim point towards the camera does this and can stay.

For the game, the map's camera has a wider lens of 34 degrees. The same picture needs a turn (`th`) of about -1.2, an angle from the vertical (`phi`) of about 0.62, and a distance (`r`) of about 28 to 34.

## 9. How the three test models should relate to the real town

The test models are clear in themselves (`img/05-now-test-models-level1.png`), but they look like three more floating islands, and they do not match the town.

1. **One building kit.** The models draw homes 1.0, 1.1, 1.3 and 1.5 squares wide in different levels, and the town draws them 1.3. The models and the town should use the same home, tree, person and turbine, at the sizes in section 4. If a model needs to be smaller, shrink the whole model and not its parts.
2. **The same direction.** Turn each model on its own centre by the same amount as the town camera, so that the river is at the front and the hill at the back in both. A child should not have to turn the picture in their head.
3. **The same place.** Each model should be a simple cut-out of the real plot: river, low land, cliff, hilltop. At present the level 6 model has the town in the west and the farm in the east, which is the mirror image of the real town, and the level 5 model puts its turbine hill in a corner where the real town has none. Mirror the level 6 model, and put the level 5 model's turbines where the town will have them.
4. **Only the choice differs.** In each level, the three models should differ only in the thing being chosen. In level 3 the three sets of homes now differ in roof colour as well as wall colour. Keep the terracotta roof on all three and change only the walls: timber `#c9925a`, brick `#a8452f` and concrete `#bdbcb6`. I have not tested this brick colour beside a terracotta roof, so please look at it before keeping it.
5. **A model should look like a model.** Replace the rock-coloured base with a flat cream tray, `#fbecd0`, one unit thick with a dark foot in `#7a5a33`. The models then look like something on a table, and the real town looks like the real place.
6. **The chosen model becomes the town.** After the choice, the parts of the chosen model should appear in the town in the same arrangement and from the same direction. With points 1 to 3 in place this happens by itself.
7. **Night in the models.** Use the night values from section 7, with large lit windows, because the lit windows are the answer to the test.

## 10. Clutter to remove

- **Power lines.** One pylon stands in the middle of Eco Town at (-0.6, -1.8), one on the hill's edge at (14.2, -4.2) and one at (8.2, 10), and their wires cross the town twice. Remove the three lines that pass through Eco Town (the first, fourth and fifth entries of `LINES`). A town that makes its own power in level 5 should not have another town's wires over its roofs.
- **The delivery drone.** One drone flies to a landing pad that the film removed, and hovers over the homes at about (9.3, 8.2) in most pictures. Hide it during the Eco Town film.
- **The sign.** The board at (7.2, 0.4) stands on a road square and carries no meaning. Remove it, or move it to the top of the stair at (4.5, -0.6) as a town gate.
- **The cars.** Hide the two cars of the Crossways and Studio Bay loop inside Eco Town, or move the ring so that they drive on it, as section 3 does.
- **The early meadow.** Hold back most of the flowers and all of the bees until level 4.
- **The half step of the hill** at x = 5 and the map trees that the hill now buries should go.

## 11. The weakest-looking things, worst first

1. **The neighbours crowd every picture.** Turn the camera to -1.2 and tilt it to 0.95 (section 8).
2. **The hill is invisible.** Give it one cliff two squares high with a sandstone face (section 3).
3. **The homes, people and trees are at three different scales.** Use the map's home and tree and a person 0.8 high (section 4).
4. **The town turns brown at level 3.** Keep terracotta roofs; change only the walls to timber (section 5).
5. **Power lines cross the town.** Remove the three lines (section 10).
6. **Road squares float in the air and the ring is broken at two corners.** Use the ring in section 3.
7. **The turbines are thin and stand against Drone City.** Thicken them and move them to the south end of the hill (sections 3 and 4).
8. **The park cannot be seen.** Make it a deep green square of 35 squares with a cross of paths and five large trees (section 3).
9. **The farm houses stand on the river bank.** Move them to the foot of the stair (section 3).
10. **Dusk is grey and the lit windows are tiny.** Use the night in section 7.
11. **The school, market, battery and sign overlap the road and each other.** Give each its own place (section 3).
12. **The test models look like islands and do not match the town.** Follow section 9.
13. **Cars drive through homes and a drone hovers over them.** Follow section 10.
14. **There are too many near-identical reds and browns.** Use the palette in section 5.

## 12. Pictures

- `img/01-now-whole-world.jpg`: the whole map with the finished town, as the film draws it now.
- `img/02-now-film-view-finished.jpg`: the film's present view of the finished town.
- `img/03-now-plan-from-above.jpg`: the present layout seen from straight above. North is at the top.
- `img/04-now-level5-dusk.jpg`: the present dusk in level 5.
- `img/05-now-test-models-level1.png` and `img/06-now-test-models-level5.png`: the present test models.
- `img/10-…` to `img/16-…`: the present town with only the camera changed and the power lines and the drone hidden, one picture for each number of finished levels from 0 to 6.
- `img/20-proposed-plan-from-above.jpg`: the recommended layout from straight above.
- `img/21-…` to `img/27-…`: the recommended layout and camera, one picture for each number of finished levels from 0 to 6.
- `img/28-proposed-level5-night.jpg`: the recommended night.
- `img/29-proposed-finished-wide.jpg`: the recommended finished town in the wide framing.
