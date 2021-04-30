var __defProp = Object.defineProperty;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __assign = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
import {a as defineComponent, c as addComponent, r as removeComponent, g as addEntity, h as removeEntity, d as defineSystem, f as defineQuery, i as createWorld, j as registerComponents, S as Scene, P as PerspectiveCamera, W as WebGLRenderer, C as Clock, p as pipe} from "./vendor.d9824b0b.js";
function defineMapComponent() {
  const component = defineComponent({});
  component.storage = new Map();
  return component;
}
function addMapComponent(world, component, eid, value) {
  addComponent(world, component, eid);
  component.storage.set(eid, value);
}
function removeMapComponent(world, component, eid) {
  removeComponent(world, component, eid);
  component.storage.delete(eid);
}
const Object3DComponent = defineMapComponent();
const SceneComponent = defineMapComponent();
const CameraComponent = defineMapComponent();
const RendererComponent = defineMapComponent();
const $object3DEntityMap = Symbol("object3DEntityMap");
function initObject3DStorage(world) {
  world[$object3DEntityMap] = new Map();
}
function addObject3DComponent(world, eid, obj, parent) {
  if (parent) {
    parent.add(obj);
  }
  addMapComponent(world, Object3DComponent, eid, obj);
  world[$object3DEntityMap].set(obj, eid);
}
function addObject3DEntity(world, obj, parent) {
  const eid = addEntity(world);
  addObject3DComponent(world, eid, obj, parent);
  return eid;
}
function removeObject3DComponent(world, eid) {
  const obj = Object3DComponent.storage.get(eid);
  if (!obj) {
    return;
  }
  if (obj.parent) {
    obj.parent.remove(obj);
  }
  removeMapComponent(world, Object3DComponent, eid);
  world[$object3DEntityMap].delete(obj);
  obj.traverse((child) => {
    if (child === obj) {
      return;
    }
    const childEid = getObject3DEntity(world, child);
    if (childEid) {
      removeEntity(world, childEid);
      Object3DComponent.storage.delete(childEid);
      world[$object3DEntityMap].delete(child);
    }
  });
}
function removeObject3DEntity(world, eid) {
  removeObject3DComponent(world, eid);
  removeEntity(world, eid);
}
function getObject3DEntity(world, obj) {
  return world[$object3DEntityMap].get(obj);
}
const rendererQuery = defineQuery([RendererComponent]);
const sceneQuery = defineQuery([Object3DComponent, SceneComponent]);
const cameraQuery = defineQuery([Object3DComponent, CameraComponent]);
function initRendererSystem(world) {
  function onResize() {
    const entities = rendererQuery(world);
    entities.forEach((eid) => {
      const component = RendererComponent.get(eid);
      component.needsResize = true;
    });
  }
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
  };
}
const RendererSystem = defineSystem((world) => {
  const renderers = rendererQuery(world);
  const scenes = sceneQuery(world);
  const cameras = cameraQuery(world);
  if (renderers.length > 0 && scenes.length > 0 && cameras.length > 0) {
    const rendererEid = renderers[0];
    const rendererComponent = RendererComponent.storage.get(rendererEid);
    const {renderer, needsResize} = rendererComponent;
    const sceneEid = scenes[0];
    const scene = Object3DComponent.storage.get(sceneEid);
    const cameraEid = cameras[0];
    const camera = Object3DComponent.storage.get(cameraEid);
    if (scene && camera) {
      if (needsResize) {
        if (camera.isPerspectiveCamera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
        renderer.setSize(window.innerWidth, window.innerHeight);
        rendererComponent.needsResize = false;
      }
      renderer.render(scene, camera);
    }
  }
});
function createThreeWorld(options = {}) {
  const {
    beforeRenderSystems,
    afterRenderSystems,
    rendererParameters,
    components
  } = Object.assign({
    beforeRenderSystems: [],
    afterRenderSystems: [],
    rendererParameters: {},
    components: []
  }, options);
  const world = createWorld();
  initObject3DStorage(world);
  registerComponents(world, [
    RendererComponent,
    Object3DComponent,
    ...components
  ]);
  const scene = new Scene();
  const sceneEid = addObject3DEntity(world, scene);
  addMapComponent(world, SceneComponent, sceneEid);
  const camera = new PerspectiveCamera();
  const cameraEid = addObject3DEntity(world, camera, scene);
  addMapComponent(world, CameraComponent, cameraEid);
  const rendererEid = addEntity(world);
  const renderer = new WebGLRenderer(__assign({
    antialias: true
  }, rendererParameters));
  renderer.setPixelRatio(window.devicePixelRatio);
  if (!rendererParameters.canvas) {
    document.body.appendChild(renderer.domElement);
  }
  addMapComponent(world, RendererComponent, rendererEid, {
    renderer,
    scene,
    camera,
    needsResize: true
  });
  initRendererSystem(world);
  const clock = new Clock();
  const pipeline = pipe([
    ...beforeRenderSystems,
    RendererSystem,
    ...afterRenderSystems
  ]);
  return {
    world,
    sceneEid,
    scene,
    cameraEid,
    camera,
    rendererEid,
    renderer,
    start() {
      renderer.setAnimationLoop(() => {
        world.dt = clock.getDelta();
        world.time = clock.getElapsedTime();
        pipeline(world);
      });
    }
  };
}
var crateTextureUrl = "/threecs/assets/crate.a890f0a8.gif";
export {Object3DComponent as O, crateTextureUrl as a, addObject3DEntity as b, createThreeWorld as c, defineMapComponent as d, addMapComponent as e, removeObject3DEntity as r};
