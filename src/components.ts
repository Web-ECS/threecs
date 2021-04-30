import { Object3D, WebGLRenderer } from "three";
import { defineComponent } from "bitecs";
import { defineMapComponent } from "./core/MapComponent";

export const Object3DComponent = defineMapComponent<Object3D>();

export const SceneComponent = defineComponent({});

export const CameraComponent = defineComponent({});

export const RendererComponent = defineMapComponent<{
  renderer: WebGLRenderer;
  needsResize: boolean;
}>();
