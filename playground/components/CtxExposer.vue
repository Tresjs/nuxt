<script setup lang="ts">
const { renderer, scene } = useTresContext()

const { onLoop } = useRenderLoop()
onMounted(() => {
  window.__TRES__ = {
    renderer,
    scene,
  }

  setTimeout(() => {
    window.__TRES__DEVTOOLS__.cb({
      renderer,
      scene,
    })
  }, 3000)
})

/* 
/* onLoop(({ elapsed }) => {
  const iframe = document.querySelector('iframe[id*="devtools"]')
  const internalIframe = iframe?.contentWindow.document.querySelector('iframe')

  if (internalIframe) {
    internalIframe.contentWindow.postMessage({
      type: 'tresjs:devtools',
      payload: JSON.stringify({
        renderer: renderer.value,
      }),
    }, '*')
  }
}) */
</script>

<template>
</template>
