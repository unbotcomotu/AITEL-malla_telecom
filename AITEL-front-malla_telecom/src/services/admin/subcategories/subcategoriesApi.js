// services/admin/subcategories/subcategoriesApi.js
export const SubcategoriesApi = {
  async getSubcategoriesByCategory(categoryId) {
    const response = await fetch(`/api/categories/${categoryId}/subcategories`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async createSubcategory(categoryId, subcategoryData) {
    const response = await fetch(`/api/categories/${categoryId}/subcategories`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(subcategoryData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async updateSubcategory(subcategoryId, subcategoryData) {
    const response = await fetch(`/api/subcategories/${subcategoryId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(subcategoryData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async deleteSubcategory(subcategoryId) {
    const response = await fetch(`/api/subcategories/${subcategoryId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return true;
  },

  async freezeSubcategory(subcategoryId) {
    return this.updateSubcategory(subcategoryId, { isFrozen: true });
  },

  async unfreezeSubcategory(subcategoryId) {
    return this.updateSubcategory(subcategoryId, { isFrozen: false });
  },

  async toggleSubcategoryVisibility(subcategoryId) {
    const response = await fetch(`/api/subcategories/${subcategoryId}/toggle-visibility`, {
      method: 'PATCH'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async getSubcategoryCourses(subcategoryId) {
    const response = await fetch(`/api/subcategories/${subcategoryId}/courses`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};