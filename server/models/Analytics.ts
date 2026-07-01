import mongoose, { Model, Schema } from "mongoose";

export interface IAnalytics {
  key: string;
  totalVisits: number;
  totalVisitors: number;
  visitorIds: string[];
  updatedAt?: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    totalVisits: { type: Number, default: 0 },
    totalVisitors: { type: Number, default: 0 },
    visitorIds: { type: [String], default: [] }
  },
  {
    timestamps: true
  }
);

const AnalyticsModel =
  (mongoose.models.Analytics as Model<IAnalytics> | undefined) ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default AnalyticsModel;
