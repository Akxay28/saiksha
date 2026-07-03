import mongoose, { Model, Schema } from "mongoose";

export interface IMetaEvent {
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | string;
  path: string;
  productId?: string;
  productName?: string;
  value?: number;
  currency?: string;
  orderId?: string;
  visitorId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  fbclid?: string;
  userAgent?: string;
  ip?: string;
  createdAt?: Date;
}

const MetaEventSchema = new Schema<IMetaEvent>(
  {
    eventName: { type: String, required: true, index: true },
    path: { type: String, required: true },
    productId: { type: String },
    productName: { type: String },
    value: { type: Number },
    currency: { type: String, default: "INR" },
    orderId: { type: String },
    visitorId: { type: String, index: true },
    referrer: { type: String },
    utmSource: { type: String, index: true },
    utmMedium: { type: String },
    utmCampaign: { type: String, index: true },
    fbclid: { type: String },
    userAgent: { type: String },
    ip: { type: String }
  },
  { timestamps: true }
);

const MetaEventModel =
  (mongoose.models.MetaEvent as Model<IMetaEvent> | undefined) ||
  mongoose.model<IMetaEvent>("MetaEvent", MetaEventSchema);

export default MetaEventModel;
