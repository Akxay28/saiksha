import mongoose, { Model, Schema } from "mongoose";

export interface ITestimonial {
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

const TestimonialModel = (mongoose.models.Testimonial as Model<ITestimonial> | undefined) || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default TestimonialModel;
