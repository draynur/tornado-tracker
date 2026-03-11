import * as L from 'leaflet'

declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: {
      minOpacity?: number
      maxZoom?: number
      max?: number
      radius?: number
      blur?: number
      gradient?: Record<number, string>
    }
  ): Layer

  interface HeatLayer extends Layer {
    setLatLngs(latlngs: Array<[number, number, number?]>): this
    addLatLng(latlng: [number, number, number?]): this
    setOptions(options: object): this
    redraw(): this
  }
}
