package com.example.service.message;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;



@Controller
public class GreetingController {

    private ClientMessageRepository repository;

    @Autowired
    public GreetingController(ClientMessageRepository repository) {
        this.repository = repository;
    }

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Greeting greeting(ClientMessage message) throws Exception {
        // persisting message

        repository.save(message);


        return new Greeting("Hello, " + message.getName() + " x=" + message.getX() + " y=" + message.getY() + "!");
    }

}
