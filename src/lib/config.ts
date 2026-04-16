// ─── App Configuration ───────────────────────────────────────────────────────
// Centralized constants used throughout the POS system.
// Edit values here instead of hardcoding them in components.

export const APP_CONFIG = {
  /** Application name displayed in sidebar and metadata */
  appName: 'POS_EDER',

  /** User profile */
  user: {
    name: 'Melanie',
    role: 'Administrator',
  },

  /** Administrative Authentication (Single User) */
  auth: {
    username: 'melanie',
    password: 'melaniemaniego', // Note: For production, move to .env and use hashing
  },

  /** Tax rate applied to sales (0 = 0%) */
  taxRate: 0,

  /** Currency formatting */
  currency: {
    symbol: '₱',
    locale: 'en-PH',
    minimumFractionDigits: 2,
  },

  /** Default color palette for categories */
  categoryColors: [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280',
  ],
} as const;

// ─── Helper Functions ────────────────────────────────────────────────────────

/** Format a number as currency using the app's configured locale */
export function formatCurrency(amount: number): string {
  return `${APP_CONFIG.currency.symbol}${amount.toLocaleString(
    APP_CONFIG.currency.locale,
    { minimumFractionDigits: APP_CONFIG.currency.minimumFractionDigits }
  )}`;
}
