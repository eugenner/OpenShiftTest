
$(document).ready(function(){


    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d');

    canvas.style.width='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;


    // WebSocket start

    var stompClient = null;
    var x, y;

    function setConnected(connected) {
        $("#connect").prop("disabled", connected);
        $("#disconnect").prop("disabled", !connected);
        if (connected) {
            $("#conversation").show();
        }
        else {
            $("#conversation").hide();
        }
        $("#greetings").html("");
    }

    function connect() {
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            setConnected(true);
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/greetings', function (message) {
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
    }

    function drawData(data) {
        if (data.started) {
            context.beginPath();
            context.moveTo(data.x, data.y);
        } else {
            context.lineTo(data.x, data.y);
            context.stroke();
        }
    }

    function disconnect() {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        setConnected(false);
        console.log("Disconnected");
    }

    function sendName() {
        stompClient.send("/app/hello", {}, JSON.stringify({'name': $("#name").val(), 'x': x, 'y': y}));
    }

    function showGreeting(message) {
        //$("#greetings").append("<tr><td>" + message + "</td></tr>");
        console.log('message: ' + message)
    }

    $(function () {
        $("form").on('submit', function (e) {
            e.preventDefault();
        });
        $( "#connect" ).click(function() { connect(); });
        $( "#disconnect" ).click(function() { disconnect(); });
        $( "#send" ).click(function() { sendName(); });
    });


    // WebSocket end



    var started = false;


    var leftButtonDown = false;
    $(document).mousedown(function(e){
        // Left mouse button was pressed, set flag
        if(e.which === 1) leftButtonDown = true;
    });
    $(document).mouseup(function(e){
        // Left mouse button was released, clear flag
        if(e.which === 1) {
            leftButtonDown = false;
            started = false;
        }
    });

    var startLine = false;
    canvas.addEventListener('mousemove', function(ev) {
        //var mousePos = getMousePos(canvas, evt);
        //var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        //console.log(message)
        //ctx.fillRect(mousePos.x,mousePos.y,1,1);
        // The mousemove event handler.


        // Get the mouse position relative to the canvas element.
        if (ev.layerX || ev.layerX == 0) { // Firefox
            x = ev.layerX;
            y = ev.layerY;
        } else if (ev.offsetX || ev.offsetX == 0) { // Opera
            x = ev.offsetX;
            y = ev.offsetY;
        }

        // The event handler works like a drawing pencil which tracks the mouse
        // movements. We start drawing a path made up of lines.

        if(leftButtonDown) {
            if (!started) {
                context.beginPath();
                context.moveTo(x, y);
                started = true;
                startLine = true;
            } else {
                context.lineTo(x, y);
                context.stroke();
                startLine = false;
            }
            console.log("x="+x+" y="+y)
            stompClient.send("/app/broadcast", {}, JSON.stringify({'x': x, 'y': y, 'started': startLine}));
        }
    }, false);


    connect();

});
