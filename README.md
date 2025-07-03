# 🏦 Payment System Microservice

A **production-grade, modular, and fault-tolerant** Node.js microservice that simulates payment processing with:

✅ Circuit Breaker (Redis-backed)
✅ Retry Logic with Exponential Backoff
✅ Flaky Payment Provider (for failure simulation)
✅ Natural Language Failure Summary (Mock LLM)
✅ Clean, testable architecture with InversifyJS & TypeScript
✅ API Documentation with Swagger
✅ Dockerized setup for easy deployment

---

## 📦 Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** (REST API)
- **InversifyJS** (Dependency Injection)
- **Redis** (State management, Circuit Breaker, logs)
- **Pino** (Structured logging)
- **Swagger** (API documentation)
- **Docker & Docker Compose**

---

## 🚀 Setup Instructions

### Prerequisites

- Docker & Docker Compose installed
- Alternatively, Node.js 20+ and Redis installed locally

### Quick Start (Recommended via Docker)

```bash
git clone
cd payment-system
cp .env.example .env   # Edit as needed
docker-compose up --build
```

**Access the API:**

| Endpoint                                   | Description                      |
| ------------------------------------------ | -------------------------------- |
| `http://localhost:3000/api-docs`           | Interactive Swagger UI           |
| `http://localhost:3000/api/payment`        | Simulate payment processing      |
| `http://localhost:3000/api/status`         | View Circuit Breaker status      |
| `http://localhost:3000/api/status/summary` | Natural-language failure summary |
| `http://localhost:3000/api/metrics`        | Basic metrics overview           |

---

## ⚡️ Payment Failure & Circuit Breaker

- Simulates **intermittent payment failures** via a configurable failure rate.
- On multiple consecutive failures (configurable threshold), a **Redis-backed Circuit Breaker** opens to block further attempts.
- After a cooldown period, it transitions to HALF_OPEN state to test recovery.
- All payment attempts (success/failure) are logged in Redis with TTL for observability.

---

## 💡 LLM Usage (Mocked)

- After multiple failures or via `/status/summary`, the service generates a **natural language summary** of failure rates and circuit state.
- For this exercise, the summary is generated via a simple mock function.
- The architecture is designed to easily swap the mock with a real LLM API (e.g., OpenAI, Azure OpenAI) in future.

**Example Summary Output:**

```json
{
  "summary": "In the last 10 minutes, 70% of payment attempts failed. The circuit breaker is currently open, blocking new attempts."
}
```

---

## ⚙️ Environment Variables

All configuration is environment-driven. See `.env.example` for defaults.

| Variable                            | Description                                       |
| ----------------------------------- | ------------------------------------------------- |
| `PORT`                              | App port (default: `3000`)                        |
| `LOG_LEVEL`                         | Pino log level (`info`, `debug`, etc.)            |
| `FLAKY_PAYMENT_FAILURE_RATE`        | Failure rate for simulated provider (`0.3` = 30%) |
| `REDIS_HOST`                        | Redis hostname (default: `redis` in Docker)       |
| `REDIS_PORT`                        | Redis port (default: `6379`)                      |
| `REDIS_PASSWORD`                    | Optional Redis password                           |
| `PAYMENT_MAX_RETRIES`               | Max payment retries before failure                |
| `PAYMENT_BACKOFF_MS`                | Retry delays, comma-separated (ms)                |
| `CIRCUIT_BREAKER_FAILURE_THRESHOLD` | Failures before circuit opens                     |
| `CIRCUIT_BREAKER_COOLDOWN_MS`       | Cooldown before HALF_OPEN state                   |

---

## 🛠️ Development (Without Docker)

Ensure Redis is running locally, then:

```bash
npm install
npm run dev
```

---

## 📝 Assumptions & Trade-offs

- No persistent DB — Redis holds transient state only.
- Flaky Provider simulates failures to test Circuit Breaker.
- LLM Summary is mocked for now; real integration is trivial.
- TTL-based logs and state — system forgets history after expiry.
- Production-level observability (Pino logs, metrics, status endpoints) included.

---

## 🤖 AI & Cursor Usage

I used **Cursor AI** throughout development to:

- Scaffold clean service and DI structure
- Quickly draft Redis-backed Circuit Breaker logic
- Prototype the LLM Summary logic with future real-LLM integration in mind
- Refine error handling and logging best practices
- Generate this README structure for clarity

I iteratively modified AI-generated code to align with clean architecture and real-world standards.

---

## 📂 Project Structure (Key Parts)

```
src/
├── configs/        # DI container, Redis, Logger config
├── services/       # PaymentService, CircuitBreakerService, SummaryService
├── interfaces/     # Interfaces for services/providers
├── providers/      # Flaky Payment Provider, Redis setup
├── routers/        # Express routes
├── handlers/       # Global error handling, ApiError
└── index.ts        # App entrypoint
```

---

## 📦 Production Readiness

✅ Modular and easily extendable
✅ Dockerized for isolated, portable deployment
✅ Clear separation of concerns with DI
✅ Real-world failure handling patterns (retry, circuit breaker)
✅ Natural language summary via future LLM integration

---

## 📜 License

MIT

---

## ✅ Final Notes

Clone, configure `.env`, run via Docker, and you're good to go.
