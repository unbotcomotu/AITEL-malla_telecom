// services/system/systemApi.js
export const SystemApi = {
  async getCurrentAcademicCycle() {
    const response = await fetch('/api/system/current-cycle');
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
    // Retorna: { currentCycle: '2025-2' }
  }
};