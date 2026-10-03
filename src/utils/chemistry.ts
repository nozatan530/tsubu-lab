/**
 * Chemistry calculation utilities for Tsubu Lab (つぶラボ).
 * All concentration, mole, and volume math is unified here to ensure
 * consistency across display, simulation, and mission evaluation.
 */

import { SUBSTANCES } from '../data/cards';

// Avogadro constant: 6.02 x 10^23 particles per mole
export const AVOGADRO = 6.02;

// 表示用の丸め。計算は丸める前の値で行い、くみ出しなどで濃度がずれないようにする
const roundTo = (value: number, digits: number) => {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
};

/**
 * 質量パーセント濃度（%）を計算
 * 溶質質量(g) ÷ 溶液質量(g) × 100
 * 溶液質量 = 溶質質量 + 水質量
 */
export function calculateMassPercent(soluteG: number, waterG: number): {
  soluteG: number;
  waterG: number;
  solutionG: number;
  percent: number;
  formattedPercent: string;
} {
  const safeSolute = Math.max(0, soluteG);
  const safeWater = Math.max(0, waterG);
  const solutionG = safeSolute + safeWater;
  const percent = solutionG > 0 ? (safeSolute / solutionG) * 100 : 0;

  return {
    soluteG: roundTo(safeSolute, 2),
    waterG: roundTo(safeWater, 2),
    solutionG: roundTo(solutionG, 2),
    percent,
    formattedPercent: percent.toFixed(1).replace(/\.0$/, ''),
  };
}

/**
 * 物質量（モル・パック数）から質量(g)と粒子数を計算
 */
export function calculateMolesToQuantities(packs: number, substanceId: string): {
  packs: number; // mol (パック数)
  molarMass: number; // g/mol (1パックの重さ)
  massG: number; // g (重さ)
  particleCountTen23: number; // x 10^23 個
  formattedParticles: string; // e.g. "6.02 × 10²³ 個"（NaCl は「組」）
  pieces: number; // 0.1パック単位 (0.1mol = 1 piece)。0.17mol なら 1.7
} {
  const substance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  // 計算は丸める前の値で行う（g から換算した mol を丸めてから g に戻すとずれるため）
  const safePacks = Math.max(0, packs);
  const massG = roundTo(safePacks * substance.molarMass, 1);
  const rawParticles = safePacks * AVOGADRO;
  
  let formattedParticles: string;
  const counter = substance.particleCounter;
  if (safePacks === 0) {
    formattedParticles = `0 ${counter}`;
  } else if (rawParticles >= 10) {
    formattedParticles = `${(rawParticles / 10).toFixed(2)} × 10²⁴ ${counter}`;
  } else {
    formattedParticles = `${rawParticles.toFixed(2)} × 10²³ ${counter}`;
  }

  return {
    packs: roundTo(safePacks, 2),
    molarMass: substance.molarMass,
    massG,
    particleCountTen23: rawParticles,
    formattedParticles,
    pieces: roundTo(safePacks * 10, 1),
  };
}

/**
 * 質量(g)からパック数（mol）を逆算
 */
export function calculateMassToMoles(massG: number, substanceId: string): number {
  const substance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  if (massG <= 0 || substance.molarMass <= 0) return 0;
  return massG / substance.molarMass;
}

/**
 * モル濃度（mol/L・1Lあたりのパック数）と溶液体積を計算
 * 水(mL) + 溶質による体積増加 = 溶液体積(mL)
 */
export function calculateMolarConcentration(
  packs: number,
  waterML: number,
  substanceId: string
): {
  packs: number;
  waterML: number;
  solutionVolumeML: number;
  solutionVolumeL: number;
  soluteVolumeContributionML: number;
  molarConcentration: number; // mol/L
  formattedConcentration: string;
} {
  const substance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  const safePacks = Math.max(0, packs);
  const safeWater = Math.max(0, waterML);

  // Solute volume contribution (NaCl is ~20mL per mol, roughly linear)
  const soluteVolumeContributionML = safePacks * substance.volumePerMolML;
  const solutionVolumeML = safeWater + soluteVolumeContributionML;
  const solutionVolumeL = solutionVolumeML / 1000;

  const molarConcentration = solutionVolumeL > 0 ? safePacks / solutionVolumeL : 0;

  return {
    packs: roundTo(safePacks, 3),
    waterML: roundTo(safeWater, 1),
    solutionVolumeML: roundTo(solutionVolumeML, 1),
    solutionVolumeL,
    soluteVolumeContributionML: roundTo(soluteVolumeContributionML, 1),
    molarConcentration,
    formattedConcentration: molarConcentration.toFixed(2).replace(/\.00$/, '.0'),
  };
}

// 水の密度（g/mL）。説明を簡単にするため 1.00 とする
export const WATER_DENSITY = 1.0;

/**
 * 溶液の質量・密度・質量パーセント濃度（モル濃度との換算用）
 * 溶液の質量 ＝ 水の質量（水 mL × 1.00g/mL）＋ 溶質の質量（mol × モル質量）
 * 密度 ＝ 溶液の質量(g) ÷ 溶液全体の体積(mL)
 */
export function calculateSolutionMass(packs: number, waterML: number, substanceId: string): {
  soluteMassG: number;
  solutionMassG: number;
  densityGPerML: number; // g/mL（＝ g/cm³）
  massPercent: number;
} {
  const substance = SUBSTANCES[substanceId] || SUBSTANCES.NaCl;
  const safePacks = Math.max(0, packs);
  const soluteMassG = safePacks * substance.molarMass;
  const solutionMassG = Math.max(0, waterML) * WATER_DENSITY + soluteMassG;
  const volumeML = Math.max(0, waterML) + safePacks * substance.volumePerMolML;

  return {
    soluteMassG: roundTo(soluteMassG, 1),
    solutionMassG: roundTo(solutionMassG, 1),
    densityGPerML: volumeML > 0 ? solutionMassG / volumeML : 0,
    massPercent: solutionMassG > 0 ? (soluteMassG / solutionMassG) * 100 : 0,
  };
}

/**
 * Terminology glossaries with student-friendly equivalents
 */
export const TERMINOLOGY = {
  mole: {
    academic: '物質量',
    friendly: 'パック数',
    unit: 'mol',
    description: '1粒が軽すぎて測れないため、天秤で測れるグラムになるまで約6000垓個（6.02×10²³個）ひとまとめにした1パック',
  },
  molarMass: {
    academic: 'モル質量',
    friendly: '1パックの重さ',
    unit: 'g/mol',
    description: 'その物質を約6000垓個（1パック）集めたときの天秤の質量（1粒の重さが違うため物質ごとに異なる）',
  },
  molarConcentration: {
    academic: 'モル濃度',
    friendly: '1Lあたりのパック数',
    unit: 'mol/L',
    description: '溶液全体1L（1000mL）の中に溶けているパック数',
  },
  massPercent: {
    academic: '質量パーセント濃度',
    friendly: '100gあたりの溶質',
    unit: '%',
    description: '溶液全体100gの中に溶けている溶質の質量（g）の割合',
  },
};
