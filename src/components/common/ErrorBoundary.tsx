import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, AlertTriangle, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return { 
      hasError: true, 
      error, 
      errorInfo: null,
      errorId 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SRE Incident Caught]', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: '' });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-brand-bg text-white flex items-center justify-center p-4 sm:p-6 font-body">
          <div className="max-w-lg w-full bg-brand-surface border border-rose-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Incidencia Controlada · SRE Guard
                </span>
                <span className="text-[10px] font-mono text-brand-muted">
                  ID: {this.state.errorId}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                Se ha producido una interrupción técnica
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                El sistema de estabilidad ha aislado el error para proteger la integridad de tus partes de obra y albaranes. Los datos persistidos permanecen seguros.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-rose-300/90 break-all max-h-24 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-zinc-400 font-bold mb-1">
                  <Bug className="w-3.5 h-3.5" />
                  <span>Diagnóstico:</span>
                </div>
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="btn-primary h-12 flex-1 gap-2 text-xs font-bold uppercase tracking-wider justify-center cursor-pointer shadow-lg shadow-brand-accent/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar y Recargar</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="btn-secondary h-12 px-5 gap-2 text-xs font-bold uppercase tracking-wider justify-center cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
