# Republic of the Philippines Data Privacy Act of 2012 (RA 10173) & NPC Compliance Summary

> **Document Version:** 1.0.0  
> **Applicable Regulations:** Republic Act No. 10173 (DPA of 2012), Implementing Rules and Regulations (IRR 2016 as amended), NPC Circulars (2016-03, 2022-01, 2022-04, 2023-01, 2023-04, 2023-06, 2023-07), NPC Advisory 2023-01 (Deceptive Design Patterns), and NPC Advisory 2017-01 (PIA).  
> **Project Scope:** `kita-kita` (Event Attendance & Contact Tracking App handling First Name, Last Name, Email, Phone Number, Attendee ID, and Check-in Records).

---

## 1. Executive Summary & Regulatory Authority

The **Data Privacy Act of 2012 (Republic Act No. 10173)** is the comprehensive data protection law of the Philippines. It protects the fundamental human right of privacy while ensuring the free flow of information to promote innovation and growth.

The law is administered and enforced by the **National Privacy Commission (NPC)**, an independent regulatory body under the Department of Information and Communications Technology (DICT).

### Extraterritorial Application (Section 4 & 6)
The DPA applies extraterritorially:
1. To the processing of personal information in the Philippines by any natural or juridical entity.
2. To Personal Information Controllers (PICs) or Personal Information Processors (PIPs) located outside the Philippines if:
   - The processing relates to personal information of Philippine citizens or Philippine residents.
   - The entity has a link with the Philippines (e.g., contract in the Philippines, branch/office, or business directed at Philippine consumers).

---

## 2. Key Legal Definitions & Classifications

| Concept | Statutory Definition (RA 10173 Sec. 3) | Application to `kita-kita` |
| :--- | :--- | :--- |
| **Personal Information (PI)** | Any information whether recorded in a material form or not, from which the identity of an individual is apparent or can be reasonably and directly ascertained. | **First Name, Last Name, Email Address, Phone Number, Attendee ID** |
| **Sensitive Personal Information (SPI)** | Information about individual's race, ethnic origin, marital status, age, color, religious/philosophical affiliations, health, education, genetics, sexual life, offenses/proceedings, government-issued IDs (e.g. SSS, GSIS, passport), or tax returns. | *Currently out of scope for basic attendance, but must ensure government ID numbers or health status are not collected without strict SPI protections.* |
| **Personal Information Controller (PIC)** | A person or organization that controls the collection, holding, processing, or use of personal information. | **The organization/event organizer operating `kita-kita`** |
| **Personal Information Processor (PIP)** | Any natural or juridical person to whom a personal information controller may outsource the processing of personal data. | **Third-party cloud infrastructure (e.g. Firebase, Cloudflare, AWS, Supabase)** |
| **Data Subject** | An individual whose personal information is processed. | **Attendees, Event Participants, Registered Users** |
| **Processing** | Any operation performed upon personal data including collection, recording, organization, storage, updating, retrieval, consultation, use, consolidation, blocking, erasure, or destruction. | **Importing CSV, Scanning QR, Storing locally/remotely, Editing, Deleting, Check-in matching** |

---

## 3. Core Data Privacy Principles (Rule IV, IRR & Section 11)

All data processing operations must strictly adhere to three foundational pillars:

```
                  ┌─────────────────────────────────────────┐
                  │        DATA PRIVACY PRINCIPLES          │
                  └────────────────────┬────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│  TRANSPARENCY │              │  LEGITIMATE   │              │PROPORTIONALITY│
│               │              │    PURPOSE    │              │               │
│Clear notices, │              │Specified,     │              │Data           │
│explicit info  │              │explicit, and  │              │minimization,  │
│before/during  │              │lawful purpose;│              │strictly       │
│collection.    │              │no scope-creep.│              │necessary only.│
└───────────────┘              └───────────────┘              └───────────────┘
```

1. **Transparency (Section 18, IRR)**:
   - The data subject must be aware of the nature, purpose, and extent of the processing of their personal data.
   - Must provide a clear, plain-language **Privacy Notice** before or at the time of data collection.
2. **Legitimate Purpose (Section 18, IRR)**:
   - Personal data shall be processed only for specified and legitimate purposes declared to the data subject and not contrary to law, morals, or public policy.
3. **Proportionality (Section 18, IRR & NPC Circular 2023-06)**:
   - The processing of personal data shall be adequate, relevant, suitable, necessary, and not excessive in relation to the declared purpose.
   - Only collect fields strictly needed (e.g. do not collect national ID or date of birth if only first name, last name, email, and phone number are needed for check-in).
   - Personal data must not be retained longer than necessary for the declared purpose.
4. **Data Quality & Fairness (NPC Circular 2023-04 & NPC Advisory 2023-01)**:
   - Data must be accurate and kept up to date.
   - Processing must not be manipulative or deceptive. **Deceptive Design Patterns (Dark Patterns)** are strictly prohibited and vitiate consent.

---

## 4. Lawful Criteria for Processing Personal Information (Section 12)

For `kita-kita` to process personal information (Name, Email, Phone), at least one lawful condition must be satisfied:

1. **Express Consent (Section 12(a) & NPC Circular 2023-04)**:
   - Must be **freely given, specific, informed, and evidenced by written, electronic, or recorded means**.
   - Must be obtained prior to collection or processing.
   - Pre-ticked checkboxes or forced bundled consent are invalid.
   - The data subject must have an easy, unburdened mechanism to **withdraw consent** at any time.
2. **Contractual Necessity (Section 12(b))**:
   - Processing is necessary for the fulfillment of a contract (e.g., event registration agreement) to which the data subject is a party.
3. **Legitimate Interests (Section 12(f) & NPC Circular 2023-07)**:
   - Requires passing the three-part test: (1) Purpose Test, (2) Necessity Test, and (3) Balancing Test (ensuring fundamental rights of the individual override legitimate commercial interests).

---

## 5. The 8 Statutory Rights of Data Subjects (Section 16)

Under the Philippine DPA, data subjects hold fundamental rights that the software system must actively support:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       8 DATA SUBJECT RIGHTS (RA 10173)                      │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ 1. To be Informed │ Right to know what data is collected, why, how long it  │
│                   │ is stored, and who receives it (via Privacy Notice).    │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 2. Access         │ Right to obtain a copy of their personal data and know  │
│                   │ the sources, recipients, and processing methods.        │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 3. Object         │ Right to refuse or withdraw consent for data processing │
│                   │ (e.g., marketing, attendance profiling).               │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 4. Erasure/Block  │ Right to request permanent deletion or blocking of      │
│                   │ inaccurate, outdated, or unlawfully obtained data.      │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 5. Rectification  │ Right to dispute inaccurate or incomplete information   │
│                   │ and have it corrected immediately.                      │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 6. Portability    │ Right to obtain personal data in a structured, commonly │
│                   │ used electronic format (JSON / CSV export).             │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 7. Damages        │ Right to be indemnified for damages suffered due to     │
│                   │ inaccurate, false, unlawfully obtained, or leaked data. │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 8. Complain       │ Right to lodge an official complaint before the NPC.    │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 6. Mandatory Security Measures (NPC Circular 2023-06)

NPC Circular 2023-06 (*Security of Personal Data in the Government and Private Sector*, effective March 30, 2024) mandates three tiers of security safeguards:

### 1. Organizational Security Measures
- **Designation of Data Protection Officer (DPO)**: Appoint an individual accountable for data protection compliance.
- **Privacy Management Program (PMP)**: Documented privacy policies and Privacy Manual.
- **Privacy Impact Assessment (PIA)**: Required prior to deploying any new data processing system or substantial feature.
- **Subcontractor / PIP Agreements**: Formal Data Sharing Agreements (DSA) or Data Processing Agreements (DPA) containing mandatory Section 14 clauses (confidentiality, security requirements, breach reporting).
- **Staff Training & NDAs**: Mandatory privacy awareness training for anyone with access to personal data.

### 2. Physical Security Measures
- Controlled physical access to devices, servers, or paper rosters.
- Device lock policies (PIN/biometric) and remote wipe capabilities on devices running attendance scanning.

### 3. Technical Security Measures
- **Encryption at Rest**: Stored personal data (attendee lists, names, phone numbers, emails) must be encrypted using industry-standard algorithms (e.g. AES-256). In React Native/Expo:
  - High-risk / sensitive keys/tokens in `expo-secure-store` or hardware-backed Keystore/Keychain.
  - Large datasets encrypted at SQLite / storage level or anonymized.
- **Encryption in Transit**: All data transmitted over public networks must use TLS 1.3 or minimum TLS 1.2 with secure cipher suites.
- **Access Control & RBAC**: Least privilege access principles. Users/operators only access the data required for their role.
- **Audit Logging without PII**: Access and change logs must record who accessed what record and when, **without leaking raw personal information (names, emails, phones) in plaintext logs or crash monitoring tools (Sentry/LogRocket)**.
- **Secure Data Disposal**: Cryptographic shredding or permanent deletion routines when retention expires or upon erasure request.
- **Privacy by Design and Default (PbD)**: Local-first offline processing preferred; remote sync disabled unless explicitly enabled and consented.

---

## 7. Mandatory Breach Notification & Incident Management (NPC Circular 16-03)

Under NPC Circular 16-03, personal data breaches involving risk to data subjects trigger strict, legally enforceable notification requirements:

```
[Breach Discovered / Suspected]
             │
             ▼
[Assess: Nature of Data + Risk of Harm]
             │
             ▼ (Mandatory Notification Triggered)
┌──────────────────────────────────────────────────────────┐
│              WITHIN 72 HOURS FROM KNOWLEDGE              │
│                                                          │
│  1. Notify National Privacy Commission (NPC) via DBNMS   │
│  2. Notify Affected Data Subjects directly (SMS/Email)   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              WITHIN 5 CALENDAR DAYS                      │
│                                                          │
│  Submit Full Comprehensive Data Breach Report to NPC     │
└──────────────────────────────────────────────────────────┘
```

### When Mandatory Notification is Triggered:
1. The personal information involves Sensitive Personal Information OR other information that may enable identity fraud (such as Name + Email + Phone number combinations).
2. There is reason to believe that the information has been acquired by an unauthorized person; AND
3. The PIC or NPC believes that the breach is likely to give rise to a real risk of serious harm to any affected data subject.

*Note: Delay is strictly prohibited if the breach involves 100 or more data subjects.*

---

## 8. NPC Registration Requirements (NPC Circular 2022-04)

Under NPC Circular No. 2022-04, registration of the **DPO and Data Processing Systems (DPS)** via the **National Privacy Commission Registration System (NPCRS)** is mandatory if any of the following apply:
1. The entity employs **250 or more employees**; OR
2. The entity processes personal data of **at least 1,000 individuals** involving sensitive personal information; OR
3. The processing is likely to pose a **risk to the rights and freedoms** of data subjects (e.g., profiling, automated decision-making, tracking); OR
4. Operating in covered critical sectors (finance, healthcare, education, telecommunications, e-commerce).

*Upon registration, entities receive an official **NPC Seal of Registration** and QR code, which must be prominently displayed on physical premises and web/mobile application interfaces.*

---

## 9. Penalties for Non-Compliance

### Administrative Fines (NPC Circular 2022-01)
- **Grave Infractions** (e.g., security failures leading to large-scale breach, unauthorized processing, refusal of compliance check): **0.5% to 3% of annual gross income**, up to **PHP 5,000,000 per violation**.
- **Major Infractions** (e.g., failure to register DPO/systems, incomplete privacy notices, failure to uphold data subject rights): **0.25% to 2% of annual gross income**, up to **PHP 5,000,000 per violation**.
- **Cease-and-Desist Orders (CDO)**: Immediate temporary or permanent ban on processing personal data.

### Criminal Penalties (RA 10173 Chapter VIII)
- **Unauthorized Processing**: 1 to 3 years imprisonment + PHP 500,000 to PHP 2,000,000 fine.
- **Access Due to Negligence**: 1 to 3 years imprisonment + PHP 500,000 to PHP 4,000,000 fine.
- **Improper Disposal of Personal Data**: 6 months to 2 years imprisonment + PHP 100,000 to PHP 500,000 fine.
- **Unauthorized Disclosure / Malicious Disclosure**: 1 to 5 years imprisonment + PHP 500,000 to PHP 1,000,000 fine.
- Corporate officers / Directors / Partners are personally held liable if they participated in or permitted the offense.

---

## 10. Direct Impact & Requirements for `kita-kita`

| Data Field | DPA Classification | Specific Protective Requirements in `kita-kita` |
| :--- | :--- | :--- |
| **First Name & Last Name** | Personal Information | Must be displayed transparently in attendee list, editable by user (Rectification), exportable (Portability), and deletable on demand (Erasure). |
| **Email Address** | Personal Information | Requires validation, masked in logs (`j***@example.com`), protected against unauthorized export/sharing, used strictly for event communication/check-in verification. |
| **Phone Number (PH: +63/09)** | Personal Information | High risk for SMS spam/phishing if leaked. Must be formatted cleanly, masked in non-admin views, encrypted in storage, excluded from analytics logs. |
| **Attendee ID / QR Data** | Linked Identifier | QR payload must not encode unencrypted PII in public QR codes. Use cryptographically signed IDs or opaque UUIDs rather than plaintext user data when scanning. |
| **Check-in Timestamp** | Processing Metadata | Used strictly for attendance verification. Must have automated data retention expiration (e.g. auto-archive/purge after event retention window). |
