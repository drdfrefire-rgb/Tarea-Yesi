import { PhysicsSolution } from '../types';

export const SAMPLE_SOLUTIONS: PhysicsSolution[] = [
  {
    id: 'sample-cilindro-gauss',
    title: 'Cilindro Aislante con Densidad de Carga Variable (Ley de Gauss)',
    category: 'electromagnetismo',
    difficulty: 'Avanzado',
    problemStatement:
      'Un cilindro aislante de longitud infinita y de radio R tiene una densidad de carga volumétrica que varía en función del radio de la forma siguiente:\n\n$$ \\rho = \\rho_0\\left(a - \\frac{r}{b}\\right) $$\n\nsiendo ρ₀, a y b constantes positivas y r la distancia al eje del cilindro. Utilice la ley de Gauss para determinar la magnitud del campo eléctrico a las siguientes distancias radiales:\n\na) r < R.\n\nb) r > R.\n\nc) Realice un gráfico de la intensidad del campo eléctrico, tanto dentro como fuera del cilindro, en función de la distancia al eje, todo en el mismo plano.',
    createdAt: 1718000000000,
    knowns: [
      { symbol: 'R', name: 'Radio del cilindro aislante', value: 'R', unit: 'm', notes: 'Límite entre región interna y externa' },
      { symbol: '\\rho(r)', name: 'Densidad de carga volumétrica', value: '\\rho_0(a - r/b)', unit: 'C/m³', notes: 'Varía con la distancia radial r' },
      { symbol: '\\rho_0, a, b', name: 'Constantes del medio', value: 'Positivas', unit: 'Varias', notes: 'Parámetros del perfil de carga' },
      { symbol: '\\varepsilon_0', name: 'Permitividad del vacío', value: '8.854 \\times 10^{-12} \\text{ F/m}', unit: 'F/m', notes: 'Constante eléctrica fundamental' },
    ],
    unknowns: [
      { symbol: 'E_{\\text{in}}(r)', name: 'Campo eléctrico interno (r < R)', targetUnit: 'N/C', calculatedValue: '\\frac{\\rho_0 r}{6\\varepsilon_0 b}(3ab - 2r)', notes: 'Mediante integración con Ley de Gauss' },
      { symbol: 'E_{\\text{out}}(r)', name: 'Campo eléctrico externo (r > R)', targetUnit: 'N/C', calculatedValue: '\\frac{\\rho_0 R^2}{2\\varepsilon_0 r}\\left(a - \\frac{2R}{3b}\\right)', notes: 'Campo equivalente a carga lineal total' },
    ],
    diagram: {
      title: 'Esquema Físico y Cilindros Gaussianos',
      description: 'Cilindro aislante de radio R con superficie gaussiana cilíndrica de radio r (tanto interna r < R como externa r > R) y campo eléctrico radial E⃗.',
      viewBox: '0 0 720 400',
      svgCode: `<svg viewBox="0 0 840 440" class="w-full h-auto select-none font-sans" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cylGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="softShadowCyl" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.4" />
    </filter>
    <marker id="arrE" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <polygon points="0 1.5, 8 4.5, 0 7.5" fill="#34d399" />
    </marker>
    <marker id="arrR" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <polygon points="0 1.5, 8 4.5, 0 7.5" fill="#fbbf24" />
    </marker>
    <marker id="arrIn" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <polygon points="0 1.5, 8 4.5, 0 7.5" fill="#38bdf8" />
    </marker>
  </defs>

  <!-- Background Canvas -->
  <rect width="840" height="440" fill="#090d16" rx="16" />
  <g opacity="0.12">
    <pattern id="gridCyl" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" stroke-width="1" />
    </pattern>
    <rect width="840" height="440" fill="url(#gridCyl)" />
  </g>

  <!-- Title Banner inside SVG -->
  <text x="420" y="32" font-size="14" font-weight="bold" fill="#38bdf8" text-anchor="middle" letter-spacing="1">ESQUEMA ESPACIAL - CILINDRO AISLANTE Y SUPERFICIE GAUSIANA</text>

  <!-- Cylinder Axis z -->
  <line x1="480" y1="55" x2="480" y2="410" stroke="#64748b" stroke-width="2.5" stroke-dasharray="10 5" />
  <text x="495" y="75" font-size="12" font-weight="bold" fill="#94a3b8">Eje z (Simetría)</text>

  <!-- Insulating Cylinder of Radius R (Centered at x=480, width 220 -> x=370 to 590) -->
  <g filter="url(#softShadowCyl)">
    <rect x="370" y="90" width="220" height="290" rx="16" fill="url(#cylGrad)" stroke="#60a5fa" stroke-width="3" opacity="0.95" />
    <!-- Top Ellipse Cap -->
    <ellipse cx="480" cy="90" rx="110" ry="28" fill="#3b82f6" stroke="#93c5fd" stroke-width="2.5" />
    <!-- Bottom Ellipse Cap -->
    <ellipse cx="480" cy="380" rx="110" ry="28" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2.5" />
  </g>

  <!-- Gaussian Cylinder (Internal: r < R) -->
  <g opacity="0.85">
    <ellipse cx="480" cy="130" rx="60" ry="16" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 4" />
    <ellipse cx="480" cy="340" rx="60" ry="16" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 4" />
    <path d="M 420,130 L 420,340 M 540,130 L 540,340" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 4" />
  </g>

  <!-- Radius R indicator (Yellow) -->
  <line x1="480" y1="235" x2="590" y2="235" stroke="#fbbf24" stroke-width="3" marker-end="url(#arrR)" />
  <rect x="515" y="212" width="45" height="22" rx="6" fill="#78350f" stroke="#fbbf24" stroke-width="1.5" />
  <text x="537.5" y="228" font-size="12" font-weight="bold" fill="#fde68a" text-anchor="middle">R</text>

  <!-- Radius r (internal) indicator (Cyan) -->
  <line x1="480" y1="195" x2="540" y2="195" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrIn)" />
  <rect x="495" y="173" width="35" height="20" rx="5" fill="#0369a1" stroke="#38bdf8" stroke-width="1.2" />
  <text x="512.5" y="188" font-size="11" font-weight="bold" fill="#bae6fd" text-anchor="middle">r &lt; R</text>

  <!-- Electric Field Vector E (r > R) (Green) -->
  <line x1="590" y1="235" x2="685" y2="235" stroke="#34d399" stroke-width="4" marker-end="url(#arrE)" />
  <rect x="610" y="208" width="55" height="24" rx="6" fill="#064e3b" stroke="#34d399" stroke-width="1.5" />
  <text x="637.5" y="225" font-size="12" font-weight="bold" fill="#6ee7b7" text-anchor="middle">E⃗ (r &gt; R)</text>

  <!-- Left Side Info Panels (Generous Spacing, No overlap) -->
  <!-- Panel 1: Charge Density -->
  <g transform="translate(35, 80)">
    <rect width="295" height="85" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2" filter="url(#softShadowCyl)" />
    <circle cx="20" cy="22" r="6" fill="#38bdf8" />
    <text x="36" y="26" font-size="11" font-weight="bold" fill="#94a3b8" letter-spacing="0.5">DENSIDAD DE CARGA VOLUMÉTRICA</text>
    <text x="20" y="60" font-size="15" font-weight="bold" fill="#facc15">ρ(r) = ρ₀ (a - r / b)</text>
  </g>

  <!-- Panel 2: Gauss Law -->
  <g transform="translate(35, 185)">
    <rect width="295" height="85" rx="12" fill="#1e293b" stroke="#34d399" stroke-width="2" filter="url(#softShadowCyl)" />
    <circle cx="20" cy="22" r="6" fill="#34d399" />
    <text x="36" y="26" font-size="11" font-weight="bold" fill="#94a3b8" letter-spacing="0.5">LEY DE GAUSS APLICADA</text>
    <text x="20" y="60" font-size="15" font-weight="bold" fill="#34d399">∮ E⃗ · d A⃗ = q_enc / ε₀</text>
  </g>

  <!-- Panel 3: Regions -->
  <g transform="translate(35, 290)">
    <rect width="295" height="85" rx="12" fill="#1e293b" stroke="#fbbf24" stroke-width="2" filter="url(#softShadowCyl)" />
    <circle cx="20" cy="22" r="6" fill="#fbbf24" />
    <text x="36" y="26" font-size="11" font-weight="bold" fill="#94a3b8" letter-spacing="0.5">DOMINIOS RADIALES</text>
    <text x="20" y="52" font-size="12" font-weight="bold" fill="#e2e8f0">• Región Interna: r &lt; R</text>
    <text x="20" y="70" font-size="12" font-weight="bold" fill="#e2e8f0">• Región Externa: r &gt; R</text>
  </g>
</svg>`,
    },
    principles: [
      'Ley de Gauss para el campo eléctrico: ∮ E⃗ · d A⃗ = q_enc / ε₀.',
      'Simetría cilíndrica infinita: El campo eléctrico E⃗ es radial y depende de la distancia r al eje.',
      'Superficie gausiana cilíndrica de radio r y longitud L: ∮ E⃗ · d A⃗ = E(r) · (2π r L).',
    ],
    assumptions: [
      'Cilindro de longitud infinita.',
      'Medio con permitividad del vacío ε₀.',
      'Distribución de carga volumétrica simétrica.',
    ],
    coordinateSystem: 'Coordenadas cilíndricas (r, φ, z).',
    derivationSteps: [
      {
        stepNumber: 1,
        title: 'Flujo Eléctrico mediante Ley de Gauss',
        explanation: 'Para una superficie gausiana cilíndrica de radio r y longitud L, el flujo eléctrico a través de la superficie lateral es:',
        mathLatex: '\\oint \\vec{E} \\cdot d\\vec{A} = E(r) \\cdot (2\\pi r L)',
      },
      {
        stepNumber: 2,
        title: 'Carga Encerrada para r < R (Caso a)',
        explanation: 'Integramos la densidad de carga ρ(r\') dV desde 0 hasta r:',
        mathLatex: 'q_{\\text{enc}} = \\int_0^r \\rho_0\\left(a - \\frac{r\'}{b}\\right) (2\\pi r\' L) dr\' = 2\\pi \\rho_0 L \\left( \\frac{a r^2}{2} - \\frac{r^3}{3b} \\right)',
        intermediateResult: 'q_{\\text{enc}} = 2\\pi \\rho_0 L \\left( \\frac{a r^2}{2} - \\frac{r^3}{3b} \\right)',
      },
      {
        stepNumber: 3,
        title: 'Magnitud del Campo Eléctrico Interno E_in(r)',
        explanation: 'Igualando el flujo con q_enc / ε₀ y despejando E_in(r):',
        mathLatex: 'E_{\\text{in}}(r) = \\frac{\\rho_0 r}{6\\varepsilon_0 b} (3ab - 2r)',
        intermediateResult: 'E_{\\text{in}}(r) = \\frac{\\rho_0 r}{6\\varepsilon_0 b} (3ab - 2r)',
      },
      {
        stepNumber: 4,
        title: 'Carga Total Encerrada para r > R (Caso b)',
        explanation: 'Para r > R, la carga encerrada es la carga total del cilindro de radio R por unidad de longitud L:',
        mathLatex: 'q_{\\text{total}} = 2\\pi \\rho_0 L \\left( \\frac{a R^2}{2} - \\frac{R^3}{3b} \\right)',
      },
      {
        stepNumber: 5,
        title: 'Magnitud del Campo Eléctrico Externo E_out(r)',
        explanation: 'Aplicando la Ley de Gauss para r > R y simplificando algebraicamente:',
        mathLatex: 'E_{\\text{out}}(r) = \\frac{\\rho_0 R^2}{2\\varepsilon_0 r} \\left( a - \\frac{2R}{3b} \\right)',
        intermediateResult: 'E_{\\text{out}}(r) = \\frac{\\rho_0 R^2}{2\\varepsilon_0 r} \\left( a - \\frac{2R}{3b} \\right)',
      },
    ],
    symbolicFormula: 'E_{\\text{in}}(r) = \\frac{\\rho_0 r}{6\\varepsilon_0 b}(3ab - 2r) \\quad (r \\le R); \\quad E_{\\text{out}}(r) = \\frac{\\rho_0 R^2}{2\\varepsilon_0 r}\\left(a - \\frac{2R}{3b}\\right) \\quad (r > R)',
    numericalSubstitution: 'Evaluación analítica general en función de r, R, ρ₀, a, b y ε₀.',
    finalAnswers: [
      {
        symbol: 'E_{\\text{in}}(r)',
        name: 'Campo eléctrico gausiano interno',
        value: '\\frac{\\rho_0 r}{6\\varepsilon_0 b}(3ab - 2r)',
        unit: 'N/C',
        interpretation: 'Crece de forma no lineal (aproximadamente cuadrática) con la distancia radial r desde el eje.',
      },
      {
        symbol: 'E_{\\text{out}}(r)',
        name: 'Campo eléctrico gausiano externo',
        value: '\\frac{\\rho_0 R^2}{2\\varepsilon_0 r}\\left(a - \\frac{2R}{3b}\\right)',
        unit: 'N/C',
        interpretation: 'Decae inversamente con la distancia (1/r), idéntico al campo producido por una línea de carga lineal equivalente en el eje.',
      },
    ],
    physicalDiscussion: 'El análisis mediante la Ley de Gauss demuestra la potencia de la simetría cilíndrica. Dentro del cilindro (r < R), la carga encerrada escala con r² y r³, lo que modula la pendiente del campo eléctrico. En la frontera r = R, la expresión interna coincide exactamente con la externa, garantizando la continuidad física del campo. Fuera del cilindro, el campo decae como 1/r tal como corresponde a la carga neta total encerrada.',
    commonMistakesOrTips: [
      'Error común al integrar: olvidar el factor diferencial de volumen cilíndrico dV = (2π r\' L) dr\'.',
      'Verificar que en r = R ambas expresiones coinciden algebraicamente.',
    ],
  },
];
