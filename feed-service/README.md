- This service only stores the IDs of the post to construct a feed 
- Ids are postIds are saturated at read time from post read model

- When a new post is created, 
- that post is added to all the friend's timeline to the curresponding author who made the post
- at the same time this is written to cache

- deleteing a post is tricky
- when a post is deleted we can easily delete it from the DB
- but cache invalidation will be hard, sine we need to go to all the timeline of the author's friends and delete it from there. And sometimg the post might not be in the cache, to removing post from all the cache is ineffient
- Fix: let there be invalid/deleted post in cache, when hydrating postIds remove the empty hydrated post - since delted post will not have read document and read service will return null in such cases. Invaid postIds will be removed from cache when the cache expires

- do we actually need to store authorId as it can be derived from postID, yes for effiecient unfriending removal of post 
- else we need to goto post service and resolve the authorId. And author can have large amount of post and this query be very huge