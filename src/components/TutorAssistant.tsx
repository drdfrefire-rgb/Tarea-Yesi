import React, { useState, useEffect } from 'react';
import { PhysicsSolution } from '../types';
import { MixedTextWithMath } from './MathView';
import { MessageSquare, Send, Sparkles, Loader2, User, Bot, HelpCircle, Trash2 } from 'lucide-react';

interface TutorAssistantProps {
  solution: PhysicsSolution;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const TutorAssistant: React.FC<TutorAssistantProps> = ({ solution }) => {
  const TUTOR_CACHE_KEY = `physicalab_tutor_chat_${solution.id}`;

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

  // Sync tutor conversation to browser cache whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(TUTOR_CACHE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save tutor chat to cache', e);
    }
  }, [messages, TUTOR_CACHE_KEY]);

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
    } catch (e) {
      // ignore
    }
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
          content:
            'Hubo un problema al procesar tu consulta. Verifica la conexión o intenta reformular tu duda.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-3.5 sm:px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
              Tutor Interactivo de Física
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500">
              Conversación guardada automáticamente en caché
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={handleClearChat}
            className="text-[10px] sm:text-xs text-slate-400 hover:text-red-600 p-1.5 rounded-md flex items-center gap-1 hover:bg-red-50 transition-colors"
            title="Reiniciar chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpiar chat</span>
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="p-3 sm:p-4 space-y-3 max-h-[340px] sm:max-h-[380px] overflow-y-auto text-xs sm:text-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-purple-100 text-purple-700 border border-purple-200'
              }`}
            >
              {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                  : 'bg-slate-100/80 text-slate-800 rounded-tl-xs border border-slate-200/80'
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
      <div className="px-3.5 sm:px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          Sugerencias:
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="shrink-0 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 transition-colors disabled:opacity-50 text-[11px]"
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
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Pregunta sobre la física o matemáticas del problema..."
          disabled={loading}
          className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50 text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || loading}
          aria-label="Enviar pregunta"
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-colors shadow-2xs active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
