/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  BarChart3, Camera, Settings, FileClock, Check, LogOut, Trash, Phone, User
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

export default function CollaboratorPanel({
  collaborator,
  tenant,
  onUpdateCollaborator,
  orders,
  onUpdateOrderStatus,
  onLogout,
}: CollaboratorPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'perfil' | 'pedidos'>('dashboard');

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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex flex-col text-left">
      {/* Collaborator Navbar */}
      <header className="bg-slate-900 border-b border-zinc-800 text-white p-5 sticky top-0 z-40 shadow-sm flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-amber-400" />
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase">Portal de Colaborador</h1>
            <p className="text-xs text-amber-400 font-bold">{name} | {tenant.storeName}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          id="colab-logout-btn"
        >
          <LogOut size={13} /> Cerrar Sesión
        </button>
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
          </div>
        </main>
      </div>
    </div>
  );
}
