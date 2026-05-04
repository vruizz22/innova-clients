# Auth UI kit — SuperProfes

Web responsive (desktop-first, collapses below 880px). Sky+mint palette. Spanish (es-CL). Pairs with the **innova-backend-serverless** `auth` module.

## Backend mapping

| Screen | Endpoint | DTO |
|---|---|---|
| Login | `POST /auth/login` | `LoginDto` (email, password ≥ 8) |
| Register | `POST /auth/register` | `RegisterDto` (email, password, role) |
| Forgot | `POST /auth/forgot-password` | `ForgotPasswordDto` (email) |
| Reset (OTP) | `POST /auth/confirm-forgot-password` | `ConfirmForgotPasswordDto` (email, code, newPassword) |
| Refresh (silent) | `POST /auth/refresh` | `RefreshDto` |
| Logout | `POST /auth/logout` | bearer |
| Profile | `GET /auth/me` | bearer |

**Roles** (from `roles.enum.ts`): `student`, `teacher`, `admin`. Parent isn't a backend role yet — TODO is to extend the enum or treat it as a `student` flag.

**Reset code:** 6 digits, 15-min expiry (matches `auth.service.ts` `generateResetCode`).

## Screens

1. **Login** — email + password, role chooser (UI hint only — backend infers role from user record), forgot link.
2. **Register** — email + password + strength meter + optional school code (student only). Password meter is purely client-side; backend only enforces ≥ 8.
3. **Verify email** — placeholder for post-register state. Backend doesn't yet send a verification email on register; this screen is forward-looking.
4. **Forgot password** — request link (also shows "sent" variant with the 15-min expiry note).
5. **Reset (OTP)** — 6-digit code input + new password + confirm. 3-step progress indicator.
6. **Success** — generic success state used after reset.

## Layout

Two-column on desktop (`auth-shell` grid) — branded gradient aside on the left, form on the right. Below 880px the aside collapses and a small mark appears above the form. Max form width is 380px.

## TODOs / open questions

- `parent` role isn't in the backend enum. Add to `Role` or model as a `student.guardianOf` relation.
- No social login in backend → no Google/Apple buttons.
- "Remember me" toggles only `localStorage` vs `sessionStorage` for refresh token; backend doesn't change behavior.
- "Verify email" depends on the email service being wired for register confirmations (currently only password reset emails are sent).
