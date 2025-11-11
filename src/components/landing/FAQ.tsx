import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Relay?",
    answer: "Relay is a job communication tool for contractors. Crews capture updates in the field and Relay syncs them to your CRM."
  },
  {
    question: "Does it work with our CRM?",
    answer: "Yes. Relay connects with your CRM to automatically log updates, photos, and change orders. If you are not integrated yet, you can still use Relay and export updates."
  },
  {
    question: "How do clients get updates?",
    answer: "Clients receive updates by email or text. Each update includes a link to view or download a clean PDF report with photos and notes from the job."
  },
  {
    question: "Can clients approve change orders?",
    answer: "Yes. Clients can view and approve change orders through a secure link."
  },
  {
    question: "What can crews send from the field?",
    answer: "Voice notes, photos, progress status, check ins, and change order requests. You can also set photo requirements by phase."
  },
  {
    question: "Does the mobile app work offline?",
    answer: "Not yet. Relay requires an internet connection to record and send updates."
  },
  {
    question: "Can Relay replace our current tools?",
    answer: "For most teams, yes. Relay handles photos, progress tracking, and client updates in one place and connects directly to your CRM."
  },
  {
    question: "How is Relay priced?",
    answer: "Relay is billed monthly per seat. Pricing depends on team size and features. Talk with our team for a custom setup."
  },
  {
    question: "How long does setup take?",
    answer: "Most teams are up quickly. We provide white glove onboarding with direct support from the founders."
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
