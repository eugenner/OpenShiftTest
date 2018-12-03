package com.example.service.Probe;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/health")
public class ReadinessProbe {
    private final Logger LOGGER= LoggerFactory.getLogger(ReadinessProbe.class);

    @GET
    public String readinessprobe(){
        LOGGER.debug("Calling Readinessprobe");
        return "Application Ready";
    }
}