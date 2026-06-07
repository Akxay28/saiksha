import mongoose, { Model, Schema } from "mongoose";

export interface IProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "Earrings" | "Necklaces" | "Bestsellers" | "New Arrivals" | "Gifts";
  images: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  isLimited?: boolean;
  isCustom?: boolean;
  customText?: string;
  isSale?: boolean;
  salePrice?: number;
  stock: number;
  materials?: string;
  stones?: string;
  craftingTime?: string;
  dimensions?: string;
  weight?: string;
  certification?: string;
  careInstructions?: string[];
  packaging?: string;
  shippingRoute?: string;
  exchangePolicy?: string;
  updatedAt?: Date;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: { type: [String], required: true },
    rating: { type: Number, required: true },
    reviews: { type: Number, required: true },
    isNew: { type: Boolean },
    isLimited: { type: Boolean },
    isCustom: { type: Boolean },
    customText: { type: String },
    isSale: { type: Boolean },
    salePrice: { type: Number },
    stock: { type: Number, required: true },
    materials: { type: String },
    stones: { type: String },
    craftingTime: { type: String },
    dimensions: { type: String },
    weight: { type: String },
    certification: { type: String },
    careInstructions: { type: [String] },
    packaging: { type: String },
    shippingRoute: { type: String },
    exchangePolicy: { type: String }
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true
  }
);

const ProductModel = (mongoose.models.Product as Model<IProduct> | undefined) || mongoose.model<IProduct>("Product", ProductSchema);

export default ProductModel;
