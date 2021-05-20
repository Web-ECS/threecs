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
var __rest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
import {d as defineComponent$1, b as addComponent$1, c as defineSystem$1, e as addEntity$1, f as Types$1, g as defineQuery$1, r as removeEntity$1, h as enterQuery$1, i as removeComponent$1, j as Vector2, k as createWorld, S as Scene, P as PerspectiveCamera, W as WebGLRenderer, C as Clock, p as pipe, l as MathUtils, V as Vector3, m as rapier, A as ArrowHelper, Q as Quaternion, I as InstancedMesh, D as DynamicDrawUsage, M as Mesh} from "./vendor.1b858d03.js";
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
function singletonQuery(query) {
  return (world) => {
    const entities = query(world);
    return entities.length > 0 ? entities[0] : void 0;
  };
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
  ActionType2["Button"] = "Button";
})(ActionType || (ActionType = {}));
var BindingType;
(function(BindingType2) {
  BindingType2["Axes"] = "Axes";
  BindingType2["Button"] = "Button";
  BindingType2["DirectionalButtons"] = "DirectionalButtons";
})(BindingType || (BindingType = {}));
const ActionTypesToBindings = {
  [ActionType.Button]: {
    create: () => ({pressed: false, released: false, held: false}),
    bindings: {
      [BindingType.Button]: (path, bindingDef, input, actions) => {
        const state = input.get(bindingDef.path);
        const value = actions.get(path);
        value.pressed = !value.held && !!state;
        value.released = value.held && !state;
        value.held = !!state;
      }
    }
  },
  [ActionType.Vector2]: {
    create: () => new Vector2(),
    bindings: {
      [BindingType.Axes]: (path, bindingDef, input, actions) => {
        const {x, y} = bindingDef;
        const value = actions.get(path);
        value.set(input.get(x) || 0, input.get(y) || 0);
      },
      [BindingType.DirectionalButtons]: (path, bindingDef, input, actions) => {
        const {up, down, left, right} = bindingDef;
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
    world.input.set(`Keyboard/${e.code}`, 1);
  });
  window.addEventListener("keyup", (e) => {
    world.input.set(`Keyboard/${e.code}`, 0);
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
const PhysicsWorldComponent = defineMapComponent();
const PhysicsBodyStatus = rapier.BodyStatus;
var PhysicsColliderShape;
(function(PhysicsColliderShape2) {
  PhysicsColliderShape2["Box"] = "Box";
  PhysicsColliderShape2["Sphere"] = "Sphere";
  PhysicsColliderShape2["Capsule"] = "Capsule";
})(PhysicsColliderShape || (PhysicsColliderShape = {}));
const PhysicsRigidBodyComponent = defineMapComponent();
const physicsWorldQuery = defineQuery([PhysicsWorldComponent]);
const newPhysicsWorldsQuery = enterQuery(physicsWorldQuery);
const rigidBodiesQuery = defineQuery([
  PhysicsRigidBodyComponent,
  Object3DComponent
]);
const newRigidBodiesQuery = enterQuery(rigidBodiesQuery);
const RapierPhysicsWorldComponent = defineMapComponent();
const RapierPhysicsRigidBodyComponent = defineMapComponent();
const PhysicsRaycasterComponent = defineMapComponent();
const physicsRaycasterQuery = defineQuery([PhysicsRaycasterComponent]);
const newPhysicsRaycastersQuery = enterQuery(physicsRaycasterQuery);
const mainSceneQuery = singletonQuery(sceneQuery);
const RapierRaycasterComponent = defineMapComponent();
async function loadRapierPhysicsSystem() {
  await rapier.init();
  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();
  return defineSystem(function RapierPhysicsSystem(world) {
    const physicsWorldEntities = physicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);
    const physicsRaycasterEntities = physicsRaycasterQuery(world);
    const newPhysicsRaycasterEntities = newPhysicsRaycastersQuery(world);
    const sceneEid = mainSceneQuery(world);
    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid);
      RapierPhysicsWorldComponent.storage.get(eid);
      const gravityConfig = physicsWorldComponent.gravity;
      const physicsWorld = new rapier.World(gravityConfig || new Vector3(0, -9.8));
      const eventQueue = new rapier.EventQueue(true);
      addMapComponent(world, RapierPhysicsWorldComponent, eid, {
        physicsWorld,
        eventQueue,
        colliderHandleToEntityMap: new Map()
      });
    });
    physicsWorldEntities.forEach((physicsWorldEid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(physicsWorldEid);
      const rapierPhysicsWorldComponent = RapierPhysicsWorldComponent.storage.get(physicsWorldEid);
      const {gravity, updateGravity} = physicsWorldComponent;
      const {physicsWorld, eventQueue, colliderHandleToEntityMap} = rapierPhysicsWorldComponent;
      newRigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const _a = PhysicsRigidBodyComponent.storage.get(rigidBodyEid), {bodyStatus, shape, translation, rotation} = _a, rigidBodyProps = __rest(_a, ["bodyStatus", "shape", "translation", "rotation"]);
        const geometry = obj.geometry;
        if (!geometry && !shape) {
          return;
        }
        obj.getWorldPosition(tempVec3);
        obj.getWorldQuaternion(tempQuat);
        const rigidBodyDesc = new rapier.RigidBodyDesc(bodyStatus !== void 0 ? bodyStatus : PhysicsBodyStatus.Static);
        rigidBodyDesc.setRotation(new rapier.Quaternion(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w));
        rigidBodyDesc.setTranslation(tempVec3.x, tempVec3.y, tempVec3.z);
        const body = physicsWorld.createRigidBody(rigidBodyDesc);
        let colliderDesc;
        const geometryType = geometry && geometry.type;
        if (geometryType === "BoxGeometry") {
          geometry.computeBoundingBox();
          const boundingBoxSize = geometry.boundingBox.getSize(new Vector3());
          colliderDesc = rapier.ColliderDesc.cuboid(boundingBoxSize.x / 2, boundingBoxSize.y / 2, boundingBoxSize.z / 2);
        } else if (geometryType === "SphereGeometry") {
          geometry.computeBoundingSphere();
          const radius = geometry.boundingSphere.radius;
          colliderDesc = rapier.ColliderDesc.ball(radius);
        } else if (shape === PhysicsColliderShape.Capsule) {
          const {radius, halfHeight} = rigidBodyProps;
          colliderDesc = rapier.ColliderDesc.capsule(halfHeight, radius);
        } else {
          throw new Error("Unimplemented");
        }
        if (translation) {
          colliderDesc.setTranslation(translation.x, translation.y, translation.z);
        }
        if (rotation) {
          tempQuat.setFromEuler(rotation);
          colliderDesc.setRotation(new rapier.Quaternion(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w));
        }
        const collider = physicsWorld.createCollider(colliderDesc, body.handle);
        colliderHandleToEntityMap.set(collider.handle, rigidBodyEid);
        addMapComponent(world, RapierPhysicsRigidBodyComponent, rigidBodyEid, {
          body
        });
      });
      newPhysicsRaycasterEntities.forEach((raycasterEid) => {
        const raycaster = PhysicsRaycasterComponent.storage.get(raycasterEid);
        raycaster.intersection = new Vector3();
        if (raycaster.useObject3DTransform === void 0) {
          raycaster.useObject3DTransform = true;
        }
        if (raycaster.withIntersection === void 0) {
          raycaster.withIntersection = false;
        }
        if (raycaster.withNormal === void 0) {
          raycaster.withNormal = false;
        }
        if (!raycaster.origin) {
          raycaster.origin = new Vector3(0, 0, 0);
        }
        if (!raycaster.dir) {
          raycaster.dir = new Vector3(0, 0, -1);
        }
        if (raycaster.useObject3DTransform && raycaster.transformAutoUpdate === void 0) {
          raycaster.transformAutoUpdate = true;
          raycaster.transformNeedsUpdate = true;
        } else if (raycaster.transformNeedsUpdate === void 0) {
          raycaster.transformNeedsUpdate = true;
        }
        if (raycaster.maxToi === void 0) {
          raycaster.maxToi = Number.MAX_VALUE;
        }
        RapierRaycasterComponent.storage.set(raycasterEid, {
          ray: new rapier.Ray(raycaster.origin, raycaster.dir)
        });
      });
      if (gravity && updateGravity) {
        physicsWorld.gravity.x = gravity.x;
        physicsWorld.gravity.y = gravity.y;
        physicsWorld.gravity.z = gravity.z;
        physicsWorldComponent.updateGravity = false;
      }
      physicsWorld.step(eventQueue);
      eventQueue.drainContactEvents((handle1, handle2, contactStarted) => {
        physicsWorld.getCollider(handle1);
        physicsWorld.getCollider(handle2);
      });
      eventQueue.drainIntersectionEvents((handle1, handle2, intersecting) => {
        physicsWorld.getCollider(handle1);
        physicsWorld.getCollider(handle2);
      });
      physicsRaycasterEntities.forEach((rayCasterEid) => {
        const raycaster = PhysicsRaycasterComponent.storage.get(rayCasterEid);
        const obj = Object3DComponent.storage.get(rayCasterEid);
        if (raycaster.useObject3DTransform && obj && (raycaster.transformNeedsUpdate || raycaster.transformAutoUpdate)) {
          obj.getWorldPosition(raycaster.origin);
          obj.getWorldDirection(raycaster.dir);
          if (!raycaster.transformAutoUpdate) {
            raycaster.transformNeedsUpdate = false;
          }
        }
        const internalRaycaster = RapierRaycasterComponent.storage.get(rayCasterEid);
        let intersection;
        if (raycaster.withNormal) {
          intersection = physicsWorld.castRayAndGetNormal(internalRaycaster.ray, raycaster.maxToi);
          if (intersection) {
            raycaster.normal.copy(intersection.normal);
          } else {
            raycaster.normal.set(0, 0, 0);
          }
        } else {
          intersection = physicsWorld.castRay(internalRaycaster.ray, raycaster.maxToi);
        }
        if (intersection) {
          raycaster.colliderEid = colliderHandleToEntityMap.get(intersection.colliderHandle);
          raycaster.toi = intersection.toi;
        } else {
          raycaster.colliderEid = void 0;
          raycaster.toi = void 0;
        }
        if (raycaster.withIntersection) {
          if (raycaster.colliderEid !== void 0) {
            raycaster.intersection.addVectors(raycaster.origin, raycaster.dir).multiplyScalar(raycaster.toi);
          } else {
            raycaster.intersection.set(0, 0, 0);
          }
        }
        if (raycaster.debug) {
          if (!internalRaycaster.arrowHelper) {
            internalRaycaster.arrowHelper = new ArrowHelper(raycaster.dir, raycaster.origin, raycaster.toi, 16776960, 0.2, 0.1);
            const scene = Object3DComponent.storage.get(sceneEid);
            scene.add(internalRaycaster.arrowHelper);
          } else {
            const arrowHelper = internalRaycaster.arrowHelper;
            arrowHelper.position.copy(raycaster.origin);
            arrowHelper.setDirection(raycaster.dir);
            arrowHelper.setLength(raycaster.toi, 0.2, 0.1);
          }
        } else if (!raycaster.debug && internalRaycaster.arrowHelper) {
          const scene = Object3DComponent.storage.get(sceneEid);
          scene.remove(internalRaycaster.arrowHelper);
          internalRaycaster.arrowHelper = void 0;
        }
      });
      rigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const {body} = RapierPhysicsRigidBodyComponent.storage.get(rigidBodyEid);
        if (body.isDynamic() || body.isKinematic()) {
          const translation = body.translation();
          const rotation = body.rotation();
          obj.position.set(translation.x, translation.y, translation.z);
          obj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        }
      });
    });
  });
}
const PhysicsCharacterControllerActions = {
  Move: "PhysicsCharacterController/Move",
  Jump: "PhysicsCharacterController.Jump"
};
const PhysicsCharacterControllerComponent = defineMapComponent();
const KinematicRigidBodyStateComponent = defineMapComponent();
const physicsCharacterControllerQuery = defineQuery([
  PhysicsCharacterControllerComponent,
  RapierPhysicsRigidBodyComponent
]);
const physicsCharacterControllerAddedQuery = enterQuery(physicsCharacterControllerQuery);
const PhysicsCharacterControllerSystem = defineSystem(function PhysicsCharacterControllerSystem2(world) {
  const physicsWorldEntities = physicsWorldQuery(world);
  const entities = physicsCharacterControllerQuery(world);
  const addedEntities = physicsCharacterControllerAddedQuery(world);
  addedEntities.forEach((eid) => {
    addMapComponent(world, KinematicRigidBodyStateComponent, eid, {
      velocity: new Vector3()
    });
  });
  physicsWorldEntities.forEach((worldEid) => {
    entities.forEach((eid) => {
      const moveVec = world.actions.get(PhysicsCharacterControllerActions.Move);
      const jump = world.actions.get(PhysicsCharacterControllerActions.Jump);
      const dt = world.dt;
      const {speed} = PhysicsCharacterControllerComponent.storage.get(eid);
      const {body} = RapierPhysicsRigidBodyComponent.storage.get(eid);
      const {velocity} = KinematicRigidBodyStateComponent.storage.get(eid);
      const translation = body.translation();
      const _speed = speed === void 0 ? 1 : speed;
      velocity.z = -moveVec.y * _speed;
      velocity.x = moveVec.x * _speed;
      if (jump.pressed) {
        velocity.y = 1.5;
      }
      {
        velocity.y = 0;
      }
      translation.x += velocity.x * dt;
      translation.y += velocity.y * dt;
      translation.z += velocity.z * dt;
      body.setNextKinematicTranslation(translation);
    });
  });
});
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
export {ActionType as A, BindingType as B, DirectionalMovementSystem as D, FirstPersonCameraSystem as F, InstancedMeshRendererSystem as I, Object3DComponent as O, PhysicsCharacterControllerSystem as P, Types as T, defineSystem as a, defineComponent as b, createThreeWorld as c, defineMapComponent as d, crateTextureUrl as e, addObject3DEntity as f, addMapComponent as g, addComponent as h, defineQuery as i, FirstPersonCameraActions as j, PhysicsCharacterControllerActions as k, loadRapierPhysicsSystem as l, PhysicsWorldComponent as m, PhysicsCharacterControllerComponent as n, PhysicsBodyStatus as o, PhysicsColliderShape as p, PhysicsRigidBodyComponent as q, removeObject3DEntity as r, FirstPersonCameraYawTarget as s, FirstPersonCameraPitchTarget as t, InstancedMeshRenderer as u, InstancedMeshRendererComponent as v, DirectionalMovementActions as w, PhysicsRaycasterComponent as x, DirectionalMovementComponent as y};
