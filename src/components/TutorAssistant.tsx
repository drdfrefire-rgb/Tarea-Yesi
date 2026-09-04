import React, { useState, useEffect } from 'react';
import { PhysicsSolution } from '../types';
import { MixedTextWithMath } from './MathView';
import { MessageSquare, Send, Sparkles, Loader2, User, Bot, HelpCircle, Trash2, AlertTriangle, BookOpen, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TutorAssistantProps {
  solution: PhysicsSolution;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ErrorPattern {
  errorType: string;
  description: string;
  impact: string;
  correctiveLesson: string;
}

interface ErrorAnalysisData {
  errorPatterns: ErrorPattern[];
  quickTips: string[];
}

export const TutorAssistant: React.FC<TutorAssistantProps> = ({ solution }) => {
  const TUTOR_CACHE_KEY = `physicalab_tutor_chat_${solution.id}`;
  const ERROR_CACHE_KEY = `physicalab_error_analysis_${solution.id}`;

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'errors'>('chat');

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const cached = localStorage.getItem(TUTOR_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load tutor chat from cache', e);
    }
    return [
      {
        role: 'assistant',
        content: `¡Hola! Soy tu tutor de física para este ejercicio sobre **${solution.title}**. ¿Tienes alguna duda sobre el esquema DCL, las cantidades conocidas/incógnitas o algún paso de la derivación matemática?`,
      },
    ];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  // Error analysis states
  const [errorData, setErrorData] = useState<ErrorAnalysisData | null>(() => {
    try {
      const cached = localStorage.getItem(ERROR_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });
  const [loadingErrors, setLoadingErrors] = useState(false);

  // Sync tutor conversation to browser cache
  useEffect(() => {
    try {
      localStorage.setItem(TUTOR_CACHE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save tutor chat to cache', e);
    }
  }, [messages, TUTOR_CACHE_KEY]);

  // Fetch error analysis if not cached
  useEffect(() => {
    if (!errorData) {
      fetchErrorAnalysis();
    }
  }, [solution.id]);

  const fetchErrorAnalysis = async () => {
    setLoadingErrors(true);
    try {
      const derivationSummary = (solution.derivationSteps || []).map(s => `Paso ${s.stepNumber}: ${s.title} - ${s.mathLatex}`).join('; ');
      const res = await fetch('/api/analyze-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: solution.title,
          problemStatement: solution.problemStatement,
          category: solution.category,
          derivationSummary,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setErrorData(data);
        localStorage.setItem(ERROR_CACHE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Failed to load error analysis', err);
    } finally {
      setLoadingErrors(false);
    }
  };

  const quickQuestions = [
    '¿Por qué se eligió ese sistema de coordenadas?',
    '¿Qué pasaría si la fricción fuera nula?',
    '¿Cómo se verifica el análisis dimensional de la fórmula?',
    'Explícame con más detalle el paso de eliminación algebraica.',
  ];

  const handleClearChat = () => {
    const initialMsg: Message[] = [
      {
        role: 'assistant',
        content: `¡Hola! Soy tu tutor de física para este ejercicio sobre **${solution.title}**. ¿Tienes alguna duda sobre el esquema DCL, las cantidades conocidas/incógnitas o algún paso de la derivación matemática?`,
      },
    ];
    setMessages(initialMsg);
    try {
      localStorage.setItem(TUTOR_CACHE_KEY, JSON.stringify(initialMsg));
    } catch (e) {}
  };

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || loading) return;

    const userMsg: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const knownsText = (solution.knowns || []).map((k) => `${k.name} (${k.symbol}=${k.value})`).join(', ');
      const unknownsText = (solution.unknowns || []).map((u) => `${u.name} (${u.symbol})`).join(', ');
      const summary = `Problema: ${solution.title}. Conocidas: ${knownsText}. Incógnitas: ${unknownsText}. Fórmula: ${solution.symbolicFormula || ''}`;

      const res = await fetch('/api/ask-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: solution.title,
          problemStatement: solution.problemStatement,
          userQuestion: q,
          previousSolutionSummary: summary,
        }),
      });

      if (!res.ok) {
        throw new Error('No se pudo obtener respuesta del tutor.');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Hubo un problema al procesar tu consulta. Verifica la conexión o intenta reformular tu duda.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Header & Sub-Tab Switcher */}
      <div className="px-3 sm:px-5 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Tutor Inteligente y Diagnóstico de Errores
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500">
              Asistencia personalizada y lecciones correctivas para este ejercicio
            </p>
          </div>
        </div>

        {/* Sub-tabs for PC and Mobile */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${
              activeSubTab === 'chat'
                ? 'bg-white text-purple-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat con Tutor</span>
          </button>
          <button
            onClick={() => setActiveSubTab('errors')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${
              activeSubTab === 'errors'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Análisis de Errores</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'chat' ? (
        <>
          {/* Chat Messages */}
          <div className="p-3 sm:p-5 space-y-3.5 max-h-[360px] sm:max-h-[420px] overflow-y-auto text-xs sm:text-sm bg-slate-50/30">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 sm:gap-3 ${
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-2xs ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 shadow-2xs ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80'
                  }`}
                >
                  <div className="leading-relaxed">
                    <MixedTextWithMath text={m.content} />
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 pl-9">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span>El tutor está analizando tu consulta...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 sm:px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Sugerencias:
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 transition-colors disabled:opacity-50 text-xs active:scale-95 shadow-2xs min-h-[36px] flex items-center"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Pregunta sobre la física o matemáticas del problema..."
              disabled={loading}
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50 text-slate-900 placeholder:text-slate-400 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || loading}
              aria-label="Enviar pregunta"
              className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-colors shadow-sm active:scale-95 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      ) : (
        /* Error Analysis & Corrective Lessons Sub-Tab */
        <div className="p-4 sm:p-6 space-y-5 max-h-[420px] sm:max-h-[480px] overflow-y-auto bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Patrones de Errores Frecuentes y Lecciones Correctivas</span>
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Diagnóstico automatizado de los tropiezos más comunes en este tipo de ejercicios de física.
              </p>
            </div>
            <button
              onClick={fetchErrorAnalysis}
              disabled={loadingErrors}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[36px]"
            >
              {loadingErrors ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Actualizar Diagnóstico</span>
            </button>
          </div>

          {loadingErrors && !errorData ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs">Analizando patrones de errores y preparando lecciones breves...</p>
            </div>
          ) : errorData && errorData.errorPatterns ? (
            <div className="space-y-4">
              {errorData.errorPatterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 border border-amber-200/70 shadow-2xs space-y-2.5 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                        {pattern.errorType}
                      </h5>
                    </div>
                    <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-md border border-red-200/60 shrink-0">
                      Impacto Crítico
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    {pattern.description}
                  </p>

                  <div className="pl-8 pt-1">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lección Breve Correctiva:</span>
                    </div>
                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-xs text-slate-800 leading-relaxed">
                      <MixedTextWithMath text={pattern.correctiveLesson} />
                    </div>
                  </div>
                </div>
              ))}

              {errorData.quickTips && errorData.quickTips.length > 0 && (
                <div className="bg-purple-50/70 border border-purple-200/70 rounded-xl p-4 space-y-2">
                  <h6 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Consejos de Oro para Evitar Errores:</span>
                  </h6>
                  <ul className="list-disc list-inside space-y-1 text-xs text-purple-800/90 pl-1">
                    {errorData.quickTips.map((tip, tIdx) => (
                      <li key={tIdx} className="leading-relaxed">
                        <MixedTextWithMath text={tip} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No hay datos de errores disponibles en este momento.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
