# DentalMind Security Specification

## 1. Data Invariants
1. **Isolated User Sandbox**: Every user can only read and write their own documents under `/users/{userId}` and their own subcollections (`courses`, `exams`, `tasks`, `lectures`, `checkIns`, `achievements`, `focusReset`). No user can access or mutate another student's courses, tasks, or exams.
2. **Path Hardening**: Path variable `{userId}` must match `request.auth.uid`. Subcollection resource document IDs must be valid alphanumeric identifier strings with length <= 128 characters.
3. **Identity Verification**: On creation and mutation, sub-resources that declare a `userId` field must match `request.auth.uid`.
4. **Strict Typing & Boundaries**: All string and text inputs are bounded to prevent Denial of Wallet and payload inflation attacks.
5. **No Cross-User Leaks**: Blanket collections queries are strictly rejected unless scoped to `request.auth.uid`.

## 2. The "Dirty Dozen" Payloads (Adversarial Test Vectors)
1. **Cross-User Snooping**: An authenticated student `user_B` attempts to read `/users/user_A/courses/course_1`. Expected: `PERMISSION_DENIED`.
2. **Unauthenticated Read**: An unauthenticated request attempts to read `/users/user_A`. Expected: `PERMISSION_DENIED`.
3. **Cross-User Document Write**: `user_B` attempts to write or overwrite `/users/user_A/profile`. Expected: `PERMISSION_DENIED`.
4. **Ghost Field Poisoning**: `user_A` attempts to inject unvetted administrative flags (`isAdmin: true`, `role: 'superadmin'`) during user profile update. Expected: Rejected / ignored by client schema or blocked by validation.
5. **ID Poisoning Attack**: An attacker passes a 2KB junk document ID (`/users/user_A/tasks/<2000-chars-string>`). Expected: `PERMISSION_DENIED`.
6. **Orphaned Subcollection Task Creation**: `user_A` attempts to write to `/users/user_B/tasks/task_99`. Expected: `PERMISSION_DENIED`.
7. **Exam Hijack**: `user_B` attempts to delete an exam in `/users/user_A/exams/exam_1`. Expected: `PERMISSION_DENIED`.
8. **Achievement Forgery**: `user_B` injects an achievement into `user_A`'s achievement collection. Expected: `PERMISSION_DENIED`.
9. **Global Collection Scraping**: An attacker executes `getDocs(collection(db, "users"))`. Expected: `PERMISSION_DENIED`.
10. **Test Document Tampering**: A user attempts to write to `/test/connection`. Expected: `PERMISSION_DENIED`.
11. **Check-In Identity Mismatch**: `user_A` submits a check-in payload targeting `user_B`'s timeline. Expected: `PERMISSION_DENIED`.
12. **Focus Recovery State Corruption**: `user_B` alters `user_A`'s 7-day focus reset progress. Expected: `PERMISSION_DENIED`.
