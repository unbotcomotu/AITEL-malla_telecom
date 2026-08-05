// services/curriculum/curriculumApi.js
export const CurriculumApi = {
  // Obtener toda la malla curricular
  async getCurriculum() {
    const response = await fetch('/api/curriculum');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    // Retorna: { nodes: [...], edges: [...], prerequisiteTypes: {...} }
  },

    // AGREGAR estos nuevos métodos:
  async getPrerequisiteTypes() {
    const response = await fetch('/api/curriculum/prerequisite-types');
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
    // Retorna: { APPROVED: 'approved', MIN_GRADE: 'min_grade', COREQUISITE: 'corequisite' }
  },

  async getCoursePrerequisites(courseId) {
    const response = await fetch(`/api/courses/${courseId}/prerequisites`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
    // Retorna array de edges que apuntan a este curso
  }
};