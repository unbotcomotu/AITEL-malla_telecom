export const CategoriesApi = {
  async getCategories() {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async createCategory(data) {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  async updateCategory(id, data) {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  async deleteCategory(id) {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return true; // o response.json() si el backend retorna datos
  },

  async freezeCategory(id) {
    return this.updateCategory(id, { isFrozen: true });
  },

  async unfreezeCategory(id) {
    return this.updateCategory(id, { isFrozen: false });
  },

  async toggleHideCategory(id) {
    const response = await fetch(`/api/categories/${id}/toggle-hidden`, {
        method: 'PATCH'
    });
    
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
    }
};