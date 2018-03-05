package com.example.service.message;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Component
public class WebSocketEventListener implements ApplicationListener<SessionSubscribeEvent> {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    @Autowired
    private SimpMessagingTemplate template;

    @Override
    public void onApplicationEvent(SessionSubscribeEvent event) {
        template.convertAndSend("/topic/greetings", new Greeting("Hello1"));
        template.convertAndSend("/topic/greetings", new Greeting("Hello2"));
    }

}