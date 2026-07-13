import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Red de seguridad: si algún render falla, mostramos un aviso en vez de
// dejar la pantalla totalmente en blanco.
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error('Error capturado por el ErrorBoundary:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#0b0b0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Ups, algo se cortó</h1>
            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>
              Ocurrió un problema al mostrar la pantalla. Tus datos están guardados. Volvé a intentar recargando la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#ef4444', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer' }}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
