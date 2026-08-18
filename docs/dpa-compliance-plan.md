# Data Privacy Act (RA 10173) Compliance & Privacy-by-Design Plan

> **Project:** `kita-kita` (Meeting & Event Attendance Management System)  
> **Applicable Authority:** National Privacy Commission (NPC) of the Philippines  
> **Objective:** Transition `kita-kita` to full compliance with RA 10173 and NPC Circulars (specifically NPC Circular 2023-06, 2023-04, 2022-04, and 16-03) through a systemic **Privacy-by-Design (PbD)** engineering approach featuring persistent **Rules**, **Skills**, and **Gates**.

---

## 1. Current State & Gap Analysis

An audit of the current `kita-kita` codebase reveals the following privacy posture:

```
┌──────────────────────────────────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ Privacy Dimension                    │ Current State in Codebase     │ Compliance Gap (RA 10173 / NPC Circular) │
├──────────────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 1. Data Schema & Minimization        │ id, firstName, lastName       │ Adding email, phone requires validation, │
│                                      │                               │ purpose specification & masking.         │
├──────────────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 2. Storage at Rest                   │ Plaintext AsyncStorage        │ NPC Circular 2023-06 requires encryption │
│                                      │ (kita-kita.attendees.v1)      │ of personal data at rest (AES-256).      │
├──────────────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 3. Transparency & Privacy Notice     │ Missing in-app Privacy Notice │ Sec. 16(1) & Circular 2023-04 require    │
│                                      │ and Consent Modal             │ notice prior to collection/import.       │
├──────────────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 4. Data Subject Rights               │ Add/Import only.              │ Missing individual delete (Erasure),     │
│                                      │ No individual edit/delete.    │ edit (Rectification), & JSON/CSV export. │
├──────────────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 5. Data Retention & Auto-Purge       │ Indefinite storage until clear│ Violates proportionality principle;      │
│                                      │                               │ needs explicit retention timeline.       │
├──────────────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 6. Developer & CI/CD Gates           │ Standard unit tests & lint    │ No automated detection of PII leakage,   │
│                                      │                               │ unmasked logging, or privacy regressions.│
└──────────────────────────────────────┴───────────────────────────────┴──────────────────────────────────────────┘
```

---

## 2. The 4-Phase Compliance Roadmap

```
  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
  │     PHASE 1     │       │     PHASE 2     │       │     PHASE 3     │       │     PHASE 4     │
  │   Governance &  │ ────► │  Privacy-by-    │ ────► │  Rules, Skills  │ ────► │  Incident Prep  │
  │   Assessment    │       │  Design Code    │       │    & CI Gates   │       │   & Continuous  │
  │   (Weeks 1-2)   │       │   (Weeks 3-4)   │       │   (Weeks 5-6)   │       │      Audit      │
  └─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Phase 1: Governance & Privacy Impact Assessment (Weeks 1-2)
1. **Designate a Data Protection Officer (DPO)** or Compliance Officer for Privacy (COP).
2. **Conduct Privacy Impact Assessment (PIA)**:
   - Identify personal data flows (User Input -> CSV Parser -> Local Secure Storage -> Camera Scanner -> Display).
   - Document risks (device loss, unauthorized local access, camera snapshot misuse, unmasked phone/email exposure).
   - Sign off PIA using `docs/privacy-impact-assessment-template.md`.
3. **Draft Core Legal Documents**:
   - In-App Privacy Notice (`docs/privacy-notice-template.md`).
   - Data Retention and Disposal Policy.
   - NPCRS Registration evaluation (check if organization meets 250+ employees or 1,000+ sensitive records threshold under NPC Circular 2022-04).

---

### Phase 2: Technical Architecture & Privacy-by-Design Implementation (Weeks 3-4)

#### A. Data Minimization & Secure Schema
Expand the attendee schema to safely support `email` and `phoneNumber` with strong normalization and privacy helpers:

```typescript
export type Attendee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;       // Normalized lowercase, trimmed
  phoneNumber?: string; // E.164 format (e.g., +639171234567)
  checkedInAt: string | null;
  createdAt: string;    // Timestamp for retention policy
};
```

#### B. Storage Encryption at Rest (NPC Circular 2023-06)
- Wrap local storage in an encryption layer.
- Use OS hardware-backed keystore/keychain via `expo-secure-store` to manage the master encryption key, encrypting attendee payload with AES-256-GCM before writing to storage.
- If running on web, use Web Crypto API (SubtleCrypto) with non-extractable CryptoKeys stored in IndexedDB.

#### C. Privacy Notice & Express Consent UI (NPC Circular 2023-04 & Advisory 2023-01)
- **First-Run / Pre-Import Notice**: Display an unhurried, transparent Privacy Notice before importing CSV files or adding individual attendees.
- **No Deceptive Design**: Equal visual prominence for accepting vs declining non-essential features; no pre-checked consent boxes; clear explanation of data usage (solely for event attendance verification).

#### D. Implementation of Data Subject Rights
1. **Right to Access & Rectification**:
   - Tap to view and edit attendee details directly within the `People` screen.
2. **Right to Erasure / Blocking**:
   - Swipe or tap to permanently delete a single attendee.
   - Dedicated "Wipe All Data" button with confirmation and cryptographic sanitization.
3. **Right to Data Portability**:
   - "Export Attendance List" feature generating structured CSV or JSON with timestamped check-in records.
4. **Right to be Informed**:
   - Permanent "Privacy Policy & NPC Compliance" view accessible in the app drawer/header.

#### E. Masking & PII Redaction
- Implement utility functions (`maskEmail`, `maskPhone`) so that search lists and overview screens mask phone numbers (e.g. `+63 917 *** 4567`) and emails (`j***@example.com`) by default, requiring an intentional action to view full details.

---

## 3. Integrating Compliance into the Development Process: Rules, Skills, and Gates

To prevent privacy from becoming an afterthought, compliance is enforced at three distinct layers:

```
                                  ┌────────────────────────────────┐
                                  │   DEVELOPMENT WORKFLOW GATES   │
                                  └───────────────┬────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
       ┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
       │   LAYER 1: RULES  │            │  LAYER 2: SKILLS  │            │  LAYER 3: GATES   │
       │                   │            │                   │            │                   │
       │ Persistent AI     │            │ Reusable Audit &  │            │ Pre-commit & CI/CD│
       │ Coding Guardrails │            │ Verification Tools│            │ Automated Checks  │
       │ (.cursor/rules/)  │            │ (.cursor/skills/) │            │ (Scripts & Tests) │
       └───────────────────┘            └───────────────────┘            └───────────────────┘
```

---

### Layer 1: Rules (Persistent AI & Developer Guidance)

Rules live in `.cursor/rules/` and guide both developers and Cursor AI agents in real-time during every coding session.

#### Rule 1: `privacy-compliance.mdc`
- **Location**: `.cursor/rules/privacy-compliance.mdc`
- **Enforcement**:
  1. **Zero Raw PII in Logs**: Strictly prohibit `console.log(attendee)`, `console.debug`, or analytics calls containing unmasked names, emails, or phone numbers.
  2. **Storage Encryption**: Disallow direct unencrypted writes of PII to `AsyncStorage` or unencrypted SQLite tables.
  3. **Privacy Notice Verification**: Require that any new data collection point (inputs, CSV fields, camera scans) includes corresponding privacy notice updates.
  4. **Data Subject Rights Parity**: Any new data entity storing personal info must include deletion (Erasure), update (Rectification), and export (Portability) mechanisms.

---

### Layer 2: Skills (Automated Agent Privacy Auditing)

Agent Skills enable the AI to execute deep privacy audits on demand or during PR review.

#### Skill: `dpa-compliance-check`
- **Location**: `.cursor/skills/dpa-compliance-check/SKILL.md`
- **Capabilities**:
  - Scans git diffs or file changes for unredacted PII logging.
  - Verifies that new fields comply with the declared PIA and data minimization principles.
  - Checks for the presence of deceptive design patterns (e.g., mismatched button weights on consent prompts).
  - Validates that privacy headers, notice links, and export/delete operations are intact.

---

### Layer 3: Gates (Automated Quality & Release Safeguards)

Gates are concrete mechanical checkpoints that prevent non-compliant code from being merged or deployed.

```
Code Change ──► [Gate 1: Pre-Commit Hook] ──► [Gate 2: CI Test Suite] ──► [Gate 3: PR Review Checklist] ──► [Gate 4: Release Gate]
                      (Lint & PII Scan)             (Privacy Unit Tests)            (DPO / Security Signoff)       (NPC Seal & Audit)
```

#### Gate 1: Pre-Commit Static PII & Privacy Scan
- **Mechanism**: Pre-commit script (`scripts/verify-privacy-gates.js` run via npm test/husky).
- **Checks**:
  - Regex detection for `console.log` containing `email`, `phone`, `attendee`, `firstName`, `lastName`.
  - Detection of unencrypted `AsyncStorage.setItem` calls saving raw attendee lists.
  - Verification that mock test fixtures do not use real individuals' phone numbers or email addresses (must use `@example.com` and `555`/dummy formats).

#### Gate 2: CI/CD Automated Privacy Test Suite
- **Mechanism**: Jest automated test suite (`src/lib/__tests__/privacy-compliance-test.ts`).
- **Tests**:
  - `test('data subject erasure completely purges records from storage')`
  - `test('data portability export generates valid RFC 4180 CSV / JSON schema')`
  - `test('masking functions redact email and phone numbers in non-admin views')`
  - `test('consent state must be active before data ingestion')`
  - `test('logs and error outputs are sanitized of PII')`

#### Gate 3: Pull Request (PR) Privacy Gate
- **Mechanism**: GitHub PR Template (`.github/pull_request_template.md`).
- **Required PR Checklist**:
  - [ ] No new personal information fields added without updating the Privacy Impact Assessment (PIA).
  - [ ] All new PII fields are masked in logs and debug telemetry.
  - [ ] User consent / privacy notice updated if new data processing purpose is introduced.
  - [ ] Data subject rights (export/delete/edit) maintained for modified schemas.
  - [ ] No deceptive design patterns introduced in UI/UX flows.

#### Gate 4: Release & Deployment Gate
- **Mechanism**: Pre-release checklist before submitting app binaries to App Store / Google Play / Web deployment:
  - NPC Seal of Registration / DPO contact verified in app settings.
  - Dependency vulnerability scan (`npm audit`).
  - Privacy policy URL active and matching app version.
  - Data retention background purge worker verified.

---

## 4. Operationalization: Staying Compliant

Compliance is not a one-time setup; it requires sustained operational rhythm:

| Cadence | Operational Activity | Responsible Party |
| :--- | :--- | :--- |
| **Per Commit / PR** | Automated Privacy Gates (PII Scan, Encryption Tests, PR Privacy Checklist) | Developer / CI Pipeline |
| **Monthly** | Review error logs & crash reports to ensure zero PII leakage in Sentry/telemetry | Engineering Lead |
| **Quarterly** | Privacy Impact Assessment (PIA) review against feature backlog; dependency security audit | DPO & Tech Lead |
| **Bi-Annually** | Internal privacy compliance sweep & mock data subject request exercises (Erasure/Export) | DPO |
| **Annually** | Renewal of NPC registration (NPCRS portal) & submission of Annual Security Incident Summary | DPO & Management |
| **As Needed (72-hr SLA)**| Personal Data Breach Protocol execution under NPC Circular 16-03 | Incident Response Team |

---

## 5. Summary of Deliverables & Action Items

```
┌────┬──────────────────────────────────────────┬───────────────────────────────────────────┬──────────────┐
│ #  │ Deliverable                              │ Target File / Path                        │ Status       │
├────┼──────────────────────────────────────────┼───────────────────────────────────────────┼──────────────┤
│ 1  │ DPA Research & Statutory Summary         │ docs/npc-data-privacy-act-summary.md      │ Completed    │
│ 2  │ DPA Compliance & Architecture Plan       │ docs/dpa-compliance-plan.md               │ Completed    │
│ 3  │ In-App Privacy Notice Template           │ docs/privacy-notice-template.md           │ Implementing │
│ 4  │ Privacy Impact Assessment (PIA) Template │ docs/privacy-impact-assessment-template.md│ Implementing │
│ 5  │ Cursor Privacy Compliance Rule           │ .cursor/rules/privacy-compliance.mdc      │ Implementing │
│ 6  │ Cursor Agent Privacy Audit Skill         │ .cursor/skills/dpa-compliance-check/SKILL.md Implementing│
│ 7  │ Automated Privacy Gate Scanner Script    │ scripts/verify-privacy-gates.js           │ Implementing │
└────┴──────────────────────────────────────────┴───────────────────────────────────────────┴──────────────┘
```
