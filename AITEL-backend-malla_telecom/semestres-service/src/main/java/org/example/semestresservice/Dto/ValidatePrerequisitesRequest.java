package org.example.semestresservice.Dto;

import java.util.List;

public class ValidatePrerequisitesRequest {
    private Long courseId;
    private List<Long> previousCourses;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public List<Long> getPreviousCourses() {
        return previousCourses;
    }

    public void setPreviousCourses(List<Long> previousCourses) {
        this.previousCourses = previousCourses;
    }
}
