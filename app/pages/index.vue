<script setup lang="ts">
import type { TornadoRecord } from '~/types/tornado'
import { PRESET_DATASETS } from '~/composables/useTornadoData'
import type { DatasetDef } from '~/composables/useTornadoData'

const { loadFromUrl, loadFromFile } = useTornadoData()

const allRecords = ref<TornadoRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const loadingLabel = ref('')

// Active source tracking
const activeDatasetId = ref(PRESET_DATASETS[0].id)
const activeDataset = computed(
  () => PRESET_DATASETS.find((d) => d.id === activeDatasetId.value) ?? null
)

async function loadSource(url: string, label: string) {
  loading.value = true
  error.value = null
  loadingLabel.value = label
  allRecords.value = []
  // Reset filters when switching datasets
  selectedStates.value = []
  selectedMags.value = []
  try {
    allRecords.value = await loadFromUrl(url)
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

async function loadFile(file: File) {
  loading.value = true
  error.value = null
  loadingLabel.value = file.name
  allRecords.value = []
  activeDatasetId.value = 'custom'
  selectedStates.value = []
  selectedMags.value = []
  try {
    allRecords.value = await loadFromFile(file)
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

function selectPreset(ds: DatasetDef) {
  activeDatasetId.value = ds.id
  loadSource(ds.url, ds.name)
}

// Initial load
onMounted(() => {
  loadSource(PRESET_DATASETS[0].url, PRESET_DATASETS[0].name)
})

const {
  selectedStates,
  selectedMags,
  yearRange,
  filteredRecords,
  stats,
  toggleState,
  toggleMag,
} = useTornadoFilters(allRecords)

// Derive year bounds from loaded data
const dataYearMin = computed(() =>
  allRecords.value.length ? Math.min(...allRecords.value.map((r) => r.yr)) : 1950
)
const dataYearMax = computed(() =>
  allRecords.value.length ? Math.max(...allRecords.value.map((r) => r.yr)) : 2019
)

// Reset year range whenever new data loads
watch(dataYearMin, (min) => { yearRange.value = [min, dataYearMax.value] })
watch(dataYearMax, (max) => { yearRange.value = [dataYearMin.value, max] })

const isHeatmap = ref(false)
const selectedTornado = ref<TornadoRecord | null>(null)

const availableStates = computed(() =>
  [...new Set(allRecords.value.map((r) => r.st).filter(Boolean))].sort()
)

function handleTornadoClick(om: number) {
  selectedTornado.value = allRecords.value.find((r) => r.om === om) ?? null
}

const headerSubtitle = computed(() => {
  if (loading.value) return 'Loading…'
  const ds = activeDataset.value
  const name = ds ? ds.dateRange : 'Custom'
  return `${name} · ${allRecords.value.length.toLocaleString()} records`
})
</script>

<template>
  <div class="flex h-screen bg-gray-950 text-white">
    <!-- Sidebar -->
    <aside class="flex w-72 shrink-0 flex-col overflow-y-auto bg-gray-900 p-4 gap-4">
      <div>
        <h1 class="text-xl font-bold text-white">Tornado Tracker</h1>
        <p class="text-xs text-gray-400">{{ headerSubtitle }}</p>
      </div>

      <DataSourcePanel
        :selected-id="activeDatasetId"
        @select-preset="selectPreset"
        @select-file="loadFile"
      />

      <div>
        <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Year Range</p>
        <YearSlider
          v-model="yearRange"
          :min="dataYearMin"
          :max="dataYearMax"
        />
      </div>

      <HeatmapToggle v-model="isHeatmap" />

      <FilterPanel
        :selected-mags="selectedMags"
        :selected-states="selectedStates"
        :available-states="availableStates"
        @toggle-mag="toggleMag"
        @toggle-state="toggleState"
      />

      <div class="mt-auto border-t border-gray-800 pt-4">
        <StatsSidebar :stats="stats" />
      </div>
    </aside>

    <!-- Map area -->
    <main class="relative flex-1 overflow-hidden">
      <Transition name="fade">
        <div
          v-if="loading"
          class="absolute inset-0 z-50 flex items-center justify-center bg-gray-950"
        >
          <div class="text-center">
            <div class="mb-3 text-5xl">🌪</div>
            <p class="text-gray-300">Loading <span class="text-white font-medium">{{ loadingLabel }}</span>…</p>
            <p class="mt-1 text-xs text-gray-500">This may take a moment for large datasets</p>
          </div>
        </div>
      </Transition>

      <div
        v-if="error"
        class="absolute inset-0 z-50 flex items-center justify-center bg-gray-950"
      >
        <div class="max-w-sm rounded-xl bg-gray-900 p-6 text-center ring-1 ring-red-800">
          <p class="mb-2 text-lg font-semibold text-red-400">Failed to load dataset</p>
          <p class="mb-4 text-sm text-gray-400">{{ error }}</p>
          <button
            class="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
            @click="error = null"
          >
            Dismiss
          </button>
        </div>
      </div>

      <TheMap
        :records="filteredRecords"
        :is-heatmap="isHeatmap"
        class="h-full w-full"
        @tornado-click="handleTornadoClick"
      />

      <TornadoPopup :tornado="selectedTornado" @close="selectedTornado = null" />
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
