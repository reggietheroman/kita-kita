# Privacy Impact Assessment (PIA) Report

> **Standard:** National Privacy Commission (NPC) Advisory No. 2017-01 & NPC Circular 2023-06  
> **Project / System Name:** `kita-kita` (Event Attendance & Participant Check-in Platform)  
> **Personal Information Controller (PIC):** [Organization Name]  
> **Date of Assessment:** August 18, 2026  
> **Lead Assessor / DPO:** [DPO Name / Security Lead]  

---

## 1. Description of the Processing Operation

### 1.1 Purpose of the Project
`kita-kita` is an attendance tracking mobile application designed for event managers to import attendee rosters (via CSV or manual entry), verify participant presence using optical QR code scanning, and maintain accurate check-in records.

### 1.2 Data Elements Processed
| Category | Specific Data Elements | Classification | Source |
| :--- | :--- | :--- | :--- |
| **Personal Identifiers** | First Name, Last Name | Personal Information (PI) | User CSV Upload / Direct Input |
| **Contact Data** | Email Address, Mobile Phone Number | Personal Information (PI) | User CSV Upload / Direct Input |
| **Operational Metadata**| Attendee ID, QR Payload, Check-in Timestamp | Personal Information (Linked) | System Generated / Camera Scan |

*Note: No Sensitive Personal Information (SPI) such as government IDs, health records, or biometric data is processed.*

### 1.3 Data Flow Lifecycle
```
[1. Data Collection] ──► [2. Parsing & Validation] ──► [3. Local Encrypted Storage]
   (CSV / Form Input)        (Format checks, E.164)        (AES-256 / SecureStore)
                                                                  │
                                                                  ▼
[5. Deletion / Export] ◄── [4. Check-in Operation] ◄──────────────┘
 (Erasure / Portability)       (Camera QR Match)
```

---

## 2. Assessment of Privacy Principles Compliance

| Principle | NPC Requirement | Implementation in `kita-kita` | Status |
| :--- | :--- | :--- | :--- |
| **Transparency** | Data subjects informed prior to collection | In-app Privacy Notice and consent dialog displayed before data ingestion. | Compliant |
| **Legitimate Purpose** | Specified, explicit, and lawful purpose | Purpose restricted strictly to event attendance verification and direct logistics. | Compliant |
| **Proportionality** | Data minimization; retention limits | Only minimal fields collected (Name, Email, Phone, ID); 30-day auto-purge retention policy. | Compliant |
| **Data Quality** | Accurate, complete, and up-to-date | Edit/Rectification tools provided in `People` view; CSV validation checks. | Compliant |
| **Fairness** | No manipulative / deceptive design | Clear, unbundled consent without coercive UI (NPC Advisory 2023-01). | Compliant |

---

## 3. Privacy Risk Assessment & Treatment Plan

| Risk ID | Threat Scenario | Impact | Likelihood | Inherent Risk | Mitigation Measure (Treatment) | Residual Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | Device loss or theft leading to unauthorized access to attendee roster. | High | Medium | **HIGH** | Encrypt storage at rest using AES-256 with key stored in OS hardware keystore (`expo-secure-store`). Enforce device lock. | **LOW** |
| **R-02** | Exposure of phone numbers and emails via developer logs or crash trackers. | Medium | High | **HIGH** | Static CI gates & ESLint rules banning PII logging; runtime masking helper (`maskEmail`, `maskPhone`). | **LOW** |
| **R-03** | Indefinite retention of attendee contacts on organizers' personal phones. | Medium | High | **HIGH** | Configurable retention expiration warning and "Wipe Event Data" button. | **LOW** |
| **R-04** | Inability of data subject to exercise right to erasure or correction. | Medium | Medium | **MEDIUM** | In-app individual delete, edit, and export JSON/CSV features. | **LOW** |
| **R-05** | QR code interception displaying plaintext personal contact information. | Medium | Low | **MEDIUM** | QR payloads use opaque UUIDs or cryptographically signed tokens instead of raw emails/phones. | **LOW** |

---

## 4. Organizational & Technical Safeguards (NPC Circular 2023-06)

1. **Organizational:**
   - DPO appointed and designated.
   - Formal Privacy Policy published and linked.
   - Annual DPA training required for all event coordinators.
2. **Technical:**
   - Transport Layer Security (TLS 1.3) for any network syncing.
   - AES-256-GCM encryption for persistent local storage.
   - PII masking on UI displays (e.g., `+63 917 *** 1234`).
3. **Breach Management:**
   - 72-hour notification protocol in place using NPC DBNMS portal (NPC Circular 16-03).

---

## 5. DPO Sign-Off & Review Cycle

- **Assessment Status:** APPROVED WITH CONDITIONS
- **Next Review Date:** August 18, 2027 (Annual Review or upon major schema change)

| Role | Name | Signature / Timestamp |
| :--- | :--- | :--- |
| **Lead Developer** | [Engineering Lead] | `2026-08-18` |
| **Data Protection Officer (DPO)** | [DPO Name] | `2026-08-18` |
