import { ClipboardCheck, Link2, Smartphone, Users } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

const STORY_FEATURES = [
  {
    id: "mobile-app",
    title: "Mobile App",
    body: "Capture photos, record voice updates, and send progress reports instantly from the field, all tied directly to each job.",
    icon: Smartphone,
  },
  {
    id: "crm-integration",
    title: "CRM Integration",
    body: "Built to connect with your CRM so updates, check-ins, and change orders can log without manual entry when integrated.",
    icon: Link2,
  },
  {
    id: "manage-crews",
    title: "Manage Crews",
    body: "Track daily check-ins, assign tasks, and see who is on site with real-time visibility across every project.",
    icon: Users,
  },
  {
    id: "change-orders",
    title: "Change Orders & Approvals",
    body: "Create, send, and approve change orders in minutes. Clients review and sign in app for faster turnaround.",
    icon: ClipboardCheck,
  },
] as const;

type FeaturesProps = {
  imageSrc?: string;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1710974564457-44642eefc338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXIlMjBwaG9uZXxlbnwxfHx8fDE3NjEzMzA5NDV8MA&ixlib=rb-4.1.0&q=80&w=1600";

export function Features({ imageSrc = DEFAULT_IMAGE }: FeaturesProps) {
  const storyRef = useRef<HTMLDivElement | null>(null);
  const triggersRef = useRef<(HTMLElement | null)[]>([]);
  const [activeFeature, setActiveFeature] = useState(STORY_FEATURES[0].id);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"],
  });

  const imagePan = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -60]
  );
  const imageZoom = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [1, 1.03]
  );

  useEffect(() => {
    const STICKY_TOP_PX = 80;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const nextId = entry.target.getAttribute("data-feature-id");
            if (nextId) setActiveFeature(nextId);
          }
        });
      },
      {
        root: null,
        rootMargin: `-${STICKY_TOP_PX}px 0px -50% 0px`,
        threshold: 0.3,
      }
    );

    triggersRef.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const overlayPositions = [
    { top: "8%" },
    { top: "24%" },
    { top: "40%" },
    { top: "58%" },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-[2.5rem] md:text-[3rem] font-semibold leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Everything you need to delight your clients
            <span className="block">and keep projects on track</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Explore the Relay story from the field to the office—one immersive
            image, four moments that show how your team stays aligned.
          </p>
        </motion.div>

        <div ref={storyRef} className="relative">
          <div className="sticky top-0 h-screen">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full rounded-[32px]">
                <motion.div
                  style={{ y: imagePan, scale: imageZoom }}
                  className="absolute inset-0 overflow-hidden rounded-[32px]"
                  aria-hidden="true"
                >
                  <ImageWithFallback
                    src={imageSrc}
                    alt="Relay mobile experience"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-black/35 via-black/30 to-black/45" />

                {STORY_FEATURES.map((feature, index) => {
                  const Icon = feature.icon;
                  const titleId = `feature-${feature.id}-title`;
                  return (
                    <motion.section
                      key={feature.id}
                      aria-labelledby={titleId}
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 15 }}
                      animate={{
                        opacity: activeFeature === feature.id ? 1 : 0,
                        y:
                          reduceMotion || activeFeature === feature.id
                            ? 0
                            : 15,
                      }}
                      transition={{ duration: reduceMotion ? 0 : 0.3 }}
                      className="absolute inset-x-6 md:inset-x-16"
                      style={overlayPositions[index] ?? overlayPositions[0]}
                    >
                      <div className="mx-auto max-w-2xl rounded-[28px] bg-white/85 backdrop-blur border border-white/30 px-8 py-10 text-center text-gray-900">
                        <div className="flex items-center justify-center gap-3 text-emerald-600 mb-4">
                          <Icon className="w-7 h-7" aria-hidden="true" />
                          <span className="text-base font-semibold tracking-[0.35em] uppercase">
                            {feature.title}
                          </span>
                        </div>
                        <h3
                          id={titleId}
                          className="text-[2.75rem] md:text-[3rem] font-semibold leading-tight text-gray-900"
                          style={{ letterSpacing: "-0.02em" }}
                        >
                          {feature.title}
                        </h3>
                        <p className="mt-4 text-lg md:text-xl text-gray-700 leading-relaxed">
                          {feature.body}
                        </p>
                      </div>
                    </motion.section>
                  );
                })}

                <div className="hidden lg:flex flex-col gap-3 absolute top-1/2 right-8 -translate-y-1/2">
                  {STORY_FEATURES.map((feature) => (
                    <span
                      key={feature.id}
                      aria-hidden="true"
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        activeFeature === feature.id
                          ? "bg-emerald-400 scale-110 shadow-[0_0_0_6px_rgba(16,185,129,0.25)]"
                          : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            {STORY_FEATURES.map((feature, index) => (
              <section
                key={feature.id}
                ref={(el) => (triggersRef.current[index] = el)}
                data-feature-id={feature.id}
                className="h-screen grid content-center py-12 lg:py-20 scroll-mt-24"
              >
                <div className="sr-only">
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </div>
              </section>
            ))}
            <div className="h-screen" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
