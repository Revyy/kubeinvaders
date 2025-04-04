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
import { Player } from "./actors/player";
import { getWebSocketService } from "./services/websocket";
import { Pod } from "./actors/pod";

export class MainLevel extends Scene {
  override onInitialize(engine: Engine): void {
    // const wsService = getWebSocketService("ws://localhost:8080/ws");

    // wsService.on("connected", (payload) => {
    //   console.log("Connected to server", payload);
    // });

    // wsService.on("podList", (payload) => {
    //   console.log("Pod list", payload);
    // });

    // if (!wsService.isConnectedToServer()) {
    //   wsService.connect().then(() => {
    //     wsService.send("test", { test: "test" });
    //   });
    // }

    // Scene.onInitialize is where we recommend you perform the composition for your game
    const player = new Player(vec(500, 500));
    this.add(player); // Actors need to be added to a scene to be drawn
    this.camera.zoom = 1;

    const pod = new Pod(vec(450, 450));
    this.add(pod); // Actors need to be added to a scene to be drawn

    // Left wall
    this.add(
      new Actor({
        pos: vec(0, 0),
        collider: new EdgeCollider({
          begin: vec(0, 0),
          end: vec(0, 800),
        }),
        collisionType: CollisionType.Fixed,
      })
    );

    // Top wall
    this.add(
      new Actor({
        pos: vec(0, 800),
        collider: new EdgeCollider({
          begin: vec(0, 0),
          end: vec(800, 0),
        }),
        collisionType: CollisionType.Fixed,
      })
    );

    // Right wall
    this.add(
      new Actor({
        pos: vec(800, 0),
        collider: new EdgeCollider({
          begin: vec(0, 0),
          end: vec(0, 800),
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
          end: vec(750, 0),
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
