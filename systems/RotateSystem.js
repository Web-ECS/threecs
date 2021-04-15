import { defineQuery, defineSystem } from "bitecs";
import { Object3DComponent } from "../components/Object3D";
import { RotateComponent } from "../components/Rotate";

export const rotateQuery = defineQuery([RotateComponent, Object3DComponent]);

export const RotateSystem = defineSystem((world) => {
  const entities = rotateQuery(world);

  entities.forEach((eid) => {
    const dt = world.dt;
    const object3D = Object3DComponent.get(eid);
    const { speed, axis } = RotateComponent.get(eid);
    object3D.rotateOnAxis(axis, speed * dt);
  });
});
