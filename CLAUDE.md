# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

南砺市イベントページ — a web application for centralizing event information, managing participation, and facilitating communication between event organizers and participants in Nanto City.

## Build & Dev Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # Run ESLint

# Cloud Functions
cd functions && npm run build   # Build functions
cd functions && npm run serve   # Build + start emulators
```

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Auth**: Firebase Authentication (email/password + Google OAuth)
- **DB**: Cloud Firestore
- **Storage**: Firebase Cloud Storage (event images, user avatars)
- **Backend**: Cloud Functions v2 (TypeScript, Node 20)
- **Email**: Firebase Trigger Email Extension (via `mail` collection)
- **Calendar**: FullCalendar (Japanese locale)
- **Rich Text**: Tiptap (event descriptions in HTML)
- **Forms**: react-hook-form + Zod validation

## Architecture

### Directory Structure

- `src/app/` — Next.js App Router pages (all use `<Header/>`+`<Footer/>` wrapper)
- `src/components/` — React components organized by feature (events/, auth/, mypage/, layout/, editor/, ui/)
- `src/lib/firebase/` — Firebase SDK initialization and service functions
  - `config.ts` — Lazy-initialized Firebase app (SSR-safe with `typeof window` guard)
  - `auth.ts` — Auth helpers (register, login, logout, createUserProfile)
  - `firestore.ts` — Firestore CRUD for all collections
  - `storage.ts` — Image upload/delete for events and user avatars
- `src/hooks/` — Real-time Firestore hooks using `onSnapshot`
- `src/types/index.ts` — All TypeScript type definitions
- `src/contexts/AuthContext.tsx` — Auth state provider (`'use client'`)
- `src/lib/utils/` — Zod schemas (`validation.ts`) and date formatting (`date.ts`)
- `functions/` — Cloud Functions (separate TypeScript project with own tsconfig)

### Key Patterns

- **Client components**: All Firebase-dependent components use `'use client'` directive
- **Firebase SSR safety**: `config.ts` uses `typeof window !== "undefined"` guard — Firebase SDK only initializes on client
- **Auth flow**: `AuthProvider` wraps entire app in layout.tsx, `AuthGuard` component for role-based access control
- **Event description**: Stored as HTML, edited with Tiptap, rendered with `dangerouslySetInnerHTML`
- **Image uploads**: `ImageUploader` reusable component (drag-and-drop, 5MB limit, JPEG/PNG/WebP)
- **Cloud Functions triggers**: Firestore document changes trigger email via `mail` collection

### Data Model (Firestore Collections)

| Collection | Key Fields |
|---|---|
| `users` | uid, role (general/admin/collaborator), username, mail, postalcode, address, photoURL |
| `events` | name, description (HTML), location, imageURL, categories, startDate, finishDate, organizerUid, emailNotification |
| `event_collaborators` | eventId, userId |
| `event_participations` | eventId, userId, status (attending/cancelled), emailOptIn |

### Security Rules

- `firestore.rules` — Role-based access: events public read, write by admin/collaborator; users self-update only
- `storage.rules` — 5MB limit, image/* only; user avatars self-write, event images by auth users

## Language

All UI text and documentation is in Japanese. The application targets users in the Nanto City (南砺市) region.
