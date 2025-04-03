import {
  Actor,
  CollisionType,
  DefaultLoader,
  EdgeCollider,
  Engine,
  ExcaliburGraphicsContext,
  Scene,
  SceneActivationContext,
  vec,
} from "excalibur";
import { Player } from "./actors/player/player";

export class MyLevel extends Scene {
  override onInitialize(engine: Engine): void {
    // Scene.onInitialize is where we recommend you perform the composition for your game
    const player = new Player();
    this.add(player); // Actors need to be added to a scene to be drawn
    this.camera.strategy.lockToActor(player);
    this.camera.zoom = 0.8;

    // Left wall
    this.add(
      new Actor({
        pos: vec(0, 0),
        collider: new EdgeCollider({
          begin: vec(0, 0),
          end: vec(0, 3000),
        }),
        collisionType: CollisionType.Fixed,
      })
    );

    // Top wall
    this.add(
      new Actor({
        pos: vec(0, 3000),
        collider: new EdgeCollider({
          begin: vec(0, 0),
          end: vec(3000, 0),
        }),
        collisionType: CollisionType.Fixed,
      })
    );

    // Right wall
    this.add(
      new Actor({
        pos: vec(3000, 0),
        collider: new EdgeCollider({
          begin: vec(0, 0),
          end: vec(0, 3000),
        }),
        collisionType: CollisionType.Fixed,
      })
    );

    // Bottom wall
    this.add(
      new Actor({
        pos: vec(0, 0),
        collider: new EdgeCollider({
          begin: vec(0, 0),
          end: vec(3000, 0),
        }),
        collisionType: CollisionType.Fixed,
      })
    );
  }

  override onPreLoad(loader: DefaultLoader): void {
    // Add any scene specific resources to load
  }

  override onActivate(context: SceneActivationContext<unknown>): void {
    // Called when Excalibur transitions to this scene
    // Only 1 scene is active at a time
  }

  override onDeactivate(context: SceneActivationContext): void {
    // Called when Excalibur transitions away from this scene
    // Only 1 scene is active at a time
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    // Called before anything updates in the scene
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {
    // Called after everything updates in the scene
  }

  override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called before Excalibur draws to the screen
  }

  override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called after Excalibur draws to the screen
  }
}
