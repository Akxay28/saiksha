import mongoose, { Model, Schema } from "mongoose";

export interface ICustomerMeta {
  key: string;
  email?: string;
  phone?: string;
  name?: string;
  tags: string[];
  note: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerMetaSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    email: { type: String },
    phone: { type: String },
    name: { type: String },
    tags: { type: [String], default: [] },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

const CustomerMetaModel =
  (mongoose.models.CustomerMeta as Model<ICustomerMeta> | undefined) ||
  mongoose.model<ICustomerMeta>("CustomerMeta", CustomerMetaSchema);

export default CustomerMetaModel;
