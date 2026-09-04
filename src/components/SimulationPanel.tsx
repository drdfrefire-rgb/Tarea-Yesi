import React, { useState } from 'react';
import { PhysicsSolution } from '../types';
import { MathView } from './MathView';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Info,
} from 'lucide-react';

interface SimulationPanelProps {
  solution: PhysicsSolution;
}

interface ParamConfig {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultVal: number;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ solution }) => {
  // Support dynamic interactive parameters for our physical models
  const isInclined = solution.id === 'sample-dinamica-inclinado';
  const isProjectile = solution.id === 'sample-cinematica-parabolico';
  const isPendulum = solution.id === 'sample-energia-pendulo';

  // Inclined plane parameters
  const [m1, setM1] = useState(4.0);
  const [m2, setM2] = useState(6.0);
  const [theta, setTheta] = useState(30);
  const [muK, setMuK] = useState(0.2);

  // Projectile parameters
  const [v0, setV0] = useState(25.0);
  const [alpha, setAlpha] = useState(37);
  const [h0, setH0] = useState(15.0);

  // Pendulum parameters
  const [mb, setMb] = useState(0.015);
  const [Mblock, setMblock] = useState(2.5);
  const [hRise, setHRise] = useState(0.08);

  const g = 9.8;

  // Real-time physics recalculations
  let calculatedResults: Array<{ name: string; symbol: string; value: string; unit: string; formula: string }> = [];

  if (isInclined) {
    const rad = (theta * Math.PI) / 180;
    const sinT = Math.sin(rad);
    const cosT = Math.cos(rad);
    // a = g * (m2 - m1 * sin(theta) - mu * m1 * cos(theta)) / (m1 + m2)
    const numerator = m2 - m1 * sinT - muK * m1 * cosT;
    const aCalc = (g * numerator) / (m1 + m2);
    // T = m2 * (g - a)
    const tCalc = Math.max(0, m2 * (g - aCalc));

    calculatedResults = [
      {
        name: 'Aceleración del sistema',
        symbol: 'a',
        value: aCalc > 0 ? aCalc.toFixed(2) : '0.00 (en reposo)',
        unit: 'm/s²',
        formula: 'a = \\frac{g(m_2 - m_1\\sin\\theta - \\mu_k m_1\\cos\\theta)}{m_1 + m_2}',
      },
      {
        name: 'Tensión en la cuerda',
        symbol: 'T',
        value: tCalc.toFixed(1),
        unit: 'N',
        formula: 'T = m_2(g - a)',
      },
      {
        name: 'Fuerza de Fricción',
        symbol: 'f_k',
        value: (muK * m1 * g * cosT).toFixed(1),
        unit: 'N',
        formula: 'f_k = \\mu_k m_1 g \\cos\\theta',
      },
      {
        name: 'Normal sobre la rampa',
        symbol: 'N',
        value: (m1 * g * cosT).toFixed(1),
        unit: 'N',
        formula: 'N = m_1 g \\cos\\theta',
      },
    ];
  } else if (isProjectile) {
    const rad = (alpha * Math.PI) / 180;
    const v0x = v0 * Math.cos(rad);
    const v0y = v0 * Math.sin(rad);
    // h_max = h0 + (v0y)^2 / (2g)
    const hMax = h0 + (v0y * v0y) / (2 * g);
    // quadratic: -0.5*g*t^2 + v0y*t + h0 = 0 -> t = (v0y + sqrt(v0y^2 + 2*g*h0))/g
    const discriminant = v0y * v0y + 2 * g * h0;
    const tVuelo = (v0y + Math.sqrt(Math.max(0, discriminant))) / g;
    const xMax = v0x * tVuelo;
    const vImpact = Math.sqrt(v0x * v0x + 2 * g * hMax);

    calculatedResults = [
      {
        name: 'Tiempo de vuelo total',
        symbol: 't_{vuelo}',
        value: tVuelo.toFixed(2),
        unit: 's',
        formula: 't_{vuelo} = \\frac{v_{0y} + \\sqrt{v_{0y}^2 + 2gh_0}}{g}',
      },
      {
        name: 'Alcance horizontal total',
        symbol: 'X_{alcance}',
        value: xMax.toFixed(2),
        unit: 'm',
        formula: 'X = v_0 \\cos\\alpha \\cdot t_{vuelo}',
      },
      {
        name: 'Altura máxima alcanzada',
        symbol: 'H_{max}',
        value: hMax.toFixed(2),
        unit: 'm',
        formula: 'H_{max} = h_0 + \\frac{(v_0\\sin\\alpha)^2}{2g}',
      },
      {
        name: 'Velocidad de impacto final',
        symbol: 'v_f',
        value: vImpact.toFixed(2),
        unit: 'm/s',
        formula: 'v_f = \\sqrt{v_0^2 + 2gh_0}',
      },
    ];
  } else if (isPendulum) {
    // V_despues = sqrt(2*g*h)
    const Vdespues = Math.sqrt(2 * g * hRise);
    // v_bala = (m + M) * V / m
    const vBala = ((mb + Mblock) * Vdespues) / mb;
    // Ec_inicial = 0.5 * m * v_bala^2
    const ecIni = 0.5 * mb * vBala * vBala;
    const ecFin = 0.5 * (mb + Mblock) * Vdespues * Vdespues;
    const deltaE = ecIni - ecFin;

    calculatedResults = [
      {
        name: 'Velocidad inicial del proyectil',
        symbol: 'v_0',
        value: vBala.toFixed(1),
        unit: 'm/s',
        formula: 'v_0 = \\frac{m+M}{m} \\sqrt{2gh}',
      },
      {
        name: 'Velocidad del conjunto tras impacto',
        symbol: 'V',
        value: Vdespues.toFixed(2),
        unit: 'm/s',
        formula: 'V = \\sqrt{2gh}',
      },
      {
        name: 'Energía Mecánica disipada',
        symbol: '\\Delta E_{mec}',
        value: deltaE.toFixed(1),
        unit: 'J',
        formula: '\\Delta E = E_{c,ini} - E_{c,fin}',
      },
    ];
  }

  const handleReset = () => {
    if (isInclined) {
      setM1(4.0);
      setM2(6.0);
      setTheta(30);
      setMuK(0.2);
    } else if (isProjectile) {
      setV0(25.0);
      setAlpha(37);
      setH0(15.0);
    } else if (isPendulum) {
      setMb(0.015);
      setMblock(2.5);
      setHRise(0.08);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>Simulador Paramétrico en Tiempo Real</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/20">
                En vivo
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-indigo-200">
              Modifica los valores conocidos y observa cómo se recalculan inmediatamente los resultados
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1 active:scale-95"
          title="Restablecer valores originales"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restablecer</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {isInclined && (
            <>
              {/* m1 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Masa Rampa (m₁)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {m1.toFixed(1)} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={0.5}
                  value={m1}
                  onChange={(e) => setM1(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>1 kg</span>
                  <span>15 kg</span>
                </div>
              </div>

              {/* m2 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Masa Colgante (m₂)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {m2.toFixed(1)} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={m2}
                  onChange={(e) => setM2(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>1 kg</span>
                  <span>20 kg</span>
                </div>
              </div>

              {/* theta */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Ángulo (θ)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {theta}°
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={80}
                  step={1}
                  value={theta}
                  onChange={(e) => setTheta(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>5°</span>
                  <span>80°</span>
                </div>
              </div>

              {/* muK */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Fricción (μₖ)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {muK.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.8}
                  step={0.02}
                  value={muK}
                  onChange={(e) => setMuK(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0.00 (Liso)</span>
                  <span>0.80</span>
                </div>
              </div>
            </>
          )}

          {isProjectile && (
            <>
              {/* v0 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Velocidad Inicial (v₀)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {v0.toFixed(1)} m/s
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={v0}
                  onChange={(e) => setV0(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>5 m/s</span>
                  <span>60 m/s</span>
                </div>
              </div>

              {/* alpha */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Ángulo Lanzamiento (α)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {alpha}°
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={1}
                  value={alpha}
                  onChange={(e) => setAlpha(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>10°</span>
                  <span>85°</span>
                </div>
              </div>

              {/* h0 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Altura Inicial (h₀)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {h0.toFixed(1)} m
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={h0}
                  onChange={(e) => setH0(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0 m (suelo)</span>
                  <span>50 m</span>
                </div>
              </div>
            </>
          )}

          {isPendulum && (
            <>
              {/* mb */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Masa Proyectil (m)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {(mb * 1000).toFixed(0)} g
                  </span>
                </div>
                <input
                  type="range"
                  min={0.005}
                  max={0.05}
                  step={0.001}
                  value={mb}
                  onChange={(e) => setMb(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>5 g</span>
                  <span>50 g</span>
                </div>
              </div>

              {/* Mblock */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Masa Péndulo (M)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {Mblock.toFixed(2)} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={Mblock}
                  onChange={(e) => setMblock(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0.5 kg</span>
                  <span>10.0 kg</span>
                </div>
              </div>

              {/* hRise */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Elevación Máxima (h)</span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {(hRise * 100).toFixed(1)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.3}
                  step={0.005}
                  value={hRise}
                  onChange={(e) => setHRise(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>1 cm</span>
                  <span>30 cm</span>
                </div>
              </div>
            </>
          )}

          {!isInclined && !isProjectile && !isPendulum && (
            <div className="col-span-full p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              Este ejercicio utiliza la derivación analítica general calculada por el motor de IA.
            </div>
          )}
        </div>

        {/* Dynamic Results Display */}
        {calculatedResults.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resultados Recalculados Dinámicamente</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {calculatedResults.map((res, i) => (
                <div
                  key={i}
                  className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-200/80 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] text-slate-600 font-medium block mb-1 truncate" title={res.name}>
                      {res.name}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-base sm:text-lg font-bold text-emerald-800">
                        {res.value}
                      </span>
                      <span className="text-xs text-emerald-700 font-medium">{res.unit}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 pt-2 mt-2 border-t border-emerald-200/60 overflow-x-auto">
                    <MathView math={res.formula} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
