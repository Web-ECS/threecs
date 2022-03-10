import { Euler } from 'three'

export type EulerSoA = {
  x: Float32Array
  y: Float32Array
  z: Float32Array
  order: Uint8Array
}

const EulerOrder = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ]

export class EulerProxySoA extends Euler {
  store: EulerSoA
  eid: number
  _x: number
  _y: number
  _z: number
  constructor(store: EulerSoA, eid: number, x = 0, y = 0, z = 0 ) {
    super(x,y,z)

    this.store = store
    this.eid = eid

    this._x = x
    this._y = y
    this._z = z
		this.store.x[this.eid] = x
		this.store.y[this.eid] = y
		this.store.z[this.eid] = z

  }
  //@ts-ignore
  get x() {
    if (this.store)
    return this.store.x[this.eid]
  }
  set x(v: number) {
    this._x = v
    this._onChangeCallback()
    if (this.store)
    this.store.x[this.eid] = v
  }
  //@ts-ignore
  get y() {
    if (this.store)
    return this.store.y[this.eid]
  }
  set y(v: number) {
    this._y = v
    this._onChangeCallback()
    if (this.store)
    this.store.y[this.eid] = v
  }
  //@ts-ignore
  get z() {
    if (this.store)
    return this.store.z[this.eid]
  }
  set z(v: number) {
    this._z = v
    this._onChangeCallback()
    if (this.store)
    this.store.z[this.eid] = v
  }
  //@ts-ignore
  get order() {
    if (this.store)
    return EulerOrder[this.store.order[this.eid]]
  }
  //@ts-ignore
  set order(v: string) {
    this.store.order[this.eid] = EulerOrder.indexOf(v)
  }
}

export class EulerProxyAoA extends Euler {
  store: Float32Array
  _x: number
  _y: number
  _z: number
  constructor(store: Float32Array, x = 0, y = 0, z = 0 ) {
    super(x,y,z)

    this.store = store
    
    this._x = x
    this._y = y
    this._z = z
		this.store[0] = x
		this.store[1] = y
		this.store[2] = z
  }
  //@ts-ignore
  get x() {
    if (this.store)
    return this.store[0]
  }
  set x(v: number) {
    this._x = v
    this._onChangeCallback()
    if (this.store)
    this.store[0] = v
  }
  //@ts-ignore
  get y() {
    if (this.store)
    return this.store[1]
  }
  set y(v: number) {
    this._y = v
    this._onChangeCallback()
    if (this.store)
    this.store[1] = v
  }
  //@ts-ignore
  get z() {
    if (this.store)
    return this.store[2]
  }
  set z(v: number) {
    this._z = v
    this._onChangeCallback()
    if (this.store)
    this.store[2] = v
  }
  //@ts-ignore
  get order() {
    if (this.store)
    return EulerOrder[this.store[3]]
  }
  //@ts-ignore
  set order(v: string) {
    this.store[3] = EulerOrder.indexOf(v)
  }
}
