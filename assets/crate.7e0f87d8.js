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
import {d as defineComponent$1, b as addComponent$1, c as defineSystem$1, e as addEntity$1, f as Types$1, g as defineQuery$1, r as removeEntity$1, h as enterQuery$1, i as removeComponent$1, j as Vector2, k as createWorld, S as Scene, P as PerspectiveCamera, W as WebGLRenderer, C as Clock, p as pipe, l as MathUtils, m as rapier, V as Vector3, A as Ammo, Q as Quaternion, I as InstancedMesh, D as DynamicDrawUsage, M as Mesh} from "./vendor.0520bc5a.js";
const Types = Types$1;
const defineQuery = defineQuery$1;
const addEntity = addEntity$1;
const removeEntity = removeEntity$1;
const defineComponent = defineComponent$1;
const addComponent = addComponent$1;
const removeComponent = removeComponent$1;
const enterQuery = enterQuery$1;
const defineSystem = defineSystem$1;
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
function addObject3DComponent(world, eid, obj, parent) {
  if (parent) {
    parent.add(obj);
  }
  addMapComponent(world, Object3DComponent, eid, obj);
  world.objectEntityMap.set(obj, eid);
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
  world.objectEntityMap.delete(obj);
  obj.traverse((child) => {
    if (child === obj) {
      return;
    }
    const childEid = getObject3DEntity(world, child);
    if (childEid) {
      removeEntity(world, childEid);
      Object3DComponent.storage.delete(childEid);
      world.objectEntityMap.delete(child);
    }
  });
}
function removeObject3DEntity(world, eid) {
  removeObject3DComponent(world, eid);
  removeEntity(world, eid);
}
function getObject3DEntity(world, obj) {
  return world.objectEntityMap.get(obj);
}
const Object3DComponent = defineMapComponent();
const SceneComponent = defineComponent({});
const CameraComponent = defineComponent({});
const RendererComponent = defineMapComponent();
const rendererQuery = defineQuery([RendererComponent]);
const sceneQuery = defineQuery([Object3DComponent, SceneComponent]);
const cameraQuery = defineQuery([Object3DComponent, CameraComponent]);
const RendererSystem = defineSystem(function RendererSystem2(world) {
  const renderers = rendererQuery(world);
  const scenes = sceneQuery(world);
  const cameras = cameraQuery(world);
  if (renderers.length > 0 && scenes.length > 0 && cameras.length > 0) {
    const rendererEid = renderers[0];
    const renderer = RendererComponent.storage.get(rendererEid);
    const sceneEid = scenes[0];
    const scene = Object3DComponent.storage.get(sceneEid);
    const cameraEid = cameras[0];
    const camera = Object3DComponent.storage.get(cameraEid);
    if (scene && camera) {
      if (world.resizeViewport) {
        const canvasParent = renderer.domElement.parentElement;
        if (camera.isPerspectiveCamera) {
          camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
          camera.updateProjectionMatrix();
        }
        renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight, false);
        world.resizeViewport = false;
      }
      renderer.render(scene, camera);
    }
  }
});
var ActionType;
(function(ActionType2) {
  ActionType2["Vector2"] = "Vector2";
})(ActionType || (ActionType = {}));
var BindingType;
(function(BindingType2) {
  BindingType2["Axes"] = "Axes";
  BindingType2["DirectionalButtons"] = "DirectionalButtons";
})(BindingType || (BindingType = {}));
const ActionTypesToBindings = {
  [ActionType.Vector2]: {
    create: () => new Vector2(),
    bindings: {
      [BindingType.Axes]: (path, bindingDef, input, actions) => {
        const {x, y} = bindingDef;
        const value = actions.get(path);
        value.set(input.get(x) || 0, input.get(y) || 0);
      },
      [BindingType.DirectionalButtons]: (path, bindingDef, input, actions) => {
        const {
          up,
          down,
          left,
          right
        } = bindingDef;
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
        const value = actions.get(path);
        value.set(x, y);
      }
    }
  }
};
const ActionMappingSystem = defineSystem(function ActionMappingSystem2(world) {
  for (const actionMap of world.actionMaps) {
    for (const action of actionMap.actions) {
      if (!world.actions.has(action.path)) {
        world.actions.set(action.path, ActionTypesToBindings[action.type].create());
      }
      for (const binding of action.bindings) {
        ActionTypesToBindings[action.type].bindings[binding.type](action.path, binding, world.input, world.actions);
      }
    }
  }
});
function createThreeWorld(options = {}) {
  const {
    pointerLock,
    systems,
    afterRenderSystems,
    rendererParameters,
    actionMaps
  } = Object.assign({
    pointerLock: false,
    actionMaps: [],
    systems: [],
    afterRenderSystems: [],
    rendererParameters: {}
  }, options);
  const world = createWorld();
  world.dt = 0;
  world.time = 0;
  world.objectEntityMap = new Map();
  world.input = new Map();
  world.actionMaps = actionMaps || [];
  world.actions = new Map();
  world.resizeViewport = true;
  function onResize() {
    world.resizeViewport = true;
  }
  window.addEventListener("resize", onResize);
  const scene = new Scene();
  const sceneEid = addObject3DEntity(world, scene);
  addComponent(world, SceneComponent, sceneEid);
  const camera = new PerspectiveCamera();
  const cameraEid = addObject3DEntity(world, camera, scene);
  addComponent(world, CameraComponent, cameraEid);
  const rendererEid = addEntity(world);
  const renderer = new WebGLRenderer(__assign({
    antialias: true
  }, rendererParameters));
  renderer.setPixelRatio(window.devicePixelRatio);
  if (!rendererParameters.canvas) {
    document.body.appendChild(renderer.domElement);
  }
  const canvasParentStyle = renderer.domElement.parentElement.style;
  canvasParentStyle.position = "relative";
  const canvasStyle = renderer.domElement.style;
  canvasStyle.position = "absolute";
  canvasStyle.width = "100%";
  canvasStyle.height = "100%";
  addMapComponent(world, RendererComponent, rendererEid, renderer);
  if (pointerLock) {
    renderer.domElement.addEventListener("mousedown", () => {
      renderer.domElement.requestPointerLock();
    });
  }
  window.addEventListener("keydown", (e) => {
    world.input.set(`Keyboard/${e.key.toLowerCase()}`, 1);
  });
  window.addEventListener("keyup", (e) => {
    world.input.set(`Keyboard/${e.key.toLowerCase()}`, 0);
  });
  window.addEventListener("mousemove", (e) => {
    if (pointerLock && document.pointerLockElement === renderer.domElement) {
      world.input.set("Mouse/movementX", world.input.get("Mouse/movementX") + e.movementX);
      world.input.set("Mouse/movementY", world.input.get("Mouse/movementY") + e.movementY);
    }
  });
  window.addEventListener("blur", () => {
    for (const key of world.input.keys()) {
      world.input.set(key, 0);
    }
  });
  if (typeof window.__THREE_DEVTOOLS__ !== "undefined") {
    window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {detail: scene}));
    window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {detail: renderer}));
  }
  const clock = new Clock();
  const pipeline = pipe(ActionMappingSystem, ...systems, RendererSystem, ...afterRenderSystems);
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
        world.input.set("Mouse/movementX", 0);
        world.input.set("Mouse/movementY", 0);
      });
    }
  };
}
const DirectionalMovementActions = {
  Move: "DirectionalMovement/Move"
};
const DirectionalMovementComponent = defineComponent({
  speed: Types$1.f32
});
const directionalMovementQuery = defineQuery([
  DirectionalMovementComponent,
  Object3DComponent
]);
const DirectionalMovementSystem = defineSystem(function DirectionalMovementSystem2(world) {
  const moveVec = world.actions.get(DirectionalMovementActions.Move);
  const entities = directionalMovementQuery(world);
  entities.forEach((eid) => {
    const speed = DirectionalMovementComponent.speed[eid] || 0.2;
    const obj = Object3DComponent.storage.get(eid);
    obj.translateZ(-moveVec.y * speed);
    obj.translateX(moveVec.x * speed);
  });
});
const FirstPersonCameraActions = {
  Look: "FirstPersonCamera/Look"
};
const FirstPersonCameraPitchTarget = defineComponent({
  maxAngle: Types.f32,
  minAngle: Types.f32,
  sensitivity: Types.f32
});
const FirstPersonCameraYawTarget = defineComponent({
  sensitivity: Types.f32
});
const cameraPitchTargetQuery = defineQuery([
  FirstPersonCameraPitchTarget,
  Object3DComponent
]);
const cameraYawTargetQuery = defineQuery([
  FirstPersonCameraYawTarget,
  Object3DComponent
]);
const FirstPersonCameraSystem = defineSystem(function FirstPersonCameraSystem2(world) {
  const lookVec = world.actions.get(FirstPersonCameraActions.Look);
  const pitchEntities = cameraPitchTargetQuery(world);
  if (Math.abs(lookVec.y) > 1) {
    pitchEntities.forEach((eid) => {
      const obj = Object3DComponent.storage.get(eid);
      const sensitivity = FirstPersonCameraPitchTarget.sensitivity[eid];
      const maxAngle = FirstPersonCameraPitchTarget.maxAngle[eid];
      const minAngle = FirstPersonCameraPitchTarget.minAngle[eid];
      const maxAngleRads = MathUtils.degToRad(maxAngle || 89);
      const minAngleRads = MathUtils.degToRad(minAngle || -89);
      obj.rotation.x -= lookVec.y / (1e3 / (sensitivity || 1));
      if (obj.rotation.x > maxAngleRads) {
        obj.rotation.x = maxAngleRads;
      } else if (obj.rotation.x < minAngleRads) {
        obj.rotation.x = minAngleRads;
      }
    });
  }
  const yawEntities = cameraYawTargetQuery(world);
  if (Math.abs(lookVec.x) > 1) {
    yawEntities.forEach((eid) => {
      const obj = Object3DComponent.storage.get(eid);
      const sensitivity = FirstPersonCameraYawTarget.sensitivity[eid];
      obj.rotation.y -= lookVec.x / (1e3 / (sensitivity || 1));
    });
  }
});
var PhysicsShape;
(function(PhysicsShape2) {
  PhysicsShape2["Box"] = "Box";
  PhysicsShape2["Sphere"] = "Sphere";
})(PhysicsShape || (PhysicsShape = {}));
const PhysicsWorldComponent = defineMapComponent();
const PhysicsRigidBodyComponent = defineMapComponent();
const physicsWorldQuery = defineQuery([PhysicsWorldComponent]);
const newPhysicsWorldsQuery = enterQuery(physicsWorldQuery);
const rigidBodiesQuery = defineQuery([
  PhysicsRigidBodyComponent,
  Object3DComponent
]);
const newRigidBodiesQuery = enterQuery(rigidBodiesQuery);
const AmmoPhysicsWorldComponent = defineMapComponent();
const AmmoPhysicsRigidBodyComponent = defineMapComponent();
async function loadAmmoPhysicsSystem(options) {
  const ammo = await Ammo({
    locateFile(url, scriptDirectory) {
      console.log(url, scriptDirectory);
      if (url.endsWith(".wasm") && options.wasmUrl) {
        return options.wasmUrl;
      }
      return url;
    }
  });
  const tempTransform = new ammo.btTransform();
  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();
  return defineSystem(function AmmoPhysicsSystem(world) {
    const physicsWorldEntities = physicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);
    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid);
      AmmoPhysicsWorldComponent.storage.get(eid);
      const collisionConfig = new ammo.btDefaultCollisionConfiguration();
      const dispatcher = new ammo.btCollisionDispatcher(collisionConfig);
      const overlappingPairCache = new ammo.btDbvtBroadphase();
      const solver = new ammo.btSequentialImpulseConstraintSolver();
      const dynamicsWorld = new ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfig);
      const gravityVec = new ammo.btVector3(0, -9.8, 0);
      const gravityConfig = physicsWorldComponent.gravity;
      if (gravityConfig) {
        gravityVec.setValue(gravityConfig.x, gravityConfig.y, gravityConfig.z);
      }
      dynamicsWorld.setGravity(gravityVec);
      addMapComponent(world, AmmoPhysicsWorldComponent, eid, {
        gravityVec,
        dynamicsWorld
      });
    });
    physicsWorldEntities.forEach((physicsWorldEid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(physicsWorldEid);
      const ammoPhysicsWorldComponent = AmmoPhysicsWorldComponent.storage.get(physicsWorldEid);
      const {gravity, updateGravity} = physicsWorldComponent;
      const {gravityVec, dynamicsWorld} = ammoPhysicsWorldComponent;
      newRigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const {mass, shape} = PhysicsRigidBodyComponent.storage.get(rigidBodyEid);
        const geometry = obj.geometry;
        if (!geometry) {
          return;
        }
        let colShape;
        if (geometry.type === "BoxGeometry") {
          geometry.computeBoundingBox();
          const boundingBoxSize = geometry.boundingBox.getSize(new Vector3());
          const halfExtents = new ammo.btVector3(boundingBoxSize.x / 2, boundingBoxSize.y / 2, boundingBoxSize.z / 2);
          colShape = new ammo.btBoxShape(halfExtents);
        } else if (geometry.type === "SphereGeometry") {
          geometry.computeBoundingSphere();
          const radius = geometry.boundingSphere.radius;
          colShape = new ammo.btSphereShape(radius);
        } else {
          throw new Error("Unimplemented");
        }
        const physScale = new ammo.btVector3(1, 1, 1);
        colShape.setLocalScaling(physScale);
        const localInertia = new ammo.btVector3(0, 0, 0);
        if (mass !== 0) {
          colShape.calculateLocalInertia(mass, localInertia);
        }
        obj.getWorldPosition(tempVec3);
        obj.getWorldQuaternion(tempQuat);
        const quat = new ammo.btQuaternion(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w);
        const pos = new ammo.btVector3(tempVec3.x, tempVec3.y, tempVec3.z);
        const transform = new ammo.btTransform(quat, pos);
        const motionState = new ammo.btDefaultMotionState(transform);
        const constructionInfo = new ammo.btRigidBodyConstructionInfo(mass || 0, motionState, colShape, localInertia);
        const body = new ammo.btRigidBody(constructionInfo);
        dynamicsWorld.addRigidBody(body);
        addMapComponent(world, AmmoPhysicsRigidBodyComponent, rigidBodyEid, {
          body
        });
      });
      if (gravity && updateGravity) {
        gravityVec.setValue(gravity.x, gravity.y, gravity.z);
        dynamicsWorld.setGravity(gravityVec);
        physicsWorldComponent.updateGravity = false;
      }
      dynamicsWorld.stepSimulation(world.dt, 10);
      rigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const {body} = AmmoPhysicsRigidBodyComponent.storage.get(rigidBodyEid);
        const motionState = body.getMotionState();
        if (motionState) {
          motionState.getWorldTransform(tempTransform);
          const position = tempTransform.getOrigin();
          const rotation = tempTransform.getRotation();
          obj.position.set(position.x(), position.y(), position.z());
          obj.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
        }
      });
    });
  });
}
const RapierPhysicsWorldComponent = defineMapComponent();
const RapierPhysicsRigidBodyComponent = defineMapComponent();
async function loadRapierPhysicsSystem() {
  await rapier.init();
  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();
  return defineSystem(function RapierPhysicsSystem(world) {
    const physicsWorldEntities = physicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);
    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid);
      RapierPhysicsWorldComponent.storage.get(eid);
      let gravityVec;
      const gravityConfig = physicsWorldComponent.gravity;
      if (gravityConfig) {
        gravityVec = new rapier.Vector3(gravityConfig.x, gravityConfig.y, gravityConfig.z);
      } else {
        gravityVec = new rapier.Vector3(0, -9.8, 0);
      }
      const rapierWorld = new rapier.World(gravityVec);
      addMapComponent(world, RapierPhysicsWorldComponent, eid, {
        gravityVec,
        rapierWorld
      });
    });
    physicsWorldEntities.forEach((physicsWorldEid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(physicsWorldEid);
      const ammoPhysicsWorldComponent = RapierPhysicsWorldComponent.storage.get(physicsWorldEid);
      const {gravity, updateGravity} = physicsWorldComponent;
      const {gravityVec, rapierWorld} = ammoPhysicsWorldComponent;
      newRigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const {mass, shape} = PhysicsRigidBodyComponent.storage.get(rigidBodyEid);
        const geometry = obj.geometry;
        if (!geometry) {
          return;
        }
        obj.getWorldPosition(tempVec3);
        obj.getWorldQuaternion(tempQuat);
        const rigidBodyDesc = new rapier.RigidBodyDesc(mass === 0 ? rapier.BodyStatus.Static : rapier.BodyStatus.Dynamic);
        rigidBodyDesc.setRotation(new rapier.Quaternion(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w));
        rigidBodyDesc.setTranslation(tempVec3.x, tempVec3.y, tempVec3.z);
        const body = rapierWorld.createRigidBody(rigidBodyDesc);
        let colliderDesc;
        if (geometry.type === "BoxGeometry") {
          geometry.computeBoundingBox();
          const boundingBoxSize = geometry.boundingBox.getSize(new Vector3());
          colliderDesc = rapier.ColliderDesc.cuboid(boundingBoxSize.x / 2, boundingBoxSize.y / 2, boundingBoxSize.z / 2);
        } else if (geometry.type === "SphereGeometry") {
          geometry.computeBoundingSphere();
          const radius = geometry.boundingSphere.radius;
          colliderDesc = rapier.ColliderDesc.ball(radius);
        } else {
          throw new Error("Unimplemented");
        }
        rapierWorld.createCollider(colliderDesc, body.handle);
        addMapComponent(world, RapierPhysicsRigidBodyComponent, rigidBodyEid, {
          body
        });
      });
      if (gravity && updateGravity) {
        rapierWorld.gravity.x = gravity.x;
        rapierWorld.gravity.y = gravity.y;
        rapierWorld.gravity.z = gravity.z;
        physicsWorldComponent.updateGravity = false;
      }
      rapierWorld.step();
      rigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const {body} = RapierPhysicsRigidBodyComponent.storage.get(rigidBodyEid);
        if (body.isDynamic()) {
          const translation = body.translation();
          const rotation = body.rotation();
          obj.position.set(translation.x, translation.y, translation.z);
          obj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        }
      });
    });
  });
}
class InstancedMeshImposter extends Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.visible = false;
  }
}
class InstancedMeshRenderer extends InstancedMesh {
  constructor(geometry, material, maxInstances = 100) {
    super(geometry, material, maxInstances);
    this.instanceMatrix.setUsage(DynamicDrawUsage);
    this.isInstancedMeshRenderer = true;
    this.instances = [];
  }
  createInstance() {
    const mesh = new InstancedMeshImposter(this.geometry, this.material);
    this.instances.push(mesh);
    return mesh;
  }
  removeInstance(mesh) {
    const idx = this.instances.indexOf(mesh);
    if (idx === -1) {
      return false;
    }
    this.instances.splice(idx, 1);
    return true;
  }
  update() {
    this.count = this.instances.length;
    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      instance.updateMatrixWorld();
      this.setMatrixAt(i, instance.matrixWorld);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}
const InstancedMeshRendererComponent = defineComponent({});
const instancedMeshRendererQuery = defineQuery([
  InstancedMeshRendererComponent,
  Object3DComponent
]);
const InstancedMeshRendererSystem = defineSystem(function InstancedMeshRendererSystem2(world) {
  const entities = instancedMeshRendererQuery(world);
  entities.forEach((eid) => {
    const obj = Object3DComponent.storage.get(eid);
    if (!obj.isInstancedMeshRenderer) {
      return;
    }
    obj.update();
  });
});
var crateTextureUrl = "/threecs/assets/crate.a890f0a8.gif";
export {ActionType as A, BindingType as B, DirectionalMovementSystem as D, FirstPersonCameraSystem as F, InstancedMeshRendererSystem as I, Object3DComponent as O, PhysicsWorldComponent as P, Types as T, defineSystem as a, defineComponent as b, createThreeWorld as c, defineMapComponent as d, crateTextureUrl as e, addObject3DEntity as f, addMapComponent as g, addComponent as h, defineQuery as i, loadAmmoPhysicsSystem as j, InstancedMeshRenderer as k, loadRapierPhysicsSystem as l, PhysicsRigidBodyComponent as m, InstancedMeshRendererComponent as n, FirstPersonCameraActions as o, DirectionalMovementActions as p, DirectionalMovementComponent as q, removeObject3DEntity as r, FirstPersonCameraYawTarget as s, FirstPersonCameraPitchTarget as t};
