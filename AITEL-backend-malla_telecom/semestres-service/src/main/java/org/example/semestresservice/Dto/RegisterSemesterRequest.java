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
        // Secciones que el alumno dice haber llevado (clase, practica, examen).
        // Opcional: si viene null o vacia, la matricula queda "general".
        private List<Long> scheduleIds;

        public Long getCourseId() {
            return courseId;
        }

        public List<Long> getScheduleIds() {
            return scheduleIds;
        }

        public void setScheduleIds(List<Long> scheduleIds) {
            this.scheduleIds = scheduleIds;
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
