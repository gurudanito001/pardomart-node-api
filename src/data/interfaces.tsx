// user.model.ts
export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  mobileVerified: boolean;
  dynamicMediaUrls?: any; // JSON type, adjust as needed
  active: boolean;
  language?: string;
  notification?: any; // JSON type, adjust as needed
  rememberToken?: string;
  referralCode?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// vendor.model.ts
export interface Vendor {
  id: string;
  name?: string;
  tagline?: string;
  details?: string;
  meta?: any; // JSON type, adjust as needed
  mediaurls?: any; // JSON type, adjust as needed
  minimumOrder?: number;
  deliveryFee?: number;
  area?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  isVerified: boolean;
  userId: string;
  ratings?: number;
  ratingsCount?: number;
  favouriteCount?: number;
  isFavourite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// category.model.ts
export interface Category {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  dynamicMediaUrls?: any; // JSON type, adjust as needed
  parentId?: number;
  isSelected?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// support.model.ts
export interface Support {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// setting.model.ts
export interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}