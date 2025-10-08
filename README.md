# Humane Backend

Humane Backend powers the server-side infrastructure for the Humane platform - a privacy-first, real-time social network built on a **microservices architecture**.  
This repository manages user, post, moderation, notification, chat, and search services orchestrated through **Kubernetes** and **Kafka**, with persistence handled via **PostgreSQL**, **MongoDB**, and **Elasticsearch**.

## System Design

![Alt text](/Docs/full-architecture-light.png)

### Key Components

- Kafka - Event-driven message bus connecting services.
- PostgreSQL / MongoDB - Main persistence layers for structured and unstructured data.
- Elasticsearch - High-performance search and query service.
- Redis - Caching and feed optimization.


## Development Setup

Start the local Kubernetes dev cluster:

```bash
skaffold dev
```

## 🤝 Contributing

1. Fork → branch → PR
2. Use linting & consistent style
3. Write unit + integration tests
4. Document APIs & data schema changes

## Production Notes
- [] Close Kafka UI NodePort before deployment to production.
- [] Convert Kafka Deployment → StatefulSet for persistence and fault tolerance.
- [] Restrict internal ingress routes for the query service (close public exposure).
- Skaffold + Kubernetes - Local dev, CI/CD, and deployment automation.