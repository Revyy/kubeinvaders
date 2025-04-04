import {
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Engine,
  Side,
  Vector,
} from "excalibur";
import { autoCannonBullet } from "./animations";

export class AutoCannonBullet extends Actor {
  private direction: Vector;
  private speed: number;
  private maxDistance: number;
  private distanceTraveled: number = 0;

  constructor(
    pos: Vector,
    direction: Vector,
    speed: number,
    maxDistance: number
  ) {
    super({
      name: "AutoCannonBullet",
      pos,
      width: 32,
      height: 32,
      collisionType: CollisionType.Passive,
    });
    this.direction = direction;
    this.speed = speed;
    this.maxDistance = maxDistance;
  }

  override onInitialize() {
    this.tags.add("projectile");
    this.graphics.use(autoCannonBullet);
    // Rotate bullet to match direction
    this.rotation =
      Math.atan2(this.direction.y, this.direction.x) + Math.PI / 2;
    this.vel = this.direction.scale(this.speed);
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {
    // Calculate movement for this frame
    const elapsedSeconds = elapsedMs / 1000;
    const distanceThisFrame = this.speed * elapsedSeconds;
    // Update distance traveled
    this.distanceTraveled += distanceThisFrame;
    // Remove bullet if it traveled too far
    if (this.distanceTraveled >= this.maxDistance) {
      this.kill();
    }
  }

  override onCollisionStart(
    self: Collider,
    other: Collider,
    side: Side,
    contact: CollisionContact
  ): void {
    // Kill the bullet when it hits something
    if (!other.owner.hasTag("projectile")) {
      this.kill();
    }
  }
}
