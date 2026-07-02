import mongoose, { Model, Schema } from "mongoose";

export interface IDiscountCampaign {
  title: string;
  type: "Percent Off" | "Free Shipping";
  status: "Active" | "Paused";
  discountPercent: number;
  minCartValue: number;
  minItems: number;
  category: "All" | "Earrings" | "Necklaces" | "Bestsellers" | "New Arrivals" | "Gifts";
  startsAt?: Date;
  endsAt?: Date;
  badgeText: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DiscountCampaignSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["Percent Off", "Free Shipping"], default: "Percent Off" },
    status: { type: String, enum: ["Active", "Paused"], default: "Paused" },
    discountPercent: { type: Number, default: 0 },
    minCartValue: { type: Number, default: 0 },
    minItems: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ["All", "Earrings", "Necklaces", "Bestsellers", "New Arrivals", "Gifts"],
      default: "All"
    },
    startsAt: { type: Date },
    endsAt: { type: Date },
    badgeText: { type: String, default: "" }
  },
  { timestamps: true }
);

const DiscountCampaignModel =
  (mongoose.models.DiscountCampaign as Model<IDiscountCampaign> | undefined) ||
  mongoose.model<IDiscountCampaign>("DiscountCampaign", DiscountCampaignSchema);

export default DiscountCampaignModel;
