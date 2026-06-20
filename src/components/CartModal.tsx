/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, User, Phone, CheckCircle, Ticket } from 'lucide-react';
import { CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onPlaceOrder: (customerName: string, customerPhone: string) => { code: string; success: boolean };
}

export default function CartModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
}: CartModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [checkoutCode, setCheckoutCode] = useState<string | null>(null);

  const total = cart.reduce((sum, item) => {
    const price = item.isPromotion 
      ? (item.product as any).offerPrice 
      : (item.product as any).price;
    return sum + price * item.quantity;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre.');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setError('Por favor, ingresa un número de teléfono válido.');
      return;
    }

    setError('');
    const result = onPlaceOrder(name, phone);
    if (result.success) {
      setCheckoutCode(result.code);
    }
  };

  const handleResetAndClose = () => {
    setCheckoutCode(null);
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={checkoutCode ? handleResetAndClose : onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            id="cart-backdrop"
          />

          {/* Sidedrawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg h-full theme-card-bg shadow-2xl flex flex-col z-10"
            id="cart-drawer"
          >
            {/* Header */}
            <div className="p-6 border-b theme-border-main flex justify-between items-center bg-gray-50/80 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full theme-btn-primary/10 text-[var(--theme-primary)]">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold theme-text-main">Mi Canasto</h2>
                  <p className="text-xs theme-text-secondary">Verifica tus productos</p>
                </div>
              </div>
              <button
                onClick={checkoutCode ? handleResetAndClose : onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                id="close-cart-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {checkoutCode ? (
                /* Success screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6"
                  id="checkout-success-view"
                >
                  <div className="text-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 p-5 rounded-full">
                    <CheckCircle size={56} className="animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      ¡Pedido Recibido!
                    </h3>
                    <p className="text-sm theme-text-secondary px-4">
                      Tu encargo se guardó con éxito. Presentá el siguiente código en el local para retirar tus zapas.
                    </p>
                  </div>

                  {/* Code Card */}
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 p-6 rounded-2xl border-2 border-dashed border-emerald-500 space-y-3 shadow-md">
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                      Código de Retiro
                    </span>
                    <div className="flex items-center justify-center gap-2 text-3xl font-black font-mono text-slate-800 dark:text-white tracking-wider">
                      <Ticket className="text-emerald-500" size={28} />
                      {checkoutCode}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Nombre: <span className="font-semibold text-gray-700 dark:text-gray-200">{name}</span> | Cel: <span className="font-semibold text-gray-700 dark:text-gray-200">{phone}</span>
                    </div>
                  </div>

                  <div className="w-full text-left bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="font-bold">¿Qué sigue?</div>
                    <div>1. El vendedor preparará tu talla en el local.</div>
                    <div>2. Coordinen el pago (efectivo/transferencia) al retirar.</div>
                  </div>

                  <button
                    onClick={handleResetAndClose}
                    className="w-full p-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md active:scale-98"
                    id="finish-order-close-btn"
                  >
                    Entendido, Volver a la Tienda
                  </button>
                </motion.div>
              ) : cart.length === 0 ? (
                /* Empty Cart */
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                  <ShoppingBag size={48} strokeWidth={1} className="text-gray-300 animate-pulse" />
                  <p className="font-medium text-sm">Tu canasto está vacío</p>
                  <p className="text-xs">¡Añade calzados de la catálogo para encargar ahora!</p>
                </div>
              ) : (
                /* Interactive Cart Items */
                <div className="space-y-4" id="cart-items-wrapper">
                  {cart.map((item) => {
                    const price = item.isPromotion
                      ? (item.product as any).offerPrice
                      : (item.product as any).price;
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border theme-border-main items-center text-left"
                      >
                        <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-lg p-1 border theme-border-main flex items-center justify-center shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm theme-text-main truncate">
                            {item.product.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs bg-gray-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                              Talla: <span className="font-bold">{item.selectedSize}</span>
                            </span>
                            {item.isPromotion && (
                              <span className="text-[10px] bg-rose-500 dark:bg-rose-950 font-bold text-white px-2 py-0.5 rounded">
                                Oferta
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm font-black text-rose-500">
                            ${price.toLocaleString('es-AR')} ARS
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="flex items-center border theme-border-main rounded-md bg-white dark:bg-zinc-800">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                              id={`minus-btn-${item.id}`}
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold theme-text-main">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                              id={`plus-btn-${item.id}`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold"
                            id={`remove-btn-${item.id}`}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Checkout Footer block */}
            {!checkoutCode && cart.length > 0 && (
              <div className="p-6 border-t theme-border-main bg-gray-50/90 dark:bg-zinc-950/60 space-y-4">
                {/* Sum Details */}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold theme-text-main">Suma Total:</span>
                  <span className="text-2xl font-black text-rose-500">
                    ${total.toLocaleString('es-AR')} ARS
                  </span>
                </div>

                <div className="border-t theme-border-main my-2" />

                {/* Checkout personal details Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <h3 className="text-sm font-bold theme-text-main flex items-center gap-1.5">
                    <User size={16} /> Datos de Retiro en Local
                  </h3>

                  {error && (
                    <div className="text-xs bg-red-100 text-red-800 p-2.5 rounded-lg font-bold border border-red-200">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                        Tu Nombre Completo
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ej. Martín Pérez"
                          className="w-full text-sm p-3 pl-9 rounded-xl border theme-border-main bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[var(--theme-primary)]"
                          id="checkout-name-input"
                          required
                        />
                        <User className="absolute left-3 top-3.5 text-gray-400" size={15} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                        Celular / Whatsapp
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ej. 1165438765"
                          className="w-full text-sm p-3 pl-9 rounded-xl border theme-border-main bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[var(--theme-primary)]"
                          id="checkout-phone-input"
                          required
                        />
                        <Phone className="absolute left-3 top-3.5 text-gray-400" size={15} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 text-center italic mt-1">
                    * No realizas pagos en línea. Encarga tu pedido y abonalo cuando retires en la tienda física.
                  </p>

                  <button
                    type="submit"
                    className="w-full theme-btn-primary p-4 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 mt-2"
                    id="order-submit-btn"
                  >
                    <ShoppingBag size={18} />
                    ENCARGAR PEDIDO
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
