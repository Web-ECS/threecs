import { World } from "./World";

export interface InputOptions {
  pointerLock?: boolean
}

export function initInput(world: World, options: InputOptions = {}) {
  function onMouseDown() {
    world.renderer.domElement.requestPointerLock();
  }

  if (options.pointerLock) {
    console.log("request pointer lock");
    world.renderer.domElement.addEventListener("mousedown", onMouseDown);
  }

  function onKeyDown(e: KeyboardEvent) {
    world.input.set(`Keyboard/${e.code}`, 1);
  }

  function onKeyUp(e: KeyboardEvent) {
    world.input.set(`Keyboard/${e.code}`, 0);
  }

  function onMouseMove(e: MouseEvent) {
    if (
      options.pointerLock &&
      document.pointerLockElement === world.renderer.domElement
    ) {
      world.input.set(
        "Mouse/movementX",
        world.input.get("Mouse/movementX")! + e.movementX
      );
      world.input.set(
        "Mouse/movementY",
        world.input.get("Mouse/movementY")! + e.movementY
      );
    }
  }

  function onBlur() {
    for (const key of world.input.keys()) {
      world.input.set(key, 0);
    }
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("blur", onBlur);

  return function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("blur", onBlur);
    world.renderer.domElement.removeEventListener("mousedown", onMouseDown);
  }
}