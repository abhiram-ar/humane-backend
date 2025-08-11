# Chat Service

Purpose: Implement and handle HTTP and websocket traffic for chat related features

## Functional Requirements

-  1-1 messaging
-  isOnline feature for 1-1 messaging
-  read recipts (not per message level, but when was the chat opened as message was marked as read)
-  message persisted acknoledegments (delived to server)

## Tech Stack

-  Node.js + TypeScript
-  Express.js HTTP server framework
-  Sockek.io as realtime communication library (WebSockets)
-  MongoDB with Mongoose as ODM
-  JWT Authentication
-  Kafka based event driven architecture

## API Endpoints

| Method | Endpoint                                | QueryParams                       | Description                                                                                                                                                                                   |
| ------ | --------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/chat/convo/one-to-one`         | `otherUserId`                     | Get one to one conversation details from `userId`'s <br> One `userId` will be taken from authenticated user jwt token.<br> Other `userId` should be provided as `otherUserId` as query params |
| GET    | `/api/v1/chat/convo/one-to-one/message` | `otherUserId` `from?` `limit?=10` | Retive one to one conversion from authenticated user and `otherUser`                                                                                                                          |

## Kafka Events

#### Produces

nill

#### Consumes

nill

## Environment Variables

-  NODE_ENV: 'production' | 'development',
-  SERVER_PORT: default(3000),
-  MONGODB_URI
-  ELASTICSEARCH_PROXY_BASE_URL

### notes

### How conversations get created'

-  for 1-1 conversations, converstion get created when any one of the user sends a message to other user - not need to explicity create a conversation
-  for group converstions, converstion get created upon initial participats added to the group - we need to explicity create a conversation

### Why have converstion-room for 1-1 conversation (currnt implementaion we are writing directly to recipient sockets)

-  yes. for one to one converation we can lookup the recipient socket and directly write into it
-  but we will have to implement the routering logic by ourself and we need to have seperate routing logic for group chat
-  By keeing conversaion room consistant for 1-1 chat and group chat this approch is much more scalable and maintanable

### why not storing read count per message

-  it will be very hard to scale, imaging a group has 100 users and 100 messages, that will be 10K documents just track the read count
-  complex to maintain/read
-  solution:
   -  instead of storing user-read per message, we store the time user last opened a chat in the coversation document
   -  during readtime we compare the new messages that arrived in the converstion, after the user last open time

### Production changes

-  Get the auth token from `handshake.auth.token` rather than from `handshake.query.token` (less secure)
   -  why use `query.token` in the firstplace?
   -  `auth.token` is derived from internal protocol used by socket.io, we cannot set it via postman for testing purpose. So the we wennt with the legacy option to use query parsms to send authentication header
   -  query params is not secure. as it is readily visible in URL

### Why dont we only check if the user has rewarded in last 24 hr from cache and emit `replied.in.24hr.first` event

-  because a user can spam another user in 24 hour interval without getting any reply. and we dont want to give reward for that

## TODO

-  increment the call description expity on read or on a ping mechanism
