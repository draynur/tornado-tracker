<script setup lang="ts">
import { PRESET_DATASETS, REQUIRED_COLUMNS, OPTIONAL_COLUMNS } from '~/composables/useTornadoData'
import type { DatasetDef } from '~/composables/useTornadoData'

const props = defineProps<{
  selectedId: string
}>()

const emit = defineEmits<{
  'select-preset': [dataset: DatasetDef]
  'select-file': [file: File]
}>()

const showFormat = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const uploadError = ref<string | null>(null)

function handleFileChange(e: Event) {
  uploadError.value = null
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!file.name.endsWith('.csv')) {
    uploadError.value = 'Only .csv files are supported.'
    return
  }

  emit('select-file', file)
}

function triggerUpload() {
  uploadError.value = null
  fileInput.value?.click()
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Data Source</p>

    <!-- Preset datasets -->
    <div class="space-y-1.5">
      <button
        v-for="ds in PRESET_DATASETS"
        :key="ds.id"
        class="w-full rounded-lg border px-3 py-2 text-left transition-colors"
        :class="
          selectedId === ds.id
            ? 'border-blue-500 bg-blue-950 text-white'
            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-750'
        "
        @click="emit('select-preset', ds)"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold">{{ ds.name }}</span>
          <span class="shrink-0 rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-400">
            {{ ds.recordCount }}
          </span>
        </div>
        <div class="mt-0.5 text-xs text-gray-500">{{ ds.source }} · {{ ds.dateRange }}</div>
      </button>
    </div>

    <!-- Upload -->
    <div>
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        class="hidden"
        @change="handleFileChange"
      />
      <button
        class="w-full rounded-lg border px-3 py-2 text-left transition-colors"
        :class="
          selectedId === 'custom'
            ? 'border-blue-500 bg-blue-950 text-white'
            : 'border-dashed border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400'
        "
        @click="triggerUpload"
      >
        <div class="flex items-center gap-2">
          <span class="text-base">↑</span>
          <div>
            <div class="text-xs font-semibold">Upload your own CSV</div>
            <div class="text-xs text-gray-500">Must match SPC schema</div>
          </div>
        </div>
      </button>

      <p v-if="uploadError" class="mt-1 text-xs text-red-400">{{ uploadError }}</p>
    </div>

    <!-- Format spec toggle -->
    <div>
      <button
        class="flex w-full items-center justify-between text-xs text-gray-500 hover:text-gray-300"
        @click="showFormat = !showFormat"
      >
        <span>Required CSV format</span>
        <span>{{ showFormat ? '▲' : '▼' }}</span>
      </button>

      <div v-if="showFormat" class="mt-2 rounded-lg bg-gray-900 p-3 text-xs">
        <p class="mb-2 font-semibold text-gray-300">Required columns</p>
        <div class="mb-2 flex flex-wrap gap-1">
          <code
            v-for="col in REQUIRED_COLUMNS"
            :key="col"
            class="rounded bg-red-950 px-1.5 py-0.5 text-red-300"
          >{{ col }}</code>
        </div>

        <p class="mb-2 font-semibold text-gray-300">Optional columns</p>
        <div class="flex flex-wrap gap-1">
          <code
            v-for="col in OPTIONAL_COLUMNS"
            :key="col"
            class="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400"
          >{{ col }}</code>
        </div>

        <div class="mt-3 border-t border-gray-800 pt-2 text-gray-500">
          <p class="mb-1 font-medium text-gray-400">Column notes</p>
          <ul class="space-y-0.5 leading-relaxed">
            <li><code class="text-gray-300">slat/slon</code> — decimal degrees (start)</li>
            <li><code class="text-gray-300">elat/elon</code> — decimal degrees (end), 0 if unknown</li>
            <li><code class="text-gray-300">yr</code> — 4-digit year</li>
            <li><code class="text-gray-300">mag</code> — EF/F scale 0–5, -9 = unknown</li>
            <li><code class="text-gray-300">len</code> — path length in miles</li>
            <li><code class="text-gray-300">wid</code> — path width in yards</li>
            <li><code class="text-gray-300">fat/inj</code> — fatalities / injuries</li>
            <li><code class="text-gray-300">loss</code> — property loss in millions USD</li>
          </ul>
          <p class="mt-2">
            This matches the
            <a
              href="https://www.spc.noaa.gov/wcm/"
              target="_blank"
              rel="noopener"
              class="text-blue-400 hover:underline"
            >NOAA SPC schema</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
