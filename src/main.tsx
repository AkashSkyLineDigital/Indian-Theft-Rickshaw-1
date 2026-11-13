import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  private handleResetAndReload = () => {
    try {
      localStorage.removeItem('itr_save_v1');
      localStorage.removeItem('itr_settings_v1');
      localStorage.removeItem('san_verde_settings_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#0B0E14] text-slate-100 p-6">
          <div className="max-w-md w-full bg-[#121722] border border-red-500/50 p-6 shadow-2xl space-y-4">
            <h1 className="font-display text-xl font-bold text-red-400">
              Indian Theft Rickshaw — Recovery
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              An unexpected runtime error interrupted the game ({this.state.error.message}).
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-xs font-bold uppercase cursor-pointer"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold uppercase cursor-pointer"
              >
                Reset Save & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
