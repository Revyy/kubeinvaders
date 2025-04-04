import {
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Engine,
  Side,
  Vector,
} from "excalibur";

import { idleShipGroup, runningShipGroup } from "./animations";

type EngineState = "Idle" | "Increasing";
type PodState = {
  engine: EngineState;
};

export class Pod extends Actor {
  private state: PodState = {
    engine: "Idle",
  };

  // These values now represent units per second rather than per frame
  private acelleration = 300; // pixels per second^2
  private maxSpeed = 250; // pixels per second
  private rotationSpeed = 400; // radians per second

  constructor(pos: Vector) {
    super({
      name: "Pod",
      pos,
      width: 32,
      height: 32,
      collisionType: CollisionType.Active,
    });
  }

  override onInitialize() {
    this.graphics.use(idleShipGroup);
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    // Put any update logic here runs every frame before Actor builtins
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {
    this.onPostUpdateGraphics();
  }

  onPostUpdateGraphics(): void {
    if (this.state.engine == "Idle") {
      this.graphics.use(idleShipGroup);
    } else if (this.state.engine == "Increasing") {
      this.graphics.use(runningShipGroup);
    }
  }

  override onPreCollisionResolve(
    self: Collider,
    other: Collider,
    side: Side,
    contact: CollisionContact
  ): void {
    // Called before a collision is resolved, if you want to opt out of this specific collision call contact.cancel()
  }

  override onPostCollisionResolve(
    self: Collider,
    other: Collider,
    side: Side,
    contact: CollisionContact
  ): void {
    // Called every time a collision is resolved and overlap is solved
  }

  override onCollisionStart(
    self: Collider,
    other: Collider,
    side: Side,
    contact: CollisionContact
  ): void {
    // Called when a pair of objects are in contact
  }

  override onCollisionEnd(
    self: Collider,
    other: Collider,
    side: Side,
    lastContact: CollisionContact
  ): void {
    // Called when a pair of objects separates
  }
}
