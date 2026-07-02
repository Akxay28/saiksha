import mongoose, { Model, Schema } from "mongoose";

export interface IStoreSettings {
  key: string;
  storeName: string;
  announcementEnabled: boolean;
  announcementText: string;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  instagramUrl: string;
  freeShippingThreshold: number;
  couponCode: string;
  couponDiscountPercent: number;
  couponText: string;
  shippingNote: string;
  returnPolicy: string;
  couponMinOrder: number;
  couponUsageLimit: number;
  couponExpiresAt?: Date;
  cartLeadFollowUpTemplates: Array<{
    title: string;
    message: string;
  }>;
  updatedAt?: Date;
}

const StoreSettingsSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "store" },
    storeName: { type: String, default: "Saiksha" },
    announcementEnabled: { type: Boolean, default: true },
    announcementText: { type: String, default: "Free shipping on orders over Rs 5,000 - New Collection just launched - Use code SAIKSHA10 for 10% off" },
    whatsappNumber: { type: String, default: "917383055032" },
    supportPhone: { type: String, default: "+91 73830 55032" },
    supportEmail: { type: String, default: "support@saiksha.in" },
    instagramUrl: { type: String, default: "https://www.instagram.com/saiksha.jewels/" },
    freeShippingThreshold: { type: Number, default: 5000 },
    couponCode: { type: String, default: "SAIKSHA10" },
    couponDiscountPercent: { type: Number, default: 10 },
    couponText: { type: String, default: "Use code SAIKSHA10 for 10% off" },
    shippingNote: { type: String, default: "Online jewelry orders and customer support across India." },
    returnPolicy: { type: String, default: "Exchange and return support depends on product condition, packaging, and campaign policy." },
    couponMinOrder: { type: Number, default: 0 },
    couponUsageLimit: { type: Number, default: 0 },
    couponExpiresAt: { type: Date },
    cartLeadFollowUpTemplates: {
      type: [
        {
          title: { type: String },
          message: { type: String }
        }
      ],
      default: [
        {
          title: "Friendly reminder",
          message: "Hello {{name}}, you saved a Saiksha bag. Would you like help completing your selection?"
        },
        {
          title: "Offer follow-up",
          message: "Hello {{name}}, your selected Saiksha pieces are still waiting. Use {{coupon}} while the offer is active."
        }
      ]
    }
  },
  { timestamps: true }
);

const StoreSettingsModel =
  (mongoose.models.StoreSettings as Model<IStoreSettings> | undefined) ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

export default StoreSettingsModel;
