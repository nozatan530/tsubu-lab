/**
 * ミッションの判定と濃度計算のチェック。 実行: npm run check
 *
 * 画面と同じ操作関数（src/utils/operations.ts）でボタン操作を再現し、
 *   - 正しい手順でクリアできるか（目標手数以内か）
 *   - よくある間違いの手順ではクリアにならないか
 *   - くみ出しなどで濃度がずれないか
 * を確かめる。ミッションを追加・変更したら、下の SOLUTIONS と MISTAKES にも手順を足すこと。
 */

import assert from 'node:assert/strict';
import { MISSIONS } from '../src/data/missions';
import { SUBSTANCES } from '../src/data/cards';
import { Mission } from '../src/types';
import {
  calculateMassPercent,
  calculateMolarConcentration,
  calculateMolesToQuantities,
  calculateSolutionMass,
} from '../src/utils/chemistry';
import {
  BEAKER_CAPACITY_G,
  BEAKER_MAX_SOLUTE_G,
  BeakerState,
  FLASK_CAPACITY_ML,
  FlaskState,
  beakerRoom,
  PackState,
  beakerAddSolute,
  beakerAddWater,
  beakerMerge,
  beakerSplit,
  flaskAddGrams,
  flaskAlignToMark,
  flaskChangePacks,
  flaskChangeWater,
  flaskFromMissionState,
  flaskTakeOut,
  flaskVolumeML,
  packChange,
  packFromGrams,
  packSetSubstance,
  toMissionUpdates,
} from '../src/utils/operations';

// ---------- 小さなテストランナー ----------

let passed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`  ✗ ${name}\n      ${(e as Error).message.split('\n').join('\n      ')}`);
  }
}

function section(title: string) {
  console.log(`\n■ ${title}`);
}

const near = (actual: number, expected: number, eps = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= eps, `${actual} が ${expected} になっていない（許容差 ${eps}）`);

// ---------- ミッション画面の操作を再現する ----------

// 1回のボタン操作。単元ごとの状態を受け取り、次の状態を返す
type Step =
  | { unit: 'beaker'; label: string; run: (s: BeakerState) => BeakerState }
  | { unit: 'pack'; label: string; run: (s: PackState) => PackState }
  | { unit: 'flask'; label: string; run: (s: FlaskState) => FlaskState };

const B = {
  solute: (g: number): Step => ({ unit: 'beaker', label: `食塩+${g}g`, run: (s) => beakerAddSolute(s, g) }),
  water: (g: number): Step => ({ unit: 'beaker', label: `水+${g}g`, run: (s) => beakerAddWater(s, g) }),
  split: (f: number): Step => ({ unit: 'beaker', label: `くみ出し${f}`, run: (s) => beakerSplit(s, f) }),
  merge: (): Step => ({ unit: 'beaker', label: '混ぜる', run: beakerMerge }),
};
const P = {
  change: (d: number): Step => ({ unit: 'pack', label: `パック${d > 0 ? '+' : ''}${d}`, run: (s) => packChange(s, d) }),
  grams: (g: number): Step => ({ unit: 'pack', label: `${g}g入力`, run: (s) => packFromGrams(s, g) }),
  substance: (id: string): Step => ({ unit: 'pack', label: `物質→${id}`, run: (s) => packSetSubstance(s, id) }),
};
const F = {
  packs: (d: number): Step => ({ unit: 'flask', label: `パック${d > 0 ? '+' : ''}${d}`, run: (s) => flaskChangePacks(s, d) }),
  water: (ml: number): Step => ({ unit: 'flask', label: `水+${ml}mL`, run: (s) => flaskChangeWater(s, ml) }),
  grams: (g: number): Step => ({ unit: 'flask', label: `${g}g加える`, run: (s) => flaskAddGrams(s, g) }),
  mark: (ml: number): Step => ({ unit: 'flask', label: `標線${ml}mL`, run: (s) => flaskAlignToMark(s, ml) }),
  takeOut: (t: 'half' | '100ml'): Step => ({ unit: 'flask', label: `くみ出し${t}`, run: (s) => flaskTakeOut(s, t) }),
};
const repeat = (n: number, step: Step) => Array.from({ length: n }, () => step);

// MissionView と同じく、パネルに渡す状態を取り出し、返ってきた変更をミッションの状態に混ぜる
function applyStep(mission: Mission, state: any, step: Step): any {
  let updates: any;
  if (step.unit === 'beaker') {
    assert.equal(mission.unitId, 'unit1', `${step.label} は単元①の操作`);
    updates = step.run({ soluteG: state.soluteG ?? 10, waterG: state.waterG ?? 90, secondBeaker: state.secondBeaker });
  } else if (step.unit === 'pack') {
    assert.equal(mission.unitId, 'unit2', `${step.label} は単元②の操作`);
    updates = step.run({ substanceId: state.substanceId || 'NaCl', packs: state.packs ?? 1.0 });
  } else {
    assert.ok(mission.unitId === 'unit3' || mission.unitId === 'comprehensive', `${step.label} は単元③・④の操作`);
    updates = step.run(flaskFromMissionState(state));
  }
  return { ...state, ...toMissionUpdates(mission.unitId, updates) };
}

function play(mission: Mission, steps: Step[]) {
  const state = steps.reduce((s, step) => applyStep(mission, s, step), { ...mission.initialState });
  const correct = mission.choices.find((c) => c.isCorrect)!;
  return { state, result: mission.checkCompletion(state, correct.id) };
}

// ---------- ミッションごとの手順 ----------

// 正しい手順（クリアになり、目標手数以内であること）
const SOLUTIONS: Record<string, Step[]> = {
  'u1-m1': [B.split(0.5)],
  'u1-m2': [], // 式を観察するミッション（最初から達成）
  'u1-m3': [B.solute(5), B.solute(5), ...repeat(3, B.water(50)), ...repeat(4, B.water(10))],
  'u1-m4': [B.merge()],
  'u1-m5': [B.water(50)],
  'u1-m6': [B.merge()],
  'u2-m1': [P.substance('NaCl')],
  'u2-m2': [P.change(1)],
  'u2-m3': [P.grams(36)],
  'u2-m4': [P.grams(22)],
  'u2-m5': [P.grams(90)],
  'u3-m1': [F.packs(1)],
  'u3-m2': [F.mark(1000)],
  'u3-m3': [F.mark(1000)],
  'u3-m4': [F.takeOut('half')],
  'u4-m1': [F.grams(2.9), F.mark(500)],
  'u4-m2': [F.grams(18), F.mark(200)],
  'u4-m3': [F.grams(107), F.mark(1000)],
};

// 最初から達成になってよいミッション（操作して観察するだけのもの）
const ALWAYS_SUCCESS: Record<string, string> = {
  'u1-m2': '分母が溶液全体になっていることを式で確かめるミッション',
  'u2-m1': 'H₂O と NaCl の1パックの重さを見比べるミッション',
};

// よくある間違いの手順（クリアにならないこと）
const MISTAKES: Record<string, { why: string; steps: Step[] }[]> = {
  'u1-m3': [
    { why: '食塩5gで止める（2.4%）', steps: [B.solute(5), ...repeat(4, B.water(50))] },
    { why: '食塩10gに水200g（溶液210g）', steps: [B.solute(5), B.solute(5), ...repeat(4, B.water(50))] },
  ],
  'u1-m5': [{ why: '水を入れすぎる（+100g）', steps: [B.water(50), B.water(50)] }],
  'u2-m2': [{ why: '3パックにする', steps: [P.change(1), P.change(1)] }],
  'u2-m3': [{ why: 'NaCl で2パックにする', steps: [P.substance('NaCl'), P.grams(117)] }],
  'u2-m4': [{ why: 'CO₂ 1パックのまま（44g）', steps: [] }],
  'u2-m5': [{ why: '1パック（180g）にする', steps: [P.grams(180)] }],
  'u3-m1': [{ why: '水だけ足す', steps: [F.water(10)] }],
  'u3-m2': [{ why: '標線500mLに合わせる（0.20mol/L）', steps: [F.mark(500)] }],
  'u3-m3': [{ why: '標線500mLに合わせる（0.20mol/L）', steps: [F.mark(500)] }],
  'u4-m1': [
    { why: '0.10mol（5.85g）を500mLに（0.20mol/L）', steps: [F.grams(5.85), F.mark(500)] },
    { why: '溶質を入れずに標線500mL', steps: [F.mark(500)] },
  ],
  'u4-m2': [{ why: '18gを1Lにする（0.10mol/L）', steps: [F.grams(18), F.mark(1000)] }],
  'u4-m3': [
    { why: '密度を使わず1L＝1000gとして100g入れる（9.4%）', steps: [F.grams(100), F.mark(1000)] },
    { why: '10%を「1Lに10g」と考える', steps: [F.grams(10), F.mark(1000)] },
    { why: '水1Lに107gを溶かす（溶液が1Lを超える）', steps: [...repeat(10, F.water(100)), F.grams(107)] },
  ],
};

// ======================================================================

section('ミッションのデータ');

test('ミッションIDが重複していない', () => {
  const ids = MISSIONS.map((m) => m.id);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), []);
});

for (const m of MISSIONS) {
  test(`${m.id}「${m.title}」: 正解の選択肢がちょうど1つ・選択肢IDが重複していない`, () => {
    assert.equal(m.choices.filter((c) => c.isCorrect).length, 1, '正解の数');
    const ids = m.choices.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length, '選択肢IDの重複');
  });
  test(`${m.id}: 物質ID・解禁カードが存在する`, () => {
    for (const id of [m.initialState.substanceId, m.initialState.flaskSubstanceId, m.unlockedCardId]) {
      if (id) assert.ok(SUBSTANCES[id], `${id} が SUBSTANCES にない`);
    }
  });
}

test('単元ごとにミッションの番号（order）が1から連番', () => {
  const units = [...new Set(MISSIONS.map((m) => m.unitId))];
  for (const u of units) {
    const orders = MISSIONS.filter((m) => m.unitId === u).map((m) => m.order);
    assert.deepEqual(orders, orders.map((_, i) => i + 1), `${u} の order`);
  }
});

section('ミッションの判定');

for (const m of MISSIONS) {
  test(`${m.id}: 正しい手順が登録されている`, () => {
    assert.ok(SOLUTIONS[m.id], 'scripts/check-missions.ts の SOLUTIONS に正しい手順を追加してください');
  });

  test(`${m.id}: 最初の状態の判定が想定どおり`, () => {
    const { result } = play(m, []);
    if (ALWAYS_SUCCESS[m.id]) {
      assert.equal(result.isSuccess, true, `観察ミッション（${ALWAYS_SUCCESS[m.id]}）なのに達成にならない`);
    } else {
      assert.equal(result.isSuccess, false, '何もしていないのに達成になっている');
    }
  });

  const solution = SOLUTIONS[m.id];
  if (solution) {
    test(`${m.id}: 正しい手順（${solution.map((s) => s.label).join('→') || '操作なし'}）でクリアできる`, () => {
      const { result } = play(m, solution);
      assert.equal(result.isSuccess, true, `クリアにならない: ${result.feedback}`);
    });
    test(`${m.id}: 目標手数（${m.targetMoves}手）以内でクリアできる（${solution.length}手）`, () => {
      assert.ok(solution.length <= m.targetMoves, `最短の手順が ${solution.length} 手で、目標 ${m.targetMoves} 手を超えている`);
    });
  }

  for (const mistake of MISTAKES[m.id] || []) {
    test(`${m.id}: 間違いの手順「${mistake.why}」ではクリアにならない`, () => {
      const { result } = play(m, mistake.steps);
      assert.equal(result.isSuccess, false, `クリアになってしまう: ${result.feedback}`);
    });
  }

  test(`${m.id}: 結果の文に undefined や NaN が出ない`, () => {
    const states = [play(m, []), play(m, solution || []), ...(MISTAKES[m.id] || []).map((x) => play(m, x.steps))];
    for (const { result } of states) {
      for (const text of [result.feedback, result.particleExplanation]) {
        assert.ok(!/undefined|NaN|null/.test(text), `「${text}」`);
      }
    }
  });
}

section('濃度の計算（どの見方でも同じ結果になるか）');

test('質量パーセント濃度：食塩10g＋水90g ＝ 10%（分母は溶液全体）', () => {
  near(calculateMassPercent(10, 90).percent, 10);
});

test('ビーカーを半分・1/4ずつ何度くみ出しても、AとBの濃度は同じ', () => {
  for (const start of [{ soluteG: 10, waterG: 90 }, { soluteG: 7, waterG: 43 }, { soluteG: 13, waterG: 120 }]) {
    let s: BeakerState = start;
    for (const f of [0.5, 0.25, 0.5, 0.25]) {
      s = beakerSplit({ soluteG: s.soluteG, waterG: s.waterG }, f);
      const a = calculateMassPercent(s.soluteG, s.waterG).percent;
      const b = calculateMassPercent(s.secondBeaker!.soluteG, s.secondBeaker!.waterG).percent;
      near(a, b, 1e-9);
      near(a, calculateMassPercent(start.soluteG, start.waterG).percent, 1e-9);
    }
  }
});

test('足す・分けるを何度くり返しても、AとBの合計は 300g・食塩は 50g を超えない', () => {
  let s: BeakerState = { soluteG: 10, waterG: 90 };
  for (let round = 0; round < 6; round++) {
    s = beakerSplit(s, 0.5);
    for (let i = 0; i < 6; i++) s = beakerAddWater(s, 50);
    for (let i = 0; i < 12; i++) s = beakerAddSolute(s, 5);
    const b = s.secondBeaker!;
    assert.ok(s.soluteG + s.waterG + b.soluteG + b.waterG <= BEAKER_CAPACITY_G + 1e-9, '合計が 300g を超えた');
    assert.ok(s.soluteG + b.soluteG <= BEAKER_MAX_SOLUTE_G + 1e-9, '食塩の合計が 50g を超えた');
  }
  const merged = beakerMerge(s);
  assert.ok(merged.soluteG + merged.waterG <= BEAKER_CAPACITY_G + 1e-9, '混ぜたら 300g を超えた');
});

test('ビーカーがいっぱい（u1-m6 の最初：5%100g＋20%200g）のときは、食塩も水も足せない', () => {
  const full: BeakerState = { soluteG: 5, waterG: 95, secondBeaker: { soluteG: 40, waterG: 160 } };
  assert.deepEqual(beakerRoom(full), { soluteG: 0, waterG: 0 });
  assert.deepEqual(beakerAddSolute(full, 5), full);
  assert.deepEqual(beakerAddWater(full, 50), full);
});

test('容器は、水を入れても溶質を入れても溶液全体が 1200mL を超えない', () => {
  for (const id of Object.keys(SUBSTANCES)) {
    let s: FlaskState = { substanceId: id, packs: 0, waterML: 0 };
    for (let i = 0; i < 15; i++) s = flaskChangeWater(s, 100);
    for (let i = 0; i < 8; i++) s = flaskChangePacks(s, 1);
    s = flaskAddGrams(s, 500);
    assert.ok(flaskVolumeML(s) <= FLASK_CAPACITY_ML + 1e-9, `${id}: ${flaskVolumeML(s)}mL`);
    s = flaskTakeOut(s, 'half');
    for (let i = 0; i < 8; i++) s = flaskChangePacks(s, 1);
    for (let i = 0; i < 15; i++) s = flaskChangeWater(s, 100);
    assert.ok(flaskVolumeML(s) <= FLASK_CAPACITY_ML + 1e-9, `${id}: くみ出し後 ${flaskVolumeML(s)}mL`);
  }
});

test('同じ質量の10%と20%を混ぜると15%（u1-m4）', () => {
  const s = beakerMerge({ soluteG: 10, waterG: 90, secondBeaker: { soluteG: 20, waterG: 80 } });
  near(calculateMassPercent(s.soluteG, s.waterG).percent, 15);
});

test('5% 100g と 20% 200g を混ぜると、真ん中の12.5%ではなく15%（u1-m6）', () => {
  const s = beakerMerge({ soluteG: 5, waterG: 95, secondBeaker: { soluteG: 40, waterG: 160 } });
  near(calculateMassPercent(s.soluteG, s.waterG).percent, 15);
});

test('重さ(g) → パック数 → 重さ(g) と戻しても、表示の重さが入力と同じ', () => {
  for (const id of Object.keys(SUBSTANCES)) {
    for (const g of [1, 10, 36, 2.9, 90]) {
      const { packs } = packFromGrams({ substanceId: id, packs: 0 }, g);
      near(calculateMolesToQuantities(packs, id).massG, g, 0.05);
    }
  }
});

test('NaCl は「組」、分子は「個」で数える', () => {
  assert.match(calculateMolesToQuantities(1, 'NaCl').formattedParticles, /組$/);
  assert.match(calculateMolesToQuantities(1, 'H2O').formattedParticles, /個$/);
});

test('モル濃度：水1000mLにNaCl 1molで溶液1020mL・0.98mol/L（u3-m1）', () => {
  const c = calculateMolarConcentration(1, 1000, 'NaCl');
  near(c.solutionVolumeML, 1020);
  assert.equal(c.formattedConcentration, '0.98');
});

test('標線に合わせると、溶液全体の体積がちょうど標線の値になる', () => {
  for (const id of Object.keys(SUBSTANCES)) {
    for (const ml of [100, 200, 500, 1000]) {
      const s = flaskAlignToMark({ substanceId: id, packs: 0.3, waterML: 50 }, ml);
      near(flaskVolumeML(s), ml, 1e-9);
    }
  }
});

test('容器から半分・100mLくみ出しても、モル濃度は変わらない', () => {
  let s: FlaskState = { substanceId: 'NaCl', packs: 0.25, waterML: 495 };
  const before = calculateMolarConcentration(s.packs, s.waterML, s.substanceId).molarConcentration;
  for (const t of ['half', '100ml', 'half'] as const) {
    s = flaskTakeOut(s, t);
    near(calculateMolarConcentration(s.packs, s.waterML, s.substanceId).molarConcentration, before, 1e-9);
  }
});

test('10%の食塩水（溶液1L）の密度は約1.07g/mL、モル濃度は約1.83mol/L（u4-m3）', () => {
  const s = flaskAlignToMark(flaskAddGrams({ substanceId: 'NaCl', packs: 0, waterML: 0 }, 107), 1000);
  const m = calculateSolutionMass(s.packs, s.waterML, s.substanceId);
  near(m.densityGPerML, 1.07, 0.002);
  near(m.massPercent, 10, 0.01);
  near(calculateMolarConcentration(s.packs, s.waterML, s.substanceId).molarConcentration, 1.83, 0.005);
});

test('質量パーセント濃度 → 密度 → モル濃度の換算が、容器の値から直接求めたモル濃度と一致する', () => {
  for (const id of Object.keys(SUBSTANCES)) {
    const s = flaskAlignToMark(flaskAddGrams({ substanceId: id, packs: 0, waterML: 0 }, 30), 500);
    const m = calculateSolutionMass(s.packs, s.waterML, id);
    const viaDensity = (1000 * m.densityGPerML * (m.massPercent / 100)) / SUBSTANCES[id].molarMass;
    near(viaDensity, calculateMolarConcentration(s.packs, s.waterML, id).molarConcentration, 1e-9);
  }
});

test('単元③・④のパネル操作がミッションの状態（flask*）に反映される', () => {
  const updates = toMissionUpdates('unit3', { packs: 1, waterML: 1000, substanceId: 'NaCl' });
  assert.deepEqual(updates, { flaskPacks: 1, flaskWaterML: 1000, flaskSubstanceId: 'NaCl' });
  assert.deepEqual(toMissionUpdates('unit1', { soluteG: 5 }), { soluteG: 5 });
});

// ---------- 結果 ----------

console.log(`\n${passed} 件成功 / ${failures.length} 件失敗`);
if (failures.length > 0) {
  console.log('失敗したチェック:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
