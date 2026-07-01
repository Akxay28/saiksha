import mongoose, { Model, Schema } from "mongoose";

export interface IAbandonedCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IAbandonedCart {
  sessionId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: IAbandonedCartItem[];
  total: number;
  status: "Open" | "Converted";
  createdAt?: Date;
  updatedAt?: Date;
}

const AbandonedCartSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true }
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, default: "Open" }
  },
  {
    timestamps: true
  }
);

const AbandonedCartModel =
  (mongoose.models.AbandonedCart as Model<IAbandonedCart> | undefined) ||
  mongoose.model<IAbandonedCart>("AbandonedCart", AbandonedCartSchema);

export default AbandonedCartModel;
