import { HomeBenefits } from './home-benefits'
import { HomeCta } from './home-cta'
import { HomeHero } from './home-hero'
import { HomeIndustries } from './home-industries'
import { HomeInstall } from './home-install'
import { HomeProducts } from './home-products'

export function HomePage() {
  return (
    <div className="h-full min-h-0 overflow-x-hidden overflow-y-auto">
      <HomeHero />
      <HomeIndustries />
      <HomeBenefits />
      <HomeProducts />
      <HomeInstall />
      <HomeCta />
    </div>
  )
}
