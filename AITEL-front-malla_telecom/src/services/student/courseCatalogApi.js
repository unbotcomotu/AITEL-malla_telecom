// services/student/courseCatalogApi.js
export const CourseCatalogApi = {
  async getAllCourses() {
    const response = await fetch('/api/catalog/courses');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    /* Response:
    [
      {
        id: "c1",
        code: "MAT101",
        name: "Cálculo 1",
        description: "Introducción al cálculo diferencial...",
        credits: 5,
        cycle: 1,
        categoryId: "cat_1",
        categoryName: "Ciencias Básicas",
        subcategoryId: null,
        subcategoryName: null
      }
    ]
    */
  },

  async getCategories() {
    const response = await fetch('/api/catalog/categories');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    /* Response:
    [
      {
        id: "cat_1",
        name: "Ciencias Básicas",
        subcategories: [
          { id: "sub_1", name: "Electivo de Humanidades 1" }
        ]
      }
    ]
    */
  },

  async getStudentGrades() {
    const response = await fetch('/api/student/grades');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
    // Response: { "c1": 15, "m1": 12 }
  }
};