import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, MessageSquare, Star } from "lucide-react";

interface Testimonial {
  _id?: string;
  id?: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  location?: string;
}

interface TestimonialsProps {
  className?: string;
  productName?: string;
  reloadKey?: number;
}

export default function Testimonials({ className = "", productName = "exquisite jewelry", reloadKey = 0 }: TestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/testimonials");
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [reloadKey]);

  return (
    <section className={`py-28 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-14 space-y-4">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold block">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-ink">
              Customer <span className="text-brand-gradient font-serif tracking-normal italic">Testimonials</span>
            </h2>
            <div className="h-[1px] w-12 bg-gradient-to-r from-brand-rosegold to-brand-hotpink" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-72 rounded-lg border border-neutral-100 bg-brand-cream/15 animate-pulse" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-16 bg-brand-cream/15 rounded-lg border border-brand-ink/5">
            <MessageSquare size={36} className="mx-auto text-neutral-300" />
            <h4 className="mt-4 font-serif text-lg font-semibold text-neutral-600">No testimonials yet</h4>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial._id || testimonial.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative p-8 bg-brand-cream/15 backdrop-blur-[1px] rounded-lg border border-brand-ink/5 hover:border-brand-hotpink/20 hover:shadow-[0_20px_40px_rgba(233,30,140,0.03)] transition-all duration-500 flex flex-col justify-between min-h-[300px]"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < testimonial.rating ? "fill-brand-hotpink text-brand-hotpink" : "text-neutral-200"}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono whitespace-nowrap">{testimonial.date}</span>
                </div>

                <h4 className="font-serif text-base font-semibold text-brand-ink mb-3">{testimonial.title}</h4>
                <p className="text-neutral-600 font-light leading-relaxed italic text-sm">
                  "{testimonial.comment.replace(/{PRODUCT}/g, productName)}"
                </p>
              </div>

              <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-brand-ink">{testimonial.author}</h4>
                  {testimonial.location && (
                    <p className="text-[10px] text-neutral-400 mt-1">{testimonial.location}</p>
                  )}
                </div>
                {testimonial.verified && (
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-green-600 font-bold">
                    <CheckCircle2 size={11} />
                    Verified
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          </div>
        )}

        <div className="mt-10 flex justify-end">
          <Link
            to="/testimonials"
            className="inline-flex w-fit items-center gap-2 rounded-sm bg-brand-ink px-6 py-3 text-[10px] font-bold uppercase tracking-[2px] text-white shadow-md transition-all hover:bg-neutral-800"
          >
            <span>Read More</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
