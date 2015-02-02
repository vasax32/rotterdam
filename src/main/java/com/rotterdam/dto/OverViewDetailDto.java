package com.rotterdam.dto;

import com.rotterdam.tools.json.serializer.JsonDoubleTimeSerializer;
import org.codehaus.jackson.map.annotate.JsonSerialize;

/**
 * Created by root on 01.02.15.
 */
public class OverViewDetailDto {
    @JsonSerialize(using = JsonDoubleTimeSerializer.class)
    public Double total;
    @JsonSerialize(using = JsonDoubleTimeSerializer.class)
    public Double total130;
    @JsonSerialize(using = JsonDoubleTimeSerializer.class)
    public Double total150;
    @JsonSerialize(using = JsonDoubleTimeSerializer.class)
    public Double total200;
    public double overTime;
}