import { Resources } from "../../resources";
import { animation, spriteSheet } from "../../sprites";
import { GraphicsGroup, vec } from "excalibur";

const engineIdle = animation(
  spriteSheet(Resources.EngineSuperChargedSprites, 4, 2, 48, 48),
  [0, 1, 2, 3],
  50
);

const engineRunning = animation(
  spriteSheet(Resources.EngineSuperChargedSprites, 4, 2, 48, 48),
  [5, 6, 7, 8],
  50
);

const autoCannonIdle = animation(
  spriteSheet(Resources.ShipAutoCannon, 7, 1, 48, 48),
  [0],
  50
);

const autoCannonFiring = animation(
  spriteSheet(Resources.ShipAutoCannon, 4, 1, 48, 48),
  [0, 1, 2, 3, 4, 5, 6],
  50
);

export const autoCannonBullet = animation(
  spriteSheet(Resources.ShipAutoCannonBullet, 4, 1, 32, 32),
  [0, 1, 2, 3],
  50
);

const shipGroup = new GraphicsGroup({
  useAnchor: true,
  members: [
    Resources.ShipFullHealth.toSprite(),
    Resources.EngineSuperCharged.toSprite(),
    autoCannonIdle,
  ],
});

const firingShipGroup = new GraphicsGroup({
  useAnchor: true,
  members: [
    Resources.ShipFullHealth.toSprite(),
    Resources.EngineSuperCharged.toSprite(),
    autoCannonFiring,
  ],
});

export const idleShipGroup = new GraphicsGroup({
  useAnchor: true,
  members: [shipGroup, engineIdle],
});

export const idleFiringShipGroup = new GraphicsGroup({
  useAnchor: true,
  members: [firingShipGroup, engineIdle],
});

export const runningShipGroup = new GraphicsGroup({
  useAnchor: true,
  members: [shipGroup, engineRunning],
});

export const runningFiringShipGroup = new GraphicsGroup({
  useAnchor: true,
  members: [firingShipGroup, engineRunning],
});
