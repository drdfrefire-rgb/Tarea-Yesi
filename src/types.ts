export type PhysicsCategory =
  | 'cinematica'
  | 'dinamica'
  | 'energia_trabajo'
  | 'impulso_momento'
  | 'gravitacion'
  | 'termodinamica'
  | 'electromagnetismo'
  | 'fluidos'
  | 'ondas_optica'
  | 'otro';

export interface KnownQuantity {
  symbol: string; // e.g., "m_1", "v_0", "\theta"
  name: string; // e.g., "Masa del bloque", "Velocidad inicial"
  value: string; // e.g., "5.0 kg", "25 m/s", "30°"
  unit?: string;
  notes?: string; // e.g., "Dato suministrado en el enunciado"
}

export interface UnknownQuantity {
  symbol: string; // e.g., "a", "T", "t_{vuelo}"
  name: string; // e.g., "Aceleración del sistema", "Tensión de la cuerda"
  targetUnit: string; // e.g., "m/s²", "N", "s"
  calculatedValue?: string; // e.g., "2.45 m/s²"
  notes?: string;
}

export interface DiagramElement {
  id: string;
  type: 'vector' | 'body' | 'surface' | 'dimension' | 'angle' | 'axis' | 'label' | 'curve';
  label: string;
  isKnown?: boolean;
  value?: string;
  color?: string; // hex or semantic color
  description?: string;
}

export interface DiagramData {
  title: string;
  description: string;
  svgCode?: string; // Clean SVG markup generated or template
  proceduralSvgCode?: string; // Mathematical engineering schematic
  elements?: DiagramElement[];
  viewBox?: string; // default "0 0 600 400"
}

export interface DerivationStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathLatex: string;
  intermediateResult?: string;
}

export interface PhysicsSolution {
  id: string;
  problemStatement: string;
  category: PhysicsCategory;
  title: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  
  // 1. Esquema
  diagram: DiagramData;
  knowns: KnownQuantity[];
  unknowns: UnknownQuantity[];

  // 2. Planteamiento Físico
  principles: string[]; // Leyes y principios físicos
  assumptions: string[]; // Hipótesis y simplificaciones
  coordinateSystem: string; // Elección de ejes y convención de signos

  // 3. Derivación Matemática Completa
  derivationSteps: DerivationStep[];
  symbolicFormula: string; // Fórmula analítica despejada
  numericalSubstitution: string; // Sustitución numérica
  finalAnswers: Array<{
    symbol: string;
    name: string;
    value: string;
    unit: string;
    interpretation?: string;
  }>;

  // 4. Análisis Crítico y Físico
  physicalDiscussion: string; // Interpretación de resultados, casos límite, comprobación de dimensiones
  commonMistakesOrTips: string[];

  createdAt: number;
}
