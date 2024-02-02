<script setup lang="ts">
const { resume } = useRenderLoop()

onMounted(() => {
  resume()
})
</script>

<template>
  <TresCanvas
    :window-size="true"
    clear-color="#82CDef"
  >
    <TresPerspectiveCamera />
    <TresMesh>
      <TresTorusGeometry :args="[1, 0.5, 16, 32]" />
      <TresMeshBasicMaterial color="blue" />
    </TresMesh>
  </TresCanvas>
</template>