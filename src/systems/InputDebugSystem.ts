import { World } from "../core/World";

export function InputDebugSystem(world: World) {
  let str = "";

  for (const [name, state] of world.actions) {
    str += `${name}: ${JSON.stringify(state)}\n`;
  }

  console.log(str);
}