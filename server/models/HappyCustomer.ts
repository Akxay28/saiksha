import mongoose, { Model, Schema } from "mongoose";

export interface IHappyCustomer {
  imageUrl: string;
  description?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const HappyCustomerSchema: Schema = new Schema(
  {
    imageUrl: { type: String, required: true },
    description: { type: String },
    instagramHandle: { type: String },
    instagramUrl: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const HappyCustomerModel =
  (mongoose.models.HappyCustomer as Model<IHappyCustomer> | undefined) ||
  mongoose.model<IHappyCustomer>("HappyCustomer", HappyCustomerSchema);

export default HappyCustomerModel;
