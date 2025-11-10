import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Relay?",
    answer:
      "Relay is a communication and progress tracking tool for contractors that ties field updates directly into your CRM."
  },
  {
    question: "How does Relay work with our CRM?",
    answer:
      "Relay syncs photos, voice updates, check-ins, and approved change orders to the correct job record in your CRM with no manual data entry."
  },
  {
    question: "Does the mobile app work offline?",
    answer: "Not yet. Relay requires a connection to capture and sync updates in real time."
  },
  {
    question: "Can clients see updates?",
    answer:
      "Yes. You can share organized progress updates and approved change orders with clients so everyone stays aligned."
  },
  {
    question: "What types of updates can crews send from the field?",
    answer:
      "Crews can record audio updates, take and upload photos, complete daily check-ins, and submit change orders for approval."
  },
  {
    question: "Can Relay replace tools like CompanyCam?",
    answer:
      "For many teams, yes. Relay centralizes job photos, updates, and approvals while pushing the data into your CRM."
  },
  {
    question: "How is Relay priced?",
    answer:
      "Relay uses a monthly per-seat subscription. Pricing depends on your team size and feature needs. Talk with our team to get a custom setup."
  },
  {
    question: "How long does setup take?",
    answer:
      "Most teams are up and running quickly. We offer white-glove onboarding and direct support from our founders to ensure a smooth start."
  }
];

export function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p
          className="text-emerald-600 font-semibold tracking-wide uppercase"
          style={{ fontSize: "0.8125rem", letterSpacing: "0.12em" }}
        >
          Support & onboarding
        </p>
        <h2
          style={{ fontSize: "2.25rem", fontWeight: 550, letterSpacing: "-0.02em" }}
          className="mt-3"
        >
          Frequently asked questions
        </h2>
        <p
          className="mt-4 text-muted-foreground max-w-2xl mx-auto"
          style={{ fontSize: "1.0625rem" }}
        >
          Everything contractors ask us before rolling Relay out to their crews and clients.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-[26px] border border-emerald-100 shadow-[0_20px_60px_-30px_rgba(15,118,110,0.45)] max-w-4xl mx-auto"
      >
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;

          return (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: false, margin: "-50px", amount: 0.4 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
              className={`px-6 md:px-8 ${index !== faqs.length - 1 ? "border-b border-emerald-50" : ""}`}
            >
              <button
                type="button"
                onClick={() => handleToggle(index)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span style={{ fontSize: "1.0625rem", fontWeight: 550 }} className="text-gray-900">
                  {faq.question}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
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
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
