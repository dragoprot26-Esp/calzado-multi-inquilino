/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeStyle } from '../types';

interface ThemeStylesProps {
  theme: ThemeStyle;
  fontStyle?: 'sans-ui' | 'serif-elegant' | 'grotesk-tech' | 'cinzel-luxury' | 'unbounded-bold';
}

export default function ThemeStyles({ theme, fontStyle }: ThemeStylesProps) {
  let styles = '';
  let fontOverrides = '';

  if (fontStyle) {
    switch (fontStyle) {
      case 'sans-ui':
        fontOverrides = `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');
          body, select, button, input, div, p {
            font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
          }
          h1, h2, h3, h4, h5, h6, .theme-serif {
            font-family: 'Inter', system-ui, sans-serif !important;
            font-style: normal !important;
            font-weight: 900 !important;
            letter-spacing: -0.03em !important;
          }
        `;
        break;
      case 'serif-elegant':
        fontOverrides = `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
          h1, h2, h3, h4, .theme-serif {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-style: italic !important;
            font-weight: 700 !important;
          }
        `;
        break;
      case 'grotesk-tech':
        fontOverrides = `
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');
          h1, h2, h3, h4, .theme-serif {
            font-family: 'Space Grotesk', system-ui, sans-serif !important;
            font-style: normal !important;
            font-weight: 700 !important;
            letter-spacing: -0.02em !important;
          }
        `;
        break;
      case 'cinzel-luxury':
        fontOverrides = `
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
          h1, h2, h3, h4, .theme-serif {
            font-family: 'Cinzel', Times, serif !important;
            font-style: normal !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
          }
        `;
        break;
      case 'unbounded-bold':
        fontOverrides = `
          @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&display=swap');
          h1, h2, h3, h4, .theme-serif {
            font-family: 'Unbounded', sans-serif !important;
            font-style: normal !important;
            font-weight: 950 !important;
            letter-spacing: -0.04em !important;
          }
        `;
        break;
    }
  }

  switch (theme) {
    case 'modern-dark':
      styles = `
        :root {
          --theme-bg: #09090b;
          --theme-card: #18181b;
          --theme-border: #27272a;
          --theme-text: #fafafa;
          --theme-text-muted: #a1a1aa;
          --theme-primary: #f43f5e; /* Rose */
          --theme-primary-hover: #e11d48;
          --theme-badge: #ffe4e6;
          --theme-badge-text: #9f1239;
        }
      `;
      break;
    case 'sophisticated-dark':
      styles = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Space+Grotesk:wght@300..700&display=swap');
        
        :root {
          --theme-bg: #0a0a0a;
          --theme-card: rgba(255, 255, 255, 0.03);
          --theme-border: rgba(255, 255, 255, 0.1);
          --theme-text: #ffffff;
          --theme-text-muted: #9ca3af;
          --theme-primary: #FF4F00; /* Vivid bright orange-red */
          --theme-primary-hover: #e04400;
          --theme-badge: rgba(255, 79, 0, 0.15);
          --theme-badge-text: #FF4F00;
        }

        /* Sophisticated Dark Typography Overrides */
        h1, h2, h3, .theme-serif {
          font-family: 'Playfair Display', Georgia, serif !important;
          font-style: italic !important;
        }

        /* Input overrides for sleek dark appearance */
        input, select, textarea {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #FF4F00 !important;
          outline: none !important;
        }

        /* Soft card overrides for products grid and promos */
        #products-grid > div,
        #promotions-grid > div {
          background-color: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          border-radius: 0px !important; /* Sharp, industrial corners */
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        #products-grid > div:hover,
        #promotions-grid > div:hover {
          background-color: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          transform: translateY(-2px) !important;
        }

        /* Image parent background */
        #products-grid > div > div:first-child,
        #promotions-grid > div > div:first-child {
          background-color: #121212 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 0px !important;
        }

        /* Buttons styling in catalog */
        #products-grid button,
        #promotions-grid button {
          border-radius: 0px !important;
          text-transform: uppercase !important;
          font-weight: bold !important;
          letter-spacing: 0.05em !important;
        }

        /* Primary buttons in sophisticated mode is sharp */
        .theme-btn-primary {
          border-radius: 0px !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
      `;
      break;
    case 'minimal-light':
      styles = `
        :root {
          --theme-bg: #f9fafb;
          --theme-card: #ffffff;
          --theme-border: #e5e7eb;
          --theme-text: #111827;
          --theme-text-muted: #4b5563;
          --theme-primary: #111827; /* Near Black */
          --theme-primary-hover: #374151;
          --theme-badge: #f3f4f6;
          --theme-badge-text: #1f2937;
        }
      `;
      break;
    case 'coral-peach':
      styles = `
        :root {
          --theme-bg: #fdfaf8;
          --theme-card: #ffffff;
          --theme-border: #f5e6e0;
          --theme-text: #431407;
          --theme-text-muted: #9a3412;
          --theme-primary: #f97316; /* Coral Orange */
          --theme-primary-hover: #ea580c;
          --theme-badge: #ffedd5;
          --theme-badge-text: #ea580c;
        }
      `;
      break;
    case 'emerald-garden':
      styles = `
        :root {
          --theme-bg: #f4fbf7;
          --theme-card: #ffffff;
          --theme-border: #d1fae5;
          --theme-text: #064e3b;
          --theme-text-muted: #047857;
          --theme-primary: #10b981; /* Emerald Green */
          --theme-primary-hover: #059669;
          --theme-badge: #d1fae5;
          --theme-badge-text: #065f46;
        }
      `;
      break;
    case 'royal-blue':
      styles = `
        :root {
          --theme-bg: #f0f4ff;
          --theme-card: #ffffff;
          --theme-border: #dbeafe;
          --theme-text: #1e3a8a;
          --theme-text-muted: #2563eb;
          --theme-primary: #3b82f6; /* Classic Blue */
          --theme-primary-hover: #1d4ed8;
          --theme-badge: #dbeafe;
          --theme-badge-text: #1e40af;
        }
      `;
      break;
    case 'golden-vintage':
      styles = `
        :root {
          --theme-bg: #fdfdf6;
          --theme-card: #ffffff;
          --theme-border: #fef08a;
          --theme-text: #451a03;
          --theme-text-muted: #854d0e;
          --theme-primary: #ca8a04; /* Gold/Bronze */
          --theme-primary-hover: #a16207;
          --theme-badge: #fef9c3;
          --theme-badge-text: #854d0e;
        }
      `;
      break;
  }

  return (
    <style>{`
      ${styles}
      ${fontOverrides}
      
      .theme-btn-primary {
        background-color: var(--theme-primary);
        color: white;
        transition: background-color 0.2s;
      }
      .theme-btn-primary:hover {
        background-color: var(--theme-primary-hover);
      }
      .theme-text-main {
        color: var(--theme-text);
      }
      .theme-text-secondary {
        color: var(--theme-text-muted);
      }
      .theme-bg-page {
        background-color: var(--theme-bg);
      }
      .theme-card-bg {
        background-color: var(--theme-card);
        border: 1px solid var(--theme-border);
      }
      .theme-border-main {
        border-color: var(--theme-border);
      }
    `}</style>
  );
}
