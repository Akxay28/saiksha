import mongoose, { Model, Schema } from "mongoose";

export interface IOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  orderId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    secondaryPhone?: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: IOrderItem[];
  subTotal: number;
  discount?: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus?: "Pending" | "Paid" | "Failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      secondaryPhone: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true }
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
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, required: true, default: "Pending" },
    paymentStatus: { type: String, default: "Pending" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
  },
  {
    timestamps: true
  }
);

const OrderModel = (mongoose.models.Order as Model<IOrder> | undefined) || mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
