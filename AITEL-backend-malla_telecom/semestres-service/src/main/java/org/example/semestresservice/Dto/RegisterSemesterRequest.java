package org.example.semestresservice.Dto;

import java.util.List;

public class RegisterSemesterRequest {
    private String semester;
    private Boolean suspended;
    private List<CourseSelection> courses;

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public Boolean getSuspended() {
        return suspended;
    }

    public void setSuspended(Boolean suspended) {
        this.suspended = suspended;
    }

    public List<CourseSelection> getCourses() {
        return courses;
    }

    public void setCourses(List<CourseSelection> courses) {
        this.courses = courses;
    }

    public static class CourseSelection {
        private Long courseId;
        private Long grade;
        private Boolean exception;

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public Long getGrade() {
            return grade;
        }

        public void setGrade(Long grade) {
            this.grade = grade;
        }

        public Boolean getException() {
            return exception;
        }

        public void setException(Boolean exception) {
            this.exception = exception;
        }
    }
}
