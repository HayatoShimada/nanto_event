# Architecture Overview

このドキュメントでは、NANTS Event Platfrom（nanto_event）のシステム構成および主要なアーキテクチャについて説明します。

## 採用技術・スタック

- **フロントエンドフレームワーク**: [Next.js (App Router)](https://nextjs.org/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **バックエンド/BaaS**: [Firebase](https://firebase.google.com/)
  - **認証**: Firebase Authentication (Google ログイン)
  - **データベース**: Cloud Firestore
- **デプロイ/ホスティング**: Vercel (推奨)
- **アイコン**: Heroicons / React Icons (該当パッケージ利用) または SVG直接記述

## システム構成図

```mermaid
graph TD
    Client[Client (Browser)]
    
    subgraph Next.js App Router
        UI[Pages & Components]
        API[API Routes /api/rss]
    end
    
    subgraph Firebase
        Auth[Firebase Authentication]
        Firestore[(Cloud Firestore)]
    end
    
    ExternalRSS[External Note RSS Feeds]

    Client <-->|HTTP/React| UI
    UI -->|Google Login| Auth
    UI <-->|Read/Write Data| Firestore
    UI -->|Fetch RSS| API
    API -->|HTTP GET| ExternalRSS
```

## データモデル (Firestore)

主要なデータは Firestore に格納されています。詳細は `src/types/index.ts` を参照してください。

### `users` コレクション
- 各ユーザーのプロフィール情報を管理します。
- `username`, `photoURL`, `noteUrl`, `twitterUrl`, `instagramUrl`, `githubUrl`, `tags`, `customTags`, `defaultTags`, `followingUsers` などのフィールドを持ちます。

### `events` コレクション
- イベント情報を管理します。
- `name`, `startDate`, `endDate`, `recruitmentUrl`, `description`, `imageURL`, `tags`, `organizerUid`, `organizerType`, `participationCount` などのフィールドを持ちます。

### `teams` コレクション
- グループやコミュニティ（チーム）の情報を管理します。
- `name`, `description`, `imageURL`, `creatorUid`, `snsAccounts`, `tags` などのフィールドを持ちます。

## ディレクトリ構成

- `src/`
  - `app/` : Next.js App Router のページ。ルーティングやレイアウトを定義。
    - `/` (Top), `/news`, `/events`, `/community`, `/mypage` 等
    - `api/` : バックエンドAPIルート。RSS取得用のプロキシサーバーなど。
  - `components/` : 再利用可能なUIコンポーネント群。
  - `lib/` : Firebaseの初期化やユーティリティ関数等のロジック。
    - `firebase/` : Firestoreのデータベース操作関数（`firestore.ts`）等。
  - `types/` : TypeScriptの型定義ファイル。
  - `constants/` : タグリストや絵文字などの定数ファイル。

## 主な機能設計

1. **認証**: Firebase Authenticationのエミュレータ・本番環境を利用したGoogleログインにより行われます。ユーザー情報はログイン時に取得・または作成され `users` コレクションに保存されます。
2. **フィードフェッチ (News)**: フロントエンドからRSSのURLを渡し、Serverless Function (`/api/rss`) を経由してCORS制限を回避しつつ、note等のRSSフィードを取得・パースします。
3. **無限クライアント数ロード**: イベントやニュースは一定数を先読みし、UI側の `IntersectionObserver` により、ユーザーがスクロールするごとに表示件数を増やすフロントエンド主体のフェッチ最適化を施しています。
