/**
 * Scenarios: PSEReturnPage
 *
 * NOTE: No test framework installed (no vitest/jest in package.json).
 * These scenarios are defined here to satisfy SDD ordering requirements
 * and serve as specifications for future test implementation.
 *
 * To run these as real tests, install: vitest + @testing-library/react
 *
 * --- Scenario 1: Status mapping ---
 * Given donation.status = 'COMPLETED'
 * Then page shows success state (CheckCircle2 icon, "¡Donación exitosa!")
 *
 * --- Scenario 2: Pending state ---
 * Given donation.status = 'PENDING' or 'PROCESSING'
 * Then page shows pending state (Clock icon, "Donación en proceso")
 *
 * --- Scenario 3: Failed state ---
 * Given donation.status = 'FAILED' or 'REFUNDED'
 * Then page shows failed state (XCircle icon, "Donación no completada")
 *
 * --- Scenario 4: Missing donation ID ---
 * Given URL has no ?donation= param
 * Then page shows error state ("No se encontró referencia de donación")
 *
 * --- Scenario 5: Uses public endpoint (unauthenticated guest) ---
 * Given user is not authenticated (PSE guest return)
 * Then donationsService.getByIdForCallback is called (public /donations/callback/{id})
 * NOT donationsService.getById (protected, requires auth)
 *
 * --- Scenario 6: Retry button on failure ---
 * Given status is 'failed' or 'error'
 * Then "Intentar de nuevo" button navigates to '/'
 *
 * --- Scenario 7: New donation button on success ---
 * Given status is 'success' or 'pending'
 * Then "Hacer otra donación" button navigates to '/'
 *
 * --- Scenario 8: Polling countdown while pending ---
 * Given status is 'PENDING' or 'PROCESSING' after initial check
 * Then countdown UI appears ("Próxima verificación en X segundos")
 * And after countdown reaches 0, another status check fires
 *
 * --- Scenario 9: Polling stops after maxChecks ---
 * Given checkCount has reached 8 (maxChecks)
 * Then no further checks are triggered
 * And countdown UI disappears
 *
 * --- Scenario 10: Polling stops when COMPLETED ---
 * Given status transitions to COMPLETED during polling
 * Then countdown UI disappears
 * And "Hacer otra donación" or receipt button appears
 *
 * --- Scenario 11: Receipt download button on success ---
 * Given status = 'success' (COMPLETED)
 * Then "Descargar comprobante" button is rendered
 * When clicked, opens /api/donations/{id}/receipt in new tab
 */

export {};
