# Fresh-checkout reproducibility

## Exact base

- commit: `91b7c71bfffa4f88b5a86042113b45a2e23ff122`
- tree: `2d0a3d85d0d16204d4d06af47859c3cab1b4f2f8`

## Result

**PASS.** A new repository was initialized from the supplied bundle, checked out detached at the exact commit, preflighted, and then received the complete cumulative package.

- atomic operations applied: 264
- create / replace / delete: 169 / 50 / 45
- candidate and fresh-applied worktrees: byte-identical
- compared files: 415
- compared bytes: 11,069,566
- `diff -qr --exclude=.git`: empty
- resulting `git status --porcelain` line count: 171 on both worktrees

`tsconfig.tsbuildinfo` was excluded by the package contract and removed before comparison; it is a local compiler artifact, not a delivery file.

No commit, push, merge, PR or deployment was performed.
