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

**Data Flow Steps:**

1. **Client Request**
   - User submits post with: `userId`, `content`, and optional `mediaURL`
   - Request sent to **Writer Service**

2. **Initial Post Creation**
   - Writer Service creates post object with:
     - `postId` (generated)
     - `authorId` (from userId)
     - `content`
     - `mediaURL` (if provided)
     - Initial moderation status: pending

3. **Event Publishing**
   - Writer Service publishes `post.created` event to **Kafka**
   - Event contains: `postId`, `authorId`, `content`, `mediaURL`

4. **Moderation Processing**
   - **Moderation Service** consumes `post.created` event
   - Performs content moderation on text and media
   - Updates post with moderation results:
     - `contentModeration` status
     - `mediaModeration` status
   - Publishes `post.moderation.completed` event to Kafka

5. **Timeline Distribution**
   - **Feed Service** consumes `post.moderation.completed` event
   - Queries **User Service** to get author's friends list and hot users/celebrities
   - Distributes post to multiple timeline stores:
     - **User Timeline Store** (author's own timeline)
     - **Friend Timeline Stores** (friend1, friend2, ..., friendN)
     - **Hot User Timeline Stores** (celebrities/influencers)
   - Each timeline entry stores: `postId`, `authorId`

6. **Search Indexing**
   - **ES Proxy** consumes post events from Kafka
   - Indexes post data in **Elasticsearch** for search functionality
   - Enables full-text search on post content

**Key Components:**
- Writer Service (API endpoint)
- Moderation Service (async worker)
- Feed Service (async worker)
- User Service (friend relationships)
- Kafka (event bus)
- ES Proxy (search indexing)
- Timeline Stores (Redis/similar)
- Elasticsearch (search)

**Data Models:**

```typescript
// Initial Post Creation
{
  userId: string
  content: string
  mediaURL?: string
}

// After Processing
{
  postId: string
  authorId: string
  content: string
  contentModeration: ModerationStatus
  mediaURL?: string
  mediaModeration?: ModerationStatus
}

// Timeline Entry
{
  postId: string
  authorId: string
}
```

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

**Query Pattern:**
```typescript
// Timeline Query
GET userTimeline/{userId}?page=1&limit=20
→ Returns: [postId1, postId2, ...]

// Friend Query
GET user-service/friends/{userId}
→ Returns: { hotFriends: [...], regularFriends: [...] }

// Post Details Query
POST es-proxy/posts/bulk
Body: { postIds: [...] }
→ Returns: [{ postId, content, author, ... }, ...]
```

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

**Key Components:**
- Writer Service (API endpoint)
- Reward Service (gamification)
- ES Proxy (search indexing)
- Kafka (event bus)
- Elasticsearch (comment storage & search)

**Data Models:**

```typescript
// Request
{
  postId: string
  content: string
  authorId: string
}

// Response & ES Document
{
  commentId: string
  postId: string
  content: string
  authorId: string
  createdAt: Date
  updatedAt: Date
  likeCount: number
}

// Reward Event
{
  userId: string  // commenterId
  action: 'comment_created'
  reward: number
  humaneScore: number  // updated score
}
```

**Business Logic:**
- Comments are immediately visible (no moderation)
- Rewards incentivize quality comments
- Post comment count updated synchronously or via worker
- Failed indexing doesn't block comment creation

---

### Fetch Post Comments Flow

![Fetch Post Comments Flow](./fetch-post-comments.flow.png)

**Overview:**
Retrieves all comments for a specific post with enriched metadata (likes, author info).

**Data Flow Steps:**

1. **Client Request**
   - Client requests comments for a post:
     - `postId`: Target post
     - Optional pagination params: `page`, `limit`
   - Request sent to **Writer Service** or **Feed Service**

2. **Comment Retrieval**
   - Service queries **Elasticsearch** via **ES Proxy**
   - Query filters by `postId`
   - Returns comments sorted by:
     - `createdAt` (chronological)
     - Or by `likeCount` (popular first)

3. **Like Metadata Enrichment**
   - For each comment, add:
     - `likeCount`: Total likes
     - `likedByMe`: Boolean (has requesting user liked this?)
     - `likedByAuthor`: Boolean (has post author liked this?)
   - Like data queried from:
     - Like store (Redis/DB)
     - Or pre-indexed in ES

4. **Author Information**
   - For each comment, fetch author details:
     - Username
     - Avatar
     - Display name
   - Can be:
     - Joined query with User Service
     - Or pre-indexed in ES document

5. **Response Assembly**
   - Assemble full comment objects:
     ```typescript
     {
       commentId: string
       postId: string
       content: string
       authorId: string
       author: { username, avatar, displayName }
       createdAt: Date
       updatedAt: Date
       likeCount: number
       likedByMe: boolean
       likedByAuthor: boolean
     }
     ```
   - Apply pagination
   - Return to client

**Key Components:**
- Writer/Feed Service (API endpoint)
- ES Proxy (query interface)
- Elasticsearch (comment storage)
- Like Store (like metadata)
- User Service (author details)

**Query Patterns:**

```typescript
// ES Query
GET /comments/_search
{
  "query": {
    "term": { "postId": "<postId>" }
  },
  "sort": [
    { "createdAt": "desc" }  // or "likeCount": "desc"
  ],
  "from": 0,
  "size": 20
}

// Like Check
GET /likes/comment/{commentId}/user/{userId}
→ Returns: { liked: boolean }

// Bulk Like Check
POST /likes/comments/bulk
Body: { commentIds: [...], userId }
→ Returns: { [commentId]: boolean }
```

**Performance Considerations:**
- ES provides fast filtering by postId
- Like checks can be batched
- Author info can be cached or pre-indexed
- Pagination prevents large result sets

---

### Like a Comment Flow

![Like a Comment Flow](./like-a-comment.flow.png)

**Overview:**
Handles liking/unliking comments with async processing for counts and notifications.

**Data Flow Steps:**

1. **Client Request**
   - User likes a comment:
     - `commentId`: Target comment
     - `userId`: Liker's ID (from auth)
   - Request sent to **Writer Service** like API

2. **Like Action Processing**
   - Writer Service performs:
     - Check if already liked (toggle logic)
     - If not liked: Create like record
       - `commentId`
       - `likedBy`: userId
       - `createdAt`: timestamp
     - If already liked: Remove like record

3. **Event Publishing**
   - Publishes `comment.like.requested` event to **Kafka**
   - Event contains:
     - `commentId`
     - `likedBy`: userId
     - `action`: 'like' or 'unlike'

4. **Like Count Update Worker**
   - **Writer Service Like Count Worker** consumes event
   - Updates comment's `likeCount` in database:
     - Increment for 'like'
     - Decrement for 'unlike'
   - Can batch updates for performance

5. **ES Sync Worker**
   - **ES Proxy** consumes `comment.liked` event
   - Updates comment document in **Elasticsearch**:
     - Updates `likeCount`
     - Updates like metadata
   - Ensures search results reflect current state

6. **Notification Processing**
   - **Notification Service** consumes `comment.liked` event
   - Sends notification to comment author:
     - "{username} liked your comment"
     - Includes comment preview
   - Notification sent via:
     - Push notification
     - In-app notification
     - Email (based on preferences)

7. **Reward Processing**
   - **Reward Service** consumes event
   - Awards points to:
     - **Comment Author**: Receives reward for engaging content
       - `userId = commentAuthorId`
       - `humaneScore += reward`
     - **Liker** (optional): Small reward for engagement
   - Updates humane scores in database

8. **Post Author Notification**
   - **Writer Service Has Post Author Liked Worker**
   - Tracks if post author has liked the comment
   - Updates `likedByAuthor` flag
   - Can trigger special notification/badge

**Key Components:**
- Writer Service (API + multiple workers)
  - Like API endpoint
  - Like Count Worker
  - Has Post Author Liked Worker
- ES Proxy (search sync)
- Notification Service (user notifications)
- Reward Service (gamification)
- Kafka (event coordination)
- Elasticsearch (search index)

**Data Models:**

```typescript
// Like Record
{
  commentId: string
  likedBy: string  // userId
  createdAt: Date
}

// Like Event
{
  commentId: string
  likedBy: string
  action: 'like' | 'unlike'
  postId: string
  commentAuthorId: string
}

// ES Update
{
  commentId: string
  likeCount: number  // updated
  likedByAuthor: boolean  // if post author liked
}
```

**Async Processing Benefits:**
- Fast API response (like recorded immediately)
- Count updates batched for efficiency
- Notifications don't block user action
- ES eventual consistency acceptable
- Failed workers can retry

---

## Real-time Communication Flows

### WebSocket Connection Flow

![WebSocket User Device Room Flow](./ws-user-device-room.flow.png)

**Overview:**
Manages WebSocket connections and user presence across multiple devices.

**Data Flow Steps:**

1. **Connection Establishment**
   - Client initiates WebSocket connection
   - Includes authentication token in connection request
   - Sent to **Chat Service** WebSocket server

2. **Authentication & Room Assignment**
   - Chat Service validates token
   - Creates user-device room:
     - Room ID: `user:{userId}:device:{deviceId}`
     - Allows multi-device support
   - Joins user to their personal room
   - Stores connection metadata:
     - userId
     - deviceId
     - socketId
     - connectionTime

3. **Presence Update**
   - Chat Service marks user as online
   - Updates presence in Redis:
     - Key: `presence:{userId}`
     - Value: online status + last seen
     - TTL: connection timeout duration
   - Broadcasts presence to user's contacts

4. **Room Subscriptions**
   - User automatically subscribed to:
     - Personal notification room: `user:{userId}`
     - Active chat rooms: `chat:{chatId}`
     - Group rooms (if applicable)

5. **Heartbeat Mechanism**
   - Client sends periodic ping messages
   - Server responds with pong
   - Maintains connection alive
   - Updates last seen timestamp

6. **Disconnection Handling**
   - On disconnect (network loss, client close):
     - Remove from all rooms
     - Update presence to offline (with grace period)
     - Clean up connection metadata
   - Grace period allows reconnection without status flicker

**Key Components:**
- Chat Service (WebSocket server)
- Redis (presence tracking, room management)
- Authentication Service (token validation)

**Connection Metadata:**
```typescript
{
  userId: string
  deviceId: string
  socketId: string
  rooms: string[]  // subscribed rooms
  connectedAt: Date
  lastPing: Date
}
```

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

**Key Components:**
- Chat Service (WebSocket server + message handler)
- Redis (presence, temporary storage)
- Database (message persistence)
- Notification Service (push notifications)

**Data Models:**

```typescript
// Message Object
{
  messageId: string
  chatId: string
  senderId: string
  content: string
  createdAt: Date
  status: 'sent' | 'delivered' | 'read'
  mediaURL?: string
  replyToMessageId?: string
}

// WebSocket Events
emit('send_message', { chatId, content, recipientId })
emit('message_sent', { messageId, status, timestamp })
emit('new_message', { message })
emit('message_read', { messageId })
```

**Delivery Guarantees:**
- At-least-once delivery (messages persisted)
- Idempotency via messageId
- Retry mechanism for failed deliveries
- Offline message queue

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

2. **Server Broadcast**
   - **Chat Service** receives `typing_start`
   - Validates user is in chat
   - Broadcasts to other chat participants:
     - Emit `user_typing` to room: `chat:{chatId}`
     - Excludes sender
     - Payload:
       - `userId`: Who's typing
       - `chatId`: Which conversation

3. **Client UI Update**
   - Recipients receive `user_typing` event
   - Display typing indicator:
     - "John is typing..."
     - Animated dots
   - Shows in chat interface


5. **Indicator Removal**
   - no typing activity beat -> user is not typing dont need to send typing stop, reciving clients will handle it if no typing start received in timeout period



**Event Flow:**
```typescript
// Client → Server
emit('typing_start', { chatId, userId })
emit('typing_stop', { chatId, userId })

// Server → Clients (broadcast)
emit('user_typing', { userId, chatId })
emit('user_stopped_typing', { userId, chatId })
```



---

### Is Online Flow

![Is Online Flow](./is-Online.flow.png)

**Overview:**
Tracks and broadcasts user online/offline status to contacts in real-time.

**Data Flow Steps:**

1. **User Comes Online**
   - User establishes WebSocket connection (see WebSocket Connection Flow)
   - **Chat Service** updates presence:
     - Set in Redis:
       - Key: `presence:{userId}`
       - Value: `{ status: 'online', lastSeen: null }`
       - TTL: heartbeat interval + grace period


2. **Client Receives Status**
   - Friends' clients receive `user_online` event
   - Update UI:
     - Green dot/indicator
     - "Online" status label
     - Enable real-time features

3. **Presence Polling** (for non-WebSocket clients)
   - Clients can query:
     - `GET /presence/users?ids=userId1,userId2,...`
   - Returns batch presence status
   - Used for:
     - Initial load
     - Web clients without WS
     - Mobile background state

4. **Heartbeat Maintenance**
   - While connected:
     - Client sends periodic ping (every 30s)
     - Server updates Redis TTL on each ping
     - Keeps `presence:{userId}` alive

5. **Last Seen Tracking**
   - When user goes offline:
     - Store timestamp: `lastSeen`
     - Persisted in Redis (longer TTL)
     - Displayed to contacts: "Last seen 5 minutes ago"







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

1. **Pre-Call Validation**
   - Caller checks recipient's online status
   - Query presence: `GET /presence/user/{recipientId}`
   - Verify recipient is available (online, not in another call)
   - If offline or busy, show appropriate message

2. **Call Initiation Request**
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

3. **Call State Creation**
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

4. **WebRTC Signaling Setup**
   - Chat Service facilitates WebRTC peer connection:
     - Creates ICE candidates
     - Generates SDP (Session Description Protocol) offer
     - Stores signaling data temporarily

5. **Recipient Notification**
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
   
6. **Caller UI Update**
   - Emit `call:ringing` back to caller
   - Update caller's UI:
     - Show "Calling..." screen
     - Display recipient info
     - Start ringing tone
     - Show cancel button

7. **Multi-Device Handling**
   - If recipient has multiple devices online:
     - Send notification to all devices
     - First device to accept wins
     - Cancel other device notifications

8. **Push Notification Fallback**
   - If recipient's app in background:
     - **Notification Service** sends push notification
     - "Incoming call from {username}"
     - High-priority notification (appears on lock screen)
     - Includes action buttons: Accept/Decline

9. **Call Timeout Handling**
   - If no response within timeout (30-60s):
     - Chat Service detects TTL expiration
     - Emit `call:timeout` to caller
     - Emit `call:missed` to recipient
     - Update call state: `status: 'missed'`
     - Persist missed call record

10. **Caller Cancellation**
    - If caller cancels before answer:
      - Client emits `call:cancel`
      - Server broadcasts `call:cancelled` to recipient
      - Clean up call state
      - Remove notifications

**Key Components:**
- Chat Service (WebSocket + WebRTC signaling)
- Redis (call state, temporary signaling data)
- Presence Service (availability check)
- Notification Service (push notifications)
- User Service (user profile data)

**Data Models:**

```typescript
// Call Initiation Event
{
  callId: string
  callerId: string
  recipientId: string
  callType: 'voice' | 'video'
  timestamp: Date
}

// Call State (Redis)
{
  callId: string
  callerId: string
  recipientId: string
  callType: 'voice' | 'video'
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined'
  initiatedAt: Date
  answeredAt?: Date
  endedAt?: Date
  participants: string[]
  webrtcData?: {
    sdpOffer: string
    sdpAnswer?: string
    iceCandidates: any[]
  }
}

// Missed Call Record
{
  callId: string
  callerId: string
  recipientId: string
  callType: 'voice' | 'video'
  initiatedAt: Date
  status: 'missed' | 'declined' | 'cancelled'
}
```

**WebSocket Events:**

```typescript
// Caller → Server
emit('call:initiate', { callId, recipientId, callType })
emit('call:cancel', { callId })

// Server → Caller
emit('call:ringing', { callId, status: 'ringing' })
emit('call:timeout', { callId })
emit('call:accepted', { callId, sdpAnswer })
emit('call:declined', { callId, reason })

// Server → Recipient
emit('call:incoming', { callId, caller, callType, sdpOffer })
emit('call:cancelled', { callId })
```

**Error Handling:**
- **Recipient Offline**: Return error immediately, don't create call state
- **Recipient Busy**: Check for active call, return "busy" status
- **Network Issues**: Retry signaling, fallback to push notification
- **Invalid User**: Validate both users exist and have permissions

**Security Considerations:**
- Validate caller has permission to call recipient (not blocked)
- Rate limit call initiations (prevent spam calling)
- Encrypt WebRTC signaling data
- Sanitize user input (callType, etc.)

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

