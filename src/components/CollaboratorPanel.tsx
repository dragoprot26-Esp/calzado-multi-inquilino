/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  BarChart3, Camera, Settings, FileClock, Check, LogOut, Trash, Phone, User, Bell, Palette, Download, Printer
} from 'lucide-react';
import { Collaborator, Order, TenantConfig } from '../types';

interface CollaboratorPanelProps {
  collaborator: Collaborator;
  tenant: TenantConfig;
  onUpdateCollaborator: (updated: Collaborator) => void;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: 'concretado' | 'cancelado', adminOrColabId: string) => void;
  onLogout: () => void;
}

const PANEL_THEMES: { id: string; name: string; mode: 'dark' | 'light'; accent: string; bg: string }[] = [
  { id: 'oscuro',  name: '🌑 Oscuro',  mode: 'dark',  accent: '#FF4F00', bg: '' },
  { id: 'crema',   name: '🍦 Crema',   mode: 'light', accent: '#B8860B', bg: '#F7EFE0' },
  { id: 'claro',   name: '⚪ Claro',   mode: 'light', accent: '#0f172a', bg: '#eef2f7' },
  { id: 'azul',    name: '🔵 Azul',    mode: 'dark',  accent: '#3b82f6', bg: '#0b1326' },
  { id: 'verde',   name: '🟢 Verde',   mode: 'dark',  accent: '#22c55e', bg: '#0a1611' },
  { id: 'bordo',   name: '🍷 Bordó',   mode: 'dark',  accent: '#f43f5e', bg: '#1a0c12' },
  { id: 'violeta', name: '🟣 Violeta', mode: 'dark',  accent: '#a78bfa', bg: '#140c20' },
];
const PANEL_TEXT: { id: string; name: string; color: string }[] = [
  { id: 'auto',   name: 'Auto',       color: '' },
  { id: 'blanco', name: 'Blanco',     color: '#ffffff' },
  { id: 'crema',  name: 'Crema',      color: '#f4e9d2' },
  { id: 'claro',  name: 'Gris claro', color: '#cbd5e1' },
  { id: 'dorado', name: 'Dorado',     color: '#e9c46a' },
  { id: 'oscuro', name: 'Oscuro',     color: '#0f172a' },
];

export default function CollaboratorPanel({
  collaborator,
  tenant,
  onUpdateCollaborator,
  orders,
  onUpdateOrderStatus,
  onLogout,
}: CollaboratorPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'perfil' | 'pedidos' | 'apariencia'>('dashboard');
  const [panelThemeId, setPanelThemeId] = useState<string>(() => { try { return localStorage.getItem('calz_admin_theme') || 'oscuro'; } catch (e) { return 'oscuro'; } });
  const [panelTextId, setPanelTextId] = useState<string>(() => { try { return localStorage.getItem('calz_admin_text') || 'auto'; } catch (e) { return 'auto'; } });
  const [dashTimeframe, setDashTimeframe] = useState<'diario' | 'semanal' | 'mensual'>('diario');
  const applyPanelTheme = (id: string) => {
    const t = PANEL_THEMES.find(x => x.id === id) || PANEL_THEMES[0];
    setPanelThemeId(t.id);
    try { localStorage.setItem('calz_admin_theme', t.id); } catch (e) {}
    const root = document.documentElement;
    if (t.mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    root.style.setProperty('--theme-primary', t.accent);
  };
  const applyPanelText = (id: string) => { setPanelTextId(id); try { localStorage.setItem('calz_admin_text', id); } catch (e) {} };
  useEffect(() => {
    applyPanelTheme(panelThemeId);
    return () => { document.documentElement.style.removeProperty('--theme-primary'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local state for Colab Profile
  const [name, setName] = useState(collaborator.name);
  const [phone, setPhone] = useState(collaborator.phone);
  const [avatar, setAvatar] = useState(collaborator.avatar);

  // Handle avatar image reader
  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    onUpdateCollaborator({
      ...collaborator,
      name,
      phone,
      avatar,
    });
    alert('¡Tu perfil de colaborador ha sido actualizado con éxito!');
  };

  // Staff calculations
  const colabOrders = orders.filter(o => o.tenantId === tenant.slug && o.handledBy === collaborator.id);
  const colabRevenue = colabOrders
    .filter(o => o.status === 'concretado')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.tenantId === tenant.slug && o.status === 'pendiente');

  const _enPeriodo = (iso: string) => {
    const d = new Date(iso); const now = new Date();
    if (dashTimeframe === 'diario') return d.toDateString() === now.toDateString();
    if (dashTimeframe === 'semanal') { const wk = new Date(now); wk.setDate(now.getDate() - 7); return d >= wk; }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const periodOrders = colabOrders.filter(o => _enPeriodo(o.createdAt));
  const periodRevenue = periodOrders.filter(o => o.status === 'concretado').reduce((a, o) => a + o.total, 0);

  const downloadColabCSV = () => {
    let csv = '\uFEFF';
    csv += 'Codigo,Fecha,Cliente,Telefono,Total,Estado\n';
    periodOrders.forEach(o => {
      const fecha = new Date(o.createdAt).toLocaleDateString('es-AR');
      const cli = (o.customerName || '').replace(/"/g, '""');
      const est = o.status === 'concretado' ? 'Concretado' : (o.status === 'cancelado' ? 'Cancelado' : 'Pendiente');
      csv += `"${o.code}","${fecha}","${cli}","${o.customerPhone}",${o.total},"${est}"\n`;
    });
    csv += `\n"Total ${dashTimeframe}:","","","",${periodRevenue},""\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Mis_Ventas_${name}_${dashTimeframe}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const printColabPDF = () => {
    const periodLabel = dashTimeframe === 'diario' ? 'del día' : dashTimeframe === 'semanal' ? 'de la semana' : 'del mes';
    const rows = periodOrders.map(o => `<tr><td>${o.code}</td><td>${new Date(o.createdAt).toLocaleDateString('es-AR')}</td><td>${(o.customerName || '').replace(/</g, '&lt;')}</td><td>${o.customerPhone}</td><td>$${o.total.toLocaleString('es-AR')}</td><td>${o.status}</td></tr>`).join('');
    const w = window.open('', '_blank');
    if (!w) { alert('Permití las ventanas emergentes para descargar el PDF.'); return; }
    w.document.write(`<html><head><title>Mis Ventas ${dashTimeframe}</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#111}h1{font-size:20px;margin:0}p{color:#555;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:14px;font-size:12px}th,td{border:1px solid #ddd;padding:7px;text-align:left}th{background:#f3f4f6}.tot{margin-top:16px;font-size:15px;font-weight:bold}</style></head><body><h1>Reporte de Ventas ${periodLabel}</h1><p>Vendedor: <b>${name}</b> — ${tenant.storeName}<br>Generado: ${new Date().toLocaleString('es-AR')}</p><table><thead><tr><th>Código</th><th>Fecha</th><th>Cliente</th><th>Teléfono</th><th>Total</th><th>Estado</th></tr></thead><tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#999">Sin ventas en el período</td></tr>'}</tbody></table><div class="tot">Total facturado ${periodLabel}: $${periodRevenue.toLocaleString('es-AR')} ARS</div><script>window.onload=function(){window.print();}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div id="cms-colab-root" className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex flex-col text-left" style={(() => { const _t = PANEL_THEMES.find(x => x.id === panelThemeId); return _t && _t.bg ? { background: _t.bg } : undefined; })()}>
      {(() => {
        const _tc = PANEL_TEXT.find(x => x.id === panelTextId);
        const _base = `#cms-colab-root input, #cms-colab-root textarea, #cms-colab-root select { color: #0f172a; } .dark #cms-colab-root input, .dark #cms-colab-root textarea, .dark #cms-colab-root select { color: #f1f5f9; }`;
        const _ov = (_tc && _tc.color) ? `#cms-colab-root label, #cms-colab-root .text-slate-700, #cms-colab-root .text-slate-600, #cms-colab-root .text-slate-500, #cms-colab-root .text-slate-400, #cms-colab-root .text-gray-700, #cms-colab-root .text-gray-600, #cms-colab-root .text-gray-500, #cms-colab-root .text-gray-400, #cms-colab-root input, #cms-colab-root textarea, #cms-colab-root select { color: ${_tc.color} !important; }` : '';
        return <style>{_base + _ov}</style>;
      })()}
      {/* Collaborator Navbar */}
      <header className="bg-slate-900 border-b border-zinc-800 text-white p-5 sticky top-0 z-40 shadow-sm flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-amber-400" />
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase">Portal de Colaborador</h1>
            <p className="text-xs text-amber-400 font-bold">{name} | {tenant.storeName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('pedidos')}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-zinc-700 text-white transition-colors cursor-pointer"
          title="Encargos"
          id="colab-bell-btn"
        >
          <Bell size={16} />
          {pendingOrders.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">{pendingOrders.length}</span>
          )}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          id="colab-logout-btn"
        >
          <LogOut size={13} /> Cerrar Sesión
        </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto md:p-6 lg:p-8 gap-6">
        {/* Navigation Tab rail */}
        <aside className="w-full md:w-56 shrink-0 space-y-2 px-4 md:px-0">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 space-y-1 shadow-xs">
            <span className="block text-[10px] uppercase font-black text-gray-400 px-3 py-1 tracking-wider">
              Mi Panel Colaborador
            </span>
            {[
              { id: 'dashboard', name: 'Mis Ventas Hoy', icon: <BarChart3 size={16} /> },
              { id: 'pedidos', name: 'Entregar Pedidos', icon: <FileClock size={16} /> },
              { id: 'perfil', name: 'Mi Foto / Perfil', icon: <Settings size={16} /> },
              { id: 'apariencia', name: 'Apariencia', icon: <Palette size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
                id={`colab-tab-btn-${tab.id}`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/40 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300 text-left">
            <span>Para consultas de caja o comisiones del local, contactar al administrador principal: <strong>{tenant.storePhone}</strong>.</span>
          </div>
        </aside>

        {/* Content detail space */}
        <main className="flex-1 min-w-0 px-4 md:px-0 pb-16">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs p-6 lg:p-8">
            {/* Tab 1: Dashboard Vendedor */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6" id="colab-dashboard">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Mi Resumen de Entregas</h2>
                  <p className="text-xs text-gray-400">Estadísticas específicas de productos entregados por tu cuenta de vendedor.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/35 p-5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-300 block uppercase">Mi Facturación Concretada</span>
                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-200 mt-1">
                      ${colabRevenue.toLocaleString('es-AR')} ARS
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/35 p-5 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-300 block uppercase">Mis Entregas Totales</span>
                    <div className="text-3xl font-black text-amber-700 dark:text-amber-200 mt-1">
                      {colabOrders.filter(o => o.status === 'concretado').length} Pares
                    </div>
                  </div>
                </div>

                {/* Descargar mis ventas */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-5 rounded-xl border border-gray-200 space-y-3">
                  <h3 className="text-sm font-bold theme-text-main">📥 Descargar mis ventas</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={dashTimeframe} onChange={(e) => setDashTimeframe(e.target.value as any)} className="text-xs p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                      <option value="diario">Hoy (diario)</option>
                      <option value="semanal">Últimos 7 días (semanal)</option>
                      <option value="mensual">Este mes (mensual)</option>
                    </select>
                    <button onClick={downloadColabCSV} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2.5 rounded-lg flex items-center gap-1 cursor-pointer"><Download size={13} /> Planilla (.CSV)</button>
                    <button onClick={printColabPDF} className="text-xs bg-slate-900 dark:bg-zinc-700 hover:bg-slate-800 text-white font-bold px-3 py-2.5 rounded-lg flex items-center gap-1 cursor-pointer"><Printer size={13} /> Informe (PDF)</button>
                  </div>
                  <p className="text-[10px] text-gray-400">Exporta tus ventas concretadas del período elegido. El PDF se descarga desde la ventana de impresión (Guardar como PDF).</p>
                </div>

                {/* Performance progress metrics */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-5 rounded-xl border border-gray-200 text-left space-y-4">
                  <h3 className="text-sm font-bold theme-text-main">Historial de Clientes Atendidos</h3>
                  {colabOrders.length === 0 ? (
                    <p className="text-xs text-gray-400">Aún no registraste retiros. ¡Presenta atención a la sección de entregas!</p>
                  ) : (
                    <div className="space-y-2">
                      {colabOrders.map((o) => (
                        <div key={o.id} className="text-xs p-2.5 bg-white dark:bg-zinc-950 rounded-lg flex justify-between items-center border">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white">{o.customerName}</span> (Cel: {o.customerPhone})
                          </div>
                          <span className="font-mono font-bold text-emerald-600">${o.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Entregar Pedidos screen */}
            {activeTab === 'pedidos' && (
              <div className="space-y-6" id="colab-pedidos">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Encargos Pendientes de Calzado</h2>
                  <p className="text-xs text-gray-400">Verifica los códigos que muestre el cliente y haz clic en Concretado al entregar su calzado.</p>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl">
                    ¡Buen trabajo! No hay pedidos pendientes de retiros en la tienda actualmente.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map(order => (
                      <div key={order.id} className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4 text-left">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded-md">
                              {order.code}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{order.customerName}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Zapatos: {order.items.map(i => `${i.name} (Talla: ${i.size}) x${i.quantity}`).join(', ')}
                          </p>
                          <div className="text-xs font-bold text-rose-500">
                            Total a cobrar: ${order.total.toLocaleString('es-AR')} ARS
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              if (confirm('¿Confirmas que entregaste el calzado y cobraste el monto?')) {
                                onUpdateOrderStatus(order.id, 'concretado', collaborator.id);
                              }
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                            id={`colab-concretar-btn-${order.id}`}
                          >
                            <Check size={14} /> Entregado / Cobrado
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Perfil config */}
            {activeTab === 'perfil' && (
              <div className="space-y-6" id="colab-perfil">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Mi Cuenta de Vendedor</h2>
                  <p className="text-xs text-gray-400">Actualiza tu foto personal avatar, nombre y teléfono de contacto local.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Nombre Completo</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full text-sm p-3 pl-9 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          required
                        />
                        <User className="absolute left-3 top-3.5 text-gray-400" size={15} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Teléfono Móvil</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-sm p-3 pl-9 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                        <Phone className="absolute left-3 top-3.5 text-gray-400" size={15} />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer shadow-xs transition-all"
                      id="colab-save-profile-btn"
                    >
                      Guardar Mis Datos
                    </button>
                  </div>

                  {/* Photo selector */}
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border text-center space-y-4">
                    <div className="relative group">
                      <img src={avatar} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-offset-2 ring-amber-400" />
                      <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera size={20} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleAvatarUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">Cambiar Foto de Vendedora</h4>
                      <p className="text-[10px] text-gray-400 px-4">Sube una foto clara desde tu PC o tu smartphone para presentarte ante los clientes de la tienda.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'apariencia' && (
              <div className="space-y-6" id="colab-apariencia">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">🎨 Apariencia del Panel</h2>
                  <p className="text-xs text-gray-400">Elegí el color y el modo de tu panel. Es solo para vos.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {PANEL_THEMES.map(t => (
                    <button key={t.id} type="button" onClick={() => applyPanelTheme(t.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${panelThemeId === t.id ? 'ring-2 ring-offset-2 ring-[var(--theme-primary)] border-transparent' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400'}`}>
                      <span className="block w-7 h-7 mx-auto rounded-full mb-1.5 border border-black/10" style={{ background: t.accent }}></span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-gray-200">{t.name}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs uppercase font-black text-slate-500 dark:text-gray-300 mb-2">Color de las letras del panel</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {PANEL_TEXT.map(tc => (
                      <button key={tc.id} type="button" onClick={() => applyPanelText(tc.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${panelTextId === tc.id ? 'ring-2 ring-offset-2 ring-[var(--theme-primary)] border-transparent' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400'}`}>
                        <span className="block w-6 h-6 mx-auto rounded-full mb-1.5 border border-black/20" style={{ background: tc.color || 'linear-gradient(135deg,#ffffff 50%,#111827 50%)' }}></span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-gray-200">{tc.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Si las etiquetas se leen poco, elegí un color que contraste.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
