import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroPrimary() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-600" />
      
      <div className="relative container max-w-screen-xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8">
          Turn every project into your next lead.
        </h1>

        <div className="max-w-2xl mx-auto">
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-2xl px-4 py-3 bg-white/95 ring-1 ring-white/40 
                focus:ring-2 focus:ring-white/80 focus:outline-none text-slate-900"
            />
            <Button 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            >
              Schedule a demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
