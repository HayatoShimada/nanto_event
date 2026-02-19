# Firebase 設定手順 (Nanto Event プロジェクト)

このプロジェクト (`nantoevent-437ae`) を正常にデプロイ・動作させるために、Firebase コンソール側で以下の設定を行ってください。

## 1. Firebase コンソールへアクセス

まず、以下のリンクから Firebase コンソールを開きます。
**URL**: [https://console.firebase.google.com/project/nantoevent-437ae/overview](https://console.firebase.google.com/project/nantoevent-437ae/overview)

---

## 2. Authentication (認証) の有効化

ユーザーログイン機能を使用するために必要です。

1.  左メニューの **「構築 (Build)」** > **「Authentication」** をクリックします。
2.  **「始める (Get started)」** ボタンをクリックします。
3.  **「ログイン方法 (Sign-in method)」** タブで、以下のプロバイダを有効にします：
    *   **Google**: 「有効にする」スイッチをONにし、プロジェクトのサポートメールアドレスを選択して「保存」します。
    *   (必要に応じて) **メール/パスワード**: 「有効にする」スイッチをONにして「保存」します。

---

## 3. Cloud Firestore (データベース) の作成

イベント情報やユーザーデータを保存するために必要です。

1.  左メニューの **「構築」** > **「Firestore Database」** をクリックします。
2.  **「データベースの作成 (Create database)」** をクリックします。
3.  **ロケーション**: `asia-northeast1` (東京) などを選択し、「次へ」をクリックします。
4.  **セキュリティルール**: 「本番環境モードで開始」または「テストモードで開始」を選択し、「作成」をクリックします。
    *   *※開発中はテストモードが便利ですが、30日後にアクセスできなくなるため、後でルールを適切に設定する必要があります。*

---

## 4. Storage (ファイル保存) の開始

**重要**: 先ほどのデプロイエラーの原因です。画像のアップロード機能などに使用します。

1.  左メニューの **「構築」** > **「Storage」** をクリックします。
2.  **「始める (Get started)」** ボタンをクリックします。
3.  **セキュリティルール**: 「本番環境モードで開始」または「テストモードで開始」を選択し、「次へ」をクリックします。
4.  **ロケーション**: Firestoreと同じロケーション (例: `asia-northeast1`) が選択されていることを確認し、「完了」をクリックします。

---

---

## 5. 環境変数の設定 (重要: エラー回避のため)

現在発生している `Firebase: Error (auth/invalid-api-key)` を解消するために必要です。

1.  プロジェクトルートに `.env.local` ファイルを作成します（`.env.local.example` をコピーしてもOK）。
2.  Firebaseコンソールの「プロジェクトの設定 (Project settings)」 > 「全般 (General)」 > 「マイアプリ (Your apps)」から、Webアプリ（`nanto_event`）の設定を確認します。
3.  表示された `firebaseConfig` オブジェクトの内容を、以下のように `.env.local` に記述してください。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nantoevent-437ae.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nantoevent-437ae
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nantoevent-437ae.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=631809268000
NEXT_PUBLIC_FIREBASE_APP_ID=1:631809268000:web:e023fe32dba964dd7c9f45
```

---

## 6. デプロイの実行

上記の設定が完了した後、ターミナルで以下のコマンドを実行して再度デプロイしてください。

```bash
firebase deploy
```

もし、Webサイトの公開だけを先に行いたい場合（Storageなどの設定を後回しにする場合）は、以下のコマンドで Hosting 機能のみをデプロイできます。

```bash
firebase deploy --only hosting
```
