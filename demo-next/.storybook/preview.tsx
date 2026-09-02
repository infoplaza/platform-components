import type { Preview } from '@storybook/nextjs-vite'
import { Poppins } from 'next/font/google'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@infoplaza/platform/styles.css'
import '../app/globals.css'
import { DEMO_MODELS } from '../components/timeseries/fixtures'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

function catalogUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

function installCatalogFetchStub() {
  if (typeof window === 'undefined') return
  const original = window.fetch
  if ('__timeseriesCatalogStub' in original) return

  const stub = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (catalogUrl(input).includes('/timeseries-models')) {
      return Promise.resolve(
        new Response(JSON.stringify({ models: DEMO_MODELS }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }
    return original.call(window, input, init)
  }) as typeof fetch

  Object.defineProperty(stub, '__timeseriesCatalogStub', { value: true })
  window.fetch = stub
}

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      installCatalogFetchStub()
      return (
        <div
          className={`${poppins.className} ip-platform w-full bg-white font-sans text-dark antialiased`}
        >
          <Story />
        </div>
      )
    },
  ],
}

export default preview
