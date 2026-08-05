export const RatingsApi = {
  async rateCourse(courseId, cycle, scheduleId, rating) {
    const response = await fetch(`/api/courses/${courseId}/ratings`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ cycle, scheduleId, rating })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};