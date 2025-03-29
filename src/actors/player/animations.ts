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

const shipGroup = new GraphicsGroup({
  useAnchor: false, // position group from the top left
  members: [
    {
      graphic: Resources.ShipFullHealth.toSprite(),
      offset: vec(-24, -24),
    },
    {
      graphic: Resources.EngineSuperCharged.toSprite(),
      offset: vec(-24, -24),
    },
  ],
});

export const idleShipGroup = new GraphicsGroup({
  useAnchor: false, // position group from the top left
  members: [
    shipGroup,
    {
      graphic: engineIdle,
      offset: vec(-24, -24),
    },
  ],
});

export const runningShipGroup = new GraphicsGroup({
  useAnchor: false, // position group from the top left
  members: [
    shipGroup,
    {
      graphic: engineRunning,
      offset: vec(-24, -24),
    },
  ],
});
