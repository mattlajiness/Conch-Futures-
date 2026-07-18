# Security Specification for NFL Futures Pick Em Pool

## 1. Data Invariants
- **Pool Ownership**: A pool has a single creator (`creatorId`) who is the only user authorized to modify the pool's settings, name, description, code, or set the official results for grading.
- **Member Picks Isolation**: A user can only create, update, or delete their own pick document inside `/pools/{poolId}/picks/{userId}`. They cannot alter another user's picks.
- **Relational Integrity**: A user cannot submit picks for a pool that does not exist in the database.
- **Immutable Fields**:
  - `id` and `creatorId` in `pools` are immutable after creation.
  - `userId` in `picks` is immutable after creation.
- **Strict Timestamps**:
  - `createdAt` in `pools` must equal `request.time` upon creation.
  - `updatedAt` in `picks` must equal `request.time` upon creation and update.

## 2. The "Dirty Dozen" Payloads (Exploit Scenarios)
1. **Identity Spoofing in Pool**: Creating a pool with `creatorId` set to a victim's user ID.
2. **Identity Spoofing in Picks**: Submitting a pick document inside a pool where the document ID or `userId` belongs to another user.
3. **Orphaned Picks**: Submitting picks to a non-existent pool ID.
4. **Timestamp Manipulation**: Setting a manual `createdAt` in the past/future rather than using the server-side `request.time`.
5. **Unauthorized Results Modification**: A non-creator trying to update the `results` of a pool to cheat and make their own picks win.
6. **Pool Settings Overwrite**: A non-creator trying to change the pool's name or code.
7. **Ghost Field Injection (Shadow Update)**: Attempting to insert a malicious field `isAdmin: true` into a pool or picks document.
8. **Malicious Long ID**: Injecting an extremely long string (e.g., 50KB) as the pool ID to cause Denial of Wallet.
9. **Malicious Long String Fields**: Submitting extremely long names or descriptions (e.g., 1MB) to deplete storage or memory.
10. **Array Poisoning**: Submitting nested arrays in `selections` to bypass Firestore type checks.
11. **Bypassing Verification**: Writing documents as a user whose email is not verified (if email verification is strictly required).
12. **Unauthorized Deletion**: A regular member deleting the pool document or deleting another member's picks.

## 3. Test Cases (Verification Blueprint)
These are mapped to the security rules in `firestore.rules` to ensure all malicious payloads return `PERMISSION_DENIED`.
- `create /pools/pool123` with incorrect `creatorId` -> Denied
- `create /pools/pool123/picks/userABC` by `userXYZ` -> Denied
- `update /pools/pool123` setting `results` by a non-creator -> Denied
- `update /pools/pool123/picks/userABC` altering `userId` -> Denied
