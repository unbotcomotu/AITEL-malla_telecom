package org.example.semestresservice.Dto;

import java.util.List;

public class SemesterHistoryEntry {
    private String semester;
    private boolean suspended;
    private List<CourseHistoryEntry> courses;

    public SemesterHistoryEntry(String semester, boolean suspended, List<CourseHistoryEntry> courses) {
        this.semester = semester;
        this.suspended = suspended;
        this.courses = courses;
    }

    public String getSemester() {
        return semester;
    }

    public boolean isSuspended() {
        return suspended;
    }

    public List<CourseHistoryEntry> getCourses() {
        return courses;
    }
}
