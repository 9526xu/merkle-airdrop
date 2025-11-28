# Changelog

## Unreleased

### Added

- Frontend: redesigned landing, admin and user dashboards with improved UX.
- Frontend: SSR build fixes via aliasing async-storage and excluding non-browser externals.
- Frontend: env-driven contract address for admin controls and claim flow.
- Backend: parameterized Merkle output directory; whitelist status returns Merkle proof.
- Tests: added whitelist status unit test validating Merkle proof integration.

### Changed

- Frontend: global styles with glass UI utilities.
- Backend: updated sample `merkle-tree.json`.

### Removed

- Backend: obsolete `backend/data/.gitkeep`.
