export interface Product {
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
}

export interface CartItem extends Product {
  quantity: number;
}
