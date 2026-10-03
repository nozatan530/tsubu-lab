# プロジェクト規約

## 開発フロー

## 2つのルート

- **通常ルート（AIを組み込まないアプリ）**：`~/code/ideas` で構想 → AI Studio Build で試作 → GitHub → `/from-studio` でここに取り込み → `/build` → `/verify`。下の表の 2〜4 は使わない。
- **AI機能ありルート**：下の表を 1 から順に進める。


| 段階 | 誰が | コマンド | 成果物 |
| --- | --- | --- | --- |
| 1. 構想 | Claude Code | `/app-idea` | `docs/concept.md` |
| 2. AI Studio向け指示書 | Claude Code | `/studio-brief <機能名>` | `prompts/<機能名>/brief.md`, `cases.jsonl` |
| 3. プロンプト・スキーマ確定 | 人間（AI Studio） | — | `prompts/<機能名>/` に結果を保存 |
| 4. 取り込み・評価 | Claude Code | `/studio-import <機能名>` | `docs/spec.md` 更新、評価レポート |
| 5. 実装 | Claude Code | `/build` | `src/` |
| 6. 検証 | Claude Code | `/verify` | 検証レポート |
| 7. 振り返り | Claude Code | `/retro <気づき>` | `docs/retro.md`、改善タスク、`~/code/ideas/LESSONS.md` |

段階を飛ばさない。AI機能がないアプリは 2〜4 を省略してよい。

## ルール

- `prompts/<機能名>/` の `system_prompt.md` `schema.json` `config.json` は AI Studio で確定した**正本**。実装側で勝手に書き換えない。変更が必要になったら理由を示して提案し、`/studio-brief` に戻る。
- 実装はプロンプトやスキーマを**コードにコピペせず、`prompts/` から読み込む**（正本を1か所に保つため）。
- Gemini の APIキーはフロントエンドに絶対に置かない。サーバー側（Firebase Functions / Cloud Run など）を経由させる。
- 生徒の個人情報（氏名・出席番号など）を API に送らない設計にする。
- 1機能ずつ実装し、動いたらコミットする。
- 利用者は中高生と教員。端末は Chromebook / iPad / スマホを想定し、狭い画面でも使えること。

## コマンド

- プロンプト評価: `node --env-file=.env scripts/eval-prompt.mjs <機能名>`
- 開発サーバー: `npm run dev`（http://localhost:3000）
- テスト: `npm run check`（ミッションの判定と濃度計算のチェック。型チェックは `npm run lint`）
  - ミッションを追加・変更したら `scripts/check-missions.ts` の `SOLUTIONS`（正しい手順）と `MISTAKES`（よくある間違いの手順）にも追加する
  - 実験室のボタン操作は `src/utils/operations.ts` にまとめてあり、画面とチェックの両方がここを使う
- ビルド: `npm run build`（出力は `dist/`）
- CI: プッシュ（main）とプルリクエストのたびに GitHub Actions（`.github/workflows/check.yml`）が lint・check・build を実行する
- 公開: `main` への push で `.github/workflows/deploy-pages.yml` が GitHub Pages に公開する

## 技術スタック

Vite + React 19 + TypeScript + Tailwind CSS v4。アイコンは lucide-react、アニメーションは motion。
AI Studio Build で試作（通常ルート：AI機能なし）。保存は localStorage のみ、サーバーなしの静的アプリ。
GitHub リポジトリは `nozatan530/tsubu-lab`。
公開先：GitHub Pages（https://nozatan530.github.io/tsubu-lab/）。`main` に push（マージ）すると `.github/workflows/deploy-pages.yml` がチェック・ビルドして自動で公開する。`vite.config.ts` は `base: './'`（相対パス）なので、リポジトリ名が変わっても設定し直さなくてよい。

AI Studio の雛形から残っている不要物（仕上げで整理する候補）：
- `@google/genai` `express` `dotenv`（コードからは使っていない）
- `.env.example` の `GEMINI_API_KEY` / `APP_URL`、`metadata.json` の `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`
