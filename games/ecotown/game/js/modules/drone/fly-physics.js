// Drones at work: the up-and-down part of hand flying, and when the drone counts as touching down. Pure: no page, no
// 3D (tests/drone-hour.test.mjs drops the drone at different speeds and frame rates to check every landing counts).
export const CLIMB = 3.2, DOWN_ACC = 4.5, DOWN_MAX = 6;
export const SETTLE = 0.08; // within 8 cm of the floor and not climbing: the drone settles on it

// S: { y, vy, floor, airborne }. inpY: 1 climb, -1 come down, 0 neither. Moves S by dt seconds and returns the speed
// it came down at (metres a second) on the frame it touched down, else null. Climbing is held, coming down speeds up
// the longer it is held, and letting go slows the drone to a hover. A drone that was in the air and reaches the floor
// (or settles within a few centimetres of it, or the floor rises under it at a pad's edge) has touched down.
export function vertical(S, inpY, dt) {
  if (inpY > 0) S.vy += (CLIMB - S.vy) * Math.min(1, dt * 6);
  else if (inpY < 0) S.vy = Math.max(-DOWN_MAX, Math.min(0, S.vy) - DOWN_ACC * dt);
  else S.vy += (0 - S.vy) * Math.min(1, dt * 5);
  const vyWas = S.vy; S.y += S.vy * dt;
  if (S.y > S.floor + SETTLE) S.airborne = true;
  let touched = null;
  if (S.y <= S.floor || (inpY <= 0 && S.y <= S.floor + SETTLE && S.airborne)) {
    if (S.airborne) touched = Math.max(0, -vyWas);
    S.y = S.floor; S.vy = Math.max(0, S.vy); S.airborne = false;
  }
  S.y = Math.min(S.y, S.floor + 60);
  return touched;
}
