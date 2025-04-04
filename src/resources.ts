import { ImageSource, Loader } from "excalibur";

// It is convenient to put your resources in one place
export const Resources = {
  ShipFullHealth: new ImageSource("./images/ship/ship-full-health.png"),
  ShipSlightlyDamaged: new ImageSource(
    "./images/ship/ship-slightly-damaged.png"
  ),
  ShipDamaged: new ImageSource("./images/ship/ship-damaged.png"),
  ShipVeryDamaged: new ImageSource("./images/ship/ship-very-damaged.png"),

  EngineSuperCharged: new ImageSource("./images/ship/engine-supercharged.png"),
  EngineSuperChargedSprites: new ImageSource(
    "./images/ship/engine-supercharged-effect-sprites.png"
  ),

  ShipAutoCannon: new ImageSource("./images/ship/ship-auto-cannon.png"),
  ShipAutoCannonBullet: new ImageSource(
    "./images/ship/ship-auto-cannon-bullet.png"
  ),

  EnemyBomberFullHealth: new ImageSource(
    "./images/enemies/enemy-bomber-full-health.png"
  ),
  EnemyBomberDestruction: new ImageSource(
    "./images/enemies/enemy-bomber-destruction.png"
  ),
  EnemyBomberEngine: new ImageSource(
    "./images/enemies/enemy-bomber-engine.png"
  ),
} as const; // the 'as const' is a neat typescript trick to get strong typing on your resources.
// So when you type Resources.Sword -> ImageSource

// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader
export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
