# AI Email Prioritization Desktop App (Electron) – Build Plan

## Objective
Build a local-first Electron desktop application that securely syncs emails from a user’s inbox, applies AI-based prioritization, and presents a clean, actionable inbox sorted by importance.

---

## Core Principles
- Local-first (privacy by default)
- Read-only email access
- AI-assisted, rule-driven prioritization
- Modular, extensible architecture
- Desktop-native UX (Electron)

---

## Architecture Overview

Email Provider (Gmail / Outlook / Custom IMAP)
→ IMAP Sync Service
→ Email Normalization Layer
→ AI Classification + Rule Engine
→ Local Database
→ Electron UI

---

## Technology Stack

### Desktop
- Electron
- Node.js (backend services)
- React (renderer UI)

### Email
- IMAP via `imapflow`
- OAuth2 (Gmail / Outlook)
- App passwords (fallback)

### AI
- Phase 1: Cloud LLM (OpenAI / Gemini)
- Phase 2: Local LLM (Ollama / LM Studio)
- Prompt-based classification

### Storage
- SQLite (emails, rules, metadata)
- Keytar (secure token storage)

---

## Email Ingestion

### Scope
- Read-only inbox access
- Periodic sync (configurable interval)
- No deletion or mutation of emails

### Data Extracted
- Sender address + domain
- Subject
- Plain-text body (first 300–500 chars)
- Timestamp
- Attachment presence (boolean)

### Output Format
Normalized JSON per email:
```json
{
  "id": "email_id",
  "from": "sender@domain.com",
  "subject": "Subject text",
  "body": "Cleaned snippet",
  "hasAttachments": true,
  "receivedAt": "ISO8601"
}
