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
