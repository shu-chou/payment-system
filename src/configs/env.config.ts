export const config = {
  port: Number(process.env.PORT) || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  flakyPaymentFailureRate: Number(process.env.FLAKY_PAYMENT_FAILURE_RATE) || 0.3,
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: Number(process.env.REDIS_DB) || 0,
  },
  payment: {
    maxRetries: Number(process.env.PAYMENT_MAX_RETRIES) || 3,
    backoffMs: process.env.PAYMENT_BACKOFF_MS
      ? process.env.PAYMENT_BACKOFF_MS.split(',').map(Number)
      : [500, 1000, 2000],
    logTTL: Number(process.env.PAYMENT_LOG_TTL) || 600, // seconds (default 10 min)
    logMaxLength: Number(process.env.PAYMENT_LOG_MAX_LENGTH) || 1000,
  },
  summary: {
    windowMs: Number(process.env.SUMMARY_WINDOW_MS) || 10 * 60 * 1000, // 10 min
  },
  circuitBreaker: {
    failureThreshold: Number(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD) || 5,
    cooldownPeriod: Number(process.env.CIRCUIT_BREAKER_COOLDOWN_MS) || 30000,
    circuitKey: process.env.CIRCUIT_BREAKER_KEY || 'circuit:payment',
  },
};