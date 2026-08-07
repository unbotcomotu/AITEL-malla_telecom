package org.example.semestresservice.Dto;

import java.util.List;

public class HorarioResponse {
    private Long id;
    private Long courseId;
    private String cycle;
    private String schedule;
    private List<ProfesorResumen> professors;
    private int studentsCount;

    public HorarioResponse(Long id, Long courseId, String cycle, String schedule, List<ProfesorResumen> professors, int studentsCount) {
        this.id = id;
        this.courseId = courseId;
        this.cycle = cycle;
        this.schedule = schedule;
        this.professors = professors;
        this.studentsCount = studentsCount;
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCycle() {
        return cycle;
    }

    public String getSchedule() {
        return schedule;
    }

    public List<ProfesorResumen> getProfessors() {
        return professors;
    }

    public int getStudentsCount() {
        return studentsCount;
    }
}
