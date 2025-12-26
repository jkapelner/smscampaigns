export function validateEnvironment(): void {
  const required = ['JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
    console.warn('WARNING: ALLOWED_ORIGINS not set in production. CORS will use default.');
  }
}
