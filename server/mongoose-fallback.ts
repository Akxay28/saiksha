import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { products as defaultProducts } from "../src/data/products";

const DATA_DIR = path.join(process.cwd(), ".data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(modelName: string): string {
  return path.join(DATA_DIR, `${modelName}.json`);
}

function getDefaultData(modelName: string): any[] {
  if (modelName === "Product") {
    return defaultProducts || [];
  }
  if (modelName === "StoreSettings") {
    return [
      {
        key: "store",
        storeName: "Saiksha",
        announcementEnabled: true,
        announcementText: "✨ Elevate Your Style with Saiksha Artisan Jewelry - Premium Quality Guaranteed ✨",
        whatsappNumber: "917383055032",
        supportPhone: "+91 73830 55032",
        supportEmail: "support@saiksha.com",
        instagramUrl: "https://instagram.com/saiksha_jewelry",
        freeShippingThreshold: 4900,
        couponCode: "SAIKSHA10",
        couponDiscountPercent: 10,
        couponText: "Use SAIKSHA10 for flat 10% off on premium collections",
        shippingNote: "Free shipping above Rs 4900",
        returnPolicy: "Smooth 15-day exchange and replacement policy."
      }
    ];
  }
  if (modelName === "DiscountCampaign") {
    return [
      {
        _id: "camp_1",
        title: "Welcome Launch Offer",
        type: "Percent Off",
        status: "Active",
        discountPercent: 10,
        minCartValue: 0,
        minItems: 0,
        category: "All",
        badgeText: "10% OFF"
      }
    ];
  }
  if (modelName === "Testimonial") {
    return [
      {
        _id: "t1",
        author: "Anjali Sharma",
        rating: 5,
        date: "2026-06-15",
        title: "Absolutely Gorgeous Rose Gold Earrings!",
        comment: "The finish is top-notch, looks exactly like real gold and diamonds. Very comfortable to wear all day.",
        verified: true,
        location: "Mumbai",
        createdAt: new Date("2026-06-15")
      },
      {
        _id: "t2",
        author: "Priya Patel",
        rating: 5,
        date: "2026-06-20",
        title: "Exquisite Craftsmanship",
        comment: "The Akoya Pearl Necklace arrived in an elegant velvet gift box. Absolutely stunning quality!",
        verified: true,
        location: "Delhi",
        createdAt: new Date("2026-06-20")
      }
    ];
  }
  if (modelName === "Analytics") {
    return [
      {
        key: "site",
        totalVisits: 124,
        totalVisitors: 42,
        visitorIds: []
      }
    ];
  }
  return [];
}

function readData(modelName: string): any[] {
  const filePath = getFilePath(modelName);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Error reading mock database for ${modelName}:`, e);
  }
  return getDefaultData(modelName);
}

function writeData(modelName: string, data: any[]) {
  const filePath = getFilePath(modelName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error writing mock database for ${modelName}:`, e);
  }
}

function matchQuery(item: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key of Object.keys(query)) {
    const val = query[key];

    if (key === "$or") {
      if (Array.isArray(val)) {
        const matchesAny = val.some((subQuery) => matchQuery(item, subQuery));
        if (!matchesAny) return false;
      }
      continue;
    }

    if (key === "$and") {
      if (Array.isArray(val)) {
        const matchesAll = val.every((subQuery) => matchQuery(item, subQuery));
        if (!matchesAll) return false;
      }
      continue;
    }

    const itemVal = item[key];

    if (val && typeof val === "object" && !Array.isArray(val)) {
      for (const op of Object.keys(val)) {
        const opVal = val[op];
        if (op === "$gte") {
          const itemTime = itemVal instanceof Date ? itemVal.getTime() : new Date(itemVal).getTime();
          const opTime = opVal instanceof Date ? opVal.getTime() : new Date(opVal).getTime();
          if (!isNaN(itemTime) && !isNaN(opTime)) {
            if (!(itemTime >= opTime)) return false;
          } else if (!(itemVal >= opVal)) {
            return false;
          }
        } else if (op === "$lte") {
          const itemTime = itemVal instanceof Date ? itemVal.getTime() : new Date(itemVal).getTime();
          const opTime = opVal instanceof Date ? opVal.getTime() : new Date(opVal).getTime();
          if (!isNaN(itemTime) && !isNaN(opTime)) {
            if (!(itemTime <= opTime)) return false;
          } else if (!(itemVal <= opVal)) {
            return false;
          }
        } else if (op === "$gt") {
          const itemTime = itemVal instanceof Date ? itemVal.getTime() : new Date(itemVal).getTime();
          const opTime = opVal instanceof Date ? opVal.getTime() : new Date(opVal).getTime();
          if (!isNaN(itemTime) && !isNaN(opTime)) {
            if (!(itemTime > opTime)) return false;
          } else if (!(itemVal > opVal)) {
            return false;
          }
        } else if (op === "$lt") {
          const itemTime = itemVal instanceof Date ? itemVal.getTime() : new Date(itemVal).getTime();
          const opTime = opVal instanceof Date ? opVal.getTime() : new Date(opVal).getTime();
          if (!isNaN(itemTime) && !isNaN(opTime)) {
            if (!(itemTime < opTime)) return false;
          } else if (!(itemVal < opVal)) {
            return false;
          }
        } else if (op === "$ne" && itemVal === opVal) {
          return false;
        } else if (op === "$in" && Array.isArray(opVal) && !opVal.includes(itemVal)) {
          return false;
        } else if (op === "$nin" && Array.isArray(opVal) && opVal.includes(itemVal)) {
          return false;
        }
      }
    } else {
      if (typeof itemVal === "string" && typeof val === "string") {
        if (itemVal.trim().toLowerCase() !== val.trim().toLowerCase()) return false;
      } else if (itemVal != val) {
        return false;
      }
    }
  }

  return true;
}

function applyUpdate(item: any, update: any, isInsert = false): any {
  if (!update) return item;

  const result = { ...item };
  const hasOperators = Object.keys(update).some((k) => k.startsWith("$"));

  if (!hasOperators) {
    return { ...result, ...update };
  }

  if (update.$set) {
    Object.assign(result, update.$set);
  }

  if (update.$setOnInsert && isInsert) {
    Object.assign(result, update.$setOnInsert);
  }

  if (update.$inc) {
    for (const [key, val] of Object.entries(update.$inc)) {
      result[key] = (Number(result[key]) || 0) + Number(val);
    }
  }

  if (update.$push) {
    for (const [key, val] of Object.entries(update.$push)) {
      if (!Array.isArray(result[key])) {
        result[key] = [];
      }
      if (val && typeof val === "object" && (val as any).$each) {
        result[key].push(...(val as any).$each);
      } else {
        result[key].push(val);
      }
    }
  }

  return result;
}

function wrapDocument(modelName: string, doc: any): any {
  if (!doc) return doc;
  if (Array.isArray(doc)) {
    return doc.map((d) => wrapDocument(modelName, d));
  }

  if (typeof doc !== "object" || doc.save) return doc;

  const wrapped = { ...doc };

  Object.defineProperty(wrapped, "save", {
    enumerable: false,
    writable: true,
    configurable: true,
    value: async function() {
      const items = readData(modelName);
      const matchId = this._id || this.id;
      const foundIndex = items.findIndex((item) => (item._id || item.id) === matchId);

      const plainObj = { ...this };
      plainObj.updatedAt = new Date();

      if (foundIndex !== -1) {
        items[foundIndex] = plainObj;
      } else {
        plainObj.createdAt = plainObj.createdAt || new Date();
        items.push(plainObj);
      }

      writeData(modelName, items);
      return wrapped;
    }
  });

  Object.defineProperty(wrapped, "toObject", {
    enumerable: false,
    value: function() { return { ...this }; }
  });

  return wrapped;
}

class MockQuery<T = any> {
  private dataPromise: Promise<any>;
  private modelName: string;

  constructor(modelName: string, promise: Promise<any>) {
    this.modelName = modelName;
    this.dataPromise = promise.then((res) => wrapDocument(modelName, res));
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<any> {
    return this.dataPromise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<any> {
    return this.dataPromise.catch(onrejected);
  }

  lean() {
    return this;
  }

  sort(arg?: any) {
    if (arg && typeof arg === "object") {
      const key = Object.keys(arg)[0];
      const order = arg[key];
      this.dataPromise = this.dataPromise.then((data) => {
        if (!Array.isArray(data)) return data;
        return [...data].sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          if (valA < valB) return order === -1 ? 1 : -1;
          if (valA > valB) return order === -1 ? -1 : 1;
          return 0;
        });
      });
    }
    return this;
  }

  limit(num: number) {
    this.dataPromise = this.dataPromise.then((data) => {
      if (!Array.isArray(data)) return data;
      return data.slice(0, num);
    });
    return this;
  }

  select(arg?: any) {
    return this;
  }

  exec() {
    return this.dataPromise;
  }
}

function fallback_find(modelName: string, query: any) {
  const items = readData(modelName);
  const matched = items.filter((item) => matchQuery(item, query));
  return new MockQuery(modelName, Promise.resolve(matched));
}

function fallback_findOne(modelName: string, query: any) {
  const items = readData(modelName);
  const found = items.find((item) => matchQuery(item, query)) || null;
  return new MockQuery(modelName, Promise.resolve(found));
}

function fallback_findById(modelName: string, id: any) {
  const items = readData(modelName);
  const found = items.find((item) => String(item._id || item.id) === String(id)) || null;
  return new MockQuery(modelName, Promise.resolve(found));
}

function fallback_findOneAndUpdate(modelName: string, query: any, update: any, options: any = {}) {
  const items = readData(modelName);
  let foundIndex = items.findIndex((item) => matchQuery(item, query));
  let resultDoc: any = null;

  if (foundIndex !== -1) {
    const updated = applyUpdate(items[foundIndex], update, false);
    items[foundIndex] = updated;
    resultDoc = updated;
  } else if (options.upsert) {
    const baseObj = { _id: "mock_" + Math.random().toString(36).substring(2, 11), ...query, createdAt: new Date(), updatedAt: new Date() };
    const inserted = applyUpdate(baseObj, update, true);
    items.push(inserted);
    resultDoc = inserted;
  }

  writeData(modelName, items);
  return new MockQuery(modelName, Promise.resolve(resultDoc));
}

function fallback_findByIdAndUpdate(modelName: string, id: any, update: any, options: any = {}) {
  const items = readData(modelName);
  let foundIndex = items.findIndex((item) => String(item._id || item.id) === String(id));
  let resultDoc: any = null;

  if (foundIndex !== -1) {
    const updated = applyUpdate(items[foundIndex], update, false);
    items[foundIndex] = updated;
    resultDoc = updated;
  } else if (options.upsert) {
    const baseObj = { _id: id, createdAt: new Date(), updatedAt: new Date() };
    const inserted = applyUpdate(baseObj, update, true);
    items.push(inserted);
    resultDoc = inserted;
  }

  writeData(modelName, items);
  return new MockQuery(modelName, Promise.resolve(resultDoc));
}

function fallback_findOneAndDelete(modelName: string, query: any) {
  const items = readData(modelName);
  const foundIndex = items.findIndex((item) => matchQuery(item, query));
  let deletedDoc: any = null;

  if (foundIndex !== -1) {
    deletedDoc = items[foundIndex];
    items.splice(foundIndex, 1);
    writeData(modelName, items);
  }

  return new MockQuery(modelName, Promise.resolve(deletedDoc));
}

function fallback_findByIdAndDelete(modelName: string, id: any) {
  const items = readData(modelName);
  const foundIndex = items.findIndex((item) => String(item._id || item.id) === String(id));
  let deletedDoc: any = null;

  if (foundIndex !== -1) {
    deletedDoc = items[foundIndex];
    items.splice(foundIndex, 1);
    writeData(modelName, items);
  }

  return new MockQuery(modelName, Promise.resolve(deletedDoc));
}

function fallback_deleteOne(modelName: string, query: any) {
  const items = readData(modelName);
  const foundIndex = items.findIndex((item) => matchQuery(item, query));
  let deletedCount = 0;

  if (foundIndex !== -1) {
    items.splice(foundIndex, 1);
    writeData(modelName, items);
    deletedCount = 1;
  }

  return Promise.resolve({ deletedCount });
}

function fallback_deleteMany(modelName: string, query: any) {
  const items = readData(modelName);
  const beforeCount = items.length;
  const filtered = items.filter((item) => !matchQuery(item, query));
  const deletedCount = beforeCount - filtered.length;

  writeData(modelName, filtered);
  return Promise.resolve({ deletedCount });
}

function fallback_countDocuments(modelName: string, query: any) {
  const items = readData(modelName);
  const matched = items.filter((item) => matchQuery(item, query));
  return new MockQuery(modelName, Promise.resolve(matched.length));
}

function fallback_create(modelName: string, docOrDocs: any) {
  const items = readData(modelName);
  const createSingle = (doc: any) => {
    const newDoc = {
      _id: doc._id || "mock_" + Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...doc
    };
    items.push(newDoc);
    return newDoc;
  };

  if (Array.isArray(docOrDocs)) {
    const created = docOrDocs.map(createSingle);
    writeData(modelName, items);
    return Promise.resolve(created);
  } else {
    const created = createSingle(docOrDocs);
    writeData(modelName, items);
    return Promise.resolve(created);
  }
}

function fallback_insertMany(modelName: string, docs: any[]) {
  const items = readData(modelName);
  const created = docs.map((doc) => ({
    _id: doc._id || "mock_" + Math.random().toString(36).substring(2, 11),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...doc
  }));
  items.push(...created);
  writeData(modelName, items);
  return Promise.resolve(created);
}

// Intercept mongoose model registration
const originalModel = mongoose.model.bind(mongoose);

(mongoose as any).model = function(name: string, schema: any, collection?: any) {
  const OriginalModelClass = originalModel(name, schema, collection);

  class FallbackModelClass extends OriginalModelClass {
    constructor(doc?: any, fields?: any, skipInit?: boolean) {
      super(doc, fields, skipInit);

      const self = this;
      const originalSave = self.save.bind(self);

      self.save = async function(options?: any) {
        if (mongoose.connection.readyState === 1) {
          try {
            return await originalSave(options);
          } catch (e) {
            console.error(`[Mongoose Fallback] Save failed on live DB, falling back to local for ${name}:`, e);
          }
        }

        const items = readData(name);
        const plainObj = self.toObject ? self.toObject() : { ...self };
        const matchId = plainObj._id || plainObj.id || self._id || self.id;
        const foundIndex = items.findIndex((item) => (item._id || item.id) === matchId);

        plainObj.updatedAt = new Date();

        if (foundIndex !== -1) {
          items[foundIndex] = plainObj;
        } else {
          plainObj.createdAt = plainObj.createdAt || new Date();
          items.push(plainObj);
        }

        writeData(name, items);
        return self;
      };
    }
  }

  const staticMethods = [
    "find", "findOne", "findById", "findOneAndUpdate",
    "findByIdAndUpdate", "findOneAndDelete", "findByIdAndDelete",
    "deleteOne", "deleteMany", "countDocuments", "create", "insertMany"
  ];

  for (const method of staticMethods) {
    const originalStaticMethod = (OriginalModelClass as any)[method];

    (FallbackModelClass as any)[method] = function(...args: any[]) {
      if (mongoose.connection.readyState === 1) {
        return originalStaticMethod.apply(OriginalModelClass, args);
      }

      console.warn(`[Mongoose Fallback] MongoDB offline. Executing ${name}.${method} via local storage.`);
      if (method === "find") {
        return fallback_find(name, args[0]);
      }
      if (method === "findOne") {
        return fallback_findOne(name, args[0]);
      }
      if (method === "findById") {
        return fallback_findById(name, args[0]);
      }
      if (method === "findOneAndUpdate") {
        return fallback_findOneAndUpdate(name, args[0], args[1], args[2]);
      }
      if (method === "findByIdAndUpdate") {
        return fallback_findByIdAndUpdate(name, args[0], args[1], args[2]);
      }
      if (method === "findOneAndDelete") {
        return fallback_findOneAndDelete(name, args[0]);
      }
      if (method === "findByIdAndDelete") {
        return fallback_findByIdAndDelete(name, args[0]);
      }
      if (method === "deleteOne") {
        return fallback_deleteOne(name, args[0]);
      }
      if (method === "deleteMany") {
        return fallback_deleteMany(name, args[0]);
      }
      if (method === "countDocuments") {
        return fallback_countDocuments(name, args[0]);
      }
      if (method === "create") {
        return fallback_create(name, args[0]);
      }
      if (method === "insertMany") {
        return fallback_insertMany(name, args[0]);
      }
    };
  }

  return FallbackModelClass;
};
