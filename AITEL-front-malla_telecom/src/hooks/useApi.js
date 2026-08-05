import { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';

export const useStudentGrades = (studentId) => {
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const data = await apiService.getStudentGrades(studentId);
        setGrades(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchGrades();
    }
  }, [studentId]);

  return { grades, loading, error, setGrades };
};

export const useCourseComments = (courseId, cycle) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCourseComments(courseId, cycle);
        setComments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && cycle) {
      fetchComments();
    }
  }, [courseId, cycle]);

  const addComment = async (commentData) => {
    try {
      const newComment = await apiService.addComment(courseId, commentData);
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { comments, loading, error, addComment, setComments };
};