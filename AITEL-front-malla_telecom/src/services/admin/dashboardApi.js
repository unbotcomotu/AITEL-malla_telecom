// services/admin/dashboard/dashboardApi.js
export const DashboardApi = {
  async getDashboardStats() {
    const response = await fetch('/api/dashboard/stats');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async getRecentActivity(limit = 10) {
    const response = await fetch(`/api/dashboard/activity?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async getSystemHealth() {
    const response = await fetch('/api/dashboard/health');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};