# Humane Backend

<div align="center">

**A behavior-rewarding, real-time social network built on microservices architecture**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5.svg)](https://kubernetes.io/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-Event%20Streaming-231F20.svg)](https://kafka.apache.org/)

</div>



## 📖 Overview

Humane Backend powers the server-side infrastructure of Humane, a human-first social platform focused on meaningful interactions, positive behavior, and real-world connection rather than attention-driven engagement. It is built as a scalable, event-driven microservices system. The platform uses Apache Kafka for asynchronous service communication, Kubernetes for orchestration, and a polyglot persistence strategy to balance consistency, performance, and scalability, while following Clean / Hexagonal Architecture principles for long-term maintainability.

## 🏗️ System Architecture

![System Architecture](/Docs/full-architecture-light.png)



## Core Features

### 👥 User Management
- **Authentication & Authorization**: JWT-based auth with Google OAuth integration
- **User Profiles**: Customizable profiles with avatar and cover photos
- **Friend System**: Send/accept friend requests, manage relationships
- **Password Management**: Secure password hashing, reset, and change functionality
- **Email Verification**: Verification emails via nodemailer

### ✍️ Content Creation & Management
- **Posts**: Create, update, delete posts with text and media attachments
- **Comments**: Nested commenting system with like/unlike functionality
- **Hashtags**: Automatic hashtag extraction and trending hashtag tracking
- **Visibility Controls**: Public, friends-only, and private post visibility
- **Media Upload**: Pre-signed URL generation for secure client-side uploads

### 🛡️ Content Moderation
- **AI-Powered Moderation**: Automated NSFW detection using pre-build CNN model
- **Video Processing**: Frame extraction and analysis using FFmpeg
- **Multi-frame Analysis**: Identifies "hottest" frames in video content
- **Configurable Thresholds**: Admin-adjustable sensitivity for content flagging
- **User Notifications**: Alerts for flagged or failed moderation

### 💬 Real-time Chat
- **1-1 Messaging**: WebSocket-based instant messaging via Socket.IO
- **Online Status**: Real-time user presence tracking
- **Read Receipts**: Conversation-level read tracking (timestamp-based)
- **Message Persistence**: Reliable message delivery with acknowledgments
- **Reward Integration**: Gamified engagement for active conversations

### 🔔 Notifications
- **Real-time Delivery**: WebSocket-based instant notifications
- **Event-driven**: Kafka consumers trigger notifications for various events
- **Types Supported**: Friend requests, comments, likes, moderation alerts
- **Pagination**: Efficient infinite scroll for notification history

### 🔍 Search & Discovery
- **Full-text Search**: Elasticsearch-powered search for posts, comments, users
- **User Timeline**: Paginated user post history
- **Feed Optimization**: Redis-cached personalized feeds

### 🎁 Gamification & Rewards
- **Humane Score**: Point system for user engagement
- **Configurable Rewards**: Admin-configurable point values for actions
- **Activity Tracking**: Automated reward distribution via Kafka events
- **Leaderboards**: Platform-wide reward statistics

### 📊 Observability
- **Prometheus Metrics**: Custom metrics for all services
- **Grafana Dashboards**: Visualization and monitoring
- **Distributed Logging**: Centralized logging with Grafana Alloy and Loki
- **Service Health**: Readiness and liveness probes



## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 22+
- **Language**: TypeScript 5.8+
- **Framework**: Express.js 5
- **Validation**: Zod

### Databases
- **PostgreSQL**: User data, relationships, rewards
- **MongoDB**: Posts, comments, chats, notifications
- **Redis**: Caching, session management
- **Elasticsearch**: Search indices

### Event Streaming
- **Apache Kafka**: Inter-service communication
- **RabbitMQ**: Worker queues for async tasks

### Infrastructure
- **Orchestration**: Kubernetes (Skaffold for dev, K3s for prod)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + Grafana Loki

### Cloud & Storage
- **AWS S3**: Media storage
- **AWS CloudFront**: CDN

### Machine Learning
- **TensorFlow.js**: ML inference
- **Inception v3 CNN model**: Image Classifier for NSFW
- **FFmpeg**: Video processing


## 🚀 Development Setup

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- Kubernetes (Docker Desktop, k3s or Minikube)
- Skaffold CLI
- kubectl

### Quick Start

#### 1. **Clone the repository**
```bash
git clone https://github.com/abhiram-ar/humane-backend.git
cd humane-backend
```

#### 2. **Initialize submodules**
```bash
git submodule update --init --recursive
```

#### 3. **Start infrastructure components**

Manually start the infrastructure comonents like kafka, elasticsearch, databases, Api gateway etc. using the manifests or helper scripts in `infra/k8s-dev-manual/`.

#### 4. **Start the microservices**


##### a. **Start in development mode:**

```bash
skaffold dev
```
This command will:
- Build all microservices
- Deploy to local Kubernetes cluster
- Enable hot-reloading for development when code changes are detected



##### b. **Start in production mode:**
```bash
skaffold run --config skaffold.prod.yaml
```
This command will:
- Pull pre-built Docker images from Docker Hub
- Deploy to local Kubernetes cluster



#### 5. **Access services**
- Frontend: `http://localhost:5173` (via `humane-frontend` submodule)
- API Gateway: Available via Kubernetes ingress
- Grafana: Port-forward to access dashboards

### Environment Variables

Each service requires specific environment variables. Refer to individual service README files for details:
- [User Service](./user-service/README.md)
- [Writer Service](./writer-service/README.md)
- [Chat Service](./chat-service/README.md)
- [Moderation Service](./moderation-service/README.md)
- And more...



## 🤝 Contributing

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


## 📋 Project Roadmap

### 🎯 Upcoming Features
- [ ] **Group Chat**: Multi-user conversations with admin controls
- [ ] **Story Feature**: Ephemeral content with 24-hour expiry
- [ ] **Advanced Search**: Filters by date, popularity, media type
- [ ] **Voice**: WebRTC integration for real-time communication
- [ ] **Analytics Dashboard**: User engagement insights
- [ ] **Content Recommendations**: ML-based personalized content discovery
- [ ] **Mobile App**: React Native client

### 🔧 Infrastructure Improvements
- [ ] **Kafka StatefulSet**: Convert from Deployment for persistence and fault tolerance
- [ ] **Service Mesh**: Implement Istio for advanced traffic management
- [x] **API Gateway**: Centralized Kong/Traefik gateway
- [x] **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- [ ] **Multi-region Deployment**: Geographic redundancy
- [ ] **Internal Route Security**: Restrict public access to internal Elasticsearch proxy

### 📚 Documentation & Testing
- [ ] API documentation with Swagger/OpenAPI
- [ ] Comprehensive unit test coverage (>80%)
- [ ] End-to-end testing suite
- [ ] Load testing and performance benchmarks

### 🔐 Security Enhancements
- [ ] Content encryption at rest
- [ ] Two-factor authentication (2FA)
- [ ] Role-based access control (RBAC) improvements
- [ ] Security audit and penetration testing
- [ ] GDPR compliance features



## 📚 Documentation

- [Architecture Diagrams](./Docs/)
- [Moderation ML Evaluations](./moderation-service/ML-evals/README.md)
- [Observability Setup](./infra/k8s-dev-manual/observability/)
- [Individual Service READMEs](./chat-service/README.md)



## 📄 License

This project is licensed under the ISC License.



## 👨‍💻 Author

**Abhiram AR** ([@abhiram-ar](https://github.com/abhiram-ar))



## 🙏 Acknowledgments

- [NSFWJS](https://github.com/infinitered/nsfwjs) for content moderation models
- The open-source community for amazing tools and libraries
- Inspired by modern social that drifed from what social media should be.


<br>

<div align="center">

**Built with ❤️ for a more humane social experience**

</div>