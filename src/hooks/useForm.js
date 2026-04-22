import { useState, useCallback } from "react";

export default function useForm(initialValues = {}) {
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
   
// Update form from user input
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);
  
  const setField = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialValues);
  }, []);
  
// Handle async operations with loading state
  const executeAsync = useCallback(async (asyncFn) => {
    setIsLoading(true);
    try {
      return await asyncFn();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    setField,
    isLoading,
    resetForm,
    executeAsync,
  };
}
