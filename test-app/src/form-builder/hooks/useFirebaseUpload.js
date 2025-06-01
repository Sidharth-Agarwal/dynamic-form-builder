import { useState, useCallback } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { uploadFile, deleteFile } from '../services/firebase';
import { validateFile, createFirebaseStoragePath } from '../utils/fileUtils';

/**
 * Hook for Firebase Storage file upload operations
 * @param {Object} options - Upload options
 * @param {string} options.formId - Form ID
 * @param {string} options.fieldId - Field ID
 * @param {Object} [options.constraints] - File constraints (type, size, etc.)
 * @returns {Object} Upload state and functions
 */
export const useFirebaseUpload = ({ formId, fieldId, constraints = {} }) => {
  const { storage } = useFirebase();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);
  
  // Upload a file to Firebase Storage
  const uploadFileToFirebase = useCallback(async (file) => {
    if (!storage) {
      setError('Firebase Storage is not initialized');
      return null;
    }
    
    // Validate file
    const validation = validateFile(file, constraints);
    
    if (!validation.isValid) {
      setError(validation.error);
      return null;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      // Create storage path
      const path = createFirebaseStoragePath(formId, fieldId, file.name);
      
      // Upload file
      const result = await uploadFile(file, path, (progress) => {
        setUploadProgress(progress);
      });
      
      // Add to uploaded files
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: result.url,
        path: result.path,
        uploadedAt: new Date().toISOString()
      };
      
      setUploadedFiles(prev => [...prev, fileInfo]);
      setIsUploading(false);
      setUploadProgress(100);
      
      return fileInfo;
    } catch (err) {
      setError(err.message);
      setIsUploading(false);
      return null;
    }
  }, [storage, formId, fieldId, constraints]);
  
  // Delete a file from Firebase Storage
  const deleteFileFromFirebase = useCallback(async (filePath) => {
    if (!storage) {
      setError('Firebase Storage is not initialized');
      return false;
    }
    
    try {
      setError(null);
      
      // Delete file
      await deleteFile(filePath);
      
      // Remove from uploaded files
      setUploadedFiles(prev => prev.filter(file => file.path !== filePath));
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [storage]);
  
  // Clear all uploaded files
  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);
  
  return {
    isUploading,
    uploadProgress,
    uploadedFiles,
    error,
    uploadFile: uploadFileToFirebase,
    deleteFile: deleteFileFromFirebase,
    clearUploadedFiles
  };
};