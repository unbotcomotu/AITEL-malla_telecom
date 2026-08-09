// services/student/difficultyApi.js
//
// La dificultad es independiente de la calificacion por estrellas: un curso
// puede ser excelente y durisimo a la vez, y se puede opinar de una sin opinar
// de la otra. Por eso vive en su propio endpoint.

const toScheduleId = (scheduleId) => {
  const n = Number(scheduleId);
  return Number.isFinite(n) ? n : null;
};

export const DifficultyApi = {
  async getSummary(courseId, { cycle, scheduleId, lastSemesters } = {}) {
    const params = new URLSearchParams();
    if (cycle) params.set('cycle', cycle);
    const schedule = toScheduleId(scheduleId);
    if (schedule !== null) params.set('schedule', schedule);
    if (lastSemesters) params.set('lastSemesters', lastSemesters);

    const query = params.toString();
    const response = await fetch(`/api/courses/${courseId}/difficulty/summary${query ? `?${query}` : ''}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    // { average, count, level: EASY|MEDIUM|HARD|VERY_HARD|null, levelLabel, myRating }
  },

  async rate(courseId, { cycle, scheduleId, rating }) {
    const response = await fetch(`/api/courses/${courseId}/difficulty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cycle, scheduleId: toScheduleId(scheduleId), rating })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};
