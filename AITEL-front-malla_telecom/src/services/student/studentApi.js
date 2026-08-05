export const StudentApi = {
  // Obtener información académica del estudiante actual
  async getAcademicInfo() {
    const response = await fetch('/api/student/academic-info');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    // Retorna: { courseGrades, currentCourses, currentSemester, studentInfo }
  },

  // Obtener notas del estudiante
  async getGrades() {
    const response = await fetch('/api/student/grades');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Obtener cursos en progreso
  async getCurrentCourses() {
    const response = await fetch('/api/student/current-courses');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async getSemesterHistory() {
    const response = await fetch('/api/student/semester-history');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    /* Backend retorna:
    [
      {
        semester: "2020-1",
        suspended: false,
        courses: [
          {
            id: "c1",
            code: "MAT101",
            name: "Cálculo 1",
            credits: 5,
            grade: 15,
            exception: false,
            isElective: false
          },
          ...
        ]
      },
      ...
    ]
    */
  }

};