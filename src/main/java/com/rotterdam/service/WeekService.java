package com.rotterdam.service;

import com.rotterdam.dto.DayDto;
import com.rotterdam.dto.TotalTimeDto;
import com.rotterdam.dto.WeekDto;
import com.rotterdam.dto.WorkHourDto;
import com.rotterdam.model.dao.DayDao;
import com.rotterdam.model.dao.PeriodDao;
import com.rotterdam.model.dao.WeekDao;
import com.rotterdam.model.dao.WorkHoursDao;
import com.rotterdam.model.entity.*;
import com.rotterdam.tools.DateTools;
import org.springframework.context.annotation.Scope;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Created by vasax32 on 20.01.15.
 */
@Named
@Scope("singleton")
public class WeekService {
    @Inject
    private WeekDao weekDao;

    @Inject
    private DayDao dayDao;

    @Inject
    private WorkHoursDao workHoursDao;

    @Inject
    private PeriodDao periodDao;

    @Inject
    private TimeForService timeForService;

    @Transactional
    public TotalTimeDto save(WeekDto weekDto, long userId){
        TotalTimeDto totalTime = null;
        //we need to find corresponding week
        Week week = weekDao.selectByStartDateAndUser(weekDto.days.get("Monday").date, userId);
        if (week != null) {
            //we need to determine what was changed or we can override
            for(DayDto dayDto :weekDto.days.values() ){
                Day day = determineDayByDate(week.getDays(), dayDto.date);
                if(day == null){
                    //we need to create new day entry
                    day = new Day(dayDto.date, week);
                    dayDao.insert(day);

                } else{
                    //day is existing
                }

                //auto-rest enabled
                weekDto.checkRestTime();

                //we need to sort to ensure order
                if(dayDto.workHours != null)
                    Collections.sort(dayDto.workHours, WorkHourDto.workHourDtoComparatorByStartWorkingTime);
                if(day.getWorkHours() != null)
                Collections.sort(day.getWorkHours(), WorkHour.workHourComparatorByStartWorkingTime);

                if(WorkHourDto.isDayChanged(dayDto.workHours, day.getWorkHours())){
                    //day changed, we need to override all workHours
                    //first remove from db
                    if(day.getWorkHours() != null)
                        for(WorkHour workHour : day.getWorkHours())
                            workHoursDao.remove(workHour);
                    //now insert new changed workHours
                    List<WorkHour> workHours = WorkHourDto.convertDayToWorkHour(dayDto.workHours, day);
                    for (WorkHour workHour : workHours)
                        workHoursDao.insert(workHour);
                    //save day to db
                    day.setWorkHours(workHours);
                    dayDao.update(day);
                } else{
                    //nothing changed
                }

            }
            //we need to calculate totalTime
            totalTime = calculateTotalTime(weekDto, userId);
        } else {
            //it's possible if user not save setting tab
            return null;
        }
        return totalTime;
    }

    public Day determineDayByDate(List<Day> days, Date date){
        for (Day day : days)
            if(day.getDate().equals(date))
                return day;
        return null;
    }

    @Transactional
    public TotalTimeDto calculateTotalTime(WeekDto weekDto, long userId){
        TotalTimeDto totalTimeDto = new TotalTimeDto();
        double totalTime = 0;
        for (DayDto dayDto : weekDto.days.values()) {
            if(dayDto.workHours != null && dayDto.workHours.size() != 0) {
                RideType rideType = dayDto.workHours.get(0).rideType;
                if(rideType.equals(RideType.Werkdag)) {
                    for (WorkHourDto workHourDto : dayDto.workHours) {
                        double startTime = DateTools.getDoubleFormatHours(workHourDto.startWorkingTime);
                        double endTime = DateTools.getDoubleFormatHours(workHourDto.endWorkingTime);
                        double rest = ((double) workHourDto.restTime) / (double) 60;

                        Double totalTimeDay = (endTime - startTime - rest);

                        int h = totalTimeDay.intValue();

                        int m = (int) ((totalTimeDay - h) * 60);

                        totalTimeDto.days.put(DateTools.getWeekDayTitle(dayDto.date), h + "h " + m + "m");

                        String weekDayTitle = DateTools.getWeekDayTitle(dayDto.date);
                        if (!weekDayTitle.equals("Saturday") && !weekDayTitle.equals("Sunday")) {
                            totalTime += totalTimeDay;
                        }
                    }
                } else {
                    if(timeForService.isNormalCalculationNotForWorkDay(rideType)){
                        Date promisedTimeByDate = timeForService.getPromisedTimeByDate(dayDto.date, weekDto, userId);
                        totalTime += DateTools.getDoubleFormatHours(promisedTimeByDate);
                    }
                }
            }
        }
        totalTimeDto.totalTime = totalTime;
        //now we need to calculate over-time
        if(weekDto.days.size() != 0) {
            Week week = weekDao.selectByDateBetweenAndUser(weekDto.days.get("Monday").date, userId);
            if (week != null) {
                double promisedWeekTime = timeForService.getPromisedWeekTime(week);
                double overTime = 0;
                if (totalTime > promisedWeekTime)
                    overTime = totalTime - promisedWeekTime;
                totalTimeDto.overTime = overTime;
            }
        }
        return totalTimeDto;
    }

    @Transactional
    public WeekDto getWeekByStartDateAndUserId(Date startDate, long userId){
        Week week = weekDao.selectByStartDateAndUser(startDate, userId);
        if(week != null)
            return WeekDto.convertDaysToWorkHourDto(week.getDays());
        else return new WeekDto();
    }


    @Transactional
    public boolean isActive(Date weekDate, long userId){
        Period weekPeriod = periodDao.selectByDateBetweenAndUser(weekDate, userId);
        Period currentPeriod = periodDao.selectByDateBetweenAndUser(new Date(), userId);
        if(weekPeriod == null || currentPeriod == null) return false;
        return weekPeriod.getStartDate().equals(currentPeriod.getStartDate());


    }
}
