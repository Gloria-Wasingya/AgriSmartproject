# Security Specification for AgriSmart Uganda

## 1. Data Invariants
- A `User` profile can only be created by the authenticated user it represents.
- A `Listing` must be created by a user with the `farmer` role (verified by profile check or just by listing field).
- A `Diagnosis` is private to the user who performed it.
- Listings can be read by anyone signed in, but modified only by the owner.
- Users cannot change their `role` after creation (except admin).

## 2. The "Dirty Dozen" Payloads (Deny Cases)
1. Creating a User profile with a different `uid` than the auth token.
2. Updating someone else's Listing.
3. Reading someone else's Diagnosis records.
4. Listings without a `location` or `cropType`.
5. Injecting a 1MB string into a crop name.
6. Updating a `Listing`'s `farmerId` to take ownership of it.
7. Creating a Listing with status `sold` initially (maybe allowed, but usually start `active`). Let's say: status must be `active` on create.
8. Deleting a User profile without being that user.
9. An unverified email user trying to create a Listing.
10. Anonymous user trying to write anything.
11. Admin-only field poisoning: Adding `isAdmin: true` to a user profile.
12. Creating a listing with a negative `price`.

## 3. Test Runner (Draft)
I will implement `firestore.rules` and then verify with logic.
