import mongoose, { Model, Schema } from "mongoose";

export interface ILeadCapture {
  source: "Exit Offer" | "First Visit Offer" | "Product Inquiry" | "Notify Me" | "Price Drop Alert" | "Checkout Recovery" | "WhatsApp Help";
  customer: {
    name?: string;
    email?: string;
    phone?: string;
  };
  product?: {
    id?: string;
    name?: string;
    price?: number;
    image?: string;
  };
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
    image?: string;
  }>;
  message?: string;
  status: "Open" | "Contacted" | "Converted";
  createdAt?: Date;
  updatedAt?: Date;
}

const LeadCaptureSchema: Schema = new Schema(
  {
    source: { type: String, required: true },
    customer: {
      name: { type: String },
      email: { type: String },
      phone: { type: String }
    },
    product: {
      id: { type: String },
      name: { type: String },
      price: { type: Number },
      image: { type: String }
    },
    items: [
      {
        id: { type: String },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        image: { type: String }
      }
    ],
    message: { type: String },
    status: { type: String, default: "Open" }
  },
  { timestamps: true }
);

const LeadCaptureModel =
  (mongoose.models.LeadCapture as Model<ILeadCapture> | undefined) ||
  mongoose.model<ILeadCapture>("LeadCapture", LeadCaptureSchema);

export default LeadCaptureModel;
