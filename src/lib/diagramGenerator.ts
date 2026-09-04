import { KnownQuantity, UnknownQuantity } from '../types';

interface DiagramGeneratorInput {
  title?: string;
  category?: string;
  problemStatement?: string;
  knowns?: KnownQuantity[];
  unknowns?: UnknownQuantity[];
}

/**
 * Escapes HTML characters for safe inclusion inside SVG text tags.
 */
function esc(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parses numeric value and units from strings like "30°", "4.0 kg", "20 N", "9.8 m/s²".
 */
function extractValue(valStr: string | undefined): number | null {
  if (!valStr) return null;
  const match = valStr.match(/[-+]?[0-9]*\.?[0-9]+/);
  return match ? parseFloat(match[0]) : null;
}

/**
 * Detects the specific physical scenario from problem statement, category, and variables.
 */
function detectScenario(statement: string, category: string): string {
  const text = (statement + ' ' + category).toLowerCase();

  if (text.includes('plano inclinado') || text.includes('rampa') || text.includes('inclinad')) {
    return 'plano_inclinado';
  }
  if (
    text.includes('polea') ||
    text.includes('atwood') ||
    text.includes('cuerda que pasa por') ||
    text.includes('masa colgante')
  ) {
    return 'poleas';
  }
  if (
    text.includes('tiro') ||
    text.includes('proyectil') ||
    text.includes('parabólico') ||
    text.includes('parabolico') ||
    text.includes('lanzamiento')
  ) {
    return 'proyectil';
  }
  if (
    text.includes('resorte') ||
    text.includes('muelle') ||
    text.includes('armónico') ||
    text.includes('hooke') ||
    text.includes('oscila')
  ) {
    return 'resorte';
  }
  if (
    text.includes('circular') ||
    text.includes('centrípeta') ||
    text.includes('centripeta') ||
    text.includes('órbita') ||
    text.includes('curvatura') ||
    text.includes('giro')
  ) {
    return 'circular';
  }
  if (
    text.includes('choque') ||
    text.includes('colisión') ||
    text.includes('colision') ||
    text.includes('momento lineal') ||
    text.includes('cantidad de movimiento')
  ) {
    return 'colision';
  }
  if (
    text.includes('energía') ||
    text.includes('energia') ||
    text.includes('trabajo') ||
    text.includes('conservación') ||
    text.includes('potencial') ||
    text.includes('cinética')
  ) {
    return 'energia';
  }
  if (
    text.includes('fluido') ||
    text.includes('presión') ||
    text.includes('densidad') ||
    text.includes('empuje') ||
    text.includes('arquímedes') ||
    text.includes('vaso') ||
    text.includes('émbolo')
  ) {
    return 'fluidos';
  }
  if (
    text.includes('aceleración') ||
    text.includes('fuerza') ||
    text.includes('fricción') ||
    text.includes('rozamiento') ||
    text.includes('newton') ||
    category === 'dinamica'
  ) {
    return 'dinamica_horizontal';
  }
  if (
    text.includes('esfera') ||
    text.includes('carga') ||
    text.includes('coulomb') ||
    text.includes('eléctrico') ||
    text.includes('electrico') ||
    text.includes('campo') ||
    text.includes('potencial') ||
    text.includes('gauss') ||
    text.includes('atracción') ||
    text.includes('repulsión') ||
    category === 'electromagnetismo'
  ) {
    return 'electromagnetismo';
  }

  if (
    text.includes('velocidad') ||
    text.includes('distancia') ||
    text.includes('tiempo') ||
    category === 'cinematica'
  ) {
    return 'cinematica_1d';
  }

  return 'dcl_universal';
}

/**
 * Generates an engineering-grade SVG Diagram (viewBox 0 0 720 400) for a given physics problem.
 */
export function generatePhysicsDiagramSVG(input: DiagramGeneratorInput): string {
  const statement = input.problemStatement || '';
  const category = input.category || 'dinamica';
  const knowns = input.knowns || [];
  const unknowns = input.unknowns || [];
  const scenario = detectScenario(statement, category);

  // Common SVG Definitions (Gradients, Arrow markers, filters)
  const defs = `
  <defs>
    <linearGradient id="engBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="blockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="bodyAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3" />
    </filter>
    
    <!-- Markers for Vectors -->
    <marker id="mGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 1.5, 7 4, 0 6.5" fill="#10b981" />
    </marker>
    <marker id="mAmber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 1.5, 7 4, 0 6.5" fill="#f59e0b" />
    </marker>
    <marker id="mIndigo" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 1.5, 7 4, 0 6.5" fill="#818cf8" />
    </marker>
    <marker id="mCyan" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 1.5, 7 4, 0 6.5" fill="#38bdf8" />
    </marker>
    <marker id="mRose" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 1.5, 7 4, 0 6.5" fill="#f43f5e" />
    </marker>
    <marker id="mYellow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 1.5, 7 4, 0 6.5" fill="#facc15" />
    </marker>
  </defs>`;

  // Engineering Background & Millimeter Grid
  const background = `
  <!-- Canvas Background & Grid -->
  <rect width="720" height="400" fill="#090d16" />
  <g opacity="0.12">
    <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94a3b8" stroke-width="0.7" />
    </pattern>
    <rect width="720" height="400" fill="url(#gridPattern)" />
  </g>`;

  // Badges for knowns and unknowns
  let badgesGroup = `<g transform="translate(20, 20)">`;
  let badgeX = 0;
  let badgeY = 0;

  // Knowns (Green pills)
  knowns.slice(0, 4).forEach((k) => {
    const textStr = `${k.symbol || ''} = ${k.value}`;
    const width = Math.max(textStr.length * 7.5 + 24, 80);
    badgesGroup += `
      <g transform="translate(${badgeX}, ${badgeY})">
        <rect width="${width}" height="24" rx="12" fill="#064e3b" stroke="#10b981" stroke-width="1.2" opacity="0.95" />
        <circle cx="12" cy="12" r="3.5" fill="#34d399" />
        <text x="${22}" y="16" font-size="11" font-weight="600" fill="#6ee7b7" font-family="system-ui, sans-serif">${esc(textStr)}</text>
      </g>`;
    badgeX += width + 10;
    if (badgeX > 450) {
      badgeX = 0;
      badgeY += 30;
    }
  });

  // Unknowns (Amber pills with ?)
  unknowns.slice(0, 3).forEach((u) => {
    const textStr = `${u.symbol || 'incógnita'} = ? [${u.targetUnit || ''}]`;
    const width = Math.max(textStr.length * 7.5 + 24, 85);
    badgesGroup += `
      <g transform="translate(${badgeX}, ${badgeY})">
        <rect width="${width}" height="24" rx="12" fill="#78350f" stroke="#f59e0b" stroke-width="1.2" opacity="0.95" />
        <circle cx="12" cy="12" r="3.5" fill="#fde68a" />
        <text x="${22}" y="16" font-size="11" font-weight="700" fill="#fde68a" font-family="system-ui, sans-serif">${esc(textStr)}</text>
      </g>`;
    badgeX += width + 10;
  });
  badgesGroup += `</g>`;

  let scenarioContent = '';

  switch (scenario) {
    case 'plano_inclinado': {
      // Find theta if specified
      const thetaObj = knowns.find((k) => k.symbol.includes('theta') || k.symbol.includes('θ') || k.value.includes('°'));
      const thetaVal = thetaObj ? thetaObj.value : '30°';
      const mObj = knowns.find((k) => k.symbol.includes('m') || k.name.toLowerCase().includes('masa'));
      const mVal = mObj ? mObj.value : 'm';

      scenarioContent = `
      <!-- Plano Inclinado Wedge -->
      <polygon points="60,330 460,330 460,130" fill="url(#engBlueGrad)" stroke="#38bdf8" stroke-width="2.5" filter="url(#softShadow)" />
      
      <!-- Surface Hatching -->
      <line x1="40" y1="330" x2="680" y2="330" stroke="#475569" stroke-width="2" />
      <path d="M50,335 L40,345 M100,335 L90,345 M150,335 L140,345 M200,335 L190,345 M250,335 L240,345 M300,335 L290,345 M350,335 L340,345 M400,335 L390,345 M450,335 L440,345" stroke="#334155" stroke-width="1.5" />

      <!-- Angle Arc -->
      <path d="M130,330 A70,70 0 0,0 122,298" fill="none" stroke="#10b981" stroke-width="2.5" />
      <g transform="translate(135, 290)">
        <rect width="64" height="20" rx="10" fill="#064e3b" stroke="#10b981" stroke-width="1.2" />
        <text x="32" y="14" font-size="11" font-weight="bold" fill="#6ee7b7" text-anchor="middle" font-family="system-ui">θ = ${esc(thetaVal)}</text>
      </g>

      <!-- Block on the Incline (rotated 26.5 deg) -->
      <g transform="translate(260, 230) rotate(-26.5)">
        <rect x="-35" y="-35" width="70" height="50" rx="6" fill="url(#blockGrad)" stroke="#93c5fd" stroke-width="2" filter="url(#softShadow)" />
        <circle cx="0" cy="-10" r="4.5" fill="#facc15" />
        <text x="0" y="-7" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="system-ui">${esc(mVal)}</text>

        <!-- DCL Forces relative to ramp axes -->
        <!-- Normal Force N (perpendicular up) -->
        <line x1="0" y1="-10" x2="0" y2="-90" stroke="#34d399" stroke-width="2.5" marker-end="url(#mGreen)" />
        <text x="12" y="-75" font-size="12" font-weight="bold" fill="#34d399" font-family="system-ui">N⃗</text>

        <!-- Friction Force fk (parallel up-ramp) -->
        <line x1="0" y1="-10" x2="70" y2="-10" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#mRose)" />
        <text x="65" y="-22" font-size="11" font-weight="bold" fill="#f43f5e" font-family="system-ui">f⃗ᵣ</text>

        <!-- Acceleration arrow -->
        <line x1="20" y1="28" x2="-60" y2="28" stroke="#facc15" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#mYellow)" />
        <text x="-30" y="44" font-size="11" font-weight="bold" fill="#facc15" font-family="system-ui">a⃗ (?)</text>
      </g>

      <!-- Weight Vector W = mg (straight down) -->
      <g transform="translate(260, 230)">
        <line x1="0" y1="0" x2="0" y2="90" stroke="#38bdf8" stroke-width="3" marker-end="url(#mCyan)" />
        <text x="10" y="70" font-size="12" font-weight="bold" fill="#38bdf8" font-family="system-ui">P⃗ = m·g</text>

        <!-- Decomposition dashed guides -->
        <line x1="0" y1="90" x2="-38" y2="76" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" />
        <line x1="0" y1="90" x2="38" y2="14" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" />
      </g>

      <!-- Pulley and hanging mass if detected -->
      <g transform="translate(460, 130)">
        <circle cx="0" cy="0" r="16" fill="#475569" stroke="#94a3b8" stroke-width="2" />
        <circle cx="0" cy="0" r="4" fill="#f8fafc" />
        <!-- Rope to block -->
        <line x1="-16" y1="0" x2="-180" y2="86" stroke="#fbbf24" stroke-width="2.5" />
        <!-- Rope to hanging mass -->
        <line x1="16" y1="0" x2="16" y2="100" stroke="#fbbf24" stroke-width="2.5" />
        <g transform="translate(16, 100)">
          <rect x="-20" y="0" width="40" height="40" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
          <text x="0" y="24" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="system-ui">m₂</text>
          <!-- Tension T upward -->
          <line x1="0" y1="0" x2="0" y2="-40" stroke="#818cf8" stroke-width="2.5" marker-end="url(#mIndigo)" />
          <text x="8" y="-20" font-size="11" font-weight="bold" fill="#818cf8" font-family="system-ui">T⃗</text>
          <!-- Weight P2 downward -->
          <line x1="0" y1="40" x2="0" y2="80" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#mCyan)" />
          <text x="8" y="70" font-size="11" font-weight="bold" fill="#38bdf8" font-family="system-ui">P₂ = m₂·g</text>
        </g>
      </g>`;
      break;
    }

    case 'poleas': {
      scenarioContent = `
      <!-- Pulley Support Ceiling -->
      <rect x="260" y="50" width="200" height="15" fill="#334155" stroke="#64748b" stroke-width="1.5" />
      <line x1="360" y1="65" x2="360" y2="110" stroke="#94a3b8" stroke-width="4" />
      
      <!-- Pulley Wheel -->
      <circle cx="360" cy="130" r="32" fill="#1e293b" stroke="#38bdf8" stroke-width="3" filter="url(#softShadow)" />
      <circle cx="360" cy="130" r="6" fill="#facc15" />
      <line x1="335" y1="130" x2="385" y2="130" stroke="#475569" stroke-width="2" />
      <line x1="360" y1="105" x2="360" y2="155" stroke="#475569" stroke-width="2" />

      <!-- Cable -->
      <path d="M 328,130 L 328,230" stroke="#fbbf24" stroke-width="3" />
      <path d="M 392,130 L 392,270" stroke="#fbbf24" stroke-width="3" />

      <!-- Mass 1 (Left) -->
      <g transform="translate(328, 230)">
        <rect x="-28" y="0" width="56" height="46" rx="6" fill="url(#blockGrad)" stroke="#60a5fa" stroke-width="2" filter="url(#softShadow)" />
        <circle cx="0" cy="23" r="4" fill="#facc15" />
        <text x="0" y="27" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">m₁</text>
        <!-- Tension Upward -->
        <line x1="0" y1="0" x2="0" y2="-60" stroke="#818cf8" stroke-width="2.5" marker-end="url(#mIndigo)" />
        <text x="8" y="-35" font-size="12" font-weight="bold" fill="#818cf8">T⃗</text>
        <!-- Weight Downward -->
        <line x1="0" y1="46" x2="0" y2="105" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#mCyan)" />
        <text x="8" y="85" font-size="12" font-weight="bold" fill="#38bdf8">P₁ = m₁·g</text>
        <!-- Acceleration arrow -->
        <line x1="-38" y1="40" x2="-38" y2="-10" stroke="#facc15" stroke-width="2.5" marker-end="url(#mYellow)" />
        <text x="-52" y="20" font-size="12" font-weight="bold" fill="#facc15">a⃗</text>
      </g>

      <!-- Mass 2 (Right) -->
      <g transform="translate(392, 270)">
        <rect x="-32" y="0" width="64" height="54" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="2" filter="url(#softShadow)" />
        <circle cx="0" cy="27" r="4" fill="#facc15" />
        <text x="0" y="32" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">m₂</text>
        <!-- Tension Upward -->
        <line x1="0" y1="0" x2="0" y2="-60" stroke="#818cf8" stroke-width="2.5" marker-end="url(#mIndigo)" />
        <text x="10" y="-35" font-size="12" font-weight="bold" fill="#818cf8">T⃗</text>
        <!-- Weight Downward -->
        <line x1="0" y1="54" x2="0" y2="115" stroke="#38bdf8" stroke-width="3" marker-end="url(#mCyan)" />
        <text x="10" y="95" font-size="12" font-weight="bold" fill="#38bdf8">P₂ = m₂·g</text>
        <!-- Acceleration arrow -->
        <line x1="42" y1="0" x2="42" y2="50" stroke="#facc15" stroke-width="2.5" marker-end="url(#mYellow)" />
        <text x="50" y="30" font-size="12" font-weight="bold" fill="#facc15">a⃗</text>
      </g>`;
      break;
    }

    case 'proyectil': {
      scenarioContent = `
      <!-- Ground line -->
      <line x1="60" y1="330" x2="660" y2="330" stroke="#475569" stroke-width="2.5" />
      <path d="M70,335 L60,345 M130,335 L120,345 M190,335 L180,345 M250,335 L240,345 M310,335 L300,345 M370,335 L360,345 M430,335 L420,345 M490,335 L480,345 M550,335 L540,345 M610,335 L600,345" stroke="#334155" stroke-width="1.5" />

      <!-- Parabolic Trajectory -->
      <path d="M 120,330 Q 360,90 600,330" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 4" />
      
      <!-- Launch Point (120, 330) -->
      <circle cx="120" cy="330" r="7" fill="#facc15" stroke="#ffffff" stroke-width="2" />
      <line x1="120" y1="330" x2="210" y2="240" stroke="#818cf8" stroke-width="3" marker-end="url(#mIndigo)" />
      <text x="215" y="235" font-size="13" font-weight="bold" fill="#818cf8">v⃗₀</text>

      <!-- Components v0x & v0y -->
      <line x1="120" y1="330" x2="190" y2="330" stroke="#10b981" stroke-width="2" marker-end="url(#mGreen)" />
      <text x="150" y="350" font-size="11" font-weight="bold" fill="#10b981">v₀ₓ = v₀·cosθ</text>
      <line x1="120" y1="330" x2="120" y2="260" stroke="#10b981" stroke-width="2" marker-end="url(#mGreen)" />
      <text x="70" y="290" font-size="11" font-weight="bold" fill="#10b981">v₀ᵧ</text>

      <!-- Launch Angle Theta Arc -->
      <path d="M 160,330 A 40,40 0 0,0 152,302" fill="none" stroke="#fbbf24" stroke-width="2" />
      <text x="166" y="316" font-size="11" font-weight="bold" fill="#fbbf24">θ</text>

      <!-- Apex Point (Peak Height H) -->
      <circle cx="360" cy="150" r="6" fill="#f43f5e" />
      <line x1="360" y1="150" x2="430" y2="150" stroke="#818cf8" stroke-width="2" marker-end="url(#mIndigo)" />
      <text x="435" y="154" font-size="11" font-weight="bold" fill="#818cf8">v⃗ₓ = v₀ₓ</text>
      <!-- Height Dimension H -->
      <line x1="360" y1="150" x2="360" y2="330" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" />
      <g transform="translate(365, 230)">
        <rect width="60" height="22" rx="11" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.2" />
        <text x="30" y="15" font-size="11" font-weight="bold" fill="#c7d2fe" text-anchor="middle">H = ?</text>
      </g>

      <!-- Gravity Vector g -->
      <g transform="translate(480, 150)">
        <line x1="0" y1="0" x2="0" y2="50" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#mCyan)" />
        <text x="10" y="30" font-size="12" font-weight="bold" fill="#38bdf8">g⃗ = 9.8 m/s²</text>
      </g>

      <!-- Total Range Dimension R -->
      <line x1="120" y1="365" x2="600" y2="365" stroke="#f59e0b" stroke-width="1.5" marker-start="url(#mAmber)" marker-end="url(#mAmber)" />
      <g transform="translate(320, 355)">
        <rect width="80" height="22" rx="11" fill="#78350f" stroke="#f59e0b" stroke-width="1.2" />
        <text x="40" y="15" font-size="11" font-weight="bold" fill="#fde68a" text-anchor="middle">Alcance R = ?</text>
      </g>`;
      break;
    }

    case 'resorte': {
      scenarioContent = `
      <!-- Fixed Wall -->
      <rect x="60" y="120" width="20" height="200" fill="#334155" stroke="#64748b" stroke-width="2" />
      <path d="M60,140 L45,155 M60,180 L45,195 M60,220 L45,235 M60,260 L45,275 M60,300 L45,315" stroke="#475569" stroke-width="2" />

      <!-- Floor -->
      <line x1="60" y1="320" x2="660" y2="320" stroke="#475569" stroke-width="2.5" />

      <!-- Spring Coils -->
      <path d="M 80,260 L 120,260 L 135,235 L 155,285 L 175,235 L 195,285 L 215,235 L 235,285 L 255,235 L 275,285 L 295,235 L 310,260 L 330,260" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
      <text x="195" y="215" font-size="12" font-weight="bold" fill="#38bdf8" text-anchor="middle">Constante k</text>

      <!-- Mass Block -->
      <g transform="translate(330, 220)">
        <rect x="0" y="0" width="80" height="80" rx="8" fill="url(#blockGrad)" stroke="#60a5fa" stroke-width="2" filter="url(#softShadow)" />
        <circle cx="40" cy="40" r="5" fill="#facc15" />
        <text x="40" y="45" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">m</text>

        <!-- Restoring Force Vector -->
        <line x1="40" y1="40" x2="-45" y2="40" stroke="#f43f5e" stroke-width="3" marker-end="url(#mRose)" />
        <text x="-40" y="25" font-size="12" font-weight="bold" fill="#f43f5e">F⃗ₑ = -k·x</text>

        <!-- Normal & Weight -->
        <line x1="40" y1="40" x2="40" y2="-30" stroke="#34d399" stroke-width="2.5" marker-end="url(#mGreen)" />
        <text x="48" y="-15" font-size="11" font-weight="bold" fill="#34d399">N⃗</text>
        <line x1="40" y1="40" x2="40" y2="110" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#mCyan)" />
        <text x="48" y="95" font-size="11" font-weight="bold" fill="#38bdf8">P⃗ = m·g</text>
      </g>

      <!-- Equilibrium position line x = 0 -->
      <line x1="280" y1="180" x2="280" y2="340" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" />
      <text x="280" y="170" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">x = 0 (Equilibrio)</text>

      <!-- Displacement x -->
      <line x1="280" y1="345" x2="370" y2="345" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#mAmber)" />
      <text x="325" y="365" font-size="12" font-weight="bold" fill="#fde68a" text-anchor="middle">Elongación Δx = ?</text>`;
      break;
    }

    case 'circular': {
      scenarioContent = `
      <!-- Center Pivot -->
      <circle cx="360" cy="240" r="8" fill="#facc15" stroke="#ffffff" stroke-width="2" />
      <text x="360" y="270" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="middle">Centro (O)</text>

      <!-- Orbit Path -->
      <circle cx="360" cy="240" r="140" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 5" opacity="0.7" />

      <!-- Radius Dimension -->
      <line x1="360" y1="240" x2="500" y2="240" stroke="#fbbf24" stroke-width="2" />
      <text x="430" y="230" font-size="12" font-weight="bold" fill="#fbbf24">Radio R</text>

      <!-- Body at top or angle -->
      <g transform="translate(459, 141)">
        <circle cx="0" cy="0" r="18" fill="url(#blockGrad)" stroke="#93c5fd" stroke-width="2" filter="url(#softShadow)" />
        <circle cx="0" cy="0" r="3.5" fill="#facc15" />
        <text x="0" y="4" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">m</text>

        <!-- Tangential velocity v -->
        <line x1="0" y1="0" x2="-60" y2="-60" stroke="#10b981" stroke-width="3" marker-end="url(#mGreen)" />
        <text x="-65" y="-65" font-size="12" font-weight="bold" fill="#10b981">v⃗ (tangencial)</text>

        <!-- Centripetal acceleration / force ac pointing to center -->
        <line x1="0" y1="0" x2="-70" y2="70" stroke="#f43f5e" stroke-width="3" marker-end="url(#mRose)" />
        <text x="-40" y="35" font-size="12" font-weight="bold" fill="#f43f5e">F⃗_c = m·a_c</text>
      </g>`;
      break;
    }

    case 'electromagnetismo': {
      scenarioContent = `
      <!-- Electric Field Background Lines -->
      <g stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.4">
        <line x1="360" y1="200" x2="180" y2="100" />
        <line x1="360" y1="200" x2="540" y2="100" />
        <line x1="360" y1="200" x2="160" y2="200" />
        <line x1="360" y1="200" x2="560" y2="200" />
        <line x1="360" y1="200" x2="200" y2="300" />
        <line x1="360" y1="200" x2="520" y2="300" />
      </g>

      <!-- Spherical Conductor / Charge Q at center -->
      <g transform="translate(360, 200)">
        <circle cx="0" cy="0" r="55" fill="url(#blockGrad)" stroke="#60a5fa" stroke-width="3" filter="url(#softShadow)" />
        <circle cx="0" cy="0" r="48" fill="none" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="3 3" />
        <text x="-22" y="-12" font-size="14" font-weight="bold" fill="#facc15">+</text>
        <text x="12" y="-15" font-size="14" font-weight="bold" fill="#facc15">+</text>
        <text x="-25" y="18" font-size="14" font-weight="bold" fill="#facc15">+</text>
        <text x="15" y="20" font-size="14" font-weight="bold" fill="#facc15">+</text>
        <text x="0" y="4" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">Q, Radio R</text>

        <!-- Radius line -->
        <line x1="0" y1="0" x2="38" y2="38" stroke="#fbbf24" stroke-width="2.5" />
        <circle cx="38" cy="38" r="3" fill="#fbbf24" />
        <text x="45" y="52" font-size="12" font-weight="bold" fill="#fbbf24">R</text>

        <!-- Electric Field vector E -->
        <line x1="65" y1="0" x2="135" y2="0" stroke="#34d399" stroke-width="3" marker-end="url(#mGreen)" />
        <text x="75" y="-12" font-size="12" font-weight="bold" fill="#34d399">E⃗ (Campo)</text>
      </g>

      <!-- External Test Charge q (Attraction / Repulsion Force) -->
      <g transform="translate(560, 200)">
        <circle cx="0" cy="0" r="22" fill="#f43f5e" stroke="#fda4af" stroke-width="2.5" filter="url(#softShadow)" />
        <text x="0" y="5" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">q</text>
        <line x1="-22" y1="0" x2="-80" y2="0" stroke="#facc15" stroke-width="3.5" marker-end="url(#mYellow)" />
        <text x="-75" y="-12" font-size="12" font-weight="bold" fill="#facc15">F⃗_e (Fuerza Eléctrica)</text>
      </g>`;
      break;
    }

    case 'dinamica_horizontal':
    default: {
      // General horizontal block with forces, friction, normal, weight, acceleration
      scenarioContent = `
      <!-- Horizontal Surface Floor -->
      <line x1="80" y1="310" x2="640" y2="310" stroke="#475569" stroke-width="2.5" />
      <path d="M90,315 L80,325 M150,315 L140,325 M210,315 L200,325 M270,315 L260,325 M330,315 L320,325 M390,315 L380,325 M450,315 L440,325 M510,315 L500,325 M570,315 L560,325 M630,315 L620,325" stroke="#334155" stroke-width="1.5" />

      <!-- Coordinate Axes (+x, +y) in top corner -->
      <g transform="translate(80, 110)">
        <line x1="0" y1="40" x2="0" y2="-20" stroke="#94a3b8" stroke-width="2" marker-end="url(#mIndigo)" />
        <text x="-12" y="-12" font-size="11" font-weight="bold" fill="#94a3b8">+y</text>
        <line x1="0" y1="40" x2="60" y2="40" stroke="#94a3b8" stroke-width="2" marker-end="url(#mIndigo)" />
        <text x="65" y="44" font-size="11" font-weight="bold" fill="#94a3b8">+x</text>
        <circle cx="0" cy="40" r="3" fill="#94a3b8" />
      </g>

      <!-- Block on horizontal floor -->
      <g transform="translate(360, 245)">
        <rect x="-55" y="-55" width="110" height="90" rx="8" fill="url(#blockGrad)" stroke="#93c5fd" stroke-width="2.5" filter="url(#softShadow)" />
        <circle cx="0" cy="-10" r="5" fill="#facc15" />
        <text x="0" y="-6" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="system-ui">Cuerpo (m)</text>

        <!-- Normal Force N (upward) -->
        <line x1="0" y1="-10" x2="0" y2="-120" stroke="#34d399" stroke-width="3" marker-end="url(#mGreen)" />
        <text x="12" y="-105" font-size="13" font-weight="bold" fill="#34d399">N⃗ (Fuerza Normal)</text>

        <!-- Weight Force W = mg (downward) -->
        <line x1="0" y1="-10" x2="0" y2="105" stroke="#38bdf8" stroke-width="3" marker-end="url(#mCyan)" />
        <text x="12" y="90" font-size="13" font-weight="bold" fill="#38bdf8">P⃗ = m·g (Peso)</text>

        <!-- Applied Force F (rightward or angled) -->
        <line x1="0" y1="-10" x2="140" y2="-10" stroke="#818cf8" stroke-width="3.5" marker-end="url(#mIndigo)" />
        <text x="145" y="-14" font-size="13" font-weight="bold" fill="#818cf8">F⃗ (Fuerza Aplicada)</text>

        <!-- Friction Force fk (leftward) -->
        <line x1="0" y1="-10" x2="-110" y2="-10" stroke="#f43f5e" stroke-width="3" marker-end="url(#mRose)" />
        <text x="-140" y="-14" font-size="13" font-weight="bold" fill="#f43f5e">f⃗ᵣ (Fricción)</text>

        <!-- Acceleration Vector a (accent yellow) -->
        <line x1="10" y1="-80" x2="90" y2="-80" stroke="#facc15" stroke-width="2.5" stroke-dasharray="5 3" marker-end="url(#mYellow)" />
        <text x="45" y="-90" font-size="12" font-weight="bold" fill="#facc15">a⃗ = ? [m/s²]</text>
      </g>`;
      break;
    }
  }

  // Footer Legend bar
  const footer = `
  <g transform="translate(20, 368)">
    <rect width="680" height="24" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1" opacity="0.9" />
    <circle cx="16" cy="12" r="4" fill="#10b981" />
    <text x="26" y="16" font-size="10" font-weight="bold" fill="#6ee7b7">Datos Conocidos</text>
    
    <circle cx="140" cy="12" r="4" fill="#f59e0b" />
    <text x="150" y="16" font-size="10" font-weight="bold" fill="#fde68a">Incógnitas (?)</text>

    <circle cx="250" cy="12" r="4" fill="#818cf8" />
    <text x="260" y="16" font-size="10" font-weight="bold" fill="#c7d2fe">Fuerzas / Vectores</text>

    <circle cx="380" cy="12" r="4" fill="#38bdf8" />
    <text x="390" y="16" font-size="10" font-weight="bold" fill="#bae6fd">Gravedad / Peso</text>

    <circle cx="510" cy="12" r="4" fill="#f43f5e" />
    <text x="520" y="16" font-size="10" font-weight="bold" fill="#fecdd3">Fricción / Oposición</text>
  </g>`;

  return `<svg viewBox="0 0 720 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto select-none font-sans">${defs}${background}${badgesGroup}${scenarioContent}${footer}</svg>`;
}

/**
 * Sanitizes and extracts raw SVG from LLM responses if wrapped in markdown code blocks or text.
 */
export function sanitizeSvgCode(rawSvg: string | undefined): string | null {
  if (!rawSvg || typeof rawSvg !== 'string') return null;

  let cleaned = rawSvg.trim();

  // If wrapped in ```xml or ```svg or ```
  if (cleaned.includes('```')) {
    const match = cleaned.match(/<svg[\s\S]*?<\/svg>/i);
    if (match) {
      cleaned = match[0];
    } else {
      cleaned = cleaned.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }
  }

  // Check if it really contains a valid <svg tag
  const svgStart = cleaned.indexOf('<svg');
  const svgEnd = cleaned.lastIndexOf('</svg>');

  if (svgStart !== -1 && svgEnd !== -1 && svgEnd > svgStart) {
    const extracted = cleaned.substring(svgStart, svgEnd + 6);
    // Ensure viewBox exists
    if (!extracted.includes('viewBox')) {
      return extracted.replace('<svg', '<svg viewBox="0 0 720 400"');
    }
    return extracted;
  }

  return null;
}
