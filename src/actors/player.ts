import {
  Actor,
  Collider,
  CollisionContact,
  Engine,
  GraphicsGroup,
  Keys,
  Shape,
  Side,
  vec,
} from "excalibur";
import { Resources } from "../resources";
import { spriteSheet, animation } from "../sprites";

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

  private acelleration = 5;
  private maxSpeed = 250;

  constructor() {
    super({
      // Giving your actor a name is optional, but helps in debugging using the dev tools or debug mode
      // https://github.com/excaliburjs/excalibur-extension/
      // Chrome: https://chromewebstore.google.com/detail/excalibur-dev-tools/dinddaeielhddflijbbcmpefamfffekc
      // Firefox: https://addons.mozilla.org/en-US/firefox/addon/excalibur-dev-tools/
      name: "Player",
      pos: vec(150, 150),

      anchor: vec(0.5, 0.5),
      // Triangle with point upwards
      collider: Shape.Polygon([vec(0, -24), vec(24, 24), vec(-24, 24)]),
      // anchor: vec(0, 0), // Actors default center colliders and graphics with anchor (0.5, 0.5)
      // collisionType: CollisionType.Active, // Collision Type Active means this participates in collisions read more https://excaliburjs.com/docs/collisiontypes
    });
  }

  override onInitialize() {
    // Generally recommended to stick logic in the "On initialize"
    // This runs before the first update
    // Useful when
    // 1. You need things to be loaded like Images for graphics
    // 2. You need excalibur to be initialized & started
    // 3. Deferring logic to run time instead of constructor time
    // 4. Lazy instantiation

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

    const idleShipGroup = new GraphicsGroup({
      useAnchor: false, // position group from the top left
      members: [
        shipGroup,
        {
          graphic: engineIdle,
          offset: vec(-24, -24),
        },
      ],
    });

    const runningShipGroup = new GraphicsGroup({
      useAnchor: false, // position group from the top left
      members: [
        shipGroup,
        {
          graphic: engineRunning,
          offset: vec(-24, -24),
        },
      ],
    });

    this.graphics.use(runningShipGroup);
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
    if (this.state.rotation === -1) {
      this.angularVelocity = -1.5;
    } else if (this.state.rotation === 1) {
      this.angularVelocity = 1.5;
    } else {
      this.angularVelocity = 0;
    }

    if (this.state.engine == "Increasing") {
      this.vel = vec(
        this.vel.x + Math.sin(this.rotation) * this.acelleration,
        this.vel.y + -Math.cos(this.rotation) * this.acelleration
      );
    }

    if (this.state.engine == "Breaking") {
      // Calculate current speed
      const currentSpeed = this.vel.magnitude;

      if (currentSpeed > 0) {
        // Calculate braking force (minimum between acceleration and current speed)
        const brakingForce = Math.min(this.acelleration, currentSpeed);

        // Apply braking in the direction opposite to current velocity
        if (currentSpeed > 0) {
          const normalizedVel = this.vel.normalize();
          this.vel = vec(
            this.vel.x - normalizedVel.x * brakingForce,
            this.vel.y - normalizedVel.y * brakingForce
          );
        }

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
