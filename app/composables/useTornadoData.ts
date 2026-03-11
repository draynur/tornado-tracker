import type { TornadoRecord } from '~/types/tornado'

// Required columns for a valid tornado CSV (SPC schema)
export const REQUIRED_COLUMNS = ['slat', 'slon', 'yr', 'mag'] as const

export const OPTIONAL_COLUMNS = [
  'om', 'mo', 'dy', 'date', 'time', 'tz',
  'st', 'stf', 'stn', 'inj', 'fat', 'loss', 'closs',
  'elat', 'elon', 'len', 'wid', 'ns', 'sn', 'sg',
  'f1', 'f2', 'f3', 'f4', 'fc',
] as const

export interface DatasetDef {
  id: string
  name: string
  description: string
  /** Relative path (local) or absolute https URL (proxied) */
  url: string
  recordCount?: string
  dateRange: string
  source: string
}

export const PRESET_DATASETS: DatasetDef[] = [
  {
    id: 'local-1950-2019',
    name: '1950–2019 (All Segments)',
    description: 'Includes per-county segments for multi-state tornadoes',
    url: '1950-2019_all_tornadoes.csv',
    recordCount: '~66K',
    dateRange: '1950–2019',
    source: 'NOAA SPC',
  },
  {
    id: 'spc-1950-2024-actual',
    name: '1950–2024 (Actual Tracks)',
    description: 'One record per tornado — best for track visualization',
    url: '1950-2024_actual_tornadoes.csv',
    recordCount: '~72K',
    dateRange: '1950–2024',
    source: 'NOAA SPC',
  },
  {
    id: 'spc-1950-2024-all',
    name: '1950–2024 (All Segments)',
    description: 'Includes per-county segments for multi-state tornadoes',
    url: '1950-2024_all_tornadoes.csv',
    recordCount: '~74K',
    dateRange: '1950–2024',
    source: 'NOAA SPC',
  },
]

// Per-source cache: key = url or "upload:<filename>"
const _cache = new Map<string, TornadoRecord[]>()
const _pending = new Map<string, Promise<TornadoRecord[]>>()

async function parseCsv(text: string, cacheKey: string): Promise<TornadoRecord[]> {
  const Papa = (await import('papaparse')).default

  return new Promise<TornadoRecord[]>((resolve, reject) => {
    Papa.parse<TornadoRecord>(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete(results) {
        // Validate required columns
        const headers = results.meta.fields ?? []
        const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c))
        if (missing.length > 0) {
          reject(new Error(`Missing required columns: ${missing.join(', ')}`))
          return
        }

        const records = results.data.filter((r) => r.slat !== 0 && r.slat != null)
        _cache.set(cacheKey, records)
        resolve(records)
      },
      error(err: Error) {
        reject(err)
      },
    })
  })
}

export function useTornadoData() {
  const { app } = useRuntimeConfig()

  async function loadFromUrl(url: string): Promise<TornadoRecord[]> {
    // Resolve project-relative paths against the app base URL so deployments
    // to subpaths (e.g. GitHub Pages at /repo-name/) work correctly.
    const resolvedUrl = url.startsWith('http') ? url : `${app.baseURL}${url}`

    if (_cache.has(resolvedUrl)) return _cache.get(resolvedUrl)!
    if (_pending.has(resolvedUrl)) return _pending.get(resolvedUrl)!

    const promise = (async () => {
      const response = await fetch(resolvedUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const text = await response.text()
      return parseCsv(text, resolvedUrl)
    })()

    _pending.set(resolvedUrl, promise)
    try {
      const result = await promise
      return result
    } finally {
      _pending.delete(resolvedUrl)
    }
  }

  async function loadFromFile(file: File): Promise<TornadoRecord[]> {
    const key = `upload:${file.name}:${file.size}`
    if (_cache.has(key)) return _cache.get(key)!

    const text = await file.text()
    return parseCsv(text, key)
  }

  return { loadFromUrl, loadFromFile }
}
