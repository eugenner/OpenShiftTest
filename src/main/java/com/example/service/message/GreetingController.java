package com.example.service.message;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;


@Controller
public class GreetingController {

    private static final Logger logger = LoggerFactory.getLogger(GreetingController.class);

    @Autowired
    private ClientMessageRepository repository;

    @Autowired
    private PointRepository pointRepository;

    @Autowired
    private SimpMessagingTemplate template;

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Greeting greeting(ClientMessage clientMessage, Message message) throws Exception {
        logger.info("hello message: " + message);
        // persisting message
        repository.save(clientMessage);
        return new Greeting("Hello, " + clientMessage.getName() + " x=" + clientMessage.getX() + " y=" + clientMessage.getY() + "!");
    }

// it's possible to send data back to client periodically
//    @Scheduled(fixedDelay = 2000)
    public void greeting() throws Exception {
        template.convertAndSend("/topic/flood", new Greeting("Flooding!"));
    }

    @MessageMapping("/broadcast")
    @SendTo("/topic/queue")
    public Point broadcastPoint(Point point, Message message) throws Exception {
        logger.info("broadcast message: " + message);
        // persisting point
        pointRepository.save(point);
        return point;
    }

    @MessageMapping("/init")
    public void broadcastPoints(String command, Message message) throws Exception {
        logger.info("init command: " + command);
        List<Point> points = (List<Point>)pointRepository.findAll(new Sort(Sort.Direction.ASC, "id"));
        points.forEach((point -> {
            template.convertAndSend("/topic/queue", point);
        }));

    }


}
