/**
 * 実験室の操作（ボタン1回ぶん）を、状態 → 次の状態 の純粋な関数としてまとめたもの。
 * 画面のコンポーネントもミッション判定のテスト（scripts/check-missions.ts）も、ここを通して状態を変える。
 */

import { SUBSTANCES } from '../data/cards';
import { UnitId } from '../types';
import { calculateMassToMoles } from './chemistry';

// ========== 単元① ビーカー（質量パーセント濃度） ==========

export interface BeakerState {
  soluteG: number;
  waterG: number;
  secondBeaker?: { soluteG: number; waterG: number };
}

// ビーカー1個に入る量（目盛りの最大）と、食塩の上限（●は最大50個まで描く）。
// AとBに分けても、合計がこの量を超えないようにする（混ぜたときに必ず1個のビーカーに収まる）
export const BEAKER_CAPACITY_G = 300;
export const BEAKER_MAX_SOLUTE_G = 50;
export const BEAKER_INITIAL: BeakerState = { soluteG: 10, waterG: 90, secondBeaker: undefined };

const beakerTotalSolute = (s: BeakerState) => s.soluteG + (s.secondBeaker?.soluteG ?? 0);
const beakerTotalSolution = (s: BeakerState) =>
  s.soluteG + s.waterG + (s.secondBeaker ? s.secondBeaker.soluteG + s.secondBeaker.waterG : 0);

// あと何g 足せるか（AとBの合計で考える）
export const beakerRoom = (s: BeakerState) => {
  const solutionRoom = Math.max(0, BEAKER_CAPACITY_G - beakerTotalSolution(s));
  return {
    soluteG: Math.max(0, Math.min(BEAKER_MAX_SOLUTE_G - beakerTotalSolute(s), solutionRoom)),
    waterG: solutionRoom,
  };
};

export const beakerAddSolute = (s: BeakerState, amount: number): BeakerState => ({
  ...s,
  soluteG: s.soluteG + Math.min(amount, beakerRoom(s).soluteG),
});

export const beakerAddWater = (s: BeakerState, amount: number): BeakerState => ({
  ...s,
  waterG: s.waterG + Math.min(amount, beakerRoom(s).waterG),
});

// メインビーカーから fraction の割合をくみ出して、ビーカーBに移す。
// 丸めずに同じ割合で分ける（整数に丸めると2つのビーカーの濃度がずれる）
export const beakerSplit = (s: BeakerState, fraction: number): BeakerState => {
  const splitSolute = s.soluteG * fraction;
  const splitWater = s.waterG * fraction;
  return {
    soluteG: s.soluteG - splitSolute,
    waterG: s.waterG - splitWater,
    secondBeaker: {
      soluteG: (s.secondBeaker?.soluteG || 0) + splitSolute,
      waterG: (s.secondBeaker?.waterG || 0) + splitWater,
    },
  };
};

export const beakerMerge = (s: BeakerState): BeakerState =>
  s.secondBeaker
    ? {
        soluteG: s.soluteG + s.secondBeaker.soluteG,
        waterG: s.waterG + s.secondBeaker.waterG,
        secondBeaker: undefined,
      }
    : s;

// ========== 単元② パック（物質量） ==========

export interface PackState {
  substanceId: string;
  packs: number;
}

export const PACK_MAX = 10;

export const packChange = (s: PackState, delta: number): PackState => ({
  ...s,
  packs: Math.max(0, Math.min(PACK_MAX, Math.round((s.packs + delta) * 100) / 100)),
});

// 重さ（g）を入力して、その重さぶんのパック数にする（丸めずに保持）
export const packFromGrams = (s: PackState, grams: number): PackState =>
  grams >= 0 ? { ...s, packs: calculateMassToMoles(grams, s.substanceId) } : s;

export const packSetSubstance = (s: PackState, substanceId: string): PackState => ({ ...s, substanceId });

// ========== 単元③・④ 標線付きの容器（モル濃度） ==========

export interface FlaskState {
  substanceId: string;
  packs: number;
  waterML: number;
}

// 容器の最大目盛り（溶液全体の体積の上限）と、パック数の上限
export const FLASK_CAPACITY_ML = 1200;
export const FLASK_MAX_PACKS = 5;

const volumePerMol = (substanceId: string) => (SUBSTANCES[substanceId] || SUBSTANCES.NaCl).volumePerMolML;

// 溶液全体の体積（丸めない値）
export const flaskVolumeML = (s: FlaskState) => s.waterML + s.packs * volumePerMol(s.substanceId);

// あと何 mol 入れられるか（溶液全体が容器の最大目盛りを超えない範囲）
export const flaskMaxPacks = (s: FlaskState) =>
  Math.max(0, Math.min(FLASK_MAX_PACKS, (FLASK_CAPACITY_ML - s.waterML) / volumePerMol(s.substanceId)));

export const flaskChangePacks = (s: FlaskState, delta: number): FlaskState => {
  const next = Math.max(0, Math.round((s.packs + delta) * 100) / 100);
  return { ...s, packs: delta > 0 ? Math.max(s.packs, Math.min(next, flaskMaxPacks(s))) : next };
};

export const flaskChangeWater = (s: FlaskState, delta: number): FlaskState => {
  const maxWater = FLASK_CAPACITY_ML - s.packs * volumePerMol(s.substanceId);
  const next = Math.max(0, s.waterML + delta);
  return { ...s, waterML: delta > 0 ? Math.max(s.waterML, Math.min(next, maxWater)) : next };
};

// 天秤で量った溶質（g）を加える（g → mol の換算）
export const flaskAddGrams = (s: FlaskState, grams: number): FlaskState =>
  grams > 0
    ? { ...s, packs: Math.max(s.packs, Math.min(flaskMaxPacks(s), s.packs + calculateMassToMoles(grams, s.substanceId))) }
    : s;

// 溶液全体がちょうど targetML になるまで水を合わせる（水 ＋ 溶質の体積 ＝ 標線）
export const flaskAlignToMark = (s: FlaskState, targetML: number): FlaskState => ({
  ...s,
  waterML: Math.max(0, targetML - s.packs * volumePerMol(s.substanceId)),
});

// 溶質も水も同じ割合で減らす（丸めると濃度がずれる）
export const flaskTakeOut = (s: FlaskState, type: 'half' | '100ml'): FlaskState => {
  const volume = flaskVolumeML(s);
  if (volume <= 0) return s;
  const keep = type === 'half' ? 0.5 : 1 - 100 / volume;
  if (keep <= 0) return s;
  return { ...s, packs: s.packs * keep, waterML: s.waterML * keep };
};

// ========== ミッションの状態との対応 ==========

// ミッションの状態（単元③・④は flask* というキー）から容器の状態を取り出す
export const flaskFromMissionState = (state: any): FlaskState => ({
  substanceId: state.flaskSubstanceId || state.substanceId || 'NaCl',
  packs: state.flaskPacks ?? state.packs ?? 0.1,
  waterML: state.flaskWaterML ?? state.waterML ?? 900,
});

// 実験パネルから返ってきた変更を、ミッションの状態のキーに合わせる
export const toMissionUpdates = (unitId: UnitId, updates: any): any => {
  if (unitId !== 'unit3' && unitId !== 'comprehensive') return updates;
  const { packs, waterML, substanceId, ...rest } = updates;
  return {
    ...rest,
    ...(packs !== undefined && { flaskPacks: packs }),
    ...(waterML !== undefined && { flaskWaterML: waterML }),
    ...(substanceId !== undefined && { flaskSubstanceId: substanceId }),
  };
};
