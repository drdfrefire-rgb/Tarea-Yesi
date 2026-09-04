import React, { useState } from 'react';
import { PhysicsSolution } from '../types';
import {
  Download,
  FileCode,
  Printer,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: PhysicsSolution;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, solution }) => {
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen) return null;

  // Generate full LaTeX document code
  const generateLatex = () => {
    const knownsLatex = (solution.knowns || [])
      .map((k) => `\\item $${k.symbol} = ${k.value}$ \\quad (${k.name})`)
      .join('\n');

    const unknownsLatex = (solution.unknowns || [])
      .map((u) => `\\item $${u.symbol}$ \\quad (${u.name}, \\text{en } ${u.targetUnit})`)
      .join('\n');

    const stepsLatex = (solution.derivationSteps || [])
      .map(
        (s) => `\\subsection*{Paso ${s.stepNumber}: ${s.title}}
${s.explanation}
\\begin{equation}
${s.mathLatex}
\\end{equation}
${s.intermediateResult ? `\\noindent\\textit{Resultado intermedio:} $${s.intermediateResult}$\n` : ''}`
      )
      .join('\n\n');

    const answersLatex = (solution.finalAnswers || [])
      .map((a) => `\\textbf{${a.name}:} \\quad $${a.symbol} = ${a.value} \\; \\mathrm{${a.unit}}$`)
      .join('\\\\\n');

    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[spanish]{babel}
\\usepackage{amsmath,amssymb}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\title{\\textbf{PhysicaLab Reporte de Solución}\\\\\\large ${solution.title}}
\\author{Generado por PhysicaLab PRO}
\\date{\\today}

\\begin{document}
\\maketitle

\\section*{Enunciado del Problema}
${solution.problemStatement}

\\section*{1. Datos Conocidos e Incógnitas}
\\begin{itemize}
${knownsLatex}
\\end{itemize}

\\textbf{Incógnitas a determinar:}
\\begin{itemize}
${unknownsLatex}
\\end{itemize}

\\section*{2. Derivación Analítica Paso a Paso}
${stepsLatex}

${solution.symbolicFormula ? `\\section*{Fórmula Analítica General}
\\begin{equation}
${solution.symbolicFormula}
\\end{equation}` : ''}

${solution.numericalSubstitution ? `\\section*{Sustitución Numérica}
\\begin{equation}
${solution.numericalSubstitution}
\\end{equation}` : ''}

\\section*{3. Resultados Finales}
${answersLatex}

\\section*{4. Análisis Físico y Discusión}
${solution.physicalDiscussion || 'Solución verificada dimensional y conceptualmente.'}

\\end{document}`;
  };

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(generateLatex());
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    if (!solution.diagram?.svgCode) return;
    const blob = new Blob([solution.diagram.svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagrama-${solution.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadLatex = () => {
    const blob = new Blob([generateLatex()], { type: 'text/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solucion-${solution.id}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Exportar Solución & Esquema</h3>
              <p className="text-[10px] sm:text-xs text-indigo-200 truncate max-w-xs sm:max-w-sm">
                {solution.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Export Options */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Print / PDF */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                  <Printer className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Imprimir o Guardar PDF</h4>
                <p className="text-[10px] text-slate-500 mb-3">
                  Diseño listo para entrega académica o impresora
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>

            {/* LaTeX Export */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center mb-2">
                  <FileCode className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Código Fuente LaTeX</h4>
                <p className="text-[10px] text-slate-500 mb-3">
                  Documento compilar en Overleaf o TeXShop
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopyLatex}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-95"
                >
                  {copiedLatex ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLatex ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={handleDownloadLatex}
                  className="py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-semibold rounded-lg transition-colors"
                  title="Descargar archivo .tex"
                >
                  .tex
                </button>
              </div>
            </div>

            {/* SVG Diagram Download */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Esquema Vectorial</h4>
                <p className="text-[10px] text-slate-500 mb-3">
                  Descarga el diagrama SVG en resolución infinita
                </p>
              </div>
              <button
                onClick={handleDownloadSVG}
                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Bajar .SVG</span>
              </button>
            </div>
          </div>

          {/* LaTeX preview accordion */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Vista previa del código LaTeX:
              </span>
              <button
                onClick={handleCopyLatex}
                className="text-[10px] text-indigo-600 hover:underline font-semibold"
              >
                {copiedLatex ? '¡Copiado!' : 'Copiar todo'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 text-[10px] p-3 rounded-xl font-mono max-h-36 overflow-y-auto leading-relaxed border border-slate-800 select-all">
              {generateLatex()}
            </pre>
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
