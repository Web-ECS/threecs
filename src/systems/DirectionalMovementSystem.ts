import { Vector2 } from "three";
import { Object3DComponent } from "../core/components";
import {
  defineSystem,
  defineComponent,
  defineQuery,
  TypedArray,
} from "../core/ECS";
import { World } from '../core/World';
import { Types } from "bitecs";

export const DirectionalMovementActions = {
  Move: "DirectionalMovement/Move",
};

export const DirectionalMovementComponent = defineComponent({
  speed: Types.f32,
});

export const directionalMovementQuery = defineQuery([
  DirectionalMovementComponent,
  Object3DComponent,
]);

export const DirectionalMovementSystem =
  function DirectionalMovementSystem(world: World) {
    const moveVec = world.actions.get(
      DirectionalMovementActions.Move
    ) as Vector2;
    const entities = directionalMovementQuery(world);

    entities.forEach((eid) => {
      const speed = DirectionalMovementComponent.speed[eid] || 10;
      const obj = Object3DComponent.store.get(eid)!;
      obj.translateZ(-moveVec.y * speed * world.dt);
      obj.translateX(moveVec.x * speed * world.dt);
    });

    return world;
  };
