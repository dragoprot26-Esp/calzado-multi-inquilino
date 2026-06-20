/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { QrCode, Copy, Check, Share2, Smartphone, Printer, X, Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  storeName: string;
  storeSlug: string;
}

export default function QRCodeGenerator({ storeName, storeSlug }: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const rawUrl = `${window.location.origin}${window.location.pathname}?tenant=${storeSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm space-y-6 text-center max-w-sm mx-auto" id={`qr-card-${storeSlug}`}>
      <div className="space-y-1">
        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <QrCode className="text-[var(--theme-primary)]" size={20} />
          Tu Código QR Comercial
        </h3>
        <p className="text-xs text-gray-500">Compartí este código en tu local para que tus clientes encarguen online.</p>
      </div>

      {/* Vector QR Code */}
      <div className="relative inline-block bg-teal-50/50 dark:bg-zinc-800/40 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700">
        <svg
          className="w-48 h-48 mx-auto text-slate-800 dark:text-gray-100"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          {/* QR Code Anchor Boxes */}
          <rect x="5" y="5" width="25" height="25" rx="3" strokeWidth="6" />
          <rect x="12" y="12" width="11" height="11" fill="currentColor" />

          <rect x="70" y="5" width="25" height="25" rx="3" strokeWidth="6" />
          <rect x="77" y="12" width="11" height="11" fill="currentColor" />

          <rect x="5" y="70" width="25" height="25" rx="3" strokeWidth="6" />
          <rect x="12" y="77" width="11" height="11" fill="currentColor" />

          {/* Dummy QR Noise Dots */}
          <rect x="40" y="10" width="8" height="8" rx="1" fill="currentColor" />
          <rect x="55" y="15" width="6" height="12" rx="1" fill="currentColor" />
          <rect x="45" y="30" width="10" height="6" rx="1" fill="currentColor" />
          
          <rect x="5" y="45" width="12" height="6" rx="1" fill="currentColor" />
          <rect x="25" y="40" width="8" height="12" rx="1" fill="currentColor" />

          <rect x="40" y="45" width="20" height="8" rx="1" fill="currentColor" />
          <rect x="70" y="40" width="10" height="10" rx="1" fill="currentColor" />
          <rect x="85" y="45" width="8" height="15" rx="1" fill="currentColor" />

          <rect x="45" y="60" width="12" height="10" rx="1" fill="currentColor" />
          <rect x="40" y="75" width="18" height="8" rx="1" fill="currentColor" />
          <rect x="45" y="88" width="8" height="8" rx="1" fill="currentColor" />

          <rect x="70" y="70" width="8" height="8" fill="currentColor" />
          <rect x="85" y="75" width="10" height="12" fill="currentColor" />

          {/* Little boot/shoe icon inside the center of QR */}
          <path
            d="M45 53 Q50 51 55 49 L58 54 Q55 56 48 56 Z"
            fill="var(--theme-primary)"
            stroke="var(--theme-primary)"
            strokeWidth="1"
          />
        </svg>

        {/* Small badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--theme-primary)] text-white text-[9px] uppercase font-black px-3 py-1 rounded-full shadow-md tracking-wider">
          {storeSlug}
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-xl flex items-center justify-between text-xs text-left">
          <span className="truncate text-gray-500 font-mono select-all shrink max-w-[200px]" title={rawUrl}>
            {rawUrl}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-lg text-gray-700 dark:text-gray-200 transition-colors cursor-pointer ml-2"
            id={`copy-qr-link-${storeSlug}`}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            id={`copy-qr-direct-${storeSlug}`}
          >
            <Smartphone size={14} />
            {copied ? '¡Copiado!' : 'Copiar Enlace'}
          </button>
          <a
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
            className="border theme-border-main hover:bg-gray-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-gray-300 font-bold text-xs px-3 rounded-xl transition-all flex items-center justify-center"
          >
            <Share2 size={14} />
          </a>
        </div>

        <button
          onClick={() => setShowPrintModal(true)}
          className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
          id={`print-qr-btn-${storeSlug}`}
        >
          <Printer size={14} />
          Imprimir Póster / Guardar PDF
        </button>
      </div>

      {/* GORGEOUS PRINTABLE MODAL OVERLAY */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
          <div className="bg-slate-100 dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full space-y-6 relative border dark:border-zinc-800 text-left">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-gray-700 dark:text-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h4 className="font-extrabold text-lg text-slate-800 dark:text-white">Establecer Póster para Local</h4>
              <p className="text-xs text-gray-500">
                A continuación se muestra el flyer oficial de tu local. Haz clic en el botón de abajo para imprimirlo físicamente o guardarlo como un archivo PDF oficial.
              </p>
            </div>

            {/* Print Area Preview */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-inner flex flex-col items-center text-center text-slate-900 space-y-6 max-w-sm mx-auto" id="printable-flyer-area">
              <div className="text-slate-800 space-y-1">
                <div className="text-rose-600 font-extrabold text-[11px] uppercase tracking-wider">¡BIENVENIDOS A NUESTRO LOCAL!</div>
                <h2 className="text-3xl font-black tracking-tight">{storeName}</h2>
                <div className="w-12 h-1 bg-rose-600 mx-auto rounded-full my-2"></div>
              </div>

              <p className="text-xs font-semibold text-gray-600 max-w-[280px]">
                Escanea el código con tu celular para ver calzados disponibles, promociones exclusivas y enviar tu pedido en segundos.
              </p>

              {/* Huge QR Code vector */}
              <div className="bg-slate-100 p-6 rounded-3xl border-2 border-slate-200 inline-block">
                <svg
                  className="w-48 h-48 mx-auto text-slate-900"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                >
                  <rect x="5" y="5" width="25" height="25" rx="3" strokeWidth="6" />
                  <rect x="12" y="12" width="11" height="11" fill="currentColor" />

                  <rect x="70" y="5" width="25" height="25" rx="3" strokeWidth="6" />
                  <rect x="77" y="12" width="11" height="11" fill="currentColor" />

                  <rect x="5" y="70" width="25" height="25" rx="3" strokeWidth="6" />
                  <rect x="12" y="77" width="11" height="11" fill="currentColor" />

                  <rect x="40" y="10" width="8" height="8" rx="1" fill="currentColor" />
                  <rect x="55" y="15" width="6" height="12" rx="1" fill="currentColor" />
                  <rect x="45" y="30" width="10" height="6" rx="1" fill="currentColor" />
                  
                  <rect x="5" y="45" width="12" height="6" rx="1" fill="currentColor" />
                  <rect x="25" y="40" width="8" height="12" rx="1" fill="currentColor" />

                  <rect x="40" y="45" width="20" height="8" rx="1" fill="currentColor" />
                  <rect x="70" y="40" width="10" height="10" rx="1" fill="currentColor" />
                  <rect x="85" y="45" width="8" height="15" rx="1" fill="currentColor" />

                  <rect x="45" y="60" width="12" height="10" rx="1" fill="currentColor" />
                  <rect x="40" y="75" width="18" height="8" rx="1" fill="currentColor" />
                  <rect x="45" y="88" width="8" height="8" rx="1" fill="currentColor" />

                  <rect x="70" y="70" width="8" height="8" fill="currentColor" />
                  <rect x="85" y="75" width="10" height="12" fill="currentColor" />

                  <path
                    d="M45 53 Q50 51 55 49 L58 54 Q55 56 48 56 Z"
                    fill="#f43f5e"
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-gray-400 font-mono tracking-wider">{rawUrl}</div>
                <div className="text-[9px] uppercase text-gray-500 font-black tracking-widest mt-1">
                  ⚡ INSTANTÁNEO • SIN INSTALAR APPS • PWA READY
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-center text-xs"
              >
                Cerrar Previsualización
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-md"
              >
                <Printer size={15} /> Confirmar Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extra style tag to handle pure print overrides cleanly */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-flyer-area, #printable-flyer-area * {
            visibility: visible !important;
          }
          #printable-flyer-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 3rem !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
