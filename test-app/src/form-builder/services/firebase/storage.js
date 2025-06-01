import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

let storage;

export const initializeStorage = (app) => {
  try {
    storage = getStorage(app);
    return storage;
  } catch (error) {
    console.error('Error initializing Storage:', error);
    throw error;
  }
};

export const uploadFile = async (file, path, progressCallback = null) => {
  try {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }
    
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) {
            progressCallback(progress);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: path,
              size: uploadTask.snapshot.totalBytes,
              contentType: file.type,
              name: file.name
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (path) => {
  try {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }
    
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const getFileUrl = async (path) => {
  try {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }
    
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

export { storage };