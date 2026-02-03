/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 *
 * All custom environment variables must be prefixed with VITE_
 * to be exposed to the client-side code.
 */
interface ImportMetaEnv {
  /** Base URL for the Laravel backend API */
  readonly VITE_API_BASE_URL: string;

  /** Application environment: development | staging | production */
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
