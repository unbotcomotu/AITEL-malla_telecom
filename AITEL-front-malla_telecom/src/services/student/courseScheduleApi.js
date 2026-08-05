// services/student/courseScheduleApi.js
export const CourseScheduleApi = {
  async getCourseScheduleInfo(courseId) {
    const response = await fetch(`/api/courses/${courseId}/schedule-info`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    // Retorna: { "2025-1": { schedules: {...} }, "2025-2": {...}, "Todos": {...} }
  }
};