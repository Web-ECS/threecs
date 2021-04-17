import {d as defineComponent, e as addComponent, b as addEntity, i as removeEntity, j as removeComponent, a as defineSystem, h as defineQuery} from "./vendor.ad59a495.js";
const RendererComponent = defineComponent(new Map());
function addRendererComponent(world, eid, renderer, scene, camera) {
  addComponent(world, RendererComponent, eid);
  RendererComponent.set(eid, {
    renderer,
    scene,
    camera,
    needsResize: true
  });
}
const $object3DEntityMap = Symbol("object3DEntityMap");
function initObject3DStorage(world) {
  world[$object3DEntityMap] = new Map();
}
const Object3DComponent = defineComponent(new Map());
function addObject3DComponent(world, eid, obj, parent) {
  if (parent) {
    parent.add(obj);
  }
  addComponent(world, Object3DComponent, eid);
  Object3DComponent.set(eid, obj);
  world[$object3DEntityMap].set(obj, eid);
}
function addObject3DEntity(world, obj, parent) {
  const eid = addEntity(world);
  addObject3DComponent(world, eid, obj, parent);
  return eid;
}
function removeObject3DComponent(world, eid) {
  const obj = Object3DComponent.get(eid);
  if (!obj) {
    return;
  }
  if (obj.parent) {
    obj.parent.remove(obj);
  }
  removeComponent(world, Object3DComponent, eid);
  Object3DComponent.delete(eid);
  world[$object3DEntityMap].delete(obj);
  obj.traverse((child) => {
    if (child === obj) {
      return;
    }
    const childEid = getObject3DEntity(world, child);
    if (childEid) {
      removeEntity(world, childEid);
      Object3DComponent.delete(childEid);
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
  const entities = rendererQuery(world);
  entities.forEach((eid) => {
    const component = RendererComponent.get(eid);
    const {renderer, scene, camera, needsResize} = component;
    if (scene && camera) {
      if (needsResize) {
        if (camera.isPerspectiveCamera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
        renderer.setSize(window.innerWidth, window.innerHeight);
        component.needsResize = false;
      }
      renderer.render(scene, camera);
    }
  });
});
var crateTextureUrl = "/threecs/assets/crate.a890f0a8.gif";
export {Object3DComponent as O, RendererComponent as R, addObject3DEntity as a, addRendererComponent as b, initRendererSystem as c, crateTextureUrl as d, RendererSystem as e, initObject3DStorage as i, removeObject3DEntity as r};
