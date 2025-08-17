# ElasticSearch Proxy service

## Responsibility

Acts as a proxy layer between services and Elasticsearch.

Why?

-  Prevents data corruption by providing a unified interface for all services interacting with Elasticsearch
-  Ensures consistent write operations when multiple services need to update data
-  Batches updates to prevent overwhelming Elasticsearch and improve overall system performance
-  Creates materialized views to optimize query performance by eliminating runtime aggregations

## Tech Stack

-  Node.js + TypeScript
-  Express.js HTTP server framework
-  ElasticSearch Node.js client to manage ES
-  Kafka based event driven architecture

## API Endpoints

| Endpoint                                           | Method | Description                                                                                                                        | Authentication | Parameters                                                             |
| -------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------- |
| **Internal APIs**                                  |
| `/api/v1/query/internal/user`                      | GET    | Search for users (internal use)                                                                                                    | No             | **Query**: `searchQuery`, `page?=1`, `limit?=10`                       |
| `/api/v1/query/internal/post`                      | GET    | Author + attachment URL hydrated post details                                                                                      | No             | **Query**: `postId`: (comma separated) , `noAuthorHydration?`: integer |
| `/api/v1/query/internal/comment`                   | GET    | Get comment data from IDs                                                                                                          | No             | **Query**: `commentId` (comma separated)                               |
| **Public User APIs**                               |
| `/api/v1/query/public/user`                        | GET    | Search for users                                                                                                                   | No             | **Query**: `searchQuery`, `searchAfter?=null`, `limit?=10`             |
| `/api/v1/query/public/user/basic`                  | GET    | Get basic user details from IDs                                                                                                    | No             | **Query**: `userIds` (comma separated)                                 |
| `/api/v1/query/public/user/:userId`                | GET    | Get user profile                                                                                                                   | No             |                                                                        |
| `/api/v1/query/public/user/:userId/humaneScore`    | GET    | Get humane score for a user                                                                                                        | No             |                                                                        |
| **Public Post APIs**                               |
| **Public Post APIs**                               |
| `/api/v1/query/public/post/timeline/:targetUserId` | GET    | Get user timeline                                                                                                                  | Yes            | **Query**: `from?=null`, `limit?=10`                                   |
| `/api/v1/query/public/post/:postId`                | GET    | Get full post details <br> If the post is flagged by moderation, only the post author can view it; others will receive a 404 error | Optional       | **Query**: `from?=null`, `limit?=10`                                   |
| `/api/v1/query/public/post/:postId/comments`       | GET    | Get comments for a specific post                                                                                                   | Optional       | **Query**: `from?=null`, `limit?=10`                                   |
| `/api/v1/query/post/hashtag/:hashtag`              | GET    | Query posts by hashtag                                                                                                             | No             | **Query**: `from?=null`, `limit?=10`                                   |

searchQuery,
searchAfter: searchAfter ? [parseInt(searchAfter as string)] : null,
limit:

## Kafka Events

### Produces

> This service does not produce and events

### Consumes

**User Events**

-  `user.created`: Triggered when a new user is created
-  `user.updated`: Triggered when user details are updated
-  `user.avatar.updated`: Triggered when a user's avatar is changed
-  `user.coverphoto.updated`: Triggered when a user's cover photo is changed
-  `user.isBlocked.updated`: Triggered when a user's block status changes

**Post Events**

-  `post.created`: Triggered when a new post is created
-  `post.updated`: Triggered when post content is updated
-  `post.deleted`: Triggered when a post is removed

**Comment Events**

-  `comment.created`: Triggered when a new comment is added
-  `comment.deleted`: Triggered when a comment is removed

## Environment Variables

| Variable Name                             | Description                               | Default Value |
| ----------------------------------------- | ----------------------------------------- | ------------- |
| `NODE_ENV`                                | Environment mode (production/development) | -             |
| `SERVER_PORT`                             | Port on which the service runs            | `3000`        |
| `ACCESS_TOKEN_SECRET`                     | Secret for signing access tokens          | -             |
| `KAFKA_CLIENT_ID`                         | Client ID for Kafka connection            | -             |
| `KAFKA_BROKER_URI`                        | URI for Kafka broker                      | -             |
| `ELASTICSEARCH_URI`                       | URI for Elasticsearch connection          | -             |
| `AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME` | CloudFront distribution domain            | -             |
| `USER_SERVICE_BASE_URL`                   | Base URL for user service                 | -             |

## NOTES

### How post counts are updated

-  Since we are using elastic search as our read model and updaing ES document frequecly for every commnet of a post will cause internal version conflits in ES and reduce ES perfomance.
-  Instead of frequent updates we will agrreate the comment.created events and update the ES after a specific interval or when the appropriate batch size is reached.
-  Once appropriate size is reached we will send a ES bulk update request and clear the aggregator Buffer

### ISSSUEs - fixed

-  what if another event comes while we are flushing,
-  This event will be added to the aggregateBuffer. But may not be part of the bulk update. As the diff is already calclated. And After the bulk update this event will be lost as buffer is cleard

#### Fix:

-  Implement a mutex lock while flusing the aggreate result to ES.
-  Or have 2 buffers one for collecting aggreteate and one for flushing, Rotate the buffer while flushing (our implementation)

### Post comment list response

-  we will be fetching post metadata from writer serviec
-  these metadata includes likecount, hasUserLiked, hasPostAutherliked
-  if in any case the post service is not available or there is an error, there commet details reponse will work fine, but there wont be comment metadta in the response
-  This make sure the commnet list feature works fine, even if the writer service have a problem
-  impNote: if the comment is liked by the postAuthor, we are not providing the postAuthor base details, frontend is suppose to fetch the post author details as FFB
