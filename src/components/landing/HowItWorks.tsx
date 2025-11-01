import { Camera, RefreshCw, Send } from "lucide-react";
import { motion } from "framer-motion";
import { AppDemo } from "./AppDemo";

const steps = [
  {
    icon: Camera,
    title: "Capture",
    description: "Project managers use the OnSite mobile app to capture photos, notes, and progress summaries right from the job site.",
    color: "from-emerald-500 to-teal-600"
  },
  {
    icon: RefreshCw,
    title: "Sync",
    description: "Updates automatically sync back into your CRM (JobNimbus, Buildertrend, etc.) as activity entries, keeping your records complete.",
    color: "from-teal-500 to-cyan-600"
  },
  {
    icon: Send,
    title: "Update",
    description: "Homeowners receive clean, branded updates through text or email, improving transparency and trust throughout the project.",
    color: "from-cyan-500 to-blue-600"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Three simple steps to transform how you communicate with homeowners
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)", scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow h-full">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                {/* Step number */}
                <div className="inline-block px-3 py-1 bg-gray-100 rounded-full mb-4">
                  <span className="text-muted-foreground" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    STEP {index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connection line - desktop only */}
        <div className="hidden md:block relative -mt-96 mb-96 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 opacity-50"></div>
        </div>

        {/* App Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24"
        >
          <AppDemo />
        </motion.div>
      </div>
    </section>
  );
}

