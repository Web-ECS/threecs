import { Object3D } from "three";
import { defineComponent, defineMapComponent } from "./core/ECS";

export const Object3DComponent = defineMapComponent<Object3D>();

export const SceneComponent = defineComponent({});

export const CameraComponent = defineComponent({});
