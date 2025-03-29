import {
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Engine,
  Keys,
  Shape,
  Side,
  vec,
} from "excalibur";

import { idleShipGroup, runningShipGroup } from "./animations";

type EngineState = "Idle" | "Breaking" | "Increasing";
type PlayerState = {
  engine: EngineState;
  rotation: number;
};

export class Player extends Actor {
  private state: PlayerState = {
    engine: "Idle",
    rotation: 0,
  };

  // These values now represent units per second rather than per frame
  private acelleration = 300; // pixels per second^2
  private maxSpeed = 250; // pixels per second
  private rotationSpeed = 100; // radians per second

  constructor() {
    super({
      name: "Player",
      pos: vec(1500, 1500),
      anchor: vec(0.5, 0.5),
      collider: Shape.Polygon([vec(0, -24), vec(24, 24), vec(-24, 24)]),
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
    // Put any update logic here runs every frame after Actor builtins
    this.onPostUpdateState(engine);
    this.onPostUpdateMovement(elapsedMs);
    this.onPostUpdateGraphics();
  }

  onPostUpdateState(engine: Engine): void {
    if (this.leftKeyPressed(engine) && !this.rightKeyPressed(engine)) {
      this.state.rotation = -1;
    } else if (this.rightKeyPressed(engine) && !this.leftKeyPressed(engine)) {
      this.state.rotation = 1;
    } else {
      this.state.rotation = 0;
    }

    if (this.upKeyPressed(engine)) {
      this.state.engine = "Increasing";
    } else if (this.downKeyPressed(engine)) {
      this.state.engine = "Breaking";
    } else {
      this.state.engine = "Idle";
    }
  }

  onPostUpdateMovement(elapsedMs: number): void {
    // Convert elapsed milliseconds to seconds for calculations
    const elapsedSeconds = elapsedMs / 1000;

    if (this.state.rotation === -1) {
      this.angularVelocity = -this.rotationSpeed * elapsedSeconds;
    } else if (this.state.rotation === 1) {
      this.angularVelocity = this.rotationSpeed * elapsedSeconds;
    } else {
      this.angularVelocity = 0;
    }

    if (this.state.engine == "Increasing") {
      // Scale acceleration by elapsed seconds
      const frameAcceleration = this.acelleration * elapsedSeconds;
      this.vel = vec(
        this.vel.x + Math.sin(this.rotation) * frameAcceleration,
        this.vel.y + -Math.cos(this.rotation) * frameAcceleration
      );
    }

    if (this.state.engine == "Breaking") {
      // Calculate current speed
      const currentSpeed = this.vel.magnitude;

      if (currentSpeed > 0) {
        // Scale braking force by elapsed seconds
        const frameBrakingForce = Math.min(
          this.acelleration * elapsedSeconds,
          currentSpeed
        );

        // Apply braking in the direction opposite to current velocity
        const normalizedVel = this.vel.normalize();
        this.vel = vec(
          this.vel.x - normalizedVel.x * frameBrakingForce,
          this.vel.y - normalizedVel.y * frameBrakingForce
        );

        // If speed becomes very small, just stop completely
        if (this.vel.magnitude < 1) {
          this.vel = vec(0, 0);
        }
      }
    }

    // Enforce maximum speed limit
    if (this.vel.magnitude > this.maxSpeed) {
      this.vel = this.vel.normalize().scale(this.maxSpeed);
    }
  }

  onPostUpdateGraphics(): void {
    if (this.state.engine == "Idle") {
      this.graphics.use(idleShipGroup);
    } else if (this.state.engine == "Increasing") {
      this.graphics.use(runningShipGroup);
    }
  }

  leftKeyPressed(engine: Engine): boolean {
    return (
      engine.input.keyboard.wasPressed(Keys.Left) ||
      engine.input.keyboard.isHeld(Keys.Left)
    );
  }

  rightKeyPressed(engine: Engine): boolean {
    return (
      engine.input.keyboard.wasPressed(Keys.Right) ||
      engine.input.keyboard.isHeld(Keys.Right)
    );
  }

  upKeyPressed(engine: Engine): boolean {
    return (
      engine.input.keyboard.wasPressed(Keys.Up) ||
      engine.input.keyboard.isHeld(Keys.Up)
    );
  }

  downKeyPressed(engine: Engine): boolean {
    return (
      engine.input.keyboard.wasPressed(Keys.Down) ||
      engine.input.keyboard.isHeld(Keys.Down)
    );
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
