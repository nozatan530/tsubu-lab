import { Mission } from '../types';
import { calculateMassPercent, calculateMolarConcentration, calculateMolesToQuantities } from '../utils/chemistry';

export const MISSIONS: Mission[] = [
  // ==========================================
  // ① 質量パーセント濃度 (Unit 1)
  // ==========================================
  {
    id: 'u1-m1',
    unitId: 'unit1',
    order: 1,
    title: '食塩水を半分に分けると？',
    subtitle: '溶液を分けたときの濃度（粒の混み具合）の変化を確かめよう',
    question: '10%の食塩水 100g を半分（50gずつ）に分けると、それぞれの濃度はどうなるでしょう？',
    goalDescription: '「半分くみ出す」ボタンを押して、2つのビーカーの粒の混み具合を確かめてみよう！',
    targetMoves: 2,
    initialState: {
      soluteG: 10,
      waterG: 90,
    },
    choices: [
      {
        id: 'c1',
        label: '半分になって 5% になる',
        isCorrect: false,
        explanation: '食塩の量だけでなく、水の量も半分になるので、混み具合（割合）は薄まりません。',
      },
      {
        id: 'c2',
        label: '10% のまま変わらない',
        isCorrect: true,
        explanation: '大正解！取り分けても、水に対する粒の混み具合（密度）はどちらも全く同じです。',
      },
      {
        id: 'c3',
        label: '水が減って濃くなり 20% になる',
        isCorrect: false,
        explanation: '食塩も水も同じ割合で移るため、濃くなることはありません。',
      },
    ],
    checkCompletion: (state, predictionChoiceId) => {
      // Completed if user divided the beaker
      const hasDivided = state.secondBeaker && state.secondBeaker.waterG > 0;
      const beakerAPercent = calculateMassPercent(state.soluteG, state.waterG).percent;
      const isSuccess = hasDivided;

      return {
        isSuccess,
        feedback: isSuccess
          ? '溶液を半分に分けると、食塩も水も半分ずつになりますが、粒の混み具合（割合＝濃度）は10%のままです！'
          : '「半分くみ出す」ボタンを押して、ビーカーを分けてみてください。',
        particleExplanation: 'コップのジュースを2つに分けても甘さが半分にならないのと同じです。粒と水が同じ割合で分かれるため、濃度は変わりません。',
      };
    },
  },
  {
    id: 'u1-m2',
    unitId: 'unit1',
    order: 2,
    title: '分母は「水」？「溶液全体」？',
    subtitle: '質量パーセント濃度の計算で、割る相手を確かめよう',
    question: '水 90g に食塩 10g を溶かしました。この食塩水の質量パーセント濃度は何%でしょう？',
    goalDescription: 'てんびんと式の数字に注目して、分母が何gになっているか確認しよう！',
    targetMoves: 2,
    initialState: {
      soluteG: 10,
      waterG: 90,
    },
    choices: [
      {
        id: 'c1',
        label: '10% （10g ÷ 100g × 100）',
        isCorrect: true,
        explanation: '大正解！分母は「水 90g」ではなく「食塩＋水＝溶液全体 100g」です。',
      },
      {
        id: 'c2',
        label: '約11.1% （10g ÷ 90g × 100）',
        isCorrect: false,
        explanation: 'よくある間違いです！水だけで割るのではなく、食塩を合わせた「溶液全体」で割ります。',
      },
      {
        id: 'c3',
        label: '9% （90g ÷ 10g の逆）',
        isCorrect: false,
        explanation: '食塩（溶質）の質量を、溶液全体の質量で割って求めます。',
      },
    ],
    checkCompletion: (state, predictionChoiceId) => {
      const calc = calculateMassPercent(state.soluteG, state.waterG);
      const isCorrectState = Math.abs(calc.percent - 10) < 0.1;
      return {
        isSuccess: true,
        feedback: `現在: 食塩 ${state.soluteG}g ÷ 溶液 ${calc.solutionG}g × 100 ＝ 10.0% です！`,
        particleExplanation: '「100gの溶液の中に何粒あるか」を見るのがパーセント濃度。水90gの中に10粒が入ると、全体は100gになり、ちょうど10%です。',
      };
    },
  },
  {
    id: 'u1-m3',
    unitId: 'unit1',
    order: 3,
    title: '5%の食塩水を200g作れ',
    subtitle: '目標の質量と濃度になるよう、溶質と水を操作しよう',
    question: '5%の食塩水 200g を作るには、食塩（溶質）は何g 必要でしょう？',
    goalDescription: '食塩と水を足して、「溶液200g・濃度5.0%」をビーカーに作ろう！',
    targetMoves: 6,
    initialState: {
      soluteG: 0,
      waterG: 0,
    },
    choices: [
      {
        id: 'c1',
        label: '5g （200g に 5% だから 5g？）',
        isCorrect: false,
        explanation: '100gあたり5gなので、200gならその2倍必要になります。',
      },
      {
        id: 'c2',
        label: '10g （200g × 0.05 ＝ 10g）',
        isCorrect: true,
        explanation: '大正解！溶液200gの5%は、200 × 0.05 ＝ 10g の食塩が必要です。',
      },
      {
        id: 'c3',
        label: '20g （200 ÷ 10 ＝ 20g？）',
        isCorrect: false,
        explanation: '20g溶かすと、20÷200＝10%になってしまいます。',
      },
    ],
    checkCompletion: (state) => {
      const calc = calculateMassPercent(state.soluteG, state.waterG);
      const isMatch = Math.abs(calc.solutionG - 200) < 1 && Math.abs(calc.percent - 5.0) < 0.2;
      return {
        isSuccess: isMatch,
        feedback: isMatch
          ? `目標達成！ 食塩 ${state.soluteG}g ＋ 水 ${state.waterG}g ＝ 溶液 ${calc.solutionG}g （${calc.formattedPercent}%）が完成しました！`
          : `現在: 溶液 ${calc.solutionG}g / 濃度 ${calc.formattedPercent}% （目標: 溶液 200g・濃度 5.0% = 食塩 10g + 水 190g）`,
        particleExplanation: '100g中に5粒ある割合にするため、200gの溶液全体の中に10粒の食塩が散らばっています。',
      };
    },
  },
  {
    id: 'u1-m4',
    unitId: 'unit1',
    order: 4,
    title: '2つの食塩水を混ぜ合わせたら？',
    subtitle: '濃さの違う液を混ぜたときの変化を粒で確かめよう',
    question: '10%の食塩水 100g と、20%の食塩水 100g を混ぜ合わせると、濃度はどうなるでしょう？',
    goalDescription: '「2つのビーカーを混ぜる」ボタンを押して、混ざった後の濃度を確かめよう！',
    targetMoves: 2,
    initialState: {
      soluteG: 10,
      waterG: 90,
      secondBeaker: {
        soluteG: 20,
        waterG: 80,
      },
    },
    choices: [
      {
        id: 'c1',
        label: '足し算されて 30% になる',
        isCorrect: false,
        explanation: '食塩も増えますが、水も増えるので、30%のような激辛にはなりません！',
      },
      {
        id: 'c2',
        label: 'ちょうど中間の 15% になる',
        isCorrect: true,
        explanation: '大正解！同じ重さ（100gずつ）を混ぜるので、中間の 15% になります。',
      },
      {
        id: 'c3',
        label: '薄い方の 10% のまま',
        isCorrect: false,
        explanation: '20%の濃い液が入るため、10%よりは必ず濃くなります。',
      },
    ],
    checkCompletion: (state) => {
      // Success when merged back into single beaker
      const hasMerged = !state.secondBeaker || state.secondBeaker.waterG === 0;
      const calc = calculateMassPercent(state.soluteG, state.waterG);
      const isSuccess = hasMerged && Math.abs(calc.percent - 15.0) < 0.2;

      return {
        isSuccess,
        feedback: isSuccess
          ? `混ぜ合わせ完了！ 食塩の合計は 30g、溶液の合計は 200g なので、30 ÷ 200 × 100 ＝ 15.0% になりました！`
          : '「2つのビーカーを混ぜる」ボタンを押して確かめてみましょう。',
        particleExplanation: '食塩（10粒＋20粒＝30粒）と溶液全体（100g＋100g＝200g）の比率を考えると、30÷200＝0.15（15%）と自然にわかります。',
      };
    },
  },
  {
    id: 'u1-m5',
    unitId: 'unit1',
    order: 5,
    title: '水を足すと粒はどうなる？',
    subtitle: '希釈（水を加える操作）による濃度の変化を観察しよう',
    question: '20%の食塩水 50g（食塩10g、水40g）に水 50g を足すと、濃度はどうなるでしょう？',
    goalDescription: '水を +50g 加えて、粒の散らばり具合と濃度の変化を確かめよう！',
    targetMoves: 2,
    initialState: {
      soluteG: 10,
      waterG: 40,
    },
    choices: [
      {
        id: 'c1',
        label: '液の重さが2倍になり、濃度は半分の 10% になる',
        isCorrect: true,
        explanation: '大正解！食塩（粒）の数は10gのまま、溶液が50gから100gへ2倍に増えたので、混み具合は半分（10%）に薄まります。',
      },
      {
        id: 'c2',
        label: '食塩の粒の数は変わらないので、20% のまま',
        isCorrect: false,
        explanation: '「粒の数（量）」は変わりませんが、水が増えて空間が広がるため「割合（濃度）」は薄まります。',
      },
      {
        id: 'c3',
        label: '一気に 0% になる',
        isCorrect: false,
        explanation: '食塩が消えるわけではないので、0%にはなりません。',
      },
    ],
    checkCompletion: (state) => {
      const calc = calculateMassPercent(state.soluteG, state.waterG);
      const isSuccess = state.soluteG === 10 && state.waterG >= 90;
      return {
        isSuccess,
        feedback: isSuccess
          ? `水が加わって溶液全体が 100g になり、10g ÷ 100g × 100 ＝ 10.0% に薄まりました！`
          : `現在: 溶液 ${calc.solutionG}g / 濃度 ${calc.formattedPercent}% （水を +50g 加えてみよう）`,
        particleExplanation: '粒の数（10g）はそのままですが、水色の液面が上がって粒同士の間隔が広がり、混み具合が半分になりました。',
      };
    },
  },

  // ==========================================
  // ② 物質量（モル）(Unit 2)
  // ==========================================
  {
    id: 'u2-m1',
    unitId: 'unit2',
    order: 1,
    title: '1パックが重いのはどっち？',
    subtitle: '1粒が軽すぎて測れないから、約6000垓個（6.02×10²³個）集めた！物質ごとの重さを比べよう',
    question: '水（H₂O）1パックと、食塩（NaCl）1パック。重いのはどちらでしょう？',
    goalDescription: '物質を H₂O と NaCl で切り替えて、1パック（約6000垓個）の重さ（モル質量）を見比べよう！',
    targetMoves: 2,
    unlockedCardId: 'H2O',
    initialState: {
      substanceId: 'H2O',
      packs: 1.0,
    },
    choices: [
      {
        id: 'c1',
        label: 'H₂O が重い',
        isCorrect: false,
        explanation: 'カードを見てみましょう。H₂O は 18.0g/mol です。',
      },
      {
        id: 'c2',
        label: 'NaCl が重い',
        isCorrect: true,
        explanation: '大正解！NaCl は 58.5g/mol で、H₂O（18.0g/mol）の3倍以上重いです！',
      },
      {
        id: 'c3',
        label: 'どちらも同じ「1パック」だから同じ重さ',
        isCorrect: false,
        explanation: 'ミカン1箱とスイカ1箱のように、同じ1箱（約6000垓個）でも中身の1粒自体の重さが違うため、全体の重さも違います！',
      },
    ],
    checkCompletion: (state) => {
      const isNaCl = state.substanceId === 'NaCl';
      return {
        isSuccess: true,
        feedback: `H₂O は 18.0g/mol、NaCl は 58.5g/mol です。NaCl の方が重いことがわかります！`,
        particleExplanation: '原子や分子は1粒があまりにも小さく軽すぎるため、天秤で測れるグラムにするために約6000垓個（6.02×10²³個）集めた山を「1モル（1パック）」と呼びます。NaClの1粒はH₂Oの1粒よりも重いため、同じ6000垓個集めたときの重さ（58.5g vs 18.0g）もNaClの方がずっしり重くなります。',
      };
    },
  },
  {
    id: 'u2-m2',
    unitId: 'unit2',
    order: 2,
    title: '水 H₂O 2パックは何g？',
    subtitle: 'パック数から重さ（g）を計算しよう',
    question: '水（H₂O）2パック（2.0mol）の重さは何gでしょう？（H₂O のモル質量は 18.0g/mol）',
    goalDescription: 'H₂O を選び、パック数を 2.0 に増やして重さを確かめよう！',
    targetMoves: 3,
    initialState: {
      substanceId: 'H2O',
      packs: 1.0,
    },
    choices: [
      {
        id: 'c1',
        label: '18.0g',
        isCorrect: false,
        explanation: '18.0g は 1パック分の重さです。今回は 2パックあります。',
      },
      {
        id: 'c2',
        label: '36.0g （18.0g × 2）',
        isCorrect: true,
        explanation: '大正解！1パックが18gなので、2パックで 18 × 2 ＝ 36.0g です。',
      },
      {
        id: 'c3',
        label: '72.0g',
        isCorrect: false,
        explanation: '72g は 4パック分になってしまいます。',
      },
    ],
    checkCompletion: (state) => {
      const isH2O = state.substanceId === 'H2O';
      const is2Mol = Math.abs(state.packs - 2.0) < 0.05;
      return {
        isSuccess: isH2O && is2Mol,
        feedback: isH2O && is2Mol
          ? '水 2.0mol の重さは 36.0g、粒の個数は 1.20×10²⁴個（12.04×10²³個）です！'
          : `現在: パック数 ${state.packs}mol （H₂O を選んで 2.0パック に合わせてみよう）`,
        particleExplanation: '「1パックの重さ × パック数 ＝ 全体の重さ」です。買い物の「1パック18円のお菓子を2個買ったら36円」と全く同じ掛け算です！',
      };
    },
  },
  {
    id: 'u2-m3',
    unitId: 'unit2',
    order: 3,
    title: '36gの水は何パック？粒は何個？',
    subtitle: 'グラム（g）からパック数（mol）と粒の個数を逆算しよう',
    question: 'コップに水（H₂O）が 36g 入っています。これは何パック（mol）で、水分子は何個あるでしょう？',
    goalDescription: '重さ欄に「36」と入力するかパックを合わせて、パック数と個数を確認しよう！',
    targetMoves: 3,
    initialState: {
      substanceId: 'H2O',
      packs: 0.5,
    },
    choices: [
      {
        id: 'c1',
        label: '1パック （6.02 × 10²³個）',
        isCorrect: false,
        explanation: '1パックは 18g です。36g はその2倍あります。',
      },
      {
        id: 'c2',
        label: '2パック （1.20 × 10²⁴個）',
        isCorrect: true,
        explanation: '大正解！36g ÷ 18g/mol ＝ 2.0mol。個数は 6.02×10²³ × 2 ＝ 1.20×10²⁴個です。',
      },
      {
        id: 'c3',
        label: '0.5パック （3.01 × 10²³個）',
        isCorrect: false,
        explanation: '0.5パックだと 9g になってしまいます。',
      },
    ],
    checkCompletion: (state) => {
      const q = calculateMolesToQuantities(state.packs, 'H2O');
      const isSuccess = Math.abs(q.packs - 2.0) < 0.05;
      return {
        isSuccess,
        feedback: isSuccess
          ? `36.0g ÷ 18.0g/mol ＝ 2.0パック（2.0mol）！ 粒の個数は ${q.formattedParticles} です！`
          : `現在: ${q.massG}g（${q.packs}mol）。36gに合わせてみよう！`,
        particleExplanation: '全体の重さ(36g)を1パックの重さ(18g)で割ると、パック数(2)が出ます。個数は 6.02×10²³個 が2パック分あるので 1.20×10²⁴個 です。',
      };
    },
  },
  {
    id: 'u2-m4',
    unitId: 'unit2',
    order: 4,
    title: '二酸化炭素 CO₂ 0.5パックは何g？',
    subtitle: '1パックを10個に小分け（0.1パック刻み）して、小数のモルを体験しよう',
    question: '二酸化炭素（CO₂）0.5パック（0.50mol）は何gでしょう？（1パックは10個に小分けできます）',
    goalDescription: 'CO₂ を選び、パック数を 0.5（小分け5個分）に合わせて重さを調べよう！',
    targetMoves: 4,
    unlockedCardId: 'CO2',
    initialState: {
      substanceId: 'CO2',
      packs: 1.0,
    },
    choices: [
      {
        id: 'c1',
        label: '22.0g （小分け5個分・0.5パック）',
        isCorrect: true,
        explanation: '大正解！CO₂ は 44.0g/mol なので、その半分（小分け5個分）は 22.0g です。',
      },
      {
        id: 'c2',
        label: '44.0g （1パック丸ごと）',
        isCorrect: false,
        explanation: '44.0g は 1パック（小分け10個分丸ごと）の重さです。',
      },
      {
        id: 'c3',
        label: '11.0g （小分け2.5個分）',
        isCorrect: false,
        explanation: '11.0g は 0.25パック分です。',
      },
    ],
    checkCompletion: (state) => {
      const isCO2 = state.substanceId === 'CO2';
      const isHalfMol = Math.abs(state.packs - 0.5) < 0.05;
      return {
        isSuccess: isCO2 && isHalfMol,
        feedback: isCO2 && isHalfMol
          ? 'CO₂ 0.5mol（小分け5個分）の重さは 22.0g、分子の個数は 3.01×10²³個 です！'
          : `現在: ${state.substanceId} ${state.packs}mol。CO₂ を選び 0.5mol にしてみよう！`,
        particleExplanation: '1パックを10等分した小分け1個は 0.1mol。0.5mol は小分け5個分です。1パック44gの半分なので 22g になります。',
      };
    },
  },
  {
    id: 'u2-m5',
    unitId: 'unit2',
    order: 5,
    title: 'ブドウ糖 90g は何パック？',
    subtitle: '分子量が大きなグルコースのモルを求めよう',
    question: 'ブドウ糖（C₆H₁₂O₆: モル質量 180.0g/mol）90g は何パック（何mol）でしょう？',
    goalDescription: 'カード帳で C₆H₁₂O₆ を確認し、重さ 90g になるパック数を設定しよう！',
    targetMoves: 4,
    unlockedCardId: 'C6H12O6',
    initialState: {
      substanceId: 'C6H12O6',
      packs: 0.1,
    },
    choices: [
      {
        id: 'c1',
        label: '0.50mol （0.5パック・小分け5個分）',
        isCorrect: true,
        explanation: '大正解！90g ÷ 180.0g/mol ＝ 0.50mol です。',
      },
      {
        id: 'c2',
        label: '1.0mol （1パック）',
        isCorrect: false,
        explanation: '1パックなら 180g 必要です。90g はその半分です。',
      },
      {
        id: 'c3',
        label: '2.0mol （2パック）',
        isCorrect: false,
        explanation: '2パックだと 360g になってしまいます。',
      },
    ],
    checkCompletion: (state) => {
      const isGlucose = state.substanceId === 'C6H12O6';
      const isHalf = Math.abs(state.packs - 0.5) < 0.05;
      return {
        isSuccess: isGlucose && isHalf,
        feedback: isGlucose && isHalf
          ? 'ブドウ糖 90g はちょうど 0.50mol（小分け5個分）です！'
          : `現在: ${state.substanceId} ${state.packs}mol。カード帳でモル質量を確認して 90g に合わせよう！`,
        particleExplanation: 'ブドウ糖は分子が大きいため1パックが180gもあります。90gはちょうど半分の0.5パック（0.50mol）にあたります。',
      };
    },
  },

  // ==========================================
  // ③ モル濃度 (Unit 3)
  // ==========================================
  {
    id: 'u3-m1',
    unitId: 'unit3',
    order: 1,
    title: '水1Lに1パック溶かすと、ちょうど1mol/L？',
    subtitle: '「水1Lに溶かす」と「溶液全体を1Lにする」の違いに迫る！',
    question: '水 1L（1000mL）を用意して、そこに食塩（NaCl）1パック（1mol）を溶かしました。モル濃度はちょうど 1.0mol/L になるでしょうか？',
    goalDescription: '容器に水 1000mL を入れ、NaCl 1パックを入れて体積とモル濃度を確かめよう！',
    targetMoves: 3,
    initialState: {
      flaskSubstanceId: 'NaCl',
      flaskPacks: 0,
      flaskWaterML: 1000,
    },
    choices: [
      {
        id: 'c1',
        label: 'ちょうど 1.0mol/L になる',
        isCorrect: false,
        explanation: '食塩自身にも体積があるため、水1Lに加えると全体の体積は1Lを超えてしまいます！',
      },
      {
        id: 'c2',
        label: '1.0mol/L より少し小さく（薄く）なる',
        isCorrect: true,
        explanation: '大正解！食塩を足すと溶液全体が約1020mLに増えるため、1mol ÷ 1.02L ≒ 0.98mol/L になります。',
      },
      {
        id: 'c3',
        label: '1.0mol/L より少し大きく（濃く）なる',
        isCorrect: false,
        explanation: '体積が増えると、同じパック数でも密度は薄くなります。',
      },
    ],
    checkCompletion: (state) => {
      const calc = calculateMolarConcentration(state.flaskPacks, state.flaskWaterML, state.flaskSubstanceId);
      const hasAdded = state.flaskPacks >= 1.0 && state.flaskWaterML >= 1000;
      return {
        isSuccess: hasAdded,
        feedback: hasAdded
          ? `溶液体積が ${calc.solutionVolumeML}mL（約1.02L）に増え、濃度は ${calc.formattedConcentration}mol/L （1.0mol/Lより少し薄い）になりました！`
          : '水1000mLにNaCl 1パック（1.0mol）を入れてみてください。',
        particleExplanation: 'モル濃度は「溶液全体1Lあたり」です。食塩を入れると液の体積が約20mL増えて1020mLになるため、分母が大きくなって濃度は0.98mol/Lとわずかに小さくなります。だから正確に作るときはメスフラスコで「後から水を足して標線に合わせる」のです！',
      };
    },
  },
  {
    id: 'u3-m2',
    unitId: 'unit3',
    order: 2,
    title: '0.10mol/L の溶液を作れ',
    subtitle: '標線（メスフラスコ）を使って正確なモル濃度の溶液を作る',
    question: 'NaCl 0.1パック（0.10mol）を使って 0.10mol/L の溶液を作るには、溶液全体の体積をどの標線に合わせればよいでしょう？',
    goalDescription: 'NaCl 0.1パックを入れ、「標線1Lまで水を合わせる」を実行しよう！',
    targetMoves: 3,
    initialState: {
      flaskSubstanceId: 'NaCl',
      flaskPacks: 0.1,
      flaskWaterML: 200,
    },
    choices: [
      {
        id: 'c1',
        label: '標線 100mL （0.1L）',
        isCorrect: false,
        explanation: '0.1mol を 0.1L にすると、0.1 ÷ 0.1 ＝ 1.0mol/L になって濃すぎます。',
      },
      {
        id: 'c2',
        label: '標線 500mL （0.5L）',
        isCorrect: false,
        explanation: '0.1mol ÷ 0.5L ＝ 0.20mol/L になります。',
      },
      {
        id: 'c3',
        label: '標線 1L （1000mL）',
        isCorrect: true,
        explanation: '大正解！0.10mol ÷ 1.0L ＝ 0.10mol/L です。',
      },
    ],
    checkCompletion: (state) => {
      const calc = calculateMolarConcentration(state.flaskPacks, state.flaskWaterML, state.flaskSubstanceId);
      const isSuccess = Math.abs(state.flaskPacks - 0.1) < 0.05 && Math.abs(calc.solutionVolumeML - 1000) < 15;
      return {
        isSuccess,
        feedback: isSuccess
          ? `完成！ パック数 0.10mol ÷ 溶液 1.0L ＝ 0.10mol/L の溶液ができました！`
          : `現在: パック数 ${state.flaskPacks}mol / 溶液体積 ${calc.solutionVolumeML}mL / 濃度 ${calc.formattedConcentration}mol/L（目標: 0.10mol/L 1000mL）`,
        particleExplanation: 'モル濃度は「1L（1000mL）の中に何パックあるか」。0.1パックを溶液全体1Lに広げると、ちょうど0.10mol/Lになります。',
      };
    },
  },
  {
    id: 'u3-m3',
    unitId: 'unit3',
    order: 3,
    title: '水を足して 0.10mol/L に薄めよう',
    subtitle: '1.0mol/L の濃い溶液に水を加えて希釈する',
    question: '1.0mol/L の水溶液 100mL（溶質0.10mol含有）があります。水を足して 0.10mol/L に薄めるには、溶液全体を何mLにすればよいでしょう？',
    goalDescription: '水を足して溶液全体を 1000mL（標線1L）に合わせて、濃度 0.10mol/L にしよう！',
    targetMoves: 4,
    initialState: {
      flaskSubstanceId: 'NaCl',
      flaskPacks: 0.1,
      flaskWaterML: 98, // with 0.1mol solute (~2mL), total is ~100mL
    },
    choices: [
      {
        id: 'c1',
        label: '溶液全体を 200mL にする',
        isCorrect: false,
        explanation: '体積が2倍になると濃度は半分の 0.50mol/L になります。',
      },
      {
        id: 'c2',
        label: '溶液全体を 500mL にする',
        isCorrect: false,
        explanation: '500mL だと 0.1mol ÷ 0.5L ＝ 0.20mol/L になります。',
      },
      {
        id: 'c3',
        label: '溶液全体を 1000mL（1L）にする',
        isCorrect: true,
        explanation: '大正解！体積を10倍（100mL→1000mL）に薄めると、濃度は1/10の 0.10mol/L になります。',
      },
    ],
    checkCompletion: (state) => {
      const calc = calculateMolarConcentration(state.flaskPacks, state.flaskWaterML, state.flaskSubstanceId);
      const isSuccess = Math.abs(calc.molarConcentration - 0.10) < 0.02 && Math.abs(calc.solutionVolumeML - 1000) < 20;
      return {
        isSuccess,
        feedback: isSuccess
          ? `希釈完了！ 溶質のパック数（0.10mol）は変わらず、溶液全体が 1000mL（1.0L）になったので、0.10mol/L に薄まりました！`
          : `現在: 溶液体積 ${calc.solutionVolumeML}mL / 濃度 ${calc.formattedConcentration}mol/L（目標: 1000mL・0.10mol/L）`,
        particleExplanation: '水を加えても中に入っているパックの数（0.1mol）は変わりません。液全体の体積が10倍になったので、1Lあたりの混み具合が1/10になりました。',
      };
    },
  },
  {
    id: 'u3-m4',
    unitId: 'unit3',
    order: 4,
    title: 'モル濃度の溶液をくみ出したら？',
    subtitle: '質量パーセント濃度と同じく、「量」と「割合」の違いを確かめよう',
    question: '0.50mol/L の水溶液 500mL があります。ここから半分（250mL）くみ出すと、モル濃度はどうなるでしょう？',
    goalDescription: '「半分くみ出す」ボタンを押して、くみ出した後のモル濃度を確かめよう！',
    targetMoves: 2,
    initialState: {
      flaskSubstanceId: 'NaCl',
      flaskPacks: 0.25,
      flaskWaterML: 495, // ~500mL total
    },
    choices: [
      {
        id: 'c1',
        label: '半分になって 0.25mol/L になる',
        isCorrect: false,
        explanation: '溶質のパック数も減りますが、液の体積も同じだけ減るため、1Lあたりの割合は変わりません。',
      },
      {
        id: 'c2',
        label: '0.50mol/L のまま変わらない',
        isCorrect: true,
        explanation: '大正解！溶液を分けても、液の「混み具合（1Lあたりのパック数）」は全く変わりません。',
      },
      {
        id: 'c3',
        label: '濃くなって 1.0mol/L になる',
        isCorrect: false,
        explanation: '取り分けただけで濃縮されることはありません。',
      },
    ],
    checkCompletion: (state) => {
      const calc = calculateMolarConcentration(state.flaskPacks, state.flaskWaterML, state.flaskSubstanceId);
      const hasHalved = calc.solutionVolumeML < 350;
      return {
        isSuccess: hasHalved,
        feedback: hasHalved
          ? `確認できました！ パック数は半分（約0.13mol）になりましたが、体積も約250mLに半分になったため、モル濃度は 0.50mol/L のまま変わりません！`
          : '「半分くみ出す」ボタンを押して確かめてみましょう。',
        particleExplanation: '質量パーセント濃度と同じで、モル濃度も「割合（濃さ）」です。ジュースを分けても甘さが変わらないように、一部を取り出してもモル濃度は変化しません。',
      };
    },
  },

  // ==========================================
  // ④ 総合 (Comprehensive Application)
  // ==========================================
  {
    id: 'u4-m1',
    unitId: 'comprehensive',
    order: 1,
    title: '0.10mol/L の NaCl 溶液 500mL を作るには？',
    subtitle: 'カード帳のモル質量を使って、g ⇔ mol ⇔ 体積 をつなげよう',
    question: '0.10mol/L の NaCl 水溶液を 500mL（0.50L）作りたい。NaCl は何g 必要でしょう？（NaCl: 58.5g/mol）',
    goalDescription: 'カード帳で 1パックの重さを確認し、必要な食塩を重さ（g）で入れて、標線 500mL に合わせよう！',
    targetMoves: 4,
    initialState: {
      flaskSubstanceId: 'NaCl',
      flaskPacks: 0,
      flaskWaterML: 0,
    },
    choices: [
      {
        id: 'c1',
        label: '58.5g （1mol 分）',
        isCorrect: false,
        explanation: '58.5g は 1.0L に 1.0mol/L を作るときの重さです。今回は 500mL で 0.10mol/L です。',
      },
      {
        id: 'c2',
        label: '5.85g （0.10mol 分）',
        isCorrect: false,
        explanation: '5.85g だと 1.0L 分の 0.10mol になります。500mL（半分）なのでもっと少なくて済みます。',
      },
      {
        id: 'c3',
        label: '約 2.93g （0.050mol 分）',
        isCorrect: true,
        explanation: '大正解！必要なパック数は 0.10mol/L × 0.50L ＝ 0.050mol。重さは 58.5g/mol × 0.050mol ＝ 2.925g ≒ 2.9g です！',
      },
    ],
    checkCompletion: (state) => {
      const calc = calculateMolarConcentration(state.flaskPacks, state.flaskWaterML, state.flaskSubstanceId);
      const isSuccess = Math.abs(calc.molarConcentration - 0.10) < 0.02 && Math.abs(calc.solutionVolumeML - 500) < 15;
      return {
        isSuccess,
        feedback: isSuccess
          ? `完璧です！ 必要な NaCl は 0.05mol（約2.93g）。標線 500mL に合わせて 0.10mol/L の食塩水が完成しました！`
          : `現在: パック数 ${state.flaskPacks}mol / 溶液体積 ${calc.solutionVolumeML}mL / 濃度 ${calc.formattedConcentration}mol/L（目標: 0.10mol/L・500mL）`,
        particleExplanation: 'ステップ①：必要なパック数は 0.10mol/L × 0.5L ＝ 0.05mol。 ステップ②：NaCl 1パックは58.5gなので、0.05パックは 58.5 × 0.05 ＝ 2.925g。このようにモルを仲介役にすることで、実験室で天秤に乗せるグラム（g）が求まります！',
      };
    },
  },
  {
    id: 'u4-m2',
    unitId: 'comprehensive',
    order: 2,
    title: 'ブドウ糖 18g を溶かして 200mL にしたときのモル濃度は？',
    subtitle: '質量(g)からモル(mol)を求め、溶液の体積(L)で割ろう',
    question: 'ブドウ糖（C₆H₁₂O₆: 180g/mol）18.0g を水に溶かして、全体を 200mL（0.20L）にしました。モル濃度は何mol/L？',
    goalDescription: 'C₆H₁₂O₆ を選び、18g（0.10mol）を溶かして体積 200mL に合わせたときのモル濃度を確認しよう！',
    targetMoves: 4,
    initialState: {
      flaskSubstanceId: 'C6H12O6',
      flaskPacks: 0.1,
      flaskWaterML: 189, // ~200mL total with solute
    },
    choices: [
      {
        id: 'c1',
        label: '0.10mol/L',
        isCorrect: false,
        explanation: '0.10mol ですが、体積が 1.0L ではなく 0.20L（200mL）なのでもっと高密度です。',
      },
      {
        id: 'c2',
        label: '0.50mol/L （0.10mol ÷ 0.20L）',
        isCorrect: true,
        explanation: '大正解！18g ÷ 180g/mol ＝ 0.10mol。0.10mol ÷ 0.20L ＝ 0.50mol/L です！',
      },
      {
        id: 'c3',
        label: '1.0mol/L',
        isCorrect: false,
        explanation: '1.0mol/L にするには、200mL 中に 0.20mol（36g）必要です。',
      },
    ],
    checkCompletion: (state) => {
      const calc = calculateMolarConcentration(state.flaskPacks, state.flaskWaterML, state.flaskSubstanceId);
      const isSuccess = Math.abs(calc.molarConcentration - 0.50) < 0.03 && Math.abs(calc.solutionVolumeML - 200) < 15;
      return {
        isSuccess,
        feedback: isSuccess
          ? `正解！ 18.0g ＝ 0.10mol。0.10mol ÷ 0.20L ＝ 0.50mol/L です！`
          : `現在: パック数 ${state.flaskPacks}mol / 溶液体積 ${calc.solutionVolumeML}mL / 濃度 ${calc.formattedConcentration}mol/L`,
        particleExplanation: '重さ(18g)からパック数(0.10mol)に換算し、それを溶液のリットル数(0.20L)で割ると、1Lあたりのパック数＝モル濃度(0.50mol/L)がスッキリ導けます。',
      };
    },
  },
];
