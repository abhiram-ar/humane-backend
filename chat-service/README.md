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
