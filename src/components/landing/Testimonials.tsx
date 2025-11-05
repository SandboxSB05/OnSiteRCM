import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const testimonials = [
  {
    quote: "Relay has completely changed how we communicate with clients. Updates are professional, automatic, and our clients love the transparency. We've seen a huge boost in satisfaction scores.",
    author: "Sarah Martinez",
    role: "Project Manager",
    company: "Elite Roofing Co.",
    rating: 5
  },
  {
    quote: "As a homeowner, getting regular updates with photos made the renovation process so much less stressful. I always knew what was happening and felt included in the process.",
    author: "Michael Chen",
    role: "Homeowner",
    company: "Kitchen Renovation Project",
    rating: 5
  },
  {
    quote: "The CRM integration is seamless. It just works. Our team spends less time on admin and more time actually building. Relay pays for itself in saved hours alone.",
    author: "David Thompson",
    role: "Owner",
    company: "Thompson Construction",
    rating: 5
  },
  {
    quote: "Relay cut our update calls in half and bumped our Google reviews within a month.",
    author: "Marta P.",
    role: "Operations Manager",
    company: "Peak Roofing",
    rating: 5
  },
  {
    quote: "Homeowners finally feel in the loop. We closed two referrals last week because of the daily photo summaries.",
    author: "Jared L.",
    role: "Owner",
    company: "Clearview Remodel",
    rating: 5
  },
  {
    quote: "Our PMs post once, everyone sees it. Zero 'what's the status?' texts.",
    author: "Alyssa K.",
    role: "Project Coordinator",
    company: "Northside Builders",
    rating: 5
  }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 3;
      return nextIndex >= testimonials.length ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 3;
      return nextIndex < 0 ? testimonials.length - 3 : nextIndex;
    });
  };
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Trusted by contractors and homeowners
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
            See what our customers have to say about transforming their project communication
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="overflow-hidden max-w-[1000px] mx-auto testimonials-container">
            <div 
              className="flex justify-center testimonial-slide-transition"
              style={{ gap: 'calc((100% - (280px * 3)) / 2)' }}
            >
              {testimonials.slice(currentIndex, currentIndex + 3).map((testimonial, index) => (
                <div 
                  key={currentIndex + index}
                  className="w-[280px] flex-shrink-0 testimonial-card"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-full flex flex-col transition-all hover:shadow-xl hover:border-emerald-200">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <blockquote className="mb-6 flex-grow">
                      <p className="text-muted-foreground" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                        "{testimonial.quote}"
                      </p>
                    </blockquote>
                    <div className="border-t border-gray-200 pt-4">
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                        {testimonial.author}
                      </div>
                      <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        {testimonial.role}
                      </div>
                      <div className="text-emerald-600" style={{ fontSize: '0.875rem' }}>
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={prevSlide} 
            className="nav-button absolute left-4 lg:left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="nav-button absolute right-4 lg:right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

