package com.example.service.message;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;


@Controller
public class GreetingController {

    @Autowired
    private ClientMessageRepository repository;

    @Autowired
    private SimpMessagingTemplate template;

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Greeting greeting(ClientMessage message) throws Exception {
        // persisting message
        repository.save(message);

        return new Greeting("Hello, " + message.getName() + " x=" + message.getX() + " y=" + message.getY() + "!");
    }

// it's possible to send data back to client periodically
    @Scheduled(fixedDelay = 2000)
    public void greeting() throws Exception {
        template.convertAndSend("/topic/flood", new Greeting("Flooding!"));
    }


}
