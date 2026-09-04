import React, { useState, useRef, useEffect } from 'react';
import { KnownQuantity, UnknownQuantity, DiagramData } from '../types';
import { generatePhysicsDiagramSVG, sanitizeSvgCode } from '../lib/diagramGenerator';
import {
  CheckCircle2,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Grid,
  Compass,
  ArrowUpRight,
  Move,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DiagramViewerProps {
  diagram?: DiagramData;
  knowns?: KnownQuantity[];
  unknowns?: UnknownQuantity[];
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({
  diagram,
  knowns = [],
  unknowns = [],
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<'both' | 'knowns' | 'unknowns'>('both');
  const [diagramMode, setDiagramMode] = useState<'blueprint' | 'ai'>('blueprint');

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistanceRef = useRef<number | null>(null);

  const safeKnowns = knowns || [];
  const safeUnknowns = unknowns || [];

  // Robust SVG resolution: sanitize AI SVG, compute procedural fallback
  const sanitizedAiSvg = sanitizeSvgCode(diagram?.svgCode);
  const proceduralSvg =
    diagram?.proceduralSvgCode ||
    generatePhysicsDiagramSVG({
      title: diagram?.title,
      knowns: safeKnowns,
      unknowns: safeUnknowns,
      problemStatement: diagram?.description,
    });

  const hasAiDiagram = Boolean(sanitizedAiSvg && sanitizedAiSvg !== proceduralSvg);
  const effectiveSvg =
    diagramMode === 'ai' && hasAiDiagram
      ? sanitizedAiSvg
      : (sanitizedAiSvg || proceduralSvg);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Center or reset pan when diagram changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [diagram?.svgCode]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan & pinch zoom handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / lastTouchDistanceRef.current;
      setZoom((prev) => Math.min(Math.max(prev * ratio, 0.5), 3.5));
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistanceRef.current = null;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.5), 3.5));
  };

  const handleDownloadSVG = () => {
    if (!effectiveSvg) return;
    const blob = new Blob([effectiveSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esquema-fisica-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-3.5">
      {/* Top Header & Mobile Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
              {diagram?.title || 'Esquema Físico & Diagrama de Cuerpo Libre (DCL)'}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">
              {diagram?.description || 'Representación vectorial a escala con cotas de datos e incógnitas'}
            </p>
          </div>
        </div>

        {/* Toolbar Controls - Optimized for Touch on Mobile */}
        <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-1.5 bg-slate-100/95 p-1 rounded-xl border border-slate-200 shadow-2xs">
          {/* AI vs Blueprint Toggle when both are available */}
          {hasAiDiagram && (
            <button
              onClick={() => setDiagramMode(diagramMode === 'blueprint' ? 'ai' : 'blueprint')}
              title={diagramMode === 'blueprint' ? 'Ver esquema generado por IA' : 'Ver esquema vectorial didáctico'}
              className="min-h-[36px] sm:min-h-0 px-2 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 bg-white hover:bg-slate-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs active:scale-95"
            >
              {diagramMode === 'blueprint' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] sm:text-[11px]">Ver IA</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] sm:text-[11px]">Ver Vector</span>
                </>
              )}
            </button>
          )}

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title={showGrid ? 'Ocultar retícula de ingeniería' : 'Mostrar retícula de ingeniería'}
            className={`min-h-[36px] sm:min-h-0 px-2 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 active:scale-95 ${
              showGrid
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-[11px] font-medium">Guías</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-0.5">
            <button
              onClick={handleZoomOut}
              title="Reducir zoom"
              aria-label="Reducir zoom"
              className="min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors active:scale-90"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-700 px-1 select-none min-w-[32px] text-center font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Aumentar zoom"
              aria-label="Aumentar zoom"
              className="min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors active:scale-90"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              title="Restablecer posición y zoom al 100%"
              aria-label="Restablecer vista"
              className="min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors active:scale-90"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Expand / Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Contraer vista' : 'Maximizar esquema'}
            aria-label={isExpanded ? 'Contraer' : 'Expandir'}
            className="min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border-l border-slate-200 pl-1.5 active:scale-90"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5 text-indigo-600" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Download SVG */}
          <button
            onClick={handleDownloadSVG}
            title="Descargar diagrama SVG limpio en alta calidad"
            aria-label="Descargar diagrama SVG"
            className="min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors active:scale-90 border-l border-slate-200 pl-1.5"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Blueprint Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`relative border border-slate-300/80 rounded-2xl overflow-hidden bg-slate-950 shadow-sm transition-all duration-300 flex flex-col items-center justify-center select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${isExpanded ? 'min-h-[380px] sm:min-h-[520px]' : 'min-h-[260px] sm:min-h-[360px] flex-1'}`}
      >
        {/* Engineering blueprint millimeter grid background */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
            showGrid ? 'opacity-40' : 'opacity-15'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(circle, #94a3b8 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
            backgroundSize: '20px 20px, 40px 40px, 40px 40px',
          }}
        />

        {/* Floating Interactive Badge Indicator */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-xs flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Esquema Escalar DCL</span>
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50 items-center gap-1">
            <Move className="w-2.5 h-2.5 text-indigo-400" />
            Arrastra para mover • Rueda o pellizca para zoom
          </span>
        </div>

        {/* Pan / Zoom indicator and reset badge */}
        {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <button
            onClick={handleResetView}
            className="absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-md backdrop-blur-xs flex items-center gap-1 transition-all active:scale-95"
            title="Centrar y reajustar escala"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Centrar</span>
          </button>
        )}

        {/* Quick legend on mobile and desktop */}
        <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-2.5 z-10 flex items-center justify-between sm:justify-start gap-2 sm:gap-3 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[10px] sm:text-[11px] pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 border border-emerald-300/40" />
            <span className="text-emerald-200 font-medium truncate">Datos</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 border border-amber-300/40" />
            <span className="text-amber-200 font-medium truncate">Incógnitas (?)</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-indigo-400" />
            <span className="text-indigo-200 font-medium truncate">Vectores</span>
          </div>
        </div>

        {/* Interactive SVG Renderer Container with Full Drag Pan and Zoom */}
        <div className="w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-5 select-none">
          <div
            className="transition-transform duration-75 origin-center w-full max-w-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-[300px] sm:[&>svg]:max-h-[440px] [&>svg]:h-auto [&>svg]:w-full filter drop-shadow-md pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            dangerouslySetInnerHTML={{
              __html:
                effectiveSvg ||
                '<div class="text-slate-400 text-xs font-mono p-6 text-center">Generando esquema técnico vectorial...</div>',
            }}
          />
        </div>
      </div>

      {/* Mobile filter pills to toggle between Datos / Incógnitas or Both */}
      <div className="flex sm:hidden items-center justify-center gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveMobileSection('both')}
          className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
            activeMobileSection === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
          }`}
        >
          Todo ({safeKnowns.length + safeUnknowns.length})
        </button>
        <button
          onClick={() => setActiveMobileSection('knowns')}
          className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
            activeMobileSection === 'knowns' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
          }`}
        >
          Datos ({safeKnowns.length})
        </button>
        <button
          onClick={() => setActiveMobileSection('unknowns')}
          className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
            activeMobileSection === 'unknowns' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500'
          }`}
        >
          Incógnitas ({safeUnknowns.length})
        </button>
      </div>

      {/* Organized Physical Quantities Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
        {/* Known Quantities Panel */}
        {(activeMobileSection === 'both' || activeMobileSection === 'knowns') && (
          <div className="bg-slate-50/90 rounded-xl p-3 sm:p-3.5 border border-slate-200 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200/80">
                <h4 className="text-[11px] text-slate-700 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs inline-block" />
                  <span>Datos Conocidos</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60 font-bold">
                  {safeKnowns.length} identificados
                </span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5 no-scrollbar">
                {safeKnowns.map((k, i) => (
                  <div
                    key={i}
                    className="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs hover:border-emerald-300 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 truncate block text-[11px] sm:text-xs">
                        {k.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        Símbolo: <span className="text-emerald-700 font-semibold">{k.symbol}</span>
                        {k.notes && ` • ${k.notes}`}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 shrink-0 text-xs shadow-2xs">
                      {k.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Unknown Quantities Panel */}
        {(activeMobileSection === 'both' || activeMobileSection === 'unknowns') && (
          <div className="bg-slate-50/90 rounded-xl p-3 sm:p-3.5 border border-slate-200 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200/80">
                <h4 className="text-[11px] text-slate-700 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs inline-block" />
                  <span>Incógnitas a Resolver</span>
                </h4>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300/60 font-bold">
                  {safeUnknowns.length} incógnitas
                </span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5 no-scrollbar">
                {safeUnknowns.map((u, i) => (
                  <div
                    key={i}
                    className="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs hover:border-amber-300 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 truncate block text-[11px] sm:text-xs">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        Símbolo: <span className="text-amber-700 font-semibold">{u.symbol}</span>
                        {u.notes && ` • ${u.notes}`}
                      </span>
                    </div>
                    {u.calculatedValue ? (
                      <span className="font-mono font-bold text-indigo-950 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 shrink-0 flex items-center gap-1 text-xs shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                        <span>{u.calculatedValue}</span>
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 shrink-0 text-xs shadow-2xs">
                        ? {u.targetUnit && `(${u.targetUnit})`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
