/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TenantConfig, Product, Promotion, Collaborator, Order } from '../types';

// Beautiful inline SVG drawings of different shoe types in base64 or raw HTML representation to ensure high visual quality
export const SHOE_SVGS = {
  sport: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none"><path d="M10 40 L30 42 Q40 43 50 35 L70 20 Q85 10 90 28 L92 48 Q94 52 80 50 L20 48 Z" fill="%234f46e5"/><path d="M10 40 Q25 45 40 40" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M50 35 L62 48" stroke="%23818cf8" stroke-width="3"/><circle cx="85" cy="45" r="4" fill="%23f43f5e"/><line x1="45" y1="30" x2="52" y2="25" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="49" y1="28" x2="56" y2="23" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  boot: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none"><path d="M15 10 L35 12 L38 35 Q45 42 60 40 L85 45 Q90 48 85 52 L15 52 Z" fill="%23854d0e"/><path d="M15 10 L30 11 L28 35" stroke="%23a16207" stroke-width="3"/><path d="M38 35 L80 52" stroke="white" stroke-dasharray="2 2"/><rect x="15" y="48" width="15" height="5" fill="%23451a03"/></svg>`,
  heel: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none"><path d="M20 48 L40 48 Q55 45 65 24 L85 24 Q90 25 80 45 L78 52" stroke="%23ec4899" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M78 35 L78 52" stroke="%23db2777" stroke-width="4" stroke-linecap="round"/><path d="M22 46 L30 25 Q45 15 65 24" stroke="%23ec4899" stroke-width="3" fill="none"/><circle cx="65" cy="24" r="3" fill="%23fbcfe8"/></svg>`,
  sneaker: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none"><path d="M12 42 L25 42 Q35 44 48 38 L72 25 Q82 20 88 32 L86 48 Q82 50 68 50 L12 48 Z" fill="%230ea5e9"/><path d="M12 42 Q25 46 65 48" stroke="white" stroke-width="2"/><rect x="25" y="46" width="35" height="4" fill="%230284c7"/></svg>`
};

export const defaultTenants: TenantConfig[] = [
  {
    slug: 'urban-shoes',
    licenseKey: 'URBAN-777',
    adminUsername: 'admin',
    adminPasswordHash: 'admin123',
    theme: 'sophisticated-dark',
    storeName: 'Urban Shoes & Co.',
    storePhone: '+5491155551234',
    storeEmail: 'urban.shoes@gmail.com',
    storeAddress: 'Av. Corrientes 1480, Buenos Aires, Argentina',
    storeCoordinates: 'https://maps.google.com/?q=-34.603722,-58.381592',
    referralId: 'DRAGO-URBAN-2026'
  },
  {
    slug: 'glamour-style',
    licenseKey: 'GLAM-2026',
    adminUsername: 'glam',
    adminPasswordHash: 'glam123',
    theme: 'coral-peach',
    storeName: 'Glamour Haute Calzados',
    storePhone: '+5491177778888',
    storeEmail: 'glamour.calzados@gmail.com',
    storeAddress: 'Calle Florida 450, Buenos Aires, Argentina',
    storeCoordinates: 'https://maps.google.com/?q=-34.602511,-58.375624',
    referralId: 'DRAGO-GLAM'
  }
];

export const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    tenantId: 'urban-shoes',
    name: 'Championes Speed Runner Pro',
    sizes: ['38', '39', '40', '41', '42'],
    description: 'Calzado deportivo diseñado para el máximo rendimiento urbano. Suela amortiguada, tejido respirable e interior acolchonado para mayor bienestar y durabilidad.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    price: 85000,
    isLastAvailable: false,
    customFields: [
      { label: 'Material', value: 'Malla Sintética Premium' },
      { label: 'Suela', value: 'Goma Eva Ultra-Absorbente' }
    ],
    createdAt: '2026-06-15T12:00:00Z'
  },
  {
    id: 'prod-2',
    tenantId: 'urban-shoes',
    name: 'Zapatillas Retro Street Blue',
    sizes: ['39', '40', '41'],
    description: 'Estilo clásico de los 90s reinventado. Ideales para el día a día. Cuero sintético fácil de limpiar y costuras reforzadas.',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    price: 62000,
    isLastAvailable: true,
    customFields: [
      { label: 'Color', value: 'Azul Eléctrico / Blanco' },
      { label: 'Suela', value: 'Goma Antideslizante Vulcanizada' }
    ],
    createdAt: '2026-06-16T15:30:00Z'
  },
  {
    id: 'prod-3',
    tenantId: 'glamour-style',
    name: 'Stilettos Velvet Pink Luxury',
    sizes: ['35', '36', '37', '38'],
    description: 'Zapatos de taco alto de gamuza sintética importada, perfectos para fiestas o eventos corporativos de alto nivel. Altura del taco de 9cm.',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    price: 125000,
    isLastAvailable: false,
    customFields: [
      { label: 'Taco', value: '9 cm Fino Revestido' },
      { label: 'Capellada', value: 'Gamuza de Microfibra' }
    ],
    createdAt: '2026-06-14T09:12:00Z'
  },
  {
    id: 'prod-4',
    tenantId: 'glamour-style',
    name: 'Botas Croft de Cuero Marrón',
    sizes: ['37', '38', '39', '40'],
    description: 'Botas de media caña con cierre lateral y detalles en bronce clásico heavy metal. Ideales para la época de bajas temperaturas e invierno crudo.',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
    price: 154000,
    isLastAvailable: true,
    customFields: [
      { label: 'Material', value: 'Cuero Vacuno Encerado' },
      { label: 'Forro', value: 'Térmico Acolchado' }
    ],
    createdAt: '2026-06-17T18:45:00Z'
  }
];

export const defaultPromotions: Promotion[] = [
  {
    id: 'promo-1',
    tenantId: 'urban-shoes',
    name: 'Super Oferta Runner Deportiva',
    description: 'Consigue tus Speed Runners a un precio imperdible. Stock hiper limitado para liquidación de temporada corriente.',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
    sizes: ['39', '40', '41'],
    originalPrice: 110000,
    offerPrice: 79000,
    badgeText: '30% OFF',
    createdAt: '2026-06-18T10:00:00Z'
  },
  {
    id: 'promo-2',
    tenantId: 'glamour-style',
    name: 'Promo Especial Botas de Invierno',
    description: 'Colección Otoño-Invierno con descuento único. ¡Perfectas para combinar estética boho con dureza de calzado de primera categoría!',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80',
    sizes: ['36', '37', '38'],
    originalPrice: 185000,
    offerPrice: 139000,
    badgeText: 'HOT SALE',
    createdAt: '2026-06-18T11:15:00Z'
  }
];

export const defaultCollaborators: Collaborator[] = [
  {
    id: 'colab-1',
    tenantId: 'urban-shoes',
    username: 'mateo',
    passwordHash: 'mateo123',
    name: 'Mateo González',
    phone: '+5491112223333',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'colab-2',
    tenantId: 'glamour-style',
    username: 'sofia',
    passwordHash: 'sofia123',
    name: 'Sofía Martínez',
    phone: '+5491144445555',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  }
];

export const defaultOrders: Order[] = [
  {
    id: 'order-1',
    tenantId: 'urban-shoes',
    code: 'ZP-1025',
    customerName: 'Juan Pérez',
    customerPhone: '1165438765',
    items: [
      { name: 'Championes Speed Runner Pro', size: '40', quantity: 1, price: 85000, isPromo: false }
    ],
    total: 85000,
    status: 'concretado',
    createdAt: '2026-06-18T14:20:00Z',
    handledBy: 'admin'
  },
  {
    id: 'order-2',
    tenantId: 'urban-shoes',
    code: 'ZP-8751',
    customerName: 'Lucía Domínguez',
    customerPhone: '1134981122',
    items: [
      { name: 'Zapatillas Retro Street Blue', size: '39', quantity: 1, price: 62000, isPromo: false }
    ],
    total: 62000,
    status: 'pendiente',
    createdAt: '2026-06-18T16:45:00Z'
  },
  {
    id: 'order-3',
    tenantId: 'glamour-style',
    code: 'GM-3412',
    customerName: 'Camila Rossi',
    customerPhone: '1177651234',
    items: [
      { name: 'Promo Especial Botas de Invierno', size: '37', quantity: 1, price: 139000, isPromo: true }
    ],
    total: 139000,
    status: 'pendiente',
    createdAt: '2026-06-18T17:10:00Z'
  }
];
