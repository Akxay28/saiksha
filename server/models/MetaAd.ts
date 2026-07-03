import mongoose, { Model, Schema, Document } from "mongoose";

export interface IMetaAd extends Document {
  productId: string;
  productName: string;
  productImage: string;
  productUrl: string;
  campaignName: string;
  campaignId: string; // Meta campaign ID or simulated ID
  adSetId?: string;
  adId?: string;
  budget: number; // Daily budget in Rs
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  platforms: string[]; // e.g. ["instagram_feed", "instagram_stories", "facebook_feed", "facebook_stories", "reels"]
  targeting: {
    location: string;
    ageMin: number;
    ageMax: number;
    gender: "ALL" | "MALE" | "FEMALE";
    interests: string[];
  };
  metrics: {
    impressions: number;
    clicks: number;
    reach: number;
    spend: number;
    conversions: number;
  };
  adCopy?: {
    primaryText: string;
    headline: string;
    description?: string;
  };
  landingUrl: string;
  apiError?: string;
  isSimulated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MetaAdSchema = new Schema<IMetaAd>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    productUrl: { type: String, required: true },
    campaignName: { type: String, required: true },
    campaignId: { type: String, required: true, unique: true },
    adSetId: { type: String },
    adId: { type: String },
    budget: { type: Number, required: true, default: 500 },
    status: { type: String, required: true, enum: ["ACTIVE", "PAUSED", "ARCHIVED"], default: "ACTIVE" },
    platforms: { type: [String], default: ["instagram_feed", "instagram_stories"] },
    targeting: {
      location: { type: String, default: "India" },
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 65 },
      gender: { type: String, enum: ["ALL", "MALE", "FEMALE"], default: "ALL" },
      interests: { type: [String], default: [] }
    },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },
    adCopy: {
      primaryText: { type: String, default: "" },
      headline: { type: String, default: "" },
      description: { type: String, default: "" }
    },
    landingUrl: { type: String, required: true },
    apiError: { type: String, default: "" },
    isSimulated: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const MetaAdModel =
  (mongoose.models.MetaAd as Model<IMetaAd> | undefined) ||
  mongoose.model<IMetaAd>("MetaAd", MetaAdSchema);

export default MetaAdModel;
