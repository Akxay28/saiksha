import mongoose, { Model, Schema } from "mongoose";

export interface ISearchAnalytics {
  query: string;
  normalizedQuery: string;
  resultCount: number;
  hits: number;
  lastSearchedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const SearchAnalyticsSchema: Schema = new Schema(
  {
    query: { type: String, required: true },
    normalizedQuery: { type: String, required: true, unique: true },
    resultCount: { type: Number, default: 0 },
    hits: { type: Number, default: 0 },
    lastSearchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const SearchAnalyticsModel =
  (mongoose.models.SearchAnalytics as Model<ISearchAnalytics> | undefined) ||
  mongoose.model<ISearchAnalytics>("SearchAnalytics", SearchAnalyticsSchema);

export default SearchAnalyticsModel;
