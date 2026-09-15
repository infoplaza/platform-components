import type { Metadata } from 'next'
import { AboutPage } from '../../components/about'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Based on ImWeather: React SDK for embedding Infoplaza weather visualization on MapLibre maps. Version history for @infoplaza/platform, and the company behind it.',
}

export default function Page() {
  return <AboutPage />
}
