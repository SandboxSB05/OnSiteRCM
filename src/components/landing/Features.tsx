import { Smartphone, Link2, LayoutDashboard, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "./ImageWithFallback";

const features = [
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Capture photos, add notes, and send updates from anywhere on the job site. Works offline and syncs when connected.",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    icon: Link2,
    title: "CRM Integration",
    description: "Seamlessly connects with JobNimbus, Buildertrend, and other leading contractor CRMs. No double data entry.",
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    icon: LayoutDashboard,
    title: "Client Dashboard",
    description: "Give homeowners a beautiful portal to view all project updates, photos, and timeline in one place.",
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track communication metrics, client engagement, and team performance with detailed analytics and reporting.",
    gradient: "from-blue-500 to-indigo-600"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Everything you need to delight your clients
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Powerful features designed specifically for contractors who care about communication
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:border-emerald-200 transition-all h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature showcase with images */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mt-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>
              Built for the field
            </h3>
            <p className="text-muted-foreground mb-6" style={{ fontSize: '1.125rem' }}>
              Our mobile app is designed for real-world job sites. Take photos with construction 
              gloves on, work offline, and capture updates in seconds.
            </p>
            <ul className="space-y-3">
              {[
                "Intuitive interface for quick updates",
                "Automatic photo organization",
                "Voice-to-text for hands-free notes",
                "Works without internet connection"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1710974564457-44642eefc338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXIlMjBwaG9uZXxlbnwxfHx8fDE3NjEzMzA5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Contractor using OnSite app on job site"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>

        {/* Second feature showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mt-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzYxMjUxMDU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="OnSite analytics dashboard"
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <h3 className="mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>
              Insights that drive results
            </h3>
            <p className="text-muted-foreground mb-6" style={{ fontSize: '1.125rem' }}>
              Understand what's working with detailed analytics. Track update frequency, 
              client engagement, and identify opportunities to improve communication.
            </p>
            <ul className="space-y-3">
              {[
                "Real-time update tracking",
                "Client engagement metrics",
                "Team performance reports",
                "Custom dashboards and exports"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

