"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Code2, Zap, Users } from "lucide-react";
import { FAQ } from "./FAQ";

const integrationFeatures = [
  {
    icon: Code2,
    title: "Custom Built",
    description: "We build the exact integration your team needs, no generic solutions."
  },
  {
    icon: Zap,
    title: "Fast Deployment",
    description: "Most integrations are live within 2 to 4 weeks of partnership kickoff."
  },
  {
    icon: Users,
    title: "White Glove Setup",
    description: "Our team handles the integration and testing process with you."
  }
];

const benefits = [
  "Two way sync with your CRM",
  "Zero duplicate data entry",
  "Updates appear as CRM activities",
  "Preserve your existing workflow",
  "Ongoing support and maintenance"
];

export function Integrations() {
  return (
    <section id="integrations" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Built for Your CRM
          </h2>
          <p
            className="mt-4 text-muted-foreground max-w-2xl mx-auto"
            style={{ fontSize: "1.125rem" }}
          >
            We build custom integrations tailored to your tech stack. Work with us to connect
            Relay with your existing tools.
          </p>
        </motion.div>

        {/* CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-12 mb-12 text-white text-center"
        >
          <h3 className="mb-4" style={{ fontSize: "1.875rem", fontWeight: 700 }}>
            Let’s build your integration together
          </h3>
          <p className="max-w-2xl mx-auto mb-8 opacity-90" style={{ fontSize: "1.125rem" }}>
            We partner with contractors to build the integration they need. No off the shelf
            compromises, just a solution that fits your workflow.
          </p>
          <button className="px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
            Schedule integration call
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200 flex flex-col"
          >
            <h3 className="mb-6" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              How we build it
            </h3>
            <div className="space-y-4 flex-1">
              {integrationFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <feature.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div style={{ fontSize: "1rem", fontWeight: 600 }} className="mb-1">
                      {feature.title}
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col"
          >
            <h3 className="mb-6" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              What you get
            </h3>

            <div className="space-y-4 mb-8 flex-1">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 600 }} className="mb-1">
                    API first architecture
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>
                    Built on modern APIs that make integrations reliable, fast, and easy to
                    maintain as your needs evolve.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Keep FAQ like the original section */}
        <FAQ />
      </div>
    </section>
  );
}

