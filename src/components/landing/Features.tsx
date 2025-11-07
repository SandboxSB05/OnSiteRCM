import { Smartphone, Link2, Users, ClipboardCheck } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

const features = [
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Capture photos, record voice updates, and send progress reports instantly from the field — all tied directly to each job.",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    icon: Link2,
    title: "CRM Integration",
    description: "Relay connects seamlessly with your CRM, logging every update, crew check-in, and change order without manual data entry.",
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    icon: Users,
    title: "Manage Crews",
    description: "Track daily check-ins, assign tasks, and see who's on site with real-time visibility across every project.",
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    icon: ClipboardCheck,
    title: "Change Orders & Approvals",
    description: "Create, send, and approve change orders in minutes. Clients review and sign in-app for faster turnaround.",
    gradient: "from-blue-500 to-indigo-600"
  }
];

const stickySteps = [
  {
    id: "mobile-app",
    title: "Mobile App",
    description:
      "Relay’s mobile app lets crews capture photos and voice updates directly from the field. Every update ties to the correct job.",
    overlay: {
      kicker: "Mobile App — Capture updates in seconds",
      title: "Capture updates in seconds",
      bullets: [
        "Snap photos and record quick voice notes from the field",
        "Voice to text for clean updates",
        "Tie every update to the right job"
      ]
    }
  },
  {
    id: "manage-crews",
    title: "Manage Crews",
    description:
      "Track daily check-ins, assign tasks, and see who is on site with real time visibility across every project.",
    overlay: {
      kicker: "Manage Crews — Stay on top of the day",
      title: "Stay on top of the day",
      bullets: [
        "Daily check ins for each site",
        "Assign tasks and track status",
        "See who is on site in real time"
      ]
    }
  },
  {
    id: "crm-integration",
    title: "CRM Integration",
    description:
      "Designed to connect with your CRM so updates, check-ins, and change orders can log without manual entry when integrated.",
    overlay: {
      kicker: "CRM Integration — Built to connect",
      title: "Built to connect",
      bullets: [
        "Designed to push updates into your CRM",
        "Reduce duplicate entry when connected",
        "Keep the CRM as the source of truth"
      ]
    }
  },
  {
    id: "change-orders",
    title: "Change Orders & Approvals",
    description:
      "Create, send, and approve change orders in minutes. Clients review and sign in app for faster turnaround.",
    overlay: {
      kicker: "Change Orders & Approvals — Faster decisions",
      title: "Faster decisions",
      bullets: [
        "Create and send change orders in minutes",
        "Clients review and approve in app",
        "Approvals saved to the job record"
      ]
    }
  }
];

export function Features() {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ["start end", "end start"]
  });

  const imageShift = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const overlayOpacities = useMemo(() => {
    const total = stickySteps.length;
    const pad = 0.08;
    return stickySteps.map((_, index) => {
      const start = index / total;
      const end = (index + 1) / total;
      return useTransform(
        scrollYProgress,
        [Math.max(0, start - pad), start, end, Math.min(1, end + pad)],
        [0, 1, 1, 0]
      );
    });
  }, [scrollYProgress]);

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
          <h2 style={{ fontSize: '2.5rem', fontWeight: 550, letterSpacing: '-0.02em' }}>
            Everything you need to delight your clients{" "}
            <span className="block">and keep projects on track</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Powerful tools built for contractors who want visibility, speed, and less admin work.
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

        {/* Immersive showcase */}
        <div ref={showcaseRef} className="mt-24 grid lg:grid-cols-2 gap-12 items-start">
          <div className="relative lg:sticky lg:top-24">
            <div className="relative h-[520px] rounded-[32px] overflow-hidden shadow-2xl border border-gray-200 bg-gray-900">
              <motion.div style={{ y: imageShift }} className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1710974564457-44642eefc338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXIlMjBwaG9uZXxlbnwxfHx8fDE3NjEzMzA5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Relay mobile app in the field"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {stickySteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  style={{ opacity: overlayOpacities[index] }}
                  className="absolute left-6 right-6 top-6 md:left-8 md:right-8"
                >
                  <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg border border-white/40 text-gray-900">
                    <p className="text-emerald-600 text-sm font-semibold tracking-[0.2em] uppercase mb-2">
                      {step.overlay.kicker}
                    </p>
                    <h3 className="text-2xl font-semibold mb-3">{step.overlay.title}</h3>
                    <ul className="space-y-2 text-sm">
                      {step.overlay.bullets.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-32">
            {stickySteps.map((step, index) => (
              <div
                key={step.id}
                className="min-h-[60vh] flex items-center"
                aria-hidden={true}
              >
                <div className="border-l-2 border-emerald-100 pl-6 relative">
                  <span className="absolute -left-2 top-0 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-500">
                    {`Step ${String(index + 1).padStart(2, "0")}`}
                  </p>
                  <h4 className="text-3xl font-semibold mt-3">{step.title}</h4>
                  <p className="text-muted-foreground mt-3 max-w-md">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
