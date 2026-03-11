<script setup lang="ts">
const props = defineProps<{
  stats: {
    count: number
    totalFatalities: number
    totalInjuries: number
    totalLoss: number
    byMagnitude: { mag: number; count: number }[]
    topStates: { state: string; count: number }[]
  }
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

const maxMagCount = computed(() => Math.max(...props.stats.byMagnitude.map((b) => b.count), 1))

function formatNumber(n: number) {
  return n.toLocaleString()
}

function formatLoss(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n}`
}
</script>

<template>
  <div class="space-y-4 text-sm">
    <!-- Totals grid -->
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-lg bg-gray-800 p-3 text-center">
        <div class="text-xl font-bold text-white">{{ formatNumber(stats.count) }}</div>
        <div class="text-xs text-gray-400">Tornadoes</div>
      </div>
      <div class="rounded-lg bg-gray-800 p-3 text-center">
        <div class="text-xl font-bold text-red-400">{{ formatNumber(stats.totalFatalities) }}</div>
        <div class="text-xs text-gray-400">Fatalities</div>
      </div>
      <div class="rounded-lg bg-gray-800 p-3 text-center">
        <div class="text-xl font-bold text-orange-400">{{ formatNumber(stats.totalInjuries) }}</div>
        <div class="text-xs text-gray-400">Injuries</div>
      </div>
      <div class="rounded-lg bg-gray-800 p-3 text-center">
        <div class="text-xl font-bold text-yellow-400">{{ formatLoss(stats.totalLoss) }}</div>
        <div class="text-xs text-gray-400">Est. Loss</div>
      </div>
    </div>

    <!-- Magnitude breakdown -->
    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">By Magnitude</p>
      <div class="space-y-1">
        <div v-for="entry in stats.byMagnitude" :key="entry.mag" class="flex items-center gap-2">
          <span class="w-8 shrink-0 text-right text-xs font-bold" :style="{ color: MAG_COLORS[entry.mag] }">
            {{ MAG_LABELS[entry.mag] ?? `EF${entry.mag}` }}
          </span>
          <div class="flex-1 rounded bg-gray-800">
            <div
              class="h-3 rounded transition-all duration-300"
              :style="{
                width: `${(entry.count / maxMagCount) * 100}%`,
                backgroundColor: MAG_COLORS[entry.mag],
                minWidth: entry.count > 0 ? '2px' : '0',
              }"
            />
          </div>
          <span class="w-14 shrink-0 text-right text-xs text-gray-400">
            {{ formatNumber(entry.count) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Top states -->
    <div v-if="stats.topStates.length">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Top States</p>
      <div class="space-y-1">
        <div
          v-for="(item, i) in stats.topStates"
          :key="item.state"
          class="flex items-center justify-between rounded bg-gray-800 px-2 py-1"
        >
          <span class="text-xs text-gray-300">
            <span class="mr-1 text-gray-500">{{ i + 1 }}.</span>{{ item.state }}
          </span>
          <span class="text-xs font-medium text-white">{{ formatNumber(item.count) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
