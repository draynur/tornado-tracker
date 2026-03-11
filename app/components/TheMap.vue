<script setup lang="ts">
import type { TornadoRecord } from '~/types/tornado'

defineProps<{
  records: TornadoRecord[]
  isHeatmap: boolean
}>()

const emit = defineEmits<{
  'tornado-click': [om: number]
}>()
</script>

<template>
  <ClientOnly>
    <MapLeaflet
      :records="records"
      :is-heatmap="isHeatmap"
      class="h-full w-full"
      @tornado-click="emit('tornado-click', $event)"
    />
  </ClientOnly>
</template>
