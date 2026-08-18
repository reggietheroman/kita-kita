## Summary of Changes
<!-- Describe the changes and intent of this pull request -->

## 🛡️ Philippine Data Privacy Act (RA 10173) Compliance Gate

Please check all items before merging:

- [ ] **Data Minimization:** No new personal data fields added without updating the Privacy Impact Assessment (`docs/privacy-impact-assessment-template.md`).
- [ ] **Zero PII Logging:** Verified that no unmasked names, emails, or phone numbers are logged in `console.log`, crash telemetry, or error messages.
- [ ] **Storage Security:** All stored personal information is encrypted at rest (AES-256 / SecureStore).
- [ ] **Data Subject Rights:** Modified data models support individual deletion (Erasure), update (Rectification), and export (Portability).
- [ ] **No Dark Patterns:** UI consent interactions adhere to NPC Advisory 2023-01 (equal button weights, no pre-checked boxes).
- [ ] **Automated Privacy Gate:** Passed `npm run privacy-check`.
