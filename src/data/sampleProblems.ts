import { PhysicsSolution } from '../types';

export const SAMPLE_SOLUTIONS: PhysicsSolution[] = [
  {
    id: 'sample-dinamica-inclinado',
    title: 'Bloque en Plano Inclinado con Fricción y Masa Colgante',
    category: 'dinamica',
    difficulty: 'Intermedio',
    problemStatement:
      'Un bloque de masa m₁ = 4.0 kg descansa sobre un plano inclinado a un ángulo θ = 30° con respecto a la horizontal. El coeficiente de fricción cinética entre el bloque y la superficie es μₖ = 0.20. El bloque está conectado mediante una cuerda inextensible y sin masa que pasa por una polea ideal a una segunda masa colgante m₂ = 6.0 kg. Asumiendo g = 9.8 m/s², determine:\n1. La aceleración (a) del sistema al deslizarse la masa hacia abajo.\n2. La tensión (T) en la cuerda.',
    createdAt: 1718000000000,
    knowns: [
      { symbol: 'm_1', name: 'Masa sobre el plano inclinado', value: '4.0 kg', unit: 'kg', notes: 'Cuerpo 1 en la rampa' },
      { symbol: 'm_2', name: 'Masa colgante', value: '6.0 kg', unit: 'kg', notes: 'Cuerpo 2 suspendido' },
      { symbol: '\\theta', name: 'Ángulo de inclinación del plano', value: '30°', unit: 'grados', notes: 'Inclinación sobre la horizontal' },
      { symbol: '\\mu_k', name: 'Coeficiente de fricción cinética', value: '0.20', unit: 'adimensional', notes: 'Entre bloque 1 y la rampa' },
      { symbol: 'g', name: 'Aceleración de la gravedad', value: '9.80 m/s²', unit: 'm/s²', notes: 'Constante gravitacional local' },
    ],
    unknowns: [
      { symbol: 'a', name: 'Aceleración del sistema', targetUnit: 'm/s²', calculatedValue: '3.25 m/s²', notes: 'Magnitud compartida por ambos bloques unidos' },
      { symbol: 'T', name: 'Tensión en la cuerda', targetUnit: 'N', calculatedValue: '39.3 N', notes: 'Fuerza de tensión a lo largo del cable ideal' },
    ],
    diagram: {
      title: 'Esquema Físico y Diagrama de Cuerpo Libre (DCL)',
      description: 'Plano inclinado a 30° con descomposición analítica de fuerzas sobre m₁ (N, fk, P, T) y m₂ (T, P₂).',
      viewBox: '0 0 720 400',
      svgCode: `<svg viewBox="0 0 720 400" class="w-full h-auto select-none font-sans" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="blockGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="blockGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.2" />
    </filter>
    <!-- Arrow Markers -->
    <marker id="arrKnown" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#10b981" />
    </marker>
    <marker id="arrUnknown" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#f59e0b" />
    </marker>
    <marker id="arrForce" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#818cf8" />
    </marker>
    <marker id="arrRed" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#f43f5e" />
    </marker>
    <marker id="arrAxis" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <polygon points="0 1, 5 3, 0 5" fill="#94a3b8" />
    </marker>
  </defs>

  <!-- Ground surface -->
  <line x1="40" y1="340" x2="680" y2="340" stroke="#334155" stroke-width="2.5" />
  <path d="M50,345 L40,355 M90,345 L80,355 M130,345 L120,355 M170,345 L160,355 M210,345 L200,355 M250,345 L240,355 M290,345 L280,355 M330,345 L320,355 M370,345 L360,355 M410,345 L400,355 M450,345 L440,355 M490,345 L480,355" stroke="#475569" stroke-width="1.5" />

  <!-- Inclined Wedge (base: 70 to 470, height: 340 to 110) -->
  <polygon points="70,340 470,340 470,110" fill="url(#rampGrad)" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.6" filter="url(#softGlow)" />
  
  <!-- Incline angle theta indicator -->
  <path d="M140,340 A70,70 0 0,0 131,305" fill="none" stroke="#10b981" stroke-width="2.5" />
  <g transform="translate(145, 290)">
    <rect width="66" height="22" rx="11" fill="#064e3b" stroke="#10b981" stroke-width="1.5" />
    <text x="33" y="15" font-size="11" font-weight="bold" fill="#6ee7b7" text-anchor="middle">θ = 30°</text>
  </g>

  <!-- Friction tag -->
  <g transform="translate(195, 215)">
    <rect width="78" height="22" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.2" />
    <text x="39" y="15" font-size="10" font-weight="bold" fill="#6ee7b7" text-anchor="middle">μₖ = 0.20</text>
  </g>

  <!-- Pulley atop the ramp (470, 110) -->
  <circle cx="478" cy="102" r="18" fill="#1e293b" stroke="#94a3b8" stroke-width="2.5" />
  <circle cx="478" cy="102" r="4" fill="#38bdf8" />

  <!-- Tension Cable (clean non-crossing lines) -->
  <line x1="305" y1="198" x2="478" y2="102" stroke="#e2e8f0" stroke-width="2.5" />
  <line x1="496" y1="102" x2="496" y2="205" stroke="#e2e8f0" stroke-width="2.5" />

  <!-- Block m1 (positioned along 30° incline at x=250, y=236) -->
  <g transform="translate(250, 230) rotate(-30)">
    <!-- Local coordinate axes (x parallel, y perpendicular) -->
    <line x1="0" y1="0" x2="110" y2="0" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrAxis)" />
    <text x="114" y="4" font-size="9" fill="#94a3b8" font-family="monospace">+x</text>
    <line x1="0" y1="0" x2="0" y2="-90" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrAxis)" />
    <text x="4" y="-88" font-size="9" fill="#94a3b8" font-family="monospace">+y</text>

    <!-- Block shape -->
    <rect x="-35" y="-35" width="70" height="35" rx="5" fill="url(#blockGrad1)" stroke="#60a5fa" stroke-width="2" filter="url(#softGlow)" />
    <text x="0" y="-13" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">m₁ = 4.0 kg</text>
    
    <!-- Center of mass dot -->
    <circle cx="0" cy="-17.5" r="3.5" fill="#facc15" />

    <!-- Normal Force N (perpendicular upward) -->
    <line x1="0" y1="-17.5" x2="0" y2="-75" stroke="#818cf8" stroke-width="2.5" marker-end="url(#arrForce)" />
    <g transform="translate(-16, -88)">
      <rect width="32" height="18" rx="4" fill="#1e1b4b" stroke="#818cf8" stroke-width="1" />
      <text x="16" y="13" font-size="11" font-weight="bold" fill="#c7d2fe" text-anchor="middle">N</text>
    </g>

    <!-- Tension T (upward along incline) -->
    <line x1="35" y1="-17.5" x2="90" y2="-17.5" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrUnknown)" />
    <g transform="translate(94, -28)">
      <rect width="48" height="20" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="1.2" />
      <text x="24" y="14" font-size="10" font-weight="bold" fill="#fde68a" text-anchor="middle">T = ?</text>
    </g>

    <!-- Kinetic Friction fk (downward along incline) -->
    <line x1="-35" y1="0" x2="-85" y2="0" stroke="#f43f5e" stroke-width="2.2" marker-end="url(#arrRed)" />
    <g transform="translate(-124, -10)">
      <rect width="36" height="18" rx="4" fill="#4c0519" stroke="#f43f5e" stroke-width="1" />
      <text x="18" y="13" font-size="10" font-weight="bold" fill="#fecdd3" text-anchor="middle">f_k</text>
    </g>

    <!-- Acceleration arrow a1 along incline -->
    <line x1="0" y1="-46" x2="48" y2="-46" stroke="#10b981" stroke-width="2" stroke-dasharray="4,2" marker-end="url(#arrKnown)" />
    <text x="24" y="-51" font-size="10" font-weight="bold" fill="#34d399" text-anchor="middle">a (↗)</text>
  </g>

  <!-- Gravity force P1 on block m1 (straight vertical down in global coordinates) -->
  <line x1="250" y1="210" x2="250" y2="295" stroke="#818cf8" stroke-width="2.5" marker-end="url(#arrForce)" />
  <g transform="translate(258, 280)">
    <rect width="66" height="20" rx="4" fill="#1e1b4b" stroke="#818cf8" stroke-width="1" />
    <text x="33" y="14" font-size="10" font-weight="bold" fill="#c7d2fe" text-anchor="middle">P₁ = m₁g</text>
  </g>

  <!-- Block m2 (hanging vertically from pulley at x=496, y=210) -->
  <g transform="translate(471, 205)">
    <rect width="50" height="50" rx="6" fill="url(#blockGrad2)" stroke="#38bdf8" stroke-width="2" filter="url(#softGlow)" />
    <text x="25" y="24" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">m₂</text>
    <text x="25" y="38" font-size="10" font-semibold fill="#bae6fd" text-anchor="middle">6.0 kg</text>

    <!-- Center of mass -->
    <circle cx="25" cy="25" r="3.5" fill="#facc15" />

    <!-- Tension T upward -->
    <line x1="25" y1="0" x2="25" y2="-45" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrUnknown)" />
    <g transform="translate(32, -40)">
      <rect width="46" height="20" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.2" />
      <text x="23" y="14" font-size="10" font-weight="bold" fill="#fde68a" text-anchor="middle">T = ?</text>
    </g>

    <!-- Weight P2 downward -->
    <line x1="25" y1="50" x2="25" y2="105" stroke="#818cf8" stroke-width="2.5" marker-end="url(#arrForce)" />
    <g transform="translate(32, 90)">
      <rect width="66" height="20" rx="4" fill="#1e1b4b" stroke="#818cf8" stroke-width="1" />
      <text x="33" y="14" font-size="10" font-weight="bold" fill="#c7d2fe" text-anchor="middle">P₂ = m₂g</text>
    </g>

    <!-- Acceleration a downward -->
    <line x1="-18" y1="10" x2="-18" y2="48" stroke="#10b981" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#arrKnown)" />
    <text x="-24" y="32" font-size="10" font-weight="bold" fill="#34d399" text-anchor="end">a (↓)</text>
  </g>

  <!-- Unknown Acceleration Target Callout -->
  <g transform="translate(560, 218)">
    <rect width="125" height="42" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
    <text x="12" y="18" font-size="10" font-weight="bold" fill="#94a3b8">INCÓGNITA:</text>
    <text x="12" y="34" font-size="12" font-weight="bold" fill="#f59e0b">a = ? [m/s²]</text>
  </g>
</svg>`,
    },
    principles: [
      'Segunda Ley de Newton (\\Sigma \\vec{F} = m \\vec{a}) aplicada a cada cuerpo de forma desacoplada.',
      'Condición de ligadura cinemática para cuerda inextensible: la magnitud de la aceleración del bloque 1 a lo largo de la rampa es idéntica a la aceleración del bloque 2 que desciende (a_1 = a_2 = a).',
      'Ley de fricción de Coulomb-Amontons: la fuerza de rozamiento cinético máxima es f_k = \\mu_k N.',
    ],
    assumptions: [
      'Cuerda de masa despreciable e inextensible (transmite la tensión con el mismo módulo en ambos extremos).',
      'Polea ideal: sin momento de inercia ni fricción en su eje de giro.',
      'Aceleración gravitacional constante g = 9.80 m/s².',
      'El bloque m₂ desciende arrastrando al bloque m₁ cuesta arriba, de modo que f_k se opone a dicho movimiento apuntando hacia abajo de la rampa.',
    ],
    coordinateSystem:
      'Para m₁: Eje x paralelo al plano inclinado con sentido positivo hacia arriba (dirección del movimiento); eje y perpendicular al plano inclinado hacia afuera. Para m₂: Eje vertical con sentido positivo hacia abajo (dirección del movimiento de descenso).',
    derivationSteps: [
      {
        stepNumber: 1,
        title: 'Diagrama de Cuerpo Libre y Ecuaciones para el Bloque 1 (m₁)',
        explanation:
          'Descomponemos el peso P₁ = m₁g en sus componentes tangencial (m₁g \\sin\\theta) y normal (m₁g \\cos\\theta). Como no hay aceleración en el eje perpendicular a la rampa (a_y = 0), obtenemos la fuerza normal.',
        mathLatex:
          '\\Sigma F_{1y} = N - m_1 g \\cos\\theta = 0 \\implies N = m_1 g \\cos\\theta',
        intermediateResult: 'N = (4.0)(9.80)\\cos(30^\\circ) = 33.95\\text{ N}',
      },
      {
        stepNumber: 2,
        title: 'Cálculo de la Fuerza de Fricción Cinética (f_k)',
        explanation:
          'La fuerza de fricción cinética f_k actúa en contra del deslizamiento del bloque 1 (es decir, hacia abajo de la rampa, sentido negativo del eje x).',
        mathLatex:
          'f_k = \\mu_k N = \\mu_k m_1 g \\cos\\theta',
        intermediateResult: 'f_k = (0.20)(33.95\\text{ N}) = 6.79\\text{ N}',
      },
      {
        stepNumber: 3,
        title: 'Ecuación de Movimiento Tangencial para el Bloque 1 (m₁)',
        explanation:
          'En el eje longitudinal de la rampa, la tensión T tira hacia arriba, mientras que la componente del peso m₁g sin(θ) y la fricción f_k se oponen.',
        mathLatex:
          '\\Sigma F_{1x} = T - m_1 g \\sin\\theta - f_k = m_1 a \\quad \\text{--- (Ecuación 1)}',
      },
      {
        stepNumber: 4,
        title: 'Ecuación de Movimiento para el Bloque Colgante 2 (m₂)',
        explanation:
          'Para el bloque 2, tomamos el eje hacia abajo en el sentido del movimiento acelerado. El peso m₂g tira hacia abajo y la tensión T retiene hacia arriba.',
        mathLatex:
          '\\Sigma F_{2} = m_2 g - T = m_2 a \\quad \\text{--- (Ecuación 2)}',
      },
      {
        stepNumber: 5,
        title: 'Resolución del Sistema de Ecuaciones para la Aceleración (a)',
        explanation:
          'Sumamos miembro a miembro la Ecuación 1 y la Ecuación 2 para eliminar la variable interna de la tensión T y obtener la expresión analítica general.',
        mathLatex:
          '(T - m_1 g \\sin\\theta - f_k) + (m_2 g - T) = m_1 a + m_2 a \\\\\nm_2 g - m_1 g \\sin\\theta - \\mu_k m_1 g \\cos\\theta = (m_1 + m_2) a \\\\\na = \\frac{m_2 g - m_1 g (\\sin\\theta + \\mu_k \\cos\\theta)}{m_1 + m_2} = g \\left[ \\frac{m_2 - m_1 (\\sin\\theta + \\mu_k \\cos\\theta)}{m_1 + m_2} \\right]',
        intermediateResult: 'a = 9.80 \\cdot \\frac{6.0 - 4.0(\\sin 30^\\circ + 0.20\\cos 30^\\circ)}{4.0 + 6.0}',
      },
      {
        stepNumber: 6,
        title: 'Sustitución Numérica y Cálculo de la Aceleración',
        explanation:
          'Evaluamos numéricamente con los valores dados: sin(30°) = 0.5000, cos(30°) = 0.8660.',
        mathLatex:
          '\\sin(30^\\circ) + \\mu_k \\cos(30^\\circ) = 0.5000 + 0.20(0.8660) = 0.6732 \\\\\na = 9.80 \\left[ \\frac{6.0 - 4.0(0.6732)}{10.0} \\right] = 9.80 \\left[ \\frac{6.0 - 2.6928}{10.0} \\right] = 9.80(0.3307) = 3.241\\text{ m/s}^2',
        intermediateResult: 'a \\approx 3.25\\text{ m/s}^2',
      },
      {
        stepNumber: 7,
        title: 'Despeje y Cálculo de la Tensión en la Cuerda (T)',
        explanation:
          'Sustituimos el valor de la aceleración obtenida en la Ecuación 2 del bloque suspendido para calcular la tensión.',
        mathLatex:
          'T = m_2 (g - a) = (6.0\\text{ kg})(9.80 - 3.241)\\text{ m/s}^2 = 6.0(6.559)\\text{ N} = 39.35\\text{ N}',
        intermediateResult: 'T \\approx 39.4\\text{ N}',
      },
    ],
    symbolicFormula:
      'a = g \\cdot \\frac{m_2 - m_1 (\\sin\\theta + \\mu_k \\cos\\theta)}{m_1 + m_2}, \\quad T = \\frac{m_1 m_2 g (1 + \\sin\\theta + \\mu_k \\cos\\theta)}{m_1 + m_2}',
    numericalSubstitution:
      'a = 9.80 \\cdot \\frac{6.0 - 4.0(0.50 + 0.20 \\cdot 0.866)}{4.0 + 6.0} = 3.24\\text{ m/s}^2 \\\\\nT = 6.0 \\cdot (9.80 - 3.24) = 39.36\\text{ N}',
    finalAnswers: [
      {
        symbol: 'a',
        name: 'Aceleración del sistema',
        value: '3.25',
        unit: 'm/s²',
        interpretation:
          'Al ser positiva (a > 0), confirma que la masa colgante m₂ tiene peso suficiente para vencer la componente gravitacional opuesta y el rozamiento, acelerando el sistema cuesta arriba.',
      },
      {
        symbol: 'T',
        name: 'Tensión en la cuerda',
        value: '39.4',
        unit: 'N',
        interpretation:
          'La tensión es inferior al peso de m₂ (P₂ = 58.8 N), lo cual es físicamente coherente ya que debe existir una fuerza neta hacia abajo para acelerar la masa descendente.',
      },
    ],
    physicalDiscussion:
      'Comprobación de casos límite:\n1. Si μₖ = 0 y θ = 0°: El sistema se reduce al caso horizontal ideal a = g · m₂ / (m₁ + m₂).\n2. Si m₁ = 0: a = g (caída libre del bloque 2) y T = 0.\n3. Condición de inicio de movimiento: Se requiere m₂ > m₁ (sin θ + μ_s cos θ). En este caso, 6.0 kg > 4.0(0.5 + 0.173) = 2.69 kg, por lo que el movimiento está ampliamente asegurado.',
    commonMistakesOrTips: [
      'No olvidar que la fuerza normal en un plano inclinado es N = m g cos(θ), NO m g.',
      'Recordar que la fricción cinética siempre se opone a la dirección del movimiento relativo entre las superficies en contacto.',
      'Alinear los sentidos positivos de aceleración para ambos cuerpos (si m₁ sube (+), m₂ baja (+)) para evitar contradicciones de signos en la aceleración común a.',
    ],
  },
  {
    id: 'sample-cinematica-parabolico',
    title: 'Tiro Parabólico desde un Acantilado',
    category: 'cinematica',
    difficulty: 'Intermedio',
    problemStatement:
      'Desde el borde de un acantilado de altura h = 45.0 m sobre el nivel del mar, se dispara un proyectil con una velocidad inicial v₀ = 25.0 m/s formando un ángulo θ = 37.0° por encima de la horizontal. Considerando g = 9.80 m/s² y despreciando la resistencia del aire, determine:\n1. El tiempo total de vuelo (t_vuelo) hasta que impacta en el agua.\n2. La distancia horizontal o alcance máximo (x_max) desde la base del acantilado.\n3. La velocidad de impacto (v_f) y su ángulo respecto a la horizontal.',
    createdAt: 1718000100000,
    knowns: [
      { symbol: 'h', name: 'Altura inicial del acantilado', value: '45.0 m', unit: 'm', notes: 'Posición vertical inicial y₀' },
      { symbol: 'v_0', name: 'Rapidez de disparo inicial', value: '25.0 m/s', unit: 'm/s', notes: 'Módulo del vector velocidad inicial' },
      { symbol: '\\theta', name: 'Ángulo de elevación inicial', value: '37.0°', unit: 'grados', notes: 'Ángulo con la horizontal' },
      { symbol: 'g', name: 'Aceleración de la gravedad', value: '9.80 m/s²', unit: 'm/s²', notes: 'Hacia abajo (-y)' },
    ],
    unknowns: [
      { symbol: 't_{\\text{vuelo}}', name: 'Tiempo total de vuelo', targetUnit: 's', calculatedValue: '4.91 s', notes: 'Instante en que y(t) = 0' },
      { symbol: 'x_{\\text{max}}', name: 'Alcance horizontal máximo', targetUnit: 'm', calculatedValue: '98.0 m', notes: 'Distancia x recorrida al tocar el mar' },
      { symbol: 'v_f', name: 'Módulo de la velocidad de impacto', targetUnit: 'm/s', calculatedValue: '38.8 m/s', notes: 'Magnitud de la velocidad final' },
      { symbol: '\\alpha_f', name: 'Ángulo de impacto final', targetUnit: 'grados', calculatedValue: '-59.0°', notes: 'Inclinación respecto al plano horizontal' },
    ],
    diagram: {
      title: 'Esquema de Trayectoria Balística Parabólica',
      description: 'Lanzamiento desde acantilado con vector velocidad inicial descompuesto (v₀x, v₀y), cota vertical h, altura máxima y alcance x_max.',
      viewBox: '0 0 720 400',
      svgCode: `<svg viewBox="0 0 720 400" class="w-full h-auto select-none font-sans" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cliffGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="waterGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0.6" />
    </linearGradient>
    <filter id="softGlow2" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25" />
    </filter>
    <marker id="arrGrn2" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#10b981" />
    </marker>
    <marker id="arrAmb2" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#f59e0b" />
    </marker>
    <marker id="arrRed2" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#f43f5e" />
    </marker>
    <marker id="arrAxis2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <polygon points="0 1, 5 3, 0 5" fill="#64748b" />
    </marker>
  </defs>

  <!-- Water Sea Level (y = 310) -->
  <rect x="0" y="310" width="720" height="90" fill="url(#waterGrad2)" />
  <line x1="0" y1="310" x2="720" y2="310" stroke="#0284c7" stroke-width="2.5" />
  <text x="690" y="330" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="end">Nivel del Mar (y = 0)</text>

  <!-- Cliff (x = 0 to 120, y = 140 to 310, height h = 45m) -->
  <polygon points="0,140 120,140 120,310 0,310" fill="url(#cliffGrad2)" stroke="#475569" stroke-width="2" filter="url(#softGlow2)" />
  <path d="M120,155 L110,165 M120,185 L105,200 M120,215 L108,227 M120,245 L106,259 M120,275 L112,283" stroke="#334155" stroke-width="2" />

  <!-- Global Coordinate Axes Origin at base of cliff (120, 310) -->
  <line x1="120" y1="310" x2="680" y2="310" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrAxis2)" />
  <text x="685" y="305" font-size="10" fill="#94a3b8" font-family="monospace">+x</text>
  <line x1="120" y1="310" x2="120" y2="40" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrAxis2)" />
  <text x="125" y="45" font-size="10" fill="#94a3b8" font-family="monospace">+y</text>

  <!-- Height dimension h = 45.0 m (Placed to the left of the cliff edge to avoid overlap) -->
  <line x1="45" y1="140" x2="45" y2="310" stroke="#10b981" stroke-width="2" marker-start="url(#arrGrn2)" marker-end="url(#arrGrn2)" />
  <g transform="translate(10, 215)">
    <rect width="70" height="22" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.2" />
    <text x="35" y="15" font-size="11" font-weight="bold" fill="#6ee7b7" text-anchor="middle">h = 45.0 m</text>
  </g>

  <!-- Launch Origin Point at (120, 140) -->
  <circle cx="120" cy="140" r="5" fill="#facc15" stroke="#ca8a04" stroke-width="2" />

  <!-- Initial Velocity Vector v0 (Angle θ = 37°, dx = 95, dy = -72 -> point at 215, 68) -->
  <line x1="120" y1="140" x2="215" y2="68" stroke="#10b981" stroke-width="3" marker-end="url(#arrGrn2)" />
  <g transform="translate(165, 40)">
    <rect width="112" height="24" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.5" />
    <text x="56" y="16" font-size="11" font-weight="bold" fill="#6ee7b7" text-anchor="middle">v₀ = 25.0 m/s</text>
  </g>

  <!-- Velocity Components Projections (v0x and v0y) -->
  <line x1="120" y1="140" x2="215" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" />
  <text x="175" y="154" font-size="10" font-weight="bold" fill="#94a3b8">v₀ₓ</text>
  <line x1="215" y1="140" x2="215" y2="68" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" />
  <text x="220" y="110" font-size="10" font-weight="bold" fill="#94a3b8">v₀ᵧ</text>

  <!-- Launch Angle Arc theta = 37° -->
  <path d="M165,140 A45,45 0 0,0 156,113" fill="none" stroke="#10b981" stroke-width="2" />
  <g transform="translate(162, 116)">
    <text x="0" y="0" font-size="10" font-weight="bold" fill="#10b981">θ = 37°</text>
  </g>

  <!-- Parabolic Trajectory Path: clean cubic Bezier -->
  <path d="M 120 140 Q 230 40, 310 80 T 570 310" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4" />

  <!-- Vertex / Max Height point (~ x = 270, y = 62) -->
  <circle cx="272" cy="62" r="4.5" fill="#38bdf8" />
  <g transform="translate(225, 18)">
    <rect width="94" height="20" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1" />
    <text x="47" y="14" font-size="10" font-weight="bold" fill="#7dd3fc" text-anchor="middle">Vértice (v_y = 0)</text>
  </g>

  <!-- Impact point in the sea (x = 570, y = 310) -->
  <circle cx="570" cy="310" r="6" fill="#f59e0b" stroke="#b45309" stroke-width="2" />
  
  <!-- Final Velocity vector vf at impact (pointing down-right at ~ -59°) -->
  <line x1="570" y1="310" x2="620" y2="380" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrAmb2)" />
  <g transform="translate(625, 345)">
    <rect width="82" height="22" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="1.2" />
    <text x="41" y="15" font-size="11" font-weight="bold" fill="#fde68a" text-anchor="middle">v_f = ?</text>
  </g>

  <!-- Horizontal Range Dimension (x_max from 120 to 570, at y = 365) -->
  <line x1="120" y1="365" x2="570" y2="365" stroke="#f59e0b" stroke-width="2" marker-start="url(#arrAmb2)" marker-end="url(#arrAmb2)" />
  <g transform="translate(300, 352)">
    <rect width="90" height="24" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="1.5" />
    <text x="45" y="16" font-size="11" font-weight="bold" fill="#fde68a" text-anchor="middle">x_max = ?</text>
  </g>

  <!-- Gravity vector g indicator -->
  <g transform="translate(420, 120)">
    <line x1="0" y1="0" x2="0" y2="35" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arrRed2)" />
    <text x="12" y="22" font-size="11" font-weight="bold" fill="#fb7185">g = 9.80 m/s²</text>
  </g>
</svg>`,
    },
    principles: [
      'Principio de Independencia de Movimientos de Galileo: el movimiento en el eje horizontal x es un Movimiento Rectilíneo Uniforme (MRU, aceleración nula a_x = 0), mientras que en el eje vertical y es un Movimiento Rectilíneo Uniformemente Variado (MRUV, aceleración a_y = -g).',
      'Ecuaciones paramétricas de posición y velocidad en función del tiempo t.',
    ],
    assumptions: [
      'Resistencia aerodinámica del aire nula.',
      'Aceleración de la gravedad constante y homogénea en todo el trayecto.',
      'Superficie terrestre considerada plana para el rango de alcance.',
    ],
    coordinateSystem:
      'Origen de coordenadas (0,0) en la base del acantilado al nivel del mar. Eje x positivo hacia la derecha. Eje y positivo hacia arriba. Posición inicial: x₀ = 0 m, y₀ = +45.0 m.',
    derivationSteps: [
      {
        stepNumber: 1,
        title: 'Descomposición de la Velocidad Inicial en Componentes Cartesianas',
        explanation:
          'Calculamos las componentes horizontal y vertical de la velocidad en el instante de disparo t = 0.',
        mathLatex:
          'v_{0x} = v_0 \\cos\\theta = (25.0\\text{ m/s})\\cos(37^\\circ) = 25.0(0.7986) = 19.965\\text{ m/s} \\\\\nv_{0y} = v_0 \\sin\\theta = (25.0\\text{ m/s})\\sin(37^\\circ) = 25.0(0.6018) = 15.045\\text{ m/s}',
        intermediateResult: 'v_{0x} \\approx 19.97\\text{ m/s}, \\quad v_{0y} \\approx 15.05\\text{ m/s}',
      },
      {
        stepNumber: 2,
        title: 'Ecuación Horaria Vertical y Cálculo del Tiempo de Vuelo',
        explanation:
          'La posición vertical en función del tiempo viene dada por y(t) = y₀ + v₀_y t - ½ g t². En el momento del impacto en el agua, y(t_vuelo) = 0.',
        mathLatex:
          '0 = 45.0 + 15.045 t - \\frac{1}{2}(9.80) t^2 \\\\\n4.90 t^2 - 15.045 t - 45.0 = 0',
      },
      {
        stepNumber: 3,
        title: 'Resolución de la Ecuación Cuadrática para el Tiempo de Vuelo',
        explanation:
          'Aplicamos la fórmula general de segundo grado y descartamos la raíz temporal negativa por carecer de sentido físico retrospectivo.',
        mathLatex:
          't = \\frac{-(-15.045) \\pm \\sqrt{(-15.045)^2 - 4(4.90)(-45.0)}}{2(4.90)} \\\\\nt = \\frac{15.045 \\pm \\sqrt{226.35 + 882.0}}{9.80} = \\frac{15.045 \\pm \\sqrt{1108.35}}{9.80} = \\frac{15.045 \\pm 33.29}{9.80}',
        intermediateResult: 't_{\\text{vuelo}} = \\frac{15.045 + 33.29}{9.80} = 4.932\\text{ s}',
      },
      {
        stepNumber: 4,
        title: 'Cálculo del Alcance Horizontal Máximo (x_max)',
        explanation:
          'Dado que no existe aceleración en el eje x, la velocidad horizontal permanece constante durante todo el vuelo.',
        mathLatex:
          'x_{\\text{max}} = v_{0x} \\cdot t_{\\text{vuelo}} = (19.965\\text{ m/s}) \\cdot (4.932\\text{ s}) = 98.47\\text{ m}',
        intermediateResult: 'x_{\\text{max}} \\approx 98.5\\text{ m}',
      },
      {
        stepNumber: 5,
        title: 'Cálculo de las Componentes de la Velocidad de Impacto',
        explanation:
          'La componente horizontal no cambia: v_fx = v_0x. La componente vertical se calcula con la aceleración gravitacional: v_fy = v_0y - g t_vuelo.',
        mathLatex:
          'v_{fx} = 19.97\\text{ m/s} \\\\\nv_{fy} = 15.05 - 9.80(4.932) = 15.05 - 48.33 = -33.28\\text{ m/s}',
        intermediateResult: 'v_{fx} = 19.97\\text{ m/s}, \\quad v_{fy} = -33.28\\text{ m/s}',
      },
      {
        stepNumber: 6,
        title: 'Módulo y Dirección del Vector Velocidad de Impacto',
        explanation:
          'Obtenemos el módulo mediante el teorema de Pitágoras y el ángulo mediante la función arcotangente.',
        mathLatex:
          'v_f = \\sqrt{v_{fx}^2 + v_{fy}^2} = \\sqrt{(19.97)^2 + (-33.28)^2} = \\sqrt{398.8 + 1107.6} = \\sqrt{1506.4} = 38.81\\text{ m/s} \\\\\n\\alpha_f = \\arctan\\left(\\frac{v_{fy}}{v_{fx}}\\right) = \\arctan\\left(\\frac{-33.28}{19.97}\\right) = -59.0^\\circ',
        intermediateResult: 'v_f \\approx 38.8\\text{ m/s}, \\quad \\alpha_f = -59.0^\\circ \\text{ (bajo la horizontal)}',
      },
    ],
    symbolicFormula:
      't_{\\text{vuelo}} = \\frac{v_0\\sin\\theta + \\sqrt{v_0^2\\sin^2\\theta + 2gh}}{g}, \\quad x_{\\text{max}} = v_0\\cos\\theta \\cdot t_{\\text{vuelo}}, \\quad v_f = \\sqrt{v_0^2 + 2gh}',
    numericalSubstitution:
      't = \\frac{15.05 + \\sqrt{15.05^2 + 2(9.80)(45.0)}}{9.80} = 4.93\\text{ s} \\\\\nx = 19.97 \\cdot 4.93 = 98.5\\text{ m} \\\\\nv_f = \\sqrt{25.0^2 + 2(9.80)(45.0)} = \\sqrt{625 + 882} = \\sqrt{1507} = 38.8\\text{ m/s}',
    finalAnswers: [
      {
        symbol: 't_{\\text{vuelo}}',
        name: 'Tiempo total de vuelo',
        value: '4.93',
        unit: 's',
        interpretation: 'El proyectil permanece en el aire casi 5 segundos debido a la ganancia de altura previa antes de caer hacia el fondo del acantilado.',
      },
      {
        symbol: 'x_{\\text{max}}',
        name: 'Alcance horizontal máximo',
        value: '98.5',
        unit: 'm',
        interpretation: 'Impacta casi a 100 metros de la base de la pared rocosa.',
      },
      {
        symbol: 'v_f',
        name: 'Velocidad de impacto final',
        value: '38.8',
        unit: 'm/s (139.7 km/h)',
        interpretation: 'Verificado por el Principio de Conservación de la Energía Mecánica: ½ m vf² = ½ m v₀² + m g h, lo cual confirma la exactitud exacta del resultado sin dependencia de la masa.',
      },
    ],
    physicalDiscussion:
      'Observación de conservación de energía: Nótese que la rapidez final v_f = √(v₀² + 2gh) es independiente del ángulo de disparo inicial θ. El ángulo θ determina la repartición entre el tiempo de vuelo y el alcance horizontal, pero la energía cinética final solo depende del desnivel vertical atravesado bajo un campo gravitacional conservativo.',
    commonMistakesOrTips: [
      'No usar la fórmula reducida del alcance x = v₀² sin(2θ) / g, ya que dicha fórmula es válida ÚNICAMENTE cuando el punto de salida y de llegada están a la misma altura (y = y₀ = 0).',
      'Prestar atención al signo de la posición final: si colocas el origen en lo alto del acantilado, y_final = -45 m; si colocas el origen en el mar, y_inicial = +45 m e y_final = 0 m.',
    ],
  },
  {
    id: 'sample-energia-pendulo',
    title: 'Péndulo Balístico: Colisión Inelástica y Conservación de Energía',
    category: 'impulso_momento',
    difficulty: 'Avanzado',
    problemStatement:
      'Una bala de masa m = 20.0 g (0.020 kg) se dispara horizontalmente con velocidad v₀ contra un bloque de madera suspendido de masa M = 3.98 kg, que pende de dos cuerdas inextensibles de longitud L = 1.60 m. La bala se incrusta instantáneamente en el bloque. Tras el choque, el conjunto (bloque + bala) oscila hacia arriba alcanzando una altura vertical máxima h = 12.0 cm (0.120 m). Considerando g = 9.80 m/s², determine:\n1. La velocidad conjunta V_c del sistema justo después del impacto.\n2. La velocidad inicial v₀ de la bala.\n3. La energía mecánica disipada en forma de calor y deformación durante el impacto.',
    createdAt: 1718000200000,
    knowns: [
      { symbol: 'm', name: 'Masa del proyectil (bala)', value: '0.020 kg (20 g)', unit: 'kg', notes: 'Masa pequeña pero de alta velocidad' },
      { symbol: 'M', name: 'Masa del bloque suspendido', value: '3.98 kg', unit: 'kg', notes: 'Masa objetivo en reposo' },
      { symbol: 'h', name: 'Altura máxima alcanzada', value: '0.120 m (12 cm)', unit: 'm', notes: 'Elevación vertical del centro de masa' },
      { symbol: 'g', name: 'Aceleración gravitacional', value: '9.80 m/s²', unit: 'm/s²', notes: 'Campo gravitatorio' },
    ],
    unknowns: [
      { symbol: 'V_c', name: 'Velocidad común tras la colisión', targetUnit: 'm/s', calculatedValue: '1.53 m/s', notes: 'Velocidad en el punto más bajo del péndulo' },
      { symbol: 'v_0', name: 'Velocidad inicial de la bala', targetUnit: 'm/s', calculatedValue: '306.8 m/s', notes: 'Rapidez de disparo del proyectil' },
      { symbol: '\\Delta E_k', name: 'Energía mecánica disipada', targetUnit: 'J', calculatedValue: '936.5 J', notes: 'Pérdida por deformación plástica y calor' },
    ],
    diagram: {
      title: 'Esquema Físico de las Fases del Péndulo Balístico',
      description: 'Fase 1: Aproximación de la bala (v₀, m); Fase 2: Choque inelástico (V_c, M+m); Fase 3: Ascenso pendular a altura h.',
      viewBox: '0 0 720 400',
      svgCode: `<svg viewBox="0 0 720 400" class="w-full h-auto select-none font-sans" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="softGlow3" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25" />
    </filter>
    <marker id="arrGrn3" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#10b981" />
    </marker>
    <marker id="arrAmb3" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#f59e0b" />
    </marker>
    <marker id="arrCyan3" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 1, 6 3.5, 0 6" fill="#38bdf8" />
    </marker>
  </defs>

  <!-- Rigid Ceiling Bar (y = 40) -->
  <line x1="120" y1="40" x2="600" y2="40" stroke="#475569" stroke-width="4" stroke-linecap="round" />
  <path d="M140,30 L160,40 M200,30 L220,40 M260,30 L280,40 M320,30 L340,40 M380,30 L400,40 M440,30 L460,40 M500,30 L520,40 M560,30 L580,40" stroke="#334155" stroke-width="2" />
  <circle cx="280" cy="40" r="5" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />

  <!-- Initial Vertical Suspension Cable (length L = 200px down to y = 240) -->
  <line x1="280" y1="40" x2="280" y2="235" stroke="#64748b" stroke-width="2.5" stroke-dasharray="5,3" />

  <!-- Block M at rest position (x = 240, y = 235, w = 80, h = 50) -->
  <g transform="translate(240, 235)">
    <rect width="80" height="50" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="2" filter="url(#softGlow3)" />
    <text x="40" y="24" font-size="12" font-weight="bold" fill="#e2e8f0" text-anchor="middle">M</text>
    <text x="40" y="38" font-size="10" font-medium fill="#94a3b8" text-anchor="middle">3.98 kg</text>
    <circle cx="40" cy="25" r="3" fill="#94a3b8" />
  </g>

  <!-- Incoming Bullet with unknown speed v0 (Left side: x = 50, y = 255) -->
  <g transform="translate(50, 255)">
    <rect width="20" height="10" rx="3" fill="#f43f5e" />
    <path d="M20,0 L27,5 L20,10 Z" fill="#f43f5e" />
  </g>
  <g transform="translate(42, 235)">
    <rect width="65" height="18" rx="4" fill="#4c0519" stroke="#f43f5e" stroke-width="1" />
    <text x="32" y="13" font-size="10" font-weight="bold" fill="#fecdd3" text-anchor="middle">m = 20 g</text>
  </g>

  <!-- Unknown initial velocity arrow v0 -->
  <line x1="82" y1="260" x2="185" y2="260" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrAmb3)" />
  <g transform="translate(100, 275)">
    <rect width="90" height="24" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="1.5" />
    <text x="45" y="16" font-size="11" font-weight="bold" fill="#fde68a" text-anchor="middle">v₀ = ? [m/s]</text>
  </g>

  <!-- Deflected Cable at maximum height (~ 28° angle to the right) -->
  <line x1="280" y1="40" x2="455" y2="185" stroke="#38bdf8" stroke-width="3" />

  <!-- Combined Block + Embedded Bullet at top position -->
  <g transform="translate(455, 185) rotate(-28)">
    <rect x="-40" y="0" width="80" height="50" rx="6" fill="#0369a1" stroke="#38bdf8" stroke-width="2" filter="url(#softGlow3)" />
    <!-- Embedded bullet inside block -->
    <circle cx="28" cy="25" r="4.5" fill="#f43f5e" />
    <text x="0" y="24" font-size="11" font-weight="bold" fill="#f0f9ff" text-anchor="middle">(M + m)</text>
    <text x="0" y="38" font-size="9" fill="#bae6fd" text-anchor="middle">4.00 kg</text>
    <text x="0" y="-8" font-size="10" font-weight="bold" fill="#7dd3fc" text-anchor="middle">v = 0 (Altura Máx)</text>
  </g>

  <!-- Oscillation Motion Arc -->
  <path d="M280,260 A210,210 0 0,0 450,218" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" />

  <!-- Horizontal Datum Reference line (y = 285) -->
  <line x1="210" y1="285" x2="570" y2="285" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3" />
  <text x="210" y="302" font-size="9" fill="#64748b" font-family="monospace">Nivel U = 0</text>

  <!-- Elevated Height Reference line (y = 225) -->
  <line x1="410" y1="225" x2="570" y2="225" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3" />

  <!-- Known Height Dimension h = 0.120 m (Clean spacing at x = 550) -->
  <line x1="550" y1="285" x2="550" y2="225" stroke="#10b981" stroke-width="2" marker-start="url(#arrGrn3)" marker-end="url(#arrGrn3)" />
  <g transform="translate(560, 243)">
    <rect width="90" height="24" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.5" />
    <text x="45" y="16" font-size="11" font-weight="bold" fill="#6ee7b7" text-anchor="middle">h = 0.120 m</text>
  </g>

  <!-- Post-Collision Common Velocity Vector V_c right after impact -->
  <line x1="280" y1="205" x2="360" y2="205" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrAmb3)" />
  <g transform="translate(305, 178)">
    <rect width="70" height="20" rx="4" fill="#451a03" stroke="#f59e0b" stroke-width="1.2" />
    <text x="35" y="14" font-size="10" font-weight="bold" fill="#fde68a" text-anchor="middle">V_c = ?</text>
  </g>
</svg>`,
    },
    principles: [
      'Fase 1 (Colisión Inelástica Instantánea): Conservación de la Cantidad de Movimiento Lineal (\\Sigma \\vec{p}_i = \\Sigma \\vec{p}_f) en el eje horizontal durante el brevísimo lapso de impacto.',
      'Fase 2 (Ascenso Gravitacional): Conservación de la Energía Mecánica (E_m = const.) una vez finalizada la colisión plástica, donde la energía cinética se transforma íntegramente en energía potencial gravitatoria.',
    ],
    assumptions: [
      'El tiempo de impacto entre la bala y el bloque es tan breve que la cuerda no se desvía apreciablemente de la vertical durante la colisión.',
      'Cuerdas inextensibles sin masa y sin rozamiento con el aire durante el balanceo.',
      'Choque perfectamente inelástico: los cuerpos quedan rígidamente unidos.',
    ],
    coordinateSystem:
      'Eje x horizontal en el sentido de disparo de la bala; eje y vertical hacia arriba. Origen de energía potencial gravitacional (U = 0) fijado en el centro de masa del bloque en su posición de reposo más baja.',
    derivationSteps: [
      {
        stepNumber: 1,
        title: 'Análisis del Ascenso Pendular: Conservación de la Energía Mecánica',
        explanation:
          'Inmediatamente después de la colisión, el conjunto de masa total (M + m) posee una energía cinética puramente horizontal con rapidez V_c. Al subir hasta la altura máxima h, toda la energía cinética se convierte en energía potencial gravitatoria.',
        mathLatex:
          'E_{k,\\text{post}} = U_{\\text{máx}} \\\\\n\\frac{1}{2}(M + m) V_c^2 = (M + m) g h',
      },
      {
        stepNumber: 2,
        title: 'Despeje de la Velocidad Conjunta (V_c)',
        explanation:
          'Cancelamos la masa total (M + m) a ambos lados de la igualdad y despejamos la velocidad común inmediatamente posterior al impacto.',
        mathLatex:
          'V_c = \\sqrt{2gh} = \\sqrt{2 \\cdot (9.80\\text{ m/s}^2) \\cdot (0.120\\text{ m})} = \\sqrt{2.352} = 1.5336\\text{ m/s}',
        intermediateResult: 'V_c \\approx 1.53\\text{ m/s}',
      },
      {
        stepNumber: 3,
        title: 'Análisis del Impacto: Conservación del Momento Lineal',
        explanation:
          'Durante la colisión, las fuerzas externas netas en el eje horizontal son nulas (la tensión de la cuerda es puramente vertical en ese instante). Por tanto, el momento lineal se conserva estrictamente.',
        mathLatex:
          'p_{x,\\text{inicial}} = p_{x,\\text{final}} \\\\\nm v_0 + M(0) = (M + m) V_c',
      },
      {
        stepNumber: 4,
        title: 'Despeje y Cálculo de la Velocidad Inicial del Proyectil (v₀)',
        explanation:
          'Despejamos la velocidad inicial del proyectil v₀ en función de las masas y de la velocidad conjunta V_c.',
        mathLatex:
          'v_0 = \\left(\\frac{M + m}{m}\\right) V_c = \\left(1 + \\frac{M}{m}\\right) \\sqrt{2gh} \\\\\nv_0 = \\left(\\frac{3.98 + 0.020}{0.020}\\right)(1.5336\\text{ m/s}) = \\left(\\frac{4.000}{0.020}\\right)(1.5336) = 200 \\cdot 1.5336 = 306.72\\text{ m/s}',
        intermediateResult: 'v_0 \\approx 306.7\\text{ m/s}',
      },
      {
        stepNumber: 5,
        title: 'Cálculo de la Energía Cinética Inicial y Final (Disipación)',
        explanation:
          'Calculamos la energía cinética inicial de la bala antes del impacto y la comparamos con la energía mecánica disponible tras el choque.',
        mathLatex:
          'E_{k,\\text{inicial}} = \\frac{1}{2} m v_0^2 = \\frac{1}{2}(0.020\\text{ kg})(306.72\\text{ m/s})^2 = 0.010(94077) = 940.8\\text{ J} \\\\\nE_{k,\\text{post}} = \\frac{1}{2}(M + m) V_c^2 = \\frac{1}{2}(4.000\\text{ kg})(1.5336\\text{ m/s})^2 = 2.0(2.352) = 4.70\\text{ J} \\\\\n\\Delta E = E_{k,\\text{inicial}} - E_{k,\\text{post}} = 940.8 - 4.7 = 936.1\\text{ J}',
        intermediateResult: '\\Delta E_{\\text{disipada}} \\approx 936.1\\text{ J} \\quad (99.5\\% \\text{ de pérdida})',
      },
    ],
    symbolicFormula:
      'v_0 = \\frac{M + m}{m} \\sqrt{2gh}, \\quad V_c = \\sqrt{2gh}, \\quad \\Delta E_{\\text{disipada}} = \\frac{1}{2} m v_0^2 \\left(1 - \\frac{m}{M+m}\\right)',
    numericalSubstitution:
      'V_c = \\sqrt{2(9.80)(0.120)} = 1.534\\text{ m/s} \\\\\nv_0 = \\frac{4.00}{0.020} \\cdot 1.534 = 306.7\\text{ m/s}',
    finalAnswers: [
      {
        symbol: 'V_c',
        name: 'Velocidad común tras el choque',
        value: '1.53',
        unit: 'm/s',
        interpretation: 'Velocidad con la que el bloque de 4 kg arranca su trayectoria pendular en el punto más bajo.',
      },
      {
        symbol: 'v_0',
        name: 'Velocidad inicial de la bala',
        value: '306.7',
        unit: 'm/s (1104 km/h)',
        interpretation: 'Corresponde a la velocidad típica de salida de una pistola de calibre mediano (cercana a la velocidad del sonido en el aire, ~343 m/s).',
      },
      {
        symbol: '\\Delta E_k',
        name: 'Energía disipada',
        value: '936.1',
        unit: 'J (99.5%)',
        interpretation: 'El 99.5% de la energía cinética inicial se transforma en calor, ruido y energía de deformación permanente de la madera y el plomo.',
      },
    ],
    physicalDiscussion:
      '¿Por qué NO se puede aplicar conservación de la energía mecánica desde el inicio hasta el final directo?\nPorque la colisión es plástica/inelástica. Durante el impacto intermolecular, actúan fuerzas no conservativas de gran magnitud que disipan casi toda la energía cinética. Por ello, es imperativo separar el problema en dos etapas físicas diferenciadas: 1) momento lineal durante el impacto y 2) energía mecánica durante la oscilación.',
    commonMistakesOrTips: [
      'Error muy común: intentar igualar ½ m v₀² = (M+m) g h. ¡Nunca hagas esto en un choque inelástico!',
      'Recordar pasar la masa de la bala a kilogramos (20 g = 0.020 kg) y la altura a metros (12 cm = 0.120 m).',
    ],
  },
];
