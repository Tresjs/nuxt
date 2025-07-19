<script setup lang="ts">
import { getInspectorGraph } from '~/utils/graph'
import { useDevtoolsHook } from '~/composables/useDevtoolsHook'
import type { InspectorNode } from '~/client/types'
// import { PerspectiveCamera } from 'three'

const { scene } = useDevtoolsHook()

const selectedObject = shallowRef<unknown>(null)

function onUpdateModelValue({ value }: { value: unknown }) {
  selectedObject.value = value
}

const inspectorGraph = computed(() => {
  return getInspectorGraph(selectedObject.value)
})

const itemsForSceneGraph = computed(() => {
  return [scene.graph]
})

watch(inspectorGraph, (newVal) => {
  console.log('inspectorGraph', newVal)
})

/* // Reference to the original object for modifications
const selectedObject = ref<unknown>(null)

const object = new PerspectiveCamera()
selectedObject.value = object

inspectorGraph.value = getInspectorGraph(object) */

// Reactive state for inline editing
const editingItem = ref<{ path: string, value: string } | null>(null)

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

/**
 * Copy value to clipboard
 */
const copyValue = async (value: unknown): Promise<void> => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    await navigator.clipboard.writeText(stringValue)
    // You could add a toast notification here
  }
  catch (error) {
    console.error('Failed to copy value:', error)
  }
}

/**
 * Copy property path to clipboard
 */
const copyPath = async (label: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(label)
    // You could add a toast notification here
  }
  catch (error) {
    console.error('Failed to copy path:', error)
  }
}

/**
 * Increment number value
 */
const incrementValue = (item: InspectorNode): void => {
  if (typeof item.value === 'number' && selectedObject.value) {
    const newValue = item.value + 1
    setValueByPath(selectedObject.value, item.path, newValue)
    console.log(`Incremented ${item.path}:`, newValue)

    // The inspector graph will automatically update since it's computed
  }
}

/**
 * Decrement number value
 */
const decrementValue = (item: InspectorNode): void => {
  if (typeof item.value === 'number' && selectedObject.value) {
    const newValue = item.value - 1
    setValueByPath(selectedObject.value, item.path, newValue)
    console.log(`Decremented ${item.path}:`, newValue)

    // The inspector graph will automatically update since it's computed
  }
}

/**
 * Update boolean value via checkbox
 */
const updateBooleanValue = (item: InspectorNode, value: boolean): void => {
  if (selectedObject.value) {
    setValueByPath(selectedObject.value, item.path, value)
    console.log(`Updated boolean ${item.path}:`, value)

    // The inspector graph will automatically update since it's computed
  }
}

/**
 * Start inline editing
 */
const startEditing = (item: InspectorNode): void => {
  const displayValue = typeof item.value === 'string'
    ? item.value
    : JSON.stringify(item.value)
  editingItem.value = { path: item.path, value: displayValue }
}

/**
 * Apply edited value
 */
const applyEdit = (): void => {
  if (!editingItem.value || !selectedObject.value) return

  try {
    const { path, value } = editingItem.value
    // Parse the value based on the original type
    let parsedValue: unknown = value

    // Try to parse as number if it looks like a number
    if (!Number.isNaN(Number(value)) && value.trim() !== '') {
      parsedValue = Number(value)
    }
    // Try to parse as boolean
    else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      parsedValue = value.toLowerCase() === 'true'
    }

    // Update the actual object
    setValueByPath(selectedObject.value, path, parsedValue)
    console.log(`Updated ${path}:`, parsedValue)

    // The inspector graph will automatically update since it's computed
  }
  catch (error) {
    console.error('Failed to apply edit:', error)
  }
  finally {
    editingItem.value = null
  }
}

/**
 * Cancel editing
 */
const cancelEdit = (): void => {
  editingItem.value = null
}

/**
 * Handle input keydown events
 */
const handleInputKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter') {
    applyEdit()
  }
  else if (event.key === 'Escape') {
    cancelEdit()
  }
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <UTree
        v-if="scene.value"
        :value-key="'key'"
        :items="itemsForSceneGraph"
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
      <UTree
        v-if="selectedObject"
        :items="[inspectorGraph]"
        :expanded-icon="'i-tabler:caret-down-filled'"
        :collapsed-icon="'i-tabler:caret-right-filled'"
        :trailing-icon="''"
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
          <div
            v-else
            class="flex items-center gap-1 group"
          >
            <span>{{ item.label }} :</span>

            <!-- Checkbox for boolean values -->
            <UCheckbox
              v-if="typeof item.value === 'boolean'"
              :model-value="item.value"
              size="xs"
              @update:model-value="(value: boolean) => updateBooleanValue(item, value)"
              @click.stop
            />

            <!-- Inline editing input for strings and other types -->
            <UInput
              v-if="editingItem?.path === item.path && typeof item.value !== 'number' && typeof item.value !== 'boolean'"
              v-model="editingItem!.value"
              size="xs"
              variant="subtle"
              class="w-20"
              @keydown.stop="handleInputKeydown"
              @blur="applyEdit"
              @focus="(event: FocusEvent) => (event.target as HTMLInputElement)?.select()"
              @click.stop
            />

            <!-- Number input for numeric values -->
            <UInputNumber
              v-if="editingItem?.path === item.path && typeof item.value === 'number'"
              v-model="editingItem!.value"
              size="xs"
              variant="subtle"
              class="w-20"
              :min="-999999"
              :max="999999"
              @keydown.stop="handleInputKeydown"
              @blur="applyEdit"
              @focus="(event: FocusEvent) => (event.target as HTMLInputElement)?.select()"
              @click.stop
            />

            <!-- Display value (clickable for editing) -->
            <span
              v-else-if="typeof item.value !== 'boolean'"
              :class="[getValueClass(item.value), 'cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded']"
              @click.stop="startEditing(item)"
            >
              {{ getLabel(item.value) }}
            </span>

            <!-- Control buttons -->
            <div
              class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop
            >
              <!-- Copy value button -->
              <UButton
                size="xs"
                variant="ghost"
                color="gray"
                icon="i-tabler:copy"
                title="Copy value"
                @click.stop="copyValue(item.value)"
              />

              <!-- Copy path button -->
              <UButton
                size="xs"
                variant="ghost"
                color="gray"
                icon="i-tabler:link"
                title="Copy path"
                @click.stop="copyPath(item.label)"
              />

              <!-- Number controls -->
              <template v-if="typeof item.value === 'number'">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-tabler:minus"
                  title="Decrease value"
                  @click.stop="decrementValue(item)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-tabler:plus"
                  title="Increase value"
                  @click.stop="incrementValue(item)"
                />
              </template>
            </div>
          </div>
        </template>
      </UTree>
      <!--  <pre>{{ inspectorGraph }}</pre> -->
    </div>
  </div>
</template>
