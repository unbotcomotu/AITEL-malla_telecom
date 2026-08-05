export const SchedulesApi = {
  async getCourseSchedules(courseId) {
    const response = await fetch(`/api/courses/${courseId}/schedules`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async createCycle(courseId, cycle) {
    const response = await fetch(`/api/courses/${courseId}/cycles`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ cycle })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async deleteCycle(courseId, cycle) {
    const response = await fetch(`/api/courses/${courseId}/cycles/${cycle}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return true;
  },

  async createSchedule(courseId, cycle, scheduleData) {
    const response = await fetch(`/api/courses/${courseId}/cycles/${cycle}/schedules`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(scheduleData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async updateSchedule(courseId, cycle, scheduleId, scheduleData) {
    const response = await fetch(`/api/courses/${courseId}/cycles/${cycle}/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(scheduleData)
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async deleteSchedule(courseId, cycle, scheduleId) {
    const response = await fetch(`/api/courses/${courseId}/cycles/${cycle}/schedules/${scheduleId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return true;
  },

  async getProfessors() {
    const response = await fetch('/api/professors');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  async bulkSaveSchedules(courseId, cycle, schedules) {
    const response = await fetch(`/api/courses/${courseId}/cycles/${cycle}/schedules/bulk`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ schedules })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};