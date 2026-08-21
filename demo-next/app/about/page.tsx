import type { Metadata } from 'next'
import { PlaceholderPage } from '../../components/layouts'

export const metadata: Metadata = {
  title: 'About',
}

export default function AboutPage() {
  return <PlaceholderPage title="About" />
}
