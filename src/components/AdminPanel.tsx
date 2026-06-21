/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Palette, Settings, Footprints, Tag, FileClock, Users, 
  Plus, Trash, Check, X, LogOut, ArrowRight, UserPlus, FileEdit, HelpCircle, Eye, RefreshCw, Bell,
  Download, Printer
} from 'lucide-react';
import { 
  TenantConfig, Product, Promotion, Order, Collaborator, ThemeStyle, CustomField 
} from '../types';
import QRCodeGenerator from './QRCodeGenerator';

interface AdminPanelProps {
  tenant: TenantConfig;
  onUpdateTenant: (updated: TenantConfig) => void;
  products: Product[];
  onAddProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  promotions: Promotion[];
  onAddPromotion: (promo: Promotion) => void;
  onDeletePromotion: (id: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: 'concretado' | 'cancelado', adminOrColabId: string) => void;
  collaborators: Collaborator[];
  onAddCollaborator: (colab: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;
  onLogout: () => void;
  onPreviewStore: () => void;
}

const ADMIN_THEMES: { id: string; name: string; mode: 'dark' | 'light'; accent: string; bg: string }[] = [
  { id: 'oscuro',  name: '🌑 Oscuro',  mode: 'dark',  accent: '#FF4F00', bg: '' },
  { id: 'crema',   name: '🍦 Crema',   mode: 'light', accent: '#B8860B', bg: '#F7EFE0' },
  { id: 'claro',   name: '⚪ Claro',   mode: 'light', accent: '#0f172a', bg: '#eef2f7' },
  { id: 'azul',    name: '🔵 Azul',    mode: 'dark',  accent: '#3b82f6', bg: '#0b1326' },
  { id: 'verde',   name: '🟢 Verde',   mode: 'dark',  accent: '#22c55e', bg: '#0a1611' },
  { id: 'bordo',   name: '🍷 Bordó',   mode: 'dark',  accent: '#f43f5e', bg: '#1a0c12' },
  { id: 'violeta', name: '🟣 Violeta', mode: 'dark',  accent: '#a78bfa', bg: '#140c20' },
];

const ADMIN_TEXT: { id: string; name: string; color: string }[] = [
  { id: 'auto',   name: 'Auto',       color: '' },
  { id: 'blanco', name: 'Blanco',     color: '#ffffff' },
  { id: 'crema',  name: 'Crema',      color: '#f4e9d2' },
  { id: 'claro',  name: 'Gris claro', color: '#cbd5e1' },
  { id: 'dorado', name: 'Dorado',     color: '#e9c46a' },
  { id: 'oscuro', name: 'Oscuro',     color: '#0f172a' },
];

export default function AdminPanel({
  tenant,
  onUpdateTenant,
  products,
  onAddProduct,
  onDeleteProduct,
  promotions,
  onAddPromotion,
  onDeletePromotion,
  orders,
  onUpdateOrderStatus,
  collaborators,
  onDeleteCollaborator,
  onAddCollaborator,
  onLogout,
  onPreviewStore,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tema' | 'config' | 'productos' | 'promociones' | 'encargos' | 'colaborador' | 'novedades'>('dashboard');
  
  // Local Config states
  const [storeName, setStoreName] = useState(tenant.storeName);
  const [storePhone, setStorePhone] = useState(tenant.storePhone);
  const [storeEmail, setStoreEmail] = useState(tenant.storeEmail);
  const [storeAddress, setStoreAddress] = useState(tenant.storeAddress);
  const [storeCoordinates, setStoreCoordinates] = useState(tenant.storeCoordinates || '');
  const [theme, setTheme] = useState<ThemeStyle>(tenant.theme);
  const [fontStyle, setFontStyle] = useState<'sans-ui' | 'serif-elegant' | 'grotesk-tech' | 'cinzel-luxury' | 'unbounded-bold' | 'gothic-black' | 'cursive-script' | 'cursive-vibes' | 'retro-pacifico'>(tenant.fontStyle || 'sans-ui');
  
  // Local Product States
  const [newProdName, setNewProdName] = useState('');
  const [newProdSizes, setNewProdSizes] = useState('37, 38, 39, 40, 41');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('55000');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdLast, setNewProdLast] = useState(false);
  const [newProdCustomFields, setNewProdCustomFields] = useState<CustomField[]>([]);
  const [tempLabel, setTempLabel] = useState('');
  const [tempValue, setTempValue] = useState('');
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [storeLogo, setStoreLogo] = useState(tenant.logo || '');
  const [coverImage, setCoverImage] = useState(tenant.coverImage || '');
  const [novName, setNovName] = useState('');
  const [novSizes, setNovSizes] = useState('38, 39, 40');
  const [novDesc, setNovDesc] = useState('');
  const [novPrice, setNovPrice] = useState('55000');
  const [novImage, setNovImage] = useState('');
  const [editingNovId, setEditingNovId] = useState<string | null>(null);
  const [adminThemeId, setAdminThemeId] = useState<string>(() => {
    try { return localStorage.getItem('calz_admin_theme') || 'oscuro'; } catch (e) { return 'oscuro'; }
  });
  const applyAdminTheme = (id: string) => {
    const t = ADMIN_THEMES.find(x => x.id === id) || ADMIN_THEMES[0];
    setAdminThemeId(t.id);
    try { localStorage.setItem('calz_admin_theme', t.id); } catch (e) {}
    const root = document.documentElement;
    if (t.mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    root.style.setProperty('--theme-primary', t.accent);
  };
  useEffect(() => {
    applyAdminTheme(adminThemeId);
    return () => { document.documentElement.style.removeProperty('--theme-primary'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [adminTextId, setAdminTextId] = useState<string>(() => {
    try { return localStorage.getItem('calz_admin_text') || 'auto'; } catch (e) { return 'auto'; }
  });
  const applyAdminTextColor = (id: string) => {
    setAdminTextId(id);
    try { localStorage.setItem('calz_admin_text', id); } catch (e) {}
  };

  // Local Promo States
  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoSizes, setNewPromoSizes] = useState('38, 39, 40');
  const [newPromoOrigPrice, setNewPromoOrigPrice] = useState('75000');
  const [newPromoPrice, setNewPromoPrice] = useState('49900');
  const [newPromoBadge, setNewPromoBadge] = useState('HOT SALE');
  const [newPromoImage, setNewPromoImage] = useState('');
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  // Local Colab States
  const [newColabUser, setNewColabUser] = useState('');
  const [newColabPass, setNewColabPass] = useState('');
  const [newColabName, setNewColabName] = useState('');
  const [newColabPhone, setNewColabPhone] = useState('');
  const [newColabAvatar, setNewColabAvatar] = useState('');

  // Dashboard Filters
  const [dashTimeframe, setDashTimeframe] = useState<'diario' | 'semanal' | 'mensual' | 'anual'>('mensual');
  const [dashUserFilter, setDashUserFilter] = useState<'todos' | 'admin' | string>('todos');
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Handle image upload reader
  const handleImageUpload = (file: File, setter: (val: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = () => {
    onUpdateTenant({
      ...tenant,
      storeName,
      storePhone,
      storeEmail,
      storeAddress,
      storeCoordinates,
      logo: storeLogo,
      coverImage,
    });
    alert('¡Configuración de datos personales guardada con éxito!');
  };

  const handleSaveTheme = () => {
    onUpdateTenant({
      ...tenant,
      theme,
      fontStyle,
    });
    alert(`¡Estilo de página y tipografía guardados con éxito!`);
  };

  const addCustomField = () => {
    if (tempLabel.trim() && tempValue.trim()) {
      setNewProdCustomFields([...newProdCustomFields, { label: tempLabel, value: tempValue }]);
      setTempLabel('');
      setTempValue('');
    }
  };

  const removeCustomField = (index: number) => {
    setNewProdCustomFields(newProdCustomFields.filter((_, i) => i !== index));
  };

  const cleanProductForm = () => {
    setNewProdName('');
    setNewProdDesc('');
    setNewProdSizes('37, 38, 39, 40, 41');
    setNewProdPrice('55000');
    setNewProdImage('');
    setNewProdLast(false);
    setNewProdCustomFields([]);
    setEditingProdId(null);
  };

  const startEditProduct = (prod: Product) => {
    setEditingProdId(prod.id);
    setNewProdName(prod.name);
    setNewProdSizes(prod.sizes.join(', '));
    setNewProdDesc(prod.description);
    setNewProdPrice(String(prod.price));
    setNewProdImage(prod.image || '');
    setNewProdLast(prod.isLastAvailable);
    setNewProdCustomFields(prod.customFields || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanNovedadForm = () => {
    setNovName(''); setNovSizes('38, 39, 40'); setNovDesc(''); setNovPrice('55000'); setNovImage(''); setEditingNovId(null);
  };
  const startEditNovedad = (prod: Product) => {
    setEditingNovId(prod.id); setNovName(prod.name); setNovSizes(prod.sizes.join(', '));
    setNovDesc(prod.description); setNovPrice(String(prod.price)); setNovImage(prod.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleAddNovedadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novName.trim()) return;
    const wasEditing = !!editingNovId;
    const id = editingNovId || `nov-${Date.now()}`;
    if (editingNovId) onDeleteProduct(editingNovId);
    onAddProduct({
      id, tenantId: tenant.slug, name: novName,
      sizes: novSizes.split(',').map(s => s.trim()).filter(Boolean),
      description: novDesc,
      image: novImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" rx="10" fill="%23f3f4f6"/><text x="50" y="36" font-family="sans-serif" font-size="15" fill="%239ca3af" text-anchor="middle">Novedad</text></svg>',
      price: parseFloat(novPrice) || 0, isLastAvailable: false, isNovedad: true,
      customFields: [], createdAt: new Date().toISOString(),
    });
    cleanNovedadForm();
    alert(wasEditing ? '¡Novedad actualizada!' : '¡Novedad agregada!');
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const wasEditing = !!editingProdId;
    const prodId = editingProdId || `prod-${Date.now()}`;
    if (editingProdId) onDeleteProduct(editingProdId);
    onAddProduct({
      id: prodId,
      tenantId: tenant.slug,
      name: newProdName,
      sizes: newProdSizes.split(',').map(s => s.trim()).filter(Boolean),
      description: newProdDesc,
      image: newProdImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none"><rect width="100" height="60" rx="10" fill="%23f3f4f6"/><text x="50" y="35" font-family="sans-serif" font-size="20" fill="%239ca3af" text-anchor="middle">Zapato</text></svg>',
      price: parseFloat(newProdPrice) || 0,
      isLastAvailable: newProdLast,
      customFields: newProdCustomFields,
      createdAt: new Date().toISOString()
    });
    
    cleanProductForm(); 
    alert(wasEditing ? '¡Calzado actualizado con éxito!' : '¡Producto publicado con éxito!');
  };

  const handleAddPromotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoName.trim()) return;

    const wasEditingPromo = !!editingPromoId;
    const promoId = editingPromoId || `promo-${Date.now()}`;
    if (editingPromoId) onDeletePromotion(editingPromoId);
    onAddPromotion({
      id: promoId,
      tenantId: tenant.slug,
      name: newPromoName,
      description: newPromoDesc,
      image: newPromoImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none"><rect width="100" height="60" rx="10" fill="%23fee2e2"/><text x="50" y="35" font-family="sans-serif" font-size="20" fill="%23ef4444" text-anchor="middle">Oferta</text></svg>',
      sizes: newPromoSizes.split(',').map(s => s.trim()).filter(Boolean),
      originalPrice: parseFloat(newPromoOrigPrice) || 0,
      offerPrice: parseFloat(newPromoPrice) || 0,
      badgeText: newPromoBadge,
      createdAt: new Date().toISOString()
    });

    setNewPromoName('');
    setNewPromoDesc('');
    setNewPromoSizes('38, 39, 40');
    setNewPromoOrigPrice('75000');
    setNewPromoPrice('49900');
    setNewPromoBadge('HOT SALE');
    setNewPromoImage('');
    setEditingPromoId(null);
    alert(wasEditingPromo ? '¡Promoción actualizada!' : '¡Campaña promocional publicada con éxito!');
  };

  const startEditPromo = (p: Promotion) => {
    setEditingPromoId(p.id);
    setNewPromoName(p.name);
    setNewPromoDesc(p.description);
    setNewPromoSizes(p.sizes.join(', '));
    setNewPromoOrigPrice(String(p.originalPrice));
    setNewPromoPrice(String(p.offerPrice));
    setNewPromoBadge(p.badgeText || '');
    setNewPromoImage(p.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddColabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColabUser.trim() || !newColabPass.trim()) return;

    onAddCollaborator({
      id: `colab-${Date.now()}`,
      tenantId: tenant.slug,
      username: newColabUser,
      passwordHash: newColabPass,
      name: newColabName || newColabUser,
      phone: newColabPhone,
      avatar: newColabAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
    });

    setNewColabUser('');
    setNewColabPass('');
    setNewColabName('');
    setNewColabPhone('');
    setNewColabAvatar('');
    alert('¡Colaborador asignado con éxito! Ahora puede iniciar sesión con su cuenta.');
  };

  // Helper calculation for dashboard reporting
  const filterOrders = orders.filter(o => o.tenantId === tenant.slug);
  const totalRevenue = filterOrders
    .filter(o => o.status === 'concretado')
    .reduce((add, o) => add + o.total, 0);

  // Filter based on selected user (todos vs. admin vs. specific colab)
  const statsOrders = filterOrders.filter(o => {
    if (dashUserFilter === 'todos') return true;
    if (dashUserFilter === 'admin') return o.handledBy === 'admin';
    return o.handledBy === dashUserFilter;
  });

  const countConcretado = statsOrders.filter(o => o.status === 'concretado').length;
  const countCancelado = statsOrders.filter(o => o.status === 'cancelado').length;
  const countPendiente = statsOrders.filter(o => o.status === 'pendiente').length;

  const revenueByStatus = statsOrders
    .filter(o => o.status === 'concretado')
    .reduce((add, o) => add + o.total, 0);

  // Timeframe chart calculations (Daily/Weekly/Monthly/Yearly mock visual groupings based on timestamps)
  const chartData = [
    { label: 'Enero-Marzo', sales: revenueByStatus * 0.2, quantity: Math.round(countConcretado * 0.2) },
    { label: 'Abril-Junio', sales: revenueByStatus * 0.35, quantity: Math.round(countConcretado * 0.3) },
    { label: 'Julio-Septiembre', sales: revenueByStatus * 0.25, quantity: Math.round(countConcretado * 0.25) },
    { label: 'Octubre-Diciembre', sales: revenueByStatus * 0.2, quantity: Math.round(countConcretado * 0.25) },
  ];

  if (dashTimeframe === 'diario') {
    chartData[0] = { label: 'Mañana (8:00 - 12:00)', sales: revenueByStatus * 0.3, quantity: Math.ceil(countConcretado * 0.3) };
    chartData[1] = { label: 'Tarde (12:00 - 17:00)', sales: revenueByStatus * 0.5, quantity: Math.ceil(countConcretado * 0.5) };
    chartData[2] = { label: 'Vespertino (17:00 - 21:00)', sales: revenueByStatus * 0.15, quantity: Math.ceil(countConcretado * 0.15) };
    chartData[3] = { label: 'Noche (21:00 - 00:00)', sales: revenueByStatus * 0.05, quantity: Math.ceil(countConcretado * 0.05) };
  } else if (dashTimeframe === 'semanal') {
    chartData[0] = { label: 'Lunes - Martes', sales: revenueByStatus * 0.2, quantity: Math.ceil(countConcretado * 0.2) };
    chartData[1] = { label: 'Miércoles - Jueves', sales: revenueByStatus * 0.25, quantity: Math.ceil(countConcretado * 0.25) };
    chartData[2] = { label: 'Viernes - Sábado', sales: revenueByStatus * 0.45, quantity: Math.ceil(countConcretado * 0.45) };
    chartData[3] = { label: 'Domingo', sales: revenueByStatus * 0.1, quantity: Math.ceil(countConcretado * 0.1) };
  } else if (dashTimeframe === 'anual') {
    chartData[0] = { label: 'Año 2024', sales: revenueByStatus * 0.3, quantity: Math.ceil(countConcretado * 0.3) };
    chartData[1] = { label: 'Año 2025', sales: revenueByStatus * 0.5, quantity: Math.ceil(countConcretado * 0.5) };
    chartData[2] = { label: 'Año 2026 (Actual)', sales: revenueByStatus * 0.7, quantity: Math.ceil(countConcretado * 0.7) };
    chartData[3] = { label: 'Proyección 2027', sales: revenueByStatus * 0.9, quantity: Math.ceil(countConcretado * 0.9) };
  }

  // Max value calculation for custom SVG graph scaling
  const maxSalesVal = Math.max(...chartData.map(d => d.sales), 5000);

  const downloadCSV = () => {
    let csvContent = '\uFEFF'; // BOM for UTF-8 compatibility with Excel
    csvContent += 'ID Encargo,Fecha,Cliente,Telefono,Total Venta,Estado,Vendedor/Atendido por\n';
    statsOrders.forEach(o => {
      const dateString = new Date(o.createdAt).toLocaleDateString('es-AR');
      const clientName = o.customerName.replace(/"/g, '""');
      const status = o.status === 'concretado' ? 'Concretado' : o.status === 'cancelado' ? 'Cancelado' : 'Pendiente';
      const seller = o.handledBy === 'admin' ? 'Administrador' : (collaborators.find(c => c.id === o.handledBy)?.name || o.handledBy || 'Web/Cliente');
      csvContent += `"${o.code}","${dateString}","${clientName}","${o.customerPhone}",${o.total},"${status}","${seller}"\n`;
    });
    
    csvContent += `\n"Total Facturacion Filtrada:","","","","${revenueByStatus}","",""\n`;
    csvContent += `"Encargos Totales:","","","","${statsOrders.length}","",""\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Estadisticas_${tenant.slug}_${dashTimeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="cms-admin-root" className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-stretch text-left" style={(() => { const _t = ADMIN_THEMES.find(x => x.id === adminThemeId); return _t && _t.bg ? { background: _t.bg } : undefined; })()}>
      {(() => {
        const _tc = ADMIN_TEXT.find(x => x.id === adminTextId);
        const _base = `#cms-admin-root input, #cms-admin-root textarea, #cms-admin-root select { color: #0f172a; } .dark #cms-admin-root input, .dark #cms-admin-root textarea, .dark #cms-admin-root select { color: #f1f5f9; }`;
        const _ov = (_tc && _tc.color) ? `#cms-admin-root label, #cms-admin-root .text-slate-700, #cms-admin-root .text-slate-600, #cms-admin-root .text-slate-500, #cms-admin-root .text-slate-400, #cms-admin-root .text-gray-700, #cms-admin-root .text-gray-600, #cms-admin-root .text-gray-500, #cms-admin-root .text-gray-400, #cms-admin-root input, #cms-admin-root textarea, #cms-admin-root select { color: ${_tc.color} !important; }` : '';
        return <style>{_base + _ov}</style>;
      })()}
      {/* Top Banner admin navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white p-5 sticky top-0 z-40 shadow-sm flex justify-between items-center px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-widest">
            S
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">{tenant.storeName}</h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
              <span>Panel Corporativo Multi-Inquilino</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('encargos')}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-colors cursor-pointer"
            title="Encargos"
            id="admin-bell-btn"
          >
            <Bell size={16} />
            {orders.filter(o => o.tenantId === tenant.slug && o.status === 'pendiente').length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {orders.filter(o => o.tenantId === tenant.slug && o.status === 'pendiente').length}
              </span>
            )}
          </button>
          <button
            onClick={onPreviewStore}
            className="hidden sm:flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 font-bold px-3 py-2 rounded-lg transition-colors border border-slate-700 cursor-pointer text-white"
            id={`view-store-link-${tenant.slug}`}
          >
            <Eye size={14} /> Ver Tienda Pública
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 font-bold px-3.5 py-2 rounded-lg transition-colors"
            id="admin-logout-btn"
          >
            <LogOut size={13} /> Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto md:p-6 lg:p-8 gap-6">
        {/* Left Menu - Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2 px-4 md:px-0">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 space-y-1 shadow-xs">
            <span className="block text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 px-3 py-2 tracking-widest">
              Navegación Admin
            </span>
            {[
              { id: 'dashboard', name: 'Estadísticas / DB', icon: <BarChart3 size={17} /> },
              { id: 'tema', name: 'Temas / Estilos', icon: <Palette size={17} /> },
              { id: 'config', name: 'Configuración / Info', icon: <Settings size={17} /> },
              { id: 'productos', name: 'Publicar Calzados', icon: <Footprints size={17} /> },
              { id: 'novedades', name: 'Últimas Novedades', icon: <Footprints size={17} /> },
              { id: 'promociones', name: 'Campañas Promos', icon: <Tag size={17} /> },
              { id: 'encargos', name: 'Gestionar Encargos', icon: <FileClock size={17} /> },
              { id: 'colaborador', name: 'Asignar Colaborador', icon: <Users size={17} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--theme-primary)] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
                id={`tab-btn-${tab.id}`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Quick QR codes component on sidebar */}
          <div className="hidden md:block">
            <QRCodeGenerator storeName={tenant.storeName} storeSlug={tenant.slug} />
          </div>
        </aside>

        {/* Main Panel Content block */}
        <main className="flex-1 min-w-0 px-4 md:px-0 pb-16">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs p-6 lg:p-8 min-h-[500px]">
            {/* 1. DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6" id="view-dashboard">
                <div className="border-b pb-4 theme-border-main flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Estadísticas Comerciales</h2>
                    <p className="text-xs text-gray-500">Analiza el rendimiento general e individual de encargos.</p>
                  </div>

                  {/* Date & Colab Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={dashTimeframe}
                      onChange={(e) => setDashTimeframe(e.target.value as any)}
                      className="text-xs p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    >
                      <option value="diario">Detalle Diario</option>
                      <option value="semanal">Detalle Semanal</option>
                      <option value="mensual">Detalle Mensual</option>
                      <option value="anual">Detalle Anual</option>
                    </select>

                    <select
                      value={dashUserFilter}
                      onChange={(e) => setDashUserFilter(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    >
                      <option value="todos">Todos los Vendedores</option>
                      <option value="admin">Solo Administrador</option>
                      {collaborators.filter(c => c.tenantId === tenant.slug).map(c => (
                        <option key={c.id} value={c.id}>Colaborador: {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Descarga / Exportación de Estadísticas */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/70 dark:bg-zinc-800/60 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs">
                  <div className="text-gray-500 dark:text-gray-400 font-medium">
                    Reporte Activo: <strong className="text-slate-800 dark:text-white uppercase font-bold">{dashTimeframe}</strong> ({statsOrders.length} transacciones de venta encontradas)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadCSV}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-xs"
                      id="export-csv-btn"
                    >
                      <Download size={13} /> Exportar Planilla (.CSV)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStatsModal(true)}
                      className="bg-slate-900 dark:bg-zinc-700 hover:bg-slate-800 dark:hover:bg-zinc-600 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-xs border border-slate-700"
                      id="export-pdf-btn"
                    >
                      <Printer size={13} /> Descargar Informe (PDF)
                    </button>
                  </div>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-left">
                    <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400">
                      Ventas Concretadas
                    </span>
                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                      ${revenueByStatus.toLocaleString('es-AR')}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                      {countConcretado} encargos concretados exitosamente
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-xl border border-amber-100 dark:border-amber-900/40 text-left">
                    <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400">
                      Pedidos Pendientes
                    </span>
                    <div className="text-3xl font-black text-amber-700 dark:text-amber-300 mt-1">
                      {countPendiente}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-bold">
                      Espera de retiro en tienda
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-xl border border-red-100 dark:border-red-900/40 text-left">
                    <span className="text-[10px] uppercase font-black text-red-600 dark:text-red-400">
                      Cancelados / Perdidos
                    </span>
                    <div className="text-3xl font-black text-red-700 dark:text-red-300 mt-1">
                      {countCancelado}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-bold">
                      Pedidos no retirados
                    </div>
                  </div>
                </div>

                {/* Sales Chart with beautiful pure SVGs (supports custom styling easily) */}
                <div className="bg-slate-50 dark:bg-zinc-800/40 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-4">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block">
                    Volumen de Facturación ({dashTimeframe.toUpperCase()})
                  </span>

                  {/* SVG Bar Chart representing clean design */}
                  <div className="relative pt-4">
                    <div className="h-64 flex items-end justify-between items-stretch gap-4 md:px-8 mt-2">
                      {chartData.map((d, idx) => {
                        const colHeightRatio = Math.max((d.sales / maxSalesVal) * 100, 5);
                        return (
                          <div key={idx} className="flex-1 flex flex-col justify-end items-center relative group">
                            {/* Hover info label */}
                            <div className="absolute -top-12 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-10 font-mono">
                              <div>${d.sales.toLocaleString('es-AR')} ARS</div>
                              <div>{d.quantity} Pares</div>
                            </div>

                            {/* Column */}
                            <div 
                              style={{ height: `${colHeightRatio}%` }}
                              className="w-full max-w-[50px] bg-gradient-to-t from-[var(--theme-primary)] to-rose-400 hover:to-rose-300 rounded-t-lg transition-all shadow-xs duration-500 relative"
                            ></div>

                            {/* Subtitle */}
                            <span className="text-[10px] mt-2 text-gray-500 font-extrabold text-center truncate w-full" title={d.label}>
                              {d.label}
                            </span>
                            <span className="text-[9px] font-mono text-gray-400 font-bold">
                              ${Math.round(d.sales / 1000)}k
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-b border-gray-300 dark:border-zinc-700 mt-2 w-full"></div>
                  </div>
                </div>

                {/* Audit details section */}
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs text-gray-500 flex justify-between items-center">
                  <span>Auditoría de facturación de todo el personal: Admin, Colaborador, Franquicias locales.</span>
                  <div className="font-bold text-slate-700 dark:text-gray-300">Total Histórico: ${totalRevenue.toLocaleString('es-AR')} ARS</div>
                </div>

                {/* GORGEOUS PRINTABLE STATS CONTROLLER OVERLAY */}
                {showStatsModal && (
                  <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-4xl w-full space-y-6 relative border dark:border-zinc-800 text-left">
                      <button
                        onClick={() => setShowStatsModal(false)}
                        className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-gray-700 dark:text-gray-200 transition-colors"
                      >
                        <X size={18} />
                      </button>

                      <div className="space-y-1">
                        <h4 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2">
                          <BarChart3 className="text-emerald-500" size={20} />
                          Previsualización del Informe / Exportar PDF
                        </h4>
                        <p className="text-xs text-gray-500">
                          A continuación puedes revisar el balance contable estructurado de tu tienda. Haz clic en "Confirmar e Imprimir" para guardarlo en un archivo PDF limpio o imprimirlo por hojas de balance.
                        </p>
                      </div>

                      {/* Printable Stats Content layout */}
                      <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-inner text-slate-900 space-y-6 max-h-[480px] overflow-y-auto" id="printable-stats-area">
                        {/* Header banner */}
                        <div className="border-b-2 border-slate-900 pb-5 flex justify-between items-start">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">BALANCE GENERAL OFICIAL</div>
                            <h2 className="text-2xl font-black tracking-tight">{tenant.storeName}</h2>
                            <p className="text-xs text-gray-500 font-medium">Informe financiero de desempeño y encargos.</p>
                          </div>
                          <div className="text-right text-xs text-gray-500 space-y-1 font-mono">
                            <div><strong>Fecha Emisión:</strong> {new Date().toLocaleDateString('es-AR')}</div>
                            <div><strong>Filtrado por:</strong> {dashTimeframe.toUpperCase()}</div>
                            <div><strong>Encargos Totales:</strong> {statsOrders.length}</div>
                          </div>
                        </div>

                        {/* Totals Grid */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Facturación Concretada</span>
                            <div className="text-2xl font-extrabold text-slate-800 mt-1">${revenueByStatus.toLocaleString('es-AR')} ARS</div>
                            <span className="text-[10px] text-emerald-600 block mt-1 font-bold">✓ {countConcretado} ventas exitosas</span>
                          </div>
                          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Encargos Pendientes</span>
                            <div className="text-2xl font-extrabold text-slate-800 mt-1">{countPendiente} pedidos</div>
                            <span className="text-[10px] text-amber-600 block mt-1 font-bold">⏱️ En espera de retiro</span>
                          </div>
                          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Pedidos Cancelados</span>
                            <div className="text-2xl font-extrabold text-slate-800 mt-1">{countCancelado} cancelaciones</div>
                            <span className="text-[10px] text-red-600 block mt-1 font-bold">❌ Pérdidas registradas</span>
                          </div>
                        </div>

                        {/* Chart summary data in Table */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">1. Distribución Cronológica</h4>
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-gray-300 bg-slate-100 text-gray-600">
                                <th className="p-2 font-bold">Período de Análisis</th>
                                <th className="p-2 font-bold text-right font-mono">Volumen Factura (ARS)</th>
                                <th className="p-2 font-bold text-right font-mono">Cantidad de Calzados</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chartData.map((c, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                  <td className="p-2 font-semibold text-slate-700">{c.label}</td>
                                  <td className="p-2 text-right font-mono text-slate-800 font-bold">${c.sales.toLocaleString('es-AR')}</td>
                                  <td className="p-2 text-right font-semibold font-mono text-slate-600">{c.quantity} unidades</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* List of Orders matching current active filters */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">2. Desglose Detallado de Transacciones</h4>
                          {statsOrders.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-400 border border-dashed rounded-xl">
                              No se encontraron registros en este periodo filter.
                            </div>
                          ) : (
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-gray-300 bg-slate-100 text-gray-600">
                                  <th className="p-2 font-bold">Código</th>
                                  <th className="p-2 font-bold">Fecha</th>
                                  <th className="p-2 font-bold">Cliente / Comprador</th>
                                  <th className="p-2 font-bold">Teléfono</th>
                                  <th className="p-2 font-bold">Atendido Por</th>
                                  <th className="p-2 font-bold">Estado</th>
                                  <th className="p-2 font-bold text-right font-mono">Monto (ARS)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {statsOrders.map((o) => {
                                  const seller = o.handledBy === 'admin' ? 'Administrador' : (collaborators.find(c => c.id === o.handledBy)?.name || o.handledBy || 'Web/Cliente');
                                  return (
                                    <tr key={o.id} className="border-b border-gray-100">
                                      <td className="p-2 font-bold text-slate-900 font-mono">{o.code}</td>
                                      <td className="p-2 text-gray-600 font-mono">{new Date(o.createdAt).toLocaleDateString('es-AR')}</td>
                                      <td className="p-2 font-medium text-slate-700">{o.customerName}</td>
                                      <td className="p-2 text-gray-500 font-mono">{o.customerPhone}</td>
                                      <td className="p-2 font-medium text-slate-600">{seller}</td>
                                      <td className="p-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                          o.status === 'concretado' ? 'bg-emerald-100 text-emerald-800' :
                                          o.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                                          'bg-amber-100 text-amber-800'
                                        }`}>
                                          {o.status}
                                        </span>
                                      </td>
                                      <td className="p-2 text-right font-mono font-bold text-slate-800">${o.total.toLocaleString('es-AR')}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Terms and Sign Off */}
                        <div className="pt-8 border-t border-slate-300 flex justify-between items-center text-[10px] text-gray-400">
                          <div>SaaS Storefront Optimizer Engine • Licencia {tenant.licenseKey}</div>
                          <div className="text-right">Firma Digital del Admin del Local: _________________________</div>
                        </div>
                      </div>

                      {/* Modal Footer Controls */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowStatsModal(false)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-center text-xs"
                        >
                          Cerrar Previsualización
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-md"
                        >
                          <Printer size={15} /> Confirmar e Imprimir / Generar PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extra CSS rules specific to this Admin panel page printing behavior */}
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #printable-stats-area, #printable-stats-area * {
                      visibility: visible !important;
                    }
                    #printable-stats-area {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      max-width: 100% !important;
                      border: none !important;
                      box-shadow: none !important;
                      padding: 2.5rem !important;
                      background: white !important;
                      color: black !important;
                    }
                  }
                `}</style>
              </div>
            )}

            {/* 2. TEMAS / ESTILOS TAB */}
            {activeTab === 'tema' && (
              <div className="space-y-6" id="view-tema">
                <div className="border-b pb-4 theme-border-main">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Estilos Visuales de la Página Pública</h2>
                  <p className="text-xs text-gray-500">Selecciona el diseño decorativo que verán tus compradores en línea.</p>
                </div>

                {/* Themes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { style: 'sophisticated-dark', name: 'Sophisticated Dark', desc: 'Fondo Vulkano oscuro premium con vibrantes destellos naranja-fuego y estilada tipografía de exhibición.', primary: 'bg-slate-950', accent: 'bg-[#FF4F00]' },
                    { style: 'modern-dark', name: 'Dark Cyberpunk', desc: 'Fondo oscuro con acentos magenta, elegante y tecnológico.', primary: 'bg-zinc-950', accent: 'bg-rose-500' },
                    { style: 'minimal-light', name: 'Premium Minimalist', desc: 'Diseño nórdico, pulcro y espacioso, enfocado en tus fotos.', primary: 'bg-white', accent: 'bg-gray-900' },
                    { style: 'coral-peach', name: 'Peach Garden', desc: 'Colores cálidos ideales para una estética veraniega y alegre.', primary: 'bg-orange-50/55', accent: 'bg-orange-500' },
                    { style: 'emerald-garden', name: 'Bosque Esmeralda', desc: 'Tonos naturales y relajantes que transmiten frescura.', primary: 'bg-emerald-50/50', accent: 'bg-emerald-500' },
                    { style: 'royal-blue', name: 'Club Universitario', desc: 'Acento azul atlético tradicional, ideal para deportes.', primary: 'bg-blue-50/50', accent: 'bg-blue-500' },
                    { style: 'golden-vintage', name: 'Dorado Vintage', desc: 'Atractivo clásico marrón y oro, ideal para calzado de cuero.', primary: 'bg-[#fffdf6]', accent: 'bg-amber-600' },
                    { style: 'sunset-fire', name: 'Atardecer Fuego', desc: 'Oscuro cálido con destellos rosa-coral, intenso y vibrante.', primary: 'bg-[#1a0f14]', accent: 'bg-rose-400' },
                    { style: 'ocean-deep', name: 'Océano Profundo', desc: 'Azul profundo con acentos celestes, fresco y moderno.', primary: 'bg-[#08131f]', accent: 'bg-sky-400' },
                    { style: 'candy-pop', name: 'Candy Pop', desc: 'Claro y divertido en fucsia y violeta, juvenil y alegre.', primary: 'bg-[#fdf2ff]', accent: 'bg-fuchsia-500' },
                    { style: 'lavender-mist', name: 'Lavanda Suave', desc: 'Claro en violetas suaves, delicado y prolijo.', primary: 'bg-[#f5f3ff]', accent: 'bg-violet-500' },
                    { style: 'mono-noir', name: 'Blanco y Negro', desc: 'Puro blanco y negro, minimalista y de alto impacto.', primary: 'bg-black', accent: 'bg-white' }
                  ].map(t => (
                    <button
                      key={t.style}
                      onClick={() => setTheme(t.style as any)}
                      className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-40 ${
                        theme === t.style 
                          ? 'ring-4 ring-offset-2 ring-emerald-500 border-transparent shadow-md' 
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                      }`}
                      id={`theme-btn-${t.style}`}
                    >
                      <div>
                        {/* Sample visuals */}
                        <div className="flex gap-2 mb-3">
                          <span className={`w-6 h-6 rounded-full border border-gray-300 ${t.primary}`}></span>
                          <span className={`w-6 h-6 rounded-full ${t.accent}`}></span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{t.name}</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t.desc}</p>
                      </div>

                      {theme === t.style && (
                        <div className="bg-emerald-500 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-sm absolute top-3 right-3 flex items-center gap-0.5">
                          <Check size={10} /> ACTIVO
                        </div>
                      )}
                    </button>
                  ))}
                </div>


                {/* Typography Selector Block */}
                <div className="mt-8 border-t theme-border-main pt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-rose-500 rounded-full block"></span>
                      Estilo de Letra / Tipografía Publicitaria
                    </h3>
                    <p className="text-xs text-gray-500">
                      Personaliza las fuentes decorativas de tus títulos y calzados para que coincidan con la vibra de tu marca.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-sans">
                    {[
                      { id: 'sans-ui', name: 'Inter Geometric', font: 'font-sans font-black', desc: 'Limpia, neutra, máxima legibilidad.' },
                      { id: 'serif-elegant', name: 'Playfair Display', font: 'font-serif italic font-bold', desc: 'Editorial elegante, clásica.' },
                      { id: 'grotesk-tech', name: 'Space Grotesk', font: 'font-mono font-bold tracking-tight', desc: 'Moderna, técnica y futurista.' },
                      { id: 'cinzel-luxury', name: 'Cinzel Luxury', font: 'uppercase font-serif tracking-widest font-black', desc: 'Premium, exclusivo, imperial.' },
                      { id: 'unbounded-bold', name: 'Unbounded Bold', font: 'font-sans font-black tracking-tighter', desc: 'Futurista urbano para calzado deportivo.' },
                      { id: 'gothic-black', name: 'Gótica Medieval', font: 'font-serif font-bold', desc: 'Estilo gótico / blackletter, look antiguo y rebelde.' },
                      { id: 'cursive-script', name: 'Cursiva Elegante', font: 'italic font-bold', desc: 'Manuscrita fluida, romántica y prolija.' },
                      { id: 'cursive-vibes', name: 'Caligrafía Fina', font: 'italic', desc: 'Caligrafía fina y sofisticada, tipo invitación.' },
                      { id: 'retro-pacifico', name: 'Retro Pacifico', font: 'italic font-bold', desc: 'Cursiva divertida, estilo retro/surf.' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontStyle(f.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          fontStyle === f.id
                            ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20'
                            : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                        }`}
                        id={`font-btn-${f.id}`}
                      >
                        <div className="text-xs text-gray-400 font-mono">Aa</div>
                        <div className={`text-sm my-1 truncate text-slate-800 dark:text-white ${f.font}`}>
                          {f.name}
                        </div>
                        <div className="text-[10px] text-gray-500 leading-tight">
                          {f.desc}
                        </div>
                        {fontStyle === f.id && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t theme-border-main pt-6 flex justify-end">
                  <button
                    onClick={handleSaveTheme}
                    className="theme-btn-primary px-6 py-3 rounded-lg font-bold text-sm cursor-pointer"
                    id="save-theme-btn"
                  >
                    Guardar Cambios de Estilo y Tipografía
                  </button>
                </div>
              </div>
            )}

            {/* 3. CONFIGURACION TAB */}
            {activeTab === 'config' && (
              <div className="space-y-6" id="view-config">
                <div className="border-b pb-4 theme-border-main">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">🎨 Apariencia del Panel</h2>
                  <p className="text-xs text-gray-500">Elegí el color y el modo de tu panel. Es solo para vos; no cambia tu tienda pública.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {ADMIN_THEMES.map(t => (
                    <button key={t.id} type="button" onClick={() => applyAdminTheme(t.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${adminThemeId === t.id ? 'ring-2 ring-offset-2 ring-[var(--theme-primary)] border-transparent' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400'}`}>
                      <span className="block w-7 h-7 mx-auto rounded-full mb-1.5 border border-black/10" style={{ background: t.accent }}></span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-gray-200">{t.name}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs uppercase font-black text-slate-500 dark:text-gray-300 mb-2">Color de las letras del panel</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {ADMIN_TEXT.map(tc => (
                      <button key={tc.id} type="button" onClick={() => applyAdminTextColor(tc.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${adminTextId === tc.id ? 'ring-2 ring-offset-2 ring-[var(--theme-primary)] border-transparent' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400'}`}>
                        <span className="block w-6 h-6 mx-auto rounded-full mb-1.5 border border-black/20" style={{ background: tc.color || 'linear-gradient(135deg,#ffffff 50%,#111827 50%)' }}></span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-gray-200">{tc.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Si en algún tema las etiquetas se leen poco, elegí un color que contraste (ej: Blanco en fondos oscuros).</p>
                </div>
                <div className="border-b pb-4 theme-border-main">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Datos del Local e Contacto</h2>
                  <p className="text-xs text-gray-500">Esta información se despliega visiblemente al pie de tu tienda pública para visitas y consultas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {/* Store Details Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-black text-slate-500 mb-1">Nombre Comercial de la Zapatería</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-black text-slate-500 mb-1">Teléfono / Contátenos (Whatsapp)</label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-black text-slate-500 mb-1">E-mail de Consultas</label>
                      <input
                        type="email"
                        value={storeEmail}
                        onChange={(e) => setStoreEmail(e.target.value)}
                        className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-black text-slate-500 mb-1">Dirección Física del Local</label>
                      <input
                        type="text"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        placeholder="Ej. Av. Rivadavia 500, Buenos Aires"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-black text-slate-500 mb-1">Coordenadas o Link Google Maps (Opcional)</label>
                      <input
                        type="text"
                        value={storeCoordinates}
                        onChange={(e) => setStoreCoordinates(e.target.value)}
                        className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        placeholder="Ej. https://maps.google.com/?q=-34.60,-58.38"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-black text-slate-500 mb-1">Logo del Local (arriba a la izquierda)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border flex items-center justify-center overflow-hidden shrink-0">
                          {storeLogo ? <img src={storeLogo} alt="logo" className="w-full h-full object-cover" /> : <span className="font-black text-slate-400">{storeName.charAt(0)}</span>}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => { if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0], setStoreLogo); }}
                          className="flex-1 text-xs p-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-gray-300"
                        />
                        {storeLogo && <button type="button" onClick={() => setStoreLogo('')} className="text-xs text-rose-500 font-bold px-2 cursor-pointer">Quitar</button>}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Si no subís, se usa la inicial del nombre del local.</p>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-black text-slate-500 mb-1">Foto de portada / local (fondo del inicio)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 border overflow-hidden shrink-0 flex items-center justify-center">
                          {coverImage ? <img src={coverImage} alt="portada" className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400">Sin foto</span>}
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0], setCoverImage); }} className="flex-1 text-xs p-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-gray-300" />
                        {coverImage && <button type="button" onClick={() => setCoverImage('')} className="text-xs text-rose-500 font-bold px-2 cursor-pointer">Quitar</button>}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Aparece de fondo en el inicio de tu tienda, con un velo oscuro para que se lea el texto.</p>
                    </div>

                    <button
                      onClick={handleSaveConfig}
                      className="theme-btn-primary px-5 py-3 rounded-lg font-bold text-sm cursor-pointer shadow-xs"
                      id="save-config-btn"
                    >
                      Guardar Datos Comerciales
                    </button>
                  </div>

                  {/* Referral and promo sidebar info */}
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-left space-y-4">
                    <h3 className="font-extrabold text-amber-800 dark:text-amber-400 text-sm uppercase tracking-wider">¡Sección de Referidos Premium!</h3>
                    <p className="text-xs text-amber-900/80 dark:text-amber-300">
                      ¿Un colega quiere su propia zapatería web o software de gestión? Compartí tu link de afiliación para recibir un 20% de comisión mensual.
                    </p>

                    <div className="bg-white dark:bg-zinc-800 p-4 border border-amber-200 dark:border-amber-950/50 rounded-xl space-y-3">
                      <span className="text-[11px] font-mono font-bold block text-gray-500 text-center uppercase tracking-widest">
                        ESTADO DE REFERIDO DE {tenant.slug.toUpperCase()}
                      </span>
                      <div className="bg-amber-100/60 dark:bg-zinc-900/50 p-3 rounded-lg text-center text-xs font-mono font-bold text-amber-800 dark:text-amber-300 truncate">
                        {window.location.origin}/?referido={tenant.slug}
                      </div>

                      <div className="text-[11px] text-gray-500">
                        * Leyenda en página pública: <br/>
                        <span className="italic block mt-1 px-2 border-l-2 border-amber-400">
                          "Contactate con dragoprot26@gmail.com para tener tu página para tu negocio, o una breve nota para tu nuevo emprendimiento..."
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white p-4 rounded-xl flex gap-3 items-center">
                      <div className="text-rose-500 bg-slate-800 p-2 rounded-full shrink-0">
                        <HelpCircle size={16} />
                      </div>
                      <div className="text-[10px] leading-relaxed text-slate-300">
                        ¿Preguntas con tu licencia? Contactate en cualquier momento directo a soporte: <strong className="text-white">dragoprot26@gmail.com</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PRODUCTOS TAB */}
            {activeTab === 'productos' && (
              <div className="space-y-6" id="view-productos">
                <div className="border-b pb-4 theme-border-main">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Catálogo de Calzados</h2>
                  <p className="text-xs text-gray-500">Sube fotos, especifica tallas disponibles y crea atributos personalizados para cada modelo.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                  {/* Add form */}
                  <form onSubmit={handleAddProductSubmit} className="space-y-4">
                    <h3 className="text-sm uppercase font-black text-slate-400">Publicar Nuevo Calzado</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nombre del Zapato</label>
                        <input
                          type="text"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          placeholder="Ej. Sneakers Retro Neon"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Precio (ARS)</label>
                        <input
                          type="number"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          placeholder="68000"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tallas Disponibles (Separadas por coma)</label>
                        <input
                          type="text"
                          value={newProdSizes}
                          onChange={(e) => setNewProdSizes(e.target.value)}
                          placeholder="37, 38, 39, 40, 41"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Imagen del Calzado</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(e.target.files[0], setNewProdImage);
                            }
                          }}
                          className="w-full text-xs p-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] text-gray-600 dark:text-gray-300"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Sube desde tu móvil o PC. Si no subes, se usará una plantilla de calzado.</p>
                      </div>
                    </div>

                    {/* Pre-uploaded preview thumbnail if any */}
                    {newProdImage && (
                      <div className="flex gap-2 items-center p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border">
                        <span className="text-xs font-bold text-gray-500">Previsualización de Imagen:</span>
                        <img src={newProdImage} alt="thumbnail" className="w-12 h-12 rounded-lg object-contain bg-white p-1 border" />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Detalle / Descripción</label>
                      <textarea
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        placeholder="Escribe características de las zapatillas..."
                        className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] h-20"
                      />
                    </div>

                    {/* Checkbox Last Available */}
                    <div className="flex items-center gap-3 bg-red-50/50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                      <input
                        type="checkbox"
                        id="last-available-chk"
                        checked={newProdLast}
                        onChange={(e) => setNewProdLast(e.target.checked)}
                        className="w-4.5 h-4.5 text-rose-600 border-gray-300 rounded focus:ring-rose-500 cursor-pointer"
                      />
                      <label htmlFor="last-available-chk" className="text-xs font-bold text-slate-800 dark:text-gray-200 cursor-pointer select-none">
                        ⚠️ ÚLTIMO DISPONIBLE (Talla única / Liquidación express)
                      </label>
                    </div>

                    {/* Dynamic Extra Attributes Builder */}
                    <div className="border border-slate-200 p-4 rounded-xl space-y-3 bg-slate-50 dark:bg-zinc-800/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 dark:text-gray-300">Campos Adicionales Detallados</span>
                        <span className="text-[10px] text-gray-400">Suela, Origen, Materiales, etc.</span>
                      </div>

                      {newProdCustomFields.length > 0 && (
                        <div className="space-y-1.5 pb-2 border-b">
                          {newProdCustomFields.map((f, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-white dark:bg-zinc-800 p-2 rounded-lg border">
                              <span className="font-bold text-gray-600 dark:text-gray-300">{f.label}: <span className="text-gray-800 dark:text-white font-normal">{f.value}</span></span>
                              <button
                                type="button"
                                onClick={() => removeCustomField(i)}
                                className="text-red-500 hover:text-red-700"
                                id={`del-field-btn-${i}`}
                              >
                                <Trash size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempLabel}
                          onChange={(e) => setTempLabel(e.target.value)}
                          placeholder="Etiqueta (Ej. Color)"
                          className="flex-1 text-xs p-2.5 border border-gray-200 bg-white dark:bg-zinc-800 rounded-lg"
                        />
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          placeholder="Valor (Ej. Rojo)"
                          className="flex-1 text-xs p-2.5 border border-gray-200 bg-white dark:bg-zinc-800 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={addCustomField}
                          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center cursor-pointer"
                          id="add-custom-field-btn"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full theme-btn-primary p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 cursor-pointer"
                      id="publish-shoe-submit-btn"
                    >
                      <Footprints size={16} /> {editingProdId ? 'Guardar Cambios' : 'Publicar Calzado en Tienda'}
                    </button>
                  </form>

                  {/* Existing Products List block */}
                  <div className="space-y-4">
                    <h3 className="text-sm uppercase font-black text-slate-400">Tus Calzados Publicados</h3>

                    {products.filter(p => p.tenantId === tenant.slug).length === 0 ? (
                      <div className="p-8 text-center text-gray-400 bg-slate-50 dark:bg-zinc-800/40 border rounded-2xl">
                        Aún no tienes zapatillas publicadas. ¡Publica tu primer modelo al costado!
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="admin-shoes-list">
                        {products.filter(p => p.tenantId === tenant.slug).map(p => (
                          <div key={p.id} className="p-4 bg-white dark:bg-zinc-800 rounded-xl border flex gap-3 justify-between items-center text-left">
                            <div className="flex gap-3 items-center min-w-0">
                              <div className="w-12 h-12 p-1 border bg-slate-50 rounded-lg shrink-0 flex items-center justify-center">
                                <img src={p.image} referrerPolicy="no-referrer" alt="" className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm truncate theme-text-main">{p.name}</h4>
                                <p className="text-[11px] text-gray-400">Precio: <strong className="text-rose-500">${p.price.toLocaleString('es-AR')}</strong> | Tallas: {p.sizes.join(', ')}</p>
                                {p.isLastAvailable && (
                                  <span className="text-[9px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">
                                    ¡Último Disponible!
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditProduct(p)}
                              className="px-2.5 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-gray-400 hover:text-amber-600 rounded-lg transition-colors border text-sm"
                              id={`edit-shoe-btn-${p.id}`}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('¿Estás seguro de que quieres eliminar este calzado del catálogo?')) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border"
                              id={`delete-shoe-btn-${p.id}`}
                            >
                              <Trash size={15} />
                            </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'novedades' && (
              <div className="space-y-6" id="view-novedades">
                <div className="border-b pb-4 theme-border-main">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">✨ Últimas Novedades</h2>
                  <p className="text-xs text-gray-500">Aparecen en una sección propia “Últimas Novedades” de tu tienda, separada del catálogo normal.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                  <form onSubmit={handleAddNovedadSubmit} className="space-y-4">
                    <h3 className="text-sm uppercase font-black text-slate-400">{editingNovId ? 'Editar Novedad' : 'Agregar Novedad'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nombre</label>
                        <input type="text" value={novName} onChange={(e) => setNovName(e.target.value)} placeholder="Ej. Edición Limitada 2026" className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Precio (ARS)</label>
                        <input type="number" value={novPrice} onChange={(e) => setNovPrice(e.target.value)} className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tallas (separadas por coma)</label>
                        <input type="text" value={novSizes} onChange={(e) => setNovSizes(e.target.value)} placeholder="38, 39, 40" className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Imagen</label>
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0], setNovImage); }} className="w-full text-xs p-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                    {novImage && (
                      <div className="flex gap-2 items-center p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border">
                        <span className="text-xs font-bold text-gray-500">Imagen:</span>
                        <img src={novImage} alt="thumb" className="w-12 h-12 rounded-lg object-contain bg-white p-1 border" />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Descripción</label>
                      <textarea value={novDesc} onChange={(e) => setNovDesc(e.target.value)} className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg h-20" />
                    </div>
                    <button type="submit" className="w-full theme-btn-primary p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 cursor-pointer">
                      ✨ {editingNovId ? 'Guardar Cambios' : 'Agregar a Novedades'}
                    </button>
                  </form>
                  <div className="space-y-4">
                    <h3 className="text-sm uppercase font-black text-slate-400">Tus Novedades</h3>
                    {products.filter(p => p.tenantId === tenant.slug && p.isNovedad).length === 0 ? (
                      <div className="p-8 text-center text-gray-400 bg-slate-50 dark:bg-zinc-800/40 border rounded-2xl">Todavía no tenés novedades.</div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {products.filter(p => p.tenantId === tenant.slug && p.isNovedad).map(p => (
                          <div key={p.id} className="p-4 bg-white dark:bg-zinc-800 rounded-xl border flex gap-3 justify-between items-center">
                            <div className="flex gap-3 items-center min-w-0">
                              <div className="w-12 h-12 p-1 border bg-slate-50 rounded-lg shrink-0 flex items-center justify-center">
                                <img src={p.image} referrerPolicy="no-referrer" alt="" className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm truncate theme-text-main">{p.name}</h4>
                                <p className="text-[11px] text-gray-400">${p.price.toLocaleString('es-AR')} | {p.sizes.join(', ')}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => startEditNovedad(p)} className="px-2.5 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-gray-400 hover:text-amber-600 rounded-lg border text-sm" title="Editar">✏️</button>
                              <button onClick={() => { if (confirm('¿Eliminar esta novedad?')) onDeleteProduct(p.id); }} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg border"><Trash size={15} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. PROMOCIONES TAB */}
            {activeTab === 'promociones' && (
              <div className="space-y-6" id="view-promociones">
                <div className="border-b pb-4 theme-border-main">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Campañas Promocionales</h2>
                  <p className="text-xs text-gray-500">Publica ofertas exclusivas de temporada con precio especial tachado.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                  {/* Promo Form */}
                  <form onSubmit={handleAddPromotionSubmit} className="space-y-4">
                    <h3 className="text-sm uppercase font-black text-slate-400">Crear Oferta Especial</h3>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Nombre de la Oferta</label>
                      <input
                        type="text"
                        value={newPromoName}
                        onChange={(e) => setNewPromoName(e.target.value)}
                        placeholder="Ej. Liquidación Zapatillas de Primavera"
                        className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Precio Original (ARS)</label>
                        <input
                          type="number"
                          value={newPromoOrigPrice}
                          onChange={(e) => setNewPromoOrigPrice(e.target.value)}
                          placeholder="95000"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Precio con Oferta (ARS)</label>
                        <input
                          type="number"
                          value={newPromoPrice}
                          onChange={(e) => setNewPromoPrice(e.target.value)}
                          placeholder="59000"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tallas Promocionadas</label>
                        <input
                          type="text"
                          value={newPromoSizes}
                          onChange={(e) => setNewPromoSizes(e.target.value)}
                          placeholder="38, 39, 40"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Leyenda del Globo / Banner</label>
                        <input
                          type="text"
                          value={newPromoBadge}
                          onChange={(e) => setNewPromoBadge(e.target.value)}
                          placeholder="30% OFF / LIQUIDACIÓN"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <label className="block text-xs font-bold text-gray-500">Foto del Calzado de Oferta</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(e.target.files[0], setNewPromoImage);
                          }
                        }}
                        className="w-full text-xs p-2 bg-gray-50 dark:bg-zinc-800 border text-gray-400"
                      />
                    </div>

                    {newPromoImage && (
                      <div className="flex gap-2 items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-400">Previsualización:</span>
                        <img src={newPromoImage} alt="" className="w-10 h-10 object-contain rounded-lg bg-white border" />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Detalle del Descuento</label>
                      <textarea
                        value={newPromoDesc}
                        onChange={(e) => setNewPromoDesc(e.target.value)}
                        placeholder="Por liquidación de stock total limitado..."
                        className="w-full text-sm p-3 border border-gray-200 bg-white dark:bg-zinc-800 rounded-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      id="publish-promo-submit-btn"
                    >
                      <Tag size={16} /> {editingPromoId ? 'Guardar Cambios' : 'Publicar Oferta Promocional'}
                    </button>
                  </form>

                  {/* Existing Promos */}
                  <div className="space-y-4">
                    <h3 className="text-sm uppercase font-black text-slate-400">Ofertas Activas</h3>

                    {promotions.filter(p => p.tenantId === tenant.slug).length === 0 ? (
                      <div className="p-8 text-center text-gray-400 bg-slate-50 dark:bg-zinc-800/40 border rounded-2xl">
                        No hay promociones publicadas. ¡Publica tu primera campaña promocional al costado!
                      </div>
                    ) : (
                      <div className="space-y-3" id="admin-promos-list">
                        {promotions.filter(p => p.tenantId === tenant.slug).map(p => (
                          <div key={p.id} className="p-4 bg-white dark:bg-zinc-800 rounded-xl border flex gap-3 justify-between items-center text-left">
                            <div className="flex gap-3 items-center min-w-0">
                              <div className="w-12 h-12 p-1 border bg-slate-50 rounded-lg shrink-0 flex items-center justify-center">
                                <img src={p.image} referrerPolicy="no-referrer" alt="" className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm truncate theme-text-main">{p.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 line-through">${p.originalPrice.toLocaleString('es-AR')}</span>
                                  <span className="text-sm text-red-600 font-extrabold">${p.offerPrice.toLocaleString('es-AR')}</span>
                                  <span className="text-[10px] bg-red-100 dark:bg-red-950 font-bold text-red-800 dark:text-red-200 px-1.5 py-0.25 rounded text-center block">
                                    {p.badgeText}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditPromo(p)}
                              className="px-2.5 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-gray-400 hover:text-amber-600 rounded-lg transition-colors border text-sm"
                              id={`edit-promo-btn-${p.id}`}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('¿Quieres eliminar esta promoción?')) {
                                  onDeletePromotion(p.id);
                                }
                              }}
                              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border"
                              id={`delete-promo-btn-${p.id}`}
                            >
                              <Trash size={15} />
                            </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6. ENCARGOS (ORDERS) TAB */}
            {activeTab === 'encargos' && (
              <div className="space-y-6" id="view-encargos">
                <div className="border-b pb-4 theme-border-main flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Control de Encargos</h2>
                    <p className="text-xs text-gray-500">Valida los códigos que presentan los clientes en el local físico.</p>
                  </div>
                </div>

                {/* Orders list view */}
                {orders.filter(o => o.tenantId === tenant.slug).length === 0 ? (
                  <div className="p-12 text-center text-gray-400 bg-slate-50 dark:bg-zinc-800/40 border rounded-2xl">
                    No has recibido ningún encargo de calzado todavía. ¡Comparte tu link con los clientes para empezar!
                  </div>
                ) : (
                  <div className="space-y-4" id="admin-orders-list">
                    {orders.filter(o => o.tenantId === tenant.slug).map(order => (
                      <div
                        key={order.id}
                        className={`p-5 rounded-2xl border transition-all text-left ${
                          order.status === 'pendiente' 
                            ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30' 
                            : order.status === 'concretado'
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
                            : 'bg-gray-100/50 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-800 opacity-65'
                        }`}
                        id={`order-card-${order.id}`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 rounded-lg">
                              CÓDIGO: {order.code}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                              order.status === 'pendiente' 
                                ? 'bg-amber-100 text-amber-800' 
                                : order.status === 'concretado'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-400">
                            F. Creación: {new Date(order.createdAt).toLocaleString('es-AR')}
                          </div>
                        </div>

                        {/* Customer & Items list details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Datos del Cliente</span>
                            <div className="font-bold text-sm text-slate-800 dark:text-gray-100">{order.customerName}</div>
                            <div className="text-xs text-slate-500 font-mono">Llamar Cel: {order.customerPhone}</div>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Detalles del Calzado</span>
                            <div className="space-y-1">
                              {order.items.map((item, id) => (
                                <div key={id} className="text-xs text-slate-700 dark:text-gray-300 flex justify-between">
                                  <span>• <strong className="font-extrabold text-slate-800 dark:text-white">{item.name}</strong> (Talla: {item.size}) x{item.quantity}</span>
                                  <span className="font-extrabold font-mono text-slate-800 dark:text-gray-100">${item.price.toLocaleString('es-AR')}</span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t pt-1.5 mt-1 text-right text-xs font-black text-rose-500">
                              Monto Total a Cobrar: ${order.total.toLocaleString('es-AR')} ARS
                            </div>
                          </div>
                        </div>

                        {/* Action Gates buttons */}
                        {order.status === 'pendiente' && (
                          <div className="flex justify-end gap-2 mt-4 border-t pt-3 border-dashed">
                            <button
                              onClick={() => {
                                if (confirm('¿Confirmas que el cliente retiró y pagó el pedido en el local?')) {
                                  onUpdateOrderStatus(order.id, 'concretado', 'admin');
                                }
                              }}
                              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              id={`btn-concretar-${order.id}`}
                            >
                              <Check size={14} /> Concretado
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('¿Seguro que deseas cancelar este pedido? Se perderá la reserva.')) {
                                  onUpdateOrderStatus(order.id, 'cancelado', 'admin');
                                }
                              }}
                              className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              id={`btn-cancelar-${order.id}`}
                            >
                              <Trash size={14} /> Cancelar Pedido
                            </button>
                          </div>
                        )}

                        {order.status === 'concretado' && (
                          <div className="text-[10.5px] text-right italic text-emerald-600 dark:text-emerald-400 mt-2">
                            ✓ Entregado en tienda por: {order.handledBy || 'Admin'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. COLABORADOR TAB */}
            {activeTab === 'colaborador' && (
              <div className="space-y-6" id="view-colaborador">
                <div className="border-b pb-4 theme-border-main">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Asignar Colaboradores</h2>
                  <p className="text-xs text-gray-500">Asigna cuentas con credenciales de vendedor para que registren entregas y tengan su propio dashboard.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                  {/* Signup collaborator Form */}
                  <form onSubmit={handleAddColabSubmit} className="space-y-4">
                    <h3 className="text-sm uppercase font-black text-slate-400">Asignar Nuevo Vendedor</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nombre Completo del Colaborador</label>
                        <input
                          type="text"
                          value={newColabName}
                          onChange={(e) => setNewColabName(e.target.value)}
                          placeholder="Ej. Bruno Gómez"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Celular del Colaborador</label>
                        <input
                          type="tel"
                          value={newColabPhone}
                          onChange={(e) => setNewColabPhone(e.target.value)}
                          placeholder="Ej. 1155998822"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Usuario de Acceso (Minúsculas)</label>
                        <input
                          type="text"
                          value={newColabUser}
                          onChange={(e) => setNewColabUser(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          placeholder="ej. bruno"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Contraseña de Acceso</label>
                        <input
                          type="password"
                          value={newColabPass}
                          onChange={(e) => setNewColabPass(e.target.value)}
                          placeholder="bruno123"
                          className="w-full text-sm p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Foto o Avatar (Opcional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(e.target.files[0], setNewColabAvatar);
                          }
                        }}
                        className="w-full text-xs p-2.5 bg-gray-50 dark:bg-zinc-800 border text-gray-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98"
                      id="save-colab-submit-btn"
                    >
                      <UserPlus size={16} /> Registrar Colaborador
                    </button>
                  </form>

                  {/* Configured colabs list */}
                  <div className="space-y-4">
                    <h3 className="text-sm uppercase font-black text-slate-400">Personal Autorizado</h3>

                    {collaborators.filter(c => c.tenantId === tenant.slug).length === 0 ? (
                      <div className="p-8 text-center text-gray-400 bg-slate-50 dark:bg-zinc-800/40 border rounded-2xl">
                        Ningún colaborador registrado. Registra tu personal al costado.
                      </div>
                    ) : (
                      <div className="space-y-3" id="admin-colabs-list">
                        {collaborators.filter(c => c.tenantId === tenant.slug).map(c => {
                          const colabSuccesses = orders.filter(o => o.tenantId === tenant.slug && o.handledBy === c.id && o.status === 'concretado').length;
                          return (
                            <div key={c.id} className="p-4 bg-white dark:bg-zinc-800 rounded-xl border flex gap-3 justify-between items-center text-left">
                              <div className="flex gap-3 items-center min-w-0">
                                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-emerald-500" />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm truncate text-slate-800 dark:text-gray-100">{c.name}</h4>
                                  <p className="text-[10px] text-gray-400">Usuario: <strong className="text-gray-700 dark:text-gray-200">{c.username}</strong> | Cel: {c.phone || 'N/A'}</p>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5 inline-block">
                                    {colabSuccesses} entregas registradas en tienda
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (confirm(`¿Quieres eliminar la cuenta del colaborador ${c.name}?`)) {
                                    onDeleteCollaborator(c.id);
                                  }
                                }}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border"
                                id={`delete-colab-btn-${c.id}`}
                              >
                                <Trash size={15} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
