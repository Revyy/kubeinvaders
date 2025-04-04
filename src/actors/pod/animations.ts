import { Resources } from "../../resources";
import { animation, spriteSheet } from "../../sprites";
import { GraphicsGroup, vec } from "excalibur";

const engineIdle = animation(
  spriteSheet(Resources.EnemyBomberEngine, 10, 2, 64, 32),
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  50
);

const engineRunning = animation(
  spriteSheet(Resources.EnemyBomberEngine, 10, 2, 64, 32),
  [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  50
);

export const idleShipGroup = new GraphicsGroup({
  useAnchor: true, // position group from the top left
  members: [
    Resources.EnemyBomberFullHealth.toSprite(),
    {
      graphic: engineIdle,
      offset: vec(0, 32),
    },
  ],
});

export const runningShipGroup = new GraphicsGroup({
  useAnchor: false, // position group from the top left
  members: [
    Resources.EnemyBomberFullHealth.toSprite(),
    {
      graphic: engineRunning,
      offset: vec(0, 32),
    },
  ],
});
