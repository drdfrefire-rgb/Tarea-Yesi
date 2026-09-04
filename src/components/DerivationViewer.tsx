import React, { useState } from 'react';
import { PhysicsSolution } from '../types';
import { MathView, MixedTextWithMath } from './MathView';
import {
  Compass,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  ArrowRight,
  Calculator,
} from 'lucide-react';

interface DerivationViewerProps {
  solution: PhysicsSolution;
  onAskTutor?: () => void;
}

export const DerivationViewer: React.FC<DerivationViewerProps> = ({ solution, onAskTutor }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTheoreticalDetails, setShowTheoreticalDetails] = useState(false);

  const safePrinciples = solution.principles || [];
  const safeAssumptions = solution.assumptions || [];
  const safeSteps = solution.derivationSteps || [];
  const safeAnswers = solution.finalAnswers || [];

  const handleCopyFormulas = () => {
    const textToCopy = `SOLUCIÓN: ${solution.title}\n\nFÓRMULA ANALÍTICA:\n${solution.symbolicFormula || ''}\n\nSUSTITUCIÓN NUMÉRICA:\n${solution.numericalSubstitution || ''}\n\nRESPUESTAS:\n${safeAnswers
      .map((a) => `${a.name} (${a.symbol}) = ${a.value} ${a.unit}`)
      .join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
          <span>Derivación Analítica</span>
        </h3>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowTheoreticalDetails(!showTheoreticalDetails)}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 active:scale-95 whitespace-nowrap"
          >
            {showTheoreticalDetails ? 'Ocultar Marco' : 'Marco Teórico'}
          </button>
          <button
            onClick={handleCopyFormulas}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 active:scale-95 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-medium">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Marco Teórico y Coordenadas (Optional / Collapsible toggle) */}
      {showTheoreticalDetails && (
        <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-3.5 sm:p-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Marco Físico y Coordenadas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-lg p-3 border border-slate-200/80">
              <div className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Principios Rectores</span>
              </div>
              <ul className="space-y-1 text-slate-600">
                {safePrinciples.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <MixedTextWithMath text={p} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-3 border border-slate-200/80">
              <div className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Hipótesis y Contorno</span>
              </div>
              <ul className="space-y-1 text-slate-600">
                {safeAssumptions.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <MixedTextWithMath text={a} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {solution.coordinateSystem && (
            <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
              <span className="font-semibold text-slate-800">Sistema Coordenado: </span>
              <MixedTextWithMath text={solution.coordinateSystem} as="span" />
            </div>
          )}
        </div>
      )}

      {/* 2. Derivación Paso a Paso */}
      <div className="space-y-5 text-slate-700">
        {safeSteps.map((step) => {
          return (
            <div key={step.stepNumber} className="group">
              <h4 className="text-xs font-bold text-indigo-600 uppercase mb-1.5 tracking-wide flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px] font-bold">
                  {step.stepNumber}
                </span>
                <span>{step.title}</span>
              </h4>
              <div className="text-xs sm:text-sm mb-2 text-slate-700 leading-relaxed">
                <MixedTextWithMath text={step.explanation} />
              </div>

              {/* Formula box in style */}
              <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl font-mono text-xs sm:text-sm border border-slate-200/90 mb-2 overflow-x-auto">
                <MathView math={step.mathLatex} block />
              </div>

              {step.intermediateResult && (
                <div className="text-xs text-slate-600 flex items-center flex-wrap gap-1">
                  <span className="font-medium text-slate-500">Resultado intermedio:</span>
                  <span className="font-bold text-indigo-700 font-mono">
                    <MathView math={step.intermediateResult} />
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Fórmulas Simbólicas Generales */}
        {solution.symbolicFormula && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2 tracking-wide">
              Fórmula Analítica General
            </h4>
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl font-mono text-xs sm:text-sm border border-slate-200/90 overflow-x-auto">
              <MathView math={solution.symbolicFormula} block />
            </div>
          </div>
        )}

        {/* Sustitución Numérica con Unidades */}
        {solution.numericalSubstitution && (
          <div>
            <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2 tracking-wide">
              Sustitución Numérica con Unidades
            </h4>
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl font-mono text-xs sm:text-sm border border-slate-200/90 overflow-x-auto">
              <MathView math={solution.numericalSubstitution} block />
            </div>
          </div>
        )}

        {/* Resultados Finales Destacados */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Resultados Finales Verificados
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {safeAnswers.map((ans, idx) => (
              <div
                key={idx}
                className="bg-emerald-50/50 rounded-xl p-3 sm:p-3.5 border border-emerald-200 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-800">{ans.name}</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-emerald-700 shrink-0">
                    {ans.value} {ans.unit}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 overflow-x-auto py-0.5">
                  <MathView math={`${ans.symbol} = ${ans.value} ${ans.unit}`} />
                </div>
                {ans.interpretation && (
                  <p className="text-[11px] text-slate-600 mt-1.5 pt-1.5 border-t border-emerald-200/60 leading-tight">
                    {ans.interpretation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Discusión Física */}
        {solution.physicalDiscussion && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-800">Comprobación y Casos Límite: </span>
            <MixedTextWithMath text={solution.physicalDiscussion} as="span" />
          </div>
        )}

        {/* Action button at bottom */}
        {onAskTutor && (
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onAskTutor}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-all text-sm active:scale-98"
            >
              <span>Consultar o Verificar con el Tutor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

