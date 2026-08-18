# In-App Privacy Notice & Consent Policy Template (RA 10173 & NPC Compliant)

> **Instructions for Implementation:**  
> This Privacy Notice is drafted in accordance with the **Philippine Data Privacy Act of 2012 (RA 10173)**, its Implementing Rules and Regulations (IRR), **NPC Circular 2023-04 (Guidelines on Consent)**, and **NPC Advisory 2023-01 (Guidelines on Deceptive Design Patterns)**.  
> It must be rendered in plain, accessible language and presented to users **prior to data collection** (e.g., during initial app launch, CSV import, or manual attendee registration).

---

## Sample In-App Privacy Notice Text

```markdown
# Privacy Notice — Kita-Kita Attendance App

**Effective Date:** August 18, 2026  
**Personal Information Controller (PIC):** [Organization / Event Organizer Name]  
**Contact Email / DPO:** dpo@[organization-domain].ph  

### 1. What Personal Information We Collect
When you use Kita-Kita for event check-ins or participant registration, we collect:
- **Full Name** (First Name, Last Name)
- **Contact Details** (Email Address, Mobile Phone Number)
- **Attendance Identifiers** (Attendee ID, QR Code payload, Check-in Timestamps)

### 2. Purpose of Collection & Lawful Basis
We collect and process this data solely for:
1. Verifying attendance and processing real-time event check-ins.
2. Sending essential event logistical updates, confirmation notices, or emergency alerts related to the event.
3. Generating aggregate attendance statistics for event organizers.

**Lawful Basis:** We process your personal information based on your **freely given, specific, and informed consent** (Section 12(a), RA 10173) and our **contractual necessity** to administer your event participation (Section 12(b)).

### 3. Data Storage & Security Measures
In compliance with **NPC Circular 2023-06 (Security of Personal Data)**:
- **Local-First & Encryption:** Attendee data is stored securely using industry-standard encryption (AES-256).
- **Access Control:** Access to attendee lists is restricted strictly to authorized event check-in personnel.
- **No Third-Party Sale:** We will **never sell, rent, or trade** your personal information to advertisers or unauthorized third parties.

### 4. Data Retention & Disposal
- Personal information collected for an event is retained for **[e.g., 30 days / 90 days]** following the conclusion of the event to resolve any attendance queries.
- Upon expiration of the retention period, all personal data is permanently deleted and sanitized from devices and backups.

### 5. Your Rights as a Data Subject (RA 10173 Section 16)
Under Philippine law, you have the following rights:
1. **Right to be Informed:** To know how your data is collected and used (this notice).
2. **Right to Access:** To request a copy of your personal data stored in our system.
3. **Right to Rectification:** To correct inaccurate or incomplete information.
4. **Right to Erasure / Blocking:** To request the permanent deletion of your data at any time.
5. **Right to Object / Withdraw Consent:** To withdraw your consent to data processing.
6. **Right to Data Portability:** To receive an electronic copy of your data in a structured format (JSON/CSV).
7. **Right to Damages & Right to Complain:** To file a complaint with the National Privacy Commission (NPC) if you believe your privacy rights have been violated.

### 6. Contacting the Data Protection Officer (DPO)
To exercise any of your data privacy rights, request data deletion, or ask questions about our data practices, contact:

- **Data Protection Officer:** [Name of DPO / Compliance Officer]
- **Email:** dpo@[organization-domain].ph / privacy@[organization-domain].ph
- **Office Address:** [Physical Address, Philippines]
- **NPC Registration No.:** [NPCRS Registration Number & Seal]
```

---

## In-App Consent Dialog Wireframe & Implementation Guidelines

Pursuant to **NPC Advisory 2023-01 (Deceptive Design Patterns)**:
1. **No Dark Patterns:** Both options ("Accept & Continue" and "Decline / Customize") must have **equal visual weight and neutral styling**.
2. **No Pre-Ticked Checkboxes:** Checkboxes must be opt-in by the user.
3. **Unbundled Consent:** Separate general attendance tracking from optional communications.

```
┌─────────────────────────────────────────────────────────────┐
│                 📋 Privacy Notice & Consent                 │
│                                                             │
│  Kita-Kita collects your Name, Email, and Phone Number      │
│  to verify attendance and send event updates.               │
│                                                             │
│  Data is encrypted on-device and retained for 30 days.      │
│                                                             │
│  [x] I agree to the collection and processing of my         │
│      attendance information for this event.                 │
│                                                             │
│  [ ] (Optional) I agree to receive announcements for future  │
│      events organized by [Organization Name].               │
│                                                             │
│  [ Read Full Privacy Policy ]                               │
│                                                             │
│  ┌───────────────────────────┐ ┌──────────────────────────┐ │
│  │    Accept & Continue      │ │         Decline          │ │
│  └───────────────────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
