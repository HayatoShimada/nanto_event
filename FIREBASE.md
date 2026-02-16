
はい、Firebase Console での設定も必要です。このプロジェクトで使っている機能に合わせて、以下を確認・設定してください。

## 1. Authentication（認証）

- **プロジェクト設定 → Authentication → Sign-in method** で、使う方式を有効化
  - メール/パスワード
  - Google（必要なら）
- **認証されたドメイン**に、開発中の `localhost` や本番ドメインを追加

## 2. Firestore（データベース）

- **Firestore Database** を有効化
- **ルール**を設定（`firestore.rules` をデプロイするか、Console 上で同等のルールを設定）

## 3. Cloud Storage（ファイル保存）

- **Storage** を有効化
- **ルール**を設定（`storage.rules` をデプロイするか、Console 上で同等のルールを設定）

## 4. Cloud Functions とメール送信

- メール送信用の **Trigger Email 拡張機能**を使う場合は Blaze プランが必要
- Functions のデプロイ
- 拡張機能のインストールと、SMTP（SendGrid など）の設定

## 5. その他

- **API Key の制限**（本番運用時）: Google Cloud Console で API キーに制限をかけると安全です
- **OAuth 同意画面**（Google ログインを使う場合）: GCP Console で設定が必要です

すでに `nantoevent-437ae` プロジェクトを作成済みなら、上記の各機能の有効化とルール・認証設定を確認すれば動作するはずです。