const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AdminApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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
      console.error(`Admin API Error: ${error.message}`);
      throw error;
    }
  }

  // ===== CATEGORÍAS =====
  async getCategories() {
    return this.request('/admin/categories');
  }

  async createCategory(categoryData) {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(categoryId, categoryData) {
    return this.request(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(categoryId) {
    return this.request(`/admin/categories/${categoryId}`, {
      method: 'DELETE'
    });
  }

  // ===== SUBCATEGORÍAS =====
  async getSubcategories() {
    return this.request('/admin/subcategories');
  }

  async createSubcategory(subcategoryData) {
    return this.request('/admin/subcategories', {
      method: 'POST',
      body: JSON.stringify(subcategoryData)
    });
  }

  async updateSubcategory(subcategoryId, subcategoryData) {
    return this.request(`/admin/subcategories/${subcategoryId}`, {
      method: 'PUT',
      body: JSON.stringify(subcategoryData)
    });
  }

  async deleteSubcategory(subcategoryId) {
    return this.request(`/admin/subcategories/${subcategoryId}`, {
      method: 'DELETE'
    });
  }

  // ===== CURSOS =====
  async getCourses(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `/admin/courses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(url);
  }

  async createCourse(courseData) {
    return this.request('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async updateCourse(courseId, courseData) {
    return this.request(`/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  }

  async deleteCourse(courseId) {
    return this.request(`/admin/courses/${courseId}`, {
      method: 'DELETE'
    });
  }

  // ===== BÚSQUEDA =====
  async searchCourses(searchParams) {
    const queryParams = new URLSearchParams();
    
    if (searchParams.term) queryParams.append('search', searchParams.term);
    if (searchParams.category) queryParams.append('category', searchParams.category);
    if (searchParams.type) queryParams.append('type', searchParams.type);
    if (searchParams.page) queryParams.append('page', searchParams.page);
    if (searchParams.limit) queryParams.append('limit', searchParams.limit);

    return this.request(`/admin/courses/search?${queryParams.toString()}`);
  }

  // ===== PROFESORES Y HORARIOS =====
  async getProfessors() {
    return this.request('/admin/professors');
  }

  async getSchedules(courseId = null) {
    const url = courseId 
      ? `/admin/schedules?courseId=${courseId}`
      : '/admin/schedules';
    return this.request(url);
  }

  async createSchedule(scheduleData) {
    return this.request('/admin/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  }
}

export default new AdminApiService();
