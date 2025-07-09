### Why have converstion-room for 1-1 conversation (currnt implementaion we are writing dirtly to recipient sockets)

-  yes. for one to one converation we can lookup the recipient socket and directly write into it
-  but we will have to implement the routering logic by ourself and we need to have seperate routing logic for group chat
-  By keeing conversaion room consistant for 1-1 chat and group chat this approch is much more scalable and maintanable

### Production changes

-  Get the auth token from `handshake.auth.token` rather than from `handshake.query.token` (less secure)
   -  why use `query.token` in the firstplace?
   -  `auth.token` is derived from internal protocol used by socket.io, we cannot set it via postman for testing purpose. So the we wennt with the legacy option to use query parsms to send authentication header
   -  query params is not secure. as it is readily visible in URL
