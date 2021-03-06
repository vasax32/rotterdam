package com.rotterdam.controllers;

import com.rotterdam.dto.SettingsDto;
import com.rotterdam.model.entity.User;
import com.rotterdam.service.SettingsService;
import com.rotterdam.tools.json.JsonCommands;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.text.ParseException;
import java.util.Date;

/**
 * @author vasax32
 */
@Path("/settings")
@PermitAll
@Named
public class SettingsController {

    @Inject
    private SettingsService settingsService;

    @Inject
    private JsonCommands jsonCommands;

    @RolesAllowed({ "Driver" })
    @POST
    @Consumes({ MediaType.APPLICATION_JSON })
    public Response saveSettings(@Context HttpServletRequest hsr, SettingsDto settingsDto) throws ParseException, IOException {
        //System.out.println(settingsDto);
        User user = jsonCommands.getUserFromRequest(hsr);
        if(user != null) {
            settingsService.save(settingsDto, user.getId());
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
    }

    @RolesAllowed({ "Driver" })
    @GET
    @Consumes({ MediaType.APPLICATION_JSON })
    public Response getSettings(@Context HttpServletRequest hsr, @QueryParam("date")String data) throws ParseException, IOException {

        User user = jsonCommands.getUserFromRequest(hsr);

        if(user != null) {
            Date date = jsonCommands.getDateFromJson(data);

            SettingsDto settingsDto = settingsService.getSettings(date, user.getId());

            if(settingsDto.promisedHours == null || settingsDto.promisedHours.size() == 0)
                settingsDto.promisedHours = settingsService.generateFakeHours();

            return Response.ok(settingsDto).build();
        } else {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
    }
}
