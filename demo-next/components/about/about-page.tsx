import { HomeCta } from '../home/home-cta'
import { AboutCapabilities } from './about-capabilities'
import { AboutCompany } from './about-company'
import { AboutHero } from './about-hero'
import { AboutVersions } from './about-versions'
import { fetchNpmVersions } from './npm-versions'

export async function AboutPage() {
  const versions = await fetchNpmVersions()

  return (
    <div className="h-full min-h-0 overflow-x-hidden overflow-y-auto">
      <AboutHero />
      <AboutCapabilities />
      <AboutVersions versions={versions} />
      <AboutCompany />
      <HomeCta />
    </div>
  )
}
