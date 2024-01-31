<script setup lang="ts">
</script>

<template>
  <TresCanvas window-size>
    <TresPerspectiveCamera />
    <TresMesh>
      <TresTorusGeometry :args="[1, 0.5, 16, 32]" />
      <TresMeshBasicMaterial color="blue" />
    </TresMesh>
  </TresCanvas>
</template>