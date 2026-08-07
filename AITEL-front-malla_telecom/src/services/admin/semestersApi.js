// services/admin/semestersApi.js
export const SemestersApi = {
  async getAll() {
    const response = await fetch('/api/semesters');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async create(semester) {
    const response = await fetch('/api/semesters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semester })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async activate(id) {
    const response = await fetch(`/api/semesters/${id}/activate`, {
      method: 'PATCH'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};
