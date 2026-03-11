<script setup lang="ts">
import type { TornadoRecord } from '~/types/tornado'

const props = defineProps<{
  records: TornadoRecord[]
  isHeatmap: boolean
}>()

const emit = defineEmits<{
  'tornado-click': [om: number]
}>()

const mapContainer = ref<HTMLElement | null>(null)

const MAG_COLORS: Record<number, string> = {
  '-9': '#6b7280',
  0: '#86efac',
  1: '#fde047',
  2: '#fb923c',
  3: '#f87171',
  4: '#c026d3',
  5: '#7f1d1d',
}

onMounted(async () => {
  const L = (await import('leaflet')).default
  await import('leaflet.heat')

  // Fix Vite-broken default marker icons
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })

  const map = L.map(mapContainer.value!, {
    preferCanvas: true,
    center: [38.5, -96.5],
    zoom: 4,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  const polylineGroup = L.layerGroup().addTo(map)
  let heatLayer: ReturnType<typeof L.heatLayer> | null = null

  function getZoomLevel() {
    return map.getZoom()
  }

  function buildLayers() {
    // Clear existing
    polylineGroup.clearLayers()
    if (heatLayer) {
      map.removeLayer(heatLayer)
      heatLayer = null
    }

    const records = props.records
    const zoom = getZoomLevel()

    if (props.isHeatmap) {
      const points = records.map((r) => [r.slat, r.slon, (Math.max(r.mag, 0) + 1) / 6] as [number, number, number])
      // @ts-ignore - leaflet.heat extends L
      heatLayer = L.heatLayer(points, { radius: 18, blur: 25, maxZoom: 10 }).addTo(map)
      return
    }

    // LOD: filter by magnitude based on zoom
    let visibleRecords = records
    if (zoom < 5) {
      visibleRecords = []
    } else if (zoom < 7) {
      visibleRecords = records.filter((r) => r.mag >= 3)
    }

    for (const r of visibleRecords) {
      if (!r.slat || !r.slon) continue
      const elat = r.elat && r.elat !== 0 ? r.elat : r.slat
      const elon = r.elon && r.elon !== 0 ? r.elon : r.slon

      const color = MAG_COLORS[r.mag] ?? '#6b7280'
      const weight = Math.max(1, (r.mag ?? 0) + 1)

      const line = L.polyline([[r.slat, r.slon], [elat, elon]], {
        color,
        weight,
        opacity: 0.75,
      })

      line.on('click', () => emit('tornado-click', r.om))
      polylineGroup.addLayer(line)
    }
  }

  watch(
    [() => props.records, () => props.isHeatmap],
    () => buildLayers(),
    { immediate: true }
  )

  map.on('zoomend', () => {
    if (!props.isHeatmap) buildLayers()
  })
})
</script>

<template>
  <div ref="mapContainer" class="h-full w-full" />
</template>
