import mongoose, { Model, Schema } from "mongoose";

export interface IWhatsAppCampaign {
  title: string;
  fromNumber: string;
  audience: "All Customers" | "High Value" | "Wishlist Users" | "Cart Abandoned" | "Repeat Buyers" | "New Customers" | "Manual";
  manualNumbers: string[];
  message: string;
  status: "Draft" | "Prepared" | "Archived";
  preparedCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const WhatsAppCampaignSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    fromNumber: { type: String, default: "" },
    audience: {
      type: String,
      enum: ["All Customers", "High Value", "Wishlist Users", "Cart Abandoned", "Repeat Buyers", "New Customers", "Manual"],
      default: "All Customers"
    },
    manualNumbers: [{ type: String }],
    message: { type: String, required: true },
    status: { type: String, enum: ["Draft", "Prepared", "Archived"], default: "Draft" },
    preparedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const WhatsAppCampaignModel =
  (mongoose.models.WhatsAppCampaign as Model<IWhatsAppCampaign> | undefined) ||
  mongoose.model<IWhatsAppCampaign>("WhatsAppCampaign", WhatsAppCampaignSchema);

export default WhatsAppCampaignModel;
