# Security Specification - ObraService Firestore Security Rules

## 1. Data Invariants
- **Identity Invariant**: Users can only access or modify records scoped to their authenticated identity or their associated company. A user cannot impersonate another `userId`, alter their own `role` arbitrarily, or create records on behalf of another user.
- **Relational Integrity**: Daily reports must reference a valid project. Subcontractor delivery notes can only be confirmed or disputed by authorized company members or project administrators.
- **Append-Only Audit**: Audit logs (`auditEvents`) can only be appended (`create`); modification (`update`) and deletion (`delete`) are strictly forbidden under all circumstances.
- **Immutability of Core Fields**: Once created, identity and relational keys (`id`, `createdAt`, `projectId`, `creatorId`, `sourceDailyReportId`) must never be modified by update requests.
- **State Transition Guard**: Delivery notes transitioning to `Confirmed` require valid confirmation details, and disputed notes require structured dispute records. No arbitrary state jumps or terminal state overrides are permitted without authorization.

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Unauthenticated Read/Write Attack**
   - Attempt: Reading `/projects/prj_123` or writing `/dailyReports/dr_123` without authentication.
   - Expected: PERMISSION_DENIED.

2. **Payload 2: Identity Spoofing (Creator ID Mismatch)**
   - Attempt: Creating a daily report with `creatorId: 'victim_user_id'` while logged in as `attacker_uid`.
   - Expected: PERMISSION_DENIED.

3. **Payload 3: Role Escalation via Profile Update**
   - Attempt: Modifying own user document to set `role: 'MAIN_CONTRACTOR_ADMIN'`.
   - Expected: PERMISSION_DENIED.

4. **Payload 4: Shadow Field Injection**
   - Attempt: Inserting ghost fields like `isAdmin: true`, `bypassGeofence: true` into a project or report payload.
   - Expected: PERMISSION_DENIED.

5. **Payload 5: Audit Log Tampering (Update / Deletion)**
   - Attempt: Issuing an `update` or `delete` on an `/auditEvents/{id}` document.
   - Expected: PERMISSION_DENIED.

6. **Payload 6: Resource Poisoning via Path Variable (Oversized ID)**
   - Attempt: Creating a document with a 2KB junk character ID or invalid characters like `../../hack`.
   - Expected: PERMISSION_DENIED.

7. **Payload 7: Subcontractor Cross-Company Access Leak**
   - Attempt: A subcontractor representative reading or confirming another subcontractor's delivery note.
   - Expected: PERMISSION_DENIED.

8. **Payload 8: Value Poisoning on Numeric Hours**
   - Attempt: Sending negative hours or non-numeric string values (`totalHours: -50` or `normalHours: "infinite"`).
   - Expected: PERMISSION_DENIED.

9. **Payload 9: Modifying Immutable `createdAt` Timestamp**
   - Attempt: Updating an existing project or report to backdate `createdAt: "1970-01-01"`.
   - Expected: PERMISSION_DENIED.

10. **Payload 10: Terminal State Violation (Overwriting Confirmed Delivery Note)**
    - Attempt: Mutating a delivery note that is already in `Confirmed` state without admin remediation.
    - Expected: PERMISSION_DENIED.

11. **Payload 11: Unverified Email Modification / Ghost Write**
    - Attempt: Writing data from an unverified token when email verification is required.
    - Expected: PERMISSION_DENIED.

12. **Payload 12: Orphaned Daily Report Creation**
    - Attempt: Creating a daily report pointing to a nonexistent `projectId`.
    - Expected: PERMISSION_DENIED.

## 3. Test Runner Design
Implemented in `firestore.rules.test.ts` to test against emulator or mock rule validator asserting all 12 payloads fail with PERMISSION_DENIED.
