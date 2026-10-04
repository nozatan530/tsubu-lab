/**
 * ミッション画面の「つくる目標」カードに出すチェック項目。
 * 予想の答え（選択肢の正解）をそのまま書かないこと。例：u1-m4 は「15%にする」ではなく「混ぜる」。
 * 全部の項目に ✓ が付いた状態と、missions.ts の checkCompletion の判定は一致させる
 * （scripts/check-missions.ts でチェックしている）。
 */

import { SUBSTANCES } from './cards';
import {
  calculateMassPercent,
  calculateMolarConcentration,
  calculateMolesToQuantities,
  calculateSolutionMass,
} from '../utils/chemistry';

export interface MissionGoal {
  label: string; // 目標（何をするか）
  current: (state: any) => string; // いまの状態
  done: (state: any) => boolean;
}

export type MissionGoalSpec =
  | { kind: 'make'; goals: MissionGoal[] } // つくって確かめるミッション
  | { kind: 'observe'; hint: string }; // 操作して見るだけのミッション

// ---------- 状態を読む小さな関数 ----------

const beaker = (s: any) => calculateMassPercent(s.soluteG, s.waterG);
const hasSecond = (s: any) => !!s.secondBeaker && s.secondBeaker.soluteG + s.secondBeaker.waterG > 0;
const pack = (s: any) => calculateMolesToQuantities(s.packs, s.substanceId);
const flask = (s: any) => calculateMolarConcentration(s.flaskPacks, s.flaskWaterML, s.flaskSubstanceId);
const formula = (id: string) => SUBSTANCES[id]?.formula ?? id;
const near = (a: number, b: number, eps: number) => Math.abs(a - b) < eps;

const isSubstance = (id: string): MissionGoal => ({
  label: `物質を ${formula(id)} にする`,
  current: (s) => `いま ${formula(s.substanceId)}`,
  done: (s) => s.substanceId === id,
});

const mergeGoal: MissionGoal = {
  label: '2つのビーカーを1つに混ぜる',
  current: (s) => (hasSecond(s) ? 'まだ2つに分かれている' : '1つになった'),
  done: (s) => !hasSecond(s),
};

export const MISSION_GOALS: Record<string, MissionGoalSpec> = {
  // ===== ① 質量パーセント濃度 =====
  'u1-m1': {
    kind: 'make',
    goals: [
      {
        label: '溶液を半分くみ出して、2つのビーカーに分ける',
        current: (s) => (hasSecond(s) ? '2つに分かれた' : 'まだ1つ'),
        done: (s) => !!s.secondBeaker && s.secondBeaker.waterG > 0,
      },
    ],
  },
  'u1-m2': { kind: 'observe', hint: '天秤の表示と「式」で、分母が何gになっているかを見て確かめよう' },
  'u1-m3': {
    kind: 'make',
    goals: [
      {
        label: '溶液全体を 200g にする',
        current: (s) => `いま ${beaker(s).solutionG}g`,
        done: (s) => near(beaker(s).solutionG, 200, 1),
      },
      {
        label: '濃度を 5.0% にする',
        current: (s) => `いま ${beaker(s).formattedPercent}%`,
        done: (s) => near(beaker(s).percent, 5, 0.2),
      },
    ],
  },
  'u1-m4': {
    kind: 'make',
    goals: [
      mergeGoal,
      {
        label: '混ぜる前に食塩や水を足さない',
        current: (s) => {
          const solute = s.soluteG + (s.secondBeaker?.soluteG ?? 0);
          const total = beaker(s).solutionG + (s.secondBeaker ? s.secondBeaker.soluteG + s.secondBeaker.waterG : 0);
          return `食塩 ${Math.round(solute * 100) / 100}g・溶液 ${Math.round(total * 100) / 100}g`;
        },
        done: (s) => {
          const solute = s.soluteG + (s.secondBeaker?.soluteG ?? 0);
          const total = s.soluteG + s.waterG + (s.secondBeaker ? s.secondBeaker.soluteG + s.secondBeaker.waterG : 0);
          return near(solute, 30, 0.01) && near(total, 200, 0.01);
        },
      },
    ],
  },
  'u1-m5': {
    kind: 'make',
    goals: [
      {
        label: '水を +50g 足す（水 40g → 90g）',
        current: (s) => `いま 水 ${beaker(s).waterG}g`,
        done: (s) => near(s.waterG, 90, 0.01),
      },
      {
        label: '食塩は 10g のまま',
        current: (s) => `いま 食塩 ${beaker(s).soluteG}g`,
        done: (s) => near(s.soluteG, 10, 0.01),
      },
    ],
  },
  'u1-m6': { kind: 'make', goals: [mergeGoal] },

  // ===== ② 物質量 =====
  'u2-m1': { kind: 'observe', hint: '物質を H₂O と NaCl で切り替えて、1パックの重さを見比べよう' },
  'u2-m2': {
    kind: 'make',
    goals: [
      isSubstance('H2O'),
      { label: 'パック数を 2.0mol にする', current: (s) => `いま ${pack(s).packs}mol`, done: (s) => near(s.packs, 2, 0.05) },
    ],
  },
  'u2-m3': {
    kind: 'make',
    goals: [
      isSubstance('H2O'),
      { label: '重さを 36g にする', current: (s) => `いま ${pack(s).massG}g`, done: (s) => near(pack(s).packs, 2, 0.05) },
    ],
  },
  'u2-m4': {
    kind: 'make',
    goals: [
      isSubstance('CO2'),
      { label: 'パック数を 0.5mol にする', current: (s) => `いま ${pack(s).packs}mol`, done: (s) => near(s.packs, 0.5, 0.05) },
    ],
  },
  'u2-m5': {
    kind: 'make',
    goals: [
      isSubstance('C6H12O6'),
      { label: '重さを 90g にする', current: (s) => `いま ${pack(s).massG}g`, done: (s) => near(s.packs, 0.5, 0.05) },
    ],
  },

  // ===== ③ モル濃度 =====
  'u3-m1': {
    kind: 'make',
    goals: [
      { label: '水 1000mL を入れたままにする', current: (s) => `いま 水 ${flask(s).waterML}mL`, done: (s) => s.flaskWaterML >= 1000 },
      { label: 'NaCl を 1パック（1mol）入れる', current: (s) => `いま ${flask(s).packs}mol`, done: (s) => s.flaskPacks >= 1.0 },
    ],
  },
  'u3-m2': {
    kind: 'make',
    goals: [
      {
        label: 'NaCl は 0.1パック（0.10mol）のまま',
        current: (s) => `いま ${flask(s).packs}mol`,
        done: (s) => near(s.flaskPacks, 0.1, 0.05),
      },
      {
        label: 'モル濃度を 0.10 mol/L にする',
        current: (s) => `いま ${flask(s).formattedConcentration} mol/L`,
        done: (s) => near(flask(s).solutionVolumeML, 1000, 15),
      },
    ],
  },
  'u3-m3': {
    kind: 'make',
    goals: [
      {
        label: '水を足して 0.10 mol/L に薄める',
        current: (s) => `いま ${flask(s).formattedConcentration} mol/L`,
        done: (s) => near(flask(s).molarConcentration, 0.1, 0.02) && near(flask(s).solutionVolumeML, 1000, 20),
      },
    ],
  },
  'u3-m4': {
    kind: 'make',
    goals: [
      {
        label: '溶液を半分くみ出す',
        current: (s) => `いま 溶液 ${flask(s).solutionVolumeML}mL`,
        done: (s) => flask(s).solutionVolumeML < 350,
      },
    ],
  },

  // ===== ④ 総合 =====
  'u4-m1': {
    kind: 'make',
    goals: [
      { label: '溶液全体を 500mL にする', current: (s) => `いま ${flask(s).solutionVolumeML}mL`, done: (s) => near(flask(s).solutionVolumeML, 500, 15) },
      {
        label: 'モル濃度を 0.10 mol/L にする',
        current: (s) => `いま ${flask(s).formattedConcentration} mol/L`,
        done: (s) => near(flask(s).molarConcentration, 0.1, 0.02),
      },
    ],
  },
  'u4-m2': {
    kind: 'make',
    goals: [
      {
        label: 'ブドウ糖を 18g 入れる',
        current: (s) => `いま ${calculateSolutionMass(s.flaskPacks, s.flaskWaterML, s.flaskSubstanceId).soluteMassG}g`,
        done: (s) => near(s.flaskPacks * 180, 18, 1.08),
      },
      { label: '溶液全体を 200mL にする', current: (s) => `いま ${flask(s).solutionVolumeML}mL`, done: (s) => near(flask(s).solutionVolumeML, 200, 15) },
    ],
  },
  'u4-m3': {
    kind: 'make',
    goals: [
      { label: '溶液全体を 1L（1000mL）にする', current: (s) => `いま ${flask(s).solutionVolumeML}mL`, done: (s) => near(flask(s).solutionVolumeML, 1000, 5) },
      {
        label: '質量パーセント濃度を 10% にする',
        current: (s) => `いま ${calculateSolutionMass(s.flaskPacks, s.flaskWaterML, s.flaskSubstanceId).massPercent.toFixed(1)}%`,
        done: (s) => near(calculateSolutionMass(s.flaskPacks, s.flaskWaterML, s.flaskSubstanceId).massPercent, 10, 0.15),
      },
    ],
  },
};
