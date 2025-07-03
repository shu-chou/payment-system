# Payment System Microservice

A robust, production-ready Node.js + TypeScript payment microservice with Express, InversifyJS, Redis, and observability best practices.

---

## Features
- **Clean architecture:** Modular, scalable folder structure
- **Dependency Injection:** InversifyJS for testability and flexibility
- **Logging:** Pino logger, configurable log level
- **Redis-backed state:** Circuit breaker, logs, metrics, all persisted with TTL
- **Flaky Payment Provider:** Simulates real-world failures
- **Circuit Breaker:** Redis-backed, configurable, production-grade
- **Retry Logic:** Exponential backoff, configurable
- **Swagger API Docs:** `/api-docs` endpoint
- **Metrics & Summary:** `/api/metrics`, `/api/status/summary`
- **Centralized error handling**
- **Environment-driven config**

---

## Getting Started

### Prerequisites
- Docker & Docker Compose

### Quick Start (Docker Compose)

1. **Clone the repo:**
   ```sh
git clone <your-repo-url>
cd payment-system
```
2. **Copy or edit the environment file:**
   ```sh
cp .env.example .env
# or edit .env as needed
```
3. **Start the stack:**
   ```sh
docker-compose up --build
```
4. **Access the API:**
   - Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
   - Health: [http://localhost:3000/api/status](http://localhost:3000/api/status)
   - Metrics: [http://localhost:3000/api/metrics](http://localhost:3000/api/metrics)
   - Summary: [http://localhost:3000/api/status/summary](http://localhost:3000/api/status/summary)

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| PORT | 3000 | App port |
| LOG_LEVEL | info | Pino log level |
| FLAKY_PAYMENT_FAILURE_RATE | 0.3 | Failure rate for mock provider (0-1) |
| REDIS_HOST | redis | Redis host |
| REDIS_PORT | 6379 | Redis port |
| REDIS_PASSWORD |  | Redis password |
| REDIS_DB | 0 | Redis DB index |
| PAYMENT_MAX_RETRIES | 3 | Max payment retries |
| PAYMENT_BACKOFF_MS | 500,1000,2000 | Retry backoff (comma-separated ms) |
| PAYMENT_LOG_TTL | 600 | Log TTL (seconds) |
| PAYMENT_LOG_MAX_LENGTH | 1000 | Max log entries |
| SUMMARY_WINDOW_MS | 600000 | Summary window (ms) |
| CIRCUIT_BREAKER_FAILURE_THRESHOLD | 5 | Circuit breaker failure threshold |
| CIRCUIT_BREAKER_COOLDOWN_MS | 30000 | Circuit breaker cooldown (ms) |
| CIRCUIT_BREAKER_KEY | circuit:payment | Redis key for circuit breaker |

---

## API Documentation

See [Swagger UI](http://localhost:3000/api-docs) for full docs.

### Main Endpoints
- `POST /api/payment` — Process a payment
- `GET /api/status` — Circuit breaker status
- `GET /api/status/summary` — Natural-language summary
- `GET /api/metrics` — Metrics and recent stats

---

## Tradeoffs & Notes
- **Redis TTL:** All logs and state use a 10-minute TTL for rolling windows. Data is lost if Redis is flushed or TTL expires.
- **Flaky Provider:** Simulates real-world unreliability for testing circuit breaker and retry logic.
- **No persistent DB:** Only Redis is used for state/logs; no SQL/NoSQL DB.
- **Config via env:** All behavior is environment-driven for flexibility.
- **Production readiness:** Modular, observable, and ready for extension.

---

## Development

- `npm install`
- `npm run dev`

---

## License
MIT 