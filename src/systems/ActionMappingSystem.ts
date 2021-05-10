import { Vector2 } from "three";
import { defineSystem, World } from "../core/ECS";

export enum ActionType {
  Vector2 = "Vector2",
}

export interface ActionMap {
  id: string;
  actions: ActionDefinition[];
}

interface ActionDefinition {
  id: string;
  path: string;
  type: ActionType;
  bindings: ActionBindingTypes[];
}

export enum BindingType {
  Axes = "Axes",
  DirectionalButtons = "DirectionalButtons",
}

interface ActionBinding {
  type: BindingType;
}

interface AxesBinding extends ActionBinding {
  type: BindingType.Axes;
  x: string;
  y: string;
}

interface DirectionalButtonsBinding extends ActionBinding {
  type: BindingType.DirectionalButtons;
  up: string;
  down: string;
  left: string;
  right: string;
}

type ActionBindingTypes =
  | AxesBinding
  | DirectionalButtonsBinding
  | ActionBinding;

const ActionTypesToBindings: {
  [key: string]: {
    create: () => any;
    bindings: {
      [key: string]: (
        path: string,
        bindingDef: ActionBinding,
        input: Map<string, number>,
        actions: Map<string, number | Vector2>
      ) => void;
    };
  };
} = {
  [ActionType.Vector2]: {
    create: () => new Vector2(),
    bindings: {
      [BindingType.Axes]: (
        path: string,
        bindingDef: ActionBinding,
        input: Map<string, number>,
        actions: Map<string, number | Vector2>
      ) => {
        const { x, y } = bindingDef as AxesBinding;
        const value = actions.get(path) as Vector2;
        value.set(input.get(x) || 0, input.get(y) || 0);
      },
      [BindingType.DirectionalButtons]: (
        path: string,
        bindingDef: ActionBinding,
        input: Map<string, number>,
        actions: Map<string, number | Vector2>
      ) => {
        const {
          up,
          down,
          left,
          right,
        } = bindingDef as DirectionalButtonsBinding;

        let x = 0;
        let y = 0;

        if (input.get(up)) {
          y += 1;
        }

        if (input.get(down)) {
          y -= 1;
        }

        if (input.get(left)) {
          x -= 1;
        }

        if (input.get(right)) {
          x += 1;
        }

        const value = actions.get(path) as Vector2;
        value.set(x, y);
      },
    },
  },
};

export const ActionMappingSystem = defineSystem(function ActionMappingSystem(
  world: World
) {
  // Note not optimized at all
  for (const actionMap of world.actionMaps) {
    for (const action of actionMap.actions) {
      if (!world.actions.has(action.path)) {
        world.actions.set(
          action.path,
          ActionTypesToBindings[action.type].create()
        );
      }

      for (const binding of action.bindings) {
        ActionTypesToBindings[action.type].bindings[binding.type](
          action.path,
          binding,
          world.input,
          world.actions
        );
      }
    }
  }
});
