import { HeroAlt } from '@/components/about/HeroAlt'
import { ForHomeowners } from '@/components/about/ForHomeowners'
import { Values } from '@/components/about/Values'
import { FeatureCardLeft } from '@/components/about/FeatureCardLeft'
import { FeatureCardRight } from '@/components/about/FeatureCardRight'
import { GrowthEngine } from '@/components/about/GrowthEngine'
import { ContractorProblem } from '@/components/about/ContractorProblem'
import { FounderStory } from '@/components/about/FounderStory'
import { HeroPrimary } from '@/components/about/HeroPrimary'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <HeroAlt />
      <ForHomeowners />
      <Values />
      <FeatureCardLeft />
      <FeatureCardRight />
      <GrowthEngine />
      <ContractorProblem />
      <FounderStory />
      <HeroPrimary />
    </main>
  )
}
