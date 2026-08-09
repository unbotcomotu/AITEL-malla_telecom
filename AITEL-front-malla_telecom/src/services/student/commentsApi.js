// services/student/commentsApi.js

// El selector de horario del front usa 'general' como valor por defecto
// (no un id real). El backend espera un Long o directamente nada.
const toScheduleId = (scheduleId) => {
  const n = Number(scheduleId);
  return Number.isFinite(n) ? n : null;
};

export const CommentsApi = {
  // Obtener comentarios por curso, ciclo y horario.
  // lastSemesters acota a los N semestres mas recientes; el backend lo ignora
  // si ya se pidio un ciclo concreto.
  async getComments(courseId, cycle, scheduleId, lastSemesters) {
    const schedule = toScheduleId(scheduleId);
    const params = new URLSearchParams({ cycle });
    if (schedule !== null) params.set('schedule', schedule);
    if (lastSemesters) params.set('lastSemesters', lastSemesters);

    const response = await fetch(`/api/courses/${courseId}/comments?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Crear comentario
  async createComment(courseId, cycle, scheduleId, commentData) {
    const response = await fetch(`/api/courses/${courseId}/comments`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ cycle, scheduleId: toScheduleId(scheduleId), ...commentData })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Crear respuesta
  async createReply(courseId, commentId, replyData) {
    const response = await fetch(`/api/courses/${courseId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(replyData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Like/Dislike
  async toggleLike(courseId, commentId, replyId = null) {
    const url = replyId 
      ? `/api/courses/${courseId}/comments/${commentId}/replies/${replyId}/like`
      : `/api/courses/${courseId}/comments/${commentId}/like`;
    
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async toggleDislike(courseId, commentId, replyId = null) {
    const url = replyId 
      ? `/api/courses/${courseId}/comments/${commentId}/replies/${replyId}/dislike`
      : `/api/courses/${courseId}/comments/${commentId}/dislike`;
    
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Reportar
  async reportComment(courseId, commentId, replyId = null, reason) {
    const url = replyId 
      ? `/api/courses/${courseId}/comments/${commentId}/replies/${replyId}/report`
      : `/api/courses/${courseId}/comments/${commentId}/report`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ reason })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};