# Humane Backend - Data Flow Documentation

This document provides comprehensive documentation for all data flows in the Humane backend system, organized by feature categories.

## Table of Contents

- [Post Service Flows](#post-service-flows)
  - [Create Post Flow](#create-post-flow)
  - [Get Feed Flow](#get-feed-flow)
  - [Create Comment Flow](#create-comment-flow)
  - [Fetch Post Comments Flow](#fetch-post-comments-flow)
  - [Like a Comment Flow](#like-a-comment-flow)
- [Real-time Communication Flows](#real-time-communication-flows)
  - [WebSocket Connection Flow](#websocket-connection-flow)
  - [Send Message Flow](#send-message-flow)
  - [Typing Indicator Flow](#typing-indicator-flow)
  - [Is Online Flow](#is-online-flow)
  - [Call Initiation Flow](#call-initiation-flow)
  - [Accept Call Flow](#accept-call-flow)
- [System Architecture](#system-architecture)

---

## Post Service Flows

### Create Post Flow

![Create Post Flow](./create-post.flow.png)

**Overview:**
The create post flow handles user-generated content creation, moderation, and distribution to user timelines.



**Notes:**
- Only `postId` is stored in timelines; full post data retrieved on read
- Moderation happens asynchronously to improve write performance
- Failed moderation doesn't block timeline distribution

---

### Get Feed Flow

![Get Feed Flow](./get-feed.flow.png)

**Overview:**
The get feed flow retrieves and aggregates posts from multiple sources to create a personalized user feed.

**Data Flow Steps:**

1. **Client Request**
   - User requests their feed
   - Request sent to **Feed Service**

2. **Timeline Retrieval**
   - Feed Service queries **User Timeline Store** for postIds
   - Returns paginated list of postIds with timestamps

3. **Friend Content Aggregation**
   - Feed Service queries **User Service** to get user's friends list
   - Categorizes friends as:
     - **Hot friends** (high follower count/engagement)
     - **Regular friends**

4. **Hot User Content**
   - For each hot friend/celebrity:
     - Queries their **Timeline Store**
     - Retrieves recent postIds
   - Aggregates hot user posts

5. **Regular Friend Content**
   - For non-hot friends:
     - Queries their **Timeline Stores**
     - Retrieves recent postIds
   - Aggregates regular friend posts

6. **Post Details Enrichment**
   - Feed Service queries **ES Proxy** with collected postIds
   - ES Proxy retrieves full post details from **Elasticsearch**:
     - Post content
     - Author information
     - Metadata (likes, comments, timestamps)
     - Moderation status

7. **Response Aggregation**
   - Feed Service merges and sorts posts:
     - By timestamp (most recent first)
     - By engagement score (for hot content)
   - Applies pagination
   - Returns aggregated response to client

**Key Components:**
- Feed Service (API endpoint + aggregation logic)
- User Service (friend relationships)
- Timeline Stores (multiple per user/hot-user)
- ES Proxy (post detail retrieval)
- Elasticsearch (post data store)



**Performance Optimizations:**
- Timeline queries are fast (pre-computed postIds)
- Parallel fetching of hot vs regular friend content
- Bulk post detail retrieval from ES
- Caching of friend lists

---

### Create Comment Flow

![Create Comment Flow](./create-comment.flow.png)

**Overview:**
The create comment flow handles comment creation on posts, including rewards and search indexing.

**Data Flow Steps:**

1. **Client Request**
   - User submits comment with:
     - `postId`: Target post
     - `content`: Comment text
     - `authorId`: Commenter's userId
   - Request sent to **Writer Service**

2. **Comment Creation**
   - Writer Service generates `commentId`
   - Creates comment object:
     - `commentId`
     - `postId`
     - `content`
     - `authorId`
     - `createdAt`
     - `updatedAt`
     - `likeCount`: 0 (initial)
   - Stores comment in database

3. **Post Counter Update**
   - Writer Service updates post's `commentCount`:
     - Increments by 1
     - Can be done via:
       - Direct update
       - Or bulk update worker (for high load)

4. **Event Publishing**
   - Publishes `comment.created` event to **Kafka**
   - Event payload includes full comment details

5. **Reward Processing**
   - **Reward Service** consumes `comment.created` event
   - Awards points to commenter:
     - `userId = commenterId`
     - `humaneScore += reward` (configured reward value)
   - Updates user's humane score in database

6. **Search Indexing**
   - **ES Proxy** consumes `comment.created` event
   - Indexes comment in **Elasticsearch**:
     - `commentId`
     - `postId` (for filtering)
     - `content` (searchable)
     - `authorId`
     - `createdAt`
     - `updatedAt`
     - `likeCount`
   - Enables comment search and filtering

7. **Response**
   - Writer Service returns created comment to client
   - Includes all comment details



### Fetch Post Comments Flow

![Fetch Post Comments Flow](./fetch-post-comments.flow.png)

**Overview:**
Retrieves all comments for a specific post with enriched metadata (likes, author info).


---

### Like a Comment Flow

![Like a Comment Flow](./like-a-comment.flow.png)

**Overview:**
Handles liking/unliking comments with async processing for counts and notifications.




---

## Real-time Communication Flows

### WebSocket Connection Flow

![WebSocket User Device Room Flow](./ws-user-device-room.flow.png)

**Overview:**
Manages WebSocket connections and user presence across multiple devices.
tes last seen timestamp



---

### Send Message Flow

![Send Message Flow](./send-message.flow.png)

**Overview:**
Handles real-time message delivery between users with persistence and delivery tracking.

**Data Flow Steps:**

1. **Client Sends Message**
   - User composes message
   - WebSocket emit:
     - Event: `send_message`
     - Payload:
       - `chatId`: Conversation ID
       - `content`: Message text
       - `recipientId`: Target user
       - Optional: `mediaURL`, `replyToMessageId`

2. **Message Receipt**
   - **Chat Service** receives message via WebSocket
   - Validates:
     - User authentication
     - Message content (length, format)
     - Chat permissions (is user in chat?)

3. **Message Persistence**
   - Chat Service stores message:
     - Generates `messageId`
     - Stores in database:
       - `messageId`
       - `chatId`
       - `senderId`
       - `content`
       - `createdAt`
       - `status`: 'sent'
       - Optional: `mediaURL`, `replyToMessageId`

4. **Sender Confirmation**
   - Emit `message_sent` event back to sender
   - Includes:
     - `messageId` (for client-side correlation)
     - `status`: 'sent'
     - `timestamp`
   - Allows sender to update UI optimistically

5. **Recipient Delivery**
   - Chat Service checks recipient online status:
     - Query `presence:{recipientId}` from Redis
   
   **If recipient is online:**
   - Emit `new_message` event to recipient's device rooms
   - Includes full messge object
   

6. **Multi-Device Delivery**
   - If recipient has multiple devices connected:
     - Emit to all device rooms: `user:{recipientId}:device:*`
     - Each device receives message
     - Ensures sync across devices

7. **Read Receipts** (optional)
   - When recipient opens/views message:
     - Client emits `message_read` event
     - Server updates message status: 'read'
     - Broadcasts read status to sender

8. **Notification Trigger**
   - If recipient offline or message important:
     - Publish event to **Notification Service**
     - Triggers push notification
     - Includes message preview


---

### Typing Indicator Flow

![Typing Indicator Flow](./typing-indicator.flow.png)

**Overview:**
Provides real-time typing indicators to show when users are composing messages.

**Data Flow Steps:**

1. **User Starts Typing**
   - Client detects typing activity (keystroke events)
   - Debounced to avoid excessive events
   - Emits WebSocket event:
     - Event: `typing_start`
     - Payload:
       - `chatId`: Current conversation
       - `userId`: Typing user
       - `timestamp`: Typing started time

2. **Server Broadcast**
   - **Chat Service** receives `typing_start`
   - Validates user is in chat
   - Broadcasts to other chat participants:
     - Emit `user_typing` to room: `chat:{chatId}`
     - Excludes sender
     - Payload:
       - `userId`: Who's typing
       - `chatId`: Which conversation
       - `timestamp`: Typing started time

3. **Client UI Update**
   - Recipients receive `user_typing` event
   - Display typing indicator:
     - "John is typing..."
     - Animated dots
   - Shows in chat interface


4. **Indicator Removal**
   - no typing activity beat -> user is not typing dont need to send typing stop, reciving clients will handle it if no typing start received in timeout period





---

### Is Online Flow

![Is Online Flow](./is-Online.flow.png)

**Overview:**
Tracks and broadcasts user online/offline status to contacts in real-time.


**Scalability Considerations:**
- Redis pub/sub for presence events
- Batch presence checks
- Cache friend lists
- Horizontal scaling of Chat Service (sticky sessions or shared Redis)

---

### Call Initiation Flow

![Call Initiation Flow](./call-initiation.png)

**Overview:**
Handles the initiation of voice/video calls between users with signaling and presence validation.

**Data Flow Steps:**

1. **Call Initiation Request**
   - Caller initiates call from UI
   - Client emits WebSocket event:
     - Event: `call:initiate`
     - Payload:
       ```typescript
       {
         callId: string,        // unique call identifier
         callerId: string,      // initiating user
         recipientId: string,   // target user
         callType: 'voice' | 'video',
         timestamp: Date
       }
       ```

2. **Call State Creation**
   - **Chat Service** receives initiation request
   - Creates call state in Redis:
     - Key: `call:{callId}`
     - Value:
       ```typescript
       {
         callId: string,
         callerId: string,
         recipientId: string,
         callType: 'voice' | 'video',
         status: 'ringing',
         initiatedAt: Date,
         participants: [callerId, recipientId]
       }
       ```
     - TTL: 60 seconds (call timeout if not answered)

3. **WebRTC Signaling Setup**
   - Chat Service facilitates WebRTC peer connection:
     - Creates ICE candidates
     - Generates SDP (Session Description Protocol) offer
     - Stores signaling data temporarily

4. **Recipient Notification**
   - Chat Service broadcasts to recipient:
     - Emit `call:incoming` to recipient's device rooms
     - Payload:
       ```typescript
       {
         callId: string,
         caller: {
           userId: string,
           username: string,
           avatar: string
         },
         callType: 'voice' | 'video',
         sdpOffer: string,      // WebRTC offer
         timestamp: Date
       }
       ```
   
5. **Caller UI Update**
   - Emit `call:ringing` back to caller
   - Update caller's UI:
     - Show "Calling..." screen
     - Display recipient info
     - Start ringing tone
     - Show cancel button

6. **Multi-Device Handling**
   - If recipient has multiple devices online:
     - Send notification to all devices
     - First device to accept wins
     - Cancel other device notifications

7. **Push Notification Fallback**
   - If recipient's app in background:
     - **Notification Service** sends push notification
     - "Incoming call from {username}"
     - High-priority notification (appears on lock screen)
     - Includes action buttons: Accept/Decline

8. **Call Timeout Handling**
   - If no response within timeout (30-60s):
     - Chat Service detects TTL expiration
     - Emit `call:timeout` to caller
     - Emit `call:missed` to recipient
     - Update call state: `status: 'missed'`
     - Persist missed call record

9. **Caller Cancellation**
    - If caller cancels before answer:
      - Client emits `call:cancel`
      - Server broadcasts `call:cancelled` to recipient
      - Clean up call state
      - Remove notifications



**Error Handling:**
- **Recipient Offline**: Return error immediately, don't create call state
- **Recipient Busy**: Check for active call, return "busy" status
- **Network Issues**: Retry signaling, fallback to push notification
- **Invalid User**: Validate both users exist and have permissions


---

### Accept Call Flow

![Accept Call Flow](./accept-call.png)

**Overview:**
Handles the recipient accepting an incoming call and establishing the WebRTC peer connection.

**Data Flow Steps:**

1. **Call Notification Display**
   - Recipient receives `call:incoming` event (from Call Initiation Flow)
   - Display incoming call UI:
     - Caller's name and avatar
     - Call type (voice/video)
     - Accept and Decline buttons
     - Play ringtone

2. **Accept Action**
   - User taps/clicks "Accept" button
   - Client performs pre-accept checks:
     - Check microphone/camera permissions
     - Request permissions if not granted
     - Verify device capability
   
3. **Accept Event Emission**
   - Client emits WebSocket event:
     - Event: `call:accept`
     - Payload:
       ```typescript
       {
         callId: string,
         recipientId: string,  // accepting user
         sdpAnswer: string     // WebRTC answer
       }
       ```

4. **Call State Update**
   - **Chat Service** receives accept event
   - Updates call state in Redis:
     - Key: `call:{callId}`
     - Update fields:
       - `status`: 'ringing' → 'active'
       - `answeredAt`: current timestamp
       - `webrtcData.sdpAnswer`: from client
     - Remove TTL (call is now active)

5. **Multi-Device Call Cancellation**
   - Cancel call on recipient's other devices:
     - Emit `call:answered_elsewhere` to other device rooms
     - Dismiss call notifications
     - Remove incoming call UI

6. **Notify Caller**
   - Chat Service emits to caller:
     - Event: `call:accepted`
     - Payload:
       ```typescript
       {
         callId: string,
         recipientId: string,
         sdpAnswer: string,      // WebRTC answer from recipient
         timestamp: Date
       }
       ```
   
7. **Caller UI Transition**
   - Caller receives acceptance
   - Stop ringing tone
   - Transition from "Calling..." to active call UI
   - Show call timer
   - Display video feed (if video call)

8. **WebRTC Peer Connection Establishment**
   - Both clients complete WebRTC handshake:
     - Exchange ICE candidates via Chat Service
     - Event: `call:ice_candidate`
     - Payload: `{ callId, candidate }`
   - Establish peer-to-peer connection
   - Media streams start flowing (audio/video)

9. **Active Call Monitoring**
   - Chat Service monitors call health:
     - Heartbeat from both parties
     - Track call duration
     - Monitor connection quality (optional)
   
10. **Call Room Creation**
    - Create dedicated call room:
      - Room: `call:{callId}`
      - Both users join room
    - Used for:
      - Relaying ICE candidates
      - Call control events (mute, video toggle)
      - Connection state updates

11. **Persistence & Analytics**
    - Store call record in database:
    - Update user's call history
    - Track for analytics (call success rate, etc.)

12. **Call Active State**
    - Both clients in active call
    - Available actions:
      - Mute/unmute microphone
      - Toggle video (if video call)
      - Switch camera (front/back)
      - End call
    - Events relayed through Chat Service

---

## System Architecture

![System Architecture](./system-design.svg)

**Overview:**
High-level architecture of the Humane backend system showing service interactions and data flow.

### Core Services

1. **Writer Service**
   - Handles all write operations (posts, comments, likes)
   - Publishes events to Kafka
   - Multiple workers for async processing:
     - Like Count Worker
     - Has Post Author Liked Worker
   - Tech: Node.js/TypeScript, PostgreSQL (primary writes)

2. **Feed Service**
   - Aggregates and serves user feeds
   - Consumes events for timeline updates
   - Queries multiple timeline stores
   - Tech: Node.js/TypeScript, Redis (timeline storage)

3. **Chat Service**
   - WebSocket server for real-time communication
   - Handles messaging, typing indicators, presence
   - Tech: Node.js/TypeScript, Socket.io/WS, Redis (pub/sub)

4. **User Service**
   - User authentication and authorization
   - Friend relationships and social graph
   - User profiles and preferences
   - Tech: Node.js/TypeScript, PostgreSQL

5. **Moderation Service**
   - Content moderation (text and media)
   - ML-based classification
   - Manual review queue
   - Tech: Python, ML models, PostgreSQL

6. **Notification Service**
   - Push notifications
   - Email notifications
   - In-app notifications
   - Tech: Node.js/TypeScript, FCM/APNs, email service

7. **Reward Service**
   - Gamification and humane score tracking
   - Reward calculation and distribution
   - Leaderboards
   - Tech: Node.js/TypeScript, PostgreSQL

8. **ES Proxy**
   - Elasticsearch interface
   - Consumes events for indexing
   - Query optimization
   - Tech: Node.js/TypeScript, Elasticsearch

### Data Stores

1. **PostgreSQL**
   - Primary database for:
     - Users
     - Posts (metadata)
     - Comments
     - Relationships
   - Multiple instances (per service)

2. **MongoDB**
   - Document storage for:
     - Chat messages
     - Rich user profiles
     - Moderation history
   - Replica set for HA

3. **Redis**
   - Caching layer
   - Timeline stores
   - Presence tracking
   - Session management
   - Pub/sub for real-time features

4. **Elasticsearch**
   - Full-text search for:
     - Posts
     - Comments
     - Users
   - Analytics and aggregations

5. **S3 (Object Storage)**
   - Media files (images, videos)
   - Presigned URLs for uploads
   - CDN integration

### Message Broker

**Kafka**
- Event streaming platform
- Enables async, decoupled architecture
- Event sourcing and replay capability

### Infrastructure

1. **Kubernetes (K8s)**
   - Container orchestration
   - Service discovery
   - Auto-scaling
   - Configuration: `infra/k8s/`

2. **Skaffold**
   - Local development workflow
   - CI/CD integration
   - Configs: `skaffold.yaml`, `skaffold.prod.yaml`

3. **Load Balancers**
   - Nginx Ingress Controller
   - Routes traffic to services
   - SSL termination

### Communication Patterns

1. **Synchronous (HTTP/REST)**
   - Client ↔ Services
   - Service ↔ Service (when immediate response needed)
   - Examples: API requests, user queries

2. **Asynchronous (Kafka Events)**
   - Service → Kafka → Service(s)
   - Examples: Post creation, moderation, indexing
   - Benefits: Decoupling, resilience, scalability

3. **Real-time (WebSocket)**
   - Client ↔ Chat Service
   - Examples: Messages, typing indicators, presence
   - Bidirectional, persistent connections

4. **Caching**
   - Redis for frequently accessed data
   - Reduces database load
   - Improves response times



### Security

- **Authentication**: JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Per-user, per-endpoint
- **Data Encryption**: TLS in transit, encryption at rest
- **Secret Management**: Kubernetes secrets, environment variables

### Monitoring & Observability

- **Logging**: Centralized logging (Grafana + Loki)
- **Metrics**: Prometheus + Grafana
- **Health Checks**: Kubernetes liveness/readiness probes

### Scalability Strategies

1. **Horizontal Scaling**
   - Stateless services (Writer, Feed, etc.)
   - Kubernetes auto-scaling

2. **Database Sharding**
   - Shard by userId for timelines
   - Shard by postId for posts

3. **Caching**
   - Redis for hot data
   - CDN for static assets

4. **Read Replicas**
   - PostgreSQL read replicas for queries
   - Reduce load on primary

5. **Event-Driven Architecture**
   - Kafka for async processing
   - Decouples services
   - Enables independent scaling

---

## Additional Notes

### Media Upload Flow
- Client requests presigned S3 URL from Writer Service
- Client uploads directly to S3
- S3 URL included in post/comment creation
- Moderation Service validates media asynchronously


### Data Consistency
- **Strong Consistency**: Write operations (posts, comments)
- **Eventual Consistency**: Timeline distribution, search indexing
- **Conflict Resolution**: Last-write-wins for updates



---

*For more detailed information on specific services, refer to individual service README files in their respective directories.*

