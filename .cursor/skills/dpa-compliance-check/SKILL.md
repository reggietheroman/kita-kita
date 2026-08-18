---
name: dpa-compliance-check
description: Audit code changes, schemas, storage mechanisms, and UI components for compliance with the Philippine Data Privacy Act (RA 10173) and National Privacy Commission (NPC) regulations. Use when reviewing PRs, adding PII fields, or auditing privacy safeguards.
disable-model-invocation: true
---

# Philippine DPA & NPC Compliance Audit Skill

Use this skill to audit repository code against the **Data Privacy Act of 2012 (Republic Act No. 10173)**, **NPC Circular 2023-06 (Security of Personal Data)**, and **NPC Advisory 2023-01 (Deceptive Design Patterns)**.

---

## Audit Checklist

When auditing code changes, verify all 5 privacy dimensions:

### 1. Zero Plaintext PII in Logs & Telemetry
- [ ] Scan for `console.log`, `console.warn`, `console.error`, and telemetry calls.
- [ ] Ensure full names, emails, phone numbers, and full `Attendee` objects are NOT logged in plaintext.
- [ ] Ensure error messages and catch blocks do not interpolate raw user contact details.

### 2. Encryption at Rest & Secure Storage
- [ ] Verify that attendee contact information is not written to unencrypted storage (`AsyncStorage.setItem` with plaintext JSON).
- [ ] Ensure sensitive encryption keys are managed securely (`expo-secure-store` / hardware keystore).

### 3. Data Minimization & Validation
- [ ] Check if new fields (e.g., `email`, `phoneNumber`) are strictly necessary for the declared purpose.
- [ ] Ensure email addresses and phone numbers are validated and normalized.
- [ ] Check for data masking helpers (`maskEmail`, `maskPhone`) used in non-privileged UI views.

### 4. Data Subject Rights Parity
- [ ] **Erasure:** Verify that users can delete single attendee records and wipe all event data.
- [ ] **Rectification:** Verify that attendees can be edited / updated.
- [ ] **Portability:** Verify that attendee data can be exported in structured CSV or JSON formats.
- [ ] **Transparency:** Verify that any new data collection point has corresponding notice in the in-app Privacy Policy.

### 5. Consent & UI/UX Integrity (No Dark Patterns)
- [ ] Ensure consent dialogues do not use coercive colors, sizes, or pre-ticked checkboxes.
- [ ] Ensure equal visual prominence for "Accept" and "Decline" buttons.

---

## Automated Verification Script

Run the automated privacy gate scanner across the repository:

```bash
node scripts/verify-privacy-gates.js
```

---

## Audit Output Template

```markdown
### 🛡️ NPC Data Privacy Act Audit Report

- **Audit Target:** [File / PR / Diff]
- **Compliance Status:** [PASS / FAIL / ACTION REQUIRED]

#### Findings:
1. **PII Logging:** [✅ Passed / ❌ Found unmasked logging at Line X]
2. **Storage Security:** [✅ Encrypted / ❌ Plaintext storage detected]
3. **Data Minimization:** [✅ Verified / ⚠️ Excessive fields detected]
4. **Data Subject Rights:** [✅ Supported / ❌ Missing deletion/export]
5. **UI & Consent:** [✅ Free of dark patterns / ❌ Coercive UI detected]

#### Required Actions:
- [Action item 1]
```
