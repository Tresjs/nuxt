import type { BufferGeometry, Material } from 'three'

export interface SceneGraphObject {
  name: string
  type: string
  icon: string
  position: {
    x: number
    y: number
    z: number
  }
  rotation: {
    x: number
    y: number
    z: number
  }
  scale?: {
    x: number
    y: number
    z: number
  }
  color?: string
  intensity?: number
  material?: Material
  geometry?: BufferGeometry
  children: SceneGraphObject[]
  [key: string]: any
}