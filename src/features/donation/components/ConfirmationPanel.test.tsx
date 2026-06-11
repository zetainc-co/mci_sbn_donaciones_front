/**
 * Scenarios: ConfirmationPanel — PSE bank redirect + fallback button
 *
 * NOTE: No test framework installed (no vitest/jest in package.json).
 * Scenarios defined here to satisfy SDD ordering requirements.
 * To run as real tests, install: vitest + @testing-library/react
 *
 * --- Scenario 1: Fallback button visible for PSE PENDING ---
 * Given donationResult.type = 'pse', redirectUrl is set, status = 'PENDING'
 * Then button "Ir al banco" is rendered
 *
 * --- Scenario 2: Fallback button visible for PSE PROCESSING ---
 * Given donationResult.type = 'pse', redirectUrl is set, status = 'PROCESSING'
 * Then button "Ir al banco" is rendered
 *
 * --- Scenario 3: Fallback button opens redirectUrl in new tab ---
 * Given button "Ir al banco" is rendered
 * When user clicks it
 * Then window.open is called with (redirectUrl, '_blank', 'noopener,noreferrer')
 *
 * --- Scenario 4: No fallback button for card payment ---
 * Given donationResult.type = 'card', status = 'APPROVED'
 * Then button "Ir al banco" is NOT rendered
 *
 * --- Scenario 5: No fallback button when no redirectUrl ---
 * Given donationResult.type = 'pse', redirectUrl = undefined
 * Then button "Ir al banco" is NOT rendered
 *
 * --- Scenario 6: Fallback button disappears on APPROVED ---
 * Given PSE in PROCESSING with button visible
 * When polling transitions status to 'APPROVED'
 * Then button "Ir al banco" is no longer rendered
 *
 * --- Scenario 7: Bancolombia also shows fallback button ---
 * Given donationResult.type = 'bancolombia', redirectUrl is set, status = 'PENDING'
 * Then button "Ir al banco" is rendered
 */

export {};
