
$(document).ready(function(){

    var userCanvas = document.getElementById('userCanvas');
    var userContext = userCanvas.getContext('2d');
    userCanvas.style.width='100%';
    userCanvas.style.height='100%';
    userCanvas.width  = userCanvas.offsetWidth;
    userCanvas.height = userCanvas.offsetHeight;

    var publicCanvas = document.getElementById('publicCanvas');
    var publicContext = publicCanvas.getContext('2d');
    publicCanvas.style.width='100%';
    publicCanvas.style.height='100%';
    publicCanvas.width  = publicCanvas.offsetWidth;
    publicCanvas.height = publicCanvas.offsetHeight;


    var stompClient = null;
    var x, y;


    function connect() {
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.debug = null;
        stompClient.connect({}, function (frame) {
            setConnected(true);
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/notify', function (message) {
                if(JSON.parse(message.body).content == 'clean')
                    cleanCanvas();
                console.log(message)
            });
            stompClient.subscribe('/topic/flood', function (message) {
                console.log(message)
            });
            stompClient.subscribe('/topic/queue', function (message) {
                drawData(JSON.parse(message.body));
            });
            stompClient.send("/app/init", {}, "init");
        });

        socket.onclose = function() {
            setConnected(false);
        }
    }

    function setConnected(connected) {
        // change color of clean button to show connections state
        if(connected) {
            $('#clean').css('background-color', 'rgba(0, 100, 0, 0.5)');
        } else {
            $('#clean').css('background-color', 'rgba(100, 100, 0, 0.5)');
        }
    }

    var sessions = {};
    function drawData(data) {
        var currentSession = sessions[data.sessionId];
        if(currentSession) {
            if (!data.started) {
                publicContext.beginPath();
                publicContext.moveTo(currentSession.x, currentSession.y);
                publicContext.lineTo(data.x, data.y);
                publicContext.strokeStyle = data.strokeColor;
                publicContext.stroke();
            }
        }
        sessions[data.sessionId] = data;
    }

    function cleanCanvas() {
        userContext.clearRect(0, 0, userCanvas.width, userCanvas.height);
        publicContext.clearRect(0, 0, publicCanvas.width, publicCanvas.height);
    }

    function clean() {
        stompClient.send("/app/clean", {}, "clean");
    }

    $("#clean").click(function() { clean(); });


    // When the user clicks on div, open the popup
    $(".popup").click(function() {
        document.getElementById("myPopup").classList.toggle("show");
    });

    var imgPath = $("#qr-img").attr('src').replace('url_subst', location.href);
    $("#qr-img").attr('src', imgPath);


    var started = false;
    var leftButtonDown = false;
    var startLine = false;
    var userStrokeColor = "#FF0000";

    function moveHandler(ev) {
        //var mousePos = getMousePos(canvas, evt);
        //var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        //console.log(message)
        //ctx.fillRect(mousePos.x,mousePos.y,1,1);
        // The mousemove event handler.
        if (ev.type === 'touchmove'){
            // touchmove has been triggered
            x = ev.touches[0].pageX;
            y = ev.touches[0].pageY;
        } else {
            // Get the mouse position relative to the canvas element.
            if (ev.layerX || ev.layerX == 0) { // Firefox
                x = ev.layerX;
                y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                x = ev.offsetX;
                y = ev.offsetY;
            }
        }

        // The event handler works like a drawing pencil which tracks the mouse
        // movements. We start drawing a path made up of lines.

        if (leftButtonDown) {
            if (!started) {
                userContext.beginPath();
                userContext.moveTo(x, y);
                started = true;
                startLine = true;
            } else {
                userContext.lineTo(x, y);
                userContext.strokeStyle = userStrokeColor;
                userContext.stroke();
                startLine = false;
            }
            stompClient.send("/app/broadcast", {}, JSON.stringify({'x': x, 'y': y, 'started': startLine, 'strokeColor': userStrokeColor}));
        }
        // for chrome mobile it is needed to do
        // https://stackoverflow.com/questions/20412982/javascript-any-workarounds-for-getting-chrome-for-android-to-fire-off-touchmove?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
        if(started)
            ev.preventDefault();
    }

    function mouseDownHandler(e) {
        // Left mouse button was pressed, set flag
        if (e.type === 'touchstart') {
            leftButtonDown = true;
        }
        if (e.which === 1) leftButtonDown = true;
    }

    function mouseUpHandler(e) {
        // Left mouse button was released, clear flag
        if (e.type === 'touchend') {
            leftButtonDown = false;
            started = false;
        }
        if (e.which === 1) {
            leftButtonDown = false;
            started = false;
        }
    }

     // Prevent scrolling when touching the canvas
    document.body.addEventListener("touchstart", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchend", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchmove", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);

    $(document).bind('touchstart mousedown', mouseDownHandler);
    $(document).bind('touchend mouseup', mouseUpHandler);
    $(document).bind('touchmove mousemove', moveHandler);



    $("#spectrum").spectrum({
        color: "#FF0000",
        change: function(tinycolor) {
            userStrokeColor = tinycolor.toHexString();
        }
    });

    connect();

});
