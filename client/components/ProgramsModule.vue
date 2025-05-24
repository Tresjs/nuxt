<script setup lang="ts">
import { computed } from 'vue'
import { useDevtoolsHook } from '../composables/useDevtoolsHook'

const { renderer } = useDevtoolsHook()

const icons: Record<string, string> = {
  shaderMaterial: 'i-file-icons-vertexshader',
}

const programs = computed(() => renderer.info.programs.map(
  item => ({
    ...item,
    // @ts-expect-error xxxx
    icon: icons[item.type] || 'i-file-icons-vertexshader',
    // @ts-expect-error xxxx
    uniforms: item.getUniforms(),
    // @ts-expect-error xxxx
    attributes: item.getAttributes(),
  }),
))
</script>

<template>
  <ProgramsModuleItem
    v-for="item in programs"
    :key="item.id"
    :item="item"
  />
</template>
