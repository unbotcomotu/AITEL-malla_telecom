package org.example.semestresservice.Service;

import org.example.semestresservice.Dto.HorarioResponse;
import org.example.semestresservice.Dto.ScheduleRequest;

import java.util.List;
import java.util.Map;

public interface HorarioService {

    List<HorarioResponse> getSchedulesByCourse(Long courseId);

    Map<String, Object> getScheduleInfo(Long courseId);

    void createCycle(Long courseId, String cycle);

    void deleteCycle(Long courseId, String cycle);

    HorarioResponse createSchedule(Long courseId, String cycle, ScheduleRequest request);

    HorarioResponse updateSchedule(Long courseId, String cycle, Long scheduleId, ScheduleRequest request);

    void deleteSchedule(Long scheduleId);

    List<HorarioResponse> bulkSaveSchedules(Long courseId, String cycle, List<ScheduleRequest> requests);
}
