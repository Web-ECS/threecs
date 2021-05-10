import { Vector2 } from "three";
import { defineSystem, World } from "../core/ECS";
import { InputMap } from "../core/World";

interface ActionDefinition {}

interface ActionBindingDefinition {}

interface ScalarsToVector2BindingDefinition extends ActionBindingDefinition {
  x: string;
  y: string;
}

interface BooleansToVector2BindingDefinition extends ActionBindingDefinition {
  up: string;
  down: string;
  left: string;
  right: string;
}

export const ActionType = {
  Vector2: {
    create: () => new Vector2(),
  },
};

export type ActionMap = Map<string, number | Vector2>;

export const BindingType = {
  scalarsToVector2: (
    _actionDef: ActionDefinition,
    bindingDef: ScalarsToVector2BindingDefinition,
    input: InputMap,
    value: Vector2
  ) => value.set(input.get(bindingDef.x)!, input.get(bindingDef.y)!),
  booleansToVector2: (
    _actionDef: ActionDefinition,
    bindingDef: BooleansToVector2BindingDefinition,
    input: InputMap,
    value: Vector2
  ) => {
    let x = 0;
    let y = 0;

    if (input.get(bindingDef.up)) {
      y += 1;
    }

    if (input.get(bindingDef.down)) {
      y -= 1;
    }

    if (input.get(bindingDef.left)) {
      x -= 1;
    }

    if (input.get(bindingDef.right)) {
      x -= 1;
    }

    value.set(x, y);
  },
};

export const ActionMappingSystem = defineSystem(function ActionMappingSystem(
  world: World
) {
  
});
