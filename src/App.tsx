import React, { useState, useEffect } from 'react';
import { PhysicsSolution } from './types';
import { SAMPLE_SOLUTIONS } from './data/sampleProblems';
import { Navbar } from './components/Navbar';
import { DiagramViewer } from './components/DiagramViewer';
import { DerivationViewer } from './components/DerivationViewer';
import { TutorAssistant } from './components/TutorAssistant';
import { ProblemInputForm } from './components/ProblemInputForm';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SimulationPanel } from './components/SimulationPanel';
import { UnitConverterModal } from './components/UnitConverterModal';
import { ExportModal } from './components/ExportModal';
import {
  FileText,
  Eye,
  BookOpen,
  MessageSquare,
  Sparkles,
  Award,
  Layers,
  Share2,
  Check,
  ChevronRight,
  ArrowRight,
  X,
  Sliders,
  ArrowRightLeft,
  Download,
} from 'lucide-react';

const STORAGE_KEY = 'physical_solver_solutions_v2';
const CURRENT_ID_KEY = 'physical_solver_current_id_v2';
const ACTIVE_TAB_KEY = 'physical_solver_active_tab_v2';

export default function App() {
  const [solutions, setSolutions] = useState<PhysicsSolution[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
    return SAMPLE_SOLUTIONS;
  });

  const [currentSolution, setCurrentSolution] = useState<PhysicsSolution>(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_ID_KEY);
      if (savedId) {
        const found = solutions.find((s) => s.id === savedId);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Error reading currentSolution from localStorage', e);
    }
    return solutions[0] || SAMPLE_SOLUTIONS[0];
  });

  const [isSolving, setIsSolving] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState<'integral' | 'diagram' | 'derivation' | 'simulation' | 'tutor'>(() => {
    try {
      const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
      if (savedTab && ['integral', 'diagram', 'derivation', 'simulation', 'tutor'].includes(savedTab)) {
        return savedTab as any;
      }
    } catch (e) {
      // ignore
    }
    return 'integral';
  });
  const [sharedToast, setSharedToast] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync solutions to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solutions));
    } catch (e) {
      console.warn('Error saving solutions to localStorage', e);
    }
  }, [solutions]);

  // Sync current active problem ID to local storage
  useEffect(() => {
    try {
      if (currentSolution?.id) {
        localStorage.setItem(CURRENT_ID_KEY, currentSolution.id);
      }
    } catch (e) {
      console.warn('Error saving currentId to localStorage', e);
    }
  }, [currentSolution]);

  // Sync active tab to local storage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
    } catch (e) {
      console.warn('Error saving activeTab to localStorage', e);
    }
  }, [activeTab]);

  const handleSolveNew = (newSolution: PhysicsSolution) => {
    setSolutions((prev) => [newSolution, ...prev]);
    setCurrentSolution(newSolution);
    setShowInputModal(false);
    setActiveTab('integral');
  };

  const handleSelectSample = (sample: PhysicsSolution) => {
    setCurrentSolution(sample);
    setShowInputModal(false);
    setActiveTab('integral');
  };

  const handleDeleteFromHistory = (id: string) => {
    const updated = solutions.filter((s) => s.id !== id);
    setSolutions(updated);
    if (currentSolution.id === id && updated.length > 0) {
      setCurrentSolution(updated[0]);
    }
  };

  const handleResetAllHistory = () => {
    setSolutions(SAMPLE_SOLUTIONS);
    setCurrentSolution(SAMPLE_SOLUTIONS[0]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_SOLUTIONS));
      localStorage.setItem(CURRENT_ID_KEY, SAMPLE_SOLUTIONS[0].id);
    } catch (e) {
      console.warn('Error resetting localStorage', e);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen sm:h-screen flex flex-col bg-slate-100 text-slate-800 font-sans antialiased overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar
        onNewProblem={() => setShowInputModal(true)}
        onOpenHistory={() => setShowHistory(true)}
        onPrint={handlePrint}
        onOpenConverter={() => setShowConverter(true)}
        onOpenExport={() => setShowExport(true)}
        historyCount={solutions.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Container with Sidebar + Main View */}
      <div className="flex-1 flex relative overflow-hidden sm:min-h-0">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          />
        )}

        {/* Sidebar - Exercise / Category List */}
        <aside
          className={`w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-200 lg:static lg:translate-x-0 ${
            isSidebarOpen
              ? 'fixed inset-y-0 left-0 z-40 translate-x-0 shadow-2xl pt-14 lg:pt-0'
              : 'fixed inset-y-0 left-0 z-40 -translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top Category info */}
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Categoría</h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 capitalize truncate max-w-[180px]">
                {currentSolution.category.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-700 rounded-md"
              aria-label="Cerrar barra lateral"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
            {/* Active Exercise */}
            <div className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 shadow-2xs">
              <p className="text-xs font-bold text-indigo-600 mb-1 tracking-wide">EJERCICIO ACTUAL</p>
              <p className="text-sm leading-tight text-slate-700 font-medium line-clamp-2">
                {currentSolution.title}
              </p>
            </div>

            {/* Other Solutions in List */}
            {solutions
              .filter((s) => s.id !== currentSolution.id)
              .map((sol) => (
                <div
                  key={sol.id}
                  onClick={() => {
                    setCurrentSolution(sol);
                    setIsSidebarOpen(false);
                  }}
                  className="p-3 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                >
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                    {sol.category.replace('_', ' ')}
                  </p>
                  <p className="text-sm leading-tight font-medium text-slate-700 line-clamp-2">
                    {sol.title}
                  </p>
                </div>
              ))}
          </div>

          {/* Module Progress Footer */}
          <div className="p-4 bg-slate-900 text-white text-xs shrink-0">
            <div className="flex items-center justify-between text-slate-300 mb-2">
              <span className="opacity-75">Progreso del Módulo</span>
              <span className="font-semibold text-emerald-400">
                {Math.min(100, Math.round((solutions.length / Math.max(solutions.length, 4)) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((solutions.length / Math.max(solutions.length, 4)) * 100))}%`,
                }}
              />
            </div>
            <p className="mt-2 text-right text-[11px] text-slate-300">
              {solutions.length} de {Math.max(solutions.length, 4)} ejercicios resueltos
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
          {/* Header matching Design HTML */}
          <header className="p-3.5 sm:p-5 bg-white border-b border-slate-200 shadow-xs shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">
                  Nivel {currentSolution.difficulty}
                </span>
                <span className="text-slate-400 text-[11px] sm:text-xs font-mono">
                  ID: PH-{currentSolution.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleShare}
                  aria-label="Compartir"
                  className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors active:scale-95"
                >
                  {sharedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="text-[11px] sm:text-xs">{sharedToast ? 'Copiado' : 'Compartir'}</span>
                </button>
                <button
                  onClick={() => setShowInputModal(true)}
                  aria-label="Resolver otro ejercicio"
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs font-semibold rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Nuevo</span>
                </button>
              </div>
            </div>

            <h1 className="text-sm sm:text-lg md:text-xl font-bold text-slate-800 leading-snug line-clamp-3 sm:line-clamp-none">
              {currentSolution.problemStatement}
            </h1>

            {/* Quick View Switcher Pills */}
            <div className="mt-2.5 pt-2 sm:mt-3 sm:pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] sm:text-xs no-scrollbar py-0.5">
              <button
                onClick={() => setActiveTab('integral')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap active:scale-95 shrink-0 ${
                  activeTab === 'integral'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Solución Integral (2 Col.)</span>
                <span className="sm:hidden">Integral</span>
              </button>
              <button
                onClick={() => setActiveTab('diagram')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap active:scale-95 shrink-0 ${
                  activeTab === 'diagram'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Esquema</span>
              </button>
              <button
                onClick={() => setActiveTab('derivation')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap active:scale-95 shrink-0 ${
                  activeTab === 'derivation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Derivación Matemática</span>
                <span className="sm:hidden">Derivación</span>
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap active:scale-95 shrink-0 ${
                  activeTab === 'simulation'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Simulación</span>
              </button>
              <button
                onClick={() => setActiveTab('tutor')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap active:scale-95 shrink-0 ${
                  activeTab === 'tutor'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Tutor</span>
              </button>
            </div>
          </header>

          {/* Solution Body - Split 2-Column or Single Tab */}
          {activeTab === 'integral' && (
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-px bg-slate-200 overflow-y-auto">
              {/* Left Column: Schema and Quantities */}
              <section className="bg-white p-3.5 sm:p-5 flex flex-col overflow-y-auto">
                <DiagramViewer
                  diagram={currentSolution.diagram}
                  knowns={currentSolution.knowns}
                  unknowns={currentSolution.unknowns}
                  problemStatement={currentSolution.problemStatement}
                />
              </section>

              {/* Right Column: Mathematical Derivation */}
              <section className="bg-white p-3.5 sm:p-5 overflow-y-auto">
                <DerivationViewer
                  solution={currentSolution}
                  onAskTutor={() => setActiveTab('tutor')}
                />
              </section>
            </div>
          )}

          {activeTab === 'diagram' && (
            <div className="flex-1 p-3.5 sm:p-6 bg-white overflow-y-auto max-w-5xl mx-auto w-full">
              <DiagramViewer
                diagram={currentSolution.diagram}
                knowns={currentSolution.knowns}
                unknowns={currentSolution.unknowns}
                problemStatement={currentSolution.problemStatement}
              />
            </div>
          )}

          {activeTab === 'derivation' && (
            <div className="flex-1 p-3.5 sm:p-6 bg-white overflow-y-auto max-w-5xl mx-auto w-full">
              <DerivationViewer
                solution={currentSolution}
                onAskTutor={() => setActiveTab('tutor')}
              />
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="flex-1 p-3.5 sm:p-6 bg-slate-50 overflow-y-auto max-w-5xl mx-auto w-full">
              <SimulationPanel solution={currentSolution} />
            </div>
          )}

          {activeTab === 'tutor' && (
            <div className="flex-1 p-3 sm:p-6 bg-slate-50 overflow-y-auto max-w-4xl mx-auto w-full">
              <TutorAssistant solution={currentSolution} />
            </div>
          )}
        </main>
      </div>

      {/* New Problem Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl bg-white">
            <ProblemInputForm
              onSolve={handleSolveNew}
              onSelectSample={handleSelectSample}
              isSolving={isSolving}
              setIsSolving={setIsSolving}
            />
            <button
              onClick={() => setShowInputModal(false)}
              aria-label="Cerrar modal"
              className="absolute top-3 right-3 text-white/90 hover:text-white bg-black/20 hover:bg-black/35 p-2 rounded-full transition-colors z-20 min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        solutions={solutions}
        currentId={currentSolution.id}
        onSelect={(sol) => {
          setCurrentSolution(sol);
          setActiveTab('integral');
        }}
        onDelete={handleDeleteFromHistory}
        onClearAll={handleResetAllHistory}
      />

      {/* Physical Units SI Converter Modal */}
      <UnitConverterModal
        isOpen={showConverter}
        onClose={() => setShowConverter(false)}
      />

      {/* Export / PDF / LaTeX Modal */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        solution={currentSolution}
      />
    </div>
  );
}

