<script setup lang="ts">
import type { TornadoRecord } from '~/types/tornado'

const props = defineProps<{
  tornado: TornadoRecord | null
}>()

const emit = defineEmits<{
  close: []
}>()

const MAG_COLORS: Record<number, string> = {
  '-9': '#6b7280',
  0: '#86efac',
  1: '#fde047',
  2: '#fb923c',
  3: '#f87171',
  4: '#c026d3',
  5: '#7f1d1d',
}

const MAG_LABELS: Record<number, string> = {
  '-9': 'EF?',
  0: 'EF0',
  1: 'EF1',
  2: 'EF2',
  3: 'EF3',
  4: 'EF4',
  5: 'EF5',
}

const magColor = computed(() => MAG_COLORS[props.tornado?.mag ?? -9] ?? '#6b7280')
const magLabel = computed(() => MAG_LABELS[props.tornado?.mag ?? -9] ?? `EF${props.tornado?.mag}`)
</script>

<template>
  <Transition name="popup">
    <div
      v-if="tornado"
      class="absolute bottom-4 left-1/2 z-[1000] w-80 -translate-x-1/2 rounded-xl bg-gray-900 p-4 shadow-2xl ring-1 ring-gray-700"
    >
      <button
        class="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
        @click="emit('close')"
      >
        ✕
      </button>

      <div class="mb-3 flex items-center gap-3">
        <span
          class="rounded px-2 py-1 text-sm font-bold"
          :style="{ backgroundColor: magColor, color: tornado.mag >= 3 ? '#fff' : '#111' }"
        >
          {{ magLabel }}
        </span>
        <div>
          <p class="font-semibold text-white">{{ tornado.st }} — {{ tornado.date }}</p>
          <p class="text-xs text-gray-400">OM {{ tornado.om }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div class="text-gray-400">Length</div>
        <div class="text-right text-white">{{ tornado.len?.toFixed(1) ?? '–' }} mi</div>

        <div class="text-gray-400">Width</div>
        <div class="text-right text-white">{{ tornado.wid ?? '–' }} yd</div>

        <div class="text-gray-400">Fatalities</div>
        <div class="text-right font-bold" :class="tornado.fat > 0 ? 'text-red-400' : 'text-white'">
          {{ tornado.fat ?? 0 }}
        </div>

        <div class="text-gray-400">Injuries</div>
        <div class="text-right font-bold" :class="tornado.inj > 0 ? 'text-orange-400' : 'text-white'">
          {{ tornado.inj ?? 0 }}
        </div>

        <div class="text-gray-400">Start</div>
        <div class="text-right font-mono text-xs text-gray-300">
          {{ tornado.slat?.toFixed(3) }}, {{ tornado.slon?.toFixed(3) }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.popup-enter-active,
.popup-leave-active {
  transition: all 0.25s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}
</style>
