import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Check,
  Sparkles,
  X,
  HardDrive,
} from 'lucide-react';

interface UnitCategory {
  name: string;
  units: { id: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[];
}

const UNIT_CATEGORIES: UnitCategory[] = [
  {
    name: 'Velocidad',
    units: [
      { id: 'ms', label: 'm/s (SI)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kmh', label: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', label: 'mph (millas/h)', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'fts', label: 'ft/s (pies/s)', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    ],
  },
  {
    name: 'Fuerza',
    units: [
      { id: 'n', label: 'N (Newtons - SI)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kn', label: 'kN (kilonewtons)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'lbf', label: 'lbf (libras fuerza)', toBase: (v) => v * 4.44822, fromBase: (v) => v / 4.44822 },
      { id: 'dyn', label: 'dyn (dinas)', toBase: (v) => v * 1e-5, fromBase: (v) => v / 1e-5 },
      { id: 'kgf', label: 'kgf (kilopondios)', toBase: (v) => v * 9.80665, fromBase: (v) => v / 9.80665 },
    ],
  },
  {
    name: 'Energía / Trabajo',
    units: [
      { id: 'j', label: 'J (Joules - SI)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kj', label: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cal', label: 'cal (calorías)', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      { id: 'kcal', label: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      { id: 'ev', label: 'eV (electrón-voltios)', toBase: (v) => v * 1.602176634e-19, fromBase: (v) => v / 1.602176634e-19 },
      { id: 'kwh', label: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
    ],
  },
  {
    name: 'Ángulo',
    units: [
      { id: 'deg', label: 'Grados (°)', toBase: (v) => (v * Math.PI) / 180, fromBase: (v) => (v * 180) / Math.PI },
      { id: 'rad', label: 'Radianes (rad - SI)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'grad', label: 'Gradianes (gon)', toBase: (v) => (v * Math.PI) / 200, fromBase: (v) => (v * 200) / Math.PI },
      { id: 'rev', label: 'Revoluciones (vueltas)', toBase: (v) => v * 2 * Math.PI, fromBase: (v) => v / (2 * Math.PI) },
    ],
  },
  {
    name: 'Presión',
    units: [
      { id: 'pa', label: 'Pa (Pascales - SI)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kpa', label: 'kPa', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'atm', label: 'atm (atmósferas)', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { id: 'bar', label: 'bar', toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      { id: 'mmhg', label: 'mmHg / Torr', toBase: (v) => v * 133.322, fromBase: (v) => v / 133.322 },
      { id: 'psi', label: 'psi (lb/in²)', toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
    ],
  },
  {
    name: 'Masa',
    units: [
      { id: 'kg', label: 'kg (kilogramos - SI)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'g', label: 'g (gramos)', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: 'lb', label: 'lb (libras)', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: 'oz', label: 'oz (onzas)', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: 't', label: 'toneladas (t)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
];

const CONVERTER_CACHE_KEY = 'physicalab_unit_converter_prefs_v1';

export const UnitConverterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCatIdx, setSelectedCatIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(CONVERTER_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.selectedCatIdx === 'number') return parsed.selectedCatIdx;
      }
    } catch (e) {
      // ignore
    }
    return 0;
  });

  const [inputValue, setInputValue] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CONVERTER_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.inputValue) return parsed.inputValue;
      }
    } catch (e) {
      // ignore
    }
    return '100';
  });

  const [sourceUnitIdx, setSourceUnitIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(CONVERTER_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.sourceUnitIdx === 'number') return parsed.sourceUnitIdx;
      }
    } catch (e) {
      // ignore
    }
    return 1;
  });

  const [targetUnitIdx, setTargetUnitIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(CONVERTER_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.targetUnitIdx === 'number') return parsed.targetUnitIdx;
      }
    } catch (e) {
      // ignore
    }
    return 0;
  });

  // Save preferences to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem(
        CONVERTER_CACHE_KEY,
        JSON.stringify({
          selectedCatIdx,
          inputValue,
          sourceUnitIdx,
          targetUnitIdx,
        })
      );
    } catch (e) {
      console.warn('Could not cache unit converter preferences', e);
    }
  }, [selectedCatIdx, inputValue, sourceUnitIdx, targetUnitIdx]);

  if (!isOpen) return null;

  const currentCat = UNIT_CATEGORIES[selectedCatIdx] || UNIT_CATEGORIES[0];
  const num = parseFloat(inputValue) || 0;
  const sourceUnit = currentCat.units[sourceUnitIdx] || currentCat.units[0];
  const targetUnit = currentCat.units[targetUnitIdx] || currentCat.units[1] || currentCat.units[0];

  const baseVal = sourceUnit.toBase(num);
  const convertedVal = targetUnit.fromBase(baseVal);

  const handleSwap = () => {
    const tmp = sourceUnitIdx;
    setSourceUnitIdx(targetUnitIdx);
    setTargetUnitIdx(tmp);
  };

  const handleSelectCategory = (idx: number) => {
    setSelectedCatIdx(idx);
    setSourceUnitIdx(1);
    setTargetUnitIdx(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Conversor de Unidades Físicas (SI)</h3>
              <p className="text-[10px] sm:text-xs text-indigo-200">
                Transformación de magnitudes físicas guardada en caché
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar conversor"
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {UNIT_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => handleSelectCategory(idx)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCatIdx === idx
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Converter Inputs Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center">
            {/* Input Value & Source Unit */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">De:</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full text-sm font-mono font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 bg-white"
              />
              <select
                value={sourceUnitIdx}
                onChange={(e) => setSourceUnitIdx(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
              >
                {currentCat.units.map((u, i) => (
                  <option key={u.id} value={i}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center sm:col-span-1">
              <button
                onClick={handleSwap}
                title="Intercambiar unidades"
                className="p-2.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-colors shadow-2xs active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Target Value & Unit */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">A:</label>
              <div className="w-full text-sm font-mono font-bold p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-950 truncate">
                {isNaN(convertedVal) ? '0' : Number(convertedVal.toPrecision(6))}
              </div>
              <select
                value={targetUnitIdx}
                onChange={(e) => setTargetUnitIdx(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
              >
                {currentCat.units.map((u, i) => (
                  <option key={u.id} value={i}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Equivalences Table */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Equivalencias en {currentCat.name}:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {currentCat.units.map((u) => {
                const eq = u.fromBase(baseVal);
                return (
                  <div key={u.id} className="p-1.5 bg-slate-50 rounded border border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 truncate pr-1">{u.label}</span>
                    <span className="font-mono font-bold text-slate-900 shrink-0">
                      {isNaN(eq) ? '0' : Number(eq.toPrecision(4))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
