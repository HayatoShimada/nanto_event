---
marp: true
---

# 南砺市イベントページの実装

---

## 現状課題

- SNS発信だと、イベント情報が流れてしまう。
- ファン情報が拡散するので、認知→ファン化の流れが形成できない。
- 主催者・参加者相互の連絡手段が乏しい・時間がかかる。

---

## イベントページの主目的

- イベント情報の固定化
- 会員情報の獲得・リード化
- 主催者・参加者間の情報発信簡略化

---

## ページ要素

- HOME
- ABOUT
- COLLABORATOR
- EVENT LIST
- MY PAGE

---

### HOME

- ヘッダー
- 最新イベントリスト

---

### ABOUT

- ひだっち紹介
  - https://note.com/nantofam710
- 85-Store紹介
  - https://85-store.com

---

### EVENT LIST

- カレンダーで開催イベントを表示
- イベントのリスト

---

### CONTACT

---

## テーブル定義

各種イベントの時間予約、参加者管理、開催者・共同参加者の連絡、一般参加の申込・キャンセル、メール配信可否を扱う。

---

### EVENT（イベント）

- id, name, categories
- start_date, finish_date
- organizer_user_id（開催者）
- email_notification（メール配信するか: true/false）
- 

---

### USER（ユーザー）

- id, role（general / admin / collaborator）
- username, mail
- postalcode, address

---

### EVENT_COLLABORATOR（イベント × 共同参加者）

- event_id, user_id
- 開催者と共同参加者の紐付け。誰に連絡するか・誰が共同で運営するかを管理。

---

### EVENT_PARTICIPATION（イベント参加者管理）

- event_id, user_id
- status（attending / cancelled）
- registered_at（申込日時）
- cancelled_at（キャンセル日時・null なら参加中）
- email_opt_in（このイベントでメールを受け取るか: true/false）

一般参加者の「誰が参加するか」と「キャンセル」を一覧で管理。メール配信はイベント側の設定と、参加者ごとの受け取り希望の両方で制御。

---

## Tech Stack（Firebase）

認証・DB・ホスティングを Firebase に寄せ、開発・運用をシンプルにする構成。

---

### Firebase サービス

| サービス | 用途 |
|----------|------|
| **Firebase Authentication** | 会員登録・ログイン。Email/パスワードや Google 等。 |
| **Cloud Firestore** | EVENT / USER / EVENT_COLLABORATOR / EVENT_PARTICIPATION をドキュメントで保存。 |
| **Firebase Hosting** | フロントの配信。カスタムドメイン・SSL 対応。 |
| **Cloud Functions** | メール送信（申込確認・リマインド・キャンセル通知）や role の付与など。 |

---

### フロントエンド

| 項目 | 候補 | 理由 |
|------|------|------|
| フレームワーク | **Next.js** または **React**（Vite） | Firebase JS SDK で Firestore・Auth と連携。 |
| UI | Tailwind CSS + コンポーネント庫 | カレンダー・フォーム・一覧を素早く実装。 |
| カレンダー | react-big-calendar / FullCalendar | イベント一覧のカレンダー表示。 |

Firebase Hosting で Next.js を `firebase deploy`、またはビルド済み静的サイトを配信。

---

### Firestore コレクション（テーブル定義との対応）

- **users** … USER（uid は Auth と一致。role, username, mail, postalcode, address を保存）
- **events** … EVENT（name, categories, start_date, finish_date, organizer_uid, email_notification）
- **event_collaborators** … EVENT_COLLABORATOR（event_id, user_id）
- **event_participations** … EVENT_PARTICIPATION（event_id, user_id, status, registered_at, cancelled_at, email_opt_in）

role（general / admin / collaborator）は users ドキュメント、または Custom Claims で管理。

---

### メール配信

- **Cloud Functions** で Firestore の作成・更新をトリガーに、**Resend** / SendGrid 等の API を呼び出して送信。
- 例: `event_participations` に新規ドキュメント → 申込確認メール、status が cancelled に変更 → キャンセル通知。

---

### 構成まとめ

- **フロント**: Next.js（または React）+ Firebase SDK + Tailwind
- **認証**: Firebase Authentication
- **DB**: Cloud Firestore
- **メール**: Cloud Functions + Resend（または SendGrid）
- **ホスティング**: Firebase Hosting（＋ 必要に応じて Cloud Run で SSR）

---

## デザイン

https://wired.jp/branded/futures-realities-2022/