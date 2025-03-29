import { SpriteSheet, Animation } from "excalibur";

export function spriteSheet(
  imageSource: ex.ImageSource,
  columns: number,
  rows: number = 1,
  spriteWidth: number = 48,
  spriteHeight: number = 48
): ex.SpriteSheet {
  return SpriteSheet.fromImageSource({
    image: imageSource,
    grid: {
      rows,
      columns,
      spriteWidth,
      spriteHeight,
    },
  });
}

export function animation(
  spriteSheet: ex.SpriteSheet,
  frames: number[],
  speed: number = 50
): ex.Animation {
  return Animation.fromSpriteSheet(spriteSheet, frames, speed);
}
