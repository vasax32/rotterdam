package com.rotterdam.dto;

/**
 * Created by vasax32 on 21.01.15.
 */
public class UserDto {
    public String Name;
    public String LastName;
    public String email;
    public String pass;
    public String passconfirm;
    public String regNum;

    public UserDto(String name, String lastName, String regNum) {
        this.Name = name;
        this.LastName = lastName;
        this.regNum = regNum;
    }

    public UserDto() {
    }
}
