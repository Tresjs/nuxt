import type { TresObject } from '@tresjs/core'
import type { Scene, WebGLRenderer } from 'three'
import type { SceneGraphObject } from '../types'

const scene = reactive({
  objects: 0,
  graph: {},
  value: undefined as Scene | undefined,
})

const gl = {
  fps: reactive({
    value: 0,
    accumulator: [],
    lastLoggedTime: Date.now(),
    logInterval: 1000,
  }),
  memory: reactive({
    currentMem: 0,
    averageMem: 0,
    maxMemory: 0,
    allocatedMem: 0,
    accumulator: [],
    lastLoggedTime: Date.now(),
    logInterval: 1000,
  }),
  renderer: undefined as WebGLRenderer | undefined,
}

const icons: Record<string, string> = {
  scene: 'i-carbon-web-services-container',
  perspectivecamera: 'i-carbon-video',
  mesh: 'i-carbon-cube',
  group: 'i-carbon-group-objects',
  ambientlight: 'i-carbon-light',
  directionallight: 'i-carbon-light',
  spotlight: 'i-iconoir-project-curve-3d',
  position: 'i-iconoir-axes',
  rotation: 'i-carbon-rotate-clockwise',
  scale: 'i-iconoir-ellipse-3d-three-points',
  bone: 'i-ph-bone',
  skinnedmesh: 'carbon:3d-print-mesh',
}

function createNode(object: TresObject) {
  const node: SceneGraphObject = {
    name: object.name,
    type: object.type,
    icon: icons[object.type.toLowerCase()] || 'i-carbon-cube',
    position: {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z,
    },
    rotation: {
      x: object.rotation.x,
      y: object.rotation.y,
      z: object.rotation.z,
    },
    children: [],
  }

  if (object.type === 'Mesh') {
    node.material = object.material
    node.geometry = object.geometry
    node.scale = {
      x: object.scale.x,
      y: object.scale.y,
      z: object.scale.z,
    }
  }

  if (object.type.includes('Light')) {
    node.color = object.color.getHexString()
    node.intensity = object.intensity
  }
  return node
}

function getSceneGraph(scene: TresObject) {
  
  function buildGraph(object: TresObject, node: SceneGraphObject) {
    object.children.forEach((child: TresObject) => {
      const childNode = createNode(child)
      node.children.push(childNode)
      buildGraph(child, childNode)
    })
  }

  const root = createNode(scene)
  buildGraph(scene, root)

  return root
}

function countObjectsInScene(scene: Scene) {
  let count = 0

  scene.traverse((object) => {
    // Check if the object is a 3D object
    if (object.isObject3D) {
      count++
    }
  })

  return count
}

export function useDevtoolsHook() {
  // Connect with Core
  const tresGlobalHook = {
    cb(context: { renderer: Ref<WebGLRenderer>; scene: Ref<Scene> }) {
      scene.value = context.scene.value
      scene.objects = countObjectsInScene(context.scene.value)
      gl.renderer = context.renderer.value
      Object.assign(gl.fps, context.perf.fps)
      gl.fps.accumulator = [...context.perf.fps.accumulator]
      Object.assign(gl.memory, context.perf.memory)
      gl.memory.accumulator = [...context.perf.memory.accumulator]
      scene.graph = getSceneGraph(context.scene.value as unknown as TresObject)
    },
  }

  window.parent.parent.__TRES__DEVTOOLS__ = tresGlobalHook

  return {
    scene,
    gl,
    fps: gl.fps,
    memory: gl.memory,
  }
}