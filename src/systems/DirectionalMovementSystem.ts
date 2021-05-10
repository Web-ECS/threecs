import { Vector2 } from "three";
import { Object3DComponent } from "../components";
import { ActionType } from "./ActionMappingSystem";
import {
  defineSystem,
  World,
  defineComponent,
  defineQuery,
  TypedArray,
} from "../core/ECS";
import { Types } from "bitecs";

export const DirectionalMovementActions = {
  Move: {
    path: "DirectionalMovement/Move",
    type: ActionType.Vector2,
  },
};

export const DirectionalMovementComponent = defineComponent({
  speed: Types.f32,
});

const directionalMovementQuery = defineQuery([
  DirectionalMovementComponent,
  Object3DComponent,
]);

export const DirectionalMovementSystem = defineSystem(
  function DirectionalMovementSystem(world: World) {
    const moveVec = world.actions.get(
      DirectionalMovementActions.Move.path
    ) as Vector2;
    const entities = directionalMovementQuery(world);

    entities.forEach((eid) => {
      const speed =
        (DirectionalMovementComponent.speed as TypedArray)[eid] || 1;
      const obj = Object3DComponent.storage.get(eid)!;
      obj.translateZ(moveVec.y * speed);
      obj.translateX(moveVec.x * speed);
    });
  }
);
