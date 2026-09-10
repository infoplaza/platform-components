'use client'

import { setWorkerUrl } from 'maplibre-gl'

let configured = false

/**
 * MapLibre v6 needs an explicit worker URL under Next.js (Turbopack / webpack).
 * Call once before the first map mounts.
 */
export function ensureMapLibreWorker() {
  if (configured || typeof window === 'undefined') {
    return
  }

  setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
  configured = true
}

ensureMapLibreWorker()
