import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  location?: string;
  productName?: string;
}

const TestimonialSchema: Schema = new Schema(
  {
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: String, required: true },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    verified: { type: Boolean, default: true },
    location: { type: String },
    productName: { type: String }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
