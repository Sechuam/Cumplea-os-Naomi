import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, Heart, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Never wipe the user's customized surprise settings, only reset transient step progress if necessary
      sessionStorage.clear();
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7FD] text-slate-800 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-purple-200 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 fill-purple-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-purple-950 mb-2">
              ¡Hola Naomi! 💜
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Ha habido un pequeño parpadeo al cargar tu sorpresa. Toca el botón de abajo para empezar:
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/25"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cargar sorpresa ahora</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
