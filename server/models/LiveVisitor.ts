import mongoose, { Model, Schema } from "mongoose";

export interface ILiveVisitor {
  visitorId: string;
  source: "storefront" | "admin";
  lastSeen: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const LiveVisitorSchema: Schema = new Schema(
  {
    visitorId: { type: String, required: true, unique: true },
    source: { type: String, required: true, default: "storefront" },
    lastSeen: { type: Date, required: true, default: Date.now }
  },
  {
    timestamps: true
  }
);

LiveVisitorSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 90 });

const LiveVisitorModel =
  (mongoose.models.LiveVisitor as Model<ILiveVisitor> | undefined) ||
  mongoose.model<ILiveVisitor>("LiveVisitor", LiveVisitorSchema);

export default LiveVisitorModel;
