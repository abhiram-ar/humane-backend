# Reward Service

Purpose: Issue and Store reward user earned

## Tech Stack

-  Node.js + TypeScript
-  Express.js HTTP server framework
-  Postgres with Prisma as ORM
-  JWT Authentication
-  Kafka based event driven architecture

## API Endpoints

| Method | Endpoint               | Description                |
| ------ | ---------------------- | -------------------------- |
| GET    | `/api/v1/reward/total` | total score earned by user |

## Kafka Events

#### Produces

-  `user.rewarded`

#### Consumes

-  `comment.liked.by.post.author`

## Environment Variables

-  NODE_ENV: `production` | `development`
-  SERVER_PORT: default `3000`
-  POSTGRES_URI
-  USER_SERVICE_BASE_URL

### notes

#### why cant we writer service dirtly interact with the elastic-serchproxy and update the Materistic view of user?

-  `comment.liked.by.post.Author` will be emmited in all the cases where the author of the post liked the commnet, even if both the parties are friends are not
-  Its the responsibility of reward serivce to filter these events and issue rewared only if both parties are friends
