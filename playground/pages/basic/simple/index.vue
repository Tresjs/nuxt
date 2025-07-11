<script setup lang="ts">
const { clearColor } = useControls({
  clearColor: '#82DBC5',
}, {
  uuid: 'simple',
})
</script>

<template>
  <div class="w-full h-screen relative">
    <ClientOnly>
      <TresLeches uuid="simple" />
    </ClientOnly>
    <TresCanvas
      :clear-color="clearColor"
    >
      <TresPerspectiveCamera />
      <TresMesh>
        <TresBoxGeometry />
        <TresMeshNormalMaterial />
      </TresMesh>
      <OrbitControls />
    </TresCanvas>
  </div>
</template>
