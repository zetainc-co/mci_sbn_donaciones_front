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
 */

export {};
