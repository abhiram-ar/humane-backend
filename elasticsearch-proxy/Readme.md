### How post counts are updated

-  Since we are using elastic search as our read model and updaing ES document frequecly for every commnet of a post will cause internal version conflits in ES and reduce ES perfomance.
-  Instead of frequent updates we will agrreate the comment.created events and update the ES after a specific interval or when the appropriate batch size is reached.
-  Once appropriate size is reached we will send a ES bulk update request and clear the aggregator Buffer

##### ISSSUEs

-  what if another event comes while we are flushing,
-  This event will be added to the aggregateBuffer. But may not be part of the bulk update. As the diff is already calclated. And After the bulk update this event will be lost as buffer is cleard

fix:

-  Implement a mutex lock while flusing the aggreate result to ES.
-  Or have 2 buffers one for collecting aggreteate and one for flushing, Rotate the buffer while flushing (our implementation)

##### Post comment list response

-  we will be fetching post metadata from writer serviec
-  these metadata includes likecount, hasUserLiked, hasPostAutherliked
-  if in any case the post service is not available or there is an error, there commet details reponse will work fine, but there wont be comment metadta in the response
-  This make sure the commnet list feature works fine, even if the writer service have a problem
-  impNote: if the comment is liked by the postAuthor, we are not providing the postAuthor base details, frontend is suppose to fetch the post author details as FFB
