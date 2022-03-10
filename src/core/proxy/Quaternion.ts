import { Quaternion } from 'three'

export type QuaternionSoA = {
  x: Float32Array
  y: Float32Array
  z: Float32Array
  w: Float32Array
}


export class QuaternionProxySoA extends Quaternion {
  store: QuaternionSoA
  eid: number
  constructor(store: QuaternionSoA, eid: number, x = 0, y = 0, z = 0, w = 0 ) {
    super(x,y,z,w)

    this.store = store
    this.eid = eid

		this.store.x[this.eid] = x
		this.store.y[this.eid] = y
		this.store.z[this.eid] = z
		this.store.w[this.eid] = w

  }
  //@ts-ignore
  get _x() {
    if (this.store)
    return this.store.x[this.eid]
  }
  set _x(v: number) {
    if (this.store)
    this.store.x[this.eid] = v
  }
  //@ts-ignore
  get _y() {
    if (this.store)
    return this.store.y[this.eid]
  }
  set _y(v: number) {
    if (this.store)
    this.store.y[this.eid] = v
  }
  //@ts-ignore
  get _z() {
    if (this.store)
    return this.store.z[this.eid]
  }
  set _z(v: number) {
    if (this.store)
    this.store.z[this.eid] = v
  }
  //@ts-ignore
  get _w() {
    if (this.store)
    return this.store.w[this.eid]
  }
  set _w(v: number) {
    if (this.store)
    this.store.w[this.eid] = v
  }
}



export class QuaternionProxyAoA extends Quaternion {
  store: Float32Array
  constructor(store: Float32Array, x = 0, y = 0, z = 0, w = 0 ) {
    super(x,y,z,w)

    this.store = store

		this.store[0] = x
		this.store[1] = y
		this.store[2] = z
		this.store[3] = w
  }
  //@ts-ignore
  get _x() {
    if (this.store)
    return this.store[0]
  }
  set _x(v: number) {
    if (this.store)
    this.store[0] = v
  }
  //@ts-ignore
  get _y() {
    if (this.store)
    return this.store[1]
  }
  set _y(v: number) {
    if (this.store)
    this.store[1] = v
  }
  //@ts-ignore
  get _z() {
    if (this.store)
    return this.store[2]
  }
  set _z(v: number) {
    if (this.store)
    this.store[2] = v
  }
  //@ts-ignore
  get _w() {
    if (this.store)
    return this.store[3]
  }
  set _w(v: number) {
    if (this.store)
    this.store[3] = v
  }
}
