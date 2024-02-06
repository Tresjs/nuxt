import { TresCanvas as TresCanvasCore } from '@tresjs/core'
import { defineComponent, h, onMounted, ref } from '#imports'

export default defineComponent({
  setup(props, { slots }) {
    if (import.meta.server) {
      return () => h('span')
    }

    const mounted = ref(false)
    onMounted(() => (mounted.value = true))

    return () => mounted.value ? h(TresCanvasCore, props, slots) : h('span')
  },
}) as unknown as typeof TresCanvasCore
