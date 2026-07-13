/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ShieldAlert, Key, HelpCircle, Phone, MapPin, Mail, 
  Share2, ArrowUpRight, Sparkles, Check, CheckCircle2, Ticket, Lock, RefreshCw, QrCode, X, Footprints, Fingerprint
} from 'lucide-react';

import { 
  TenantConfig, Product, Promotion, Order, Collaborator, CartItem, ThemeStyle 
} from './types';
import { 
  defaultTenants, defaultProducts, defaultPromotions, defaultCollaborators, defaultOrders 
} from './data/defaultData';
import ThemeStyles from './components/ThemeStyles';
import CartModal from './components/CartModal';
import AdminPanel from './components/AdminPanel';
import CollaboratorPanel from './components/CollaboratorPanel';
import * as cloud from './cloud';
import * as bio from './biometric';

export default function App() {
  // --- Persistent Local Database State Engine ---
  const [tenants, setTenants] = useState<TenantConfig[]>(() => {
    const saved = localStorage.getItem('saas_tenants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t: TenantConfig) => {
          if (t.slug === 'urban-shoes' && t.theme === 'royal-blue') {
            return { ...t, theme: 'sophisticated-dark' };
          }
          return t;
        });
      } catch (e) {
        return defaultTenants;
      }
    }
    return defaultTenants;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('saas_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: Product) => {
          if (p.id === 'prod-1' && p.image?.startsWith('data:image')) {
            return { ...p, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' };
          }
          if (p.id === 'prod-2' && p.image?.startsWith('data:image')) {
            return { ...p, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80' };
          }
          if (p.id === 'prod-3' && p.image?.startsWith('data:image')) {
            return { ...p, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80' };
          }
          if (p.id === 'prod-4' && p.image?.startsWith('data:image')) {
            return { ...p, image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80' };
          }
          return p;
        });
      } catch (e) {
        return defaultProducts;
      }
    }
    return defaultProducts;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('saas_promotions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: Promotion) => {
          if (p.id === 'promo-1' && p.image?.startsWith('data:image')) {
            return { ...p, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80' };
          }
          if (p.id === 'promo-2' && p.image?.startsWith('data:image')) {
            return { ...p, image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80' };
          }
          return p;
        });
      } catch (e) {
        return defaultPromotions;
      }
    }
    return defaultPromotions;
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    const saved = localStorage.getItem('saas_collaborators');
    return saved ? JSON.parse(saved) : defaultCollaborators;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('saas_orders');
    return saved ? JSON.parse(saved) : defaultOrders;
  });

  // Guardado local seguro: si el navegador se queda sin espacio
  // (QuotaExceededError por imágenes grandes) NO debe romper la app.
  const guardarLocal = (clave: string, valor: any) => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {
      console.warn('No se pudo guardar en el navegador (' + clave + '):', e);
    }
  };

  // Save states modifications automatically
  useEffect(() => {
    guardarLocal('saas_tenants', tenants);
  }, [tenants]);

  useEffect(() => {
    guardarLocal('saas_products', products);
  }, [products]);

  useEffect(() => {
    guardarLocal('saas_promotions', promotions);
  }, [promotions]);

  useEffect(() => {
    guardarLocal('saas_collaborators', collaborators);
  }, [collaborators]);

  useEffect(() => {
    guardarLocal('saas_orders', orders);
  }, [orders]);



  // --- Routing & Active Tenants ---
  // Detect tenant in URL query, otherwise fallback to first tenant
  const [activeTenantSlug, setActiveTenantSlug] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const slugParam = params.get('tenant') || params.get('local') || params.get('referido');
    return slugParam || defaultTenants[0].slug;
  });

  const activeTenant = tenants.find(t => t.slug === activeTenantSlug) || tenants[0];

  // Cart operations
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Authorization state
  const [adminUser, setAdminUser] = useState<TenantConfig | null>(null);
  const [colabUser, setColabUser] = useState<Collaborator | null>(null);
  const [adminPreviewMode, setAdminPreviewMode] = useState(false);
  
  // Login flow modal state
  const [isOpenAuthForm, setIsOpenAuthForm] = useState(false);
  const [authStage, setAuthStage] = useState<'license' | 'login'>('license');
  const [authRoleSelection, setAuthRoleSelection] = useState<'admin' | 'colab'>('admin');
  
  // Inputs
  const [licenseInput, setLicenseInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Ingreso biométrico (huella / Face ID) en este dispositivo
  const [bioAvail, setBioAvail] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [bioCheck, setBioCheck] = useState(false);
  useEffect(() => { bio.bioSupported().then(setBioAvail); setBioOn(bio.bioEnabled()); }, []);

  // Share widgets feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // --- NUBE: aplicar datos de un local al estado (scoped por código) ---
  function applyCloudData(code: string, data: cloud.CloudData) {
    if (data.config) {
      const cfg = { ...(data.config as any), slug: code, licenseKey: (data.config as any).licenseKey || code } as TenantConfig;
      setTenants(prev => { const others = prev.filter(t => t.slug !== code); return [cfg, ...others]; });
    }
    if (data.products) setProducts(prev => [...(data.products as any[]).map((p: any) => ({ ...p, tenantId: code })), ...prev.filter(p => p.tenantId !== code)]);
    if (data.promotions) setPromotions(prev => [...(data.promotions as any[]).map((p: any) => ({ ...p, tenantId: code })), ...prev.filter(p => p.tenantId !== code)]);
    if (data.orders) setOrders(prev => [...(data.orders as any[]).map((o: any) => ({ ...o, tenantId: code })), ...prev.filter(o => o.tenantId !== code)]);
    if (data.collaborators) setCollaborators(prev => [...(data.collaborators as any[]).map((c: any) => ({ ...c, tenantId: code })), ...prev.filter(c => c.tenantId !== code)]);
  }

  // --- NUBE: catálogo público si la URL trae ?tenant=CODIGO ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get('tenant') || params.get('local') || params.get('referido') || '').trim();
    if (!code) return;
    (async () => {
      const pub = await cloud.calzadoPublica(code);
      if (pub && (pub as any).config) { applyCloudData(code, pub); setActiveTenantSlug(code); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- NUBE: guardar el local activo cuando hay sesión (debounce) ---
  useEffect(() => {
    const code = adminUser?.slug || (colabUser as any)?.tenantId;
    if (!code) return;
    const t = setTimeout(() => {
      const cfg = tenants.find(x => x.slug === code) || adminUser || {};
      cloud.cloudSave(code, {
        config: cfg as any,
        products: products.filter(p => p.tenantId === code),
        promotions: promotions.filter(p => p.tenantId === code),
        orders: orders.filter(o => o.tenantId === code),
        collaborators: collaborators.filter(c => c.tenantId === code),
      });
    }, 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminUser, colabUser, tenants, products, promotions, orders, collaborators]);

  // --- Modo oscuro SOLO en el panel admin (la tienda pública no se toca) ---
  useEffect(() => {
    const root = document.documentElement;
    if (adminUser && !adminPreviewMode) root.classList.add('dark');
    else root.classList.remove('dark');
    return () => { root.classList.remove('dark'); };
  }, [adminUser, adminPreviewMode]);

  // Filter Catalog
  const activeProducts = products.filter(p => p.tenantId === activeTenant.slug);
  const activePromos = promotions.filter(p => p.tenantId === activeTenant.slug);

  // Cart action handlers
  const handleAddToCart = (item: Product | Promotion, isPromo: boolean) => {
    // Si no eligió talle, tomamos el primero disponible (o 'Único' si no hay talles).
    let selectedSize = selectedSizes[item.id];
    if (!selectedSize) {
      const sizes = (item as any).sizes as string[] | undefined;
      if (sizes && sizes.length > 0) {
        selectedSize = sizes[0];
        setSelectedSizes(prev => ({ ...prev, [item.id]: selectedSize }));
      } else {
        selectedSize = 'Único';
      }
    }

    const cartItemId = `${item.id}-${selectedSize}`;
    
    setCart(prev => {
      const match = prev.find(i => i.id === cartItemId);
      if (match) {
        return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: cartItemId, product: item, selectedSize, quantity: 1, isPromotion: isPromo }];
    });

    // Notify user elegantly
    const notifier = document.getElementById('floating-cart-indicator');
    if (notifier) {
      notifier.classList.add('scale-110', 'bg-amber-500');
      setTimeout(() => {
        notifier.classList.remove('scale-110', 'bg-amber-500');
      }, 350);
    }
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handlePlaceOrder = (customerName: string, customerPhone: string) => {
    const pickupCode = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      tenantId: activeTenant.slug,
      code: pickupCode,
      customerName,
      customerPhone,
      items: cart.map(item => {
        const p = item.product;
        const price = item.isPromotion ? (p as any).offerPrice : p.price;
        return {
          name: p.name,
          size: item.selectedSize,
          quantity: item.quantity,
          price,
          isPromo: item.isPromotion
        };
      }),
      total: cart.reduce((add, item) => {
        const price = item.isPromotion ? (item.product as any).offerPrice : item.product.price;
        return add + (price * item.quantity);
      }, 0),
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    if (!adminUser && !colabUser) cloud.calzadoAgregarPedido(activeTenant.slug, newOrder as any);
    setCart([]); // Clear the shopping cart
    return { code: pickupCode, success: true };
  };

  // --- Auth Login Actions ---
  const handleOpenAuth = () => {
    setAuthStage('license');
    setLicenseInput('');
    setUsernameInput('');
    setPasswordInput('');
    setAuthError('');
    setIsOpenAuthForm(true);
  };

  const verifyLicense = async () => {
    const code = licenseInput.trim().toUpperCase();
    if (!code) { setAuthError('Ingresá tu código de licencia.'); return; }
    setVerifying(true); setAuthError('');
    try {
      const lic: any = await cloud.validarLicencia(code);
      if (!lic) { setAuthError('Licencia inválida, inactiva o vencida.'); return; }
      const nuevo: TenantConfig = {
        slug: code,
        licenseKey: code,
        adminUsername: lic.usuario_admin || 'admin',
        adminPasswordHash: lic.pass_admin || '',
        theme: 'sophisticated-dark',
        storeName: lic.nombre_negocio || 'Mi Tienda',
        storePhone: lic.telefono || '',
        storeEmail: lic.correo_cliente || '',
        storeAddress: '',
      };
      setTenants(prev => { const others = prev.filter(t => t.slug !== code); return [nuevo, ...others]; });
      setActiveTenantSlug(code);
      setUsernameInput(lic.usuario_admin || '');
      setAuthStage('login');
    } finally { setVerifying(false); }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = activeTenant.slug;
    if (authRoleSelection === 'admin') {
      const r = await cloud.asegurarCuentaSeguraDueno(usernameInput.trim(), passwordInput, code);
      if (!r.ok) { setAuthError(r.msg || 'Usuario o contraseña administrativa incorrecta.'); return; }
      const data = await cloud.cloudLoad(code);
      if (data) applyCloudData(code, data);
      const merged = { ...activeTenant, ...((data && data.config) ? (data.config as any) : {}), slug: code } as TenantConfig;
      setAdminUser(merged);
      setColabUser(null);
      setIsOpenAuthForm(false);
      setAuthError('');
    } else {
      const r = await cloud.asegurarCuentaSeguraColab(usernameInput.trim(), passwordInput, code);
      if (!r.ok) { setAuthError(r.msg || 'Usuario o contraseña de colaborador incorrecta.'); return; }
      const data = await cloud.cloudLoad(code);
      if (data) applyCloudData(code, data);
      const colabs: any[] = (data && data.collaborators) ? (data.collaborators as any[]) : [];
      const found = colabs.find(c => (c.username || '').toLowerCase() === usernameInput.trim().toLowerCase());
      const colab: Collaborator = found ? { ...found, tenantId: code } : {
        id: 'colab-' + Date.now(), tenantId: code, username: usernameInput.trim(),
        passwordHash: passwordInput, name: usernameInput.trim(), phone: '', avatar: '',
      };
      setColabUser(colab);
      setAdminUser(null);
      setIsOpenAuthForm(false);
      setAuthError('');
    }
    // Si tildó "activar huella", la registramos en este equipo (login exitoso)
    if (bioCheck && bioAvail) {
      try { await bio.bioEnable({ codigo: code, usuario: usernameInput.trim(), password: passwordInput, role: authRoleSelection }); setBioOn(true); }
      catch (e) { /* si la huella falla, igual entró */ }
    }
  };

  // Ingreso con huella / Face ID: recupera credenciales y hace el login completo
  const handleBioLogin = async () => {
    setAuthError('');
    let creds;
    try { creds = await bio.bioLogin(); }
    catch (e) { setAuthError('Huella cancelada o no disponible en este dispositivo.'); return; }
    if (!creds) { setAuthError('No se pudo leer la huella. Entrá con tus datos.'); return; }
    const code = creds.codigo;
    const lic: any = await cloud.validarLicencia(code);
    if (!lic) { setAuthError('Licencia inválida o vencida.'); return; }
    const nuevo: TenantConfig = {
      slug: code, licenseKey: code,
      adminUsername: lic.usuario_admin || 'admin', adminPasswordHash: lic.pass_admin || '',
      theme: 'sophisticated-dark', storeName: lic.nombre_negocio || 'Mi Tienda',
      storePhone: lic.telefono || '', storeEmail: lic.correo_cliente || '', storeAddress: '',
    };
    setTenants(prev => { const others = prev.filter(t => t.slug !== code); return [nuevo, ...others]; });
    setActiveTenantSlug(code);
    const r = creds.role === 'admin'
      ? await cloud.asegurarCuentaSeguraDueno(creds.usuario, creds.password, code)
      : await cloud.asegurarCuentaSeguraColab(creds.usuario, creds.password, code);
    if (!r.ok) { setAuthError((r.msg || 'No se pudo entrar') + ' — volvé a ingresar tus datos.'); return; }
    const data = await cloud.cloudLoad(code);
    if (data) applyCloudData(code, data);
    if (creds.role === 'admin') {
      const merged = { ...nuevo, ...((data && data.config) ? (data.config as any) : {}), slug: code } as TenantConfig;
      setAdminUser(merged); setColabUser(null);
    } else {
      const colabs: any[] = (data && data.collaborators) ? (data.collaborators as any[]) : [];
      const found = colabs.find(c => (c.username || '').toLowerCase() === creds.usuario.toLowerCase());
      const colab: Collaborator = found ? { ...found, tenantId: code } : {
        id: 'colab-' + Date.now(), tenantId: code, username: creds.usuario,
        passwordHash: creds.password, name: creds.usuario, phone: '', avatar: '',
      };
      setColabUser(colab); setAdminUser(null);
    }
    setIsOpenAuthForm(false); setAuthError('');
  };

  // State Sync modifiers for Admin Panel
  const handleUpdateTenantConfig = (updated: TenantConfig) => {
    setTenants(prev => prev.map(t => t.slug === updated.slug ? updated : t));
    if (adminUser && adminUser.slug === updated.slug) {
      setAdminUser(updated);
    }
  };

  const handleAddProduct = (prod: Product) => {
    setProducts(prev => [prod, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPromotion = (promo: Promotion) => {
    setPromotions(prev => [promo, ...prev]);
  };

  const handleDeletePromotion = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = (id: string, status: 'concretado' | 'cancelado', actorId: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, handledBy: actorId } : o));
  };

  const handleAddCollaborator = (colab: Collaborator) => {
    setCollaborators(prev => [colab, ...prev]);
  };

  const handleDeleteCollaborator = (id: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== id));
  };

  const handleCollaboratorSelfUpdate = (colab: Collaborator) => {
    setCollaborators(prev => prev.map(c => c.id === colab.id ? colab : c));
    setColabUser(colab);
  };

  // Share action
  const handleSharePage = () => {
    const rawUrl = `${window.location.origin}${window.location.pathname}?tenant=${activeTenant.slug}`;
    navigator.clipboard.writeText(rawUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className={`theme-bg-page min-h-screen flex flex-col font-sans transition-colors duration-200`}>
      {/* Dynamic Style Injection */}
      <ThemeStyles theme={activeTenant.theme} fontStyle={activeTenant.fontStyle} />

      {/* RENDER MODAL: ADMIN ACCESS OR COLLABORATOR PORTAL DIRECTORY */}
      {adminUser && !adminPreviewMode ? (
        <AdminPanel
          tenant={adminUser}
          onUpdateTenant={handleUpdateTenantConfig}
          products={products}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          promotions={promotions}
          onAddPromotion={handleAddPromotion}
          onDeletePromotion={handleDeletePromotion}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          collaborators={collaborators}
          onAddCollaborator={handleAddCollaborator}
          onDeleteCollaborator={handleDeleteCollaborator}
          onLogout={() => {
            setAdminUser(null);
            setAdminPreviewMode(false);
          }}
          onPreviewStore={() => {
            setAdminPreviewMode(true);
            setActiveTenantSlug(adminUser.slug);
          }}
        />
      ) : colabUser ? (
        <CollaboratorPanel
          collaborator={colabUser}
          tenant={activeTenant}
          onUpdateCollaborator={handleCollaboratorSelfUpdate}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onLogout={() => setColabUser(null)}
        />
      ) : (
        /* --- PUBLIC STOREFRONT FOR CUSTOMERS --- */
        <div className="flex-1 flex flex-col relative" id="customer-storefront">
          {adminPreviewMode && (
            <div className="bg-rose-600 text-white px-4 py-3.5 text-center text-xs flex flex-row items-center justify-between font-semibold shadow-md no-print sticky top-0 z-50">
              <div className="flex items-center gap-2 text-left">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0"></span>
                <span className="leading-tight">
                  Previsualizando <strong>Tienda Pública</strong> de {activeTenant.storeName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAdminPreviewMode(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all border border-slate-700 cursor-pointer shadow-sm shrink-0"
                id="close-admin-preview-btn"
              >
                Cerrar Vista y Volver al Admin
              </button>
            </div>
          )}
          
          {/* TOP NAV BAR - FLOATING PERSISTENT CART */}
          <nav className="sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b theme-border-main py-4 px-6 z-30 flex justify-between items-center transition-colors">
            {/* Store brand */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 theme-btn-primary rounded-xl flex items-center justify-center font-black text-white text-md shadow-xs overflow-hidden">
                {activeTenant.logo ? <img src={activeTenant.logo} alt="logo" className="w-full h-full object-cover" /> : activeTenant.storeName.charAt(0)}
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight theme-text-main block">
                  {activeTenant.storeName}
                </span>
                <span className="text-[10px] theme-text-secondary block font-bold -mt-1">
                  Catálogo Calzado 2026
                </span>
              </div>
            </div>

            {/* PERSISTENT FLOATING BASKET - CENTERED GRAPHIC IN NAVBAR */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative py-2 px-5 bg-stone-900 border border-stone-800 text-white rounded-full flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all"
                id="floating-cart-indicator"
              >
                <div className="relative">
                  <ShoppingBag size={17} className="text-amber-400" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 w-4.5 h-4.5 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                      {cart.reduce((add, item) => add + item.quantity, 0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline text-stone-200">
                  Canasto
                </span>
              </button>
            </div>

            {/* ADMIN LOGIN BUTTON - RIGHT CORNER */}
            <div>
              <button
                onClick={handleOpenAuth}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-extrabold hover:bg-gray-100 dark:hover:bg-zinc-800 px-3 py-2 rounded-xl transition-all text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white border theme-border-main cursor-pointer"
                id="admin-access-trigger"
              >
                <Lock size={12} className="text-[var(--theme-primary)]" />
                ADMINISTRADOR
              </button>
            </div>
          </nav>

          {/* EYE-CATCHING BRAND HERO HERO */}
          <header className="relative py-12 px-6 overflow-hidden bg-slate-50 dark:bg-zinc-900/40 border-b theme-border-main text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-1 bg-rose-500/10 text-[var(--theme-primary)] text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                <Sparkles size={11} /> ¡Últimas Novedades y Ofertas!
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight theme-text-main max-w-2xl mx-auto leading-tight">
                Eleva tu pisada al siguiente nivel de confort
              </h1>
              <p className="text-xs sm:text-sm theme-text-secondary max-w-lg mx-auto">
                Explora el catálogo oficial de <strong className="theme-text-main">{activeTenant.storeName}</strong>. Encarga online en simples clics y retira de inmediato por nuestro local comercial.
              </p>
            </div>
          </header>

          {/* COMPACT PWA STATUS BANNER FOR OFFLINE CONFIDENCE */}
          <div className="bg-gray-50 dark:bg-zinc-900 border-b theme-border-main p-3 text-center text-xs text-gray-500 dark:text-gray-400 flex justify-center items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Retiros listos en menos de 1 hora.</span>
          </div>

          {/* MAIN CATALOG AREA */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-12">
            
            {/* -- CAMPAÑAS Y PROMOCIONES SECTOR (IF ANY) -- */}
            {activePromos.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-100 text-red-600 block">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Promociones Imperdibles</h2>
                    <p className="text-xs text-gray-400">Cupos limitados, precios exclusivos en calzados seleccionados.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="promotions-grid">
                  {activePromos.map(promo => (
                    <div
                      key={promo.id}
                      className="bg-white dark:bg-zinc-900 border theme-border-main p-5 rounded-2xl flex flex-col sm:flex-row gap-5 items-stretch shadow-xs relative overflow-hidden text-left"
                    >
                      {/* Badge overlay */}
                      {promo.badgeText && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-xs tracking-wider z-10">
                          {promo.badgeText}
                        </div>
                      )}

                      {/* Photo Promo */}
                      <div className="w-full sm:w-44 h-40 bg-slate-50 dark:bg-zinc-800 rounded-xl relative overflow-hidden pr-2 flex items-center justify-center shrink-0">
                        <img
                          src={promo.image}
                          alt={promo.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Details & Actions */}
                      <div className="flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white line-clamp-1">
                            {promo.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {promo.description}
                          </p>

                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-xs text-gray-400 line-through">
                              ${promo.originalPrice.toLocaleString('es-AR')}
                            </span>
                            <span className="text-xl font-black text-red-600">
                              ${promo.offerPrice.toLocaleString('es-AR')} ARS
                            </span>
                          </div>
                        </div>

                        {/* Size select */}
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-gray-400 block uppercase">
                              Selecciona Talla Promocional
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {promo.sizes.map(size => (
                                <button
                                  key={size}
                                  onClick={() => setSelectedSizes(prev => ({ ...prev, [promo.id]: size }))}
                                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    selectedSizes[promo.id] === size
                                      ? 'bg-rose-500 text-white scale-105'
                                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddToCart(promo, true)}
                            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                            id={`add-promo-btn-${promo.id}`}
                          >
                            Agregar Oferta al Canasto
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* -- PUBLIC GENERAL PRODUCTS CATALOG LIST -- */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-[var(--theme-primary)] block">
                  <Footprints size={17} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Nuestro Catálogo Oficial</h2>
                  <p className="text-xs text-gray-400">Colección importada con ajuste ergonómico y acabados premium.</p>
                </div>
              </div>

              {activeProducts.length === 0 ? (
                <div className="p-16 text-center text-gray-400 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs">
                  Lo sentimos, no hay calzados en saldo actualmente para esta tienda. ¡Sé el primero en publicarlos desde el Panel!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="products-grid">
                  {activeProducts.map(product => {
                    const isSelected = selectedSizes[product.id];
                    return (
                      <div
                        key={product.id}
                        className="bg-white dark:bg-zinc-900 border theme-border-main rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left group"
                        id={`product-card-${product.id}`}
                      >
                        {/* Image sector with dynamic badge */}
                        <div className="h-48 bg-slate-100/60 dark:bg-zinc-800/60 p-4 relative flex items-center justify-center shrink-0">
                          {/* Last item alarm */}
                          {product.isLastAvailable && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-sm shadow-xs tracking-wider animate-pulse z-10">
                              🚨 ÚLTIMO DISPONIBLE
                            </div>
                          )}

                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Attribute & Info details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 h-8">
                              {product.description}
                            </p>

                            <div className="text-lg font-black text-slate-900 dark:text-white pt-1">
                              ${product.price.toLocaleString('es-AR')} ARS
                            </div>
                          </div>

                          {/* Dynamic Extra Field values rendered inline */}
                          {product.customFields && product.customFields.length > 0 && (
                            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-zinc-800/40 rounded-lg">
                              {product.customFields.map((f, i) => (
                                <span key={i} className="text-[10px] text-gray-500 mr-2">
                                  <strong className="text-gray-600 dark:text-gray-300">{f.label}:</strong> {f.value}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Size Select Button Slider list */}
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 block uppercase">
                                Selecciona Talla (Talle)
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {product.sizes.map(size => (
                                  <button
                                    key={size}
                                    onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: size }))}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                      selectedSizes[product.id] === size
                                        ? 'theme-btn-primary scale-105'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Add to basket Action */}
                            <button
                              onClick={() => handleAddToCart(product, false)}
                              className="w-full py-2.5 theme-btn-primary rounded-xl font-bold text-xs transition-transform active:scale-98 cursor-pointer shadow-xs uppercase tracking-wider"
                              id={`add-product-btn-${product.id}`}
                            >
                              Agregar al Canasto
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </main>

          {/* --- BRANDED RECONSTRUCTED FOOTER WITH MAPS LOCATION OR CONTACT INFO --- */}
          <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-white py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-8 border-b border-slate-800 pb-8">
              {/* Store address details */}
              <div className="space-y-4">
                <span className="text-xl font-extrabold tracking-tight block">
                  📍 Visita Nuestro Local
                </span>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                  {activeTenant.storeAddress} <br/>
                  Prepará tu pedido en línea y evitalas demoras en caja retirándolo presencialmente.
                </p>
                {activeTenant.storeCoordinates && (
                  <a
                    href={activeTenant.storeCoordinates}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-bold hover:underline"
                    id="maps-direction-link"
                  >
                    Ver mapa en Google Maps <ArrowUpRight size={14} />
                  </a>
                )}
              </div>

              {/* Direct channels */}
              <div className="space-y-4">
                <span className="text-lg font-extrabold tracking-tight block">
                  📞 Canales de Atención
                </span>
                <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-emerald-500 shrink-0" />
                    <span>Whatsapp: {activeTenant.storePhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-rose-500 shrink-0" />
                    <span className="truncate">E-mail: {activeTenant.storeEmail}</span>
                  </div>
                </div>
              </div>

              {/* Quick links & QR Drawer trigger */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-black uppercase tracking-widest text-orange-400 block">
                  ¡Atención en tienda!
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Presenta tu pantalla con el código de retiro generado. El personal verificará tu par para realizar el cobro del calzado.
                </p>
                <div className="text-[11.5px] font-black text-white flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Garantía directa de cambio: 30 días en local.
                </div>
              </div>
            </div>

            {/* LOWER PORTION: SHARING ACTIONS AND AFFILIATES NOTATIONS */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400">
              
              {/* Sharing button row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Compartir Página button */}
                <button
                  onClick={handleSharePage}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] font-bold"
                  id="share-storefront-btn"
                >
                  <Share2 size={13} />
                  {copiedLink ? '¡Enlace de Tienda Copiado!' : 'Compartir Página'}
                </button>

                {/* 2. Quiero Mi Página button */}
                <a
                  href="mailto:dragoprot26@gmail.com?subject=Quiero%20mi%20pagina%20referido&body=Hola!%20Vengo%20referido%20desde%20la%20pagina%20de%20zapatos.%20Quiero%20mi%20propia%20tienda%20online..."
                  className="px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-teal-400 rounded-lg flex items-center gap-1 transition-colors text-[11px] font-bold"
                  id="referral-support-btn"
                >
                  <span>✨ Quiero Mi Página (Referido)</span>
                </a>
              </div>

              {/* Mandatory Referrals Legend to dragoprot26@gmail.com */}
              <div className="text-center md:text-right max-w-md space-y-1.5">
                <p className="text-[10.5px] leading-relaxed italic text-slate-300">
                  ¿Quieres tu propio catálogo online de zapatos, ropa o almacén? Contactate con <strong className="text-teal-400 hover:underline">dragoprot26@gmail.com</strong> para tener tu propia página profesional para tu negocio. Ideal para nuevos emprendedores desde su casa o tienda física.
                </p>
                <span className="block text-[9.5px] text-slate-500">
                  © 2026 PWA Calzados. Desarrollado e impulsado de forma independiente para tiendas de alto volumen.
                </span>
              </div>
            </div>
          </footer>

          {/* --- PERSISTENT CART OVERLAY INNER SHEET --- */}
          <CartModal
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveFromCart}
            onPlaceOrder={handlePlaceOrder}
          />

          {/* --- VERIFICACION LOGIN LICENSE DRAWER MODAL --- */}
          <AnimatePresence>
            {isOpenAuthForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Overlay backdrop */}
                <div
                  onClick={() => setIsOpenAuthForm(false)}
                  className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
                />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border theme-border-main p-6 sm:p-8 w-full max-w-md shrink-0 shadow-2xl relative z-10 text-left space-y-5"
                  id="auth-verification-form"
                >
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-rose-100 text-rose-600 rounded-full">
                        <Key size={18} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-zinc-800 dark:text-white">Autenticación Segura</h3>
                        <p className="text-[10px] text-gray-400">Verificaciones de licencias SaaS</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpenAuthForm(false)}
                      className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-100 border border-red-200 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authStage === 'license' ? (
                    /* STAGE 1: ENTER AND VERIFY PRODUCT LICENCE */
                    <div className="space-y-4">
                      {bioAvail && bioOn && (
                        <div>
                          <button
                            type="button"
                            onClick={handleBioLogin}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                          >
                            <Fingerprint size={16} /> Ingresar con huella / Face ID
                          </button>
                          <div className="flex items-center gap-2 my-3">
                            <span className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                            <span className="text-[10px] text-gray-400 uppercase">o con tu licencia</span>
                            <span className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="block text-xs uppercase font-extrabold text-slate-500">
                          Paso 1: Licencia Habilitante del Inquilino
                        </label>
                        <p className="text-[10.5px] text-gray-400 leading-relaxed">
                          La licencia valida que la suscripción de software del negocio está al día en la plataforma multi-inquilino.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={licenseInput}
                          onChange={(e) => setLicenseInput(e.target.value)}
                          placeholder="Ingresá tu código de licencia (CALZ-...)"
                          className="w-full text-sm font-mono p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl uppercase tracking-wider focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-hidden"
                          id="license-key-input"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={verifyLicense}
                        disabled={verifying}
                        className="w-full theme-btn-primary p-3.5 rounded-xl text-center text-xs font-bold tracking-widest uppercase cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        id="verify-license-btn"
                      >
                        {verifying ? 'Verificando…' : <>Verificar Licencia <ArrowUpRight size={13} /></>}
                      </button>
                    </div>
                  ) : (
                    /* STAGE 2: ENTER PROFILE CREDENTIALS (ADMIN VS STAFF COLABORADOR) */
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs uppercase font-extrabold text-slate-500">
                          Paso 2: Credenciales de Acceso
                        </label>
                        <p className="text-[10.5px] text-gray-400">
                          Licencia <strong className="text-emerald-500">{licenseInput.toUpperCase()}</strong> verificada. Ahora introduce tu usuario corporativo.
                        </p>
                      </div>

                      {/* Role selection radio toggle button */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-xl border">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthRoleSelection('admin');
                            setAuthError('');
                          }}
                          className={`py-2 text-xs font-bold text-center rounded-lg transition-all cursor-pointer ${
                            authRoleSelection === 'admin' 
                              ? 'bg-slate-900 dark:bg-zinc-700 text-white shadow-xs' 
                              : 'text-gray-500 hover:text-slate-800'
                          }`}
                        >
                          Administrador
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthRoleSelection('colab');
                            setAuthError('');
                          }}
                          className={`py-2 text-xs font-bold text-center rounded-lg transition-all cursor-pointer ${
                            authRoleSelection === 'colab' 
                              ? 'bg-slate-900 dark:bg-zinc-700 text-white shadow-xs' 
                              : 'text-gray-500 hover:text-slate-800'
                          }`}
                        >
                          Colaborador
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                            Nombre de Usuario
                          </label>
                          <input
                            type="text"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            placeholder={authRoleSelection === 'admin' ? 'Ej. admin' : 'Ej. mateo o sofia'}
                            className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-[var(--theme-primary)]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                            Contraseña Secreta
                          </label>
                          <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Tu contraseña"
                            className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-[var(--theme-primary)]"
                            required
                          />
                        </div>

                      </div>

                      {bioAvail && !bioOn && (
                        <label className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl border cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bioCheck}
                            onChange={(e) => setBioCheck(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-emerald-600"
                          />
                          <span>🔒 <strong>Activar ingreso con huella / Face ID</strong> en este dispositivo, para no volver a tipear las credenciales.</span>
                        </label>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAuthStage('license')}
                          className="flex-1 border p-3.5 rounded-xl text-center text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          className="flex-[2] theme-btn-primary p-3.5 rounded-xl text-center text-xs font-bold tracking-wider uppercase cursor-pointer"
                          id="submit-credentials-btn"
                        >
                          INGRESAR AL PANEL
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
