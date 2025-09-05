<script setup lang="ts">
import type { TresObject } from '@tresjs/core'
import { computed } from 'vue'
import { iconsMap } from '../../utils/graph'
import MaterialBadge from './MaterialBadge.vue'
import GeometryBadge from './GeometryBadge.vue'

interface Emits {
  (e: 'update-value', path: string, value: unknown): void
}

const emit = defineEmits<Emits>()

const props = defineProps<{
  object: TresObject
}>()

const titleIcon = computed(() => {
  return iconsMap[props.object.type.toLowerCase()] || 'i-carbon-cube'
})

/**
 * Configuration for important properties per object type
 * Each object type has a set of key properties to highlight
 */
const importantProperties: Record<string, string[]> = {
  // Camera properties
  PerspectiveCamera: ['fov', 'position', 'rotation', 'far', 'near', 'aspect'],
  OrthographicCamera: ['position', 'rotation', 'left', 'right', 'top', 'bottom', 'near', 'far'],

  // Light properties
  DirectionalLight: ['color', 'intensity', 'position', 'target'],
  PointLight: ['color', 'intensity', 'position', 'distance', 'decay'],
  SpotLight: ['color', 'intensity', 'position', 'target', 'angle', 'penumbra'],
  AmbientLight: ['color', 'intensity'],

  // Mesh properties
  Mesh: ['position', 'rotation', 'scale', 'material', 'geometry', 'visible'],
  SkinnedMesh: ['position', 'rotation', 'scale', 'material', 'geometry', 'skeleton'],

  // Group properties
  Group: ['position', 'rotation', 'scale', 'visible'],
  Object3D: ['position', 'rotation', 'scale', 'visible'],

  // Scene properties
  Scene: ['background', 'environment', 'fog'],
}

/**
 * Get the important properties for the current object type
 */
const keyProperties = computed(() => {
  const objectType = props.object.type
  const properties = importantProperties[objectType] || ['position', 'rotation', 'scale']

  return properties.map((prop) => {
    const value = getNestedValue(props.object, prop)
    return {
      key: prop,
      value,
      displayValue: formatPropertyValue(prop, value),
    }
  }).filter(prop => prop.value !== undefined)
})

/**
 * Get nested property value (e.g., position.x, rotation.y)
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' && key in current
      ? (current as Record<string, unknown>)[key]
      : undefined
  }, obj)
}

/**
 * Format property values for display (compact inspector style)
 */
function formatPropertyValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return 'undefined'

  // Handle Vector3-like objects - will be handled separately in template
  if (isVector3(value)) {
    return 'vector' // This won't be displayed, just for identification
  }

  // Handle Material objects - will be handled separately in template
  if (isMaterial(value)) {
    return value.constructor?.name || 'Material'
  }

  // Handle Geometry objects - will be handled separately in template
  if (isGeometry(value)) {
    const geometryName = value.constructor?.name || 'Geometry'
    // Remove "Geometry" suffix and "_" prefix for cleaner display
    return geometryName
      .replace(/Geometry$/, '') // Remove "Geometry" suffix
      .replace(/^_+/, '') // Remove leading underscores
  }

  // Handle Color objects
  if (value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value && 'getHexString' in value) {
    return `#${(value as { getHexString: () => string }).getHexString()}`
  }

  // Handle numbers - more compact
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2)
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  // Handle objects - more compact
  if (typeof value === 'object') {
    return value.constructor?.name || 'Object'
  }

  return String(value)
}

/**
 * Check if value is a Vector3-like object
 */
function isVector3(value: unknown): value is { x: number, y: number, z: number } {
  return value !== null
    && typeof value === 'object'
    && 'x' in value && 'y' in value && 'z' in value
    && typeof value.x === 'number'
    && typeof value.y === 'number'
    && typeof value.z === 'number'
}

/**
 * Check if value is a Material object
 */
function isMaterial(value: unknown): boolean {
  return value !== null
    && typeof value === 'object'
    && value.constructor?.name?.includes('Material')
}

/**
 * Check if value is a Geometry object
 */
function isGeometry(value: unknown): boolean {
  return value !== null
    && typeof value === 'object'
    && value.constructor?.name?.includes('Geometry')
}

/**
 * Get color class for value type (matching inspector tree style)
 */
function getValueClass(value: unknown): string {
  if (typeof value === 'boolean') return 'text-blue-500'
  if (typeof value === 'number') return 'text-green-500'
  if (typeof value === 'string') return 'text-red-500'
  if (typeof value === 'undefined') return 'text-gray-400'
  return 'text-gray-600'
}
</script>

<template>
  <div class="text-sm text-gray-500 pt-2 pb-8">
    <!-- Object Type Header - compact -->
    <div class="flex items-center gap-1 py-0.5 mb-4 hover:bg-gray-50 group">
      <UIcon
        :name="titleIcon"
        class="w-4 h-4 text-gray-600 flex-shrink-0"
      />
      <span class="text-gray-600 font-semibold">{{ object.type }}</span>
      <UBadge
        v-if="object.name"
        variant="soft"
        size="xs"
        class="ml-2"
      >
        {{ object.name }}
      </UBadge>
    </div>

    <!-- Key Properties - following inspector tree pattern -->
    <div class="pl-5 flex flex-col gap-1">
      <div
        v-for="prop in keyProperties"
        :key="prop.key"
        class="flex items-center justify-between py-0.5 hover:bg-gray-50 group"
      >
        <div class="flex items-center gap-1 min-w-0">
          <span>{{ prop.key }} :</span>

          <!-- Vector3 values with individual badges -->
          <template v-if="isVector3(prop.value)">
            <div class="flex items-center gap-1 ml-1">
              <EditableNumber
                v-model="prop.value.x"
                @update:model-value="(val) => emit('update-value', prop.key + '.x', val)"
              />
              <EditableNumber
                v-model="prop.value.y"
                @update:model-value="(val) => emit('update-value', prop.key + '.y', val)"
              />
              <EditableNumber
                v-model="prop.value.z"
                @update:model-value="(val) => emit('update-value', prop.key + '.z', val)"
              />
            </div>
          </template>

          <!-- Material values with color preview -->
          <MaterialBadge
            v-else-if="isMaterial(prop.value)"
            :material="prop.value"
            :display-value="prop.displayValue"
          />

          <!-- Geometry values with icon -->
          <GeometryBadge
            v-else-if="isGeometry(prop.value)"
            :geometry="prop.value"
            :display-value="prop.displayValue"
          />

          <UButton
            v-else-if="prop.key === 'visible'"
            size="xs"
            class="ml-1 mr-1"
            variant="soft"
            :icon="prop.value ? 'i-lucide-eye' : 'i-lucide-eye-closed'"
            @click="() => emit('update-value', prop.key, !prop.value)"
          />

          <!-- Color value with preview dot -->
          <template v-else-if="prop.key === 'color' && prop.value && typeof prop.value === 'object' && 'getHexString' in prop.value">
            <div
              class="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 ml-1 mr-1"
              :style="{ backgroundColor: '#' + (prop.value as { getHexString: () => string }).getHexString() }"
            />
            <span :class="getValueClass(prop.value)">{{ prop.displayValue }}</span>
          </template>

          <!-- Regular values -->
          <template v-else>
            <span
              :class="[getValueClass(prop.value), 'ml-1']"
            >
              {{ prop.displayValue }}
            </span>
          </template>
        </div>

        <div
          class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
          @click.stop
        >
          <!-- Copy value button -->
          <UButton
            size="xs"
            variant="ghost"
            color="gray"
            icon="i-tabler:copy"
            title="Copy value"
            @click.stop="copyValue(node.value)"
          />

          <!-- Copy path button -->
          <UButton
            size="xs"
            variant="ghost"
            color="gray"
            icon="i-tabler:link"
            title="Copy path"
            @click.stop="copyPath(node.path)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
