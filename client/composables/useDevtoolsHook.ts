import type { TresObject } from '@tresjs/core'
import type { Scene } from 'three'
import type { SceneGraphObject, ProgramObject } from '../types'
import { reactive, shallowReactive } from '#imports'
import type { UnwrapNestedRefs } from 'vue'
import { getObjectHash, getSceneGraph } from '../utils/graph'

export interface FPSState {
  value: number
  accumulator: number[]
  lastLoggedTime: number
  logInterval: number
}

export interface MemoryState {
  currentMem: number
  averageMem: number
  maxMemory: number
  allocatedMem: number
  accumulator: number[]
  lastLoggedTime: number
  logInterval: number
}

export interface RendererType {
  fps: UnwrapNestedRefs<FPSState>
  memory: UnwrapNestedRefs<MemoryState>
  renderer: UnwrapNestedRefs<RendererState>
}

export interface RendererState {
  info: {
    render: {
      frame: number
      calls: number
      triangles: number
      points: number
      lines: number
    }
    memory: {
      geometries: number
      textures: number
    }
    programs: WebGLProgram[]
  }
}

export interface DevtoolsHookReturn {
  scene: {
    objects: number
    graph: Record<string, unknown>
    value: Scene | undefined
    selected: TresObject | undefined
  }
  fps: FPSState
  memory: MemoryState
  renderer: RendererState
}

const scene = shallowReactive<{
  objects: number
  graph: SceneGraphObject | null
  value: Scene | undefined
  selected: TresObject | undefined
}>({
  objects: 0,
  graph: null,
  value: undefined,
  selected: undefined,
})

const gl = {
  fps: reactive<FPSState>({
    value: 0,
    accumulator: [],
    lastLoggedTime: Date.now(),
    logInterval: 1000,
  }),
  memory: reactive<MemoryState>({
    currentMem: 0,
    averageMem: 0,
    maxMemory: 0,
    allocatedMem: 0,
    accumulator: [],
    lastLoggedTime: Date.now(),
    logInterval: 1000,
  }),
  renderer: reactive<RendererState>({
    info: {
      render: {
        frame: 0,
        calls: 0,
        triangles: 0,
        points: 0,
        lines: 0,
      },
      memory: {
        geometries: 0,
        textures: 0,
      },
      programs: [],
    },
  }),
} satisfies RendererType

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

export interface DevtoolsState {
  scene: {
    objects: number
    graph: SceneGraphObject | null
    value: Scene | undefined
    selected: TresObject | undefined
  }
  fps: FPSState
  memory: MemoryState
  renderer: RendererState
}

function _useDevtoolsHook(): DevtoolsHookReturn {
  const state: DevtoolsState = {
    scene: shallowReactive({
      objects: 0,
      graph: null,
      value: undefined,
      selected: undefined,
    }),
    fps: {
      value: 0,
      accumulator: [],
      lastLoggedTime: Date.now(),
      logInterval: 1000,
    },
    memory: {
      currentMem: 0,
      averageMem: 0,
      maxMemory: 0,
      allocatedMem: 0,
      accumulator: [],
      lastLoggedTime: Date.now(),
      logInterval: 1000,
    },
    renderer: {
      info: {
        render: {
          frame: 0,
          calls: 0,
          triangles: 0,
          points: 0,
          lines: 0,
        },
        memory: {
          geometries: 0,
          textures: 0,
        },
        programs: [],
      },
    },
  }

  // Connect with Core
  const tresGlobalHook = {
    cb({ context, performance }) {
      if (state?.scene?.value === undefined) {
        state.scene.value = context.scene.value
        state.scene.objects = countObjectsInScene(context.scene.value)
        state.scene.graph = getSceneGraph(context.scene.value as unknown as TresObject)
      }
      /* else {
        const hasChanged = getObjectHash(context.scene.value) !== getObjectHash(state.scene.value as unknown as TresObject)
        if (hasChanged) {
          state.scene.value = context.scene.value
          state.scene.objects = countObjectsInScene(context.scene.value)
          state.scene.graph = getSceneGraph(context.scene.value as unknown as TresObject)
        }
      } */
      Object.assign(state.fps, performance.fps)
      state.fps.accumulator = [...performance.fps.accumulator]
      Object.assign(state.memory, performance.memory)
      state.memory.accumulator = [...performance.memory.accumulator]
      Object.assign(state.renderer.info.render, context.renderer.instance.info.render)
      Object.assign(state.renderer.info.memory, context.renderer.instance.info.memory)
      state.renderer.info.programs = [...(context.renderer.instance.info.programs || []) as unknown as ProgramObject[]]
    },
  }

  window.parent.parent.__TRES__DEVTOOLS__ = tresGlobalHook

  return state
}

export const useDevtoolsHook = createSharedComposable(_useDevtoolsHook)
