import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#home';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-white mb-2">
            {this.props.fallbackTitle || 'Hubo un inconveniente al cargar esta sección'}
          </h2>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            Ocurrió un error inesperado al procesar la vista. Puedes reintentar o regresar a la tienda principal.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
            <button
              onClick={this.handleGoHome}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 active:scale-95 text-xs font-black text-black tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
