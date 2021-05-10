import { Vector2 } from "three";
import { defineSystem, World, defineQuery, defineComponent } from "../core/ECS";
import { Object3DComponent } from "../components";

export const FirstPersonCameraActions = {
  Look: "FirstPersonCamera/Look",
};

export const FirstPersonCameraPitchTarget = defineComponent({});
export const FirstPersonCameraYawTarget = defineComponent({});

const cameraPitchTargetQuery = defineQuery([
  FirstPersonCameraPitchTarget,
  Object3DComponent,
]);
const cameraYawTargetQuery = defineQuery([
  FirstPersonCameraYawTarget,
  Object3DComponent,
]);

export const FirstPersonCameraSystem = defineSystem(
  function FirstPersonCameraSystem(world: World) {
    const lookVec = world.actions.get(FirstPersonCameraActions.Look) as Vector2;

    const pitchEntities = cameraPitchTargetQuery(world);

    pitchEntities.forEach((eid) => {
      const obj = Object3DComponent.storage.get(eid)!;
      obj.rotateX(lookVec.y);
    });

    const yawEntities = cameraYawTargetQuery(world);

    yawEntities.forEach((eid) => {
      const obj = Object3DComponent.storage.get(eid)!;
      obj.rotateY(lookVec.x);
    });
  }
);
