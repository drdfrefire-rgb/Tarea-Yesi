import React from 'react';
import { PhysicsSolution } from '../types';
import { X, Trash2, BookOpen, Clock, Tag, HardDrive, AlertCircle } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  solutions: PhysicsSolution[];
  currentId: string;
  onSelect: (sol: PhysicsSolution) => void;
  onDelete: (id: string) => void;
  onClearAll?: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  solutions,
  currentId,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Historial de Ejercicios ({solutions.length})
              </h3>
              <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                <HardDrive className="w-2.5 h-2.5" />
                Almacenado localmente en tu navegador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar historial"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          {solutions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-slate-300" />
              <span>No tienes ejercicios guardados en caché aún.</span>
            </div>
          ) : (
            solutions.map((sol) => (
              <div
                key={sol.id}
                onClick={() => {
                  onSelect(sol);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  sol.id === currentId
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                    {sol.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(sol.id);
                    }}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                    title="Eliminar de la caché"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                  {sol.problemStatement}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded capitalize">
                    <Tag className="w-2.5 h-2.5" />
                    {sol.category.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(sol.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Clear All */}
        {solutions.length > 0 && onClearAll && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-500">
              Datos preservados entre sesiones
            </span>
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restablecer los ejercicios guardados al conjunto de fábrica?')) {
                  onClearAll();
                }
              }}
              className="text-red-600 hover:text-red-700 font-semibold text-[11px] flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3 h-3" />
              Restablecer caché
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
