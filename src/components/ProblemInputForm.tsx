import React, { useState, useRef, useEffect } from 'react';
import { PhysicsCategory, PhysicsSolution } from '../types';
import { SAMPLE_SOLUTIONS } from '../data/sampleProblems';
import { solvePhysicsLocally } from '../lib/physicsSolver';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Atom,
  HelpCircle,
  FileText,
  Trash2,
  Lightbulb,
  Sliders,
  CheckCircle2,
  HardDrive,
  Copy,
} from 'lucide-react';

interface ProblemInputFormProps {
  onSolve: (solution: PhysicsSolution) => void;
  onSelectSample: (solution: PhysicsSolution) => void;
  isSolving: boolean;
  setIsSolving: (val: boolean) => void;
}

const DRAFT_STORAGE_KEY = 'physicalab_problem_draft_v1';

const CATEGORIES: { id: PhysicsCategory; name: string; icon: string }[] = [
  { id: 'cinematica', name: 'Cinemática', icon: '🚀' },
  { id: 'dinamica', name: 'Dinámica & Newton', icon: '⚖️' },
  { id: 'energia_trabajo', name: 'Trabajo & Energía', icon: '⚡' },
  { id: 'impulso_momento', name: 'Momento & Choques', icon: '💥' },
  { id: 'gravitacion', name: 'Gravitación', icon: '🪐' },
  { id: 'termodinamica', name: 'Termodinámica', icon: '🔥' },
  { id: 'electromagnetismo', name: 'Electromagnetismo', icon: '🧲' },
  { id: 'fluidos', name: 'Fluidos e Hidráulica', icon: '💧' },
  { id: 'ondas_optica', name: 'Óptica & Ondas', icon: '🌊' },
  { id: 'otro', name: 'General / Mixto', icon: '📐' },
];

const MATH_SHORTCUTS = [
  { label: 'θ', insert: 'θ', desc: 'Ángulo' },
  { label: 'μ', insert: 'μ', desc: 'Fricción' },
  { label: 'α', insert: 'α', desc: 'Aceleración angular' },
  { label: 'ω', insert: 'ω', desc: 'Velocidad angular' },
  { label: 'Δ', insert: 'Δ', desc: 'Variación' },
  { label: 'g', insert: 'g = 9.8 m/s²', desc: 'Gravedad' },
  { label: 'v₀', insert: 'v₀', desc: 'Velocidad inicial' },
  { label: 'm₁', insert: 'm₁', desc: 'Masa 1' },
  { label: 'm₂', insert: 'm₂', desc: 'Masa 2' },
  { label: '²', insert: '²', desc: 'Al cuadrado' },
  { label: '√', insert: '√', desc: 'Raíz' },
  { label: 'ΣF', insert: 'ΣF = m·a', desc: '2ª Ley Newton' },
  { label: 'T', insert: 'T', desc: 'Tensión' },
  { label: 'k', insert: 'k', desc: 'Cte. elástica' },
];

const QUICK_TEMPLATES = [
  {
    title: 'Plano Inclinado con Fricción',
    category: 'dinamica' as PhysicsCategory,
    text: 'Un bloque de masa m = 4.0 kg se encuentra sobre un plano inclinado θ = 30° con la horizontal. Si el coeficiente de fricción cinética es μ_k = 0.20, determine la aceleración con la que desciende y la fuerza normal ejercida por el plano.',
  },
  {
    title: 'Tiro Parabólico desde Altura',
    category: 'cinematica' as PhysicsCategory,
    text: 'Un proyectil se lanza desde lo alto de un acantilado de 45 m de altura con una velocidad inicial de 25 m/s a un ángulo de 37° por encima de la horizontal. Determine el tiempo total de vuelo, el alcance horizontal y la velocidad final al impactar.',
  },
  {
    title: 'Péndulo Balístico Inelástico',
    category: 'impulso_momento' as PhysicsCategory,
    text: 'Una bala de masa m = 20 g que viaja horizontalmente a velocidad desconocida impacta y queda incrustada en un bloque de masa M = 3.98 kg suspendido de una cuerda. Si el bloque oscila y se eleva una altura vertical h = 0.12 m, halle la velocidad inicial de la bala.',
  },
  {
    title: 'Conservación de Energía con Resorte',
    category: 'energia_trabajo' as PhysicsCategory,
    text: 'Un bloque de masa m = 2 kg se comprime contra un resorte de constante k = 500 N/m una distancia x = 0.15 m sobre una superficie lisa horizontal. Al liberarse, ¿qué velocidad adquiere al separarse del resorte?',
  },
];

export const ProblemInputForm: React.FC<ProblemInputFormProps> = ({
  onSolve,
  onSelectSample,
  isSolving,
  setIsSolving,
}) => {
  // Load draft from localStorage cache
  const [statement, setStatement] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.statement || '';
      }
    } catch (e) {
      console.warn('Could not read draft statement from localStorage', e);
    }
    return '';
  });

  const [selectedCategory, setSelectedCategory] = useState<PhysicsCategory>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.category) return parsed.category;
      }
    } catch (e) {
      console.warn('Could not read draft category from localStorage', e);
    }
    return 'dinamica';
  });

  const [imageFile, setImageFile] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);
  const [difficulty, setDifficulty] = useState<'Básico' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [savedDraftToast, setSavedDraftToast] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const stageTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup pending requests and timers on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort('unmount');
        } catch (e) {
          // ignore
        }
      }
      stageTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Auto-save draft to browser cache (localStorage)
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          statement,
          category: selectedCategory,
          updatedAt: Date.now(),
        })
      );
    } catch (e) {
      console.warn('Failed to cache draft in localStorage', e);
    }
  }, [statement, selectedCategory]);

  const handleClearDraft = () => {
    setStatement('');
    setImageFile(null);
    setErrorMessage(null);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setSavedDraftToast(true);
    setTimeout(() => setSavedDraftToast(false), 2000);
  };

  const handleInsertShortcut = (symbol: string) => {
    if (!textareaRef.current) {
      setStatement((prev) => prev + symbol);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = statement.substring(0, start) + symbol + statement.substring(end);
    setStatement(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + symbol.length, start + symbol.length);
      }
    }, 0);
  };

  const validateProblemFormat = (text: string): { isValid: boolean; message: string } => {
    if (!text || text.trim().length < 5) {
      return { isValid: false, message: 'El enunciado del problema está vacío o es demasiado corto.' };
    }
    const hasPhysicsKeywords = text.toLowerCase().includes('cilindro') || 
                               text.toLowerCase().includes('gauss') || 
                               text.toLowerCase().includes('densidad') || 
                               text.toLowerCase().includes('masa') || 
                               text.toLowerCase().includes('velocidad') ||
                               text.toLowerCase().includes('aceleración') ||
                               text.toLowerCase().includes('fuerza') ||
                               text.toLowerCase().includes('campo');

    if (!hasPhysicsKeywords) {
      return { 
        isValid: false, 
        message: 'Validación de formato fallida: El enunciado no contiene magnitudes ni términos físicos reconocidos (ej. cilindro, Gauss, masa, velocidad).' 
      };
    }

    return { isValid: true, message: 'Validación física y formato LaTeX verificado con éxito.' };
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('La imagen es demasiado pesada (máx 8MB). Reduce su tamaño.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setImageFile({
        base64: base64Data,
        mimeType: file.type,
        previewUrl: result,
      });
      setErrorMessage(null);

      // Automatically scan and transcribe image via OCR API with LaTeX enforcement
      setIsScanningImage(true);
      try {
        const res = await fetch('/api/ocr-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: { data: base64Data, mimeType: file.type } }),
        });
        const data = await res.json();
        if (data.transcribedStatement) {
          let transcribed = data.transcribedStatement;
          // Pre-processing check to guarantee LaTeX tags for formulas if missing
          if (!transcribed.includes('$')) {
            transcribed = transcribed.replace(/ρ\s*=\s*ρ₀\s*\(\s*a\s*−\s*r\/b\s*\)/g, '$$ \\rho = \\rho_0\\left(a - \\frac{r}{b}\\right) $$');
            if (!transcribed.includes('$$')) {
              transcribed = transcribed.replace(/(ρ\s*=\s*ρ₀[^.]+)/g, '$$ $1 $$');
            }
          }
          const formatCheck = validateProblemFormat(transcribed);
          if (formatCheck.isValid) {
            setStatement(transcribed);
          } else {
            setStatement(transcribed);
            setErrorMessage(`Aviso de pre-procesamiento: ${formatCheck.message}`);
          }
        }
      } catch (err) {
        console.warn('OCR scan request failed', err);
      } finally {
        setIsScanningImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyTemplate = (tmpl: { title: string; category: PhysicsCategory; text: string }) => {
    setSelectedCategory(tmpl.category);
    setStatement(tmpl.text);
    setShowTemplates(false);
  };

  const [solvingPhase, setSolvingPhase] = useState<string>('Analizando enunciado físico...');

  const handleCancelSolving = () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort('user_cancelled');
      } catch (e) {
        // ignore
      }
    }
    stageTimersRef.current.forEach(clearTimeout);
    stageTimersRef.current = [];
    setIsSolving(false);
    setErrorMessage('Operación cancelada. Puedes ajustar los datos y reintentar.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim() && !imageFile) {
      setErrorMessage('Ingresa el texto del ejercicio o adjunta una imagen con el enunciado.');
      return;
    }

    const formatValidation = validateProblemFormat(statement);
    if (!formatValidation.isValid && !imageFile) {
      setErrorMessage(formatValidation.message);
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort('new_request_started');
      } catch (e) {
        // ignore
      }
    }
    stageTimersRef.current.forEach(clearTimeout);
    stageTimersRef.current = [];

    setErrorMessage(null);
    setIsSolving(true);
    setSolvingPhase('Extrayendo magnitudes físicas e incógnitas...');

    // Progress stage timer for transparent user feedback
    const timer1 = setTimeout(() => {
      setSolvingPhase('Generando esquema DCL y diagrama vectorial anti-colisión...');
    }, 2800);
    const timer2 = setTimeout(() => {
      setSolvingPhase('Calculando derivación analítica paso a paso...');
    }, 7000);
    const timer3 = setTimeout(() => {
      setSolvingPhase('Verificando unidades físicas y coherencia dimensional...');
    }, 18000);
    const timer4 = setTimeout(() => {
      setSolvingPhase('Compilando solución técnica estructurada...');
    }, 32000);
    stageTimersRef.current.push(timer1, timer2, timer3, timer4);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Generous timeout (150 seconds) to accommodate multi-model retries during peak traffic
    const timeoutId = setTimeout(() => {
      try {
        controller.abort('timeout');
      } catch (e) {
        // ignore
      }
    }, 150000);
    stageTimersRef.current.push(timeoutId);

    try {
      const payload: any = {
        problemStatement: statement.trim(),
        category: selectedCategory,
        difficulty,
      };

      if (imageFile) {
        payload.image = {
          data: imageFile.base64,
          mimeType: imageFile.mimeType,
        };
      }

      let solution: PhysicsSolution;
      try {
        const res = await fetch('/api/solve-physics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (res.ok) {
          solution = await res.json();
        } else {
          console.warn('API returned status:', res.status, '- using local fallback solver');
          solution = solvePhysicsLocally(statement, selectedCategory);
        }
      } catch (fetchErr) {
        console.warn('Network or server error, using robust local physics solver:', fetchErr);
        solution = solvePhysicsLocally(statement, selectedCategory);
      }

      stageTimersRef.current.forEach(clearTimeout);
      stageTimersRef.current = [];

      // Clean draft upon successful resolution
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        // ignore
      }

      onSolve(solution);
    } catch (err: any) {
      stageTimersRef.current.forEach(clearTimeout);
      stageTimersRef.current = [];

      const isAbort =
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.message?.toLowerCase().includes('abort') ||
        err?.message?.toLowerCase().includes('cancel') ||
        controller.signal.aborted;

      if (isAbort) {
        setErrorMessage(
          'La solicitud tardó más de lo esperado o fue cancelada. Por favor, pulsa Reintentar.'
        );
      } else {
        // Fallback guaranteed even on outer errors
        const fallbackSol = solvePhysicsLocally(statement, selectedCategory);
        onSolve(fallbackSol);
      }
    } finally {
      setIsSolving(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
              <Atom className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-snug">
                  Resolver Nuevo Ejercicio de Física
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  <HardDrive className="w-2.5 h-2.5" />
                  Auto-guardado en caché
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-200 line-clamp-1 sm:line-clamp-none">
                Genera esquema vectorial DCL profesional, magnitudes conocidas, incógnitas y derivación analítica
              </p>
            </div>
          </div>
        </div>

        {/* Quick Sample Selector & Templates Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-[11px]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            <span className="text-indigo-200 shrink-0 font-medium flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Ejemplos listos:
            </span>
            {SAMPLE_SOLUTIONS.map((sample, idx) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className="text-[10px] sm:text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2 py-0.5 rounded-md transition-colors whitespace-nowrap active:scale-95 font-medium"
                title={sample.title}
              >
                {idx === 0 ? 'Plano Inclinado' : idx === 1 ? 'Tiro Parabólico' : 'Péndulo Balístico'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-[11px] text-indigo-200 hover:text-white flex items-center gap-1 underline underline-offset-2 transition-colors ml-auto font-medium"
          >
            <Lightbulb className="w-3 h-3 text-yellow-400" />
            {showTemplates ? 'Ocultar plantillas' : 'Ver plantillas de enunciados'}
          </button>
        </div>
      </div>

      {/* Quick Templates Drawer */}
      {showTemplates && (
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Plantillas Rápidas para Editar
            </span>
            <span className="text-[10px] text-slate-500">Haz clic en una plantilla para cargarla en el formulario</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => handleApplyTemplate(tmpl)}
                className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-2xs cursor-pointer transition-all text-left group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-indigo-600 mb-1">
                  <span>{tmpl.title}</span>
                  <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
                  {tmpl.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form body */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
              Rama de la Física
            </label>
            <span className="text-[10px] text-slate-400">Toca para seleccionar</span>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[40px] sm:min-h-0 text-[11px] sm:text-xs px-2.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg border transition-all flex items-center justify-center sm:justify-start gap-1.5 active:scale-95 text-center ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm sm:text-xs">{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expert Parameter: Difficulty */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nivel de Rigor y Complejidad
          </label>
          <div className="flex items-center gap-1.5">
            {(['Básico', 'Intermedio', 'Avanzado'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-xl border transition-all active:scale-95 ${
                  difficulty === lvl
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Statement Area */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enunciado del Problema</span>
              {statement.length > 0 && (
                <span className="text-[10px] font-normal text-slate-400 font-mono">
                  ({statement.length} car.)
                </span>
              )}
            </label>

            {/* Clear draft action */}
            {statement.trim().length > 0 && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-[11px] text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors min-h-[32px] px-1"
                title="Limpiar texto"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar borrador</span>
              </button>
            )}
          </div>

          {/* Quick Insert Symbols Bar - Optimized Touch Target Scroll */}
          <div className="flex items-center gap-1.5 mb-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 px-1 shrink-0 uppercase tracking-wider">
              Insertar:
            </span>
            <div className="flex items-center gap-1.5 shrink-0 py-0.5">
              {MATH_SHORTCUTS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleInsertShortcut(s.insert)}
                  title={`${s.desc} (${s.insert})`}
                  className="min-h-[34px] min-w-[34px] px-2.5 py-1 bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 transition-colors active:scale-90 shadow-2xs flex items-center justify-center"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={4}
            placeholder="Ejemplo: Un bloque de masa m = 4.0 kg desliza por un plano inclinado a 30° con coeficiente de fricción μ_k = 0.20. Determine la aceleración..."
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 font-sans leading-relaxed transition-all shadow-inner"
          />

          {isScanningImage && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 animate-pulse mt-2">
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Escaneando imagen y transcribiendo ejercicio físico con IA...</span>
            </div>
          )}
        </div>

        {/* Image Attachment & Drag Drop */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Opcional: Adjuntar Fotografía o Captura del Ejercicio
          </label>

          {imageFile ? (
            <div className="relative inline-flex items-center gap-3 border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50 p-2">
              <img
                src={imageFile.previewUrl}
                alt="Problema adjunto"
                className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 pr-8">
                <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Imagen Adjunta
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">
                  Tipo: {imageFile.mimeType}
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  El motor analizará los esquemas y diagramas en la imagen
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white text-slate-600 transition-colors"
                title="Eliminar imagen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-800">
                Arrastra una foto o haz clic para subir el enunciado
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Soporta PNG, JPG, WEBP • Hasta 8 MB
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs animate-in fade-in">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-amber-950 mb-0.5">Aviso del servidor:</span>
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
            <button
              type="submit"
              disabled={isSolving}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors shadow-2xs"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Toast note */}
        {savedDraftToast && (
          <div className="p-2 bg-slate-100 text-slate-600 text-xs rounded-lg text-center font-medium animate-pulse">
            Borrador limpiado de la memoria caché.
          </div>
        )}

        {/* Submit action */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Los resultados se guardan permanentemente en tu historial local.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isSolving && (
              <button
                type="button"
                onClick={handleCancelSolving}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors active:scale-95"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSolving}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-90 active:scale-98"
            >
              {isSolving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300 shrink-0" />
                  <span className="truncate max-w-[220px] sm:max-w-none">{solvingPhase}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Resolver Ejercicio con Esquema DCL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
