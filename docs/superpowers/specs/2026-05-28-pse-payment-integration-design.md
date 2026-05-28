# PSE Payment Integration Design

**Date:** 2026-05-28  
**Status:** Approved  
**Size:** S (< 10 lines changed, 0 new files, 0 new dependencies)

## Problem

PSE is fully implemented in both frontend and backend but intentionally disabled ("Próximamente") in the frontend UI. The backend `processPSE()` also has a silent failure when `DONATIONS_PSE_CALLBACK_URL` is not configured.

## Solution

Enable PSE in the UI and add a robust fallback for the callback URL.

## Files Changed

### Frontend
- `src/pages/HomePage.tsx` — Remove `disabled: true, disabledText: 'Próximamente'` from PSE method entry

### Backend
- `app/Http/Controllers/Api/PaymentController.php` — In `processPSE()`, replace silent null concatenation with: fallback to `{frontend_url}/pse-return`, guard clause with clear error if neither URL is configured

## Flow

```
User selects PSE (step 2)
  → PSEForm: person type / bank / document
  → Frontend validates: bankCode + documentNumber required
  → User completes donor info (step 3) and submits
  → POST /api/donations → POST /api/payments/process
  → Backend creates PSE transaction with Wompi
      redirectUrl = {DONATIONS_PSE_CALLBACK_URL ?? frontend_url/pse-return}?donation={id}
  → Backend returns { status: 'PENDING', redirect_url: 'https://bank.com/...' }
  → Frontend redirects: window.location.href = redirect_url
  → User authorizes at bank
  → Wompi redirects to /pse-return?donation={id}
  → PSEReturnPage fetches donation status and displays result
```

## Observable Scenarios

1. **PSE visible:** User lands on step 2 → PSE card appears enabled (no "Próximamente" badge)
2. **Form validation:** User selects PSE → PSEForm loads with bank list → validates bank + document before proceeding
3. **Backend callback fallback:** `DONATIONS_PSE_CALLBACK_URL` not set → backend uses `{DONATIONS_FRONTEND_URL}/pse-return` automatically
4. **Error guard:** Neither env var set → clear exception: "PSE callback URL no configurada: define DONATIONS_PSE_CALLBACK_URL o DONATIONS_FRONTEND_URL"
5. **Redirect flow:** After successful process() call → frontend redirects to bank URL
6. **Return page:** After bank authorization → `/pse-return?donation={id}` shows correct status

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DONATIONS_PSE_CALLBACK_URL` | No | `{DONATIONS_FRONTEND_URL}/pse-return` | Explicit PSE return URL |
| `DONATIONS_FRONTEND_URL` | Yes (already needed for Bancolombia) | `http://localhost:3000` | Frontend base URL |

## What Is NOT Changed

- `PSEForm.tsx` — already complete
- `PSEReturnPage.tsx` — already complete
- `payment/store.ts` — already handles PSE
- `useDonationProcessor.ts` — already handles PSE redirect
- `WompiService.php` — already has `createPSETransaction` and `getPSEBanks`
- Router — already has `/pse-return`
- API contracts — PSE already documented
