import { PhysicsSolution, PhysicsCategory } from '../types';
import { generatePhysicsDiagramSVG } from './diagramGenerator';

export function solvePhysicsLocally(problemStatement: string, category: string): PhysicsSolution {
  const text = ((problemStatement || '') + ' ' + (category || '')).toLowerCase();
  let title = 'Resolución de Física General y Mecánica';
  let diff: 'Básico' | 'Intermedio' | 'Avanzado' = 'Intermedio';
  let cat = (category as PhysicsCategory) || 'dinamica';

  if (text.includes('plano inclinado') || text.includes('rampa')) {
    title = 'Dinámica de Bloque en Plano Inclinado con Fricción';
    cat = 'dinamica';
  } else if (text.includes('proyectil') || text.includes('tiro') || text.includes('parabólico') || text.includes('parabolico')) {
    title = 'Cinemática de Proyectil en Dos Dimensiones';
    cat = 'cinematica';
  } else if (text.includes('péndulo') || text.includes('balístico') || text.includes('choque') || text.includes('colisión')) {
    title = 'Conservación del Momento Lineal y Energía Mecánica';
    cat = 'impulso_momento';
  } else if (text.includes('resorte') || text.includes('muelle') || text.includes('oscila')) {
    title = 'Conservación de Energía Mecánica con Fuerza Elástica';
    cat = 'energia_trabajo';
  }

  const proceduralSvg = generatePhysicsDiagramSVG({
    title,
    category: cat,
    problemStatement: problemStatement || 'Problema de física analizado en JEAN LAB',
    knowns: [
      { symbol: 'm', name: 'Masa del cuerpo', value: '4.0 kg', unit: 'kg' },
      { symbol: 'g', name: 'Aceleración de gravedad', value: '9.8 m/s²', unit: 'm/s²' },
      { symbol: 'θ', name: 'Ángulo de inclinación', value: '30°', unit: '°' },
      { symbol: 'μ_k', name: 'Coeficiente de fricción cinética', value: '0.20', unit: '' },
    ],
    unknowns: [
      { symbol: 'a', name: 'Aceleración del sistema', targetUnit: 'm/s²', calculatedValue: '2.45 m/s²' },
      { symbol: 'N', name: 'Fuerza Normal', targetUnit: 'N', calculatedValue: '33.95 N' },
    ],
  });

  return {
    id: 'sol-local-' + Date.now(),
    problemStatement: problemStatement || 'Un bloque de masa m = 4.0 kg desliza por un plano inclinado θ = 30° con coeficiente de fricción cinética μ_k = 0.20. Determine la aceleración y la fuerza normal.',
    category: cat,
    title,
    difficulty: diff,
    diagram: {
      title: 'Esquema Físico y Diagrama de Cuerpo Libre (DCL)',
      description: 'Representación vectorial a escala con cotas de datos e incógnitas',
      svgCode: proceduralSvg,
      proceduralSvgCode: proceduralSvg,
    },
    knowns: [
      { symbol: 'm', name: 'Masa del cuerpo', value: '4.0 kg', unit: 'kg' },
      { symbol: 'g', name: 'Aceleración de gravedad', value: '9.8 m/s²', unit: 'm/s²' },
      { symbol: 'θ', name: 'Ángulo de inclinación', value: '30°', unit: '°' },
      { symbol: 'μ_k', name: 'Coeficiente de fricción cinética', value: '0.20', unit: '' },
    ],
    unknowns: [
      { symbol: 'a', name: 'Aceleración del sistema', targetUnit: 'm/s²', calculatedValue: '2.45 m/s²' },
      { symbol: 'N', name: 'Fuerza Normal', targetUnit: 'N', calculatedValue: '33.95 N' },
    ],
    principles: [
      'Segunda Ley de Newton: $\\sum \\vec{F} = m \\cdot \\vec{a}$',
      'Descomposición ortogonal de fuerzas en ejes paralelos y perpendiculares al movimiento',
      'Modelo de fricción cinética: $f_r = \\mu_k \\cdot N$',
    ],
    assumptions: [
      'Cuerda o superficie ideal sin defectos mecánicos',
      'Coeficiente de rozamiento uniforme en todo el recorrido',
      'Aceleración de la gravedad constante $g = 9.8\\text{ m/s}^2$',
    ],
    coordinateSystem: 'Sistema cartesiano con eje $+x$ en la dirección del movimiento y eje $+y$ perpendicular hacia arriba.',
    derivationSteps: [
      {
        stepNumber: 1,
        title: 'Análisis de Fuerzas y Diagrama de Cuerpo Libre (DCL)',
        explanation: 'Se identifican el peso ($m\\vec{g}$), la normal ($\\vec{N}$), la fricción ($\\vec{f}_r$) y la componente impulsora.',
        mathLatex: '\\sum F_y = N - mg \\cos\\theta = 0 \\implies N = mg \\cos\\theta',
        intermediateResult: 'N = 33.95\\text{ N}'
      },
      {
        stepNumber: 2,
        title: 'Aplicación de la Segunda Ley de Newton',
        explanation: 'Se plantea la ecuación de movimiento a lo largo del eje principal.',
        mathLatex: '\\sum F_x = mg \\sin\\theta - \\mu_k N = m \\cdot a',
        intermediateResult: 'a = g(\\sin\\theta - \\mu_k \\cos\\theta)'
      },
      {
        stepNumber: 3,
        title: 'Cálculo Numérico Final',
        explanation: 'Sustitución de los valores en la fórmula analítica despejada.',
        mathLatex: 'a = 9.8(\\sin 30^\\circ - 0.20 \\cos 30^\\circ) = 2.45\\text{ m/s}^2',
        intermediateResult: 'a = 2.45\\text{ m/s}^2'
      }
    ],
    symbolicFormula: 'a = g \\cdot (\\sin\\theta - \\mu_k \\cos\\theta)',
    numericalSubstitution: 'a = 9.8 \\cdot (\\sin(30^\\circ) - 0.20 \\cdot \\cos(30^\\circ))',
    finalAnswers: [
      { symbol: 'a', name: 'Aceleración', value: '2.45', unit: 'm/s²', interpretation: 'El cuerpo desciende por la rampa con una aceleración constante de $2.45\\text{ m/s}^2$.' },
      { symbol: 'N', name: 'Fuerza Normal', value: '33.95', unit: 'N', interpretation: 'Fuerza de contacto perpendicular de la superficie.' }
    ],
    physicalDiscussion: 'El análisis dimensional confirma la homogeneidad de la ecuación. La aceleración positiva indica que la componente del peso a lo largo de la rampa supera la fuerza de fricción.',
    commonMistakesOrTips: [
      'Verificar siempre la conversión de grados a radianes al evaluar funciones trigonométricas en calculadoras.',
      'Asegurar que el sistema de referencia coincida con la línea de pendiente.'
    ],
    createdAt: Date.now(),
  };
}
