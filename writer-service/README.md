# Writer Service

Purpose: Manages post, comments, hashtag, and likes.

## Tech Stack

-  Node.js + TypeScript
-  Express.js HTTP server framework
-  MongoDB replica Set
-  JWT Authentication
-  Kafka based event driven architecture

## API Endpoints

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/api/v1/signup` | User registration       |
| POST   | `/api/v1/login`  | User login              |
| GET    | `/api/v1/me`     | Fetch current user info |

## Kafka Events

#### Produces

-  `post.created`
-  `post.deleted`
-  `comment.created`
-  `comment.deleted`
-  `commnet.like.requested`
-  `comment.liked`
-  `comment.unlike.requested`
-  `comment.unliked`

#### Consumes

-  `comment.liked`
-  `comment.unliked`

## Environment Variables

-  NODE_ENV ("production" | "development")
-  SERVER_PORT (default = 3000)
-  ACCESS_TOKEN_SECRET
-  KAFKA_CLIENT_ID
-  KAFKA_BROKER_URI
-  MONGODB_URI
-  AWS_ACCESS_KEY
-  AWS_SECRET_KEY
-  AWS_REGION
-  AWS_S3_BUCKET_NAME
-  AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME

### notes

-  When Bulk inserting likes. Mongoose will not throw error if we add like to a invalid commentId.
   At the same time invalid comments will not be inserted to mongoDB
-  Idempotency key for commnet like = commentId + authorId

##### Why cant we combine all the comumers when comments are liked

-  We need to update the like count as fast as possible.
-  Checking the user should recive humane point, will take some time, so it is processed async
-  For high-throughput systems transactions are expensive so we are not combining all these ops into a transaction
-  So I Decided to have two seperate comsumer to work on comment.created event

#### Why not combining commnet liked/unliked event in unified consumer

-  Comment liked will have very large amount of events compared to unliked
-  There is seperate flow for liked and unliked events
-  Its better to have Single responsibility and make code or maintainalble
