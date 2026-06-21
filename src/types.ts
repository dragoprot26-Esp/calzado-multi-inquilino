/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CustomField {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sizes: string[]; // e.g. ["38", "39", "40", "41"]
  description: string;
  image: string; // URL or Base64 string
  price: number;
  isLastAvailable: boolean;
  isNovedad?: boolean;
  customFields: CustomField[];
  createdAt: string;
}

export interface Promotion {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  image: string;
  sizes: string[];
  originalPrice: number;
  offerPrice: number;
  createdAt: string;
  badgeText?: string;
}

export interface CartItem {
  id: string;
  product: Product | Promotion;
  selectedSize: string;
  quantity: number;
  isPromotion: boolean;
}

export type OrderStatus = 'pendiente' | 'concretado' | 'cancelado';

export interface Order {
  id: string;
  tenantId: string;
  code: string; // 6-digit alphanumeric pickup code, e.g. TX-489
  customerName: string;
  customerPhone: string;
  items: {
    name: string;
    size: string;
    quantity: number;
    price: number;
    isPromo: boolean;
  }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  handledBy?: 'admin' | string; // Collaborator ID or admin
}

export interface Collaborator {
  id: string;
  tenantId: string;
  username: string;
  passwordHash: string;
  name: string;
  phone: string;
  avatar: string; // url or bases64
}

export type ThemeStyle = 'modern-dark' | 'sophisticated-dark' | 'minimal-light' | 'coral-peach' | 'emerald-garden' | 'royal-blue' | 'golden-vintage' | 'sunset-fire' | 'ocean-deep' | 'candy-pop' | 'lavender-mist' | 'mono-noir';

export interface TenantConfig {
  slug: string; // e.g., 'calzados-premium'
  licenseKey: string; // license verification
  adminUsername: string;
  adminPasswordHash: string;
  theme: ThemeStyle;
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  storeCoordinates?: string; // Maps location string
  logo?: string; // logo del local (url o base64)
  coverImage?: string; // foto de portada/local (fondo del hero)
  referralId?: string;
  fontStyle?: 'sans-ui' | 'serif-elegant' | 'grotesk-tech' | 'cinzel-luxury' | 'unbounded-bold' | 'gothic-black' | 'cursive-script' | 'cursive-vibes' | 'retro-pacifico';
}
