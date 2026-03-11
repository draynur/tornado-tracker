import type { TornadoRecord } from '~/types/tornado'

export function useTornadoFilters(allRecords: Ref<TornadoRecord[]>) {
  const selectedStates = ref<string[]>([])
  const selectedMags = ref<number[]>([])
  const yearRange = ref<[number, number]>([1950, 2019])

  // Debounced filtered records
  const _pendingFiltered = ref<TornadoRecord[]>([])
  const filteredRecords = ref<TornadoRecord[]>([])

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function applyFilters() {
    const records = allRecords.value
    const states = selectedStates.value
    const mags = selectedMags.value
    const [minYear, maxYear] = yearRange.value

    const result = records.filter((r) => {
      if (r.yr < minYear || r.yr > maxYear) return false
      if (states.length > 0 && !states.includes(r.st)) return false
      if (mags.length > 0 && !mags.includes(r.mag)) return false
      return true
    })

    filteredRecords.value = result
  }

  function scheduleFilter() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(applyFilters, 200)
  }

  watch(allRecords, applyFilters, { immediate: true })
  watch([selectedStates, selectedMags, yearRange], scheduleFilter, { deep: true })

  const stats = computed(() => {
    const records = filteredRecords.value
    let totalFatalities = 0
    let totalInjuries = 0
    let totalLoss = 0
    const byMagnitude: Record<number, number> = {}
    const byState: Record<string, number> = {}

    for (const r of records) {
      totalFatalities += r.fat || 0
      totalInjuries += r.inj || 0
      totalLoss += r.loss || 0

      const mag = r.mag ?? -9
      byMagnitude[mag] = (byMagnitude[mag] || 0) + 1

      if (r.st) {
        byState[r.st] = (byState[r.st] || 0) + 1
      }
    }

    const topStates = Object.entries(byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }))

    const magEntries = Object.entries(byMagnitude)
      .map(([mag, count]) => ({ mag: Number(mag), count }))
      .sort((a, b) => a.mag - b.mag)

    return {
      count: records.length,
      totalFatalities,
      totalInjuries,
      totalLoss,
      byMagnitude: magEntries,
      topStates,
    }
  })

  function toggleState(state: string) {
    const idx = selectedStates.value.indexOf(state)
    if (idx === -1) {
      selectedStates.value = [...selectedStates.value, state]
    } else {
      selectedStates.value = selectedStates.value.filter((s) => s !== state)
    }
  }

  function toggleMag(mag: number) {
    const idx = selectedMags.value.indexOf(mag)
    if (idx === -1) {
      selectedMags.value = [...selectedMags.value, mag]
    } else {
      selectedMags.value = selectedMags.value.filter((m) => m !== mag)
    }
  }

  return {
    selectedStates,
    selectedMags,
    yearRange,
    filteredRecords,
    stats,
    toggleState,
    toggleMag,
  }
}
