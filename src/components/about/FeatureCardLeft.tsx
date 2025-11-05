import { Share } from 'lucide-react'

export function FeatureCardLeft() {
  return (
    <section className="py-24 px-6 md:px-8">
      <div className="container max-w-screen-xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:border-emerald-200 transition-all">
            <div className="inline-block p-3 bg-emerald-100 rounded-xl mb-6">
              <Share className="w-6 h-6 text-emerald-600" />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Shareable updates
            </h3>
            
            <p className="text-lg text-slate-700">
              One-click publish of milestones to website & socials.
            </p>
          </div>

          {/* Right column - Image */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <img
              src={`${import.meta.env.BASE_URL}placeholder-feature.jpg`}
              alt="Shareable project updates interface"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
