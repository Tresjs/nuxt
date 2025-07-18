<script setup lang="ts">
import { getInspectorGraph } from '~/utils/graph'
import { useDevtoolsHook } from '~/composables/useDevtoolsHook'
import type { InspectorNode } from '~/client/types'
import { PerspectiveCamera } from 'three'

const { scene } = useDevtoolsHook()

const inspectorGraph = shallowRef<InspectorNode[]>([])
function onUpdateModelValue({ value }) {
  /* inspectorGraph.value = getInspectorGraph(value) */
}

inspectorGraph.value = getInspectorGraph(new PerspectiveCamera())

/**
 * Returns the UnoCSS class for the value type.
 * - Boolean: blue
 * - Number: green
 * - Undefined: muted gray (disabled)
 * - String: red
 */
const getValueClass = (value: unknown): string => {
  if (typeof value === 'boolean') return 'text-blue-500'
  if (typeof value === 'number') return 'text-green-500'
  if (typeof value === 'string') return 'text-red-500'
  if (typeof value === 'undefined') return 'text-gray-400'
  if (typeof value === '') return 'text-gray-600'
  return 'text-gray-600' // fallback for objects, null, etc.
}

const getLabel = (value: unknown): string => {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return `"${value}"`
  if (value === null) return 'null'
  if (typeof value === 'undefined') return 'undefined'
  return 'object'
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <UTree
      v-if="scene.graph"
      :items="[scene.graph]"
      @update:model-value="onUpdateModelValue"
    >
      <template #item-label="{ item }">
        <div class="flex gap-2">
          {{ item.label }}
          <UBadge
            v-if="item.name"
            color="primary"
            size="sm"
            variant="subtle"
          >
            {{ item.name }}
          </UBadge>
          <UBadge
            v-if="item.memorySize > 0"
            color="warning"
            size="sm"
            variant="subtle"
          >
            {{ item.memorySize }} KB
          </UBadge>
        </div>
      </template>
    </UTree>
    <div>
      <UTree
        :items="[inspectorGraph]"
        :expanded-icon="'i-tabler:caret-down-filled'"
        :collapsed-icon="'i-tabler:caret-right-filled'"
        :trailing-icon="''"
        :indent-size="10"
        :ui="{
          root: 'relative isolate font-mono text-xs text-gray-500',
        }"
      >
        <template #item-label="{ item }">
          <div
            v-if="item.type === 'object' || item.type === 'array'"
            class="flex gap-2"
          >
            {{ item.label }} : <span class="text-gray-600 font-semibold">{{ item.value }}</span>
          </div>
          <div v-else>
            {{ item.label }} :
            <span :class="getValueClass(item.value)">
              {{ getLabel(item.value) }}
            </span>
          </div>
        </template>
      </UTree>
      <!--  <pre>{{ inspectorGraph }}</pre> -->
    </div>
  </div>
</template>
