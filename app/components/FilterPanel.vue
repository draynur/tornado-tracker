<script setup lang="ts">
const props = defineProps<{
  selectedMags: number[]
  selectedStates: string[]
  availableStates: string[]
}>()

const emit = defineEmits<{
  'toggle-mag': [mag: number]
  'toggle-state': [state: string]
}>()

const MAGS = [
  { mag: -9, label: 'EF?', color: '#6b7280' },
  { mag: 0, label: 'EF0', color: '#86efac' },
  { mag: 1, label: 'EF1', color: '#fde047' },
  { mag: 2, label: 'EF2', color: '#fb923c' },
  { mag: 3, label: 'EF3', color: '#f87171' },
  { mag: 4, label: 'EF4', color: '#c026d3' },
  { mag: 5, label: 'EF5', color: '#7f1d1d' },
]
</script>

<template>
  <div class="space-y-3">
    <div>
      <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Magnitude</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="m in MAGS"
          :key="m.mag"
          class="rounded px-2 py-1 text-xs font-bold transition-opacity"
          :style="{
            backgroundColor: m.color,
            color: m.mag === 5 || m.mag === 3 ? '#fff' : '#111',
            opacity: selectedMags.length === 0 || selectedMags.includes(m.mag) ? 1 : 0.35,
          }"
          @click="emit('toggle-mag', m.mag)"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <div v-if="availableStates.length">
      <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">State</p>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="st in availableStates"
          :key="st"
          class="rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
          :class="
            selectedStates.includes(st)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          "
          @click="emit('toggle-state', st)"
        >
          {{ st }}
        </button>
      </div>
    </div>
  </div>
</template>
