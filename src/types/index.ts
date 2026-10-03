export type UnitId = 'unit1' | 'unit2' | 'unit3' | 'comprehensive';

export type ViewMode = 'particles' | 'diagram' | 'formula';

export interface SubstanceTheme {
  accent: string; // Hex color code
  gradient: string; // Tailwind gradient classes
  bgLight: string; // Light background class
  borderColor: string; // Border color class
  textColor: string; // Text color class
  crateBg: string; // Background for 3D crate
  crateBorder: string; // Border for 3D crate
  activeSlot: string; // Active slot gradient
  particleSymbol: string; // Emoji / molecule symbol
}

export interface Substance {
  id: string;
  name: string;
  formula: string; // e.g. "NaCl", "H2O"
  displayFormula: string; // HTML-friendly or structured representation
  molarMass: number; // g/mol
  breakdown: string; // e.g. "Na(23.0) + Cl(35.5)"
  description: string;
  color: string;
  icon: string;
  theme: SubstanceTheme;
  volumePerMolML: number; // Volume contribution when dissolved, e.g. 20mL for NaCl
  singleParticleMass: string; // e.g. "約 3.0 × 10⁻²³ g (0.000...03g)"
  singleParticleRelative: string; // e.g. "H(1)×2 + O(16) = 18"
}

export interface MissionChoice {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Mission {
  id: string;
  unitId: UnitId;
  order: number;
  title: string;
  question: string;
  subtitle: string;
  targetMoves: number;
  choices: MissionChoice[];
  unlockedCardId?: string; // Card unlocked when attempting or completing this mission
  initialState: {
    // Unit 1
    soluteG?: number;
    waterG?: number;
    secondBeaker?: { soluteG: number; waterG: number };
    // Unit 2
    substanceId?: string;
    packs?: number;
    // Unit 3
    flaskSubstanceId?: string;
    flaskPacks?: number;
    flaskWaterML?: number;
  };
  goalDescription: string;
  isNumericalInput?: boolean;
  numericQuestion?: {
    prompt: string;
    unit: string;
    correctValue: number;
    tolerance: number; // e.g. 0.05
    step?: number;
    placeholder?: string;
  };
  // Validation function identifier or criteria
  checkCompletion: (state: any, predictionChoiceId: string | null, numericAnswer?: number) => {
    isSuccess: boolean;
    feedback: string;
    particleExplanation: string;
  };
}

export interface UserProgress {
  completedMissions: Record<string, {
    completed: boolean;
    stars: number;
    predictedChoiceId?: string;
    movesUsed: number;
  }>;
  unlockedCards: string[];
  hasSeenMoleAnalogy: boolean;
}
