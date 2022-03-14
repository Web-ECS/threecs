import { World } from "../core/World";

export function InputResetSystem(world: World) {
  world.input.set("Mouse/movementX", 0);
  world.input.set("Mouse/movementY", 0);
  return world;
}