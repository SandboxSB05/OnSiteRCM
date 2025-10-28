import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "OnSite has completely changed how we communicate with clients. Updates are professional, automatic, and our clients love the transparency. We've seen a huge boost in satisfaction scores.",
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
    quote: "The CRM integration is seamless. It just works. Our team spends less time on admin and more time actually building. OnSite pays for itself in saved hours alone.",
    author: "David Thompson",
    role: "Owner",
    company: "Thompson Construction",
    rating: 5
  }
];

export function Testimonials() {
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

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mb-6 flex-grow">
                  <p className="text-muted-foreground" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                    "{testimonial.quote}"
                  </p>
                </blockquote>

                {/* Author */}
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
            </motion.div>
          ))}
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-white rounded-2xl p-12 shadow-sm border border-gray-200"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }} className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                500+
              </div>
              <div className="text-muted-foreground mt-2">Active Contractors</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }} className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                50K+
              </div>
              <div className="text-muted-foreground mt-2">Updates Sent</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }} className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                98%
              </div>
              <div className="text-muted-foreground mt-2">Satisfaction Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }} className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                4.9
              </div>
              <div className="text-muted-foreground mt-2">Average Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

