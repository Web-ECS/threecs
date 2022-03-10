var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
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
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { E as Euler, Q as Quaternion, V as Vector3, d as defineComponent, f as exitQuery, a as defineQuery, e as defineSystem, b as addComponent, r as removeEntity, c as Types, g as addEntity, O as Object3D, h as removeComponent, i as hasComponent, j as Texture, C as CanvasTexture, k as CompressedTexture, l as CubeTexture, D as DataTexture, m as DepthTexture, n as VideoTexture, B as BoxGeometry, o as CircleGeometry, p as ConeGeometry, q as CylinderGeometry, s as DodecahedronGeometry, t as EdgesGeometry, u as ExtrudeGeometry, I as IcosahedronGeometry, L as LatheGeometry, v as OctahedronGeometry, P as PlaneGeometry, w as PolyhedronGeometry, R as RingGeometry, S as ShapeGeometry, x as SphereGeometry, y as TetrahedronGeometry, z as TorusGeometry, A as TorusKnotGeometry, F as TubeGeometry, W as WireframeGeometry, G as LineBasicMaterial, H as LineDashedMaterial, M as MeshBasicMaterial, J as MeshDepthMaterial, K as MeshDistanceMaterial, N as MeshLambertMaterial, U as MeshMatcapMaterial, X as MeshNormalMaterial, Y as MeshPhongMaterial, Z as MeshPhysicalMaterial, _ as MeshStandardMaterial, $ as MeshToonMaterial, a0 as PointsMaterial, a1 as RawShaderMaterial, a2 as ShaderMaterial, a3 as ShadowMaterial, a4 as SpriteMaterial, a5 as Scene, a6 as Mesh, a7 as SkinnedMesh, a8 as InstancedMesh, a9 as DynamicDrawUsage, aa as Bone, ab as OrthographicCamera, ac as PerspectiveCamera, ad as Group, ae as Line, af as LineLoop, ag as LineSegments, ah as PointLight, ai as Points, aj as SpotLight, ak as Vector2, al as createWorld, am as WebGLRenderer, an as Clock, ao as pipe, ap as MathUtils, aq as $, ar as FI, as as BI, at as iA, au as pA, av as ZA, aw as uA, ax as zA, ay as ArrowHelper, az as enterQuery, aA as HA, aB as TA, aC as AnimationMixer, aD as AudioListener, aE as Audio, aF as PositionalAudio } from "./vendor.52532900.js";
const p = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p();
const EulerOrder = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"];
class EulerProxySoA extends Euler {
  constructor(store, eid, x = 0, y = 0, z = 0) {
    super(x, y, z);
    __publicField(this, "store");
    __publicField(this, "eid");
    __publicField(this, "_x");
    __publicField(this, "_y");
    __publicField(this, "_z");
    this.store = store;
    this.eid = eid;
    this._x = x;
    this._y = y;
    this._z = z;
    this.store.x[this.eid] = x;
    this.store.y[this.eid] = y;
    this.store.z[this.eid] = z;
  }
  get x() {
    if (this.store)
      return this.store.x[this.eid];
  }
  set x(v) {
    this._x = v;
    this._onChangeCallback();
    if (this.store)
      this.store.x[this.eid] = v;
  }
  get y() {
    if (this.store)
      return this.store.y[this.eid];
  }
  set y(v) {
    this._y = v;
    this._onChangeCallback();
    if (this.store)
      this.store.y[this.eid] = v;
  }
  get z() {
    if (this.store)
      return this.store.z[this.eid];
  }
  set z(v) {
    this._z = v;
    this._onChangeCallback();
    if (this.store)
      this.store.z[this.eid] = v;
  }
  get order() {
    if (this.store)
      return EulerOrder[this.store.order[this.eid]];
  }
  set order(v) {
    this.store.order[this.eid] = EulerOrder.indexOf(v);
  }
}
class EulerProxyAoA extends Euler {
  constructor(store, x = 0, y = 0, z = 0) {
    super(x, y, z);
    __publicField(this, "store");
    __publicField(this, "_x");
    __publicField(this, "_y");
    __publicField(this, "_z");
    this.store = store;
    this._x = x;
    this._y = y;
    this._z = z;
    this.store[0] = x;
    this.store[1] = y;
    this.store[2] = z;
  }
  get x() {
    if (this.store)
      return this.store[0];
  }
  set x(v) {
    this._x = v;
    this._onChangeCallback();
    if (this.store)
      this.store[0] = v;
  }
  get y() {
    if (this.store)
      return this.store[1];
  }
  set y(v) {
    this._y = v;
    this._onChangeCallback();
    if (this.store)
      this.store[1] = v;
  }
  get z() {
    if (this.store)
      return this.store[2];
  }
  set z(v) {
    this._z = v;
    this._onChangeCallback();
    if (this.store)
      this.store[2] = v;
  }
  get order() {
    if (this.store)
      return EulerOrder[this.store[3]];
  }
  set order(v) {
    this.store[3] = EulerOrder.indexOf(v);
  }
}
class QuaternionProxySoA extends Quaternion {
  constructor(store, eid, x = 0, y = 0, z = 0, w = 0) {
    super(x, y, z, w);
    __publicField(this, "store");
    __publicField(this, "eid");
    this.store = store;
    this.eid = eid;
    this.store.x[this.eid] = x;
    this.store.y[this.eid] = y;
    this.store.z[this.eid] = z;
    this.store.w[this.eid] = w;
  }
  get _x() {
    if (this.store)
      return this.store.x[this.eid];
  }
  set _x(v) {
    if (this.store)
      this.store.x[this.eid] = v;
  }
  get _y() {
    if (this.store)
      return this.store.y[this.eid];
  }
  set _y(v) {
    if (this.store)
      this.store.y[this.eid] = v;
  }
  get _z() {
    if (this.store)
      return this.store.z[this.eid];
  }
  set _z(v) {
    if (this.store)
      this.store.z[this.eid] = v;
  }
  get _w() {
    if (this.store)
      return this.store.w[this.eid];
  }
  set _w(v) {
    if (this.store)
      this.store.w[this.eid] = v;
  }
}
class QuaternionProxyAoA extends Quaternion {
  constructor(store, x = 0, y = 0, z = 0, w = 0) {
    super(x, y, z, w);
    __publicField(this, "store");
    this.store = store;
    this.store[0] = x;
    this.store[1] = y;
    this.store[2] = z;
    this.store[3] = w;
  }
  get _x() {
    if (this.store)
      return this.store[0];
  }
  set _x(v) {
    if (this.store)
      this.store[0] = v;
  }
  get _y() {
    if (this.store)
      return this.store[1];
  }
  set _y(v) {
    if (this.store)
      this.store[1] = v;
  }
  get _z() {
    if (this.store)
      return this.store[2];
  }
  set _z(v) {
    if (this.store)
      this.store[2] = v;
  }
  get _w() {
    if (this.store)
      return this.store[3];
  }
  set _w(v) {
    if (this.store)
      this.store[3] = v;
  }
}
class Vector3ProxySoA extends Vector3 {
  constructor(store, eid, x = 0, y = 0, z = 0) {
    super(x, y, z);
    __publicField(this, "store");
    __publicField(this, "eid");
    this.eid = eid;
    this.store = store;
    this.store.x[this.eid] = x;
    this.store.y[this.eid] = y;
    this.store.z[this.eid] = z;
  }
  get x() {
    if (this.store)
      return this.store.x[this.eid];
  }
  set x(v) {
    if (this.store)
      this.store.x[this.eid] = v;
  }
  get y() {
    if (this.store)
      return this.store.y[this.eid];
  }
  set y(v) {
    if (this.store)
      this.store.y[this.eid] = v;
  }
  get z() {
    if (this.store)
      return this.store.z[this.eid];
  }
  set z(v) {
    if (this.store)
      this.store.z[this.eid] = v;
  }
}
class Vector3ProxyAoA extends Vector3 {
  constructor(store, x = 0, y = 0, z = 0) {
    super(x, y, z);
    __publicField(this, "store");
    this.store = store;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  get x() {
    if (this.store)
      return this.store[0];
  }
  set x(v) {
    if (this.store)
      this.store[0] = v;
  }
  get y() {
    if (this.store)
      return this.store[1];
  }
  set y(v) {
    if (this.store)
      this.store[1] = v;
  }
  get z() {
    if (this.store)
      return this.store[2];
  }
  set z(v) {
    if (this.store)
      this.store[2] = v;
  }
}
const maxEntities = 1e4;
const traverse = (eid, cb) => {
  cb(eid);
  let nextChild = Object3DComponent.firstChild[eid];
  while (nextChild) {
    cb(nextChild);
    nextChild = Object3DComponent.nextSibling[nextChild];
  }
};
function defineMapComponent(schema, disposeCallback) {
  const component = defineComponent(schema, maxEntities);
  component.store = /* @__PURE__ */ new Map();
  const exit = exitQuery(defineQuery([component]));
  component.disposeSystem = defineSystem((world) => {
    const entities = exit(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const obj = component.store.get(eid);
      if (obj.dispose)
        obj.dispose();
      if (disposeCallback) {
        console.log(disposeCallback);
        disposeCallback(obj, eid);
      }
      component.store.delete(eid);
    }
    return world;
  });
  return component;
}
function addMapComponent(world, component, eid, value) {
  addComponent(world, component, eid, false);
  const obj = component.store.get(eid);
  if (obj)
    Object.assign(obj, value);
  else
    component.store.set(eid, value);
}
function defineProxyComponent(schema) {
  return defineMapComponent(schema);
}
const setParentEntity = (child, parent) => {
  const p2 = Object3DComponent.store.get(parent);
  const c = Object3DComponent.store.get(child);
  p2.add(c);
};
const setChildEntity = (parent, child) => {
  setParentEntity(child, parent);
};
function removeObject3DEntity(world, eid) {
  const obj = Object3DComponent.store.get(eid);
  if (!obj) {
    return;
  }
  if (obj.parent) {
    obj.parent.remove(obj);
  }
  traverse(obj.eid, (eid2) => {
    removeEntity(world, eid2);
  });
}
function singletonQuery(query) {
  return (world) => {
    const entities = query(world);
    return entities.length > 0 ? entities[0] : void 0;
  };
}
const { f32, ui32, ui8 } = Types;
const Vector3Schema = [f32, 3];
const Vector4Schema = [f32, 4];
const Matrix4Schema = [f32, 16];
const Object3DSchema = {
  position: Vector3Schema,
  scale: Vector3Schema,
  rotation: Vector4Schema,
  quaternion: Vector4Schema,
  id: ui32,
  parent: ui32,
  firstChild: ui32,
  prevSibling: ui32,
  nextSibling: ui32,
  matrix: Matrix4Schema,
  matrixWorld: Matrix4Schema,
  matrixAutoUpdate: ui8,
  matrixWorldNeedsUpdate: ui8,
  layers: ui32,
  visible: ui8,
  castShadow: ui8,
  receiveShadow: ui8,
  frustumCulled: ui8,
  renderOrder: f32
};
const Object3DComponent = defineProxyComponent(Object3DSchema);
const VisibleComponent = defineComponent();
const _removedEvent = { type: "removed" };
const Object3DEntityMixin = (Base) => {
  const TypedBase = Base;
  const ReturnType = class extends TypedBase {
    constructor(world, ...args) {
      super(...args);
      __publicField(this, "world");
      __publicField(this, "store");
      __publicField(this, "eid");
      __publicField(this, "parent");
      __publicField(this, "children");
      __publicField(this, "isObject3DEntity");
      this.world = world;
      this.store = Object3DComponent;
      const eid = this.eid = addEntity(world);
      this.parent = null;
      this.children = [];
      this.store.matrix[eid].set(this.matrix.elements);
      this.matrix.elements = this.store.matrix[eid];
      const position = Array.isArray(this.store.position) ? new Vector3ProxyAoA(this.store.position[eid]) : new Vector3ProxySoA(this.store.position, eid);
      const scale = Array.isArray(this.store.scale) ? new Vector3ProxyAoA(this.store.scale[eid]) : new Vector3ProxySoA(this.store.scale, eid);
      scale.set(1, 1, 1);
      const rotation = Array.isArray(this.store.rotation) ? new EulerProxyAoA(this.store.rotation[eid]) : new EulerProxySoA(this.store.rotation, eid);
      const quaternion = Array.isArray(this.store.quaternion) ? new QuaternionProxyAoA(this.store.quaternion[eid]) : new QuaternionProxySoA(this.store.quaternion, eid);
      function onRotationChange() {
        quaternion.setFromEuler(rotation, false);
      }
      function onQuaternionChange() {
        rotation.setFromQuaternion(quaternion, void 0, false);
      }
      rotation._onChange(onRotationChange);
      quaternion._onChange(onQuaternionChange);
      Object.defineProperties(this, {
        position: { value: position },
        scale: { value: scale },
        rotation: { value: rotation },
        quaternion: { value: quaternion }
      });
      this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
      this.visible = true;
      this.castShadow = false;
      this.receiveShadow = false;
      this.frustumCulled = true;
      this.renderOrder = 0;
      this.isObject3DEntity = true;
      addMapComponent(world, Object3DComponent, eid, this);
      addComponent(world, VisibleComponent, eid);
      Object3D.prototype.updateMatrix.call(this);
    }
    addComponent(Component) {
      addComponent(this.world, Component, this.eid, false);
    }
    removeComponent(Component) {
      removeComponent(this.world, Component, this.eid, true);
    }
    _add(object) {
      Object3D.prototype.add.call(this, object);
    }
    _remove(object) {
      Object3D.prototype.remove.call(this, object);
    }
    _removeFromParent() {
      Object3D.prototype.removeFromParent.call(this);
    }
    add(child) {
      this._add(child);
      this.store.parent[child.eid] = this.eid;
      const lastChild = this.children[this.children.length - 2];
      if (lastChild !== void 0) {
        this.store.prevSibling[child.eid] = lastChild.eid;
        this.store.nextSibling[lastChild.eid] = child.eid;
      }
      const firstChild = this.children[0];
      if (firstChild)
        this.store.firstChild[this.eid] = firstChild.eid;
      return this;
    }
    remove(child) {
      const childIndex = this.children.indexOf(child);
      const prevChild = this.children[childIndex - 1];
      const nextChild = this.children[childIndex + 1];
      if (prevChild !== void 0 && nextChild !== void 0) {
        this.store.nextSibling[prevChild.eid] = nextChild.eid;
        this.store.prevSibling[nextChild.eid] = prevChild.eid;
      }
      if (prevChild !== void 0 && nextChild === void 0) {
        this.store.nextSibling[prevChild.eid] = 0;
      }
      if (nextChild !== void 0 && prevChild === void 0) {
        this.store.prevSibling[nextChild.eid] = 0;
      }
      this.store.parent[child.eid] = 0;
      this.store.nextSibling[child.eid] = 0;
      this.store.prevSibling[child.eid] = 0;
      this._remove(child);
      const firstChild = this.children[0];
      if (firstChild)
        this.store.firstChild[this.eid] = firstChild.eid;
      return this;
    }
    removeFromParent() {
      this._removeFromParent();
      this.store.parent[this.eid] = 0;
      return this;
    }
    clear() {
      for (let i = 0; i < this.children.length; i++) {
        const object = this.children[i];
        object.parent = null;
        Object3D.prototype.dispatchEvent.call(this, _removedEvent);
        this.store.parent[object.eid] = 0;
        this.store.prevSibling[object.eid] = 0;
        this.store.nextSibling[object.eid] = 0;
      }
      this.children.length = 0;
      return this;
    }
    traverse(callback) {
      Object3D.prototype.traverse.call(this, callback);
    }
    get matrixAutoUpdate() {
      if (this.store !== void 0)
        return !!this.store.matrixAutoUpdate[this.eid];
      return true;
    }
    set matrixAutoUpdate(v) {
      if (this.store !== void 0)
        this.store.matrixAutoUpdate[this.eid] = v ? 1 : 0;
    }
    get matrixWorldNeedsUpdate() {
      if (this.store !== void 0)
        return !!this.store.matrixWorldNeedsUpdate[this.eid];
      return false;
    }
    set matrixWorldNeedsUpdate(v) {
      if (this.store !== void 0)
        this.store.matrixWorldNeedsUpdate[this.eid] = v ? 1 : 0;
    }
    get visible() {
      if (this.eid)
        return hasComponent(this.world, VisibleComponent, this.eid);
      return true;
    }
    set visible(v) {
      if (this.eid)
        if (v)
          addComponent(this.world, VisibleComponent, this.eid);
        else
          removeComponent(this.world, VisibleComponent, this.eid);
    }
    get castShadow() {
      if (this.store !== void 0)
        return !!this.store.castShadow[this.eid];
      return false;
    }
    set castShadow(v) {
      if (this.store !== void 0)
        this.store.castShadow[this.eid] = v ? 1 : 0;
    }
    get receiveShadow() {
      if (this.store !== void 0)
        return !!this.store.receiveShadow[this.eid];
      return false;
    }
    set receiveShadow(v) {
      if (this.store !== void 0)
        this.store.receiveShadow[this.eid] = v ? 1 : 0;
    }
    get frustumCulled() {
      if (this.store !== void 0)
        return !!this.store.frustumCulled[this.eid];
      return false;
    }
    set frustumCulled(v) {
      if (this.store !== void 0)
        this.store.frustumCulled[this.eid] = v ? 1 : 0;
    }
    get renderOrder() {
      if (this.store !== void 0)
        return this.store.renderOrder[this.eid];
      return 0;
    }
    set renderOrder(v) {
      if (this.store !== void 0)
        this.store.renderOrder[this.eid] = v;
    }
  };
  return ReturnType;
};
const TextureComponent = defineMapComponent();
const TextureEntityMixin = (Base) => {
  const TypedBase = Base;
  const ReturnType = class extends TypedBase {
    constructor(world, ...args) {
      super(...args);
      __publicField(this, "eid");
      __publicField(this, "store");
      this.store = TextureComponent;
      const eid = this.eid = addEntity(world);
      addComponent(world, this.store, eid);
      this.store.store.set(eid, this);
    }
  };
  return ReturnType;
};
class TextureEntity extends TextureEntityMixin(Texture) {
  constructor(world, ...args) {
    super(world, ...args);
  }
}
const CanvasTextureComponent = defineComponent();
class CanvasTextureEntity extends TextureEntityMixin(CanvasTexture) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, CanvasTextureComponent, this.eid);
  }
}
const CompressedTextureComponent = defineComponent();
class CompressedTextureEntity extends TextureEntityMixin(CompressedTexture) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, CompressedTextureComponent, this.eid);
  }
}
const CubeTextureComponent = defineComponent();
class CubeTextureEntity extends TextureEntityMixin(CubeTexture) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, CubeTextureComponent, this.eid);
  }
}
const DataTextureComponent = defineComponent();
class DataTextureEntity extends TextureEntityMixin(DataTexture) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, DataTextureComponent, this.eid);
  }
}
defineComponent();
defineComponent();
const DepthTextureComponent = defineComponent();
class DepthTextureEntity extends TextureEntityMixin(DepthTexture) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, DepthTextureComponent, this.eid);
  }
}
const VideoTextureComponent = defineComponent();
class VideoTextureEntity extends TextureEntityMixin(VideoTexture) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, VideoTextureComponent, this.eid);
  }
}
const GeometryComponent = defineMapComponent();
const GeometryEntityMixin = (Base) => {
  const TypedBase = Base;
  const ReturnType = class extends TypedBase {
    constructor(world, ...args) {
      super(...args);
      __publicField(this, "eid");
      __publicField(this, "store");
      this.store = GeometryComponent;
      const eid = this.eid = addEntity(world);
      addComponent(world, this.store, eid);
      this.store.store.set(eid, this);
    }
  };
  return ReturnType;
};
const BoxGeometryComponent = defineComponent();
class BoxGeometryEntity extends GeometryEntityMixin(BoxGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, BoxGeometryComponent, this.eid);
  }
}
const CircleGeometryComponent = defineComponent();
class CircleGeometryEntity extends GeometryEntityMixin(CircleGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, CircleGeometryComponent, this.eid);
  }
}
const ConeGeometryComponent = defineComponent();
class ConeGeometryEntity extends GeometryEntityMixin(ConeGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, ConeGeometryComponent, this.eid);
  }
}
const CylinderGeometryComponent = defineComponent();
class CylinderGeometryEntity extends GeometryEntityMixin(CylinderGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, CylinderGeometryComponent, this.eid);
  }
}
const DodecahedronGeometryComponent = defineComponent();
class DodecahedronGeometryEntity extends GeometryEntityMixin(DodecahedronGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, DodecahedronGeometryComponent, this.eid);
  }
}
const EdgesGeometryComponent = defineComponent();
class EdgesGeometryEntity extends GeometryEntityMixin(EdgesGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, EdgesGeometryComponent, this.eid);
  }
}
const ExtrudeGeometryComponent = defineComponent();
class ExtrudeGeometryEntity extends GeometryEntityMixin(ExtrudeGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, ExtrudeGeometryComponent, this.eid);
  }
}
defineComponent();
class IcosahedronGeometryEntity extends GeometryEntityMixin(IcosahedronGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, DodecahedronGeometryComponent, this.eid);
  }
}
const LatheGeometryComponent = defineComponent();
class LatheGeometryEntity extends GeometryEntityMixin(LatheGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, LatheGeometryComponent, this.eid);
  }
}
const OctahedronGeometryComponent = defineComponent();
class OctahedronGeometryEntity extends GeometryEntityMixin(OctahedronGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, OctahedronGeometryComponent, this.eid);
  }
}
const PlaneGeometryComponent = defineComponent();
class PlaneGeometryEntity extends GeometryEntityMixin(PlaneGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, PlaneGeometryComponent, this.eid);
  }
}
const PolyhedronGeometryComponent = defineComponent();
class PolyhedronGeometryEntity extends GeometryEntityMixin(PolyhedronGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, PolyhedronGeometryComponent, this.eid);
  }
}
const RingGeometryComponent = defineComponent();
class RingGeometryEntity extends GeometryEntityMixin(RingGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, RingGeometryComponent, this.eid);
  }
}
const ShapeGeometryComponent = defineComponent();
class ShapeGeometryEntity extends GeometryEntityMixin(ShapeGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, ShapeGeometryComponent, this.eid);
  }
}
const SphereGeometryComponent = defineComponent();
class SphereGeometryEntity extends GeometryEntityMixin(SphereGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, SphereGeometryComponent, this.eid);
  }
}
const TetrahedronGeometryComponent = defineComponent();
class TetrahedronGeometryEntity extends GeometryEntityMixin(TetrahedronGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, TetrahedronGeometryComponent, this.eid);
  }
}
const TorusGeometryComponent = defineComponent();
class TorusGeometryEntity extends GeometryEntityMixin(TorusGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, TorusGeometryComponent, this.eid);
  }
}
const TorusKnotGeometryComponent = defineComponent();
class TorusKnotGeometryEntity extends GeometryEntityMixin(TorusKnotGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, TorusKnotGeometryComponent, this.eid);
  }
}
const TubeGeometryComponent = defineComponent();
class TubeGeometryEntity extends GeometryEntityMixin(TubeGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, TubeGeometryComponent, this.eid);
  }
}
const WireframeGeometryComponent = defineComponent();
class WireframeGeometryEntity extends GeometryEntityMixin(WireframeGeometry) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, WireframeGeometryComponent, this.eid);
  }
}
const MaterialComponent = defineMapComponent();
const MaterialEntityMixin = (Base) => {
  const TypedBase = Base;
  const ReturnType = class extends TypedBase {
    constructor(world, ...args) {
      super(...args);
      __publicField(this, "eid");
      __publicField(this, "store");
      const eid = this.eid = addEntity(world);
      this.store = MaterialComponent;
      addComponent(world, this.store, eid);
      this.store.store.set(eid, this);
    }
  };
  return ReturnType;
};
const LineBasicMaterialComponent = defineComponent();
class LineBasicMaterialEntity extends MaterialEntityMixin(LineBasicMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, LineBasicMaterialComponent, this.eid);
  }
}
const LineDashedMaterialComponent = defineComponent();
class LineDashedMaterialEntity extends MaterialEntityMixin(LineDashedMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, LineDashedMaterialComponent, this.eid);
  }
}
const MeshBasicMaterialComponent = defineComponent();
class MeshBasicMaterialEntity extends MaterialEntityMixin(MeshBasicMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshBasicMaterialComponent, this.eid);
  }
}
const MeshDepthMaterialComponent = defineComponent();
class MeshDepthMaterialEntity extends MaterialEntityMixin(MeshDepthMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshDepthMaterialComponent, this.eid);
  }
}
const MeshDistanceMaterialComponent = defineComponent();
class MeshDistanceMaterialEntity extends MaterialEntityMixin(MeshDistanceMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshDistanceMaterialComponent, this.eid);
  }
}
const MeshLambertMaterialComponent = defineComponent();
class MeshLambertMaterialEntity extends MaterialEntityMixin(MeshLambertMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshLambertMaterialComponent, this.eid);
  }
}
const MeshMatcapMaterialComponent = defineComponent();
class MeshMatcapMaterialEntity extends MaterialEntityMixin(MeshMatcapMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshMatcapMaterialComponent, this.eid);
  }
}
const MeshNormalMaterialComponent = defineComponent();
class MeshNormalMaterialEntity extends MaterialEntityMixin(MeshNormalMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshNormalMaterialComponent, this.eid);
  }
}
const MeshPhongMaterialComponent = defineComponent();
class MeshPhongMaterialEntity extends MaterialEntityMixin(MeshPhongMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshPhongMaterialComponent, this.eid);
  }
}
const MeshPhysicalMaterialComponent = defineComponent();
class MeshPhysicalMaterialEntity extends MaterialEntityMixin(MeshPhysicalMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshPhysicalMaterialComponent, this.eid);
  }
}
const MeshStandardMaterialComponent = defineComponent();
class MeshStandardMaterialEntity extends MaterialEntityMixin(MeshStandardMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshStandardMaterialComponent, this.eid);
  }
}
const MeshToonMaterialComponent = defineComponent();
class MeshToonMaterialEntity extends MaterialEntityMixin(MeshToonMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, MeshToonMaterialComponent, this.eid);
  }
}
const PointsMaterialComponent = defineComponent();
class PointsMaterialEntity extends MaterialEntityMixin(PointsMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, PointsMaterialComponent, this.eid);
  }
}
const RawShaderMaterialComponent = defineComponent();
class RawShaderMaterialEntity extends MaterialEntityMixin(RawShaderMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, RawShaderMaterialComponent, this.eid);
  }
}
const ShaderMaterialComponent = defineComponent();
class ShaderMaterialEntity extends MaterialEntityMixin(ShaderMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, ShaderMaterialComponent, this.eid);
  }
}
const ShadowMaterialComponent = defineComponent();
class ShadowMaterialEntity extends MaterialEntityMixin(ShadowMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, ShadowMaterialComponent, this.eid);
  }
}
const SpriteMaterialComponent = defineComponent();
class SpriteMaterialEntity extends MaterialEntityMixin(SpriteMaterial) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, SpriteMaterialComponent, this.eid);
  }
}
const SceneComponent = defineComponent();
class SceneEntity extends Object3DEntityMixin(Scene) {
  constructor(world) {
    super(world);
    addComponent(world, SceneComponent, this.eid);
  }
}
class Object3DEntity extends Object3DEntityMixin(Object3D) {
  constructor(world) {
    super(world);
  }
}
const MeshBaseComponent = defineComponent({
  geometryEid: Types.eid,
  materialEid: Types.eid
});
const MeshBaseEntityMixin = (Base) => {
  const TypedBase = Base;
  const ReturnType = class extends Object3DEntityMixin(TypedBase) {
    constructor(world, geometry, material, ...args) {
      super(world, geometry, material, ...args);
      __publicField(this, "meshBaseStore");
      __publicField(this, "geometryStore");
      __publicField(this, "materialStore");
      this.meshBaseStore = MeshBaseComponent;
      this.geometryStore = GeometryComponent;
      this.materialStore = MaterialComponent;
      addComponent(world, this.meshBaseStore, this.eid);
      this.meshBaseStore.geometryEid[this.eid] = geometry.eid;
      this.meshBaseStore.materialEid[this.eid] = material.eid;
    }
    dispose() {
    }
  };
  return ReturnType;
};
const MeshComponent = defineComponent();
class MeshEntity extends MeshBaseEntityMixin(Mesh) {
  constructor(world, geometry, material) {
    super(world, geometry, material);
    addComponent(world, MeshComponent, this.eid);
  }
}
const SkinnedMeshComponent = defineComponent();
class SkinnedMeshEntity extends MeshBaseEntityMixin(SkinnedMesh) {
  constructor(world, geometry, material) {
    super(world, geometry, material);
    addComponent(world, SkinnedMeshComponent, this.eid);
  }
}
const InstancedMeshImposterComponent = defineComponent({
  instancedMeshEid: Types.eid,
  instancedMeshIndex: Types.ui32,
  needsUpdate: Types.ui8,
  autoUpdate: Types.ui8
});
class InstancedMeshImposterEntity extends MeshBaseEntityMixin(Mesh) {
  constructor(world, instancedMesh) {
    super(world, instancedMesh.geometry, instancedMesh.material);
    this.visible = false;
    addComponent(world, InstancedMeshImposterComponent, this.eid);
    InstancedMeshImposterComponent.instancedMeshEid[this.eid] = instancedMesh.eid;
    InstancedMeshImposterComponent.instancedMeshIndex[this.eid] = instancedMesh.count++;
    InstancedMeshImposterComponent.needsUpdate[this.eid] = 1;
    InstancedMeshImposterComponent.autoUpdate[this.eid] = 0;
  }
}
const InstancedMeshComponent = defineComponent();
class InstancedMeshEntity extends MeshBaseEntityMixin(InstancedMesh) {
  constructor(world, geometry, material, size, count = 0) {
    super(world, geometry, material, size);
    addComponent(world, InstancedMeshComponent, this.eid);
    this.instanceMatrix.setUsage(DynamicDrawUsage);
    this.count = count;
  }
  addInstance() {
  }
}
const BoneComponent = defineComponent();
class BoneEntity extends Object3DEntityMixin(Bone) {
  constructor(world) {
    super(world);
    addComponent(world, BoneComponent, this.eid);
  }
}
const CameraComponent = defineComponent();
const OrthographicCameraComponent = defineComponent();
class OrthographicCameraEntity extends Object3DEntityMixin(OrthographicCamera) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, CameraComponent, this.eid);
    addComponent(world, OrthographicCameraComponent, this.eid);
  }
}
const PerspectiveCameraComponent = defineComponent();
class PerspectiveCameraEntity extends Object3DEntityMixin(PerspectiveCamera) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, CameraComponent, this.eid);
    addComponent(world, PerspectiveCameraComponent, this.eid);
  }
}
const GroupComponent = defineComponent();
class GroupEntity extends Object3DEntityMixin(Group) {
  constructor(world) {
    super(world);
    addComponent(world, GroupComponent, this.eid);
  }
}
const LineComponent = defineComponent();
class LineEntity extends MeshBaseEntityMixin(Line) {
  constructor(world, geometry, material) {
    super(world, geometry, material);
    addComponent(world, LineComponent, this.eid);
  }
}
const LineLoopComponent = defineComponent();
class LineLoopEntity extends MeshBaseEntityMixin(LineLoop) {
  constructor(world, geometry, material) {
    super(world, geometry, material);
    addComponent(world, LineLoopComponent, this.eid);
  }
}
const LineSegmentsComponent = defineComponent();
class LineSegmentsEntity extends MeshBaseEntityMixin(LineSegments) {
  constructor(world, geometry, material) {
    super(world, geometry, material);
    addComponent(world, LineSegmentsComponent, this.eid);
  }
}
const PointLightComponent = defineComponent();
class PointLightEntity extends Object3DEntityMixin(PointLight) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, PointLightComponent, this.eid);
  }
}
const PointsComponent = defineComponent();
class PointsEntity extends MeshBaseEntityMixin(Points) {
  constructor(world, geometry, material) {
    super(world, geometry, material);
    addComponent(world, PointsComponent, this.eid);
  }
}
const SpotLightComponent = defineComponent();
class SpotLightEntity extends Object3DEntityMixin(SpotLight) {
  constructor(world, ...args) {
    super(world, ...args);
    addComponent(world, SpotLightComponent, this.eid);
  }
}
defineMapComponent();
const sceneQuery = defineQuery([Object3DComponent, SceneComponent]);
const mainSceneQuery = singletonQuery(sceneQuery);
const cameraQuery = defineQuery([Object3DComponent, CameraComponent]);
const RendererSystem = function RendererSystem2(world) {
  const { renderer } = world;
  const scenes = sceneQuery(world);
  const cameras = cameraQuery(world);
  if (scenes.length > 0 && cameras.length > 0) {
    const sceneEid = scenes[0];
    const scene = Object3DComponent.store.get(sceneEid);
    const cameraEid = cameras[0];
    const camera = Object3DComponent.store.get(cameraEid);
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
  return world;
};
var ActionType = /* @__PURE__ */ ((ActionType2) => {
  ActionType2["Vector2"] = "Vector2";
  ActionType2["Button"] = "Button";
  return ActionType2;
})(ActionType || {});
var BindingType = /* @__PURE__ */ ((BindingType2) => {
  BindingType2["Axes"] = "Axes";
  BindingType2["Button"] = "Button";
  BindingType2["DirectionalButtons"] = "DirectionalButtons";
  return BindingType2;
})(BindingType || {});
const ActionTypesToBindings = {
  ["Button"]: {
    create: () => ({ pressed: false, released: false, held: false }),
    bindings: {
      ["Button"]: (path, bindingDef, input, actions) => {
        const state = input.get(bindingDef.path);
        const value = actions.get(path);
        value.pressed = !value.held && !!state;
        value.released = value.held && !state;
        value.held = !!state;
      }
    }
  },
  ["Vector2"]: {
    create: () => new Vector2(),
    bindings: {
      ["Axes"]: (path, bindingDef, input, actions) => {
        const { x, y } = bindingDef;
        const value = actions.get(path);
        value.set(input.get(x) || 0, input.get(y) || 0);
      },
      ["DirectionalButtons"]: (path, bindingDef, input, actions) => {
        const { up, down, left, right } = bindingDef;
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
  return world;
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
  const world = createWorld(maxEntities);
  world.dt = 0;
  world.time = 0;
  world.objectEntityMap = /* @__PURE__ */ new Map();
  world.input = /* @__PURE__ */ new Map();
  world.actionMaps = actionMaps || [];
  world.actions = /* @__PURE__ */ new Map();
  world.resizeViewport = true;
  function onResize() {
    world.resizeViewport = true;
  }
  window.addEventListener("resize", onResize);
  addEntity(world);
  const scene = new SceneEntity(world);
  world.scene = scene;
  const camera = new PerspectiveCameraEntity(world);
  world.camera = camera;
  scene.add(camera);
  const renderer = new WebGLRenderer(__spreadValues({
    antialias: true
  }, rendererParameters));
  world.renderer = renderer;
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
    window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: scene }));
    window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: renderer }));
  }
  const clock = new Clock();
  const pipeline = pipe(ActionMappingSystem, ...systems, RendererSystem, ...afterRenderSystems, Object3DComponent.disposeSystem);
  return {
    world,
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
  speed: Types.f32
});
const directionalMovementQuery = defineQuery([
  DirectionalMovementComponent,
  Object3DComponent
]);
const DirectionalMovementSystem = function DirectionalMovementSystem2(world) {
  const moveVec = world.actions.get(DirectionalMovementActions.Move);
  const entities = directionalMovementQuery(world);
  entities.forEach((eid) => {
    const speed = DirectionalMovementComponent.speed[eid] || 10;
    const obj = Object3DComponent.store.get(eid);
    obj.translateZ(-moveVec.y * speed * world.dt);
    obj.translateX(moveVec.x * speed * world.dt);
  });
  return world;
};
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
const FirstPersonCameraSystem = function FirstPersonCameraSystem2(world) {
  const lookVec = world.actions.get(FirstPersonCameraActions.Look);
  const pitchEntities = cameraPitchTargetQuery(world);
  if (Math.abs(lookVec.y) > 1) {
    pitchEntities.forEach((eid) => {
      const obj = Object3DComponent.store.get(eid);
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
      const obj = Object3DComponent.store.get(eid);
      const sensitivity = FirstPersonCameraYawTarget.sensitivity[eid];
      obj.rotation.y -= lookVec.x / (1e3 / (sensitivity || 1));
    });
  }
  return world;
};
const PhysicsWorldComponent = defineMapComponent();
function addPhysicsWorldComponent(world, eid, props = {}) {
  addMapComponent(world, PhysicsWorldComponent, eid, {
    gravity: props.gravity || new Vector3(0, -9.81, 0),
    debug: !!props.debug
  });
}
const physicsWorldQuery = defineQuery([PhysicsWorldComponent]);
const mainPhysicsWorldQuery = singletonQuery(physicsWorldQuery);
const newPhysicsWorldsQuery = enterQuery(physicsWorldQuery);
const InternalPhysicsWorldComponent = defineMapComponent();
var PhysicsColliderShape = /* @__PURE__ */ ((PhysicsColliderShape2) => {
  PhysicsColliderShape2["Box"] = "Box";
  PhysicsColliderShape2["Sphere"] = "Sphere";
  PhysicsColliderShape2["Capsule"] = "Capsule";
  PhysicsColliderShape2["Trimesh"] = "Trimesh";
  return PhysicsColliderShape2;
})(PhysicsColliderShape || {});
const RigidBodyType = $;
var PhysicsGroups = /* @__PURE__ */ ((PhysicsGroups2) => {
  PhysicsGroups2[PhysicsGroups2["None"] = 0] = "None";
  PhysicsGroups2[PhysicsGroups2["All"] = 65535] = "All";
  return PhysicsGroups2;
})(PhysicsGroups || {});
function createInteractionGroup(groups, mask) {
  return groups << 16 | mask;
}
const RigidBodyComponent = defineMapComponent();
function addRigidBodyComponent(world, eid, props = {}) {
  let defaultProps = {
    translation: props.translation || new Vector3(),
    rotation: props.rotation || new Quaternion(),
    shape: props.shape,
    bodyType: props.bodyType === void 0 ? $.Static : props.bodyType,
    solverGroups: props.solverGroups === void 0 ? 4294967295 : props.solverGroups,
    collisionGroups: props.collisionGroups === void 0 ? 4294967295 : props.collisionGroups,
    lockRotations: !!props.lockRotations,
    friction: props.friction === void 0 ? 0.5 : props.friction
  };
  if (props.shape === "Capsule") {
    const capsuleProps = props;
    const defaultCapsuleProps = defaultProps;
    defaultCapsuleProps.halfHeight = capsuleProps.halfHeight === void 0 ? 0.5 : capsuleProps.halfHeight;
    defaultCapsuleProps.radius = capsuleProps.radius === void 0 ? 0.5 : capsuleProps.radius;
  } else if (props.shape == "Trimesh") {
    const trimeshProps = props;
    const defaultTrimeshProps = defaultProps;
    defaultTrimeshProps.indices = trimeshProps.indices;
    defaultTrimeshProps.vertices = trimeshProps.vertices;
  }
  addMapComponent(world, RigidBodyComponent, eid, defaultProps);
}
const rigidBodiesQuery = defineQuery([
  RigidBodyComponent,
  Object3DComponent
]);
const newRigidBodiesQuery = enterQuery(rigidBodiesQuery);
const InternalRigidBodyComponent = defineMapComponent();
const PhysicsRaycasterComponent = defineMapComponent();
function addPhysicsRaycasterComponent(world, eid, props = {}) {
  const useObject3DTransform = props.useObject3DTransform === void 0 ? true : props.useObject3DTransform;
  let transformNeedsUpdate = props.transformNeedsUpdate;
  let transformAutoUpdate = props.transformAutoUpdate;
  if (useObject3DTransform && transformAutoUpdate === void 0) {
    transformAutoUpdate = true;
    transformNeedsUpdate = true;
  } else if (transformNeedsUpdate === void 0) {
    transformNeedsUpdate = true;
  }
  if (transformAutoUpdate === void 0) {
    transformAutoUpdate = false;
  }
  addMapComponent(world, PhysicsRaycasterComponent, eid, {
    useObject3DTransform,
    transformNeedsUpdate,
    transformAutoUpdate,
    withIntersection: !!props.withIntersection,
    withNormal: !!props.withNormal,
    origin: props.origin || new Vector3(0, 0, 0),
    dir: props.dir || new Vector3(0, 0, -1),
    intersection: new Vector3(),
    normal: new Vector3(),
    maxToi: props.maxToi === void 0 ? Number.MAX_VALUE : props.maxToi,
    groups: props.groups === void 0 ? 4294967295 : props.groups,
    debug: !!props.debug
  });
}
const physicsRaycasterQuery = defineQuery([PhysicsRaycasterComponent]);
const newPhysicsRaycastersQuery = enterQuery(physicsRaycasterQuery);
const InternalPhysicsRaycasterComponent = defineMapComponent();
async function loadPhysicsSystem() {
  await FI();
  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();
  return function PhysicsSystem(world) {
    const physicsWorldEid = mainPhysicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);
    const physicsRaycasterEntities = physicsRaycasterQuery(world);
    const newPhysicsRaycasterEntities = newPhysicsRaycastersQuery(world);
    const sceneEid = mainSceneQuery(world);
    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.store.get(eid);
      addMapComponent(world, InternalPhysicsWorldComponent, eid, {
        physicsWorld: new BI(physicsWorldComponent.gravity),
        colliderHandleToEntityMap: /* @__PURE__ */ new Map()
      });
    });
    if (physicsWorldEid === void 0) {
      return;
    }
    const internalPhysicsWorldComponent = InternalPhysicsWorldComponent.store.get(physicsWorldEid);
    const { physicsWorld, colliderHandleToEntityMap } = internalPhysicsWorldComponent;
    newRigidBodyEntities.forEach((rigidBodyEid) => {
      const obj = Object3DComponent.store.get(rigidBodyEid);
      const rigidBodyProps = RigidBodyComponent.store.get(rigidBodyEid);
      const geometry = obj.geometry;
      if (!geometry && !rigidBodyProps.shape) {
        return;
      }
      obj.getWorldPosition(tempVec3);
      obj.getWorldQuaternion(tempQuat);
      const rigidBodyDesc = new iA(rigidBodyProps.bodyType);
      rigidBodyDesc.setRotation(tempQuat.clone());
      rigidBodyDesc.setTranslation(tempVec3.x, tempVec3.y, tempVec3.z);
      if (rigidBodyProps.lockRotations) {
        rigidBodyDesc.lockRotations();
      }
      const body = physicsWorld.createRigidBody(rigidBodyDesc);
      let colliderShape;
      const geometryType = geometry && geometry.type;
      if (geometryType === "BoxGeometry") {
        geometry.computeBoundingBox();
        const boundingBoxSize = geometry.boundingBox.getSize(new Vector3());
        colliderShape = new pA(boundingBoxSize.x / 2, boundingBoxSize.y / 2, boundingBoxSize.z / 2);
      } else if (geometryType === "SphereGeometry") {
        geometry.computeBoundingSphere();
        const radius = geometry.boundingSphere.radius;
        colliderShape = new HA(radius);
      } else if (rigidBodyProps.shape === "Capsule") {
        const { radius, halfHeight } = rigidBodyProps;
        colliderShape = new TA(halfHeight, radius);
      } else if (geometryType === "Mesh" || "Trimesh") {
        const { vertices, indices } = rigidBodyProps;
        const mesh = obj;
        let finalIndices;
        if (indices) {
          finalIndices = indices;
        } else if (mesh.geometry.index) {
          finalIndices = mesh.geometry.index.array;
        } else {
          const { count } = mesh.geometry.attributes.position;
          const arr = new Uint32Array(count);
          for (let i = 0; i < count; i++) {
            arr[i] = i;
          }
          finalIndices = arr;
        }
        colliderShape = new ZA(vertices || mesh.geometry.attributes.position.array, indices || finalIndices);
      } else {
        throw new Error("Unimplemented");
      }
      const colliderDesc = new uA(colliderShape);
      const translation = rigidBodyProps.translation;
      colliderDesc.setTranslation(translation.x, translation.y, translation.z);
      colliderDesc.setRotation(rigidBodyProps.rotation);
      colliderDesc.setCollisionGroups(rigidBodyProps.collisionGroups);
      colliderDesc.setSolverGroups(rigidBodyProps.solverGroups);
      colliderDesc.setFriction(rigidBodyProps.friction);
      const collider = physicsWorld.createCollider(colliderDesc, body.handle);
      colliderHandleToEntityMap.set(collider.handle, rigidBodyEid);
      addMapComponent(world, InternalRigidBodyComponent, rigidBodyEid, {
        body,
        colliderShape
      });
    });
    newPhysicsRaycasterEntities.forEach((raycasterEid) => {
      const raycaster = PhysicsRaycasterComponent.store.get(raycasterEid);
      InternalPhysicsRaycasterComponent.store.set(raycasterEid, {
        ray: new zA(raycaster.origin, raycaster.dir)
      });
    });
    physicsWorld.timestep = world.dt;
    physicsWorld.step();
    physicsRaycasterEntities.forEach((rayCasterEid) => {
      const raycaster = PhysicsRaycasterComponent.store.get(rayCasterEid);
      const obj = Object3DComponent.store.get(rayCasterEid);
      if (raycaster.useObject3DTransform && obj && (raycaster.transformNeedsUpdate || raycaster.transformAutoUpdate)) {
        obj.getWorldPosition(raycaster.origin);
        obj.getWorldDirection(raycaster.dir);
        if (!raycaster.transformAutoUpdate) {
          raycaster.transformNeedsUpdate = false;
        }
      }
      const internalRaycaster = InternalPhysicsRaycasterComponent.store.get(rayCasterEid);
      const colliderSet = physicsWorld.colliders;
      let intersection;
      if (raycaster.withNormal) {
        intersection = physicsWorld.queryPipeline.castRayAndGetNormal(colliderSet, internalRaycaster.ray, raycaster.maxToi, true, raycaster.groups);
        if (intersection) {
          raycaster.normal.copy(intersection.normal);
        } else {
          raycaster.normal.set(0, 0, 0);
        }
      } else {
        intersection = physicsWorld.queryPipeline.castRay(colliderSet, internalRaycaster.ray, raycaster.maxToi, true, raycaster.groups);
      }
      if (intersection) {
        raycaster.colliderEid = colliderHandleToEntityMap.get(intersection.colliderHandle);
        raycaster.toi = intersection.toi;
      } else {
        raycaster.colliderEid = void 0;
        raycaster.toi = void 0;
      }
      if (raycaster.withIntersection) {
        if (raycaster.toi !== void 0) {
          raycaster.intersection.addVectors(raycaster.origin, raycaster.dir).multiplyScalar(raycaster.toi);
        } else {
          raycaster.intersection.set(0, 0, 0);
        }
      }
      if (sceneEid === void 0) {
        return;
      }
      if (raycaster.debug) {
        if (!internalRaycaster.arrowHelper) {
          internalRaycaster.arrowHelper = new ArrowHelper(raycaster.dir, raycaster.origin, raycaster.toi, 16776960, 0.2, 0.1);
          const scene = Object3DComponent.store.get(sceneEid);
          scene.add(internalRaycaster.arrowHelper);
        } else {
          const arrowHelper = internalRaycaster.arrowHelper;
          arrowHelper.position.copy(raycaster.origin);
          arrowHelper.setDirection(raycaster.dir);
          arrowHelper.setLength(raycaster.toi || 0, 0.2, 0.1);
        }
      } else if (!raycaster.debug && internalRaycaster.arrowHelper) {
        const scene = Object3DComponent.store.get(sceneEid);
        scene.remove(internalRaycaster.arrowHelper);
        internalRaycaster.arrowHelper = void 0;
      }
    });
    rigidBodyEntities.forEach((rigidBodyEid) => {
      const obj = Object3DComponent.store.get(rigidBodyEid);
      const { lockRotations } = RigidBodyComponent.store.get(rigidBodyEid);
      const { body } = InternalRigidBodyComponent.store.get(rigidBodyEid);
      if (body.isDynamic()) {
        const translation = body.translation();
        const rotation = body.rotation();
        obj.position.set(translation.x, translation.y, translation.z);
        if (!lockRotations) {
          obj.quaternion.copy(rotation);
        }
      } else if (body.isKinematic()) {
        body.setNextKinematicTranslation(obj.position);
        body.setNextKinematicRotation(obj.quaternion);
      }
    });
    return world;
  };
}
const CharacterPhysicsGroup = 1;
const CharacterInteractionGroup = createInteractionGroup(CharacterPhysicsGroup, PhysicsGroups.All);
const CharacterShapecastInteractionGroup = createInteractionGroup(PhysicsGroups.All, ~CharacterPhysicsGroup);
function physicsCharacterControllerAction(key) {
  return "PhysicsCharacterController/" + key;
}
const PhysicsCharacterControllerActions = {
  Move: physicsCharacterControllerAction("Move"),
  Jump: physicsCharacterControllerAction("Jump"),
  Sprint: physicsCharacterControllerAction("Sprint"),
  Crouch: physicsCharacterControllerAction("Crouch")
};
const PhysicsCharacterControllerComponent = defineMapComponent();
function addPhysicsCharacterControllerComponent(world, eid, props = {}) {
  addMapComponent(world, PhysicsCharacterControllerComponent, eid, Object.assign({
    walkSpeed: 2e3,
    drag: 250,
    maxWalkSpeed: 20,
    jumpForce: 750,
    inAirModifier: 0.5,
    inAirDrag: 100,
    crouchModifier: 0.7,
    crouchJumpModifier: 1.5,
    minSlideSpeed: 3,
    slideModifier: 50,
    slideDrag: 150,
    slideCooldown: 1,
    sprintModifier: 1.8,
    maxSprintSpeed: 25
  }, props));
}
const InternalPhysicsCharacterControllerComponent = defineMapComponent();
function addPhysicsCharacterControllerEntity(world, parent) {
  const playerRig = new Object3DEntity(world);
  if (parent !== void 0) {
    setParentEntity(playerRig.eid, parent);
  }
  addPhysicsCharacterControllerComponent(world, playerRig.eid);
  addRigidBodyComponent(world, playerRig.eid, {
    bodyType: RigidBodyType.Dynamic,
    shape: PhysicsColliderShape.Capsule,
    halfHeight: 0.8,
    radius: 0.5,
    translation: new Vector3(0, 0.8, 0),
    collisionGroups: CharacterInteractionGroup,
    solverGroups: CharacterInteractionGroup,
    lockRotations: true
  });
  return playerRig;
}
const physicsCharacterControllerQuery = defineQuery([
  PhysicsCharacterControllerComponent,
  InternalRigidBodyComponent,
  Object3DComponent
]);
const physicsCharacterControllerAddedQuery = enterQuery(physicsCharacterControllerQuery);
const PhysicsCharacterControllerSystem = function PhysicsCharacterControllerSystem2(world) {
  const physicsWorldEid = mainPhysicsWorldQuery(world);
  const entities = physicsCharacterControllerQuery(world);
  const addedEntities = physicsCharacterControllerAddedQuery(world);
  addedEntities.forEach((eid) => {
    addMapComponent(world, InternalPhysicsCharacterControllerComponent, eid, {
      moveForce: new Vector3(),
      dragForce: new Vector3(),
      linearVelocity: new Vector3(),
      shapeCastPosition: new Vector3(),
      shapeCastRotation: new Quaternion(),
      isSliding: false,
      slideForce: new Vector3(),
      lastSlideTime: 0
    });
  });
  if (physicsWorldEid === void 0) {
    return world;
  }
  const internalPhysicsWorldComponent = InternalPhysicsWorldComponent.store.get(physicsWorldEid);
  if (!internalPhysicsWorldComponent) {
    return world;
  }
  const physicsWorld = internalPhysicsWorldComponent.physicsWorld;
  const moveVec = world.actions.get(PhysicsCharacterControllerActions.Move);
  const jump = world.actions.get(PhysicsCharacterControllerActions.Jump);
  const crouch = world.actions.get(PhysicsCharacterControllerActions.Crouch);
  const sprint = world.actions.get(PhysicsCharacterControllerActions.Sprint);
  entities.forEach((eid) => {
    const {
      walkSpeed,
      drag,
      inAirModifier,
      inAirDrag,
      crouchModifier,
      maxWalkSpeed,
      jumpForce,
      crouchJumpModifier,
      slideModifier,
      slideDrag,
      slideCooldown,
      minSlideSpeed,
      sprintModifier,
      maxSprintSpeed
    } = PhysicsCharacterControllerComponent.store.get(eid);
    const internalPhysicsCharacterController = InternalPhysicsCharacterControllerComponent.store.get(eid);
    const {
      moveForce,
      dragForce,
      linearVelocity,
      shapeCastPosition,
      shapeCastRotation,
      isSliding,
      slideForce,
      lastSlideTime
    } = internalPhysicsCharacterController;
    const obj = Object3DComponent.store.get(eid);
    const {
      translation: shapeTranslationOffset,
      rotation: shapeRotationOffset
    } = RigidBodyComponent.store.get(eid);
    const { body, colliderShape } = InternalRigidBodyComponent.store.get(eid);
    body.setRotation(obj.quaternion, true);
    linearVelocity.copy(body.linvel());
    shapeCastPosition.copy(obj.position).add(shapeTranslationOffset);
    shapeCastRotation.copy(obj.quaternion).multiply(shapeRotationOffset);
    const shapeCastResult = physicsWorld.castShape(shapeCastPosition, shapeCastRotation, physicsWorld.gravity, colliderShape, world.dt, CharacterShapecastInteractionGroup);
    const isGrounded = !!shapeCastResult;
    const isSprinting = isGrounded && sprint.held && !isSliding;
    const speed = linearVelocity.length();
    const maxSpeed = isSprinting ? maxSprintSpeed : maxWalkSpeed;
    if (speed < maxSpeed) {
      moveForce.set(moveVec.x, 0, -moveVec.y).normalize().applyQuaternion(obj.quaternion).multiplyScalar(walkSpeed * world.dt);
      if (!isGrounded) {
        moveForce.multiplyScalar(inAirModifier);
      } else if (isGrounded && crouch.held && !isSliding) {
        moveForce.multiplyScalar(crouchModifier);
      } else if (isGrounded && sprint.held && !isSliding) {
        moveForce.multiplyScalar(sprintModifier);
      }
    }
    if (crouch.pressed && speed > minSlideSpeed && isGrounded && !isSliding && world.time > lastSlideTime + slideCooldown) {
      slideForce.set(0, 0, (speed + 1) * -slideModifier).applyQuaternion(obj.quaternion);
      moveForce.add(slideForce);
      internalPhysicsCharacterController.isSliding = true;
      internalPhysicsCharacterController.lastSlideTime = world.time;
    } else if (crouch.released || world.time > lastSlideTime + slideCooldown) {
      internalPhysicsCharacterController.isSliding = false;
    }
    if (speed !== 0) {
      let dragMultiplier = drag;
      if (isSliding) {
        dragMultiplier = slideDrag;
      } else if (!isGrounded) {
        dragMultiplier = inAirDrag;
      }
      dragForce.copy(linearVelocity).negate().multiplyScalar(dragMultiplier * world.dt);
      moveForce.add(dragForce);
    }
    if (jump.pressed && isGrounded) {
      const jumpModifier = crouch.held ? crouchJumpModifier : 1;
      moveForce.y += jumpForce * jumpModifier;
    }
    moveForce.divideScalar(100);
    body.applyImpulse(moveForce, true);
    body.applyForce(physicsWorld.gravity, true);
  });
  return world;
};
const instancedMeshImposterQuery = defineQuery([
  InstancedMeshImposterComponent,
  Object3DComponent
]);
const InstancedMeshImposterSystem = function InstancedMeshImposterSystem2(world) {
  const entities = instancedMeshImposterQuery(world);
  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    const needsUpdate = InstancedMeshImposterComponent.needsUpdate[eid];
    const autoUpdate = InstancedMeshImposterComponent.autoUpdate[eid];
    if (needsUpdate) {
      const instancedMeshEid = InstancedMeshImposterComponent.instancedMeshEid[eid];
      const index = InstancedMeshImposterComponent.instancedMeshIndex[eid];
      const instancedMeshImposter = Object3DComponent.store.get(eid);
      const instancedMesh = Object3DComponent.store.get(instancedMeshEid);
      instancedMeshImposter.updateMatrixWorld();
      instancedMesh.setMatrixAt(index, instancedMeshImposter.matrixWorld);
      instancedMesh.instanceMatrix.needsUpdate = true;
    }
    if (autoUpdate) {
      InstancedMeshImposterComponent.needsUpdate[eid] = 1;
    }
  }
  return world;
};
const AnimationMixerComponent = defineMapComponent();
function addAnimationMixerComponent(world, eid, props = {}) {
  addMapComponent(world, AnimationMixerComponent, eid, Object.assign({
    state: []
  }, props));
}
const InternalAnimationMixerComponent = defineMapComponent();
const AnimationClipsComponent = defineMapComponent();
function addAnimationClipsComponent(world, eid, animations) {
  addMapComponent(world, AnimationClipsComponent, eid, animations);
}
const animationMixerQuery = defineQuery([
  AnimationMixerComponent,
  Object3DComponent
]);
const newAnimationMixerQuery = enterQuery(animationMixerQuery);
const AnimationSystem = function AnimationSystem2(world) {
  const animationMixerEntities = animationMixerQuery(world);
  const newAnimationMixerEntities = newAnimationMixerQuery(world);
  newAnimationMixerEntities.forEach((eid) => {
    const obj = Object3DComponent.store.get(eid);
    const clips = AnimationClipsComponent.store.get(eid);
    const mixer = new AnimationMixer(obj);
    const actions = [];
    if (clips) {
      for (const clip of clips) {
        actions.push(mixer.clipAction(clip));
      }
    }
    addMapComponent(world, InternalAnimationMixerComponent, eid, {
      mixer,
      actions,
      playingActions: actions.map(() => false)
    });
  });
  animationMixerEntities.forEach((eid) => {
    const { state } = AnimationMixerComponent.store.get(eid);
    const { mixer, actions, playingActions } = InternalAnimationMixerComponent.store.get(eid);
    AnimationClipsComponent.store.get(eid);
    state.forEach((clipState) => {
      const action = actions[clipState.index];
      if (action) {
        if (clipState.loop !== void 0) {
          action.loop = clipState.loop;
        }
      }
      if (clipState.playing && !playingActions[clipState.index]) {
        action.play();
      } else if (!clipState.playing && playingActions[clipState.index]) {
        action.stop();
      }
    });
    mixer.update(world.dt);
  });
  return world;
};
const AudioListenerComponent = defineComponent({});
function addAudioListenerComponent(world, eid) {
  addComponent(world, AudioListenerComponent, eid);
}
const InternalAudioListenerComponent = defineMapComponent();
const AudioSourceComponent = defineMapComponent();
const InternalAudioSourceComponent = defineMapComponent();
function addAudioSourceComponent(world, eid, props) {
  addMapComponent(world, AudioSourceComponent, eid, props);
}
const audioListenerQuery = defineQuery([
  AudioListenerComponent,
  Object3DComponent
]);
const mainAudioListenerQuery = singletonQuery(audioListenerQuery);
const newAudioListenerQuery = enterQuery(audioListenerQuery);
const audioSourceQuery = defineQuery([
  AudioSourceComponent,
  Object3DComponent
]);
const AudioSystem = function AudioSystem2(world) {
  const newAudioListenerEntities = newAudioListenerQuery(world);
  newAudioListenerEntities.forEach((eid) => {
    const obj = Object3DComponent.store.get(eid);
    const audioListener2 = new AudioListener();
    obj._add(audioListener2);
    addMapComponent(world, InternalAudioListenerComponent, eid, audioListener2);
  });
  const mainAudioListenerEid = mainAudioListenerQuery(world);
  if (mainAudioListenerEid === void 0) {
    return;
  }
  const audioListener = InternalAudioListenerComponent.store.get(mainAudioListenerEid);
  const audioSourceEntities = audioSourceQuery(world);
  for (let i = 0; i < audioSourceEntities.length; i++) {
    const eid = audioSourceEntities[i];
    const obj = Object3DComponent.store.get(eid);
    const audioSourceProps = AudioSourceComponent.store.get(eid);
    let audioSource = InternalAudioSourceComponent.store.get(eid);
    if (!audioSource) {
      const el2 = document.createElement("audio");
      el2.setAttribute("playsinline", "");
      el2.setAttribute("webkip-playsinline", "");
      el2.crossOrigin = "anonymous";
      if (audioSourceProps.audioType === "stereo") {
        audioSource = new Audio(audioListener);
      } else if (audioSourceProps.audioType === "pannernode") {
        audioSource = new PositionalAudio(audioListener);
      } else {
        throw new Error("Unknown audio source type");
      }
      InternalAudioSourceComponent.store.set(eid, audioSource);
      audioSource.setMediaElementSource(el2);
      obj.add(audioSource);
    }
    const { src, volume, loop, autoPlay } = audioSourceProps;
    if (audioSourceProps.audioType === "pannernode") {
      const {
        coneInnerAngle,
        coneOuterAngle,
        coneOuterGain,
        distanceModel,
        maxDistance,
        refDistance,
        rolloffFactor
      } = audioSourceProps;
      const positionalAudio = audioSource;
      const pannerNode = positionalAudio.panner;
      if (pannerNode.coneInnerAngle !== coneInnerAngle || pannerNode.coneOuterAngle !== coneOuterAngle || pannerNode.coneOuterGain !== coneOuterGain) {
        positionalAudio.setDirectionalCone(coneInnerAngle, coneOuterAngle, coneOuterGain);
      }
      if (pannerNode.distanceModel !== distanceModel) {
        positionalAudio.setDistanceModel(distanceModel);
      }
      if (pannerNode.maxDistance !== maxDistance) {
        positionalAudio.setMaxDistance(maxDistance);
      }
      if (pannerNode.refDistance !== refDistance) {
        positionalAudio.setRefDistance(refDistance);
      }
      if (pannerNode.rolloffFactor !== rolloffFactor) {
        positionalAudio.setRolloffFactor(rolloffFactor);
      }
    }
    const el = audioSource.source.mediaElement;
    if (el.src !== src) {
      el.src = src;
    }
    if (el.loop !== loop) {
      el.loop = loop;
    }
    if (el.autoplay !== autoPlay) {
      el.autoplay = autoPlay;
    }
    if (audioSource.gain.gain.value !== volume) {
      audioSource.setVolume(volume);
    }
  }
  return world;
};
export { AnimationSystem as A, BindingType as B, addPhysicsRaycasterComponent as C, DirectionalMovementSystem as D, BoxGeometryEntity as E, FirstPersonCameraSystem as F, MeshBasicMaterialEntity as G, InstancedMeshImposterSystem as I, MeshEntity as M, Object3DComponent as O, PhysicsCharacterControllerSystem as P, RigidBodyType as R, singletonQuery as a, AudioSystem as b, createThreeWorld as c, FirstPersonCameraActions as d, ActionType as e, PhysicsCharacterControllerActions as f, addPhysicsWorldComponent as g, addPhysicsCharacterControllerEntity as h, FirstPersonCameraYawTarget as i, FirstPersonCameraPitchTarget as j, addAudioListenerComponent as k, loadPhysicsSystem as l, addMapComponent as m, addAnimationClipsComponent as n, addAudioSourceComponent as o, addRigidBodyComponent as p, PhysicsColliderShape as q, removeObject3DEntity as r, setParentEntity as s, addAnimationMixerComponent as t, InstancedMeshEntity as u, setChildEntity as v, InstancedMeshImposterEntity as w, DirectionalMovementActions as x, Object3DEntity as y, DirectionalMovementComponent as z };
