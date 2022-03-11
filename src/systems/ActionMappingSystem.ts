import { Vector2 } from "three";
import { defineSystem } from "../core/ECS";
import { World } from "../core/World";

export enum ActionType {
  Vector2 = "Vector2",
  Button = "Button",
}

export interface ButtonActionState {
  pressed: boolean;
  released: boolean;
  held: boolean;
}

export type ActionState = number | Vector2 | ButtonActionState;

export interface ActionMap {
  id: string;
  actions: ActionDefinition[];
}

export interface ActionDefinition {
  id: string;
  path: string;
  type: ActionType;
  bindings: ActionBindingTypes[];
}

export enum BindingType {
  Axes = "Axes",
  Button = "Button",
  DirectionalButtons = "DirectionalButtons",
}

export interface ActionBinding {
  type: BindingType;
}

export interface AxesBinding extends ActionBinding {
  type: BindingType.Axes;
  x: string;
  y: string;
}

export interface ButtonBinding extends ActionBinding {
  type: BindingType.Button;
  path: string;
}

export interface DirectionalButtonsBinding extends ActionBinding {
  type: BindingType.DirectionalButtons;
  up: string;
  down: string;
  left: string;
  right: string;
}

export type ActionBindingTypes =
  | AxesBinding
  | ButtonBinding
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
        actions: Map<string, ActionState>
      ) => void;
    };
  };
} = {
  [ActionType.Button]: {
    create: () => ({ pressed: false, released: false, held: false }),
    bindings: {
      [BindingType.Button]: (
        path: string,
        bindingDef: ActionBinding,
        input: Map<string, number>,
        actions: Map<string, ActionState>
      ) => {
        const state = input.get((bindingDef as ButtonBinding).path);
        const value = actions.get(path) as ButtonActionState;
        value.pressed = !value.held && !!state;
        value.released = value.held && !state;
        value.held = !!state;
      },
    },
  },
  [ActionType.Vector2]: {
    create: () => new Vector2(),
    bindings: {
      [BindingType.Axes]: (
        path: string,
        bindingDef: ActionBinding,
        input: Map<string, number>,
        actions: Map<string, ActionState>
      ) => {
        const { x, y } = bindingDef as AxesBinding;
        const value = actions.get(path) as Vector2;
        value.set(input.get(x) || 0, input.get(y) || 0);
      },
      [BindingType.DirectionalButtons]: (
        path: string,
        bindingDef: ActionBinding,
        input: Map<string, number>,
        actions: Map<string, ActionState>
      ) => {
        const { up, down, left, right } =
          bindingDef as DirectionalButtonsBinding;

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

  return world;
});
