import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown } from "lucide-react";
import followupLogo from '@/assets/followup-logo.png';
import jobNimbusLogo from '@/assets/jobnimbus-logo.png';

const integrations = [
  { name: "JobNimbus", status: "Available", logo: jobNimbusLogo },
  { name: "Buildertrend", status: "Available" },
  { name: "AccuLynx", status: "Available" },
  { name: "Salesforce", status: "Coming Soon" },
  { name: "Followup", status: "Coming Soon", logo: followupLogo },
  { name: "Custom CRM", status: "API Available" }
];

const benefits = [
  "Automatic two-way sync with your CRM",
  "No duplicate data entry required",
  "Updates appear as CRM activities",
  "Preserve your existing workflow",
  "Easy setup in under 5 minutes"
];

const faqs = [
  {
    question: "What is Relay?",
    answer: "Relay is a communication and progress tracking tool for contractors that ties field updates directly into your CRM."
  },
  {
    question: "How does Relay work with our CRM?",
    answer: "Relay syncs photos, voice updates, check-ins, and approved change orders to the correct job record in your CRM with no manual data entry."
  },
  {
    question: "Does the mobile app work offline?",
    answer: "Not yet. Relay requires a connection to capture and sync updates in real time."
  },
  {
    question: "Can clients see updates?",
    answer: "Yes. You can share organized progress updates and approved change orders with clients so everyone stays aligned."
  },
  {
    question: "What types of updates can crews send from the field?",
    answer: "Crews can record audio updates, take and upload photos, complete daily check-ins, and submit change orders for approval."
  },
  {
    question: "Can Relay replace tools like CompanyCam?",
    answer: "For many teams, yes. Relay centralizes job photos, updates, and approvals while pushing the data into your CRM."
  },
  {
    question: "How is Relay priced?",
    answer: "We use a per-seat monthly subscription. We currently offer a single tier while we continue to add features."
  },
  {
    question: "How long does setup take?",
    answer: "Most teams connect the CRM and start capturing updates the same day. We provide guided onboarding and best practices for crew adoption."
  }
];

export function Integrations() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <section id="integrations" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Integrates with your tools
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Relay connects seamlessly with the CRM platforms contractors already use
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Integration logos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-4">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-200 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Logo placeholder */}
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-3">
                      {integration.logo ? (
                        <img src={integration.logo} alt={integration.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-emerald-700">
                          {integration.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600 }} className="mb-1">
                      {integration.name}
                    </div>
                    
                    <div className="inline-flex items-center gap-1">
                      {integration.status === "Available" && (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600" style={{ fontSize: '0.75rem' }}>
                            {integration.status}
                          </span>
                        </>
                      )}
                      {integration.status === "Coming Soon" && (
                        <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                          {integration.status}
                        </span>
                      )}
                      {integration.status === "API Available" && (
                        <span className="text-blue-600" style={{ fontSize: '0.75rem' }}>
                          {integration.status}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* API info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }} className="mb-2">
                Don't see your CRM?
              </h4>
              <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                We offer a flexible API for custom integrations. Contact our team to discuss 
                connecting Relay with your specific platform.
              </p>
            </motion.div>
          </motion.div>

          {/* Benefits list */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
          >
            <h3 className="mb-6" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Why integration matters
            </h3>
            
            <div className="space-y-4 mb-8">
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

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span style={{ fontSize: '1.5rem' }}>🔌</span>
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }} className="mb-1">
                    Quick setup
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    Our team helps you connect to your CRM in minutes, not days. 
                    White-glove onboarding included.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-emerald-600 font-semibold tracking-wide uppercase" style={{ fontSize: '0.8125rem', letterSpacing: '0.12em' }}>
              Support & onboarding
            </p>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em' }} className="mt-3">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.0625rem' }}>
              Everything contractors ask us before rolling Relay out to their crews and clients.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-[26px] border border-emerald-100 shadow-[0_20px_60px_-30px_rgba(15,118,110,0.45)] max-w-4xl mx-auto"
          >
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className={`px-6 md:px-8 ${index !== faqs.length - 1 ? "border-b border-emerald-50" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(index)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span style={{ fontSize: '1.0625rem', fontWeight: 600 }} className="text-gray-900">
                      {faq.question}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="pb-5 pr-2 text-muted-foreground"
                      style={{ lineHeight: 1.6 }}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
