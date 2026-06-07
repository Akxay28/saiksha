import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, CheckCircle2, ChevronRight, Award, MessageSquare, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Testimonial {
  id?: string;
  _id?: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  location?: string;
}

export default function Testimonials() {
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  
  const [allReviews, setAllReviews] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/testimonials");
        if (response.ok) {
          const data = await response.json();
          setAllReviews(data);
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filteredReviews = filterRating === "all" 
    ? allReviews 
    : allReviews.filter(r => r.rating === filterRating);

  const totalReviewsCount = allReviews.length;
  const averageRating = totalReviewsCount > 0 
    ? (allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviewsCount).toFixed(1)
    : "5.0";

  // Rating breakdown counts
  const starCounts = {
    5: allReviews.filter(r => r.rating === 5).length,
    4: allReviews.filter(r => r.rating === 4).length,
    3: allReviews.filter(r => r.rating === 3).length,
    2: allReviews.filter(r => r.rating === 2).length,
    1: allReviews.filter(r => r.rating === 1).length,
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !comment) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          author: name,
          location: location || "Verified Collector",
          rating,
          title,
          comment,
          verified: true
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setAllReviews((prev) => [data, ...prev]);
        setIsModalOpen(false);
        
        // Reset form
        setName("");
        setLocation("");
        setRating(5);
        setTitle("");
        setComment("");
        
        toast.success("Thank you! Your testimonial has been saved to the database.");
      } else {
        toast.error("Failed to save testimonial. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting testimonial:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-4">
        <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[2px] text-neutral-400 font-bold">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={12} className="text-neutral-300" />
          <span className="text-neutral-900 font-normal">Testimonials</span>
        </nav>
      </div>

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-16 text-center space-y-4">
        <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold block">
          Voices of Discerning Collectors
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-ink">
          Customer <span className="text-brand-gradient font-serif tracking-normal italic">Testimonials</span>
        </h1>
        <div className="h-0.5 w-16 bg-brand-rosegold mx-auto mt-4" />
        <p className="text-neutral-500 font-light max-w-xl mx-auto text-sm leading-relaxed pt-2">
          Discover stories of elegance, verified quality, and flawless craftsmanship shared by collectors who carry Saiksha with them.
        </p>
      </section>

      {/* Review stats and distribution */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        
        {/* Average Rating Scorecard */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
          <span className="text-sm font-bold tracking-wider text-neutral-400 uppercase">Overall Rating</span>
          <div className="text-6xl font-serif font-bold text-neutral-950">{averageRating}</div>
          <div className="flex text-yellow-400 gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={20} 
                className={i < Math.round(Number(averageRating)) ? "fill-current" : "text-neutral-200"} 
              />
            ))}
          </div>
          <p className="text-xs text-neutral-400">Based on {totalReviewsCount} verified customer entries</p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-center space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars as keyof typeof starCounts] || 0;
            const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
            return (
              <div key={stars} className="flex items-center text-xs text-neutral-600 gap-3">
                <span className="w-12 font-bold flex items-center justify-end gap-1">
                  {stars} <Star size={12} className="fill-yellow-400 text-yellow-400" />
                </span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-rosegold rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-neutral-400 font-mono">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Trust Metrics / Call to Action */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between items-center text-center space-y-6">
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-semibold text-brand-ink">Share Your Journey</h4>
            <p className="text-neutral-400 font-light text-xs leading-relaxed">
              Your feedback shapes our artisan designs. Let us know how your Saiksha jewelry elevated your style.
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-brand-ink text-white py-4 rounded-xl text-[10px] uppercase tracking-[2px] font-bold hover:bg-neutral-800 transition-all shadow-md shadow-brand-ink/5"
          >
            Submit a Testimonial
          </button>
        </div>
      </section>

      {/* Filter and Reviews Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 space-y-8">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200/60 pb-6">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mr-2">Filter Reviews:</span>
          <button
            onClick={() => setFilterRating("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all border ${
              filterRating === "all" 
                ? "bg-brand-ink border-brand-ink text-white" 
                : "bg-white border-neutral-200 text-neutral-600 hover:border-brand-rosegold"
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3].map((num) => (
            <button
              key={num}
              onClick={() => setFilterRating(num)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all border flex items-center gap-1.5 ${
                filterRating === num 
                  ? "bg-brand-ink border-brand-ink text-white" 
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-brand-rosegold"
              }`}
            >
              <span>{num} Star</span>
              <Star size={12} className={filterRating === num ? "fill-white text-white" : "fill-yellow-400 text-yellow-400"} />
            </button>
          ))}
        </div>

        {/* Grid listing */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm space-y-4">
            <MessageSquare size={40} className="mx-auto text-neutral-300" />
            <h4 className="font-serif text-lg font-bold text-neutral-500">No matching reviews</h4>
            <p className="text-neutral-400 text-xs font-light">Be the first to submit a review for this filter rating!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReviews.map((rev) => (
              <motion.div
                key={rev._id || rev.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-neutral-100 p-6 md:p-8 rounded-3xl shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Rating & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-yellow-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={13} 
                          className={i < rev.rating ? "fill-current text-yellow-400" : "text-neutral-200"} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">{rev.date}</span>
                  </div>

                  {/* Title and Content */}
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-sm font-semibold text-neutral-900">{rev.title}</h4>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      {rev.comment.replace(/{PRODUCT}/g, "exquisite jewelry")}
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center space-x-3 pt-6 mt-6 border-t border-neutral-50">
                  <div className="w-8 h-8 bg-brand-rosegold/10 text-brand-rosegold rounded-full flex items-center justify-center font-bold text-xs uppercase">
                    {rev.author[0]}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-800 block">
                      {rev.author}
                      {rev.location && (
                        <span className="text-[10px] text-neutral-400 font-normal ml-1.5">({rev.location})</span>
                      )}
                    </span>
                    {rev.verified && (
                      <span className="text-[8px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                        <CheckCircle2 size={9} className="fill-green-100" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Review Modal Form Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-950">Add a Testimonial</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">Let others know about your Saiksha experience.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-neutral-400 hover:text-neutral-800 p-1 hover:bg-neutral-50 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-500">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aishwarya R."
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-500">Your Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-500">Rating *</label>
                <div className="flex gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-xl transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star 
                        size={22} 
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-500">Review Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Absolutely brilliant design"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-500">Your Testimonial Message *</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your purchase, design finishes, or customer support..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold font-sans leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-4 justify-end border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 border border-neutral-200 text-neutral-500 hover:bg-neutral-50 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-brand-ink text-white hover:bg-neutral-800 rounded-xl font-bold transition-all shadow-md"
                >
                  {isSubmitting ? "Publishing..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
