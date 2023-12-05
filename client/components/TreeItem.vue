<script setup lang="ts">
interface SceneGraphObject {
  name: string
  type: string
  material: string
  geometry: string
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
  children: SceneGraphObject[]
}
withDefaults(defineProps<{
  item: SceneGraphObject
  depth?: number
}>(), {
  depth: 0,
})

const isExpanded = ref(false)
</script>

<template>
  <div
    :class="{ 'text-sm text-gray-400 font-mono': depth > 0 }"
  >
    <div
      class="flex gap-2 items-end cursor-pointer pt2 mb2"
      @click="isExpanded = !isExpanded"
    >
      <span
        v-if="depth > 0"
        class="h-1 border-b border-gray-300 w-4"
      />
      <div class="flex gap-2 items-center -mb2.5">
        <i :class="item.icon" />{{ item.type }} {{ item.name ? `(${item.name})` : '' }}
      </div>
    </div>
    <div
      v-if="isExpanded"
      class="border-l border-gray-300 ml2.5"
    >
      <TreeItem
        v-for="(child, index) in item.children"
        :key="index"
        :depth="depth + 1"
        :item="child"
      />
    </div>
  </div>
</template>