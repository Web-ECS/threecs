import { Object3DEntity, Object3DSoA, Object3DSoAoA } from '@webecs/do-three'
import * as THREE from 'three'
import { Vector3ProxySoA, Vector3ProxyAoA, Object3DProxy } from '@webecs/do-three'
import { EulerProxySoA, EulerProxyAoA } from '@webecs/do-three'
import { QuaternionProxySoA, QuaternionProxyAoA } from '@webecs/do-three'
import { Object3D } from 'three'

export const _addedEvent = { type: 'added' }
export const _removedEvent = { type: 'removed' }

export class MeshProxy extends THREE.Mesh {
  store: Object3DSoA | Object3DSoAoA
  eid: number
  //@ts-ignore
  parent: (Object3DProxy | MeshProxy) | null
  //@ts-ignore
  children: Object3DEntity[]
  constructor(store: Object3DSoA | Object3DSoAoA, eid: number, geometry: THREE.BufferGeometry, material: THREE.Material) {
    super(geometry, material)

    this.store = store
    this.eid = eid

    this.parent = null

    this.children = []

    //@ts-ignore
    this.matrix.elements = this.store.matrix[eid]

    const position = Array.isArray(this.store.position)
      ? new Vector3ProxyAoA(this.store.position[eid])
      : new Vector3ProxySoA(this.store.position, eid)

    const scale = Array.isArray(this.store.scale)
      ? new Vector3ProxyAoA(this.store.scale[eid])
      : new Vector3ProxySoA(this.store.scale, eid)

    const rotation = Array.isArray(this.store.rotation)
      ? new EulerProxyAoA(this.store.rotation[eid])
      : new EulerProxySoA(this.store.rotation, eid)

    const quaternion = Array.isArray(this.store.quaternion)
      ? new QuaternionProxyAoA(this.store.quaternion[eid])
      : new QuaternionProxySoA(this.store.quaternion, eid)

    function onRotationChange() {
      quaternion.setFromEuler(rotation, false)
    }

    function onQuaternionChange() {
      rotation.setFromQuaternion(quaternion, undefined, false)
    }

    rotation._onChange(onRotationChange)
    quaternion._onChange(onQuaternionChange)

    Object.defineProperties(this, {
      position: { value: position },
      scale: { value: scale },
      rotation: { value: rotation },
      quaternion: { value: quaternion },
    })

    if (this.store.matrixAutoUpdate) Object.defineProperty(this, 'matrixAutoUpdate', {
      get() { return !!this.store.matrixAutoUpdate[this.eid] },
      set(v) { this.store.matrixAutoUpdate[this.eid] = v ? 1 : 0 }
    })

    if (this.store.matrixWorldNeedsUpdate) Object.defineProperty(this, 'matrixWorldNeedsUpdate', {
      get() { return !!this.store.matrixWorldNeedsUpdate[this.eid] },
      set(v) { this.store.matrixWorldNeedsUpdate[this.eid] = v ? 1 : 0 }
    })

    if (this.store.visible) Object.defineProperty(this, 'visible', {
      get() { return !!this.store.visible[this.eid] },
      set(v) { this.store.visible[this.eid] = v ? 1 : 0 }
    })

    if (this.store.castShadow) Object.defineProperty(this, 'castShadow', {
      get() { return !!this.store.castShadow[this.eid] },
      set(v) { this.store.castShadow[this.eid] = v ? 1 : 0 }
    })

    if (this.store.receiveShadow) Object.defineProperty(this, 'receiveShadow', {
      get() { return !!this.store.receiveShadow[this.eid] },
      set(v) { this.store.receiveShadow[this.eid] = v ? 1 : 0 }
    })

    if (this.store.frustumCulled) Object.defineProperty(this, 'frustumCulled', {
      get() { return !!this.store.frustumCulled[this.eid] },
      set(v) { this.store.frustumCulled[this.eid] = v ? 1 : 0 }
    })

    if (this.store.renderOrder) Object.defineProperty(this, 'renderOrder', {
      get() { return !!this.store.renderOrder[this.eid] },
      set(v) { this.store.renderOrder[this.eid] = v }
    })

    // reset defaults
    this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate
    this.visible = true

    this.castShadow = false
    this.receiveShadow = false

    this.frustumCulled = true
    this.renderOrder = 0
  }

  _add(object: any) {
    THREE.Object3D.prototype.add.call(this, object)
  }

  _remove(object: any) {
    THREE.Object3D.prototype.remove.call(this, object)
  }

  _removeFromParent() {
    THREE.Object3D.prototype.removeFromParent.call(this)
  }

  //@ts-ignore
  add(child: Object3DEntity) {
    this._add(child)
    this.store.parent[child.eid] = this.eid
    const lastChild = this.children[this.children.length - 2]
    if (lastChild !== undefined) {
      this.store.prevSibling[child.eid] = lastChild.eid
      this.store.nextSibling[lastChild.eid] = child.eid
    }
    const firstChild = this.children[0]
    if (firstChild) this.store.firstChild[this.eid] = firstChild.eid
    return this
  }

  //@ts-ignore
  remove(child: Object3DEntity) {
    const childIndex = this.children.indexOf(child)
    const prevChild = this.children[childIndex - 1]
    const nextChild = this.children[childIndex + 1]
    if (prevChild !== undefined)
      this.store.nextSibling[prevChild.eid] = nextChild.eid
    if (nextChild !== undefined)
      this.store.prevSibling[nextChild.eid] = prevChild.eid
    this.store.parent[child.eid] = 0
    this.store.nextSibling[child.eid] = 0
    this.store.prevSibling[child.eid] = 0
    this._remove(child)
    const firstChild = this.children[0]
    if (firstChild) this.store.firstChild[this.eid] = firstChild.eid
    return this
  }

  removeFromParent() {
    this._removeFromParent()
    this.store.parent[this.eid] = 0
    return this
  }

  clear() {
    for (let i = 0; i < this.children.length; i++) {
      // original logic
      const object = this.children[i]
      object.parent = null
      object.dispatchEvent(_removedEvent)
      // new logic: clear linked list in proxy stores
      this.store.parent[object.eid] = 0
      this.store.prevSibling[object.eid] = 0
      this.store.nextSibling[object.eid] = 0
    }
    this.children.length = 0
    return this
  }

  traverse(callback: (object: Object3DEntity) => any): void {
    //@ts-ignore
    Object3D.prototype.traverse.call(this, callback)
  }
}