package org.example.semestresservice.Dto;

import java.util.List;

public class ScheduleRequest {
    private String schedule;
    private List<Long> professorIds;

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public List<Long> getProfessorIds() {
        return professorIds;
    }

    public void setProfessorIds(List<Long> professorIds) {
        this.professorIds = professorIds;
    }
}
