import mongoose, { Model, Schema } from "mongoose";

export interface IWishlistLeadItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface IWishlistLead {
  sessionId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: IWishlistLeadItem[];
  status: "Open" | "Contacted" | "Converted";
  createdAt?: Date;
  updatedAt?: Date;
}

const WishlistLeadSchema: Schema = new Schema(
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
        image: { type: String, required: true }
      }
    ],
    status: { type: String, default: "Open" }
  },
  { timestamps: true }
);

const WishlistLeadModel =
  (mongoose.models.WishlistLead as Model<IWishlistLead> | undefined) ||
  mongoose.model<IWishlistLead>("WishlistLead", WishlistLeadSchema);

export default WishlistLeadModel;
