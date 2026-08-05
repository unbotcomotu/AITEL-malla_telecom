const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }

  // Cursos
  async getCourses() {
    return this.request('/courses');
  }

  async getCourse(courseId) {
    return this.request(`/courses/${courseId}`);
  }

  // Estudiante
  async getStudentGrades(studentId) {
    return this.request(`/students/${studentId}/grades`);
  }

  async updateStudentGrade(studentId, courseId, grade) {
    return this.request(`/students/${studentId}/grades/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify({ grade }),
    });
  }

  // Comentarios
  async getCourseComments(courseId, cycle = 'Todos') {
    return this.request(`/courses/${courseId}/comments?cycle=${cycle}`);
  }

  async addComment(courseId, commentData) {
    return this.request(`/courses/${courseId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async addReply(courseId, commentId, replyData) {
    return this.request(`/courses/${courseId}/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  async likeComment(courseId, commentId) {
    return this.request(`/courses/${courseId}/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  async dislikeComment(courseId, commentId) {
    return this.request(`/courses/${courseId}/comments/${commentId}/dislike`, {
      method: 'POST',
    });
  }

  // Calificaciones de dificultad
  async rateCourse(courseId, cycle, rating) {
    return this.request(`/courses/${courseId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ cycle, rating }),
    });
  }
}

export const apiService = new ApiService();