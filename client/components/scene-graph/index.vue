<script setup lang="ts">
import type { TresObject } from '@tresjs/core'
import type { Mesh } from 'three'
import { createHighlightMesh, getInspectorGraph } from '~/utils/graph'
import { useDevtoolsHook } from '~/composables/useDevtoolsHook'
import { computed, ref, shallowRef, toValue } from 'vue'

const { scene } = useDevtoolsHook()

const selectedObject = shallowRef<unknown>(null)
const highlightMesh = shallowRef<Mesh | null>(null)
const refreshTrigger = ref(0)

function updateSelectedObject(object: TresObject) {
  /* const highlightMesh = scene.value?.children.find(child => child.type === 'HighlightMesh')
  if (highlightMesh) {
    scene.value?.remove(highlightMesh)
  }
 */
  if (selectedObject.value) {
    selectedObject.value.remove(highlightMesh.value)
  }
  if (object && object.isMesh) {
    highlightMesh.value = createHighlightMesh(object as TresObject)
    object.add(toValue(highlightMesh))
  }

  selectedObject.value = object
  refreshTrigger.value++
}

const inspectorGraph = computed(() => {
  // Use refreshTrigger to force reactivity
  // eslint-disable-next-line
  refreshTrigger.value
  return getInspectorGraph(selectedObject.value)
})

/* // Reference to the original object for modifications
const selectedObject = ref<unknown>(null)

const object = new PerspectiveCamera()
selectedObject.value = object

inspectorGraph.value = getInspectorGraph(object) */

// Handler for value updates from TreeInspector
const handleValueUpdate = (path: string, value: unknown): void => {
  if (selectedObject.value) {
    setValueByPath(selectedObject.value, path, value)
    console.log(`Updated ${path}:`, value)
    // Trigger reactive update
    refreshTrigger.value++
  }
}

/**
 * Sets a value in an object using a dot-notation path
 * @param obj The object to modify
 * @param path The path to the property (e.g., "position.x", "scale.y")
 * @param value The new value
 */
const setValueByPath = (obj: unknown, path: string, value: unknown): void => {
  if (!obj || typeof obj !== 'object') return

  const keys = path.split('.')
  let current = obj as Record<string, unknown>

  // Navigate to the parent of the target property
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    if (current[key] && typeof current[key] === 'object') {
      current = current[key] as Record<string, unknown>
    }
    else {
      return // Path doesn't exist
    }
  }

  // Set the value on the final property
  const finalKey = keys[keys.length - 1]!
  current[finalKey] = value
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <TreeGraph
        v-if="scene.value && scene.graph"
        :key="scene.graph.key"
        :item="scene.graph"
        @select-object="updateSelectedObject"
      />
      <UAlert
        v-else
        color="neutral"
        variant="subtle"
        title="No scene available"
        description="Please open a view with a scene to view its graph."
        icon="i-lucide-terminal"
      />
    </div>
    <div>
      <div
        v-if="selectedObject"
        class="relative isolate"
      >
        <InspectorProps
          :key="refreshTrigger"
          :object="selectedObject"
          @update-value="handleValueUpdate"
        />
        <USeparator />
        <InspectorTree
          class="pt-4"
          :node="inspectorGraph"
          :selected-object="selectedObject"
          @update-value="handleValueUpdate"
        />
      </div>
    </div>
  </div>
</template>
