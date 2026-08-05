// services/admin/professorApi.js
export const ProfessorApi = {
  async getAllProfessors() {
    const response = await fetch('/api/professors');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async createProfessor(professorData) {
    const response = await fetch('/api/professors', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(professorData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async updateProfessor(id, professorData) {
    const response = await fetch(`/api/professors/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(professorData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async deleteProfessor(id) {
    const response = await fetch(`/api/professors/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return true;
  },

  async getProfessorById(id) {
    const response = await fetch(`/api/professors/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};