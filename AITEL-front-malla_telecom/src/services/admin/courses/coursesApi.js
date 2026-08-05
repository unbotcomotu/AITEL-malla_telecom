// services/admin/courses/coursesApi.js
export const CoursesApi = {
  async getCoursesBySubcategory(subcategoryId) {
    const response = await fetch(`/api/subcategories/${subcategoryId}/courses`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async createCourse(subcategoryId, courseData) {
    const response = await fetch(`/api/subcategories/${subcategoryId}/courses`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(courseData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async updateCourse(courseId, courseData) {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(courseData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async deleteCourse(courseId) {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return true;
  },

  async freezeCourse(courseId) {
    return this.updateCourse(courseId, { isFrozen: true });
  },

  async unfreezeCourse(courseId) {
    return this.updateCourse(courseId, { isFrozen: false });
  },

  async toggleCourseVisibility(courseId) {
    const response = await fetch(`/api/courses/${courseId}/toggle-visibility`, {
      method: 'PATCH'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Para obtener horarios (solo lectura)
  async getCourseSchedules(courseId) {
    const response = await fetch(`/api/courses/${courseId}/schedules`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Para obtener lista de cursos para prerrequisitos
  async getAllCoursesForPrerequisites() {
    const response = await fetch('/api/courses/prerequisites');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};