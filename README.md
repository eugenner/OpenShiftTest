<p align=center>White Board for graphity fun</p>

    1. Information of user's mouse movements is collected on a server (in memory database).
    2. Client application use SockJS (WebSocket).
    2.1 Client connects to the server, subscribes on queue of messages and sends "init" message for the first time
        to get all server data accumulated in a database before.
    2.2 There are two canwases on the white board page: userCanvas for user drawings and publicCanvas to paint everything
        that comes from server queue. Canvases placed one above other.
    2.3 Clicking on the Clean button sends command to server for clearing all database data
        and broadcasting that command to all connected users to clear their canvases too.
    2.4 Clicking on the left upper label opens a QR code with URL of the current page for sharing.
    3. Server application created under springframework.boot
    3.1 When user data arrives to the server it is broadcasted to all users and stored to
        the database with SessionId per User to restore right sequence of strokes
        (to support simultanious painting of many users).
