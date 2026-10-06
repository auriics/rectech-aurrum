# Auriic Development & Production Deployment Rules

## Repository
Primary GitHub repository: `auriics/rectech-aurrum`
Environments:
- `Development` = development/testing branch
- `main` = production branch (PROTECTED)

## REQUIRED DEPLOYMENT FLOW
1. Developer / AI changes code
2. Commit changes
3. Push ONLY to `Development`
4. Development deployment/preview
5. User tests the development version
6. **STOP** & Ask user for production approval
7. Only after explicit approval, merge `Development` into `main`
8. Push `main` -> Vercel production deployment

## SAFETY RULES
- **RULE 1**: NEVER push a new code change directly to `main`. Switch to `Development` first.
- **RULE 2**: NEVER push Development and Production at the same time.
- **RULE 3**: ALWAYS ask "Have you tested it and do you want me to promote this version to production?" before touching `main`.
- **RULE 4**: Production requires EXPLICIT approval ("Yes, push production", "Deploy production"). Not "Looks okay" or "Continue".
- **RULE 5**: Promote safely using merges. Never introduce new code during promotion.
- **RULE 6**: NEVER force push to production (`git push -f` against `main`).
- **RULE 7**: Stop and ask on merge conflicts.
- **RULE 8 & 9**: Vercel Preview tracks `Development`, Vercel Production tracks `main`.
- **RULE 10**: Separate environments variables. NEVER commit `.env`.
- **RULE 11 & 12**: After pushing `Development`, report status, then STOP. Production status must be UNCHANGED.
- **RULE 13**: After production approval, merge, push, check Vercel, and report.

## ABSOLUTE SAFETY RULE
CODE CHANGE -> DEVELOPMENT -> TEST -> USER APPROVAL -> MAIN -> PRODUCTION
Never bypass this flow. The old separate development repository should NOT be used. All future development uses the `Development` branch of `auriics/rectech-aurrum`.
