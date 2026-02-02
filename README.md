# Humane Backend

<div align="center">

**A behavior-rewarding, real-time social network built on microservices architecture**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5.svg)](https://kubernetes.io/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-Event%20Streaming-231F20.svg)](https://kafka.apache.org/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/abhiram-ar/humane-backend)

</div>



Overview
========

Humane Backend powers the server-side infrastructure of Humane, a human-first social platform focused on meaningful interactions, positive behavior, and real-world connection rather than attention-driven engagement. It is built as a scalable, event-driven microservices system. The platform uses Apache Kafka for asynchronous service communication, Kubernetes for orchestration, and a polyglot persistence strategy to balance consistency, performance, and scalability, while following Clean / Hexagonal Architecture principles for long-term maintainability.

System Architecture
===================

![System Architecture](/Docs/system-design.svg)
[Open in interactive mode](https://www.tldraw.com/p/VZJnfLSLZe9YilTwuc4Yf?d=v-1222.-364.6694.3295.page)


Core Features
=============

User Management
---------------
* Authentication & Authorization: JWT-based auth with Google OAuth integration
* User Profiles: Customizable profiles with avatar and cover photos
* Friend System: Send/accept friend requests, manage relationships
* Password Management: Secure password hashing, reset, and change functionality
* Email Verification: Verification emails via nodemailer

Content Creation & Management
-----------------------------
* Posts: Create, update, delete posts with text and media attachments
* Comments: Commenting system with like/unlike functionality
* Likes: Like/unlike comments with real-time updates
* Hashtags: Automatic hashtag extraction and indexing
* Visibility Controls: Public and friends-only post visibility
* Media Upload: Pre-signed URL generation for secure client-side uploads

Content Moderation
------------------
* AI-Powered Moderation: Automated NSFW detection using pre-build CNN model
* Video Processing: Frame extraction and analysis using FFmpeg
* Multi-frame Analysis: Identifies "hottest" frames in video content
* Configurable Thresholds: Admin-adjustable sensitivity for content flagging
* User Notifications: Alerts for flagged or failed moderation

Real-time Chat
--------------
* 1-1 Messaging: WebSocket-based instant messaging via Socket.IO
* Online Status: Real-time user presence tracking
* Read Receipts: Conversation-level read tracking (timestamp-based)
* Message Persistence: Reliable message delivery with acknowledgments
* Reward Integration: Gamified engagement for active conversations

Notifications
-------------
* Real-time Delivery: WebSocket-based instant notifications
* Event-driven: Kafka consumers trigger notifications for various events
* Types Supported: Friend requests, comments, likes, moderation alerts
* Pagination: Efficient infinite scroll for notification history

Search & Discovery
------------------
* Full-text Search: Elasticsearch-powered search for posts, comments, users
* User Timeline: Paginated user post history
* Feed Optimization: Redis-cached personalized feeds

Gamification & Rewards
----------------------
* Humane Score: Point system for user engagement
* Configurable Rewards: Admin-configurable point values for actions
* Activity Tracking: Automated reward distribution via Kafka events
* Leaderboards: Platform-wide reward statistics

Observability
-------------
* Prometheus Metrics: Custom metrics for all services
* Grafana Dashboards: Visualization and monitoring
* Distributed Logging: Centralized logging with Grafana Alloy and Loki
* Service Health: Readiness and liveness probes

Non-functional requirements: Scalability & Resilience
------------------------------
* Batch Processing: Batching likes, comments, and reward count updates for efficiency
* Kubernetes Orchestration: Automated deployment, scaling, and management
* Event-driven Architecture: Loose coupling via Kafka for scalability
* Polyglot Persistence: Optimized data storage strategies per service


🛠️ Development Setup
====================

Prerequisites
------------
- Node.js 22+
- Docker & Docker Compose
- Kubernetes (Docker Desktop, k3s or Minikube)
- Skaffold CLI
- kubectl

Quick Start
-----------

1. **Clone the repository**
```bash
git clone https://github.com/abhiram-ar/humane-backend.git
cd humane-backend
```

2. **Initialize submodules**
```bash
git submodule update --init --recursive
```

3. **Start infrastructure components**

Manually start the infrastructure comonents like kafka, elasticsearch, databases, Api gateway etc. using the manifests or helper scripts in `infra/k8s-dev-manual/`.

4. **Start the microservices**


a. **Start in development mode:**

```bash
skaffold dev
```
This command will:
- Build all microservices
- Deploy to local Kubernetes cluster
- Enable hot-reloading for development when code changes are detected



b. **Start in production mode:**
```bash
skaffold run --config skaffold.prod.yaml
```
This command will:
- Pull pre-built Docker images from Docker Hub
- Deploy to local Kubernetes cluster



5. **Access services**
- Frontend: `http://localhost:5173` (via `humane-frontend` submodule)
- API Gateway: Available via Kubernetes ingress
- Grafana: Port-forward to access dashboards

### Environment Variables

Each service requires specific environment variables. Refer to individual service README files for details:
- [Writer Service](./writer-service/README.md)
- [Chat Service](./chat-service/README.md)
- [Moderation Service](./moderation-service/README.md)
- And more...



## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. Follow code style and linting rules (Prettier config included)
4. Write **unit and integration tests**
5. Document **API changes** and data schema modifications
6. Submit a **pull request**

### Code Standards
- Use TypeScript strict mode
- Follow existing architectural patterns (Clean Architecture/Hexagonal)
- Write meaningful commit messages
- Keep services decoupled and event-driven


## 🧾 Project Roadmap

### Upcoming Features
- [ ] **Group Chat**: Multi-user conversations with group admin controls 
- [ ] **Advanced Search**: Filters by date, popularity, media type
- [x] **Voice and Video calls**: WebRTC integration for real-time communication
- [ ] **Analytics Dashboard**: User engagement insights
- [ ] **Content Recommendations**: ML-based personalized content discovery
- [ ] **Mobile App**: React Native client

### Infrastructure Improvements
- [x] **Infra management scripts**: Automate infrastructure setup and teardown
- [ ] **Kafka StatefulSet**: Convert from Deployment for persistence and fault tolerance
- [ ] **Service Mesh**: Implement Istio for advanced traffic management
- [x] **API Gateway**: Centralized Kong/Traefik gateway
- [x] **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- [ ] **Multi-region Deployment**: Geographic redundancy
- [ ] **Internal Route Security**: Restrict public access to internal Elasticsearch proxy routes

### Documentation & Testing
- [ ] API documentation with Swagger/OpenAPI
- [ ] Comprehensive unit test coverage (>80%)
- [ ] End-to-end testing suite
- [ ] Load testing and performance benchmarks



## Documentation

- [Architecture Diagrams](./Docs/)
- [Observability Setup](./infra/k8s-dev-manual/observability/)




## Acknowledgments

- [NSFWJS](https://github.com/infinitered/nsfwjs) for NSFW image classification model
- The open-source community for amazing tools and libraries
- Inspired by modern social that drifed from what social media should be.


<br>

<div align="center">

**Built with ❤️ for a more humane social experience**

</div>
