import { useState, useEffect } from 'react';
import AdminApiService from '../../services/admin/adminApi';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminApiService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      setError(null);
      const newCategory = await AdminApiService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return { success: true, data: newCategory };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      setError(null);
      const updatedCategory = await AdminApiService.updateCategory(categoryId, categoryData);
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? updatedCategory : cat
      ));
      return { success: true, data: updatedCategory };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      setError(null);
      await AdminApiService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories
  };
};