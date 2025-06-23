### Responsibility

-  This service only stores the IDs of the post to construct a feed
-  Ids are postIds are saturated at read time from post read model

-  When a new post is created,
-  that post is added to all the friend's timeline to the curresponding author who made the post
-  at the same time this is written to cache

### cache expirty

-  for cache expity, we have two options

   1. expire post from timelime older than a specific time
   2. evict the old chance based of the threshold size of the cache

-  we have chosen option 2, if the firends of a user are not that much active then the time of that user will have old post
-  without cache these users will give a burden on the DB, wo we chose size based cache

### why not deleting a post from cache, when post in deleted from the system?

-  deleteing a post is tricky
-  when a post is deleted we can easily delete it from the DB
-  but cache invalidation will be hard, sine we need to go to all the timeline of the author's friends and delete it from there. And sometimg the post might not be in the cache, to removing post from all the cache is ineffient
-  Fix: let there be invalid/deleted post in cache, when hydrating postIds remove the empty hydrated post - since delted post will not have read document and read service will return null in such cases. Invaid postIds will be removed from cache when the cache expires

-  do we actually need to store authorId as it can be derived from postID, yes for effiecient unfriending removal of post
-  else we need to goto post service and resolve the authorId. And author can have large amount of post and this query be very huge

### Why not check if the cache is optimal size instead of first query size and populating the cache for first query?

-  edge condition: what if the query.limit is filled by the dynamic caching when post is created
-  then this condition will not execute, and our cache will only have this most recent post,and not the full cache size
-  but its oky, if a user's timeline is filling up fast, it means they are a heavy user and the full cache will be populated with time

## Production changes

-  change the bulk cache updation on first page read to happen in the background than waiting to populate it on first request
-  cron job to evit old cache timeline
