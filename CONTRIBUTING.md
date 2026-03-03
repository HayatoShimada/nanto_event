# Contributing Guidelines

NANTS Event Platform の開発にご協力いただきありがとうございます！
このドキュメントでは、バグ報告や機能提案、プルリクエスト（PR）を作成する際のガイドラインを定めています。

## 🎉 始めに

開発環境のセットアップやアーキテクチャについては、[ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照してください。

## 🐛 バグ報告 (Bug Reports)

バグを発見した場合は、[Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) を使用して Issue を作成してください。
以下の情報を含めることで、修正がスムーズになります：
- バグの概要
- 再現手順
- 期待される動作
- 実際の動作
- 使用しているOS/ブラウザのバージョン

## 💡 機能リクエスト (Feature Requests)

新しい機能のアイデアがある場合は、[Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) を使用して Issue を作成してください。
どのような問題を解決したいのか、またはどのようなユースケースがあるのかを明確に記載してください。

## 🛠 開発の流れ (Pull Requests)

コードに変更を加えてPRを作成する際は、以下のフローに従ってください。

### 1. Issue の作成・アサイン
- 全ての変更は、原則として Issue に紐づく必要があります。
- 既存の Issue に取り組む場合はコメントで知らせてください。新規の場合は Issue を立てて議論してから実装に入ることを推奨します（大きな変更の場合）。

### 2. ブランチの作成
メインブランチ (`main`) から新しくブランチを作成してください。
ブランチ名は作業内容がわかるようにし、Issue 番号を含めることを推奨します。

```bash
# 例
git checkout -b feature/issue-12-add-view-all-pages
git checkout -b fix/issue-34-login-error
```

### 3. コミットメッセージ
コミットメッセージは、変更内容が分かりやすいように記述してください。[Conventional Commits](https://www.conventionalcommits.org/) のようなプレフィックス（`feat:`, `fix:`, `docs:`, `refactor:` など）をつけることを推奨します。

### 4. PRの作成
- プッシュ後、GitHub 上から PR を作成してください。
- PRの概要文には、[PRテンプレート](.github/PULL_REQUEST_TEMPLATE.md) を使用し、変更の目的や動作確認の方法を記載してください。
- 関連する Issue 番号を記載し、マージ時に Issue が自動で閉じられるようにしてください (例: `Closes #12`)。

## 📏 コード規約
- コードフォーマッター（PrettierやESLint）が導入されている場合は、そちらのルールに従ってください。
- TypeScriptの型は極力厳密に定義し、`any` を使用しないように努めてください。
- コンポーネントは責務ごとに分割し、再利用性を意識してください。
