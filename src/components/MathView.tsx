import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math = '', block = false, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!math || typeof math !== 'string') return '';

    // Clean leading/trailing $$ or $
    let cleaned = math.trim();
    if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
      cleaned = cleaned.slice(2, -2).trim();
    } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    try {
      return katex.renderToString(cleaned, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch (e) {
      console.warn('KaTeX render fallback for:', math, e);
      return `<span class="font-mono text-xs text-slate-700 break-words">${math}</span>`;
    }
  }, [math, block]);

  if (!renderedHtml) {
    return null;
  }

  if (block) {
    return (
      <div
        className={`w-full max-w-full overflow-x-auto py-2.5 px-3 my-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center select-text scroll-smooth ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-baseline select-text max-w-full overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

// Component to render text containing mixed inline $...$ or $$...$$ formulas
export const MixedTextWithMath: React.FC<{
  text?: string;
  className?: string;
  as?: 'div' | 'span';
}> = ({ text = '', className = '', as = 'div' }) => {
  const parts = useMemo(() => {
    if (!text || typeof text !== 'string') return [];

    // Split by $$...$$ (block) and $...$ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
    const tokens: Array<{ type: 'text' | 'inline-math' | 'block-math'; content: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      const matchStr = match[0];
      if (matchStr.startsWith('$$') && matchStr.endsWith('$$')) {
        tokens.push({
          type: 'block-math',
          content: matchStr.slice(2, -2).trim(),
        });
      } else {
        tokens.push({
          type: 'inline-math',
          content: matchStr.slice(1, -1).trim(),
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return tokens;
  }, [text]);

  if (!parts.length) {
    return null;
  }

  const Tag = as;

  return (
    <Tag className={`leading-relaxed text-slate-700 break-words ${className}`}>
      {parts.map((p, idx) => {
        if (p.type === 'block-math') {
          return <MathView key={idx} math={p.content} block={as !== 'span'} />;
        }
        if (p.type === 'inline-math') {
          return <MathView key={idx} math={p.content} block={false} />;
        }
        return <span key={idx}>{p.content}</span>;
      })}
    </Tag>
  );
};

