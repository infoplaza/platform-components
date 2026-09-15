import type { Metadata } from 'next'
import { HomePage } from '../components/home'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'React components for Infoplaza weather maps, forecast tables, and ensemble charts, based on ImWeather. Drop operational weather into your product with @infoplaza/platform.',
}

export default function Page() {
  return <HomePage />
}
