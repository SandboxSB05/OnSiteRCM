import { Camera, RefreshCw, Send, ClipboardCheck, Users, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { AppDemo } from "./AppDemo";
import { useState } from "react";

const homeownerSteps = [
  {
    icon: Camera,
    title: "Capture",
    description: "Record voice updates, snap photos, and log progress right from the field. Relay keeps every detail organized and in one place.",
    color: "from-emerald-500 to-teal-600"
  },
  {
    icon: RefreshCw,
    title: "Sync",
    description: "Relay automatically syncs updates, photos, and check-ins into your CRM. No manual entry and no missed information.",
    color: "from-teal-500 to-cyan-600"
  },
  {
    icon: Send,
    title: "Update",
    description: "Clients receive clean progress reports and instant change order approvals that keep everyone aligned.",
    color: "from-cyan-500 to-blue-600"
  }
];

const crewSteps = [
  {
    icon: ClipboardCheck,
    title: "Assign",
    description: "Crew leads get daily scopes, checklists, and required documentation. Crews record quick voice notes and photos from the field for effortless updates.",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: RefreshCw,
    title: "Instant Sync",
    description: "All field updates automatically flow into your CRM with the correct job details, timestamps, and attachments. Zero manual data entry.",
    color: "from-orange-500 to-rose-500"
  },
  {
    icon: Users,
    title: "Office Visibility",
    description: "Office staff sees organized, real-time updates in the CRM. Track progress, handle change orders, and stay aligned without constant phone calls.",
    color: "from-rose-500 to-pink-500"
  }
];

export function HowItWorks() {
  const [audience, setAudience] = useState<"homeowners" | "crews">("homeowners");
  const activeSteps = audience === "homeowners" ? homeownerSteps : crewSteps;
  const subtitle =
    audience === "homeowners"
      ? "Three simple steps to transform how you communicate with homeowners"
      : "Three simple steps to keep field crews aligned and accountable";

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 550, letterSpacing: '-0.02em' }}>
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
            {subtitle}
          </p>
          <div className="mt-8 inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full p-1">
            <button
              onClick={() => setAudience("homeowners")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                audience === "homeowners"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Communicate with Homeowners
            </button>
            <button
              onClick={() => setAudience("crews")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                audience === "crews"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Communicate with Crews
            </button>
          </div>
          <div className="hidden md:block mt-6 h-0.5 w-full bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 opacity-60" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {activeSteps.map((step, index) => (
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
