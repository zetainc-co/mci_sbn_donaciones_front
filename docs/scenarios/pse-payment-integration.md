# Scenarios: PSE Payment Integration

## Satisfaction Criteria
All scenarios must pass before this feature is considered complete.
Scenarios marked [MANUAL] require Wompi sandbox credentials and browser interaction.

---

## Scenario 1: PSE visible y seleccionable (AUTOMATED: TypeScript)
**Given** el usuario está en paso 2 con moneda COP  
**When** se renderizan las tarjetas de método de pago  
**Then** PSE aparece sin `disabled=true` y sin el badge "Próximamente"  
**Evidence:** `availableMethods` array en HomePage.tsx no contiene `disabled: true` para PSE

---

## Scenario 2: PSEForm se carga al seleccionar PSE (MANUAL)
**Given** el usuario selecciona PSE en paso 2  
**When** el componente re-renderiza  
**Then** `<PSEForm />` es visible con: selector de tipo de persona, selector de banco (populated), tipo de documento, número de documento

---

## Scenario 3: Bancos PSE se cargan desde el backend (MANUAL)
**Given** PSEForm montado  
**When** componente hace mount  
**Then** `GET /api/payments/pse/banks` retorna lista de bancos → selector muestra bancos reales de Wompi sandbox

---

## Scenario 4: Validación — banco requerido (MANUAL)
**Given** PSE seleccionado, usuario NO selecciona banco  
**When** hace clic en "Continuar"  
**Then** toast de error: "Por favor selecciona un banco"  
**No avanza** al paso 3

---

## Scenario 5: Validación — documento requerido (MANUAL)
**Given** PSE seleccionado, banco seleccionado, documento vacío  
**When** hace clic en "Continuar"  
**Then** toast de error: "Por favor ingresa tu número de documento"  
**No avanza** al paso 3

---

## Scenario 6: Backend — fallback URL con DONATIONS_FRONTEND_URL (AUTOMATED: PHP syntax)
**Given** `DONATIONS_PSE_CALLBACK_URL` no está en .env  
**And** `DONATIONS_FRONTEND_URL` = "https://donaciones.mcisabananorte.com"  
**When** `processPSE()` construye la redirectUrl  
**Then** `redirectUrl` = "https://donaciones.mcisabananorte.com/pse-return?donation={id}"  
**Wompi recibe** URL válida

---

## Scenario 7: Backend — guard clause cuando ninguna URL está configurada (AUTOMATED: PHP syntax)
**Given** ni `DONATIONS_PSE_CALLBACK_URL` ni `DONATIONS_FRONTEND_URL` están configurados  
**When** `processPSE()` se ejecuta  
**Then** lanza `\RuntimeException` con mensaje claro: "PSE callback URL no configurada..."  
**Response:** HTTP 400 con mensaje de error

---

## Scenario 8: Flujo completo — redirección al banco (MANUAL)
**Given** todos los datos completos (PSE + datos donante)  
**When** se procesa la donación  
**Then**:
  1. `POST /api/donations` retorna donación con status PENDING
  2. `POST /api/payments/process` retorna `{ status: 'PENDING', redirect_url: 'https://...' }`
  3. Frontend redirige `window.location.href` a URL del banco Wompi sandbox
  4. Toast: "Redirigiendo al banco..."

---

## Scenario 9: Página de retorno PSE (MANUAL)
**Given** usuario completa autorización en banco (sandbox)  
**When** Wompi redirige a `/pse-return?donation={id}`  
**Then** `PSEReturnPage` muestra estado correcto:
  - APPROVED → icono verde "¡Donación exitosa!"
  - PENDING → icono amarillo "Donación en proceso"
  - DECLINED → icono rojo "Donación no completada"

---

## Scenario 10: Moneda USD no muestra PSE (AUTOMATED: TypeScript)
**Given** el usuario selecciona moneda USD  
**When** se renderizan los métodos de pago  
**Then** PSE NO aparece (solo CREDIT_CARD disponible)  
**Evidence:** lógica condicional `currency === 'COP'` en HomePage.tsx

---

## Verification Checklist

- [ ] TypeScript compila sin errores (`tsc --noEmit`)
- [ ] PHP syntax válido en PaymentController (`php -l`)
- [ ] Scenario 1 verificado (código, no browser)
- [ ] Scenario 10 verificado (código, no browser)
- [ ] Scenario 6 verificado (lógica de código)
- [ ] Scenario 7 verificado (lógica de código)
- [ ] Scenarios 2-5, 8-9 marcados para validación manual con Wompi sandbox
