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
