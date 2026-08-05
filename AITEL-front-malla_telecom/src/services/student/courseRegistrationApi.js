// services/student/courseRegistrationApi.js
export const CourseRegistrationApi = {
  // Obtener cursos disponibles por ciclo
  async getAvailableCoursesByCycle(cycle) {
    const response = await fetch(`/api/courses/available?cycle=${cycle}`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
    // Retorna: { obligatory: [...], elective: {...} }
  },

  // Guardar registro de un semestre completo
  async registerSemester(semester, semesterData) {
    const response = await fetch('/api/student/semesters', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ semester, ...semesterData })
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
  },

  // Obtener semestres ya registrados
  async getRegisteredSemesters() {
    const response = await fetch('/api/student/semesters');
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
  },

  // Validar prerrequisitos antes de guardar
  async validatePrerequisites(courseId, previousCourses) {
    const response = await fetch('/api/student/validate-prerequisites', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ courseId, previousCourses })
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
    // Retorna: { valid: boolean, errors: [...] }
  },

  // Finalizar registro completo
  async completeRegistration() {
    const response = await fetch('/api/student/complete-registration', {
      method: 'POST'
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
  },

  async getAvailableCoursesForSemester(semester, previousSemesters) {
    const response = await fetch('/api/student/available-courses', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ semester, previousSemesters })
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
    /* Backend retorna:
    {
      cycle: 2,
      obligatory: [...],
      electiveSubcategories: [
        {
          id: 'elec-hum-1',
          name: 'Electivo de Humanidades 1',
          requiredCourses: 1,
          courses: [...]
        },
        {
          id: 'elec-teo-1',
          name: 'Electivo de Teología 1',
          requiredCourses: 1,
          courses: [...]
        }
      ]
    }
    */
  }
};