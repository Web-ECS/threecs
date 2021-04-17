import "../dynamic-import-polyfill.b3685604.js";
import {d as defineComponent, a as addComponent, b as addEntity, r as removeEntity, c as removeComponent, e as defineSystem, f as defineQuery, T as Types, g as registerComponents, S as Scene, P as PerspectiveCamera, W as WebGLRenderer, h as TextureLoader, M as Mesh, B as BoxGeometry, i as MeshBasicMaterial, V as Vector3, j as createWorld, C as Clock, p as pipe} from "../vendor.af7b9a23.js";
const RendererComponent = defineComponent(new Map());
function addRendererComponent(world2, eid, renderer2, scene2, camera2) {
  addComponent(world2, RendererComponent, eid);
  RendererComponent.set(eid, {
    renderer: renderer2,
    scene: scene2,
    camera: camera2,
    needsResize: true
  });
}
const $object3DEntityMap = Symbol("object3DEntityMap");
function initObject3DStorage(world2) {
  world2[$object3DEntityMap] = new Map();
}
const Object3DComponent = defineComponent(new Map());
function addObject3DComponent(world2, eid, obj, parent) {
  if (parent) {
    parent.add(obj);
  }
  addComponent(world2, Object3DComponent, eid);
  Object3DComponent.set(eid, obj);
  world2[$object3DEntityMap].set(obj, eid);
}
function addObject3DEntity(world2, obj, parent) {
  const eid = addEntity(world2);
  addObject3DComponent(world2, eid, obj, parent);
  return eid;
}
function removeObject3DComponent(world2, eid) {
  const obj = Object3DComponent.get(eid);
  if (!obj) {
    return;
  }
  if (obj.parent) {
    obj.parent.remove(obj);
  }
  removeComponent(world2, Object3DComponent, eid);
  Object3DComponent.delete(eid);
  world2[$object3DEntityMap].delete(obj);
  obj.traverse((child) => {
    if (child === obj) {
      return;
    }
    const childEid = getObject3DEntity(world2, child);
    if (childEid) {
      removeEntity(world2, childEid);
      Object3DComponent.delete(childEid);
      world2[$object3DEntityMap].delete(child);
    }
  });
}
function removeObject3DEntity(world2, eid) {
  removeObject3DComponent(world2, eid);
  removeEntity(world2, eid);
}
function getObject3DEntity(world2, obj) {
  return world2[$object3DEntityMap].get(obj);
}
const rendererQuery = defineQuery([RendererComponent]);
function initRendererSystem(world2) {
  function onResize() {
    const entities = rendererQuery(world2);
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
const RendererSystem = defineSystem((world2) => {
  const entities = rendererQuery(world2);
  entities.forEach((eid) => {
    const component = RendererComponent.get(eid);
    const {renderer: renderer2, scene: scene2, camera: camera2, needsResize} = component;
    if (scene2 && camera2) {
      if (needsResize) {
        if (camera2.isPerspectiveCamera) {
          camera2.aspect = window.innerWidth / window.innerHeight;
          camera2.updateProjectionMatrix();
        }
        renderer2.setSize(window.innerWidth, window.innerHeight);
        component.needsResize = false;
      }
      renderer2.render(scene2, camera2);
    }
  });
});
var crateTextureUrl = "/assets/crate.a890f0a8.gif";
const RotateComponent = defineComponent(new Map());
function addRotateComponent(world2, eid, axis, speed) {
  addComponent(world2, RotateComponent, eid);
  RotateComponent.set(eid, {axis, speed});
}
const rotateQuery = defineQuery([RotateComponent, Object3DComponent]);
const RotateSystem = defineSystem((world2) => {
  const entities = rotateQuery(world2);
  entities.forEach((eid) => {
    const dt = world2.dt;
    const object3D = Object3DComponent.get(eid);
    const {speed, axis} = RotateComponent.get(eid);
    object3D.rotateOnAxis(axis, speed * dt);
  });
});
const DeferredRemovalComponent = defineComponent({
  removeAfter: Types.f32
});
const deferredRemovalQuery = defineQuery([DeferredRemovalComponent, Object3DComponent]);
const DeferredRemovalSystem = defineSystem((world2) => {
  const entities = deferredRemovalQuery(world2);
  entities.forEach((eid) => {
    const removeAfter = DeferredRemovalComponent.removeAfter[eid];
    if (world2.time > removeAfter) {
      removeObject3DEntity(world2, eid);
    }
  });
});
const world = createWorld();
initObject3DStorage(world);
registerComponents(world, [
  RendererComponent,
  Object3DComponent,
  RotateComponent,
  DeferredRemovalComponent
]);
const scene = new Scene();
addObject3DEntity(world, scene);
const camera = new PerspectiveCamera();
camera.position.z = 5;
addObject3DEntity(world, camera, scene);
document.getElementById("canvas");
const rendererEid = addEntity(world);
const renderer = new WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
addRendererComponent(world, rendererEid, renderer, scene, camera);
initRendererSystem(world);
const clock = new Clock();
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
const cubeEid = addObject3DEntity(world, cube, scene);
addRotateComponent(world, cubeEid, new Vector3(0.5, 1, 0).normalize(), 1);
addComponent(world, DeferredRemovalComponent, cubeEid);
DeferredRemovalComponent.removeAfter[cubeEid] = clock.getElapsedTime() + 1;
const cube2 = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
const cube2Eid = addObject3DEntity(world, cube2, cube);
addRotateComponent(world, cube2Eid, new Vector3(0.5, 1, 0).normalize(), 1);
cube2.position.x = 1;
const pipeline = pipe([RotateSystem, DeferredRemovalSystem, RendererSystem]);
renderer.setAnimationLoop(() => {
  world.dt = clock.getDelta();
  world.time = clock.getElapsedTime();
  pipeline(world);
});
