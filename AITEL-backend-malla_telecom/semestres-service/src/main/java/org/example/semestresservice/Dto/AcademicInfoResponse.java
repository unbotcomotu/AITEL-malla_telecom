package org.example.semestresservice.Dto;

import org.example.semestresservice.Model.Usuario;

import java.util.List;
import java.util.Map;

public class AcademicInfoResponse {
    private Map<Long, Long> courseGrades;
    private List<CurrentCourseResponse> currentCourses;
    private String currentSemester;
    private Usuario studentInfo;

    public AcademicInfoResponse(Map<Long, Long> courseGrades, List<CurrentCourseResponse> currentCourses,
                                 String currentSemester, Usuario studentInfo) {
        this.courseGrades = courseGrades;
        this.currentCourses = currentCourses;
        this.currentSemester = currentSemester;
        this.studentInfo = studentInfo;
    }

    public Map<Long, Long> getCourseGrades() {
        return courseGrades;
    }

    public List<CurrentCourseResponse> getCurrentCourses() {
        return currentCourses;
    }

    public String getCurrentSemester() {
        return currentSemester;
    }

    public Usuario getStudentInfo() {
        return studentInfo;
    }
}
