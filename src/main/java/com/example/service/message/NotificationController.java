package com.example.service.message;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;


@Controller
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private PointRepository pointRepository;

    @Autowired
    private SimpMessagingTemplate template;

    // it's possible to send data back to client periodically
    //@Scheduled(fixedDelay = 2000)
    public void greeting() throws Exception {
        template.convertAndSend("/topic/flood", new Notification("Flooding!"));
    }

    @MessageMapping("/broadcast")
    @SendTo("/topic/queue")
    public Point broadcastPoint(Point point, Message message, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        logger.info("broadcast message: " + message);
        String sessionId = headerAccessor.getSessionAttributes().get("sessionId").toString();
        logger.info("sessionId: " + sessionId);
        // persisting point with sessionId
        point.setSessionId(sessionId);
        pointRepository.save(point);
        return point;
    }

    @MessageMapping("/init")
    public void broadcastPoints(String command, Message message) throws Exception {
        logger.info("init command: " + command);
        List<Point> points = (List<Point>) pointRepository.findAll(new Sort(Sort.Direction.ASC, "sessionId").and(new Sort(Sort.Direction.ASC, "id")));
        points.forEach((point -> {
            template.convertAndSend("/topic/queue", point);
        }));
    }

    @MessageMapping("/clean")
    @SendTo("/topic/notify")
    public Notification cleanData(String command) throws Exception {
        pointRepository.deleteAll();
        return new Notification("clean");
    }
}
