package org.example.semestresservice.Service;

import org.example.semestresservice.Dto.AcademicInfoResponse;
import org.example.semestresservice.Dto.CurrentCourseResponse;
import org.example.semestresservice.Dto.RegisterSemesterRequest;
import org.example.semestresservice.Dto.SemesterHistoryEntry;
import org.example.semestresservice.Dto.ValidatePrerequisitesRequest;
import org.example.semestresservice.Dto.ValidationResponse;

import java.util.List;
import java.util.Map;

public interface StudentService {

    Map<Long, Long> getGrades(Long userId);

    List<CurrentCourseResponse> getCurrentCourses(Long userId);

    AcademicInfoResponse getAcademicInfo(Long userId);

    List<SemesterHistoryEntry> getSemesterHistory(Long userId);

    Map<String, Object> getAvailableCoursesByCycle(Long cycle);

    Map<String, Object> getAvailableCoursesForSemester(Long userId, Long cycle);

    ValidationResponse validatePrerequisites(Long userId, ValidatePrerequisitesRequest request);

    SemesterHistoryEntry registerSemester(Long userId, RegisterSemesterRequest request);

    void completeRegistration(Long userId);

    void resetAcademicHistory(Long userId);
}
