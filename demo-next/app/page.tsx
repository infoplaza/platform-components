import { AppShell } from '../components/layouts'
import { MapClient } from '../components/map'
import { SideNav, TopNav } from '../components/navigation'

export default function Page() {
  return (
    <AppShell header={<TopNav />} sidebar={<SideNav />}>
      <MapClient />
    </AppShell>
  )
}
