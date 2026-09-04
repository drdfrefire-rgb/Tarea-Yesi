import React from 'react';
import {
  Atom,
  PlusCircle,
  History,
  Printer,
  Share2,
  Menu,
  X,
  BookOpen,
  ArrowRightLeft,
  Download,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onNewProblem: () => void;
  onOpenHistory: () => void;
  onPrint: () => void;
  onOpenConverter: () => void;
  onOpenExport: () => void;
  historyCount: number;
  activeTab: 'integral' | 'diagram' | 'derivation' | 'simulation' | 'tutor';
  setActiveTab: (tab: 'integral' | 'diagram' | 'derivation' | 'simulation' | 'tutor') => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewProblem,
  onOpenHistory,
  onPrint,
  onOpenConverter,
  onOpenExport,
  historyCount,
  activeTab,
  setActiveTab,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <nav className="h-14 bg-indigo-900 text-white flex items-center justify-between px-2 sm:px-6 shrink-0 shadow-md z-30 sticky top-0">
      {/* Brand & Sidebar toggle */}
      <div className="flex items-center gap-1 sm:gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Alternar panel de ejercicios"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 text-indigo-200 hover:text-white hover:bg-indigo-800/80 rounded-xl lg:hidden transition-colors active:scale-90 shrink-0"
            title="Alternar panel de ejercicios"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-md border border-cyan-400/40 shrink-0">
            <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-cyan-200 animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-900 border border-cyan-400/60 rounded-full flex items-center justify-center text-[9px] font-mono font-black text-cyan-300">
              JL
            </span>
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm sm:text-base text-white truncate">
                JEAN LAB
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                PRO
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] text-indigo-300 font-medium tracking-wide">
              Laboratorio & Solucionador de Física
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation (matches theme) */}
      <div className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('integral')}
          className={`transition-all ${
            activeTab === 'integral'
              ? 'border-b-2 border-white pb-1 text-white font-semibold'
              : 'text-indigo-200 hover:text-white opacity-80 hover:opacity-100 pb-1'
          }`}
        >
          Solucionador Integral
        </button>
        <button
          onClick={() => setActiveTab('diagram')}
          className={`transition-all ${
            activeTab === 'diagram'
              ? 'border-b-2 border-white pb-1 text-white font-semibold'
              : 'text-indigo-200 hover:text-white opacity-80 hover:opacity-100 pb-1'
          }`}
        >
          Esquema de Fuerzas
        </button>
        <button
          onClick={() => setActiveTab('derivation')}
          className={`transition-all ${
            activeTab === 'derivation'
              ? 'border-b-2 border-white pb-1 text-white font-semibold'
              : 'text-indigo-200 hover:text-white opacity-80 hover:opacity-100 pb-1'
          }`}
        >
          Derivación Matemática
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`transition-all flex items-center gap-1 ${
            activeTab === 'simulation'
              ? 'border-b-2 border-white pb-1 text-white font-semibold'
              : 'text-indigo-200 hover:text-white opacity-80 hover:opacity-100 pb-1'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Simulación</span>
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`transition-all ${
            activeTab === 'tutor'
              ? 'border-b-2 border-white pb-1 text-white font-semibold'
              : 'text-indigo-200 hover:text-white opacity-80 hover:opacity-100 pb-1'
          }`}
        >
          Tutor Conceptual
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onOpenConverter}
          title="Conversor de Unidades Físicas (SI)"
          className="min-h-[38px] min-w-[38px] sm:min-h-0 sm:min-w-0 p-2 sm:px-2.5 sm:py-1.5 text-xs text-indigo-200 hover:text-white hover:bg-indigo-800/80 rounded-xl transition-colors border border-indigo-700/60 flex items-center justify-center gap-1.5 active:scale-90"
        >
          <ArrowRightLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden lg:inline">Unidades SI</span>
        </button>

        <button
          onClick={onOpenExport}
          title="Exportar LaTeX, Imprimir o Descargar SVG"
          className="min-h-[38px] min-w-[38px] sm:min-h-0 sm:min-w-0 p-2 sm:px-2.5 sm:py-1.5 text-xs text-indigo-200 hover:text-white hover:bg-indigo-800/80 rounded-xl transition-colors border border-indigo-700/60 flex items-center justify-center gap-1.5 active:scale-90"
        >
          <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden lg:inline">Exportar</span>
        </button>

        <button
          onClick={onOpenHistory}
          title="Historial de ejercicios"
          className="min-h-[38px] min-w-[38px] sm:min-h-0 sm:min-w-0 p-2 sm:px-2.5 sm:py-1.5 text-xs text-indigo-200 hover:text-white hover:bg-indigo-800/80 rounded-xl transition-colors border border-indigo-700/60 flex items-center justify-center gap-1.5 active:scale-90 relative"
        >
          <History className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xl:inline">Historial</span>
          {historyCount > 0 && (
            <span className="bg-emerald-400 text-indigo-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full absolute -top-1 -right-1 sm:static shadow-xs">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={onNewProblem}
          className="min-h-[38px] px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 border border-indigo-400/40 active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-indigo-100" />
          <span className="hidden sm:inline">Nuevo Ejercicio</span>
          <span className="sm:hidden text-[11px] font-bold">Nuevo</span>
        </button>

        {/* User avatar badge */}
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-700 border-2 border-indigo-400 flex items-center justify-center text-[10px] sm:text-xs font-bold text-indigo-100 shrink-0 select-none shadow-xs"
          title="Sesión de Física Activa (JEAN LAB)"
        >
          JL
        </div>
      </div>
    </nav>
  );
};

