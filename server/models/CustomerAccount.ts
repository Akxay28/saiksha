import mongoose, { Model, Schema } from "mongoose";

export interface ICustomerAccount {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  passwordSalt: string;
  savedAddress?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    secondaryPhone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  wishlistProductIds: string[];
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerAccountSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    savedAddress: {
      firstName: { type: String },
      lastName: { type: String },
      phone: { type: String },
      secondaryPhone: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String }
    },
    wishlistProductIds: [{ type: String }],
    resetTokenHash: { type: String },
    resetTokenExpiresAt: { type: Date },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

const CustomerAccountModel =
  (mongoose.models.CustomerAccount as Model<ICustomerAccount> | undefined) ||
  mongoose.model<ICustomerAccount>("CustomerAccount", CustomerAccountSchema);

export default CustomerAccountModel;
