<script setup lang="ts">
const { renderer, scene } = useTresContext()

const { onLoop } = useRenderLoop()
onMounted(() => {
  window.__TRES__ = {
    renderer,
    scene,
  }
})

let accumulatedTime = 0
const interval = 1 // Interval in milliseconds, e.g., 1000 ms = 1 second

onLoop(({ delta }) => {
  if (!window.__TRES__DEVTOOLS__) return

  // Accumulate the delta time
  accumulatedTime += delta

  // Check if the accumulated time is greater than or equal to the interval
  if (accumulatedTime >= interval) {
    window.__TRES__DEVTOOLS__.cb({
      renderer,
      scene,
    })

    // Reset the accumulated time
    accumulatedTime = 0
  }
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
