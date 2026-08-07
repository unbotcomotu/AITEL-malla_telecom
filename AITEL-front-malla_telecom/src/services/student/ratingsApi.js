// El selector de horario del front usa 'general' como valor por defecto
// (no un id real). El backend espera un Long o directamente nada.
const toScheduleId = (scheduleId) => {
  const n = Number(scheduleId);
  return Number.isFinite(n) ? n : null;
};

export const RatingsApi = {
  async rateCourse(courseId, cycle, scheduleId, rating) {
    const response = await fetch(`/api/courses/${courseId}/ratings`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ cycle, scheduleId: toScheduleId(scheduleId), rating })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    // Retorna: { average, count }
  },

  async getSummary(courseId, cycle) {
    const response = await fetch(`/api/courses/${courseId}/ratings/summary?cycle=${encodeURIComponent(cycle)}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    // Retorna: { average, count }
  }
};